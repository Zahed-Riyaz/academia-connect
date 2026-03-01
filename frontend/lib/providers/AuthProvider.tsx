'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { setAccessToken } from '../api/client';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try silent refresh to restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.access);
        const userRes = await usersApi.getMe();
        setUser(userRes.data);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.data.access);
    const userRes = await usersApi.getMe();
    setUser(userRes.data);
  };

  const logout = async () => {
    try {
      await authApi.logout(''); // refresh token is in the cookie
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
