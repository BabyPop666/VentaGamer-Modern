import { useState } from "react";
import { Link } from "react-router-dom";
import { Chip } from "../components/ui/Chip";
import { GlitchText } from "../components/ui/GlitchText";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";

const FAQ = [
  {
    q: "¿Cómo creo una cuenta?",
    a: "Tocá CREAR AVATAR en el login o entrá a /register. Solo necesitás un nombre de jugador y una contraseña.",
  },
  {
    q: "¿Cómo agrego algo al carrito?",
    a: "Iniciá sesión con un usuario que tenga permiso cart.use, andá al catálogo y tocá + AÑADIR en cualquier producto en stock.",
  },
  {
    q: "¿Por qué no puedo ver el panel de admin?",
    a: "Tu rol no incluye los permisos roles.read o users.register. Pedile al webmaster que te asigne un rol con esos claims.",
  },
  {
    q: "¿Dónde descargo el comprobante?",
    a: "En Mis Pedidos, abrí el detalle de la orden y tocá DESCARGAR PDF. Se genera con QuestPDF en el backend.",
  },
  {
    q: "¿Qué es el check de integridad?",
    a: "Verifica las firmas HMAC-SHA256 de las filas críticas (Users, Roles, Orders). Si algo fue modificado fuera del sistema, lo detecta.",
  },
  {
    q: "¿Por qué se cierra mi sesión sola?",
    a: "El JWT dura 60 minutos. En la próxima etapa se va a sumar refresh token automático.",
  },
];

const SHORTCUTS = [
  { k: "ESC", d: "Cerrar modal abierto" },
  { k: "TAB", d: "Navegar entre campos del formulario" },
  { k: "↵", d: "Confirmar acción primaria" },
  { k: "/ + texto", d: "Búsqueda en catálogo" },
];

export function HelpPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="// MANUAL_DEL_JUGADOR"
        title={<GlitchText className="text-neon-cyan">Ayuda</GlitchText>}
        subtitle="Guía rápida del arcade y soporte técnico"
        accent="cyan"
      />

      {/* Atajos rápidos */}
      <section>
        <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan mb-3">
          // QUICK_LINKS
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { to: "/", t: "Catálogo", d: "Explorar productos" },
            { to: "/cart", t: "Carrito", d: "Tu loot pendiente" },
            { to: "/orders", t: "Mis pedidos", d: "Historial + PDFs" },
            { to: "/login", t: "Login", d: "Acceder con tu cuenta" },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="panel corners px-4 py-4 hover:panel-glow group transition-all"
            >
              <div className="font-display font-bold text-sm group-hover:text-neon-cyan transition-colors">
                {q.t}
              </div>
              <div className="font-mono text-xs text-fg-muted mt-1">{q.d}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta">
              // FAQ
            </div>
            <h2 className="h-display text-3xl">Preguntas frecuentes</h2>
          </div>
          <Chip tone="muted">{FAQ.length} entradas</Chip>
        </div>

        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const open = openIdx === i;
            return (
              <Panel
                key={i}
                padding="none"
                className={open ? "panel-glow" : ""}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                >
                  <span className="font-display font-semibold">{item.q}</span>
                  <span
                    className={`font-mono text-xs uppercase tracking-widest2 transition-colors ${
                      open ? "text-neon-cyan" : "text-fg-muted"
                    }`}
                  >
                    {open ? "[ — ]" : "[ + ]"}
                  </span>
                </button>
                {open && (
                  <div className="px-5 pb-4 text-fg-muted border-t border-line/60 pt-3">
                    {item.a}
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      </section>

      {/* Atajos */}
      <section>
        <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan mb-3">
          // KEYBOARD_SHORTCUTS
        </div>
        <Panel padding="md">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {SHORTCUTS.map((s) => (
              <div key={s.k} className="flex items-center justify-between">
                <kbd className="px-2 py-0.5 border border-line bg-ink-900 font-mono text-xs text-neon-cyan">
                  {s.k}
                </kbd>
                <span className="text-fg-muted text-sm">{s.d}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Soporte */}
      <section id="tos">
        <Panel corners glow padding="lg">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta mb-2">
            // SUPPORT_CHANNEL
          </div>
          <h2 className="h-display text-2xl mb-2">¿Necesitás ayuda humana?</h2>
          <p className="text-fg-muted">
            Escribinos y un webmaster te responde en menos de 24h hábiles.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:soporte@ventagamer.dev"
              className="btn btn-primary"
            >
              ✉ soporte@ventagamer.dev
            </a>
            <a
              href="https://github.com/BabyPop666/VentaGamer-Modern/issues"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              ⌘ Reportar bug en GitHub
            </a>
          </div>
        </Panel>
      </section>
    </div>
  );
}
