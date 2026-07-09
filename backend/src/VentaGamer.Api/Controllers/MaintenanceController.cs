using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Maintenance;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/maintenance")]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _service;
    public MaintenanceController(IMaintenanceService service) => _service = service;

    [HttpPost("backup")]
    [Authorize(Policy = "backup.manage")]
    public async Task<IActionResult> CreateBackup(CancellationToken ct)
    {
        try { return Ok(await _service.CreateBackupAsync(ct)); }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "backup_failed", message = ex.Message });
        }
    }

    [HttpGet("backups")]
    [Authorize(Policy = "backup.manage")]
    public async Task<IActionResult> ListBackups(CancellationToken ct)
        => Ok(await _service.ListBackupsAsync(ct));

    [HttpGet("integrity")]
    [Authorize(Policy = "integrity.check")]
    public async Task<IActionResult> CheckIntegrity(CancellationToken ct)
        => Ok(await _service.CheckIntegrityAsync(ct));
}
