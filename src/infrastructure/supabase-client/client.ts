import { createClient as createSupabaseClient } from '@supabase/supabase-js'
// Database types - simplified for landing
interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          tenant_id: string
          role: 'super_admin' | 'admin' | 'vendedor' | 'contador'
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ⚠️ SERVER-ONLY: Solo debe usarse en API routes
export function createServerClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Client-side function (landing app)
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

//D8MHdnGDCquk4F4X