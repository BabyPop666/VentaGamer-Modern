namespace VentaGamer.Application.Auth;

public record LoginRequest(string Username, string Password);
public record RegisterRequest(string Username, string Password, string? RoleName = null, string? LanguageCode = null);

public record AuthResponse(
    string AccessToken,
    DateTime ExpiresAtUtc,
    UserInfo User
);

public record UserInfo(
    int Id,
    string Username,
    string RoleName,
    string LanguageCode,
    IReadOnlyCollection<string> Permissions
);
