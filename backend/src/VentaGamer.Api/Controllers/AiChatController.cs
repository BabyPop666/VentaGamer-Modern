using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VentaGamer.Application.Ai;
using VentaGamer.Application.Settings;
using VentaGamer.Infrastructure.Ai;

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

    // ======== Config admin (igual al panel SuperAdmin de InventarioApp) ========

    public record AiConfigDto(string BaseUrl, string Model, bool Available, IReadOnlyList<string>? AvailableModels);
    public record UpdateAiConfigRequest(string? BaseUrl, string? Model);

    [HttpGet("config")]
    [Authorize(Policy = "roles.write")]
    public async Task<IActionResult> GetConfig(
        [FromServices] OllamaClient ollama,
        CancellationToken ct)
    {
        var url = await ollama.GetEffectiveBaseUrlAsync(ct);
        var model = await ollama.GetEffectiveModelAsync(ct);
        var available = await ollama.IsAvailableAsync(ct);
        var models = available ? await ollama.ListModelsAsync(ct) : null;
        return Ok(new AiConfigDto(url, model, available, models));
    }

    [HttpPut("config")]
    [Authorize(Policy = "roles.write")]
    public async Task<IActionResult> UpdateConfig(
        [FromBody] UpdateAiConfigRequest req,
        [FromServices] ISystemSettingService settings,
        [FromServices] OllamaClient ollama,
        CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(req.BaseUrl))
        {
            if (!Uri.TryCreate(req.BaseUrl, UriKind.Absolute, out _))
                return BadRequest(new { error = "url_invalida", message = "BaseUrl debe ser una URL absoluta (http://host:puerto)" });
            await settings.SetAsync(SettingKeys.AiBaseUrl, req.BaseUrl.TrimEnd('/'),
                "URL base donde corre Ollama (ej: http://192.168.1.10:11434)", ct);
        }
        if (!string.IsNullOrWhiteSpace(req.Model))
            await settings.SetAsync(SettingKeys.AiModel, req.Model, "Nombre del modelo Ollama", ct);

        // Devolver el estado nuevo
        return await GetConfig(ollama, ct);
    }

    [HttpPost("config/test")]
    [Authorize(Policy = "roles.write")]
    public async Task<IActionResult> TestConnection(
        [FromBody] UpdateAiConfigRequest req,
        [FromServices] OllamaClient ollama,
        CancellationToken ct)
    {
        // Test puntual contra una URL sin guardarla
        if (string.IsNullOrWhiteSpace(req.BaseUrl))
            return BadRequest(new { error = "url_requerida" });

        if (!Uri.TryCreate(req.BaseUrl, UriKind.Absolute, out var uri))
            return BadRequest(new { error = "url_invalida" });

        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
        try
        {
            using var res = await http.GetAsync($"{uri.AbsoluteUri.TrimEnd('/')}/api/tags", ct);
            if (!res.IsSuccessStatusCode)
                return Ok(new { available = false, message = $"HTTP {(int)res.StatusCode}" });
            var content = await res.Content.ReadAsStringAsync(ct);
            return Ok(new { available = true, sample = content.Length > 200 ? content[..200] : content });
        }
        catch (Exception ex)
        {
            return Ok(new { available = false, message = ex.Message });
        }
    }
}
