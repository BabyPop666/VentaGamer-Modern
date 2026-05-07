import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";

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
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);

  const canBackup = hasPermission("backup.manage");
  const canIntegrity = hasPermission("integrity.check");

  if (!canBackup && !canIntegrity) {
    return <p className="text-red-600">No tenes permisos para esta pagina.</p>;
  }

  const backupsQ = useQuery({
    queryKey: ["backups"],
    queryFn: async () => (await api.get<BackupFile[]>("/maintenance/backups")).data,
    enabled: canBackup,
  });

  const createBackupMut = useMutation({
    mutationFn: async () => (await api.post<BackupFile>("/maintenance/backup")).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backups"] }),
    onError: (err) => setError(toApiError(err).message),
  });

  const checkIntegrityMut = useMutation({
    mutationFn: async () => (await api.get<IntegrityReport>("/maintenance/integrity")).data,
    onSuccess: (data) => setIntegrityReport(data),
    onError: (err) => setError(toApiError(err).message),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Mantenimiento</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
          <button className="ml-2" onClick={() => setError(null)}>x</button>
        </div>
      )}

      {canBackup && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Backups de la BD</h2>
            <button
              onClick={() => createBackupMut.mutate()}
              disabled={createBackupMut.isPending}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
            >
              {createBackupMut.isPending ? "Creando..." : "Crear backup"}
            </button>
          </div>

          {backupsQ.isLoading && <p>Cargando...</p>}
          {backupsQ.data && backupsQ.data.length === 0 && (
            <p className="text-slate-500 text-sm">No hay backups todavia.</p>
          )}

          {backupsQ.data && backupsQ.data.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="text-left p-2">Archivo</th>
                  <th className="text-right p-2">Tamano</th>
                  <th className="text-left p-2">Fecha (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backupsQ.data.map((b) => (
                  <tr key={b.filePath}>
                    <td className="p-2 font-mono text-xs">{b.fileName}</td>
                    <td className="p-2 text-right">{(b.sizeBytes / 1024).toFixed(1)} KB</td>
                    <td className="p-2 text-xs">
                      {new Date(b.createdAtUtc).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-xs text-slate-400">
            Los backups se guardan dentro del contenedor SQL Server en{" "}
            <code className="bg-slate-100 px-1 rounded">/var/opt/mssql/data/backups</code>.
          </p>
        </section>
      )}

      {canIntegrity && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Integridad (HMAC-SHA256)</h2>
            <button
              onClick={() => checkIntegrityMut.mutate()}
              disabled={checkIntegrityMut.isPending}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
            >
              {checkIntegrityMut.isPending ? "Verificando..." : "Verificar ahora"}
            </button>
          </div>

          {integrityReport && (
            <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm space-y-1">
              <p>
                <span className="text-slate-500">Calculado:</span>{" "}
                <span className="font-mono">{integrityReport.computedAtUtc}</span>
              </p>
              <p>
                <span className="text-slate-500">Filas verificadas:</span>{" "}
                <b>{integrityReport.totalRowsChecked}</b>
              </p>
              <p>
                <span className="text-slate-500">Discrepancias:</span>{" "}
                <b
                  className={
                    integrityReport.mismatches === 0 ? "text-green-700" : "text-red-700"
                  }
                >
                  {integrityReport.mismatches}
                </b>
              </p>
              {integrityReport.findings.length > 0 && (
                <ul className="mt-2 text-xs">
                  {integrityReport.findings.map((f, i) => (
                    <li key={i} className="text-red-600">
                      [{f.table}] row {f.rowId}: {f.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Reemplaza el sistema legacy DVH/DVV por HMAC-SHA256 estandar de la industria.
          </p>
        </section>
      )}
    </div>
  );
}
