using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class KpisAdminTool : IAiTool
{
    private readonly AppDbContext _db;
    public KpisAdminTool(AppDbContext db) => _db = db;

    public string Name => "kpis_admin";
    public string Description => "Devuelve KPIs globales del e-commerce: total productos activos, total clientes, total pedidos, ingresos totales, valor promedio de pedido, productos sin stock.";
    public IReadOnlyCollection<string> RequiredPermissions => new[] { "orders.read.all" };
    public object ParametersSchema => new { type = "object", properties = new { } };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var totalProductos = await _db.Products.CountAsync(p => p.IsActive, ct);
        var sinStock = await _db.Products.CountAsync(p => p.IsActive && p.Stock == 0, ct);
        var totalClientes = await _db.Users.CountAsync(ct);
        var totalPedidos = await _db.Orders.CountAsync(ct);
        var ingresos = await _db.Orders.SumAsync(o => (decimal?)o.Total, ct) ?? 0m;
        var avg = totalPedidos > 0 ? ingresos / totalPedidos : 0m;

        return new AiToolResult(true, JsonSerializer.Serialize(new
        {
            productos_activos = totalProductos,
            productos_sin_stock = sinStock,
            usuarios_totales = totalClientes,
            pedidos_totales = totalPedidos,
            ingresos_totales = ingresos,
            ticket_promedio = Math.Round(avg, 2),
        }));
    }
}
