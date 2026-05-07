import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";

type AuditLog = {
  id: number;
  eventUtc: string;
  module: string;
  message: string;
  userId: number | null;
  username: string | null;
};

type Paged = {
  items: AuditLog[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function AuditPage() {
  const [filters, setFilters] = useState({ username: "", module: "" });
  const [applied, setApplied] = useState({ username: "", module: "" });
  const [page, setPage] = useState(1);

  const auditQ = useQuery({
    queryKey: ["audit", page, applied],
    queryFn: async () => {
      const { data } = await api.get<Paged>("/audit", {
        params: { page, pageSize: 30, ...applied },
      });
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-900">Bitacora</h1>
      <p className="text-sm text-slate-500">
        Cada CREATE, UPDATE o DELETE en entidades clave queda registrado automaticamente.
      </p>

      <form
        className="flex gap-2 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setApplied(filters);
        }}
      >
        <div>
          <label className="block text-xs text-slate-500">Usuario</label>
          <input
            value={filters.username}
            onChange={(e) => setFilters((f) => ({ ...f, username: e.target.value }))}
            className="border border-slate-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Modulo</label>
          <input
            placeholder="Product / Role / AppUser..."
            value={filters.module}
            onChange={(e) => setFilters((f) => ({ ...f, module: e.target.value }))}
            className="border border-slate-300 rounded px-2 py-1 text-sm w-48"
          />
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-1 rounded">
          Filtrar
        </button>
        {(applied.username || applied.module) && (
          <button
            type="button"
            onClick={() => {
              setFilters({ username: "", module: "" });
              setApplied({ username: "", module: "" });
              setPage(1);
            }}
            className="text-sm text-slate-500"
          >
            Limpiar
          </button>
        )}
      </form>

      {auditQ.isLoading && <p>Cargando...</p>}

      {auditQ.data && (
        <>
          <p className="text-xs text-slate-500">
            {auditQ.data.totalItems} eventos · pagina {auditQ.data.page} de {auditQ.data.totalPages}
          </p>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="text-left p-2">Fecha (UTC)</th>
                  <th className="text-left p-2">Usuario</th>
                  <th className="text-left p-2">Modulo</th>
                  <th className="text-left p-2">Mensaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditQ.data.items.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2 font-mono text-xs whitespace-nowrap">
                      {new Date(log.eventUtc).toISOString().slice(0, 19).replace("T", " ")}
                    </td>
                    <td className="p-2">{log.username ?? "-"}</td>
                    <td className="p-2">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-2 text-xs font-mono break-all">{log.message}</td>
                  </tr>
                ))}
                {auditQ.data.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-slate-400">
                      Sin eventos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {auditQ.data.totalPages > 1 && (
            <div className="flex justify-center gap-2 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-3 py-1">
                {page} / {auditQ.data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(auditQ.data!.totalPages, p + 1))}
                disabled={page === auditQ.data.totalPages}
                className="px-3 py-1 border border-slate-300 rounded disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
