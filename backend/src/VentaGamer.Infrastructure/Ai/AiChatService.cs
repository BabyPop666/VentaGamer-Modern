using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VentaGamer.Application.Ai;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai;

public class AiChatService : IAiChatService
{
    private readonly AppDbContext _db;
    private readonly OllamaClient _ollama;
    private readonly AiToolRegistry _registry;
    private readonly OllamaOptions _opts;
    private readonly ILogger<AiChatService> _log;

    public AiChatService(
        AppDbContext db,
        OllamaClient ollama,
        AiToolRegistry registry,
        IOptions<OllamaOptions> opts,
        ILogger<AiChatService> log)
    {
        _db = db;
        _ollama = ollama;
        _registry = registry;
        _opts = opts.Value;
        _log = log;
    }

    public Task<bool> IsAvailableAsync(CancellationToken ct = default) => _ollama.IsAvailableAsync(ct);

    public async Task<int> CreateConversationAsync(int userId, CancellationToken ct = default)
    {
        var convo = new AiConversation(userId);
        _db.AiConversations.Add(convo);
        await _db.SaveChangesAsync(ct);
        return convo.Id;
    }

    public async Task<IReadOnlyList<AiConversationSummaryDto>> GetConversationsAsync(int userId, CancellationToken ct = default)
    {
        return await _db.AiConversations.AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAtUtc ?? c.CreatedAtUtc)
            .Select(c => new AiConversationSummaryDto(c.Id, c.Title, c.UpdatedAtUtc ?? c.CreatedAtUtc, c.Messages.Count))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<AiMessageDto>> GetMessagesAsync(int conversationId, int userId, CancellationToken ct = default)
    {
        var owns = await _db.AiConversations.AnyAsync(c => c.Id == conversationId && c.UserId == userId, ct);
        if (!owns) throw new AiConversationNotFoundException();

        // No devolver assistants intermedios (los que solo contienen tool_calls):
        // el LLM persiste un assistant por cada round del tool-calling loop, pero el usuario
        // solo deberia ver la respuesta final (la que NO tiene ToolCallsJson).
        return await _db.AiMessages.AsNoTracking()
            .Where(m => m.ConversationId == conversationId
                        && (m.Role == AiMessageRole.User
                            || (m.Role == AiMessageRole.Assistant && m.ToolCallsJson == null)))
            .OrderBy(m => m.CreatedAtUtc)
            .Select(m => new AiMessageDto(m.Id, m.Role.ToString().ToLowerInvariant(), m.Content, m.ToolName, m.CreatedAtUtc))
            .ToListAsync(ct);
    }

    public async Task DeleteConversationAsync(int conversationId, int userId, CancellationToken ct = default)
    {
        var convo = await _db.AiConversations.FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId, ct);
        if (convo is null) throw new AiConversationNotFoundException();
        _db.AiConversations.Remove(convo);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<AiChatResult> ProcessMessageAsync(
        AiToolContext userContext,
        int conversationId,
        string userMessage,
        Func<string, Task> onToken,
        CancellationToken ct = default)
    {
        if (!await _ollama.IsAvailableAsync(ct)) throw new AiUnavailableException();

        var convo = await _db.AiConversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userContext.UserId, ct)
            ?? throw new AiConversationNotFoundException();

        // Persistir el mensaje del usuario
        _db.AiMessages.Add(AiMessage.FromUser(conversationId, userMessage));
        if (convo.Title == "Nueva conversacion")
            convo.Touch(userMessage);
        else
            convo.Touch();
        await _db.SaveChangesAsync(ct);

        // Cargar historial reciente para context
        var history = await _db.AiMessages.AsNoTracking()
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAtUtc).Take(_opts.MaxHistoryMessages)
            .OrderBy(m => m.CreatedAtUtc)
            .ToListAsync(ct);

        var messages = new List<OllamaClient.OllamaMessage>
        {
            new("system", _opts.SystemPrompt + $"\n\nUsuario actual: {userContext.Username} (rol {userContext.RoleName}). Permisos: {string.Join(", ", userContext.Permissions)}")
        };

        foreach (var m in history)
        {
            var role = m.Role switch
            {
                AiMessageRole.User => "user",
                AiMessageRole.Assistant => "assistant",
                AiMessageRole.Tool => "tool",
                _ => "system"
            };
            messages.Add(new OllamaClient.OllamaMessage(role, m.Content));
        }

        // Tools disponibles segun rol
        var availableTools = _registry.GetAvailableTools(userContext);
        var toolDefs = availableTools.Select(t => new
        {
            type = "function",
            function = new
            {
                name = t.Name,
                description = t.Description,
                parameters = t.ParametersSchema
            }
        }).Cast<object>().ToList();

        // Loop de tool calling
        var toolsUsed = new List<string>();
        var fullAnswer = new System.Text.StringBuilder();

        for (var round = 0; round < _opts.MaxToolRounds; round++)
        {
            string assistantBuffer = "";
            OllamaClient.OllamaMessage? finalMessage = null;

            await foreach (var chunk in _ollama.ChatStreamAsync(messages, toolDefs, ct))
            {
                if (chunk.TokenDelta is { } token)
                {
                    assistantBuffer += token;
                    await onToken(token);
                }
                if (chunk.Done && chunk.FinalMessage is { } final)
                    finalMessage = final;
            }

            if (finalMessage is null) break;

            // Si no hay tool calls, terminamos
            if (finalMessage.ToolCalls is null || finalMessage.ToolCalls.Count == 0)
            {
                fullAnswer.Append(assistantBuffer);
                _db.AiMessages.Add(AiMessage.FromAssistant(conversationId, assistantBuffer));
                break;
            }

            // Persistir el mensaje del assistant con tool calls
            var toolCallsJson = JsonSerializer.Serialize(finalMessage.ToolCalls.Select(tc => new
            {
                name = tc.Function.Name,
                arguments = tc.Function.Arguments.GetRawText()
            }));
            _db.AiMessages.Add(AiMessage.FromAssistant(conversationId, assistantBuffer, toolCallsJson));
            messages.Add(finalMessage);

            // Ejecutar las tools
            foreach (var call in finalMessage.ToolCalls)
            {
                var toolName = call.Function.Name;
                toolsUsed.Add(toolName);
                var tool = _registry.FindByName(toolName);
                AiToolResult result;

                if (tool is null)
                {
                    result = new AiToolResult(false, $"Tool '{toolName}' no existe");
                }
                else if (!availableTools.Contains(tool))
                {
                    var missing = string.Join(", ", tool.RequiredPermissions);
                    result = new AiToolResult(false, $"Tu rol ({userContext.RoleName}) no tiene los permisos necesarios para '{toolName}'. Falta: {missing}");
                }
                else
                {
                    try
                    {
                        result = await tool.ExecuteAsync(call.Function.Arguments, userContext, ct);
                    }
                    catch (Exception ex)
                    {
                        _log.LogWarning(ex, "Tool {Tool} fallo", toolName);
                        result = new AiToolResult(false, $"Error ejecutando {toolName}: {ex.Message}");
                    }
                }

                _db.AiMessages.Add(AiMessage.FromTool(conversationId, toolName, result.Content));
                messages.Add(new OllamaClient.OllamaMessage("tool", result.Content));
            }

            await _db.SaveChangesAsync(ct);
            // Continua el loop: vuelve a llamar al LLM con los resultados de las tools
        }

        await _db.SaveChangesAsync(ct);
        return new AiChatResult(fullAnswer.ToString(), toolsUsed);
    }
}
