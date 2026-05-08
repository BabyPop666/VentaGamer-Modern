import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, toApiError } from "../lib/api";
import { useAuthStore } from "../features/auth/auth.store";

type AiConfig = {
  baseUrl: string;
  model: string;
  available: boolean;
  availableModels: string[] | null;
};

type TestResult = {
  available: boolean;
  message?: string;
  sample?: string;
};

export function AiConfigPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const qc = useQueryClient();
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const canRead = hasPermission("roles.write");
  const canWrite = hasPermission("roles.write");

  if (!canRead) {
    return <p className="text-red-500">No tenes permisos para esta pagina.</p>;
  }

  const cfgQ = useQuery({
    queryKey: ["ai-config"],
    queryFn: async () => (await api.get<AiConfig>("/ai/config")).data,
    refetchInterval: false,
  });

  // Cuando cargan los valores actuales, sembrar los inputs
  useQuery({
    queryKey: ["ai-config-seed"],
    queryFn: async () => {
      if (cfgQ.data) {
        if (!baseUrl) setBaseUrl(cfgQ.data.baseUrl);
        if (!model) setModel(cfgQ.data.model);
      }
      return null;
    },
    enabled: !!cfgQ.data,
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {};
      if (baseUrl.trim()) payload.baseUrl = baseUrl.trim();
      if (model.trim()) payload.model = model.trim();
      const { data } = await api.put<AiConfig>("/ai/config", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-config"] });
      qc.invalidateQueries({ queryKey: ["ai-status"] });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    },
  });

  const testMut = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<TestResult>("/ai/config/test", {
        baseUrl: baseUrl.trim(),
      });
      return data;
    },
    onSuccess: (r) => setTestResult(r),
  });

  if (cfgQ.isLoading) return <p className="text-fg-muted">Cargando...</p>;
  if (!cfgQ.data) return <p className="text-red-500">Error</p>;

  const cfg = cfgQ.data;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan">
          // CONFIG · AI_BACKEND
        </div>
        <h1 className="font-display font-black uppercase text-3xl mt-1">
          Configuracion <span className="text-neon-cyan">IA</span>
        </h1>
        <p className="text-fg-muted text-sm mt-1">
          Apunta el bot a un Ollama local o remoto. Mismo patron que InventarioApp:
          persistido en BD, modificable en runtime sin reiniciar.
        </p>
      </div>

      {/* Estado actual */}
      <div className="bg-ink-700/40 border border-line rounded-lg p-4 space-y-2">
        <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-fg-muted">
          ESTADO ACTUAL
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
          <div>
            <div className="text-fg-dim text-xs">BASE_URL</div>
            <div className="text-neon-cyan">{cfg.baseUrl}</div>
          </div>
          <div>
            <div className="text-fg-dim text-xs">MODEL</div>
            <div className="text-neon-cyan">{cfg.model}</div>
          </div>
          <div>
            <div className="text-fg-dim text-xs">CONNECTION</div>
            <div className={cfg.available ? "text-neon-green" : "text-neon-red"}>
              {cfg.available ? "● online" : "○ offline"}
            </div>
          </div>
          <div>
            <div className="text-fg-dim text-xs">MODELOS_DISPONIBLES</div>
            <div className="text-fg">
              {cfg.availableModels?.length ?? 0}{" "}
              {cfg.availableModels && cfg.availableModels.length > 0 && (
                <span className="text-fg-dim text-xs">
                  ({cfg.availableModels.join(", ")})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-3">
        <div>
          <label className="font-mono text-[0.65rem] uppercase tracking-widest2 text-fg-muted block mb-1">
            URL DE OLLAMA
          </label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={!canWrite}
            placeholder="http://localhost:11434  /  http://192.168.1.50:11434"
            className="input font-mono text-sm w-full"
          />
          <p className="text-xs text-fg-dim mt-1 font-mono">
            Si Ollama corre en otra PC de la red, pone la IP+puerto. Sin slash final.
          </p>
        </div>

        <div>
          <label className="font-mono text-[0.65rem] uppercase tracking-widest2 text-fg-muted block mb-1">
            MODELO
          </label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!canWrite}
            placeholder="qwen2.5:7b"
            className="input font-mono text-sm w-full"
          />
          <p className="text-xs text-fg-dim mt-1 font-mono">
            Recomendados con tool calling: <code className="text-neon-cyan">qwen2.5:7b</code>,{" "}
            <code className="text-neon-cyan">llama3.2:3b</code>,{" "}
            <code className="text-neon-cyan">gemma4:31b</code> (igual InventarioApp)
          </p>
          {cfg.availableModels && cfg.availableModels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {cfg.availableModels.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  disabled={!canWrite}
                  className="font-mono text-[0.65rem] px-2 py-0.5 bg-ink-700 hover:bg-neon-cyan/20 hover:text-neon-cyan border border-line rounded"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {canWrite && (
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => testMut.mutate()}
              disabled={!baseUrl.trim() || testMut.isPending}
              className="btn btn-ghost"
            >
              {testMut.isPending ? "Probando..." : "▶ Probar conexion"}
            </button>
            <button
              type="button"
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending}
              className="btn btn-primary"
            >
              {saveMut.isPending ? "Guardando..." : "💾 Guardar"}
            </button>
            {savedFlash && (
              <span className="text-neon-green font-mono text-xs self-center animate-glow-pulse">
                ✓ guardado
              </span>
            )}
          </div>
        )}

        {!canWrite && (
          <p className="text-xs text-fg-dim font-mono">
            (solo lectura: necesitas el permiso roles.write para editar)
          </p>
        )}

        {testResult && (
          <div
            className={`p-3 rounded border text-sm ${
              testResult.available
                ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                : "border-neon-red/40 bg-neon-red/10 text-neon-red"
            }`}
          >
            <div className="font-mono uppercase tracking-widest2 text-xs mb-1">
              {testResult.available ? "[ok] ENDPOINT_VIVO" : "[fail] ENDPOINT_NO_RESPONDE"}
            </div>
            <div className="font-mono text-xs break-all">
              {testResult.message ?? testResult.sample ?? "OK"}
            </div>
          </div>
        )}

        {saveMut.isError && (
          <div className="text-neon-red font-mono text-xs">
            {toApiError(saveMut.error).message}
          </div>
        )}
      </div>

      {/* Help */}
      <details className="bg-ink-700/30 border border-line rounded-lg p-4 text-sm">
        <summary className="cursor-pointer font-mono text-[0.7rem] uppercase tracking-widest2 text-neon-cyan">
          [?] Como instalar Ollama en otra PC
        </summary>
        <div className="mt-3 space-y-2 text-fg-muted font-mono text-xs">
          <p>1. En la PC que va a correr Ollama:</p>
          <pre className="bg-ink-900 p-2 rounded">brew install ollama
brew services start ollama
ollama pull qwen2.5:7b</pre>
          <p>
            2. Por default Ollama escucha en <code>localhost:11434</code> (solo
            esa PC). Para exponerlo a la red:
          </p>
          <pre className="bg-ink-900 p-2 rounded">{`launchctl setenv OLLAMA_HOST 0.0.0.0:11434
brew services restart ollama`}</pre>
          <p>3. Averigua la IP local de esa PC:</p>
          <pre className="bg-ink-900 p-2 rounded">ipconfig getifaddr en0</pre>
          <p>
            4. En este formulario pone <code>http://&lt;esa-ip&gt;:11434</code> y
            click "Probar conexion".
          </p>
        </div>
      </details>
    </div>
  );
}
