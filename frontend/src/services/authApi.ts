import { apiGet, apiPost, apiPut } from "@/services/apiClient";
import { setStoredToken, clearAuthStorage } from "@/services/authStorage";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  timezone: string;
  productivityScore: number;
  streak: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  googleRefreshToken?: string | null;
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};

export async function signup(name: string, email: string, password: string): Promise<AuthPayload> {
  const data = await apiPost<AuthPayload>(
    "/auth/signup",
    { name, email, password },
    false,
  );
  setStoredToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const data = await apiPost<AuthPayload>("/auth/login", { email, password }, false);
  setStoredToken(data.token);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  return apiGet<AuthUser>("/auth/me");
}

export async function updateProfile(profile: {
  name?: string;
  avatar?: string;
  timezone?: string;
}): Promise<AuthUser> {
  return apiPut<AuthUser>("/auth/me", profile);
}

export function logoutLocal(): void {
  clearAuthStorage();
}
