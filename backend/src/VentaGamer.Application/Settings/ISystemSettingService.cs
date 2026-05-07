namespace VentaGamer.Application.Settings;

public interface ISystemSettingService
{
    Task<string?> GetAsync(string key, CancellationToken ct = default);
    Task<string> GetOrDefaultAsync(string key, string fallback, CancellationToken ct = default);
    Task SetAsync(string key, string value, string? description = null, CancellationToken ct = default);
    Task<IReadOnlyList<SystemSettingDto>> GetByPrefixAsync(string prefix, CancellationToken ct = default);
}

public record SystemSettingDto(string Key, string Value, string? Description, DateTime? UpdatedAtUtc);

public static class SettingKeys
{
    public const string AiBaseUrl = "Ai:BaseUrl";
    public const string AiModel = "Ai:Model";
    public const string AiTemperature = "Ai:Temperature";
}
