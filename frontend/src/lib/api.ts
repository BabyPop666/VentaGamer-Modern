import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "../features/auth/auth.store";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config as never;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const { token, logout } = useAuthStore.getState();
      if (token) logout();
    }
    return Promise.reject(error);
  }
);

export type ApiError = {
  status: number;
  message: string;
};

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string } | undefined;
    return {
      status: err.response?.status ?? 0,
      message: data?.message ?? data?.error ?? err.message,
    };
  }
  return { status: 0, message: err instanceof Error ? err.message : "Error desconocido" };
}
