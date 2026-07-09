using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using VentaGamer.Application.Ai;

namespace VentaGamer.Infrastructure.Ai.Tools;

/// <summary>
/// Meta-tool: el LLM la llama si no esta seguro de que herramientas tiene disponibles.
/// Resuelve el registry de forma lazy para evitar dependencia circular en DI
/// (Registry -> IEnumerable&lt;IAiTool&gt; -> ListarCapacidadesTool -> Registry).
/// </summary>
public class ListarCapacidadesTool : IAiTool
{
    private readonly IServiceProvider _sp;

    public ListarCapacidadesTool(IServiceProvider sp) => _sp = sp;

    public string Name => "listar_capacidades";
    public string Description => "Devuelve la lista de tools que TENES DISPONIBLES segun el rol del usuario actual. Llamala si no estas seguro que podes hacer.";
    public object ParametersSchema => new { type = "object", properties = new { } };

    public Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var registry = _sp.GetRequiredService<AiToolRegistry>();
        var tools = registry.GetAvailableTools(ctx)
            .Where(t => t.Name != Name)
            .Select(t => new { name = t.Name, description = t.Description })
            .ToList();
        return Task.FromResult(new AiToolResult(true, JsonSerializer.Serialize(new { tools, role = ctx.RoleName })));
    }
}
