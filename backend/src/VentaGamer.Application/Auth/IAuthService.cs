namespace VentaGamer.Application.Auth;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<UserInfo> GetCurrentUserAsync(int userId, CancellationToken ct = default);
}

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException() : base("Credenciales invalidas") { }
}

public class UserBlockedException : Exception
{
    public UserBlockedException() : base("El usuario esta bloqueado") { }
}

public class UsernameAlreadyExistsException : Exception
{
    public UsernameAlreadyExistsException(string username)
        : base($"El usuario '{username}' ya existe") { }
}
