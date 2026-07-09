using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Products;
using VentaGamer.Domain.Entities;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Products;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db) => _db = db;

    public async Task<PaginatedResult<ProductDto>> GetPaginatedAsync(int page, int pageSize, string? search, string? category, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 16;
        if (pageSize > 100) pageSize = 100;

        var query = _db.Products.AsNoTracking().Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Title.Contains(search));

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        var totalItems = await query.CountAsync(ct);

        var items = await query
            .OrderBy(p => p.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto(p.Id, p.Title, p.Category, p.Price, p.Stock, p.ImageUrl, p.IsActive))
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
        return new PaginatedResult<ProductDto>(items, page, pageSize, totalItems, totalPages);
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.Title, p.Category, p.Price, p.Stock, p.ImageUrl, p.IsActive))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ProductDto> CreateAsync(ProductCreateRequest req, CancellationToken ct = default)
    {
        var product = new Product(req.Title, req.Category, req.Price, req.Stock, req.ImageUrl);
        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);
        return Map(product);
    }

    public async Task<ProductDto> UpdateAsync(int id, ProductUpdateRequest req, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct)
                      ?? throw new ProductNotFoundException(id);

        product.Update(req.Title, req.Category, req.Price, req.ImageUrl);
        await _db.SaveChangesAsync(ct);
        return Map(product);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct)
                      ?? throw new ProductNotFoundException(id);

        product.Deactivate();
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<string>> GetCategoriesAsync(CancellationToken ct = default)
    {
        return await _db.Products.AsNoTracking()
            .Where(p => p.IsActive)
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(ct);
    }

    private static ProductDto Map(Product p) =>
        new(p.Id, p.Title, p.Category, p.Price, p.Stock, p.ImageUrl, p.IsActive);
}
