namespace VentaGamer.Application.Orders;

public record OrderDto(
    int Id,
    string OrderNumber,
    DateTime PlacedAtUtc,
    decimal Total,
    IReadOnlyList<OrderItemDto> Items,
    string CustomerUsername
);

public record OrderItemDto(
    int ProductId,
    string ProductTitle,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal
);
