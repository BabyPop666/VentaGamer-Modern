namespace VentaGamer.Application.Admin;

public record RoleDto(int Id, string Name, string Description, IReadOnlyList<int> PermissionIds, IReadOnlyList<int> ParentRoleIds);
public record PermissionDto(int Id, string Code, string Description);

public record CreateRoleRequest(string Name, string Description, List<int> PermissionIds, List<int>? ParentRoleIds);
public record UpdateRoleRequest(string Description, List<int> PermissionIds, List<int>? ParentRoleIds);

public record UserListItemDto(int Id, string Username, string RoleName, bool IsBlocked, string LanguageCode, DateTime CreatedAtUtc);
public record SetUserBlockedRequest(bool IsBlocked);
public record ChangeUserRoleRequest(int RoleId);
