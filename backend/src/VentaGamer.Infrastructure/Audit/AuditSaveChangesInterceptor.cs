using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Audit;

public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _http;

    public AuditSaveChangesInterceptor(IHttpContextAccessor http) => _http = http;

    // Entidades cuyas mutaciones se auditan automaticamente.
    private static readonly HashSet<Type> AuditedEntities = new()
    {
        typeof(Product), typeof(Role), typeof(Permission), typeof(RolePermission),
        typeof(RoleHierarchy), typeof(AppUser), typeof(Order),
    };

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        if (eventData.Context is null) return base.SavingChangesAsync(eventData, result, ct);

        var userId = TryGetUserId();
        var entries = eventData.Context.ChangeTracker.Entries()
            .Where(e => AuditedEntities.Contains(e.Entity.GetType())
                        && e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            var module = entry.Entity.GetType().Name;
            var message = entry.State switch
            {
                EntityState.Added => $"CREATE {Describe(entry)}",
                EntityState.Modified => $"UPDATE {Describe(entry)} fields={ChangedFields(entry)}",
                EntityState.Deleted => $"DELETE {Describe(entry)}",
                _ => "?"
            };

            // Truncar a 500 char (limite de la columna)
            if (message.Length > 500) message = message[..500];

            eventData.Context.Set<AuditLog>().Add(new AuditLog(module, message, userId));
        }

        return base.SavingChangesAsync(eventData, result, ct);
    }

    private int? TryGetUserId()
    {
        var idStr = _http.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : null;
    }

    private static string Describe(EntityEntry e)
    {
        var pk = e.Metadata.FindPrimaryKey();
        if (pk is null) return e.Entity.GetType().Name;
        var values = pk.Properties.Select(p => $"{p.Name}={e.Property(p.Name).CurrentValue}");
        return $"{e.Entity.GetType().Name}({string.Join(",", values)})";
    }

    private static string ChangedFields(EntityEntry e)
    {
        var changed = e.Properties
            .Where(p => p.IsModified && !p.Metadata.IsPrimaryKey())
            .Select(p => p.Metadata.Name);
        var list = changed.ToList();
        return list.Count == 0 ? "(none)" : string.Join(",", list);
    }
}
