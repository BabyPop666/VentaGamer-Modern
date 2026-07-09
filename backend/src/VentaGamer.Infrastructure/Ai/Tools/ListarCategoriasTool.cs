using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Ai;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Ai.Tools;

public class ListarCategoriasTool : IAiTool
{
    private readonly AppDbContext _db;
    public ListarCategoriasTool(AppDbContext db) => _db = db;

    public string Name => "listar_categorias";
    public string Description => "Devuelve todas las categorias de productos disponibles en el catalogo.";
    public object ParametersSchema => new { type = "object", properties = new { } };

    public async Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var cats = await _db.Products.AsNoTracking()
            .Where(p => p.IsActive)
            .Select(p => p.Category).Distinct().OrderBy(c => c).ToListAsync(ct);
        return new AiToolResult(true, JsonSerializer.Serialize(new { categorias = cats }));
    }
}
