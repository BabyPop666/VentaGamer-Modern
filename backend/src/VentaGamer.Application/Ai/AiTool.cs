using System.Text.Json;

namespace VentaGamer.Application.Ai;

/// <summary>Contexto de ejecucion de una tool: quien la invoca y con que rol.</summary>
public record AiToolContext(int UserId, string Username, string RoleName, IReadOnlySet<string> Permissions);

/// <summary>Definicion de una tool disponible para el LLM (formato OpenAI/Ollama function calling).</summary>
public record AiToolDefinition(string Name, string Description, JsonElement ParametersSchema);

/// <summary>Llamada a una tool emitida por el LLM.</summary>
public record AiToolCall(string Name, JsonElement Arguments);

/// <summary>Resultado de ejecutar una tool: el LLM lo recibe como contenido textual.</summary>
public record AiToolResult(bool Success, string Content);

public interface IAiTool
{
    string Name { get; }
    string Description { get; }
    object ParametersSchema { get; }

    /// <summary>Permisos requeridos. Vacio = cualquiera autenticado.</summary>
    IReadOnlyCollection<string> RequiredPermissions => Array.Empty<string>();

    Task<AiToolResult> ExecuteAsync(JsonElement arguments, AiToolContext context, CancellationToken ct);
}
