import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserInfo } from "./auth.types";

type AuthState = {
  token: string | null;
  expiresAtUtc: string | null;
  user: UserInfo | null;
  setSession: (data: { token: string; expiresAtUtc: string; user: UserInfo }) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAtUtc: null,
      user: null,
      setSession: ({ token, expiresAtUtc, user }) =>
        set({ token, expiresAtUtc, user }),
      logout: () => set({ token: null, expiresAtUtc: null, user: null }),
      hasPermission: (permission) =>
        get().user?.permissions.includes(permission) ?? false,
    }),
    { name: "ventagamer.auth" }
  )
);
