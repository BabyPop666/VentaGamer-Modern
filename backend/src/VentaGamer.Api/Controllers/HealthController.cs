using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;
    public HealthController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var dbOk = false;
        string? dbError = null;
        try { dbOk = await _db.Database.CanConnectAsync(ct); }
        catch (Exception ex) { dbError = ex.Message; }

        var status = dbOk ? "ok" : "degraded";

        return Ok(new
        {
            status,
            service = "VentaGamer.Api",
            version = "1.0.0",
            timestamp = DateTime.UtcNow,
            checks = new { database = dbOk ? "ok" : (dbError ?? "fail") }
        });
    }
}
