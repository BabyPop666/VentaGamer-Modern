import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";
import { StatTile } from "../components/ui/StatTile";

type BackupFile = {
  fileName: string;
  filePath: string;
  sizeBytes: number;
  createdAtUtc: string;
};

type IntegrityFinding = {
  table: string;
  rowId: number;
  reason: string;
};

type IntegrityReport = {
  computedAtUtc: string;
  totalRowsChecked: number;
  mismatches: number;
  findings: IntegrityFinding[];
};

export function MaintenancePage() {
  const qc = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [error, setError] = useState<string | null>(null);
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(
    null
  );

  const canBackup = hasPermission("backup.manage");
  const canIntegrity = hasPermission("integrity.check");

  if (!canBackup && !canIntegrity) {
    return (
      <EmptyState
        icon="⊘"
        title="Acceso restringido"
        description="No tenés permisos para acceder a mantenimiento."
      />
    );
  }

  const backupsQ = useQuery({
    queryKey: ["backups"],
    queryFn: async () =>
      (await api.get<BackupFile[]>("/maintenance/backups")).data,
    enabled: canBackup,
  });

  const createBackupMut = useMutation({
    mutationFn: async () =>
      (await api.post<BackupFile>("/maintenance/backup")).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backups"] }),
    onError: (err) => setError(toApiError(err).message),
  });

  const checkIntegrityMut = useMutation({
    mutationFn: async () =>
      (await api.get<IntegrityReport>("/maintenance/integrity")).data,
    onSuccess: (data) => setIntegrityReport(data),
    onError: (err) => setError(toApiError(err).message),
  });

  const totalSize =
    backupsQ.data?.reduce((s, b) => s + b.sizeBytes, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// SYSTEM_MAINTENANCE"
        title="Mantenimiento"
        subtitle="Backups · Integridad · Operaciones críticas del sistema"
      />

      {error && (
        <div className="border border-neon-red/60 bg-neon-red/5 px-4 py-2 font-mono text-xs text-neon-red flex items-center justify-between">
          <span>&gt; {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {canBackup && (
        <Panel padding="lg" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan">
                // BACKUP_CONTROLLER
              </div>
              <h2 className="h-display text-2xl">Backups de la BD</h2>
            </div>
            <Button
              variant="primary"
              loading={createBackupMut.isPending}
              onClick={() => createBackupMut.mutate()}
            >
              {createBackupMut.isPending ? "GENERANDO..." : "▶ CREAR BACKUP"}
            </Button>
          </div>

          {backupsQ.isLoading && <Spinner label="cargando_backups" />}

          {backupsQ.data && backupsQ.data.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatTile label="Backups" value={backupsQ.data.length} />
                <StatTile
                  label="Volumen total"
                  value={`${(totalSize / 1024 / 1024).toFixed(1)} MB`}
                  tone="magenta"
                />
                <StatTile
                  label="Último"
                  value={
                    new Date(backupsQ.data[0].createdAtUtc).toLocaleDateString()
                  }
                  tone="green"
                  hint={new Date(backupsQ.data[0].createdAtUtc).toLocaleTimeString()}
                />
              </div>

              <Panel padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-cyber">
                    <thead>
                      <tr>
                        <th>Archivo</th>
                        <th className="text-right">Tamaño</th>
                        <th>Fecha (UTC)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupsQ.data.map((b) => (
                        <tr key={b.filePath}>
                          <td className="font-mono text-xs text-neon-cyan break-all">
                            {b.fileName}
                          </td>
                          <td className="text-right font-mono text-xs">
                            {(b.sizeBytes / 1024).toFixed(1)} KB
                          </td>
                          <td className="font-mono text-xs text-fg-muted">
                            {new Date(b.createdAtUtc).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}

          {backupsQ.data && backupsQ.data.length === 0 && (
            <p className="font-mono text-xs text-fg-muted">
              [empty] No hay backups generados todavía.
            </p>
          )}

          <p className="font-mono text-[0.65rem] text-fg-dim border-t border-line pt-3">
            STORAGE ::{" "}
            <code className="text-neon-cyan">/var/opt/mssql/data/backups</code>{" "}
            · contenedor SQL Server
          </p>
        </Panel>
      )}

      {canIntegrity && (
        <Panel padding="lg" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta">
                // INTEGRITY_CHECK
              </div>
              <h2 className="h-display text-2xl">Integridad HMAC-SHA256</h2>
            </div>
            <Button
              variant="magenta"
              loading={checkIntegrityMut.isPending}
              onClick={() => checkIntegrityMut.mutate()}
            >
              {checkIntegrityMut.isPending ? "VERIFICANDO..." : "▶ EJECUTAR CHECK"}
            </Button>
          </div>

          {integrityReport ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatTile
                  label="Filas verificadas"
                  value={integrityReport.totalRowsChecked}
                />
                <StatTile
                  label="Discrepancias"
                  value={integrityReport.mismatches}
                  tone={integrityReport.mismatches === 0 ? "green" : "red"}
                />
                <StatTile
                  label="Calculado"
                  value={
                    new Date(integrityReport.computedAtUtc).toLocaleTimeString()
                  }
                  tone="magenta"
                  hint={new Date(integrityReport.computedAtUtc)
                    .toISOString()
                    .slice(0, 10)}
                />
              </div>

              {integrityReport.mismatches === 0 ? (
                <div className="border border-neon-green/40 bg-neon-green/5 px-4 py-3 font-mono text-sm text-neon-green flex items-center gap-3">
                  <span className="text-lg">✓</span>
                  <span>SYSTEM INTEGRITY OK · Sin alteraciones detectadas.</span>
                </div>
              ) : (
                <Panel padding="md">
                  <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-red mb-2">
                    [!] HALLAZGOS DETECTADOS
                  </div>
                  <ul className="space-y-1 font-mono text-xs">
                    {integrityReport.findings.map((f, i) => (
                      <li key={i} className="text-neon-red">
                        <Chip tone="red" className="mr-2">
                          {f.table}
                        </Chip>
                        row #{f.rowId} — {f.reason}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          ) : (
            <p className="font-mono text-xs text-fg-muted">
              [idle] Ejecutá el check para verificar la firma HMAC-SHA256 de las
              filas críticas.
            </p>
          )}

          <p className="font-mono text-[0.65rem] text-fg-dim border-t border-line pt-3">
            ALG :: <code className="text-neon-magenta">HMAC-SHA256</code> ·
            verificación de integridad de filas críticas
          </p>
        </Panel>
      )}
    </div>
  );
}
