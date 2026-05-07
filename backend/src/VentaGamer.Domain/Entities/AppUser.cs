using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class AppUser : EntityBase
{
    public string Username { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public bool IsBlocked { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LastLoginUtc { get; private set; }

    public int LanguageId { get; private set; }
    public Language Language { get; private set; } = default!;

    public int RoleId { get; private set; }
    public Role Role { get; private set; } = default!;

    private AppUser() { }

    public AppUser(string username, string passwordHash, int roleId, int languageId)
    {
        Username = username;
        PasswordHash = passwordHash;
        RoleId = roleId;
        LanguageId = languageId;
    }

    public void ChangePassword(string newHash)
    {
        PasswordHash = newHash;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ChangeLanguage(int languageId)
    {
        LanguageId = languageId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ChangeRole(int roleId)
    {
        RoleId = roleId;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Block() { IsBlocked = true; UpdatedAtUtc = DateTime.UtcNow; }
    public void Unblock() { IsBlocked = false; FailedLoginAttempts = 0; UpdatedAtUtc = DateTime.UtcNow; }
    public void RegisterSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LastLoginUtc = DateTime.UtcNow;
    }
    public void RegisterFailedLogin() => FailedLoginAttempts++;
}
