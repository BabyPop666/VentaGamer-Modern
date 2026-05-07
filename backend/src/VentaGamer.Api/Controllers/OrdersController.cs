using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Orders;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    public OrdersController(IOrderService service) => _service = service;

    private int CurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool CanReadAll() => User.HasClaim("permission", "orders.read.all");

    [HttpPost("checkout")]
    [Authorize(Policy = "cart.use")]
    public async Task<IActionResult> Checkout(CancellationToken ct)
    {
        try
        {
            var order = await _service.CheckoutAsync(CurrentUserId(), ct);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (EmptyCartException) { return BadRequest(new { error = "carrito_vacio" }); }
        catch (InvalidOperationException ex) { return Conflict(new { error = "stock_insuficiente", message = ex.Message }); }
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
        => Ok(await _service.GetMyOrdersAsync(CurrentUserId(), ct));

    [HttpGet]
    [Authorize(Policy = "orders.read.all")]
    public async Task<IActionResult> GetAll([FromQuery] string? username, CancellationToken ct)
        => Ok(await _service.GetAllOrdersAsync(username, ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, CurrentUserId(), CanReadAll(), ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> DownloadPdf(int id, CancellationToken ct)
    {
        try
        {
            var bytes = await _service.GeneratePdfAsync(id, CurrentUserId(), CanReadAll(), ct);
            return File(bytes, "application/pdf", $"VentaGamer-{id}.pdf");
        }
        catch (OrderNotFoundException) { return NotFound(); }
    }
}
