import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { GlitchText } from "../components/ui/GlitchText";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] grid place-items-center text-center relative -mt-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-strong opacity-30 pointer-events-none"
        style={{ backgroundSize: "32px 32px" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,45,149,0.18) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-2xl px-6 animate-rise">
        <div className="font-mono text-[0.7rem] uppercase tracking-widest2 text-neon-magenta mb-4 animate-glow-pulse">
          [ ERROR · 0x0404 · NOT_FOUND ]
        </div>

        <div className="font-display font-black text-[10rem] md:text-[14rem] leading-none">
          <GlitchText className="text-neon-cyan text-glow-cyan">404</GlitchText>
        </div>

        <h1 className="h-display text-3xl md:text-4xl mt-2">
          Game Over · Ruta perdida
        </h1>
        <p className="text-fg-muted text-lg mt-3 max-w-md mx-auto">
          La página que buscás se desconectó del servidor o nunca existió en
          este universo.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={() => navigate("/")}>
            ▶ Volver al catálogo
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Atrás
          </Button>
          <Link to="/help" className="btn btn-magenta">
            ? Ayuda
          </Link>
        </div>

        <div className="mt-12 font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-dim">
          INSERT_COIN to retry · SYS_LOG entry created
        </div>
      </div>
    </div>
  );
}
