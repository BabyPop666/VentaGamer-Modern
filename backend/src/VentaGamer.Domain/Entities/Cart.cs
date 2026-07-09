using VentaGamer.Domain.Common;

namespace VentaGamer.Domain.Entities;

public class Cart : EntityBase
{
    public int UserId { get; private set; }
    public AppUser User { get; private set; } = default!;

    public ICollection<CartItem> Items { get; private set; } = new List<CartItem>();

    private Cart() { }

    public Cart(int userId)
    {
        UserId = userId;
    }
}
