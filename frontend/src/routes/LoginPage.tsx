import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/auth.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";

export function LoginPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin123!");
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
          ? "Credenciales invalidas"
          : apiErr.status === 423
          ? "Usuario bloqueado"
          : apiErr.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-brand-900 mb-1">
          Iniciar sesion
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Usa <code className="bg-slate-100 px-1 rounded">admin</code> /{" "}
          <code className="bg-slate-100 px-1 rounded">Admin123!</code> para
          probar
        </p>

        <label className="block text-sm font-medium mb-1">Usuario</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Contrasena</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-2"
        />

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-2 rounded font-medium mt-2"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
