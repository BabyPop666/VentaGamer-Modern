using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class Product : EntityBase
{
    public string Title { get; private set; } = default!;
    public string Category { get; private set; } = default!;
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Product() { }

    public Product(string title, string category, decimal price, int stock = 0, string? imageUrl = null)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title required");
        if (price < 0) throw new ArgumentException("Price cannot be negative");
        if (stock < 0) throw new ArgumentException("Stock cannot be negative");

        Title = title;
        Category = category;
        Price = price;
        Stock = stock;
        ImageUrl = imageUrl;
    }

    public void Update(string title, string category, decimal price, string? imageUrl)
    {
        Title = title;
        Category = category;
        Price = price;
        ImageUrl = imageUrl;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void AdjustStock(int delta)
    {
        if (Stock + delta < 0) throw new InvalidOperationException("Stock insuficiente");
        Stock += delta;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void Deactivate() { IsActive = false; UpdatedAtUtc = DateTime.UtcNow; }
    public void Activate() { IsActive = true; UpdatedAtUtc = DateTime.UtcNow; }
}
