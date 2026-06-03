import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '../services/apiClient';
import { login as authLogin, logout as authLogout, signup as authSignup, getStoredToken } from '../services/authService';

type User = { _id: string; name: string; email: string; xp: number; level: number; streak: number };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredToken().then(async (token) => {
      if (token) {
        try {
          const u = await apiGet<User>('/auth/me');
          setUser(u);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    const u = await authLogin(email, password);
    setUser(u);
  }

  async function signup(name: string, email: string, password: string) {
    const u = await authSignup(name, email, password);
    setUser(u);
  }

  async function logout() {
    await authLogout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
