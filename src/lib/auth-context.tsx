"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite-client';
import { clearStoredAuth, persistStoredAuth, readStoredAuth } from '@/lib/auth-storage';

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  slug?: string;
  isDemo?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  isDemo: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage on client side
  useEffect(() => {
    const { token: storedToken, user: storedUser, invalidated } = readStoredAuth();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }

    if (invalidated) {
      console.log('Stored auth cleared because Appwrite context changed');
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = (newToken: string, newUser: User) => {
    // Save to state
    setToken(newToken);
    setUser(newUser);
    
    // Save to localStorage
    persistStoredAuth(newToken, JSON.stringify(newUser));
    
    console.log('Auth context: Login successful');
  };

  // Logout function
  const logout = async () => {
    try {
      // Delete current session with Appwrite
      await account.deleteSession('current');
    } catch (error) {
      console.error('Failed to delete Appwrite session:', error);
    }
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    clearStoredAuth();
    
    // Redirect to home page
    router.push('/');
    console.log('Auth context: Logout successful');
  };

  // Check if current user is demo
  const isDemo = user?.email === 'demo@etiketa.wine' || user?.isDemo === true;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isDemo }}>
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
    if (!isLoading && !token) {
      console.log('useRequireAuth: No token found, redirecting to', redirectTo);
      router.push(redirectTo);
    }
  }, [isLoading, token, router, redirectTo]);

  return { user, token, isLoading };
}
