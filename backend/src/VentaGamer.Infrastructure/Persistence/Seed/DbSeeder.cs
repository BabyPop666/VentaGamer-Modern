using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    // Permisos canónicos del sistema (basado en el legacy ABMperfiles)
    public static readonly (string Code, string Description)[] PermissionsCatalog =
    {
        ("products.read", "Ver catalogo de productos"),
        ("products.write", "Crear / editar / eliminar productos"),
        ("cart.use", "Usar el carrito y comprar"),
        ("orders.read.own", "Ver compras propias"),
        ("orders.read.all", "Ver compras de todos los usuarios"),
        ("users.register", "Registrar nuevos usuarios"),
        ("roles.read", "Ver roles y permisos"),
        ("roles.write", "Crear / editar / eliminar roles y permisos"),
        ("audit.read", "Consultar bitacora"),
        ("backup.manage", "Crear / restaurar backups"),
        ("integrity.check", "Validar integridad de datos"),
        ("config.read", "Ver configuracion del sistema"),
    };

    public static readonly (string Name, string Description, string[] Permissions)[] RolesCatalog =
    {
        ("Admin", "Administrador del sistema", new[]
        {
            "products.read", "products.write",
            "users.register",
            "roles.read", "roles.write",
            "config.read",
        }),
        ("WebMaster", "Mantenimiento tecnico y bitacora", new[]
        {
            "audit.read",
            "backup.manage",
            "integrity.check",
            "config.read",
        }),
        ("User", "Cliente final", new[]
        {
            "products.read",
            "cart.use",
            "orders.read.own",
            "config.read",
        }),
        ("Tester", "QA / pruebas", new[]
        {
            "products.read",
            "cart.use",
            "roles.read",
            "audit.read",
            "config.read",
        }),
    };

    public static readonly (string Code, string Name)[] LanguagesCatalog =
    {
        ("es", "Espanol"),
        ("en", "English"),
        ("pt", "Portugues"),
    };

    public static async Task SeedAsync(AppDbContext db, ILogger logger, CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);

        var changed = false;

        if (!await db.Languages.AnyAsync(ct))
        {
            foreach (var (code, name) in LanguagesCatalog)
                db.Languages.Add(new Language(code, name));
            changed = true;
            logger.LogInformation("Seeded {Count} languages", LanguagesCatalog.Length);
        }

        if (!await db.Permissions.AnyAsync(ct))
        {
            foreach (var (code, desc) in PermissionsCatalog)
                db.Permissions.Add(new Permission(code, desc));
            changed = true;
            logger.LogInformation("Seeded {Count} permissions", PermissionsCatalog.Length);
        }

        if (changed)
        {
            await db.SaveChangesAsync(ct);
            changed = false;
        }

        if (!await db.Roles.AnyAsync(ct))
        {
            var permissionsByCode = await db.Permissions.ToDictionaryAsync(p => p.Code, ct);

            foreach (var (name, desc, perms) in RolesCatalog)
            {
                var role = new Role(name, desc);
                db.Roles.Add(role);
                await db.SaveChangesAsync(ct);

                foreach (var pcode in perms)
                {
                    if (permissionsByCode.TryGetValue(pcode, out var perm))
                        db.RolePermissions.Add(new RolePermission(role.Id, perm.Id));
                }
            }
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Seeded {Count} roles", RolesCatalog.Length);
        }

        if (!await db.Users.AnyAsync(ct))
        {
            // Etapa 1: hash placeholder. Etapa 2 lo reemplazara con PBKDF2 (Identity).
            const string placeholderHash = "PENDING_IDENTITY_MIGRATION";

            var adminRole = await db.Roles.FirstAsync(r => r.Name == "Admin", ct);
            var spanish = await db.Languages.FirstAsync(l => l.Code == "es", ct);

            db.Users.Add(new AppUser("admin", placeholderHash, adminRole.Id, spanish.Id));
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Seeded admin user (placeholder hash; will be replaced in Etapa 2)");
        }
    }
}
