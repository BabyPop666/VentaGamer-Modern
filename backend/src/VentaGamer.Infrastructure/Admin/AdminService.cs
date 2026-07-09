using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Admin;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Admin;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    public AdminService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<RoleDto>> GetRolesAsync(CancellationToken ct = default)
    {
        var roles = await _db.Roles.AsNoTracking()
            .Include(r => r.RolePermissions)
            .Include(r => r.Parents)
            .OrderBy(r => r.Name)
            .ToListAsync(ct);

        return roles.Select(r => new RoleDto(
            r.Id, r.Name, r.Description,
            r.RolePermissions.Select(rp => rp.PermissionId).ToList(),
            r.Parents.Select(h => h.ParentRoleId).ToList()
        )).ToList();
    }

    public async Task<IReadOnlyList<PermissionDto>> GetPermissionsAsync(CancellationToken ct = default)
    {
        return await _db.Permissions.AsNoTracking()
            .OrderBy(p => p.Code)
            .Select(p => new PermissionDto(p.Id, p.Code, p.Description))
            .ToListAsync(ct);
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleRequest req, CancellationToken ct = default)
    {
        if (await _db.Roles.AnyAsync(r => r.Name == req.Name, ct))
            throw new InvalidOperationException($"Ya existe un rol con nombre '{req.Name}'");

        var role = new Role(req.Name, req.Description);
        _db.Roles.Add(role);
        await _db.SaveChangesAsync(ct);

        foreach (var pid in req.PermissionIds.Distinct())
            _db.RolePermissions.Add(new RolePermission(role.Id, pid));

        if (req.ParentRoleIds is { Count: > 0 })
            foreach (var pid in req.ParentRoleIds.Distinct())
                _db.RoleHierarchies.Add(new RoleHierarchy(pid, role.Id));

        await _db.SaveChangesAsync(ct);
        return await BuildDtoAsync(role.Id, ct);
    }

    public async Task<RoleDto> UpdateRoleAsync(int roleId, UpdateRoleRequest req, CancellationToken ct = default)
    {
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Id == roleId, ct)
                   ?? throw new RoleNotFoundException(roleId);

        role.Rename(req.Description);

        // Replace permissions
        var existingPerms = await _db.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync(ct);
        _db.RolePermissions.RemoveRange(existingPerms);
        foreach (var pid in req.PermissionIds.Distinct())
            _db.RolePermissions.Add(new RolePermission(roleId, pid));

        // Replace parents (con check de ciclos)
        if (req.ParentRoleIds is not null)
        {
            var existingParents = await _db.RoleHierarchies.Where(h => h.ChildRoleId == roleId).ToListAsync(ct);
            _db.RoleHierarchies.RemoveRange(existingParents);

            foreach (var parentId in req.ParentRoleIds.Distinct())
            {
                if (await WouldCreateCycleAsync(parentId, roleId, ct))
                    throw new CircularRoleHierarchyException();
                _db.RoleHierarchies.Add(new RoleHierarchy(parentId, roleId));
            }
        }

        await _db.SaveChangesAsync(ct);
        return await BuildDtoAsync(roleId, ct);
    }

    public async Task DeleteRoleAsync(int roleId, CancellationToken ct = default)
    {
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Id == roleId, ct)
                   ?? throw new RoleNotFoundException(roleId);

        var userCount = await _db.Users.CountAsync(u => u.RoleId == roleId, ct);
        if (userCount > 0) throw new RoleHasUsersException(userCount);

        var perms = await _db.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync(ct);
        _db.RolePermissions.RemoveRange(perms);

        var hier = await _db.RoleHierarchies.Where(h => h.ChildRoleId == roleId || h.ParentRoleId == roleId).ToListAsync(ct);
        _db.RoleHierarchies.RemoveRange(hier);

        _db.Roles.Remove(role);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<UserListItemDto>> GetUsersAsync(CancellationToken ct = default)
    {
        return await _db.Users.AsNoTracking()
            .Include(u => u.Role)
            .Include(u => u.Language)
            .OrderBy(u => u.Username)
            .Select(u => new UserListItemDto(u.Id, u.Username, u.Role.Name, u.IsBlocked, u.Language.Code, u.CreatedAtUtc))
            .ToListAsync(ct);
    }

    public async Task SetUserBlockedAsync(int userId, bool isBlocked, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
                   ?? throw new InvalidOperationException("Usuario no existe");
        if (isBlocked) user.Block(); else user.Unblock();
        await _db.SaveChangesAsync(ct);
    }

    public async Task ChangeUserRoleAsync(int userId, int roleId, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
                   ?? throw new InvalidOperationException("Usuario no existe");
        if (!await _db.Roles.AnyAsync(r => r.Id == roleId, ct))
            throw new RoleNotFoundException(roleId);

        user.ChangeRole(roleId);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<bool> WouldCreateCycleAsync(int newParentId, int childId, CancellationToken ct)
    {
        // Verificar si childId ya es ancestro de newParentId (eso crearia ciclo)
        if (newParentId == childId) return true;
        var queue = new Queue<int>();
        queue.Enqueue(newParentId);
        var visited = new HashSet<int> { newParentId };

        while (queue.Count > 0)
        {
            var cur = queue.Dequeue();
            var ancestors = await _db.RoleHierarchies
                .Where(h => h.ChildRoleId == cur)
                .Select(h => h.ParentRoleId)
                .ToListAsync(ct);

            foreach (var a in ancestors)
            {
                if (a == childId) return true;
                if (visited.Add(a)) queue.Enqueue(a);
            }
        }
        return false;
    }

    private async Task<RoleDto> BuildDtoAsync(int roleId, CancellationToken ct)
    {
        var role = await _db.Roles.AsNoTracking()
            .Include(r => r.RolePermissions)
            .Include(r => r.Parents)
            .FirstAsync(r => r.Id == roleId, ct);
        return new RoleDto(role.Id, role.Name, role.Description,
            role.RolePermissions.Select(rp => rp.PermissionId).ToList(),
            role.Parents.Select(h => h.ParentRoleId).ToList());
    }
}
