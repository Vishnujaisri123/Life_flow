/**
 * LifeFlow API configuration and shared types.
 * HTTP calls go through apiClient (Axios) in apiClient.ts.
 */

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export { ApiError } from "@/services/apiClient";

export function getApiBaseUrl(): string | null {
  const url = import.meta.env.VITE_API_URL;
  if (!url || typeof url !== "string") return null;
  return url.replace(/\/$/, "");
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl() !== null;
}

export { getStoredToken, setStoredToken, clearAuthStorage } from "@/services/authStorage";
