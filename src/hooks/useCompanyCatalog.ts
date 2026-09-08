import { useState, useEffect } from 'react'
import { supabase, type CompanyKey, type CatalogProduct, type DbProduct, type DbSubBrand, type DbPackage, type DbBrand } from '../lib/supabase'

interface CatalogState {
  products: CatalogProduct[]
  brands: string[]
  brandLogos: Record<string, string | null>
  loading: boolean
  error: string | null
}

async function fetchAllPages<T>(
  fetcher: (from: number) => Promise<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const PAGE = 1000
  const results: T[] = []
  let from = 0
  while (true) {
    const { data, error } = await fetcher(from)
    if (error || !data) break
    results.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return results
}

export function useCompanyCatalog(company: CompanyKey): CatalogState {
  const [state, setState] = useState<CatalogState>({
    products: [],
    brands: [],
    brandLogos: {},
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    async function load() {
      try {
        const [products, subBrands, packages, brands] = await Promise.all([
          fetchAllPages<DbProduct>(from =>
            supabase.from('products').select('*')
              .eq(company, true)
              .eq('channel_restricted', false)
              .eq('data_complete', true)
              .eq('status', 'Active')
              .range(from, from + 999)
          ),
          fetchAllPages<DbSubBrand>(from =>
            supabase.from('sub_brands').select('*').range(from, from + 999)
          ),
          fetchAllPages<DbPackage>(from =>
            supabase.from('packages').select('*').range(from, from + 999)
          ),
          fetchAllPages<DbBrand>(from =>
            supabase.from('brands').select('*').range(from, from + 999)
          ),
        ])

        if (cancelled) return

        const subMap = Object.fromEntries(subBrands.map(s => [s.id, s]))
        const pkgMap = Object.fromEntries(packages.map(p => [p.id, p]))
        const brandLogoMap: Record<string, string | null> = {}
        const brandCategoryMap: Record<string, string | null> = {}
        for (const b of brands) {
          brandLogoMap[b.description] = b.brand_logo_web_url
          brandCategoryMap[b.description] = b.category ?? null
        }

        const catalogProducts: CatalogProduct[] = products
          .map(p => {
            const sub = subMap[p.sub_id]
            const pkg = pkgMap[p.container_type_id]
            if (!sub || !pkg) return null
            return {
              sku: p.id,
              upc: p.retail_upc,
              description: p.description,
              brand: sub.brand,
              brandLogo: brandLogoMap[sub.brand] ?? null,
              category: brandCategoryMap[sub.brand] ?? null,
              flavor: sub.flavor,
              packageName: pkg.package,
              packageDescription: pkg.description,
              packageId: pkg.id,
              material: pkg.material,
              size: pkg.size,
              consumableUnitsPerCase: parseInt(pkg.consumable_units_per_case) || 0,
              imageUrl: p.image_web_url,
              isNew: p.new ?? false,
              isSeasonal: p.seasonal ?? false,
            } satisfies CatalogProduct
          })
          .filter(Boolean) as CatalogProduct[]

        const brandSet = [...new Set(catalogProducts.map(p => p.brand))].sort()

        setState({
          products: catalogProducts,
          brands: brandSet,
          brandLogos: brandLogoMap,
          loading: false,
          error: null,
        })
      } catch (e) {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: String(e) }))
      }
    }

    load()
    return () => { cancelled = true }
  }, [company])

  return state
}
