using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class Role : EntityBase
{
    public string Name { get; private set; } = default!;
    public string Description { get; private set; } = default!;

    public ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();
    public ICollection<RoleHierarchy> Children { get; private set; } = new List<RoleHierarchy>();
    public ICollection<RoleHierarchy> Parents { get; private set; } = new List<RoleHierarchy>();

    private Role() { }

    public Role(string name, string description)
    {
        Name = name;
        Description = description;
    }

    public void Rename(string description)
    {
        Description = description;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
