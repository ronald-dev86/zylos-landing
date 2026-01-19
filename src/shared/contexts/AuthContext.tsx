"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@zylos/shared-types';
import { authService } from '@/shared/services/auth.service';
import { getSignupCookie } from '@/shared/utils/signupCookie';

interface AuthContextType {
  user: User | null;
  tenant: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const { token, user: storedUser, tenant: storedTenant } = authService.getStoredAuthData();
      
      // Verificar también cookies de signup para el estado de autenticación
      const signupCookie = getSignupCookie();
      
      if (token && storedUser) {
        setUser(storedUser);
        setTenant(storedTenant);
      } else if (signupCookie) {
        // Si hay cookie de signup, considerar como autenticado para mostrar botón de dashboard
        setUser(signupCookie.user);
        setTenant(signupCookie.tenant);
      } else {
        // Try to get current session from Supabase
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const { user: sessionUser, tenant: sessionTenant } = authService.getStoredAuthData();
          setUser(sessionUser || currentUser);
          setTenant(sessionTenant);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    
    if (result.success) {
      if (result.data) {
        setUser(result.data.user);
        setTenant(result.data.tenant);
        authService.saveAuthData(result);
        
        // Redirect to tenant dashboard
        if (result.data.redirectUrl) {
          window.location.href = result.data.redirectUrl;
        }
      }
      return { success: true };
    }
    
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setTenant(null);
  };

  const value: AuthContextType = {
    user,
    tenant,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}