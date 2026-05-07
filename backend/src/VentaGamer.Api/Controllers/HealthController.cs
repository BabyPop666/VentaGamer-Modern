using Microsoft.AspNetCore.Mvc;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        status = "ok",
        service = "VentaGamer.Api",
        version = "0.1.0-etapa0",
        timestamp = DateTime.UtcNow
    });
}
