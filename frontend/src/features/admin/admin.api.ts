import { api } from "../../lib/api";

export type Role = {
  id: number;
  name: string;
  description: string;
  permissionIds: number[];
  parentRoleIds: number[];
};

export type Permission = {
  id: number;
  code: string;
  description: string;
};

export type AdminUser = {
  id: number;
  username: string;
  roleName: string;
  isBlocked: boolean;
  languageCode: string;
  createdAtUtc: string;
};

export const getRoles = async (): Promise<Role[]> => (await api.get<Role[]>("/admin/roles")).data;
export const getPermissions = async (): Promise<Permission[]> => (await api.get<Permission[]>("/admin/permissions")).data;
export const getUsers = async (): Promise<AdminUser[]> => (await api.get<AdminUser[]>("/admin/users")).data;

export const createRole = async (req: { name: string; description: string; permissionIds: number[]; parentRoleIds: number[] }) =>
  (await api.post<Role>("/admin/roles", req)).data;

export const updateRole = async (id: number, req: { description: string; permissionIds: number[]; parentRoleIds: number[] }) =>
  (await api.put<Role>(`/admin/roles/${id}`, req)).data;

export const deleteRole = async (id: number) => api.delete(`/admin/roles/${id}`);

export const setUserBlocked = async (id: number, isBlocked: boolean) =>
  api.put(`/admin/users/${id}/blocked`, { isBlocked });

export const changeUserRole = async (userId: number, roleId: number) =>
  api.put(`/admin/users/${userId}/role`, { roleId });
