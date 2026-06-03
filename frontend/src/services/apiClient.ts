import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

type AuthAxiosConfig = InternalAxiosRequestConfig & { skipAuth?: boolean };
import { toast } from "sonner";
import { getStoredToken, clearAuthStorage } from "@/services/authStorage";
import type { ApiResponse } from "@/services/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

if (typeof window !== "undefined" && "caches" in window) {
  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";
  caches.open("auth-cache").then((cache) => {
    cache.put("/api-url", new Response(apiUrl));
  });
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authConfig = config as AuthAxiosConfig;
  if (authConfig.skipAuth) return config;
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown> | undefined;
    if (body && typeof body === "object" && "success" in body && body.success === false) {
      const message = body.message || "Request failed";
      return Promise.reject(new ApiError(message, response.status));
    }
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again.";

    if (status === 401) {
      clearAuthStorage();
      onUnauthorized?.();
      const url = error.config?.url ?? "";
      const silentAuth = /\/auth\/(login|signup|me)(\/|$|\?)/.test(url);
      if (!silentAuth) {
        toast.error("Session expired. Please sign in again.");
      }
    }

    return Promise.reject(new ApiError(message, status));
  },
);

function withAuth(auth: boolean): AxiosRequestConfig & { skipAuth?: boolean } {
  return auth ? {} : { skipAuth: true };
}

export async function apiGet<T>(path: string, auth = true): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(path, withAuth(auth));
  const body = res.data;
  if (!body?.success) throw new ApiError(body?.message ?? "Request failed", res.status);
  return body.data;
}

export async function apiPost<T>(path: string, data?: unknown, auth = true): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(path, data, withAuth(auth));
  const body = res.data;
  if (!body?.success) throw new ApiError(body?.message ?? "Request failed", res.status);
  return body.data;
}

export async function apiPut<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(path, data);
  const body = res.data;
  if (!body?.success) throw new ApiError(body?.message ?? "Request failed", res.status);
  return body.data;
}

export async function apiPatch<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiClient.patch<ApiResponse<T>>(path, data);
  const body = res.data;
  if (!body?.success) throw new ApiError(body?.message ?? "Request failed", res.status);
  return body.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(path);
  const body = res.data;
  if (!body?.success) throw new ApiError(body?.message ?? "Request failed", res.status);
  return body.data;
}
