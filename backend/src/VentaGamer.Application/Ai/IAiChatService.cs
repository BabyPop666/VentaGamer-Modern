namespace VentaGamer.Application.Ai;

public interface IAiChatService
{
    Task<bool> IsAvailableAsync(CancellationToken ct = default);

    /// <summary>
    /// Procesa un mensaje del usuario y devuelve la respuesta completa.
    /// Invoca onToken por cada token mientras el LLM genera (streaming).
    /// </summary>
    Task<AiChatResult> ProcessMessageAsync(
        AiToolContext userContext,
        int conversationId,
        string userMessage,
        Func<string, Task> onToken,
        CancellationToken ct = default);

    Task<int> CreateConversationAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<AiConversationSummaryDto>> GetConversationsAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<AiMessageDto>> GetMessagesAsync(int conversationId, int userId, CancellationToken ct = default);
    Task DeleteConversationAsync(int conversationId, int userId, CancellationToken ct = default);
}

public record AiChatResult(string Content, IReadOnlyList<string> ToolsUsed);

public class AiUnavailableException : Exception
{
    public AiUnavailableException() : base("El asistente IA no esta disponible. Verificar que Ollama este corriendo.") { }
}

public class AiConversationNotFoundException : Exception
{
    public AiConversationNotFoundException() : base("Conversacion no encontrada o no pertenece al usuario") { }
}
