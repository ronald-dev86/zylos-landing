import { createClient } from '@/infrastructure/supabase-client/client';
import type { User, AuthResponse } from '@zylos/shared-types';

export class AuthService {
  private supabase = createClient();

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
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
          *,
          tenants:tenant_id (
            id,
            name,
            subdomain
          )
        `)
        .eq('id', data.user?.id)
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: 'Error al obtener información del usuario',
        };
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        tenant_id: userData.tenant_id,
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };

      return {
        success: true,
        data: {
          user,
          tenant: userData.tenants,
          auth: {
            token: data.session?.access_token || '',
            refreshToken: data.session?.refresh_token || '',
            expiresAt: data.session?.expires_at?.toString() || null,
            type: 'bearer',
          },
          redirectUrl: `https://${userData.tenants?.subdomain}.zylos.com/dashboard`,
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

      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('tenant_data');

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
          *,
          tenants:tenant_id (
            id,
            name,
            subdomain
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        return null;
      }

      return {
        id: userData.id,
        email: userData.email,
        tenant_id: userData.tenant_id,
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
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
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    const tenantData = localStorage.getItem('tenant_data');

    return {
      token,
      user: userData ? JSON.parse(userData) : null,
      tenant: tenantData ? JSON.parse(tenantData) : null,
    };
  }

  isAuthenticated(): boolean {
    const { token } = this.getStoredAuthData();
    return !!token;
  }
}

export const authService = new AuthService();