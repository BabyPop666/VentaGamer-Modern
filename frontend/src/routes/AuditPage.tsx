import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";

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

function inferTone(msg: string): "cyan" | "magenta" | "red" | "green" {
  const m = msg.toUpperCase();
  if (m.includes("DELETE")) return "red";
  if (m.includes("CREATE") || m.includes("INSERT")) return "green";
  if (m.includes("UPDATE") || m.includes("MODIFY")) return "magenta";
  return "cyan";
}

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="// SYSLOG"
        title="Bitácora"
        subtitle="Cada operación crítica del sistema queda registrada automáticamente"
      />

      <Panel padding="md" className="space-y-3">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setApplied(filters);
          }}
        >
          <div className="flex-1 min-w-[200px]">
            <label className="label">Usuario</label>
            <input
              value={filters.username}
              onChange={(e) =>
                setFilters((f) => ({ ...f, username: e.target.value }))
              }
              className="input font-mono"
              placeholder="player.handle"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label">Módulo</label>
            <input
              placeholder="Product · Role · AppUser..."
              value={filters.module}
              onChange={(e) =>
                setFilters((f) => ({ ...f, module: e.target.value }))
              }
              className="input font-mono"
            />
          </div>
          <Button variant="primary" type="submit">
            ▶ Filtrar
          </Button>
          {(applied.username || applied.module) && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setFilters({ username: "", module: "" });
                setApplied({ username: "", module: "" });
                setPage(1);
              }}
            >
              Limpiar
            </Button>
          )}
        </form>
      </Panel>

      {auditQ.isLoading && (
        <div className="py-16 flex justify-center">
          <Spinner label="cargando_bitacora" />
        </div>
      )}

      {auditQ.data && (
        <>
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest2 text-fg-muted">
            <span>
              <span className="text-neon-cyan">{auditQ.data.totalItems}</span>{" "}
              eventos · página {auditQ.data.page} / {auditQ.data.totalPages}
            </span>
            <span className="hidden md:inline">
              <span className="text-neon-green">●</span> stream live
            </span>
          </div>

          {auditQ.data.items.length === 0 ? (
            <EmptyState
              icon="∅"
              title="Sin eventos"
              description="No hay registros con los filtros aplicados."
            />
          ) : (
            <Panel padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-cyber">
                  <thead>
                    <tr>
                      <th>Timestamp UTC</th>
                      <th>Usuario</th>
                      <th>Módulo</th>
                      <th>Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditQ.data.items.map((log) => {
                      const tone = inferTone(log.message);
                      return (
                        <tr key={log.id}>
                          <td className="font-mono text-xs whitespace-nowrap text-fg-muted">
                            {new Date(log.eventUtc)
                              .toISOString()
                              .slice(0, 19)
                              .replace("T", " ")}
                          </td>
                          <td className="font-mono text-xs">
                            {log.username ?? "—"}
                          </td>
                          <td>
                            <Chip tone={tone}>{log.module}</Chip>
                          </td>
                          <td className="font-mono text-xs break-all text-fg">
                            {log.message}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {auditQ.data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2 font-mono text-xs uppercase tracking-widest2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← prev
              </Button>
              <span className="text-neon-cyan">
                PAGE {page.toString().padStart(2, "0")} /{" "}
                {auditQ.data.totalPages.toString().padStart(2, "0")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(auditQ.data!.totalPages, p + 1))
                }
                disabled={page === auditQ.data.totalPages}
              >
                next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
