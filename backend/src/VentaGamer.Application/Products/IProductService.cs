namespace VentaGamer.Application.Products;

public interface IProductService
{
    Task<PaginatedResult<ProductDto>> GetPaginatedAsync(int page, int pageSize, string? search, string? category, CancellationToken ct = default);
    Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(ProductCreateRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateAsync(int id, ProductUpdateRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetCategoriesAsync(CancellationToken ct = default);
}

public class ProductNotFoundException : Exception
{
    public ProductNotFoundException(int id) : base($"Producto {id} no encontrado") { }
}
