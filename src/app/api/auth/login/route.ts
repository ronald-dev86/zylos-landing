import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase-client/client';
import { z } from 'zod';

// Define interfaces inline to avoid shared-types complexity for now
interface User {
  id: string;
  email: string;
  tenant_id: string;
  role: 'super_admin' | 'admin' | 'vendedor' | 'contador';
  created_at: string;
  updated_at: string;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface UserWithTenant extends User {
  tenants: Tenant;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    tenant?: Tenant;
    auth?: {
      token: string;
      refreshToken: string;
      expiresAt: string | null;
      type: string;
    };
    redirectUrl?: string;
  };
  error?: string;
  code?: string;
}

const LoginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = LoginSchema.parse(body);
    
    const supabase = createClient();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Credenciales inválidas. Por favor verifica tu email y contraseña.' 
        },
        { status: 401 }
      );
    }
    
    // Get user information with tenant
    const { data: userData, error: userError } = await supabase
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
      .maybeSingle();

    if (userError) {
      return NextResponse.json(
        { success: false, error: 'Error al obtener información del usuario' },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Type-safe tenant extraction
    const userWithTenant = userData as UserWithTenant;
    const tenant = userWithTenant.tenants;

    // Clear signup cookies since user is now properly logged in
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    const response = NextResponse.json({
      success: true,
      data: {
        user: userData,
        tenant: tenant,
        auth: {
          token: data.session?.access_token || '',
          refreshToken: data.session?.refresh_token || '',
          expiresAt: data.session?.expires_at?.toString() || null,
          type: 'bearer',
        },
        redirectUrl: `https://${tenant?.subdomain || 'app'}.zylos.com/`,
      }
    });

    // Clear signup cookies - user is now properly authenticated
    response.cookies.set('zylos_signup_secure', '', { 
      ...cookieOptions, 
      expires: new Date(0) 
    });
    
    response.cookies.set('zylos_signup_success', '', { 
      ...cookieOptions, 
      expires: new Date(0) 
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Error de validación' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}