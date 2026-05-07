using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VentaGamer.Application.Abstractions;
using VentaGamer.Application.Auth;
using VentaGamer.Application.Admin;
using VentaGamer.Application.Audit;
using VentaGamer.Application.Maintenance;
using VentaGamer.Infrastructure.Audit;
using VentaGamer.Infrastructure.Maintenance;
using VentaGamer.Application.Carts;
using VentaGamer.Infrastructure.Admin;
using VentaGamer.Application.Orders;
using VentaGamer.Application.Products;
using VentaGamer.Infrastructure.Carts;
using VentaGamer.Infrastructure.Orders;
using VentaGamer.Infrastructure.Products;
using VentaGamer.Domain.Entities;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Ai;
using VentaGamer.Infrastructure.Ai.Tools;
using VentaGamer.Infrastructure.Auth;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("ConnectionStrings:Default no configurado.");

        services.AddHttpContextAccessor();
        services.AddSingleton<AuditSaveChangesInterceptor>();

        services.AddDbContext<AppDbContext>((sp, opts) =>
        {
            opts.UseSqlServer(connStr, sql =>
            {
                sql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                sql.EnableRetryOnFailure(maxRetryCount: 3);
            });
            opts.AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>());
        });

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddSingleton<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
        services.AddSingleton<JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddSingleton<OrderPdfGenerator>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IMaintenanceService, MaintenanceService>();

        // AI chat
        services.Configure<OllamaOptions>(configuration.GetSection(OllamaOptions.SectionName));
        var ollamaOpts = configuration.GetSection(OllamaOptions.SectionName).Get<OllamaOptions>() ?? new OllamaOptions();
        services.AddHttpClient<OllamaClient>(c =>
        {
            c.BaseAddress = new Uri(ollamaOpts.BaseUrl);
            c.Timeout = TimeSpan.FromSeconds(ollamaOpts.TimeoutSeconds);
        });
        services.AddScoped<IAiTool, BuscarProductosTool>();
        services.AddScoped<IAiTool, ConsultarStockTool>();
        services.AddScoped<IAiTool, ListarCategoriasTool>();
        services.AddScoped<IAiTool, MisPedidosTool>();
        services.AddScoped<IAiTool, DetallePedidoTool>();
        services.AddScoped<IAiTool, KpisAdminTool>();
        services.AddScoped<IAiTool, TopProductosTool>();
        services.AddScoped<IAiTool, PedidosRecientesTool>();
        services.AddScoped<IAiTool, ListarCapacidadesTool>();
        services.AddScoped<AiToolRegistry>();
        services.AddScoped<IAiChatService, AiChatService>();

        return services;
    }
}
