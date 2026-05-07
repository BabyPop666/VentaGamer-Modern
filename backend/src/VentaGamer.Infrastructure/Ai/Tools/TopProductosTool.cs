using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class TopProductosTool : IAiTool
{
    private readonly AppDbContext _db;
    public TopProductosTool(AppDbContext db) => _db = db;

    public string Name => "top_productos_vendidos";
    public string Description => "Devuelve los productos mas vendidos (cantidad de unidades). Util para 'que productos andan mejor', 'top sellers', etc.";
    public IReadOnlyCollection<string> RequiredPermissions => new[] { "orders.read.all" };

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            top = new { type = "integer", description = "Cantidad de productos a devolver (default 10)" }
        }
    };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var top = args.TryGetProperty("top", out var t) && t.TryGetInt32(out var tn) ? Math.Clamp(tn, 1, 50) : 10;

        var ranking = await _db.OrderItems.AsNoTracking()
            .GroupBy(oi => new { oi.ProductId, oi.ProductTitle })
            .Select(g => new
            {
                product_id = g.Key.ProductId,
                titulo = g.Key.ProductTitle,
                unidades_vendidas = g.Sum(x => x.Quantity),
                ingresos = g.Sum(x => x.UnitPrice * x.Quantity)
            })
            .OrderByDescending(x => x.unidades_vendidas)
            .Take(top)
            .ToListAsync(ct);

        if (ranking.Count == 0)
            return new AiToolResult(true, "Aun no hay ventas registradas.");

        return new AiToolResult(true, JsonSerializer.Serialize(new { ranking }));
    }
}
