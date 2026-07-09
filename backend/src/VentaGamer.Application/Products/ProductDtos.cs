namespace VentaGamer.Application.Products;

public record ProductDto(
    int Id,
    string Title,
    string Category,
    decimal Price,
    int Stock,
    string? ImageUrl,
    bool IsActive
);

public record ProductCreateRequest(
    string Title,
    string Category,
    decimal Price,
    int Stock,
    string? ImageUrl
);

public record ProductUpdateRequest(
    string Title,
    string Category,
    decimal Price,
    string? ImageUrl
);

public record PaginatedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages
);
