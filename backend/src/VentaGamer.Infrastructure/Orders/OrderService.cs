using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Orders;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Orders;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly OrderPdfGenerator _pdfGen;

    public OrderService(AppDbContext db, OrderPdfGenerator pdfGen)
    {
        _db = db;
        _pdfGen = pdfGen;
    }

    public async Task<OrderDto> CheckoutAsync(int userId, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.UserId == userId, ct)
                   ?? throw new EmptyCartException();

        var items = await _db.CartItems
            .Where(i => i.CartId == cart.Id)
            .Include(i => i.Product)
            .ToListAsync(ct);

        if (items.Count == 0) throw new EmptyCartException();

        // Validar stock + descontar
        foreach (var i in items)
        {
            if (i.Product.Stock < i.Quantity)
                throw new InvalidOperationException($"Stock insuficiente de '{i.Product.Title}'");
            i.Product.AdjustStock(-i.Quantity);
        }

        var orderItems = items.Select(i =>
            new OrderItem(i.ProductId, i.Product.Title, i.Product.Price, i.Quantity)).ToList();

        var order = new Order(userId, orderItems);
        _db.Orders.Add(order);

        // Vaciar carrito
        _db.CartItems.RemoveRange(items);

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return await BuildDtoAsync(order.Id, ct);
    }

    public async Task<OrderDto?> GetByIdAsync(int orderId, int requesterUserId, bool includeOthers, CancellationToken ct = default)
    {
        var query = _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.User)
            .Where(o => o.Id == orderId);

        if (!includeOthers) query = query.Where(o => o.UserId == requesterUserId);

        var order = await query.FirstOrDefaultAsync(ct);
        return order is null ? null : MapDto(order);
    }

    public async Task<IReadOnlyList<OrderDto>> GetMyOrdersAsync(int userId, CancellationToken ct = default)
    {
        var orders = await _db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .Include(o => o.User)
            .OrderByDescending(o => o.PlacedAtUtc)
            .ToListAsync(ct);

        return orders.Select(MapDto).ToList();
    }

    public async Task<byte[]> GeneratePdfAsync(int orderId, int requesterUserId, bool includeOthers, CancellationToken ct = default)
    {
        var dto = await GetByIdAsync(orderId, requesterUserId, includeOthers, ct)
                  ?? throw new OrderNotFoundException(orderId);
        return _pdfGen.Generate(dto);
    }

    private async Task<OrderDto> BuildDtoAsync(int orderId, CancellationToken ct)
    {
        var order = await _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.User)
            .FirstAsync(o => o.Id == orderId, ct);
        return MapDto(order);
    }

    private static OrderDto MapDto(Order o) =>
        new(
            o.Id,
            o.OrderNumber,
            o.PlacedAtUtc,
            o.Total,
            o.Items.Select(i => new OrderItemDto(i.ProductId, i.ProductTitle, i.UnitPrice, i.Quantity, i.LineTotal)).ToList(),
            o.User?.Username ?? "(desconocido)"
        );
}
