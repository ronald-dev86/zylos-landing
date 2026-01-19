import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { Database, AuthResponse } from '@zylos/shared-types';
import { buildTenantUrl } from '@/shared/utils/urlHelper';

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
    console.log('🚀 API SIGNUP - Iniciando proceso');
    const body = await request.json();
    console.log('📥 Datos recibidos:', {
      storeName: body.storeName,
      subdomain: body.subdomain,
      ownerName: body.ownerName,
      email: body.email,
      passwordLength: body.password?.length || 0
    });

    // Validate input
    console.log('🔍 Validando inputs con Zod...');
    const validatedData = SignupSchema.parse(body);
    console.log('✅ Validación Zod exitosa:', {
      ...validatedData,
      password: '[HIDDEN]'
    });
    
    // Use service role key for tenant creation (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Regular client for auth operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if subdomain already exists
    const { data: existingTenant, error: checkError } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('subdomain', validatedData.subdomain)
      .single();

    if (existingTenant) {
      return NextResponse.json(
        { success: false, error: 'El subdominio ya está en uso. Por favor elige otro.' },
        { status: 400 }
      );
    }

    // ✅ ORDEN CORRECTO: 1️⃣ Crear tenant primero (como indicaste)
    console.log('🏢 Step 1: Creando tenant en public.tenants');
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: validatedData.storeName,
        subdomain: validatedData.subdomain,
        active: true
      })
      .select()
      .single();

    if (tenantError || !tenantData) {
      return NextResponse.json(
        { success: false, error: 'Error al crear el tenant: ' + (tenantError?.message || 'Unknown error') },
        { status: 500 }
      );
    }

    console.log('✅ REGLA 1 CUMPLIDA: Tenant creado en public.tenants', tenantData.id);

    // ✅ ORDEN CORRECTO: 2️⃣ Crear auth user segundo
    console.log('🔑 Step 2: Creando auth user con tenant_id en metadata');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          tenant_id: tenantData.id,
          role: 'admin',
          name: validatedData.ownerName,
        }
      }
    });

    console.log('📊 Auth signup result:', {
      authData: authData?.user?.id ? 'User created' : 'No user',
      authError: authError?.message || 'No error'
    });

    if (authError || !authData.user?.id) {
      // Rollback tenant creation if auth fails
      await supabaseAdmin.from('tenants').delete().eq('id', tenantData.id);
      return NextResponse.json(
        { success: false, error: 'Error al crear el usuario: ' + (authError?.message || 'Unknown error') },
        { status: 500 }
      );
    }

    console.log('✅ REGLA 2 CUMPLIDA: Usuario creado en auth.users', authData.user.id);

    // ✅ ORDEN CORRECTO: 3️⃣ Verificar creación en public.users (trigger automático)
    console.log('🔍 Step 3: Verificando trigger en public.users');
    
    // Small delay to allow trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: userRecord, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email, tenant_id, role')
      .eq('id', authData.user.id)
      .single();

    if (userCheckError || !userRecord) {
      console.log('⚠️ Trigger falló, creando usuario manualmente en public.users');
      
      const { error: manualUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: validatedData.email,
          tenant_id: tenantData.id,
          role: 'admin'
        });

      if (manualUserError) {
        console.error('Manual user creation failed:', manualUserError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error crítico: No se pudo crear el registro de usuario. Contacta soporte.',
            details: manualUserError.message 
          },
          { status: 500 }
        );
      }
      
      console.log('✅ REGLA 3 CUMPLIDA: Usuario creado manualmente en public.users');
    } else {
      console.log('✅ REGLA 3 CUMPLIDA: Usuario creado por trigger en public.users');
    }

    const user = {
      id: authData.user.id,
      email: validatedData.email,
      name: validatedData.ownerName,
      role: 'admin',
      tenant_id: tenantData.id
    };

    const tenant = {
      id: tenantData.id,
      name: tenantData.name,
      subdomain: tenantData.subdomain,
      active: tenantData.active
    };

    console.log('🎉 VERIFICACIÓN FINAL: 3/3 REGLAS CUMPLIDAS - Tenant creado exitosamente');

    // Preparar datos para página de éxito (SIN TOKENS)
    const successData = {
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
      redirectUrl: buildTenantUrl(tenant.subdomain, '/login')
    };

    console.log('🎉 VERIFICACIÓN FINAL: 3/3 REGLAS CUMPLIDAS - Tenant creado exitosamente');

    // Crear dos cookies: una HttpOnly (servidor) y una normal (cliente)
    const cookieValue = Buffer.from(JSON.stringify(successData)).toString('base64');
    const isSecure = process.env.NODE_ENV === 'production';
    
    // Cookie HttpOnly (para seguridad - no accesible por JS)
    const httpOnlyCookie = `zylos_signup_secure=${cookieValue}; Max-Age=86400; Path=/; HttpOnly; ${isSecure ? 'Secure; ' : ''}SameSite=Strict`;
    
    // Cookie normal (para acceso por JS en success page)
    const clientCookie = `zylos_signup_success=${cookieValue}; Max-Age=86400; Path=/; ${isSecure ? 'Secure; ' : ''}SameSite=Strict`;

    const response = NextResponse.redirect(
      new URL('/auth/signup/success', request.url),
      { status: 302 }
    );

    // Configurar ambas cookies
    response.headers.set('Set-Cookie', httpOnlyCookie);
    response.headers.append('Set-Cookie', clientCookie);
    
    // Cookie configurada exitosamente
    
    return response;

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