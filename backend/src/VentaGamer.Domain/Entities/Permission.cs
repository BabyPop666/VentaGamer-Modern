using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class Permission : EntityBase
{
    public string Code { get; private set; } = default!;
    public string Description { get; private set; } = default!;

    public ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();

    private Permission() { }

    public Permission(string code, string description)
    {
        Code = code;
        Description = description;
    }
}
