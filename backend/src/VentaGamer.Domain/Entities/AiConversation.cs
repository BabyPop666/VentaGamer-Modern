using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class AiConversation : EntityBase
{
    public int UserId { get; private set; }
    public AppUser User { get; private set; } = default!;
    public string Title { get; private set; } = "Nueva conversacion";

    public ICollection<AiMessage> Messages { get; private set; } = new List<AiMessage>();

    private AiConversation() { }

    public AiConversation(int userId, string? title = null)
    {
        UserId = userId;
        if (!string.IsNullOrWhiteSpace(title)) Title = title;
    }

    public void Touch(string? newTitle = null)
    {
        if (!string.IsNullOrWhiteSpace(newTitle)) Title = newTitle.Length > 80 ? newTitle[..80] : newTitle;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
