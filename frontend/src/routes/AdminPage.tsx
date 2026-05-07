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
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { Field } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";

type Tab = "roles" | "users";

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission("roles.read") && !hasPermission("users.register")) {
    return (
      <EmptyState
        icon="⊘"
        title="Acceso restringido"
        description="No tenés permisos para acceder a la consola de administración."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// CONSOLA_ADMIN"
        title="Administración"
        subtitle="Roles, permisos y usuarios del sistema"
      />

      <div className="border-b border-line flex gap-1">
        {hasPermission("roles.read") && (
          <button
            onClick={() => setTab("roles")}
            className={`tab ${tab === "roles" ? "tab-active" : ""}`}
          >
            Roles · Permisos
          </button>
        )}
        {hasPermission("users.register") && (
          <button
            onClick={() => setTab("users")}
            className={`tab ${tab === "users" ? "tab-active" : ""}`}
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

  if (rolesQ.isLoading || permsQ.isLoading) return <Spinner />;
  if (!rolesQ.data || !permsQ.data)
    return <EmptyState icon="⚠" title="Error al cargar" />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="border border-neon-red/60 bg-neon-red/5 px-4 py-2 font-mono text-xs text-neon-red flex items-center justify-between">
          <span>&gt; {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="font-mono text-xs text-fg-muted">
          {rolesQ.data.length} roles configurados
        </p>
        {canWrite && (
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            + Nuevo rol
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {rolesQ.data.map((role) => (
          <Panel key={role.id} corners padding="md" className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg">{role.name}</h3>
                {role.description && (
                  <p className="text-fg-muted text-sm">{role.description}</p>
                )}
              </div>
              {canWrite && (
                <div className="flex flex-col gap-1 text-right">
                  <button
                    onClick={() => setEditing(role)}
                    className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan hover:text-glow-cyan"
                  >
                    [editar]
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Eliminar rol "${role.name}"?`))
                        delMut.mutate(role.id);
                    }}
                    className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-red hover:text-glow-magenta"
                  >
                    [eliminar]
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {role.permissionIds.map((pid) => {
                const p = permsQ.data!.find((x) => x.id === pid);
                return p ? (
                  <Chip key={pid} tone="cyan">
                    {p.code}
                  </Chip>
                ) : null;
              })}
              {role.permissionIds.length === 0 && (
                <span className="font-mono text-xs text-fg-dim">
                  (sin permisos)
                </span>
              )}
            </div>

            {role.parentRoleIds.length > 0 && (
              <div className="font-mono text-xs text-fg-muted border-t border-line pt-2">
                <span className="text-neon-magenta">↳ HEREDA:</span>{" "}
                {role.parentRoleIds
                  .map((pid) => rolesQ.data!.find((r) => r.id === pid)?.name)
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </Panel>
        ))}
      </div>

      {(creating || editing) && (
        <RoleEditor
          role={editing}
          allRoles={rolesQ.data}
          allPermissions={permsQ.data}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["roles"] });
          }}
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
  const [permIds, setPermIds] = useState<Set<number>>(
    new Set(role?.permissionIds ?? [])
  );
  const [parentIds, setParentIds] = useState<Set<number>>(
    new Set(role?.parentRoleIds ?? [])
  );
  const [saving, setSaving] = useState(false);

  const togglePerm = (id: number) =>
    setPermIds((s) => {
      const ns = new Set(s);
      ns.has(id) ? ns.delete(id) : ns.add(id);
      return ns;
    });
  const toggleParent = (id: number) =>
    setParentIds((s) => {
      const ns = new Set(s);
      ns.has(id) ? ns.delete(id) : ns.add(id);
      return ns;
    });

  async function save() {
    setSaving(true);
    try {
      if (isEdit) {
        await updateRole(role!.id, {
          description,
          permissionIds: [...permIds],
          parentRoleIds: [...parentIds],
        });
      } else {
        if (!name.trim()) {
          onError("Nombre requerido");
          setSaving(false);
          return;
        }
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      title={isEdit ? `EDITAR · ${role!.name}` : "NUEVO ROL"}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <Field label="Nombre" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </Field>
        )}
        <Field label="Descripción">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </Field>

        <Field label={`Permisos (${permIds.size}/${allPermissions.length})`}>
          <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto border border-line p-2 bg-ink-900/40">
            {allPermissions.map((p) => {
              const checked = permIds.has(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-2 px-2 py-1 cursor-pointer text-sm transition-colors ${
                    checked
                      ? "bg-neon-cyan/10 text-neon-cyan"
                      : "hover:bg-ink-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePerm(p.id)}
                    className="accent-neon-cyan"
                  />
                  <span className="font-mono text-xs">{p.code}</span>
                </label>
              );
            })}
          </div>
        </Field>

        <Field label="Roles padre (jerarquía Composite)">
          <div className="flex flex-wrap gap-2">
            {allRoles
              .filter((r) => r.id !== role?.id)
              .map((r) => {
                const checked = parentIds.has(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleParent(r.id)}
                    className={`px-2 py-1 border font-mono text-xs uppercase tracking-widest2 transition-colors ${
                      checked
                        ? "border-neon-magenta text-neon-magenta bg-neon-magenta/5"
                        : "border-line text-fg-muted hover:border-neon-magenta/40"
                    }`}
                  >
                    {checked ? "↳" : "+"} {r.name}
                  </button>
                );
              })}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const usersQ = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const rolesQ = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  const blockMut = useMutation({
    mutationFn: ({ id, blocked }: { id: number; blocked: boolean }) =>
      setUserBlocked(id, blocked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
  const roleMut = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      changeUserRole(userId, roleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  if (usersQ.isLoading || rolesQ.isLoading) return <Spinner />;
  if (!usersQ.data || !rolesQ.data)
    return <EmptyState icon="⚠" title="Error al cargar" />;

  return (
    <Panel padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-cyber">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Idioma</th>
              <th>Creado</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usersQ.data.map((u) => (
              <tr key={u.id}>
                <td className="font-display font-semibold">{u.username}</td>
                <td>
                  <select
                    value={
                      rolesQ.data!.find((r) => r.name === u.roleName)?.id ?? ""
                    }
                    onChange={(e) =>
                      roleMut.mutate({
                        userId: u.id,
                        roleId: Number(e.target.value),
                      })
                    }
                    className="input !py-1 !text-xs"
                  >
                    {rolesQ.data!.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <Chip tone="muted">{u.languageCode}</Chip>
                </td>
                <td className="font-mono text-xs text-fg-muted">
                  {new Date(u.createdAtUtc).toLocaleDateString()}
                </td>
                <td>
                  {u.isBlocked ? (
                    <Chip tone="red">BLOQUEADO</Chip>
                  ) : (
                    <Chip tone="green">ACTIVO</Chip>
                  )}
                </td>
                <td className="text-right">
                  <button
                    onClick={() =>
                      blockMut.mutate({ id: u.id, blocked: !u.isBlocked })
                    }
                    className={`font-mono text-[0.65rem] uppercase tracking-widest2 ${
                      u.isBlocked
                        ? "text-neon-green hover:text-glow-cyan"
                        : "text-neon-red hover:text-glow-magenta"
                    }`}
                  >
                    [{u.isBlocked ? "desbloquear" : "bloquear"}]
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
