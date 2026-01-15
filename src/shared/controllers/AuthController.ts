// ==========================================
// AUTH CONTROLLER - Controlador para operaciones de autenticación
// ==========================================

import { BaseController } from './BaseController';
import { createClientForServer, createClientForRoute } from '@/lib/supabase';
import { z } from 'zod';

const SignupSchema = z.object({
  storeName: z.string().min(2, 'El nombre de la tienda debe tener al menos 2 caracteres'),
  subdomain: z.string().min(3, 'El subdominio debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9]+$/, 'El subdominio solo puede contener letras minúsculas y números'),
  ownerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export class AuthController extends BaseController {

  async signup(request: Request) {
    try {
      console.log('🚀 AUTH CONTROLLER - Signup iniciado');
      
      // 1. Parsear y validar datos
      const body = await request.json();
      console.log('📥 Datos recibidos:', {
        storeName: body.storeName,
        subdomain: body.subdomain,
        ownerName: body.ownerName,
        email: body.email,
        passwordLength: body.password?.length || 0
      });

      const validation = SignupSchema.safeParse(body);
      if (!validation.success) {
        return this.sendValidationError(validation.error.issues[0]?.message || 'Error de validación');
      }

      const validatedData = validation.data;
      console.log('✅ Validación exitosa:', {
        ...validatedData,
        password: '[HIDDEN]'
      });

      // 2. Obtener clientes centralizados
      const supabaseAdmin = createClientForServer(); // Service role para operaciones admin
      const supabaseAuth = createClientForRoute(); // Para operaciones de auth

      // 3. Verificar subdominio único
      const { data: existingTenant, error: checkError } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('subdomain', validatedData.subdomain)
        .single();

      if (existingTenant) {
        return this.sendConflict('El subdominio ya está en uso. Por favor elige otro.');
      }

      // 4. ORDEN: 1️⃣ Crear tenant primero
      console.log('🏢 Step 1: Creando tenant');
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
        return this.sendError('Error al crear el tenant: ' + (tenantError?.message || 'Unknown error'));
      }

      console.log('✅ REGLA 1 CUMPLIDA: Tenant creado', tenantData.id);

      // 5. ORDEN: 2️⃣ Crear auth user
      console.log('🔑 Step 2: Creando auth user');
      const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
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
        // Rollback tenant
        await supabaseAdmin.from('tenants').delete().eq('id', tenantData.id);
        return this.sendError('Error al crear el usuario: ' + authError.message);
      }

      console.log('✅ REGLA 2 CUMPLIDA: Auth user creado', authData.user.id);

      // 6. ORDEN: 3️⃣ Verificar trigger en public.users
      console.log('🔍 Step 3: Verificando trigger');
      
      // Delay para trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: userRecord, error: userCheckError } = await supabaseAdmin
        .from('users')
        .select('id, email, tenant_id, role')
        .eq('id', authData.user.id)
        .single();

      if (userCheckError || !userRecord) {
        console.log('⚠️ Trigger falló, creación manual');
        
        const { error: manualUserError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            email: validatedData.email,
            tenant_id: tenantData.id,
            role: 'admin'
          });

        if (manualUserError) {
          return this.sendError('Error crítico: No se pudo crear el registro de usuario');
        }
        
        console.log('✅ REGLA 3 CUMPLIDA: Usuario creado manualmente');
      } else {
        console.log('✅ REGLA 3 CUMPLIDA: Usuario creado por trigger');
      }

      // 7. Crear sesión
      const { data: session, error: sessionError } = await supabaseAuth.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (sessionError) {
        return this.sendError('Cuenta creada pero error al iniciar sesión. Por favor intenta manualmente.');
      }

      console.log('🎉 VERIFICACIÓN FINAL: 3/3 REGLAS CUMPLIDAS');

      // 8. Respuesta exitosa
      return this.sendSuccess({
        user: {
          id: authData.user.id,
          email: validatedData.email,
          name: validatedData.ownerName,
          role: 'admin',
        },
        tenant: {
          id: tenantData.id,
          name: tenantData.name,
          subdomain: tenantData.subdomain,
        },
        auth: {
          token: session.session?.access_token,
          refreshToken: session.session?.refresh_token,
        }
      }, '✅ 3/3 REGLAS CUMPLIDAS: Tenant y usuario creados exitosamente');

    } catch (error) {
      console.error('AuthController error:', error);
      return this.sendError('Error interno del servidor');
    }
  }

  async login(request: Request) {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return this.sendValidationError('Email y password son requeridos');
      }

      const supabaseAuth = createClientForRoute();
      
      const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return this.sendUnauthorized('Credenciales inválidas');
      }

      // Obtener tenant info
      const supabaseAdmin = createClientForServer();
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('tenant_id, role')
        .eq('id', authData.user.id)
        .single();

      if (!userData) {
        return this.sendNotFound('Usuario no encontrado en el sistema');
      }

      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id, name, subdomain')
        .eq('id', userData.tenant_id)
        .single();

      return this.sendSuccess({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: userData.role,
          tenant_id: userData.tenant_id,
        },
        tenant: {
          id: tenant?.id,
          name: tenant?.name,
          subdomain: tenant?.subdomain,
        },
        auth: {
          token: authData.session?.access_token,
          refreshToken: authData.session?.refresh_token,
        }
      }, 'Login exitoso');

    } catch (error) {
      console.error('AuthController login error:', error);
      return this.sendError('Error interno del servidor');
    }
  }
}