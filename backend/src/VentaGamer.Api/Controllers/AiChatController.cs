using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Ai;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiChatController : ControllerBase
{
    private readonly IAiChatService _service;
    public AiChatController(IAiChatService service) => _service = service;

    private int CurrentUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("status")]
    public async Task<IActionResult> Status(CancellationToken ct)
    {
        var available = await _service.IsAvailableAsync(ct);
        return Ok(new { available });
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _service.GetConversationsAsync(CurrentUserId(), ct));

    [HttpPost("conversations")]
    public async Task<IActionResult> Create(CancellationToken ct)
    {
        var id = await _service.CreateConversationAsync(CurrentUserId(), ct);
        return Created($"/api/ai/conversations/{id}", new { id });
    }

    [HttpGet("conversations/{id:int}/messages")]
    public async Task<IActionResult> Messages(int id, CancellationToken ct)
    {
        try { return Ok(await _service.GetMessagesAsync(id, CurrentUserId(), ct)); }
        catch (AiConversationNotFoundException) { return NotFound(); }
    }

    [HttpDelete("conversations/{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        try { await _service.DeleteConversationAsync(id, CurrentUserId(), ct); return NoContent(); }
        catch (AiConversationNotFoundException) { return NotFound(); }
    }
}
