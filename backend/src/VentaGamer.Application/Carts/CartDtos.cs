namespace VentaGamer.Application.Carts;

public record CartDto(
    int Id,
    IReadOnlyList<CartItemDto> Items,
    decimal Total
);

public record CartItemDto(
    int CartItemId,
    int ProductId,
    string ProductTitle,
    string Category,
    string? ImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal
);

public record AddItemRequest(int ProductId, int Quantity);
public record UpdateItemRequest(int Quantity);
