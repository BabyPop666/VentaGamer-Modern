using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Audit;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "audit.read")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _service;
    public AuditController(IAuditService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? username,
        [FromQuery] string? module,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await _service.SearchAsync(
            new AuditFilterRequest(username, module, from, to, page, pageSize), ct);
        return Ok(result);
    }
}
