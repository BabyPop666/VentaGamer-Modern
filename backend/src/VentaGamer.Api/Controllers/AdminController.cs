using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Admin;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _service;
    public AdminController(IAdminService service) => _service = service;

    [HttpGet("roles")]
    [Authorize(Policy = "roles.read")]
    public async Task<IActionResult> GetRoles(CancellationToken ct) => Ok(await _service.GetRolesAsync(ct));

    [HttpGet("permissions")]
    [Authorize(Policy = "roles.read")]
    public async Task<IActionResult> GetPermissions(CancellationToken ct) => Ok(await _service.GetPermissionsAsync(ct));

    [HttpPost("roles")]
    [Authorize(Policy = "roles.write")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest req, CancellationToken ct)
    {
        try { return Ok(await _service.CreateRoleAsync(req, ct)); }
        catch (InvalidOperationException ex) { return Conflict(new { error = "rol_existe", message = ex.Message }); }
        catch (CircularRoleHierarchyException ex) { return BadRequest(new { error = "ciclo", message = ex.Message }); }
    }

    [HttpPut("roles/{id:int}")]
    [Authorize(Policy = "roles.write")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest req, CancellationToken ct)
    {
        try { return Ok(await _service.UpdateRoleAsync(id, req, ct)); }
        catch (RoleNotFoundException) { return NotFound(); }
        catch (CircularRoleHierarchyException ex) { return BadRequest(new { error = "ciclo", message = ex.Message }); }
    }

    [HttpDelete("roles/{id:int}")]
    [Authorize(Policy = "roles.write")]
    public async Task<IActionResult> DeleteRole(int id, CancellationToken ct)
    {
        try { await _service.DeleteRoleAsync(id, ct); return NoContent(); }
        catch (RoleNotFoundException) { return NotFound(); }
        catch (RoleHasUsersException ex) { return Conflict(new { error = "rol_con_usuarios", message = ex.Message }); }
    }

    [HttpGet("users")]
    [Authorize(Policy = "users.register")]
    public async Task<IActionResult> GetUsers(CancellationToken ct) => Ok(await _service.GetUsersAsync(ct));

    [HttpPut("users/{id:int}/blocked")]
    [Authorize(Policy = "users.register")]
    public async Task<IActionResult> SetBlocked(int id, [FromBody] SetUserBlockedRequest req, CancellationToken ct)
    {
        try { await _service.SetUserBlockedAsync(id, req.IsBlocked, ct); return NoContent(); }
        catch (InvalidOperationException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPut("users/{id:int}/role")]
    [Authorize(Policy = "users.register")]
    public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeUserRoleRequest req, CancellationToken ct)
    {
        try { await _service.ChangeUserRoleAsync(id, req.RoleId, ct); return NoContent(); }
        catch (RoleNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return NotFound(new { error = ex.Message }); }
    }
}
