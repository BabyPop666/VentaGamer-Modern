using Microsoft.AspNetCore.Identity;
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

    public const string DefaultAdminPassword = "Admin123!";

    // Usuarios demo creados al inicializar la BD (etapa 1+).
    // En produccion el seed solo crea el admin.
    private static readonly (string Username, string Password, string RoleName)[] DemoUsers =
    {
        ("cliente",    "Cliente123!",    "User"),
        ("juan",       "Juan123!",       "User"),
        ("webmaster",  "WebMaster123!",  "WebMaster"),
        ("tester",     "Tester123!",     "Tester"),
    };

    public static async Task SeedAsync(AppDbContext db, ILogger logger, IPasswordHasher<AppUser> hasher, CancellationToken ct = default)
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

        var spanish = await db.Languages.FirstAsync(l => l.Code == "es", ct);
        var rolesByName = await db.Roles.ToDictionaryAsync(r => r.Name, ct);

        // Admin (con tratamiento del placeholder hash de etapa 1)
        var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Username == "admin", ct);
        if (adminUser is null)
        {
            var admin = new AppUser("admin", "", rolesByName["Admin"].Id, spanish.Id);
            admin.ChangePassword(hasher.HashPassword(admin, DefaultAdminPassword));
            db.Users.Add(admin);
            await db.SaveChangesAsync(ct);
            logger.LogWarning("Seeded admin user (default password '{Pwd}')", DefaultAdminPassword);
        }
        else if (adminUser.PasswordHash == "PENDING_IDENTITY_MIGRATION")
        {
            adminUser.ChangePassword(hasher.HashPassword(adminUser, DefaultAdminPassword));
            await db.SaveChangesAsync(ct);
            logger.LogWarning("Rehashed admin password from placeholder to PBKDF2");
        }

        // Usuarios demo (idempotente: solo crea los que faltan)
        foreach (var (username, password, roleName) in DemoUsers)
        {
            if (await db.Users.AnyAsync(u => u.Username == username, ct)) continue;
            if (!rolesByName.TryGetValue(roleName, out var role))
            {
                logger.LogWarning("Demo user '{User}' skipped: role '{Role}' not found", username, roleName);
                continue;
            }

            var user = new AppUser(username, "", role.Id, spanish.Id);
            user.ChangePassword(hasher.HashPassword(user, password));
            db.Users.Add(user);
            logger.LogInformation("Seeded demo user '{User}' (role {Role}, password '{Pwd}')", username, roleName, password);
        }
        await db.SaveChangesAsync(ct);

        if (!await db.Products.AnyAsync(ct))
        {
            var demoProducts = new[]
            {
                new Product("PlayStation 5 Slim", "Consolas", 899.99m, 12, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600"),
                new Product("Xbox Series X", "Consolas", 849.99m, 8, "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600"),
                new Product("Nintendo Switch OLED", "Consolas", 549.99m, 20, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600"),
                new Product("DualSense PS5", "Mandos", 79.99m, 50, "https://images.unsplash.com/photo-1606318546408-b2eb59f3a30b?w=600"),
                new Product("Xbox Wireless Controller", "Mandos", 64.99m, 45, "https://images.unsplash.com/photo-1592890288564-76628a30a657?w=600"),
                new Product("Logitech G Pro X", "Auriculares", 129.99m, 30, "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600"),
                new Product("HyperX Cloud II", "Auriculares", 99.99m, 40, "https://images.unsplash.com/photo-1599669454699-248893623440?w=600"),
                new Product("Razer Viper V2 Pro", "Mouse", 149.99m, 25, "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600"),
                new Product("Logitech G502 Hero", "Mouse", 49.99m, 60, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600"),
                new Product("Corsair K70 RGB", "Teclados", 169.99m, 18, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"),
                new Product("Keychron K2", "Teclados", 89.99m, 22, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600"),
                new Product("LG UltraGear 27GP850", "Monitores", 449.99m, 7, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600"),
                new Product("Samsung Odyssey G7", "Monitores", 699.99m, 5, "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600"),
                new Product("Secretlab Titan Evo", "Sillas", 549.99m, 10, "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600"),
                new Product("DXRacer King K99", "Sillas", 399.99m, 15, "https://images.unsplash.com/photo-1610555356070-d0efb6505f81?w=600"),
                new Product("Elgato Stream Deck MK.2", "Streaming", 159.99m, 14, "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600"),
                new Product("Blue Yeti X", "Streaming", 169.99m, 16, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600"),
                new Product("EA Sports FC 25", "Juegos", 69.99m, 100, "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600"),
                new Product("Hogwarts Legacy", "Juegos", 49.99m, 35, "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=600"),
                new Product("Cyberpunk 2077", "Juegos", 39.99m, 28, "https://images.unsplash.com/photo-1604361948742-6cb3a07c3d4d?w=600"),
            };

            db.Products.AddRange(demoProducts);
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Seeded {Count} demo products", demoProducts.Length);
        }
    }
}
