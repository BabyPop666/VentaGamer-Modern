using VentaGamer.Application.Products;

namespace VentaGamer.Application.Audit;

public interface IAuditService
{
    Task<PaginatedResult<AuditLogDto>> SearchAsync(AuditFilterRequest filter, CancellationToken ct = default);
    Task LogAsync(string module, string message, int? userId, CancellationToken ct = default);
}
