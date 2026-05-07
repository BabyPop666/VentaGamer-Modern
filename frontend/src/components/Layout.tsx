import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getCart } from "../features/cart/cart.api";
import { useAuthStore } from "../features/auth/auth.store";

export function Layout() {
  const { user, logout, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  const cartQ = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user && hasPermission("cart.use"),
    refetchInterval: false,
  });

  const cartCount =
    cartQ.data?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-brand-900 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link to="/" className="font-bold text-lg flex items-center gap-2">
            <span>🎮</span> VentaGamer
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "font-semibold underline" : "opacity-80 hover:opacity-100"
              }
            >
              Catalogo
            </NavLink>
            {user && hasPermission("cart.use") && (
              <>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    isActive ? "font-semibold underline" : "opacity-80 hover:opacity-100"
                  }
                >
                  Carrito
                  {cartCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center text-xs bg-orange-400 text-white rounded-full px-1.5">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    isActive ? "font-semibold underline" : "opacity-80 hover:opacity-100"
                  }
                >
                  Mis compras
                </NavLink>
              </>
            )}
            {user && (hasPermission("roles.read") || hasPermission("users.register")) && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "font-semibold underline" : "opacity-80 hover:opacity-100"
                }
              >
                Admin
              </NavLink>
            )}
            {user && hasPermission("audit.read") && (
              <NavLink
                to="/audit"
                className={({ isActive }) =>
                  isActive ? "font-semibold underline" : "opacity-80 hover:opacity-100"
                }
              >
                Bitacora
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-brand-50">
                  Hola, <b>{user.username}</b>{" "}
                  <span className="text-xs opacity-70">({user.roleName})</span>
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="px-3 py-1 rounded bg-brand-700 hover:bg-brand-600"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 rounded bg-brand-500 hover:bg-brand-600"
              >
                Iniciar sesion
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <Outlet />
      </main>

      <footer className="bg-slate-100 text-slate-500 text-xs py-3 text-center">
        VentaGamer · Modernizacion · Etapa 4
      </footer>
    </div>
  );
}
