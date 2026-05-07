namespace VentaGamer.Application.Admin;

public interface IAdminService
{
    Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<PermissionDto>> GetPermissionsAsync(CancellationToken ct = default);
    Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, CancellationToken ct = default);
    Task<RoleDto> UpdateRoleAsync(int roleId, UpdateRoleRequest request, CancellationToken ct = default);
    Task DeleteRoleAsync(int roleId, CancellationToken ct = default);

    Task<IReadOnlyList<UserListItemDto>> GetUsersAsync(CancellationToken ct = default);
    Task SetUserBlockedAsync(int userId, bool isBlocked, CancellationToken ct = default);
    Task ChangeUserRoleAsync(int userId, int roleId, CancellationToken ct = default);
}

public class RoleNotFoundException : Exception
{
    public RoleNotFoundException(int id) : base($"Rol {id} no encontrado") { }
}

public class RoleHasUsersException : Exception
{
    public RoleHasUsersException(int count) : base($"No se puede eliminar: {count} usuarios tienen este rol") { }
}

public class CircularRoleHierarchyException : Exception
{
    public CircularRoleHierarchyException() : base("La jerarquia de roles seria circular") { }
}
