using System.Text.Json;
using VentaGamer.Application.Ai;

namespace VentaGamer.Infrastructure.Ai.Tools;

/// <summary>
/// Meta-tool: el LLM la llama si no esta seguro de que herramientas tiene disponibles.
/// El registry la inyecta con la lista filtrada por permisos del usuario actual.
/// </summary>
public class ListarCapacidadesTool : IAiTool
{
    private readonly Func<AiToolContext, IReadOnlyList<IAiTool>> _resolveAvailable;

    public ListarCapacidadesTool(Func<AiToolContext, IReadOnlyList<IAiTool>> resolveAvailable)
        => _resolveAvailable = resolveAvailable;

    public string Name => "listar_capacidades";
    public string Description => "Devuelve la lista de tools que TENES DISPONIBLES segun el rol del usuario actual. Llamala si no estas seguro que podes hacer.";
    public object ParametersSchema => new { type = "object", properties = new { } };

    public Task<AiToolResult> ExecuteAsync(JsonElement args, AiToolContext ctx, CancellationToken ct)
    {
        var tools = _resolveAvailable(ctx)
            .Where(t => t.Name != Name)
            .Select(t => new { name = t.Name, description = t.Description })
            .ToList();
        return Task.FromResult(new AiToolResult(true, JsonSerializer.Serialize(new { tools, role = ctx.RoleName })));
    }
}
