using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public enum AiMessageRole
{
    User = 1,
    Assistant = 2,
    Tool = 3,
    System = 4
}

public class AiMessage : EntityBase
{
    public int ConversationId { get; private set; }
    public AiConversation Conversation { get; private set; } = default!;

    public AiMessageRole Role { get; private set; }
    public string Content { get; private set; } = default!;

    /// <summary>JSON con la lista de tool calls que pidio el LLM (solo si Role=Assistant).</summary>
    public string? ToolCallsJson { get; private set; }

    /// <summary>Nombre de la tool ejecutada (solo si Role=Tool).</summary>
    public string? ToolName { get; private set; }

    private AiMessage() { }

    private AiMessage(int conversationId, AiMessageRole role, string content)
    {
        ConversationId = conversationId;
        Role = role;
        Content = content;
    }

    public static AiMessage FromUser(int conversationId, string content)
        => new(conversationId, AiMessageRole.User, content);

    public static AiMessage FromAssistant(int conversationId, string content, string? toolCallsJson = null)
        => new(conversationId, AiMessageRole.Assistant, content) { ToolCallsJson = toolCallsJson };

    public static AiMessage FromTool(int conversationId, string toolName, string content)
        => new(conversationId, AiMessageRole.Tool, content) { ToolName = toolName };
}
