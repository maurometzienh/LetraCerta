import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { clearToken, setToken as persistToken, getToken } from '../services/api';
import type { AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_STORAGE_KEY = 'letracerta:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((token: string, authUser: AuthUser) => {
    persistToken(token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login(email, password);
      persistSession(result.token, result.user);
    },
    [persistSession],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const result = await authService.register(username, email, password);
      persistSession(result.token, result.user);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }
  return context;
}
