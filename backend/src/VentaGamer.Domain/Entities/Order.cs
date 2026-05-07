using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class Order : EntityBase
{
    public int UserId { get; private set; }
    public AppUser User { get; private set; } = default!;

    public DateTime PlacedAtUtc { get; private set; } = DateTime.UtcNow;
    public decimal Total { get; private set; }
    public string OrderNumber { get; private set; } = default!;

    public ICollection<OrderItem> Items { get; private set; } = new List<OrderItem>();

    private Order() { }

    public Order(int userId, IEnumerable<OrderItem> items)
    {
        UserId = userId;
        OrderNumber = $"VG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        foreach (var i in items) Items.Add(i);
        Total = Items.Sum(i => i.LineTotal);
    }
}
