using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Abstractions;

namespace VentaGamer.Api.Controllers;

[ApiController]
[Route("api/i18n")]
public class I18nController : ControllerBase
{
    private readonly IAppDbContext _db;
    public I18nController(IAppDbContext db) => _db = db;

    [HttpGet("languages")]
    public async Task<IActionResult> GetLanguages(CancellationToken ct)
    {
        var langs = await _db.Languages
            .OrderBy(l => l.Code)
            .Select(l => new { l.Code, l.Name })
            .ToListAsync(ct);
        return Ok(langs);
    }

    [HttpGet("translations/{langCode}")]
    public async Task<IActionResult> GetTranslations(string langCode, CancellationToken ct)
    {
        var lang = await _db.Languages.FirstOrDefaultAsync(l => l.Code == langCode, ct);
        if (lang is null) return NotFound();

        var translations = await _db.Translations
            .Where(t => t.LanguageId == lang.Id)
            .ToDictionaryAsync(t => t.TextKey, t => t.Value, ct);

        return Ok(translations);
    }
}
