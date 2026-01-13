export interface TenantContext {
  id: string
  name: string
  subdomain: string
}

export interface AuthUser {
  id: string
  email: string
  tenant_id: string
  role: 'super_admin' | 'admin' | 'vendedor' | 'contador'
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}