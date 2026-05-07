using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Carts;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "cart.use")]
public class CartController : ControllerBase
{
    private readonly ICartService _service;
    public CartController(ICartService service) => _service = service;

    private int CurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
        => Ok(await _service.GetCurrentAsync(CurrentUserId(), ct));

    [HttpPost("items")]
    public async Task<IActionResult> Add([FromBody] AddItemRequest req, CancellationToken ct)
    {
        try { return Ok(await _service.AddItemAsync(CurrentUserId(), req, ct)); }
        catch (InsufficientStockException ex) { return Conflict(new { error = "stock_insuficiente", message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { error = "invalido", message = ex.Message }); }
    }

    [HttpPut("items/{cartItemId:int}")]
    public async Task<IActionResult> Update(int cartItemId, [FromBody] UpdateItemRequest req, CancellationToken ct)
    {
        try { return Ok(await _service.UpdateItemAsync(CurrentUserId(), cartItemId, req, ct)); }
        catch (CartItemNotFoundException) { return NotFound(); }
        catch (InsufficientStockException ex) { return Conflict(new { error = "stock_insuficiente", message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { error = "invalido", message = ex.Message }); }
    }

    [HttpDelete("items/{cartItemId:int}")]
    public async Task<IActionResult> Remove(int cartItemId, CancellationToken ct)
    {
        try { return Ok(await _service.RemoveItemAsync(CurrentUserId(), cartItemId, ct)); }
        catch (CartItemNotFoundException) { return NotFound(); }
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken ct)
    {
        await _service.ClearAsync(CurrentUserId(), ct);
        return NoContent();
    }
}
