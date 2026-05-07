import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/auth.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";

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
        <div className="text-xs text-slate-500 mb-6 bg-slate-50 border border-slate-200 rounded p-3">
          <p className="font-semibold text-slate-700 mb-1">Usuarios de prueba</p>
          <ul className="space-y-0.5 font-mono">
            <li>
              <button
                type="button"
                onClick={() => { setUsername("cliente"); setPassword("Cliente123!"); }}
                className="hover:underline text-brand-700"
              >
                cliente / Cliente123!
              </button>{" "}
              <span className="text-slate-400">(rol User · puede comprar)</span>
            </li>
            <li>
              <button
                type="button"
                onClick={() => { setUsername("admin"); setPassword("Admin123!"); }}
                className="hover:underline text-brand-700"
              >
                admin / Admin123!
              </button>{" "}
              <span className="text-slate-400">(rol Admin)</span>
            </li>
            <li>
              <button
                type="button"
                onClick={() => { setUsername("webmaster"); setPassword("WebMaster123!"); }}
                className="hover:underline text-brand-700"
              >
                webmaster / WebMaster123!
              </button>{" "}
              <span className="text-slate-400">(rol WebMaster)</span>
            </li>
            <li>
              <button
                type="button"
                onClick={() => { setUsername("tester"); setPassword("Tester123!"); }}
                className="hover:underline text-brand-700"
              >
                tester / Tester123!
              </button>{" "}
              <span className="text-slate-400">(rol Tester)</span>
            </li>
          </ul>
        </div>

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
