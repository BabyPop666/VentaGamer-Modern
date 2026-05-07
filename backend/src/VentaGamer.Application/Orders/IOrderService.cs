namespace VentaGamer.Application.Orders;

public interface IOrderService
{
    /// <summary>Crea una Order a partir del carrito actual y vacia el carrito (transaccional).</summary>
    Task<OrderDto> CheckoutAsync(int userId, CancellationToken ct = default);
    Task<OrderDto?> GetByIdAsync(int orderId, int requesterUserId, bool includeOthers, CancellationToken ct = default);
    Task<IReadOnlyList<OrderDto>> GetMyOrdersAsync(int userId, CancellationToken ct = default);
    Task<byte[]> GeneratePdfAsync(int orderId, int requesterUserId, bool includeOthers, CancellationToken ct = default);
}

public class OrderNotFoundException : Exception
{
    public OrderNotFoundException(int id) : base($"Order {id} no encontrada") { }
}

public class EmptyCartException : Exception
{
    public EmptyCartException() : base("El carrito esta vacio") { }
}
