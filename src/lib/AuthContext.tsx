import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import * as authService from './supabaseAuth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data, error } = await authService.getCurrentUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    const result = await authService.signUpWithEmail(email, password, fullName);
    setIsLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await authService.signInWithEmail(email, password);
    setIsLoading(false);
    return result;
  };

  const signOut = async () => {
    setIsLoading(true);
    const result = await authService.signOutUser();
    setIsLoading(false);
    return result;
  };

  const resetPassword = async (email: string) => {
    const result = await authService.resetPassword(email);
    return result;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
