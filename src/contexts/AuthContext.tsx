import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import authAPI, { type RegisterDto, type LoginDto } from '../auth/api';

interface User {
  id: number;
  username: string;
  email: string | null;
  role: 'admin' | 'user';
  session_timeout_minutes: number;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  changePassword: (data: {
    old_password: string;
    new_password: string;
  }) => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(ACCESS_TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginDto) => {
    const res = await authAPI.login(data);
    setToken(res.tokens.access_token);
    localStorage.setItem(ACCESS_TOKEN_KEY, res.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refresh_token);
    setUser(res.user);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }, []);

  const register = useCallback(async (data: RegisterDto) => {
    await authAPI.register(data);
    // Auto-login after successful registration
    await login({ username: data.username, password: data.password });
  }, [login]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      await authAPI.logout(refreshToken ?? undefined);
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error('No refresh token');
    const res = await authAPI.refresh(refreshToken);
    setToken(res.tokens.access_token);
    localStorage.setItem(ACCESS_TOKEN_KEY, res.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.tokens.refresh_token);
  }, []);

  const changePassword = useCallback(async (data: {
    old_password: string;
    new_password: string;
  }) => {
    await authAPI.changePassword(data);
  }, []);

  const checkSession = useCallback(async () => {
    if (!token) return;
    try {
      const u = await authAPI.me();
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      // Session invalid — try refresh
      try {
        await refresh();
      } catch {
        await logout();
      }
    }
  }, [token, refresh, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refresh,
        changePassword,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
