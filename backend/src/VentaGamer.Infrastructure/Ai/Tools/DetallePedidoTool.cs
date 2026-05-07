using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class DetallePedidoTool : IAiTool
{
    private readonly AppDbContext _db;
    public DetallePedidoTool(AppDbContext db) => _db = db;

    public string Name => "detalle_pedido";
    public string Description => "Devuelve el detalle de un pedido: items, cantidades, precios, total. Solo se puede consultar pedidos propios (o cualquier pedido si tenes orders.read.all).";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            order_id = new { type = "integer", description = "ID del pedido" }
        },
        required = new[] { "order_id" }
    };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        if (!args.TryGetProperty("order_id", out var oid) || !oid.TryGetInt32(out var id))
            return new AiToolResult(false, "Falta order_id");

        var canReadAll = ctx.Permissions.Contains("orders.read.all");

        var order = await _db.Orders.AsNoTracking()
            .Where(o => o.Id == id && (canReadAll || o.UserId == ctx.UserId))
            .Include(o => o.Items)
            .Include(o => o.User)
            .FirstOrDefaultAsync(ct);

        if (order is null)
            return new AiToolResult(true, $"No se encontro el pedido {id} (no existe o no tenes permiso para verlo).");

        return new AiToolResult(true, JsonSerializer.Serialize(new
        {
            order.Id,
            order.OrderNumber,
            order.PlacedAtUtc,
            order.Total,
            Cliente = order.User?.Username ?? "(?)",
            Items = order.Items.Select(i => new { i.ProductTitle, i.Quantity, i.UnitPrice, i.LineTotal })
        }));
    }
}
