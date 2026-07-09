import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../features/auth/auth.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { GlitchText } from "../components/ui/GlitchText";
import { Panel } from "../components/ui/Panel";

function passwordStrength(p: string): { label: string; pct: number; tone: "red" | "magenta" | "cyan" | "green" } {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  const map: Record<number, ReturnType<typeof passwordStrength>> = {
    0: { label: "VACÍO", pct: 0, tone: "red" },
    1: { label: "DÉBIL", pct: 20, tone: "red" },
    2: { label: "BÁSICO", pct: 40, tone: "magenta" },
    3: { label: "ACEPTABLE", pct: 60, tone: "magenta" },
    4: { label: "FUERTE", pct: 80, tone: "cyan" },
    5: { label: "EPIC", pct: 100, tone: "green" },
  };
  return map[score] ?? map[0];
}

export function RegisterPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [language, setLanguage] = useState("es");
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim()) return setError("Elegí un nombre de jugador.");
    if (password.length < 8) return setError("Mínimo 8 caracteres en la contraseña.");
    if (mismatch) return setError("Las contraseñas no coinciden.");
    if (!accept) return setError("Tenés que aceptar los términos para continuar.");

    setLoading(true);
    try {
      const res = await register({
        username: username.trim(),
        password,
        languageCode: language,
      });
      setSession({
        token: res.accessToken,
        expiresAtUtc: res.expiresAtUtc,
        user: res.user,
      });
      navigate("/");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center -mt-4">
      {/* LEFT — incentives */}
      <div className="hidden lg:flex flex-col gap-6 max-w-lg">
        <div className="font-mono text-[0.7rem] uppercase tracking-widest2 text-neon-magenta">
          // NEW_PLAYER_REGISTRATION
        </div>
        <h1 className="font-display font-black uppercase text-6xl leading-[0.95]">
          Crea tu <br />
          <GlitchText className="text-neon-magenta text-glow-magenta">avatar</GlitchText>
        </h1>
        <p className="text-fg-muted text-lg">
          Una cuenta = inventario, historial, descuentos por nivel y acceso al
          drop semanal.
        </p>
        <ul className="space-y-2 text-sm">
          {[
            "Carrito persistente cross-device",
            "Historial de loot + comprobantes PDF",
            "Bonificaciones de nivel automático",
            "Acceso a categorías exclusivas",
          ].map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="text-neon-cyan font-mono text-xs mt-1">[+]</span>
              <span className="text-fg-muted">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT — form */}
      <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
        <Panel corners glow padding="lg" className="animate-rise">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta mb-2">
            $ register --new
          </div>
          <h2 className="h-display text-3xl mb-1">Crear cuenta</h2>
          <p className="text-fg-muted text-sm mb-6">
            Te llevamos 30 segundos. No necesitás email para empezar.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label="Nombre de jugador"
              required
              hint="solo letras y números"
            >
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input font-mono"
                placeholder="player.handle"
                autoFocus
              />
            </Field>

            <Field label="Contraseña" required hint="mín 8 caracteres">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input font-mono"
                placeholder="••••••••"
              />
              {password && (
                <div className="mt-2">
                  <div className="h-1 bg-ink-700 overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength.tone === "green"
                          ? "bg-neon-green"
                          : strength.tone === "cyan"
                          ? "bg-neon-cyan"
                          : strength.tone === "magenta"
                          ? "bg-neon-magenta"
                          : "bg-neon-red"
                      }`}
                      style={{
                        width: `${strength.pct}%`,
                        boxShadow: "0 0 10px currentColor",
                      }}
                    />
                  </div>
                  <div
                    className={`mt-1 font-mono text-[0.6rem] uppercase tracking-widest2 ${
                      strength.tone === "green"
                        ? "text-neon-green"
                        : strength.tone === "cyan"
                        ? "text-neon-cyan"
                        : strength.tone === "magenta"
                        ? "text-neon-magenta"
                        : "text-neon-red"
                    }`}
                  >
                    PWR LV · {strength.label}
                  </div>
                </div>
              )}
            </Field>

            <Field
              label="Repetir contraseña"
              required
              error={mismatch ? "no coincide" : undefined}
            >
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input font-mono"
                placeholder="••••••••"
              />
            </Field>

            <Field label="Idioma">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </Field>

            <label className="flex items-start gap-3 text-sm font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                className="accent-neon-cyan mt-1"
              />
              <span className="text-fg-muted">
                Acepto los <Link to="/help#tos" className="text-neon-cyan hover:underline">términos del arcade</Link> y entiendo que mi data se guarda con HMAC-SHA256.
              </span>
            </label>

            {error && (
              <div className="border border-neon-red/60 bg-neon-red/5 px-3 py-2 font-mono text-xs text-neon-red animate-shake-x">
                &gt; {error}
              </div>
            )}

            <Button
              type="submit"
              variant="magenta"
              loading={loading}
              className="!w-full !py-3"
            >
              {loading ? "REGISTRANDO..." : "▶ CREAR AVATAR"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-line text-center text-xs font-mono uppercase tracking-widest2 text-fg-muted">
            ¿Ya jugás?{" "}
            <Link to="/login" className="text-neon-cyan hover:text-glow-cyan">
              INICIAR SESIÓN →
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
