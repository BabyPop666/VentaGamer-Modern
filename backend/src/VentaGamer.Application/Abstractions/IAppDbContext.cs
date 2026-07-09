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
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<AiConversation> AiConversations { get; }
    DbSet<AiMessage> AiMessages { get; }
    DbSet<SystemSetting> SystemSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
