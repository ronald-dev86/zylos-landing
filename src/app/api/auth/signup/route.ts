import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase-client/client';
import { z } from 'zod';
import { Database, AuthResponse } from '@zylos/shared-types';

const SignupSchema = z.object({
  storeName: z.string().min(2, 'El nombre de la tienda debe tener al menos 2 caracteres'),
  subdomain: z.string().min(3, 'El subdominio debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9]+$/, 'El subdominio solo puede contener letras minúsculas y números'),
  ownerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = SignupSchema.parse(body);
    
    const supabase = createClient();

    // For demo purposes, skip duplicate checks
    // In production, implement proper validation

    // For now, just create the user - tenant creation will be implemented
    // when the database schema is ready
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.ownerName,
          store_name: validatedData.storeName,
          subdomain: validatedData.subdomain,
        }
      }
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: 'Error al crear el usuario: ' + authError.message },
        { status: 500 }
      );
    }

    // Mock tenant data for now
    const tenant = {
      id: 'temp_' + Date.now(),
      name: validatedData.storeName,
      subdomain: validatedData.subdomain,
    };

    const user = {
      id: authData.user?.id,
      email: validatedData.email,
      name: validatedData.ownerName,
      role: 'super_admin',
    };

    // Create session
    const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Error al iniciar sesión' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
        },
        auth: {
          token: session.session?.access_token,
          refreshToken: session.session?.refresh_token,
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
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