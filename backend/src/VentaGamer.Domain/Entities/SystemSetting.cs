using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

/// <summary>
/// Settings clave-valor del sistema, modificables en runtime sin restart.
/// Equivalente a ConfiguracionSistema del proyecto InventarioApp.
/// </summary>
public class SystemSetting : EntityBase
{
    public string Key { get; private set; } = default!;
    public string Value { get; private set; } = default!;
    public string? Description { get; private set; }

    private SystemSetting() { }

    public SystemSetting(string key, string value, string? description = null)
    {
        Key = key;
        Value = value;
        Description = description;
    }

    public void UpdateValue(string value)
    {
        Value = value;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
