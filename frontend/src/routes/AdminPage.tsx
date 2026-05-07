import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  changeUserRole,
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  getUsers,
  setUserBlocked,
  updateRole,
  type Role,
} from "../features/admin/admin.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";

type Tab = "roles" | "users";

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission("roles.read") && !hasPermission("users.register")) {
    return <p className="text-red-600">No tenes permisos para esta pagina.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-900">Administracion</h1>

      <div className="border-b border-slate-200 flex gap-1">
        {hasPermission("roles.read") && (
          <button
            onClick={() => setTab("roles")}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === "roles" ? "border-brand-600 text-brand-700 font-semibold" : "border-transparent text-slate-500"
            }`}
          >
            Roles y permisos
          </button>
        )}
        {hasPermission("users.register") && (
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === "users" ? "border-brand-600 text-brand-700 font-semibold" : "border-transparent text-slate-500"
            }`}
          >
            Usuarios
          </button>
        )}
      </div>

      {tab === "roles" && <RolesTab />}
      {tab === "users" && <UsersTab />}
    </div>
  );
}

function RolesTab() {
  const qc = useQueryClient();
  const rolesQ = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const permsQ = useQuery({ queryKey: ["permissions"], queryFn: getPermissions });
  const canWrite = useAuthStore((s) => s.hasPermission("roles.write"));

  const [editing, setEditing] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delMut = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
    onError: (err) => setError(toApiError(err).message),
  });

  if (rolesQ.isLoading || permsQ.isLoading) return <p>Cargando...</p>;
  if (!rolesQ.data || !permsQ.data) return <p className="text-red-600">Error</p>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
          <button className="ml-2" onClick={() => setError(null)}>x</button>
        </div>
      )}

      {canWrite && (
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded text-sm"
        >
          + Nuevo rol
        </button>
      )}

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {rolesQ.data.map((role) => (
          <div key={role.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{role.name}</h3>
                <p className="text-xs text-slate-500">{role.description}</p>
              </div>
              {canWrite && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(role)}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Eliminar rol "${role.name}"?`)) delMut.mutate(role.id);
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {role.permissionIds.map((pid) => {
                const p = permsQ.data!.find((x) => x.id === pid);
                return p ? (
                  <span key={pid} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                    {p.code}
                  </span>
                ) : null;
              })}
              {role.permissionIds.length === 0 && (
                <span className="text-xs text-slate-400">(sin permisos)</span>
              )}
            </div>
            {role.parentRoleIds.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Hereda de:{" "}
                {role.parentRoleIds
                  .map((pid) => rolesQ.data!.find((r) => r.id === pid)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <RoleEditor
          role={editing}
          allRoles={rolesQ.data}
          allPermissions={permsQ.data}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); qc.invalidateQueries({ queryKey: ["roles"] }); }}
          onError={setError}
        />
      )}
    </div>
  );
}

function RoleEditor({
  role,
  allRoles,
  allPermissions,
  onClose,
  onSaved,
  onError,
}: {
  role: Role | null;
  allRoles: Role[];
  allPermissions: { id: number; code: string; description: string }[];
  onClose: () => void;
  onSaved: () => void;
  onError: (e: string) => void;
}) {
  const isEdit = !!role;
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permIds, setPermIds] = useState<Set<number>>(new Set(role?.permissionIds ?? []));
  const [parentIds, setParentIds] = useState<Set<number>>(new Set(role?.parentRoleIds ?? []));

  const togglePerm = (id: number) =>
    setPermIds((s) => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const toggleParent = (id: number) =>
    setParentIds((s) => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });

  async function save() {
    try {
      if (isEdit) {
        await updateRole(role!.id, {
          description,
          permissionIds: [...permIds],
          parentRoleIds: [...parentIds],
        });
      } else {
        if (!name.trim()) { onError("Nombre requerido"); return; }
        await createRole({
          name: name.trim(),
          description,
          permissionIds: [...permIds],
          parentRoleIds: [...parentIds],
        });
      }
      onSaved();
    } catch (e) {
      onError(toApiError(e).message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">{isEdit ? `Editar ${role!.name}` : "Nuevo rol"}</h2>
        </div>
        <div className="p-6 space-y-4">
          {!isEdit && (
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Descripcion</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Permisos</label>
            <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto border rounded p-2 bg-slate-50">
              {allPermissions.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs hover:bg-white rounded px-1 py-0.5">
                  <input
                    type="checkbox"
                    checked={permIds.has(p.id)}
                    onChange={() => togglePerm(p.id)}
                  />
                  <span className="font-mono">{p.code}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Roles padre (hereda permisos)</label>
            <div className="flex flex-wrap gap-2">
              {allRoles
                .filter((r) => r.id !== role?.id)
                .map((r) => (
                  <label key={r.id} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={parentIds.has(r.id)}
                      onChange={() => toggleParent(r.id)}
                    />
                    {r.name}
                  </label>
                ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm">Cancelar</button>
          <button
            onClick={save}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const usersQ = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const rolesQ = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  const blockMut = useMutation({
    mutationFn: ({ id, blocked }: { id: number; blocked: boolean }) => setUserBlocked(id, blocked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
  const roleMut = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => changeUserRole(userId, roleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  if (usersQ.isLoading || rolesQ.isLoading) return <p>Cargando...</p>;
  if (!usersQ.data || !rolesQ.data) return <p className="text-red-600">Error</p>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="text-left p-3">Usuario</th>
            <th className="text-left p-3">Rol</th>
            <th className="text-left p-3">Idioma</th>
            <th className="text-left p-3">Creado</th>
            <th className="text-left p-3">Estado</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {usersQ.data.map((u) => (
            <tr key={u.id}>
              <td className="p-3 font-medium">{u.username}</td>
              <td className="p-3">
                <select
                  value={rolesQ.data!.find((r) => r.name === u.roleName)?.id ?? ""}
                  onChange={(e) => roleMut.mutate({ userId: u.id, roleId: Number(e.target.value) })}
                  className="text-sm border border-slate-300 rounded px-2 py-0.5"
                >
                  {rolesQ.data!.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </td>
              <td className="p-3 font-mono text-xs">{u.languageCode}</td>
              <td className="p-3 text-xs text-slate-500">{new Date(u.createdAtUtc).toLocaleDateString()}</td>
              <td className="p-3">
                {u.isBlocked ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Bloqueado</span>
                ) : (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Activo</span>
                )}
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => blockMut.mutate({ id: u.id, blocked: !u.isBlocked })}
                  className="text-xs text-brand-600 hover:underline"
                >
                  {u.isBlocked ? "Desbloquear" : "Bloquear"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
