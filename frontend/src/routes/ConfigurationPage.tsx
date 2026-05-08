import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../features/auth/auth.store";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { Field } from "../components/ui/Field";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { StatTile } from "../components/ui/StatTile";

export function ConfigurationPage() {
  const { user, hasPermission } = useAuthStore();
  const { i18n } = useTranslation();

  const [theme, setTheme] = useState<"cyber" | "synthwave" | "void">("cyber");
  const [scanlines, setScanlines] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  if (!hasPermission("profile.read")) {
    return (
      <EmptyState
        icon="⊘"
        title="Acceso restringido"
        description="No tenés permisos para ver la configuración."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// CONTROL_PANEL"
        title="Configuración"
        subtitle="Preferencias del jugador y del sistema"
      />

      {/* Sesión */}
      <div className="grid md:grid-cols-3 gap-3">
        <StatTile label="Usuario" value={user?.username ?? "—"} />
        <StatTile label="Rol" value={user?.roleName ?? "—"} tone="magenta" />
        <StatTile
          label="Permisos"
          value={user?.permissions.length ?? 0}
          tone="green"
          hint="claims en el JWT"
        />
      </div>

      {/* Apariencia */}
      <Panel padding="lg" className="space-y-5">
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan">
            // APPEARANCE
          </div>
          <h2 className="h-display text-2xl">Apariencia</h2>
          <p className="text-fg-muted text-sm">
            Configurá el look del HUD. Cambia solo en este dispositivo.
          </p>
        </div>

        <Field label="Tema visual">
          <div className="grid grid-cols-3 gap-2">
            {(["cyber", "synthwave", "void"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-3 py-3 border font-display uppercase text-xs tracking-widest2 transition-all ${
                  theme === t
                    ? "border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-glow-soft"
                    : "border-line text-fg-muted hover:border-neon-cyan/50"
                }`}
              >
                {t === "cyber" && "▣ CYBER"}
                {t === "synthwave" && "◈ SYNTHWAVE"}
                {t === "void" && "● VOID"}
              </button>
            ))}
          </div>
        </Field>

        <ToggleRow
          checked={scanlines}
          onChange={setScanlines}
          label="Scanlines decorativas"
          hint="overlay tipo CRT en paneles"
        />
        <ToggleRow
          checked={reduceMotion}
          onChange={setReduceMotion}
          label="Reducir movimiento"
          hint="desactiva glitch + glow pulse"
        />
        <ToggleRow
          checked={autoRefresh}
          onChange={setAutoRefresh}
          label="Auto-refresh listas"
          hint="recarga cada 30s en bitácora y pedidos"
        />
      </Panel>

      {/* Sistema */}
      <Panel padding="lg" className="space-y-4">
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta">
            // SYSTEM_INFO
          </div>
          <h2 className="h-display text-2xl">Sistema</h2>
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 font-mono text-sm">
          <Row k="Backend" v="ASP.NET Core 8 · Clean Arch" />
          <Row k="Frontend" v="React 18 · Vite · Tailwind 3" />
          <Row k="Auth" v="JWT · PBKDF2 · 60 min" />
          <Row k="Idioma" v={i18n.language.toUpperCase()} />
          <Row k="Rate limit" v="ON" tone="green" />
          <Row k="Integridad" v="HMAC-SHA256" tone="cyan" />
          <Row k="i18n" v="i18next · runtime DB" />
          <Row k="Build" v="0xVG-2026" tone="magenta" />
        </dl>
      </Panel>

      {/* Persistencia */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="font-mono text-xs text-fg-dim">
          [info] Las preferencias se guardan en este dispositivo (localStorage).
          La config a nivel servidor solo cambia desde ConfiguracionSistema.
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => location.reload()}>
            Restaurar
          </Button>
          <Button variant="primary">Guardar preferencias</Button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 px-4 py-3 border border-line cursor-pointer hover:border-neon-cyan/50 transition-colors">
      <div>
        <div className="font-display font-semibold">{label}</div>
        {hint && (
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-fg-dim">
            {hint}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 border transition-colors ${
          checked
            ? "border-neon-cyan bg-neon-cyan/15"
            : "border-line bg-ink-900"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 transition-all ${
            checked
              ? "left-[26px] bg-neon-cyan shadow-glow-soft"
              : "left-0.5 bg-fg-muted"
          }`}
        />
      </button>
    </label>
  );
}

function Row({
  k,
  v,
  tone,
}: {
  k: string;
  v: string;
  tone?: "green" | "cyan" | "magenta";
}) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-2">
      <dt className="text-fg-muted uppercase text-[0.65rem] tracking-widest2">
        {k}
      </dt>
      <dd>
        {tone ? (
          <Chip tone={tone}>{v}</Chip>
        ) : (
          <span className="text-fg">{v}</span>
        )}
      </dd>
    </div>
  );
}
