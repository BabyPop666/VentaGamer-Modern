using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class AuditLog : EntityBase
{
    public DateTime EventUtc { get; private set; }
    public string Module { get; private set; } = default!;
    public string Message { get; private set; } = default!;
    public int? UserId { get; private set; }
    public AppUser? User { get; private set; }

    private AuditLog() { }

    public AuditLog(string module, string message, int? userId = null)
    {
        EventUtc = DateTime.UtcNow;
        Module = module;
        Message = message;
        UserId = userId;
    }
}
