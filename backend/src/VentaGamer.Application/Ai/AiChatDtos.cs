namespace VentaGamer.Application.Ai;

public record AiConversationSummaryDto(int Id, string Title, DateTime UpdatedAtUtc, int MessageCount);

public record AiMessageDto(
    int Id,
    string Role, // "user" | "assistant" | "tool"
    string Content,
    string? ToolName,
    DateTime CreatedAtUtc
);

public record SendMessageRequest(int? ConversationId, string Text);
