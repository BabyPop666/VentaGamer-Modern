namespace VentaGamer.Domain.Entities;

public class RoleHierarchy
{
    public int ParentRoleId { get; private set; }
    public Role ParentRole { get; private set; } = default!;

    public int ChildRoleId { get; private set; }
    public Role ChildRole { get; private set; } = default!;

    private RoleHierarchy() { }

    public RoleHierarchy(int parentRoleId, int childRoleId)
    {
        if (parentRoleId == childRoleId)
            throw new ArgumentException("Un rol no puede ser padre de si mismo.");

        ParentRoleId = parentRoleId;
        ChildRoleId = childRoleId;
    }
}
