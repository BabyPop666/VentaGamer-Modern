using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Settings;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Settings;

public class SystemSettingService : ISystemSettingService
{
    private readonly AppDbContext _db;
    public SystemSettingService(AppDbContext db) => _db = db;

    public async Task<string?> GetAsync(string key, CancellationToken ct = default)
    {
        return await _db.SystemSettings.AsNoTracking()
            .Where(s => s.Key == key)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<string> GetOrDefaultAsync(string key, string fallback, CancellationToken ct = default)
        => await GetAsync(key, ct) ?? fallback;

    public async Task SetAsync(string key, string value, string? description = null, CancellationToken ct = default)
    {
        var existing = await _db.SystemSettings.FirstOrDefaultAsync(s => s.Key == key, ct);
        if (existing is null)
        {
            _db.SystemSettings.Add(new SystemSetting(key, value, description));
        }
        else
        {
            existing.UpdateValue(value);
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<SystemSettingDto>> GetByPrefixAsync(string prefix, CancellationToken ct = default)
    {
        return await _db.SystemSettings.AsNoTracking()
            .Where(s => s.Key.StartsWith(prefix))
            .OrderBy(s => s.Key)
            .Select(s => new SystemSettingDto(s.Key, s.Value, s.Description, s.UpdatedAtUtc))
            .ToListAsync(ct);
    }
}
