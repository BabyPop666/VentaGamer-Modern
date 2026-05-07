namespace VentaGamer.Domain.Entities;

public class RolePermission
{
    public int RoleId { get; private set; }
    public Role Role { get; private set; } = default!;

    public int PermissionId { get; private set; }
    public Permission Permission { get; private set; } = default!;

    private RolePermission() { }

    public RolePermission(int roleId, int permissionId)
    {
        RoleId = roleId;
        PermissionId = permissionId;
    }
}
