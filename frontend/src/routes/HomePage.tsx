import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCategories, getProducts } from "../features/products/product.api";
import { useAuthStore } from "../features/auth/auth.store";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { Chip } from "../components/ui/Chip";
import { GlitchText } from "../components/ui/GlitchText";
import { ProductImage } from "../components/ui/ProductImage";

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  const featuredQ = useQuery({
    queryKey: ["products", { featured: true }],
    queryFn: () => getProducts({ page: 1, pageSize: 6 }),
  });
  const categoriesQ = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-20">
      {/* HERO */}
      <section className="relative -mx-4 lg:-mx-6 -mt-8 px-4 lg:px-6 pt-12 pb-16 overflow-hidden border-b border-line">
        {/* Hero atmosphere */}
        <div
          aria-hidden
          className="absolute inset-0 bg-grid-faint"
          style={{ backgroundSize: "48px 48px" }}
        />
        <div
          aria-hidden
          className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,240,255,0.35) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,149,0.32) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="stagger">
            <div className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-widest2 text-neon-cyan">
              <span className="w-2 h-2 bg-neon-cyan animate-glow-pulse" />
              SISTEMA OPERATIVO · ARCADE.LIVE
              <span className="text-fg-dim">// 2026 BUILD</span>
            </div>

            <h1 className="font-display font-black uppercase leading-[0.95] mt-4 text-5xl md:text-6xl lg:text-7xl">
              <span className="block">
                INSERT
                <span className="text-neon-cyan text-glow-cyan"> COIN</span>
              </span>
              <span className="block">
                <GlitchText className="text-neon-magenta text-glow-magenta">PRESS</GlitchText>{" "}
                START
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-fg-muted leading-relaxed">
              Tu armería gamer de confianza. Consolas, mandos, periféricos y
              juegos al precio del jugador real. Sin filtros, sin trampas,{" "}
              <span className="text-neon-cyan">sin lag</span>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => (window.location.href = "/")}
                className="!py-3 !px-6 !text-sm"
              >
                ▶ Explorar catálogo
              </Button>
              {!user && (
                <Link to="/register" className="btn btn-magenta !py-3 !px-6 !text-sm">
                  + Crear cuenta
                </Link>
              )}
              <Link to="/help" className="btn btn-ghost !py-3 !px-6 !text-sm">
                ? Cómo funciona
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: "envíos", v: "24/48H" },
                { k: "garantía", v: "1 AÑO" },
                { k: "stock", v: "LIVE" },
              ].map((s) => (
                <div key={s.k} className="border-l border-neon-cyan/40 pl-3">
                  <div className="font-display font-bold text-xl text-neon-cyan">
                    {s.v}
                  </div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-dim">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card art */}
          <div className="relative animate-rise">
            <Panel
              corners
              glow
              padding="none"
              className="aspect-[4/5] max-h-[520px] mx-auto relative overflow-hidden"
            >
              <div className="absolute inset-0 grid-overlay" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(0,240,255,0.18) 0%, transparent 70%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-neon-cyan">
                  PLAYER · 1
                </div>
                <div className="font-display font-black text-[10rem] leading-none text-neon-cyan text-glow-cyan animate-flicker">
                  VG
                </div>
                <div className="text-neon-magenta font-mono text-xs tracking-widest2">
                  // READY
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-muted">
                  <span>HP ████████░░ 80</span>
                  <span className="text-neon-magenta">LV.99</span>
                </div>
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-muted">
                  <span className="text-neon-cyan">[CONNECTED]</span>
                  <span>SCORE · 999.999</span>
                </div>
              </div>
              {/* moving scanline */}
              <div
                className="absolute inset-x-0 h-12 pointer-events-none animate-scan-move"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0,240,255,0.14) 50%, transparent 100%)",
                }}
              />
            </Panel>
            <div className="hidden md:block absolute -bottom-4 -left-4 chip">
              SYS · 200 OK
            </div>
            <div className="hidden md:block absolute -top-4 -right-4 chip chip-magenta">
              ARCADE LIVE
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta">
              // SELECT_CATEGORY
            </div>
            <h2 className="h-display text-3xl">Pasillos del arcade</h2>
          </div>
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-widest2 text-fg-muted hover:text-neon-cyan"
          >
            VER_TODO →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(categoriesQ.data ?? Array(6).fill("")).slice(0, 12).map((c, i) => (
            <Link
              key={c || i}
              to={`/?category=${encodeURIComponent(c)}`}
              className="panel corners px-4 py-6 text-center hover:panel-glow group transition-all"
            >
              <div className="font-display font-bold text-lg group-hover:text-neon-cyan transition-colors">
                {c || "..."}
              </div>
              <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-dim mt-1">
                CAT.{(i + 1).toString().padStart(2, "0")}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan">
              // FEATURED_DROPS
            </div>
            <h2 className="h-display text-3xl">Loot destacado</h2>
          </div>
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-widest2 text-fg-muted hover:text-neon-cyan"
          >
            CATALOGO →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {featuredQ.data?.items.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to="/"
              className="panel corners group overflow-hidden flex flex-col"
              style={{ padding: 0 }}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-ink-800">
                <ProductImage
                  imageUrl={p.imageUrl}
                  category={p.category}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
                <Chip className="absolute top-3 left-3" tone="cyan">
                  {p.category}
                </Chip>
                {p.stock < 5 && p.stock > 0 && (
                  <Chip className="absolute top-3 right-3" tone="magenta">
                    LOW · {p.stock}
                  </Chip>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-display font-semibold text-base line-clamp-2 group-hover:text-neon-cyan transition-colors">
                  {p.title}
                </h3>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-dim">
                      PRICE
                    </div>
                    <div className="font-display font-bold text-2xl text-neon-cyan text-glow-cyan">
                      ${p.price.toFixed(2)}
                    </div>
                  </div>
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-muted">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative -mx-4 lg:-mx-6 px-4 lg:px-6 py-16 border-y border-line bg-grid-strong overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,45,149,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta mb-2">
            // CONTINUE
          </div>
          <h2 className="font-display font-black uppercase text-4xl md:text-5xl">
            ¿Listo para subir de <span className="text-neon-magenta text-glow-magenta">nivel</span>?
          </h2>
          <p className="text-fg-muted mt-4 max-w-xl mx-auto">
            Crea tu cuenta y desbloqueá envíos prioritarios, historial de loot y
            ofertas relámpago.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary !py-3 !px-6">
                  ▶ Crear cuenta
                </Link>
                <Link to="/login" className="btn btn-ghost !py-3 !px-6">
                  Iniciar sesión
                </Link>
              </>
            ) : (
              <Link to="/" className="btn btn-primary !py-3 !px-6">
                ▶ Ir al catálogo
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
