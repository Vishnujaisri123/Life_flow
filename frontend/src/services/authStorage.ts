/**
 * JWT storage for the LifeFlow SPA.
 *
 * Tradeoffs:
 * - httpOnly cookies are safest against XSS but need a BFF or cookie-based auth flow;
 *   this Vite SPA uses Bearer tokens from the API.
 * - sessionStorage: cleared when the tab closes (preferred here for session-only tokens).
 * - localStorage: survives browser restarts (higher XSS exposure window).
 * - in-memory only: lost on refresh unless re-fetched via /auth/me with a refresh cookie (not implemented).
 *
 * We use sessionStorage plus an in-memory mirror so Axios can read the token synchronously
 * without hitting storage on every request after hydration.
 */

const TOKEN_KEY = "lifeflow_token";

let memoryToken: string | null = null;

export function getStoredToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = sessionStorage.getItem(TOKEN_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export function setStoredToken(token: string | null): void {
  memoryToken = token;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing / blocked storage */
  }
}

export function clearAuthStorage(): void {
  setStoredToken(null);
}
