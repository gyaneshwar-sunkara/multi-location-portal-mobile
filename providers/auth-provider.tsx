import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/lib/types';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  // Clear stale query cache when user logs out
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      queryClient.clear();
    }
  }, [isHydrated, isAuthenticated, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading: !isHydrated,
      user,
      logout,
    }),
    [isAuthenticated, isHydrated, user, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
