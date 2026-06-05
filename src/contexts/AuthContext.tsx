import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { login as loginService, logout as logoutService, getStoredToken } from '../services/auth';
import { setOnUnauthorized } from '../services/api';

interface AuthUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          setToken(storedToken);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginService(username, password);
    setToken(response.token);
    setUser({
      id: response.id,
      username: response.username,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
    });
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}