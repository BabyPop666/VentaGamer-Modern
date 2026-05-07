import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../features/auth/auth.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { GlitchText } from "../components/ui/GlitchText";
import { Panel } from "../components/ui/Panel";

const DEMO_USERS = [
  { username: "cliente", password: "Cliente123!", role: "USER", desc: "Compra · cart.use" },
  { username: "admin", password: "Admin123!", role: "ADMIN", desc: "Productos · roles" },
  { username: "webmaster", password: "WebMaster123!", role: "WEBMASTER", desc: "Bitacora · backups" },
  { username: "tester", password: "Tester123!", role: "TESTER", desc: "Permisos mix QA" },
];

export function LoginPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const [username, setUsername] = useState("cliente");
  const [password, setPassword] = useState("Cliente123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ username, password });
      setSession({
        token: res.accessToken,
        expiresAtUtc: res.expiresAtUtc,
        user: res.user,
      });
      navigate("/");
    } catch (err) {
      const apiErr = toApiError(err);
      setError(
        apiErr.status === 401
          ? "ACCESO DENEGADO · Credenciales inválidas"
          : apiErr.status === 423
          ? "CUENTA BLOQUEADA · Contactá al administrador"
          : apiErr.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2 gap-10 items-center -mt-4">
      {/* LEFT — branding */}
      <div className="hidden lg:flex flex-col gap-6 max-w-lg">
        <div className="font-mono text-[0.7rem] uppercase tracking-widest2 text-neon-magenta">
          // PLAYER_AUTHENTICATION
        </div>
        <h1 className="font-display font-black uppercase text-6xl leading-[0.95]">
          ¿Quién <br />
          <GlitchText className="text-neon-cyan text-glow-cyan">anda</GlitchText> ahí?
        </h1>
        <p className="text-fg-muted text-lg">
          Identificate para acceder a tu inventario, historial de compras y poderes
          extra del sistema.
        </p>

        <div className="panel corners p-5 mt-2 space-y-3">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan">
            DEMO · QUICK SELECT
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((d) => (
              <button
                key={d.username}
                type="button"
                onClick={() => {
                  setUsername(d.username);
                  setPassword(d.password);
                }}
                className={`text-left px-3 py-2 border transition-all ${
                  username === d.username
                    ? "border-neon-cyan bg-neon-cyan/5 text-neon-cyan shadow-glow-soft"
                    : "border-line hover:border-neon-cyan/60 text-fg"
                }`}
              >
                <div className="font-display font-bold text-xs tracking-widest2">
                  [{d.role}]
                </div>
                <div className="font-mono text-xs mt-0.5">{d.username}</div>
                <div className="text-fg-dim text-[0.65rem] font-mono mt-0.5">
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
        <Panel corners glow padding="lg" className="relative animate-rise">
          <div className="absolute top-3 right-4 font-mono text-[0.6rem] uppercase tracking-widest2 text-neon-cyan animate-glow-pulse">
            ● LIVE
          </div>

          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan mb-2">
            $ login --user
          </div>
          <h2 className="h-display text-3xl mb-1">Iniciar sesión</h2>
          <p className="text-fg-muted text-sm mb-6">
            Acceso autorizado para jugadores registrados.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Usuario" required>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="input font-mono"
                placeholder="player.handle"
              />
            </Field>

            <Field label="Contraseña" required>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input font-mono"
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <div className="border border-neon-red/60 bg-neon-red/5 px-3 py-2 font-mono text-xs text-neon-red animate-shake-x">
                &gt; {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="!w-full !py-3"
            >
              {loading ? "AUTENTICANDO..." : "▶ INSERT COIN"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs font-mono uppercase tracking-widest2">
            <Link to="/register" className="text-neon-cyan hover:text-glow-cyan">
              + REGISTRARSE
            </Link>
            <Link
              to="/password-reset"
              className="text-fg-muted hover:text-neon-magenta"
            >
              ¿OLVIDASTE PASS?
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
