import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/auth.store";

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
        VentaGamer · Modernizacion · Etapa 3
      </footer>
    </div>
  );
}
