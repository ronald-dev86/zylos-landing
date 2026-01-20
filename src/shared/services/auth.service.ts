import { createClient } from '@/infrastructure/supabase-client/client';
import { clearSignupCookie, getSignupCookie } from '@/shared/utils/signupCookie';
import type { User, AuthResponse } from '@zylos/shared-types';
import { Tenant } from '../types/schemas';

export class AuthService {
  private supabase = createClient();

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign in with email and password     
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Get user and tenant information
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select(`
          id,
          email,
          tenant_id,
          role,
          created_at,
          updated_at,
          tenants:tenant_id (
            id,
            name,
            subdomain
          )
        `)
        .eq('id', data.user?.id)
        .single();

    if (userError) {
      console.error('User query error:', userError);
      return {
        success: false,
        error: 'Error al obtener información del usuario',
      };
    }

    if (!userData) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

      const user: User = {
        id: (userData as any).id,
        email: (userData as any).email,
        tenant_id: (userData as any).tenant_id,
        role: (userData as any).role,
        created_at: (userData as any).created_at,
        updated_at: (userData as any).updated_at,
      };

      return {
        success: true,
        data: {
          user,
          tenant: (userData as any).tenants,
          auth: {
            token: data.session?.access_token || '',
            refreshToken: data.session?.refresh_token || '',
            expiresAt: data.session?.expires_at?.toString() || null,
            type: 'bearer',
          },
          redirectUrl: `http://${(userData as any).tenants?.subdomain}.localhost:3001/`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error interno del servidor',
      };
    }
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      
      // Clear signup cookies
      clearSignupCookie();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión',
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      const { data: userData, error } = await this.supabase
        .from('users')
        .select(`
          id,
          email,
          tenant_id,
          role,
          created_at,
          updated_at,
          tenants:tenant_id (
            id,
            name,
            subdomain
          )
        `)
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !userData) {
        return null;
      }

      return {
        id: (userData as any).id,
        email: (userData as any).email,
        tenant_id: (userData as any).tenant_id,
        role: (userData as any).role,
        created_at: (userData as any).created_at,
        updated_at: (userData as any).updated_at,
      };
    } catch (error) {
      return null;
    }
  }

  saveAuthData(authResponse: AuthResponse): void {
    if (authResponse.success && authResponse.data) {
      localStorage.setItem('auth_token', authResponse.data.auth?.token || '');
      localStorage.setItem('user_data', JSON.stringify(authResponse.data.user));
      localStorage.setItem('tenant_data', JSON.stringify(authResponse.data.tenant));
    }
  }

  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('tenant_data');
  }

  getStoredAuthData(): {
    token: string | null;
    user: User | null;
    tenant: any | null;
  } {
    // Siempre obtener token desde localStorage (solo se guarda en login real)
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    const tenantData = localStorage.getItem('tenant_data');

    // Si hay token en localStorage, usar datos de localStorage (login real)
    if (token) {
      return {
        token,
        user: userData ? JSON.parse(userData) : null,
        tenant: tenantData ? JSON.parse(tenantData) : null,
      };
    }

    // Si no hay token, intentar obtener desde cookies de signup (estado post-signup)
    const signupCookie = getSignupCookie();
    if (signupCookie) {
      return {
        token: null, // No hay token en signup cookies
        user: {
          id: signupCookie.user.id,
          email: signupCookie.user.email,
          tenant_id: signupCookie.user.tenant_id || '', // Usar tenant_id del cookie si existe
          role: signupCookie.user.role as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        tenant: {
          ...signupCookie.tenant,
          active: true
        }
      };
    }

    // No hay datos de autenticación
    return {
      token: null,
      user: null,
      tenant: null,
    };
  }

  isAuthenticated(): boolean {
    const { token } = this.getStoredAuthData();
    return !!token;
  }
}

export const authService = new AuthService();