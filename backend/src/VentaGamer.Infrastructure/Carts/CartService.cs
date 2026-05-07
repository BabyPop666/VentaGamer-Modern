using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Carts;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Carts;

public class CartService : ICartService
{
    private readonly AppDbContext _db;

    public CartService(AppDbContext db) => _db = db;

    public async Task<CartDto> GetCurrentAsync(int userId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(userId, ct);
        return await BuildDtoAsync(cart.Id, ct);
    }

    public async Task<CartDto> AddItemAsync(int userId, AddItemRequest req, CancellationToken ct = default)
    {
        if (req.Quantity < 1) throw new ArgumentException("Cantidad >= 1");

        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == req.ProductId && p.IsActive, ct)
                      ?? throw new ArgumentException($"Producto {req.ProductId} no existe o no esta activo");

        var cart = await GetOrCreateCartAsync(userId, ct);

        var existing = await _db.CartItems
            .FirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == req.ProductId, ct);

        var newQty = (existing?.Quantity ?? 0) + req.Quantity;
        if (product.Stock < newQty) throw new InsufficientStockException(product.Title, product.Stock);

        if (existing is null)
            _db.CartItems.Add(new CartItem(cart.Id, req.ProductId, req.Quantity));
        else
            existing.IncreaseQuantity(req.Quantity);

        await _db.SaveChangesAsync(ct);
        return await BuildDtoAsync(cart.Id, ct);
    }

    public async Task<CartDto> UpdateItemAsync(int userId, int cartItemId, UpdateItemRequest req, CancellationToken ct = default)
    {
        if (req.Quantity < 1) throw new ArgumentException("Cantidad >= 1");

        var cart = await GetOrCreateCartAsync(userId, ct);
        var item = await _db.CartItems
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == cartItemId && i.CartId == cart.Id, ct)
            ?? throw new CartItemNotFoundException();

        if (item.Product.Stock < req.Quantity) throw new InsufficientStockException(item.Product.Title, item.Product.Stock);

        item.SetQuantity(req.Quantity);
        await _db.SaveChangesAsync(ct);
        return await BuildDtoAsync(cart.Id, ct);
    }

    public async Task<CartDto> RemoveItemAsync(int userId, int cartItemId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(userId, ct);
        var item = await _db.CartItems.FirstOrDefaultAsync(i => i.Id == cartItemId && i.CartId == cart.Id, ct)
                   ?? throw new CartItemNotFoundException();

        _db.CartItems.Remove(item);
        await _db.SaveChangesAsync(ct);
        return await BuildDtoAsync(cart.Id, ct);
    }

    public async Task ClearAsync(int userId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(userId, ct);
        var items = await _db.CartItems.Where(i => i.CartId == cart.Id).ToListAsync(ct);
        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId, CancellationToken ct)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId, ct);
        if (cart is null)
        {
            cart = new Cart(userId);
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync(ct);
        }
        return cart;
    }

    private async Task<CartDto> BuildDtoAsync(int cartId, CancellationToken ct)
    {
        var items = await _db.CartItems
            .AsNoTracking()
            .Where(i => i.CartId == cartId)
            .Include(i => i.Product)
            .OrderBy(i => i.Product.Title)
            .Select(i => new CartItemDto(
                i.Id,
                i.ProductId,
                i.Product.Title,
                i.Product.Category,
                i.Product.ImageUrl,
                i.Product.Price,
                i.Quantity,
                i.Product.Price * i.Quantity))
            .ToListAsync(ct);

        return new CartDto(cartId, items, items.Sum(i => i.LineTotal));
    }
}
