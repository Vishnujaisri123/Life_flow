import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMe,
  login as apiLogin,
  logoutLocal,
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
  type AuthUser,
} from "@/services/authApi";
import { getStoredToken, setStoredToken } from "@/services/authStorage";
import { registerUnauthorizedHandler } from "@/services/apiClient";
import { isApiConfigured } from "@/services/api";
import { ROUTES } from "@/routes/paths";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (profile: {
    name?: string;
    avatar?: string;
    timezone?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const apiEnabled = isApiConfigured();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(apiEnabled);

  const logout = useCallback(() => {
    logoutLocal();
    setToken(null);
    setUser(null);
    if (apiEnabled) navigate(ROUTES.login, { replace: true });
  }, [apiEnabled, navigate]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!apiEnabled || !getStoredToken()) {
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      logoutLocal();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [apiEnabled]);

  useEffect(() => {
    if (!apiEnabled) {
      setLoading(false);
      return;
    }
    void refreshUser();
  }, [apiEnabled, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setStoredToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiSignup(name, email, password);
    setToken(data.token);
    setStoredToken(data.token);
    setUser(data.user);
  }, []);

  const updateProfile = useCallback(async (profile: {
    name?: string;
    avatar?: string;
    timezone?: string;
  }) => {
    const updated = await apiUpdateProfile(profile);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: apiEnabled ? Boolean(token && user) : true,
      isDemo: !apiEnabled,
      login,
      signup,
      updateProfile,
      logout,
      refreshUser,
    }),
    [user, token, loading, apiEnabled, login, signup, updateProfile, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
