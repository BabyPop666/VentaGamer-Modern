using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class OrderItem : EntityBase
{
    public int OrderId { get; private set; }
    public Order Order { get; private set; } = default!;

    public int ProductId { get; private set; }
    public Product Product { get; private set; } = default!;

    // Snapshot del producto al momento de la compra
    public string ProductTitle { get; private set; } = default!;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public decimal LineTotal => UnitPrice * Quantity;

    private OrderItem() { }

    public OrderItem(int productId, string productTitle, decimal unitPrice, int quantity)
    {
        ProductId = productId;
        ProductTitle = productTitle;
        UnitPrice = unitPrice;
        Quantity = quantity;
    }
}
