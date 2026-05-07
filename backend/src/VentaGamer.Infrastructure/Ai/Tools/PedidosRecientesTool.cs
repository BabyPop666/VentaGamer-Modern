using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class PedidosRecientesTool : IAiTool
{
    private readonly AppDbContext _db;
    public PedidosRecientesTool(AppDbContext db) => _db = db;

    public string Name => "pedidos_recientes";
    public string Description => "Lista los pedidos mas recientes del sistema (todos los usuarios). Solo admins. Util para '¿que se vendio hoy?'.";
    public IReadOnlyCollection<string> RequiredPermissions => new[] { "orders.read.all" };

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            top = new { type = "integer", description = "Cantidad de pedidos (default 10)" },
            usuario = new { type = "string", description = "Filtrar por username (opcional)" }
        }
    };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var top = args.TryGetProperty("top", out var t) && t.TryGetInt32(out var tn) ? Math.Clamp(tn, 1, 50) : 10;
        var usuario = args.TryGetProperty("usuario", out var u) ? u.GetString() : null;

        var qbase = _db.Orders.AsNoTracking().Include(o => o.User).AsQueryable();
        if (!string.IsNullOrWhiteSpace(usuario))
            qbase = qbase.Where(o => o.User != null && o.User.Username.Contains(usuario));

        var orders = await qbase.OrderByDescending(o => o.PlacedAtUtc).Take(top)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                cliente = o.User != null ? o.User.Username : "?",
                fecha = o.PlacedAtUtc,
                o.Total,
                items = o.Items.Sum(i => i.Quantity)
            }).ToListAsync(ct);

        return new AiToolResult(true, JsonSerializer.Serialize(new { items = orders, total = orders.Count }));
    }
}
