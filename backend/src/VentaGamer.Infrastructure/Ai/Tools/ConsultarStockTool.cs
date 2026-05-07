using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class ConsultarStockTool : IAiTool
{
    private readonly AppDbContext _db;
    public ConsultarStockTool(AppDbContext db) => _db = db;

    public string Name => "consultar_stock";
    public string Description => "Devuelve el stock actual de un producto especifico por su ID.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            product_id = new { type = "integer", description = "ID del producto" }
        },
        required = new[] { "product_id" }
    };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        if (!args.TryGetProperty("product_id", out var pid) || !pid.TryGetInt32(out var id))
            return new AiToolResult(false, "Falta product_id (entero)");

        var p = await _db.Products.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new { x.Id, x.Title, x.Category, x.Price, x.Stock, x.IsActive })
            .FirstOrDefaultAsync(ct);

        return p is null
            ? new AiToolResult(true, $"No existe producto con id {id}")
            : new AiToolResult(true, JsonSerializer.Serialize(p));
    }
}
