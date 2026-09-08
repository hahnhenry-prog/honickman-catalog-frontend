import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://pzuhltmamzdlqxjjkrov.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dWhsdG1hbXpkbHF4amprcm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDAzOTIsImV4cCI6MjEwNDExNjM5Mn0.qzbg5hHzx5gTmVFrlos3NzUzxql4Wf8lnE9yWAvxHSo'

export const supabase = createClient(url, key)

export type CompanyKey = 'pcny' | 'pnb' | 'cddv' | 'cdp'

export const VALID_COMPANIES: CompanyKey[] = ['pcny', 'pnb', 'cddv', 'cdp']

export interface DbProduct {
  id: string
  description: string
  sub_id: string
  container_type_id: string
  channel_restricted: boolean
  pcny: boolean
  pnb: boolean
  cddv: boolean
  cdp: boolean
  status: string
  image_full_url: string | null
  image_web_url: string | null
  retail_upc: string | null
  data_complete: boolean
  new: boolean | null
  seasonal: boolean | null
}

export interface DbSubBrand {
  id: string
  description: string
  brand: string
  flavor: string
  status: string
}

export interface DbPackage {
  id: string
  description: string
  package: string
  size: string
  material: string
  retail_units_per_case: string
  consumable_units_per_case: string
  status: string
}

export interface DbBrand {
  id: string
  description: string
  brand_logo_url: string | null
  brand_logo_web_url: string | null
  category: string | null
  status: string
}

export interface CatalogProduct {
  sku: string
  upc: string | null
  description: string
  brand: string
  brandLogo: string | null
  category: string | null
  flavor: string
  packageName: string
  packageDescription: string
  packageId: string
  size: string
  material: string
  consumableUnitsPerCase: number
  imageUrl: string | null
  isNew: boolean
  isSeasonal: boolean
}
