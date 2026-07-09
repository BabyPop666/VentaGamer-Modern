using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Auth;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<AppUser> _hasher;
    private readonly JwtTokenService _jwt;

    public AuthService(AppDbContext db, IPasswordHasher<AppUser> hasher, JwtTokenService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .Include(u => u.Language)
            .FirstOrDefaultAsync(u => u.Username == request.Username, ct);

        if (user is null)
            throw new InvalidCredentialsException();

        if (user.IsBlocked)
            throw new UserBlockedException();

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verify == PasswordVerificationResult.Failed)
        {
            user.RegisterFailedLogin();
            if (user.FailedLoginAttempts >= 3)
                user.Block();
            await _db.SaveChangesAsync(ct);
            throw new InvalidCredentialsException();
        }

        if (verify == PasswordVerificationResult.SuccessRehashNeeded)
            user.ChangePassword(_hasher.HashPassword(user, request.Password));

        user.RegisterSuccessfulLogin();
        await _db.SaveChangesAsync(ct);

        return await BuildResponseAsync(user, ct);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username, ct))
            throw new UsernameAlreadyExistsException(request.Username);

        var roleName = string.IsNullOrWhiteSpace(request.RoleName) ? "User" : request.RoleName;
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName, ct)
                   ?? throw new InvalidOperationException($"Rol '{roleName}' no existe");

        var langCode = string.IsNullOrWhiteSpace(request.LanguageCode) ? "es" : request.LanguageCode;
        var lang = await _db.Languages.FirstOrDefaultAsync(l => l.Code == langCode, ct)
                   ?? throw new InvalidOperationException($"Idioma '{langCode}' no existe");

        var user = new AppUser(request.Username, "", role.Id, lang.Id);
        user.ChangePassword(_hasher.HashPassword(user, request.Password));

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(user).Reference(u => u.Role).LoadAsync(ct);
        await _db.Entry(user).Reference(u => u.Language).LoadAsync(ct);

        return await BuildResponseAsync(user, ct);
    }

    public async Task<UserInfo> GetCurrentUserAsync(int userId, CancellationToken ct = default)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .Include(u => u.Language)
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidCredentialsException();

        var perms = await GetEffectivePermissionsAsync(user.RoleId, ct);
        return new UserInfo(user.Id, user.Username, user.Role.Name, user.Language.Code, perms);
    }

    private async Task<AuthResponse> BuildResponseAsync(AppUser user, CancellationToken ct)
    {
        var perms = await GetEffectivePermissionsAsync(user.RoleId, ct);
        var (token, expires) = _jwt.Generate(user.Id, user.Username, user.Role.Name, perms);
        var info = new UserInfo(user.Id, user.Username, user.Role.Name, user.Language.Code, perms);
        return new AuthResponse(token, expires, info);
    }

    private async Task<IReadOnlyCollection<string>> GetEffectivePermissionsAsync(int roleId, CancellationToken ct)
    {
        // Recoge permisos del rol + roles padre (jerarquia Composite)
        var roleIds = new HashSet<int> { roleId };
        var queue = new Queue<int>();
        queue.Enqueue(roleId);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            var parents = await _db.RoleHierarchies
                .Where(h => h.ChildRoleId == current)
                .Select(h => h.ParentRoleId)
                .ToListAsync(ct);

            foreach (var p in parents)
                if (roleIds.Add(p)) queue.Enqueue(p);
        }

        return await _db.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId))
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToListAsync(ct);
    }
}
