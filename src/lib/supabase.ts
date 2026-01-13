import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client (for server-side admin operations)
export function createClientForServer() {
  const cookieStore = cookies()
  
  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    }
  )
}

// Helper to create authenticated client with tenant context
export const createAuthenticatedClient = (req: NextRequest) => {
  const tenantId = req.headers.get('x-tenant-id')
  
  if (!tenantId) {
    throw new Error('Tenant not found in request headers')
  }
  
  // Create client with anon key - auth will be handled via session
  const client = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
      }
    }
  )
  
  return client
}

// Helper to get current tenant from request headers
export const getCurrentTenant = (req?: NextRequest) => {
  if (!req) return null
  const tenantId = req.headers.get('x-tenant-id')
  const tenantName = req.headers.get('x-tenant-name')
  const tenantSubdomain = req.headers.get('x-tenant-subdomain')
  
  if (!tenantId || !tenantName || !tenantSubdomain) {
    return null
  }
  
  return {
    id: tenantId,
    name: tenantName,
    subdomain: tenantSubdomain
  }
}

// API route client (with auth handling)
export function createClientForRoute() {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      }
    }
  )
}