using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class Language : EntityBase
{
    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;

    private Language() { }

    public Language(string code, string name)
    {
        Code = code;
        Name = name;
    }

    public void Rename(string name)
    {
        Name = name;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
