import { api } from "../../lib/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserInfo,
} from "./auth.types";

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", req);
  return data;
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", req);
  return data;
}

export async function me(): Promise<UserInfo> {
  const { data } = await api.get<UserInfo>("/auth/me");
  return data;
}
