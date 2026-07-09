using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Audit;
using VentaGamer.Application.Products;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Audit;

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    public AuditService(AppDbContext db) => _db = db;

    public async Task<PaginatedResult<AuditLogDto>> SearchAsync(AuditFilterRequest filter, CancellationToken ct = default)
    {
        var page = filter.Page < 1 ? 1 : filter.Page;
        var size = Math.Clamp(filter.PageSize, 1, 200);

        var q = _db.AuditLogs.AsNoTracking()
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Username))
            q = q.Where(a => a.User != null && a.User.Username.Contains(filter.Username));
        if (!string.IsNullOrWhiteSpace(filter.Module))
            q = q.Where(a => a.Module == filter.Module);
        if (filter.From.HasValue)
            q = q.Where(a => a.EventUtc >= filter.From.Value);
        if (filter.To.HasValue)
            q = q.Where(a => a.EventUtc <= filter.To.Value);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(a => a.EventUtc)
            .Skip((page - 1) * size).Take(size)
            .Select(a => new AuditLogDto(a.Id, a.EventUtc, a.Module, a.Message, a.UserId, a.User != null ? a.User.Username : null))
            .ToListAsync(ct);

        var pages = (int)Math.Ceiling(total / (double)size);
        return new PaginatedResult<AuditLogDto>(items, page, size, total, pages);
    }

    public async Task LogAsync(string module, string message, int? userId, CancellationToken ct = default)
    {
        _db.AuditLogs.Add(new AuditLog(module, message, userId));
        await _db.SaveChangesAsync(ct);
    }
}
