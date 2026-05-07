import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { GlitchText } from "../components/ui/GlitchText";
import { Panel } from "../components/ui/Panel";

type Step = "request" | "sent";

export function PasswordResetPage() {
  const [step, setStep] = useState<Step>("request");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    // El endpoint todavía no existe (deuda técnica registrada).
    // Simulamos envío visual mientras tanto.
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("sent");
  }

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2 gap-10 items-center -mt-4">
      <div className="hidden lg:flex flex-col gap-6 max-w-lg">
        <div className="font-mono text-[0.7rem] uppercase tracking-widest2 text-neon-cyan">
          // PASSWORD_RECOVERY
        </div>
        <h1 className="font-display font-black uppercase text-6xl leading-[0.95]">
          ¿Pass <br />
          <GlitchText className="text-neon-cyan text-glow-cyan">olvidada</GlitchText>?
        </h1>
        <p className="text-fg-muted text-lg">
          Pasa. A todos nos pasó. Te ayudamos a recuperar el acceso a tu avatar
          en pocos pasos.
        </p>
        <div className="font-mono text-xs text-fg-dim space-y-1 border-l border-neon-cyan/40 pl-4">
          <div>STEP_01 · ingresá tu user</div>
          <div>STEP_02 · respondé pregunta de seguridad</div>
          <div>STEP_03 · creá una pass nueva</div>
          <div className="text-neon-cyan">STEP_04 · vuelta al juego</div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
        <Panel corners glow padding="lg" className="animate-rise">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan mb-2">
            $ auth --recover
          </div>
          <h2 className="h-display text-3xl mb-1">Recuperar acceso</h2>

          {step === "request" && (
            <>
              <p className="text-fg-muted text-sm mb-6">
                Ingresá tu nombre de jugador. Te vamos a guiar para reestablecer
                el acceso.
              </p>

              <form onSubmit={onSubmit} className="space-y-4">
                <Field label="Nombre de jugador" required>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input font-mono"
                    placeholder="player.handle"
                    autoFocus
                  />
                </Field>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="!w-full !py-3"
                >
                  {loading ? "PROCESANDO..." : "▶ ENVIAR INSTRUCCIONES"}
                </Button>
              </form>
            </>
          )}

          {step === "sent" && (
            <div className="py-4 space-y-4">
              <div className="border border-neon-green/50 bg-neon-green/5 p-4">
                <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-green mb-1">
                  [OK] REQUEST_RECEIVED
                </div>
                <p className="text-sm">
                  Si <span className="font-mono text-neon-cyan">{username}</span>{" "}
                  existe en nuestro arcade, vas a recibir las instrucciones para
                  reestablecer la contraseña.
                </p>
              </div>

              <p className="text-fg-muted text-sm">
                ¿No te llega? Revisá la consola de admin o pedile al{" "}
                <Link to="/help" className="text-neon-cyan hover:underline">
                  soporte
                </Link>{" "}
                que active la recuperación manual.
              </p>

              <Link to="/login" className="btn btn-ghost !w-full">
                ← Volver a login
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-line text-center text-xs font-mono uppercase tracking-widest2">
            <Link to="/login" className="text-fg-muted hover:text-neon-cyan">
              ← LOGIN
            </Link>
            <span className="mx-3 text-fg-dim">·</span>
            <Link to="/register" className="text-fg-muted hover:text-neon-magenta">
              + REGISTRARSE
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
