namespace VentaGamer.Application.Audit;

public record AuditLogDto(
    int Id,
    DateTime EventUtc,
    string Module,
    string Message,
    int? UserId,
    string? Username
);

public record AuditFilterRequest(
    string? Username,
    string? Module,
    DateTime? From,
    DateTime? To,
    int Page = 1,
    int PageSize = 50
);
