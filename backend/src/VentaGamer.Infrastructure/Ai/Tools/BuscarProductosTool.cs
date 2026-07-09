using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class BuscarProductosTool : IAiTool
{
    private readonly AppDbContext _db;
    public BuscarProductosTool(AppDbContext db) => _db = db;

    public string Name => "buscar_productos";
    public string Description => "Busca productos del catalogo por titulo o categoria. Devuelve hasta 10 resultados con id, titulo, categoria, precio y stock.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            query = new { type = "string", description = "Texto a buscar en el titulo (opcional)" },
            categoria = new { type = "string", description = "Filtrar por categoria exacta (opcional)" }
        }
    };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var query = args.TryGetProperty("query", out var q) ? q.GetString() : null;
        var category = args.TryGetProperty("categoria", out var c) ? c.GetString() : null;

        var qbase = _db.Products.AsNoTracking().Where(p => p.IsActive);
        if (!string.IsNullOrWhiteSpace(query)) qbase = qbase.Where(p => p.Title.Contains(query));
        if (!string.IsNullOrWhiteSpace(category)) qbase = qbase.Where(p => p.Category == category);

        var items = await qbase.OrderBy(p => p.Title).Take(10)
            .Select(p => new { p.Id, p.Title, p.Category, p.Price, p.Stock }).ToListAsync(ct);

        if (items.Count == 0)
            return new AiToolResult(true, "No se encontraron productos con esos filtros.");

        return new AiToolResult(true, JsonSerializer.Serialize(new { items, total = items.Count }));
    }
}
