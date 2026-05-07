using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Products;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 16,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        CancellationToken ct = default)
    {
        var result = await _service.GetPaginatedAsync(page, pageSize, search, category, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var cats = await _service.GetCategoriesAsync(ct);
        return Ok(cats);
    }

    [HttpPost]
    [Authorize(Policy = "products.write")]
    public async Task<IActionResult> Create([FromBody] ProductCreateRequest req, CancellationToken ct)
    {
        var created = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "products.write")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateRequest req, CancellationToken ct)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, req, ct);
            return Ok(updated);
        }
        catch (ProductNotFoundException) { return NotFound(); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "products.write")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (ProductNotFoundException) { return NotFound(); }
    }
}
