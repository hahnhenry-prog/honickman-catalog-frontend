import { useState, useEffect } from 'react'
import { supabase, type CompanyKey, type CatalogProduct, type DbProduct, type DbSubBrand, type DbPackage, type DbBrand } from '../lib/supabase'

interface CatalogState {
  products: CatalogProduct[]
  brands: string[]
  brandLogos: Record<string, string | null>
  loading: boolean
  error: string | null
}

/** Rows per round trip. Supabase caps a single response below a full
 *  catalog, so every table is read in pages. */
const PAGE = 1000

/** Transient failures — dropped connection, blocked request, rate limit —
 *  are retried before a load is treated as failed. */
const MAX_ATTEMPTS = 3

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function errorText(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

/**
 * Reads every page of a table.
 *
 * Throws rather than returning whatever it managed to collect. Partial
 * results would render an incomplete catalog that looks entirely normal —
 * no error, no warning, just silently missing products — so neither the
 * customer nor anyone here would have any way to notice.
 */
async function fetchAllPages<T>(
  label: string,
  fetcher: (from: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const results: T[] = []
  let from = 0

  while (true) {
    let page: T[] | null = null
    let lastError: unknown = null

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (attempt > 1) await sleep(250 * 2 ** (attempt - 2)) // 250ms, then 500ms
      const { data, error } = await fetcher(from)
      if (!error && data) { page = data; break }
      lastError = error ?? new Error('request returned no data')
    }

    if (!page) {
      throw new Error(
        `Could not load ${label} (rows ${from}-${from + PAGE - 1}) ` +
        `after ${MAX_ATTEMPTS} attempts: ${errorText(lastError)}`
      )
    }

    results.push(...page)
    if (page.length < PAGE) return results
    from += PAGE
  }
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
          fetchAllPages<DbProduct>('products', from =>
            supabase.from('products').select('*')
              .eq(company, true)
              .eq('channel_restricted', false)
              .eq('data_complete', true)
              .eq('status', 'Active')
              .range(from, from + PAGE - 1)
          ),
          fetchAllPages<DbSubBrand>('sub-brands', from =>
            supabase.from('sub_brands').select('*').range(from, from + PAGE - 1)
          ),
          fetchAllPages<DbPackage>('packages', from =>
            supabase.from('packages').select('*').range(from, from + PAGE - 1)
          ),
          fetchAllPages<DbBrand>('brands', from =>
            supabase.from('brands').select('*').range(from, from + PAGE - 1)
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
        if (!cancelled) setState(s => ({ ...s, loading: false, error: errorText(e) }))
      }
    }

    load()
    return () => { cancelled = true }
  }, [company])

  return state
}
