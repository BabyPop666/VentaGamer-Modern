using Microsoft.EntityFrameworkCore;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Application.Abstractions;

public interface IAppDbContext
{
    DbSet<AppUser> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<RoleHierarchy> RoleHierarchies { get; }
    DbSet<Product> Products { get; }
    DbSet<Language> Languages { get; }
    DbSet<Translation> Translations { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
