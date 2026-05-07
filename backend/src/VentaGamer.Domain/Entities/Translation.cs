using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class Translation : EntityBase
{
    public int LanguageId { get; private set; }
    public Language Language { get; private set; } = default!;

    public string TextKey { get; private set; } = default!;
    public string Value { get; private set; } = default!;

    private Translation() { }

    public Translation(int languageId, string textKey, string value)
    {
        LanguageId = languageId;
        TextKey = textKey;
        Value = value;
    }

    public void UpdateValue(string value)
    {
        Value = value;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
