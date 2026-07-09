using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class CartItem : EntityBase
{
    public int CartId { get; private set; }
    public Cart Cart { get; private set; } = default!;

    public int ProductId { get; private set; }
    public Product Product { get; private set; } = default!;

    public int Quantity { get; private set; }

    private CartItem() { }

    public CartItem(int cartId, int productId, int quantity)
    {
        if (quantity < 1) throw new ArgumentException("Cantidad >= 1");
        CartId = cartId;
        ProductId = productId;
        Quantity = quantity;
    }

    public void SetQuantity(int quantity)
    {
        if (quantity < 1) throw new ArgumentException("Cantidad >= 1");
        Quantity = quantity;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void IncreaseQuantity(int delta)
    {
        if (delta < 1) throw new ArgumentException("delta >= 1");
        Quantity += delta;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
