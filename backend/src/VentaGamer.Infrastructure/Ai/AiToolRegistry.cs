using VentaGamer.Application.Ai;

namespace VentaGamer.Infrastructure.Ai;

public class AiToolRegistry
{
    private readonly IEnumerable<IAiTool> _allTools;
    public AiToolRegistry(IEnumerable<IAiTool> allTools) => _allTools = allTools;

    public IReadOnlyList<IAiTool> GetAvailableTools(AiToolContext ctx)
    {
        return _allTools
            .Where(t => t.RequiredPermissions.Count == 0
                        || t.RequiredPermissions.All(p => ctx.Permissions.Contains(p)))
            .ToList();
    }

    public IAiTool? FindByName(string name) =>
        _allTools.FirstOrDefault(t => string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));
}
