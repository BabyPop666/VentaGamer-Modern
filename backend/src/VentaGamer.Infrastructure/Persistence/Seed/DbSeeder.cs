using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Seed;

public static class DbSeeder
{
    // Permisos canónicos del sistema.
    public static readonly (string Code, string Description)[] PermissionsCatalog =
    {
        ("products.read", "Ver catalogo de productos"),
        ("products.write", "Crear / editar / eliminar productos"),
        ("cart.use", "Usar el carrito y comprar"),
        ("orders.read.own", "Ver pedidos propios"),
        ("orders.read.all", "Ver pedidos de todos los usuarios"),
        ("users.register", "Listar y registrar usuarios"),
        ("roles.read", "Ver roles y permisos"),
        ("roles.write", "Crear / editar / eliminar roles y permisos"),
        ("audit.read", "Consultar bitacora"),
        ("backup.manage", "Crear / restaurar backups"),
        ("integrity.check", "Validar integridad de datos"),
        ("profile.read", "Ver perfil propio (idioma, ayuda)"),
        ("chat.use", "Usar el chat IA (GG)"),
    };

    public static readonly (string Name, string Description, string[] Permissions)[] RolesCatalog =
    {
        ("Admin", "Administrador del sistema", new[]
        {
            "products.read", "products.write",
            "orders.read.all",
            "users.register",
            "roles.read", "roles.write",
            "audit.read",
            "backup.manage", "integrity.check",
            "profile.read", "chat.use",
        }),
        ("WebMaster", "Mantenimiento tecnico", new[]
        {
            "products.read",
            "orders.read.all",       // ← nuevo: para diagnostico
            "users.register",         // ← nuevo: para correlacionar bitacora con usuarios
            "audit.read",
            "backup.manage",
            "integrity.check",
            "profile.read", "chat.use",
        }),
        ("User", "Cliente final", new[]
        {
            "products.read",
            "cart.use",
            "orders.read.own",
            "profile.read", "chat.use",
        }),
        ("Tester", "QA / pruebas (read-only total)", new[]
        {
            "products.read",
            "cart.use",
            "orders.read.own", "orders.read.all",  // ← nuevo: ve los suyos y los de todos
            "users.register",                       // ← nuevo: ve listas
            "roles.read",
            "audit.read",
            "integrity.check",                      // ← nuevo: puede verificar integridad
            "profile.read", "chat.use",
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

        // Reconciliar catalogo de permisos:
        // 1) Migracion historica: si existe 'config.read' y NO existe 'profile.read', se renombra.
        // 2) Agregar permisos faltantes del catalogo (idempotente).
        var existing = await db.Permissions.AsNoTracking().ToDictionaryAsync(p => p.Code, ct);

        if (existing.TryGetValue("config.read", out var legacyConfigRead) && !existing.ContainsKey("profile.read"))
        {
            await db.Database.ExecuteSqlRawAsync(
                "UPDATE Permissions SET Code = {0}, Description = {1} WHERE Id = {2}",
                "profile.read", "Ver perfil propio (idioma, ayuda)", legacyConfigRead.Id);
            logger.LogInformation("Migrated permission 'config.read' -> 'profile.read' (id={Id})", legacyConfigRead.Id);
            // Limpiar tracker para que la siguiente lectura no devuelva el cache viejo.
            db.ChangeTracker.Clear();
            existing = await db.Permissions.AsNoTracking().ToDictionaryAsync(p => p.Code, ct);
        }

        var addedPerm = false;
        foreach (var (code, desc) in PermissionsCatalog)
        {
            if (existing.ContainsKey(code)) continue;
            db.Permissions.Add(new Permission(code, desc));
            addedPerm = true;
            logger.LogInformation("Adding new permission: {Code}", code);
        }
        if (addedPerm)
        {
            await db.SaveChangesAsync(ct);
            changed = true;
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

        // Reconciliar permisos de TODOS los roles del catalogo segun RolesCatalog.
        // Idempotente: por cada rol, agrega los permisos faltantes y remueve los que sobran.
        var permsByCode = await db.Permissions.ToDictionaryAsync(p => p.Code, ct);
        foreach (var (roleName, _, expectedCodes) in RolesCatalog)
        {
            if (!rolesByName.TryGetValue(roleName, out var role)) continue;

            var expectedIds = expectedCodes
                .Select(c => permsByCode.TryGetValue(c, out var p) ? p.Id : 0)
                .Where(id => id > 0)
                .ToHashSet();

            var currentIds = await db.RolePermissions
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => rp.PermissionId)
                .ToListAsync(ct);

            var missing = expectedIds.Except(currentIds).ToList();
            var extra = currentIds.Except(expectedIds).ToList();

            if (missing.Count > 0)
            {
                foreach (var pid in missing)
                    db.RolePermissions.Add(new RolePermission(role.Id, pid));
                logger.LogInformation("[{Role}] Granted {Count} permissions", roleName, missing.Count);
            }

            if (extra.Count > 0)
            {
                var toRemove = await db.RolePermissions
                    .Where(rp => rp.RoleId == role.Id && extra.Contains(rp.PermissionId))
                    .ToListAsync(ct);
                db.RolePermissions.RemoveRange(toRemove);
                logger.LogInformation("[{Role}] Revoked {Count} permissions", roleName, extra.Count);
            }

            if (missing.Count > 0 || extra.Count > 0)
                await db.SaveChangesAsync(ct);
        }

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

        if (!await db.Translations.AnyAsync(ct))
        {
            var byCode = await db.Languages.ToDictionaryAsync(l => l.Code, ct);
            var entries = new (string Key, string Es, string En, string Pt)[]
            {
                ("nav.catalog",    "Catalogo",        "Catalog",       "Catalogo"),
                ("nav.cart",       "Carrito",         "Cart",          "Carrinho"),
                ("nav.myOrders",   "Mis compras",     "My orders",     "Minhas compras"),
                ("nav.admin",      "Administracion",  "Admin",         "Administracao"),
                ("nav.audit",      "Bitacora",        "Audit log",     "Auditoria"),
                ("nav.login",      "Iniciar sesion",  "Sign in",       "Entrar"),
                ("nav.logout",     "Salir",           "Sign out",      "Sair"),
                ("catalog.search", "Buscar",          "Search",        "Buscar"),
                ("catalog.empty",  "No hay productos", "No products",   "Sem produtos"),
                ("cart.confirm",   "Confirmar compra", "Confirm",       "Confirmar"),
                ("cart.empty",     "Tu carrito esta vacio", "Your cart is empty", "Carrinho vazio"),
                ("cart.total",     "Total",           "Total",         "Total"),
                ("cart.addToCart", "Agregar al carrito", "Add to cart", "Adicionar"),
                ("orders.placed",  "Compra confirmada", "Order placed", "Compra confirmada"),
                ("orders.downloadPdf", "Descargar comprobante PDF", "Download PDF", "Baixar PDF"),
            };

            foreach (var (key, es, en, pt) in entries)
            {
                if (byCode.TryGetValue("es", out var l1)) db.Translations.Add(new Translation(l1.Id, key, es));
                if (byCode.TryGetValue("en", out var l2)) db.Translations.Add(new Translation(l2.Id, key, en));
                if (byCode.TryGetValue("pt", out var l3)) db.Translations.Add(new Translation(l3.Id, key, pt));
            }
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Seeded {Count} translation entries x 3 languages", entries.Length);
        }

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
