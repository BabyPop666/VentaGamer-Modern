using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class MisPedidosTool : IAiTool
{
    private readonly AppDbContext _db;
    public MisPedidosTool(AppDbContext db) => _db = db;

    public string Name => "mis_pedidos";
    public string Description => "Devuelve los pedidos del usuario que esta hablando con el bot. Lista hasta 20 ordenados del mas reciente al mas viejo.";
    public IReadOnlyCollection<string> RequiredPermissions => new[] { "orders.read.own" };

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            top = new { type = "integer", description = "Cantidad maxima a devolver (default 20)" }
        }
    };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var top = args.TryGetProperty("top", out var t) && t.TryGetInt32(out var tn) ? Math.Clamp(tn, 1, 50) : 20;

        var orders = await _db.Orders.AsNoTracking()
            .Where(o => o.UserId == ctx.UserId)
            .OrderByDescending(o => o.PlacedAtUtc)
            .Take(top)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                Fecha = o.PlacedAtUtc,
                o.Total,
                Items = o.Items.Count
            })
            .ToListAsync(ct);

        if (orders.Count == 0)
            return new AiToolResult(true, "El usuario aun no tiene pedidos registrados.");

        return new AiToolResult(true, JsonSerializer.Serialize(new { items = orders, total = orders.Count }));
    }
}
