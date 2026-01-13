import { z } from 'zod'

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  subdomain: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  tenant_id: z.string().uuid(),
  role: z.enum(['super_admin', 'admin', 'vendedor', 'contador']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  sku: z.string().min(1).max(50),
  price: z.number().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const InventoryMovementSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  product_id: z.string().uuid(),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().nonnegative(),
  reason: z.string().optional(),
  reference_id: z.string().uuid().optional(),
  created_at: z.string().datetime()
})

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const LedgerEntrySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  entity_type: z.enum(['customer', 'supplier']),
  entity_id: z.string().uuid(),
  type: z.enum(['credit', 'debit']),
  amount: z.number().nonnegative(),
  description: z.string().optional(),
  reference_id: z.string().uuid().optional(),
  created_at: z.string().datetime()
})

export type Tenant = z.infer<typeof TenantSchema>
export type User = z.infer<typeof UserSchema>
export type Product = z.infer<typeof ProductSchema>
export type InventoryMovement = z.infer<typeof InventoryMovementSchema>
export type Customer = z.infer<typeof CustomerSchema>
export type Supplier = z.infer<typeof SupplierSchema>
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>