using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VentaGamer.Application.Ai;
using VentaGamer.Application.Settings;

namespace VentaGamer.Infrastructure.Ai;

/// <summary>
/// Cliente HTTP a Ollama. Lee URL y modelo desde SystemSettings (BD) en cada request,
/// con fallback a appsettings.json. Permite cambiar la URL en runtime sin reiniciar
/// (mismo patron que ConfiguracionSistema en InventarioApp).
/// </summary>
public class OllamaClient
{
    private readonly HttpClient _http;
    private readonly OllamaOptions _opts;
    private readonly ISystemSettingService _settings;
    private readonly ILogger<OllamaClient> _log;
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public OllamaClient(HttpClient http, IOptions<OllamaOptions> opts, ISystemSettingService settings, ILogger<OllamaClient> log)
    {
        _http = http;
        _opts = opts.Value;
        _settings = settings;
        _log = log;
    }

    public async Task<string> GetEffectiveBaseUrlAsync(CancellationToken ct = default)
        => (await _settings.GetOrDefaultAsync(SettingKeys.AiBaseUrl, _opts.BaseUrl, ct)).TrimEnd('/');

    public async Task<string> GetEffectiveModelAsync(CancellationToken ct = default)
        => await _settings.GetOrDefaultAsync(SettingKeys.AiModel, _opts.Model, ct);

    public async Task<bool> IsAvailableAsync(CancellationToken ct = default)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(3));
            var url = await GetEffectiveBaseUrlAsync(ct);
            using var res = await _http.GetAsync($"{url}/api/tags", cts.Token);
            return res.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _log.LogDebug("Ollama no disponible: {Msg}", ex.Message);
            return false;
        }
    }

    public record TagInfo(string Name, long Size);
    public record TagsResponse(List<TagInfo> Models);

    public async Task<List<string>?> ListModelsAsync(CancellationToken ct = default)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));
            var url = await GetEffectiveBaseUrlAsync(ct);
            using var res = await _http.GetAsync($"{url}/api/tags", cts.Token);
            if (!res.IsSuccessStatusCode) return null;
            var json = await res.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("models", out var arr)) return new();
            var names = new List<string>();
            foreach (var m in arr.EnumerateArray())
                if (m.TryGetProperty("name", out var n) && n.GetString() is { } s) names.Add(s);
            return names;
        }
        catch { return null; }
    }

    public record OllamaMessage(string Role, string Content, List<OllamaToolCall>? ToolCalls = null);
    public record OllamaToolCall(OllamaToolFunction Function);
    public record OllamaToolFunction(string Name, JsonElement Arguments);
    public record OllamaChatChunk(string? TokenDelta, OllamaMessage? FinalMessage, bool Done);

    public async IAsyncEnumerable<OllamaChatChunk> ChatStreamAsync(
        IEnumerable<OllamaMessage> messages,
        IEnumerable<object>? tools,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        var url = await GetEffectiveBaseUrlAsync(ct);
        var model = await GetEffectiveModelAsync(ct);

        var payload = new
        {
            model,
            messages = messages.Select(m => m.ToolCalls is { Count: > 0 }
                ? (object)new { role = m.Role, content = m.Content, tool_calls = m.ToolCalls }
                : new { role = m.Role, content = m.Content }),
            tools,
            stream = true,
            options = new { temperature = _opts.Temperature }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, $"{url}/api/chat")
        {
            Content = JsonContent.Create(payload, options: JsonOpts)
        };

        using var res = await _http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
        res.EnsureSuccessStatusCode();

        await using var stream = await res.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        var fullContent = new System.Text.StringBuilder();
        List<OllamaToolCall>? finalToolCalls = null;
        string finalRole = "assistant";

        while (!reader.EndOfStream && !ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);
            if (string.IsNullOrWhiteSpace(line)) continue;

            JsonDocument doc;
            try { doc = JsonDocument.Parse(line); }
            catch (JsonException ex) { _log.LogWarning(ex, "Linea Ollama no parseable: {Line}", line); continue; }

            using (doc)
            {
                var root = doc.RootElement;
                var done = root.TryGetProperty("done", out var d) && d.GetBoolean();

                if (root.TryGetProperty("message", out var msg))
                {
                    if (msg.TryGetProperty("role", out var rr) && rr.GetString() is { } r) finalRole = r;

                    string? token = null;
                    if (msg.TryGetProperty("content", out var cc) && cc.GetString() is { } c)
                    {
                        token = c;
                        fullContent.Append(c);
                    }

                    if (msg.TryGetProperty("tool_calls", out var tc) && tc.ValueKind == JsonValueKind.Array)
                    {
                        finalToolCalls = new();
                        foreach (var call in tc.EnumerateArray())
                        {
                            if (call.TryGetProperty("function", out var fn))
                            {
                                var name = fn.TryGetProperty("name", out var nn) ? nn.GetString() ?? "" : "";
                                var argsEl = fn.TryGetProperty("arguments", out var aa) ? aa.Clone() : default;
                                finalToolCalls.Add(new OllamaToolCall(new OllamaToolFunction(name, argsEl)));
                            }
                        }
                    }

                    if (!string.IsNullOrEmpty(token))
                        yield return new OllamaChatChunk(token, null, false);
                }

                if (done)
                {
                    var finalMsg = new OllamaMessage(finalRole, fullContent.ToString(), finalToolCalls);
                    yield return new OllamaChatChunk(null, finalMsg, true);
                    yield break;
                }
            }
        }
    }
}
