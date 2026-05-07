import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
  version: string;
  timestamp: string;
};

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthResponse }
  | { kind: "error"; message: string };

function App() {
  const [health, setHealth] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/health", { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as HealthResponse;
        setHealth({ kind: "ok", data });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setHealth({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      });
    return () => ctrl.abort();
  }, []);

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-10 border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎮</span>
          <h1 className="text-3xl font-bold text-brand-900">VentaGamer</h1>
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 font-mono">
            etapa 0
          </span>
        </div>
        <p className="text-slate-600 mb-8">
          Modernizacion en curso · React + Vite + TypeScript + Tailwind
        </p>

        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Health check del backend
          </h2>
          {health.kind === "loading" && (
            <p className="text-slate-500">Consultando /api/health…</p>
          )}
          {health.kind === "error" && (
            <div className="text-red-600">
              <p className="font-semibold">No se pudo conectar al backend</p>
              <p className="font-mono text-sm mt-1">{health.message}</p>
              <p className="text-sm mt-2 text-slate-600">
                Asegurate de tener el backend corriendo en{" "}
                <code className="bg-white px-1.5 py-0.5 rounded border">
                  http://localhost:5050
                </code>
              </p>
            </div>
          )}
          {health.kind === "ok" && (
            <div className="space-y-1.5">
              <Row label="Estado" value={health.data.status} ok />
              <Row label="Servicio" value={health.data.service} />
              <Row label="Version" value={health.data.version} />
              <Row label="Timestamp" value={health.data.timestamp} />
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Backend Swagger:{" "}
          <a
            href="http://localhost:5050/swagger"
            className="underline hover:text-brand-600"
            target="_blank"
            rel="noreferrer"
          >
            localhost:5050/swagger
          </a>
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 w-24">{label}</span>
      <span
        className={`font-mono text-sm ${
          ok ? "text-green-700 font-semibold" : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default App;
