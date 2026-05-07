using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using VentaGamer.Application.Ai;

namespace VentaGamer.Api.Hubs;

[Authorize]
public class AiChatHub : Hub
{
    private readonly IAiChatService _ai;
    private readonly ILogger<AiChatHub> _log;

    // Throttle: 10 mensajes por minuto por conexion
    private static readonly ConcurrentDictionary<string, (int Count, DateTime WindowStart)> Throttle = new();

    public AiChatHub(IAiChatService ai, ILogger<AiChatHub> log)
    {
        _ai = ai;
        _log = log;
    }

    public async Task SendMessage(int conversationId, string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return;
        if (text.Length > 2000) text = text[..2000];

        if (!CheckThrottle(Context.ConnectionId, out var retryAfter))
            throw new HubException($"Rate limit excedido, intenta en {retryAfter}s");

        var (userId, username, roleName, perms) = GetUser();
        var ctx = new AiToolContext(userId, username, roleName, perms);

        var caller = Clients.Caller;
        var msgId = "ai-" + Guid.NewGuid().ToString("N");

        try
        {
            await caller.SendAsync("AiStreamStart", new { conversationId, messageId = msgId });

            await _ai.ProcessMessageAsync(ctx, conversationId, text,
                async token => await caller.SendAsync("AiStreamToken", new { conversationId, messageId = msgId, token }),
                Context.ConnectionAborted);

            await caller.SendAsync("AiStreamEnd", new { conversationId, messageId = msgId });
        }
        catch (AiUnavailableException ex)
        {
            await caller.SendAsync("AiStreamError", new { conversationId, messageId = msgId, error = "ollama_offline", message = ex.Message });
        }
        catch (AiConversationNotFoundException ex)
        {
            await caller.SendAsync("AiStreamError", new { conversationId, messageId = msgId, error = "no_encontrada", message = ex.Message });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "AiChatHub error procesando mensaje");
            await caller.SendAsync("AiStreamError", new { conversationId, messageId = msgId, error = "internal", message = "Error interno procesando el mensaje" });
        }
    }

    private (int UserId, string Username, string Role, IReadOnlySet<string> Perms) GetUser()
    {
        var idStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        var name = Context.User?.FindFirstValue(ClaimTypes.Name) ?? "?";
        var role = Context.User?.FindFirstValue(ClaimTypes.Role) ?? "User";
        var perms = Context.User?.FindAll("permission").Select(c => c.Value).ToHashSet() ?? new HashSet<string>();
        return (int.Parse(idStr!), name, role, perms);
    }

    private static bool CheckThrottle(string connectionId, out int retryAfterSeconds)
    {
        retryAfterSeconds = 0;
        var now = DateTime.UtcNow;
        var entry = Throttle.AddOrUpdate(connectionId,
            _ => (1, now),
            (_, prev) =>
            {
                if (now - prev.WindowStart > TimeSpan.FromMinutes(1))
                    return (1, now);
                return (prev.Count + 1, prev.WindowStart);
            });

        if (entry.Count > 10)
        {
            retryAfterSeconds = (int)(60 - (now - entry.WindowStart).TotalSeconds);
            return false;
        }
        return true;
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Throttle.TryRemove(Context.ConnectionId, out _);
        return base.OnDisconnectedAsync(exception);
    }
}
