"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite-client';

// Define types
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  slug?: string;
  isDemo?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (token: string | null, user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
  isDemo: boolean;
  refreshSession: () => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialToken?: string | null;
};

export function AuthProvider({ children, initialUser = null, initialToken = null }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [token, setToken] = useState<string | null>(initialToken);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!response.ok) {
        setUser(null);
        setToken(null);
        return;
      }

      const data = await response.json();
      setUser(data.user ?? null);
      setToken(data.user ? 'session' : null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialUser && initialToken) {
      setIsLoading(false);
      return;
    }

    refreshSession();
  }, [initialUser, initialToken]);

  // Login function
  const login = (_newToken: string | null, newUser: AuthUser) => {
    setToken('session');
    setUser(newUser);
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (error) {
      console.error('Failed to end server session:', error);
    }

    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Failed to delete Appwrite session:', error);
    }

    setToken(null);
    setUser(null);
    router.push('/');
  };

  // Check if current user is demo
  const isDemo = user?.email === 'demo@etiketa.wine' || user?.isDemo === true;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isDemo, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth check hook - automatically redirects if user is not authenticated
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [isLoading, user, router, redirectTo]);

  return { user, token, isLoading };
}
