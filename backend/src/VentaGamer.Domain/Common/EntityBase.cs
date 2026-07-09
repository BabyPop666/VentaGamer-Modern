namespace VentaGamer.Domain.Common;

public abstract class EntityBase
{
    public int Id { get; protected set; }
    public DateTime CreatedAtUtc { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; protected set; }
}
