namespace VentaGamer.Application.Carts;

public interface ICartService
{
    Task<CartDto> GetCurrentAsync(int userId, CancellationToken ct = default);
    Task<CartDto> AddItemAsync(int userId, AddItemRequest request, CancellationToken ct = default);
    Task<CartDto> UpdateItemAsync(int userId, int cartItemId, UpdateItemRequest request, CancellationToken ct = default);
    Task<CartDto> RemoveItemAsync(int userId, int cartItemId, CancellationToken ct = default);
    Task ClearAsync(int userId, CancellationToken ct = default);
}

public class CartItemNotFoundException : Exception
{
    public CartItemNotFoundException() : base("Item del carrito no encontrado") { }
}

public class InsufficientStockException : Exception
{
    public InsufficientStockException(string productTitle, int available)
        : base($"Stock insuficiente de '{productTitle}' (quedan {available})") { }
}
