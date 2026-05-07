import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../features/cart/cart.api";
import { useAuthStore } from "../features/auth/auth.store";
import { LanguageSwitcher } from "./LanguageSwitcher";

type NavItem = {
  to: string;
  label: string;
  show: boolean;
  badge?: number;
  end?: boolean;
};

export function Layout() {
  const { user, logout, hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartQ = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user && hasPermission("cart.use"),
    refetchInterval: false,
  });

  const cartCount = cartQ.data?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const items: NavItem[] = [
    { to: "/", label: t("nav.catalog", "Catalogo"), show: true, end: true },
    {
      to: "/cart",
      label: t("nav.cart", "Carrito"),
      show: !!user && hasPermission("cart.use"),
      badge: cartCount,
    },
    {
      to: "/orders",
      label: t("nav.myOrders", "Mis pedidos"),
      show: !!user && hasPermission("cart.use"),
    },
    {
      to: "/admin/products",
      label: "Productos",
      show: !!user && hasPermission("products.write"),
    },
    {
      to: "/admin/orders",
      label: "Compras",
      show: !!user && hasPermission("orders.read.all"),
    },
    {
      to: "/admin",
      label: t("nav.admin", "Admin"),
      show:
        !!user && (hasPermission("roles.read") || hasPermission("users.register")),
      end: true,
    },
    {
      to: "/audit",
      label: t("nav.audit", "Bitacora"),
      show: !!user && hasPermission("audit.read"),
    },
    {
      to: "/maintenance",
      label: "Mantenimiento",
      show:
        !!user &&
        (hasPermission("backup.manage") || hasPermission("integrity.check")),
    },
    {
      to: "/config",
      label: "Config",
      show: !!user && hasPermission("config.read"),
    },
    { to: "/help", label: "Ayuda", show: true },
  ];

  const visible = items.filter((i) => i.show);

  return (
    <div className="min-h-full flex flex-col">
      {/* HUD top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-900/85 border-b border-line">
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent" />
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <span
              aria-hidden
              className="relative inline-flex items-center justify-center w-9 h-9 border border-neon-cyan text-neon-cyan font-display font-bold text-sm group-hover:shadow-glow-cyan transition-shadow"
              style={{ clipPath: "polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)" }}
            >
              VG
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-neon-magenta animate-glow-pulse" />
            </span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-bold tracking-widest2 text-sm">
                VENTA<span className="text-neon-cyan">.</span>GAMER
              </span>
              <span className="text-[0.55rem] font-mono uppercase tracking-widest2 text-fg-muted mt-0.5">
                arcade · v2.0
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {visible.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative px-3 py-2 font-display text-[0.72rem] tracking-widest2 uppercase transition-colors ${
                    isActive ? "text-neon-cyan" : "text-fg-muted hover:text-fg"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[0.6rem] font-mono font-bold bg-neon-magenta text-ink-900 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <span className="absolute left-2 right-2 -bottom-px h-px bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User block + lang */}
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right leading-tight">
                  <div className="font-display text-sm font-semibold tracking-wider">
                    {user.username}
                  </div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-neon-cyan">
                    [{user.roleName}]
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="btn btn-ghost btn-sm"
                  title="Cerrar sesion"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Ingresar
              </Link>
            )}
            <button
              type="button"
              className="lg:hidden btn btn-ghost btn-sm"
              onClick={() => setMenuOpen((m) => !m)}
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-line bg-ink-900/95 backdrop-blur-md">
            <nav className="px-4 py-3 grid grid-cols-2 gap-1">
              {visible.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 font-display text-xs tracking-widest2 uppercase border ${
                      isActive
                        ? "border-neon-cyan text-neon-cyan bg-neon-cyan/5"
                        : "border-line text-fg-muted"
                    }`
                  }
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 text-neon-magenta">[{item.badge}]</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Status strip */}
        <div className="hidden md:flex items-center gap-6 px-4 lg:px-6 py-1 text-[0.6rem] font-mono uppercase tracking-widest2 text-fg-dim border-t border-line/60 bg-ink-900/60">
          <span className="text-neon-cyan">[ONLINE]</span>
          <span>route::{location.pathname}</span>
          <span className="ml-auto">SYS · 200 OK</span>
          <span className="text-neon-magenta">PWR · 100%</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-16 border-t border-line">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-neon-magenta/60 to-transparent" />
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 grid md:grid-cols-3 gap-6">
          <div>
            <div className="font-display font-bold tracking-widest2 text-sm">
              VENTA<span className="text-neon-cyan">.</span>GAMER
            </div>
            <p className="text-fg-muted text-xs font-mono mt-2 leading-relaxed">
              ARCADE GEAR · CONSOLES · GAMES <br />
              Modernizacion etapa 10 · 2026
            </p>
          </div>
          <div>
            <div className="label">Soporte</div>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/help" className="hover:text-neon-cyan">
                  Ayuda
                </Link>
              </li>
              <li>
                <Link to="/help#faq" className="hover:text-neon-cyan">
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="mailto:soporte@ventagamer.dev"
                  className="hover:text-neon-cyan"
                >
                  soporte@ventagamer.dev
                </a>
              </li>
            </ul>
          </div>
          <div className="md:text-right">
            <div className="label md:justify-end">Sistema</div>
            <p className="font-mono text-[0.65rem] text-fg-dim uppercase tracking-widest2">
              build 0xVG-2026 · core integrity OK <br />
              hmac-sha256 · jwt · clean-arch
            </p>
          </div>
        </div>
        <div className="border-t border-line/60 py-3 text-center text-[0.6rem] font-mono tracking-widest2 uppercase text-fg-dim">
          © 2026 VENTA.GAMER — INSERT COIN TO CONTINUE
        </div>
      </footer>
    </div>
  );
}
