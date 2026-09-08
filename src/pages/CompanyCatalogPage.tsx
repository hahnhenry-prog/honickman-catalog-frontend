import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Navigate, useSearchParams } from 'react-router'
import { useCompanyCatalog } from '../hooks/useCompanyCatalog'
import { VALID_COMPANIES, type CompanyKey, type CatalogProduct } from '../lib/supabase'

// ── Size sorting ─────────────────────────────────────────────────────────────

function sizeToOz(size: string): number {
  const s = size.trim()
  let m: RegExpMatchArray | null

  if ((m = s.match(/^([\d.]+)\s*oz$/i)))   return parseFloat(m[1])
  if ((m = s.match(/^([\d.]+)\s*L$/i)))    return parseFloat(m[1]) * 33.814
  if ((m = s.match(/^([\d.]+)\s*mL$/i)))   return parseFloat(m[1]) * 0.033814
  if ((m = s.match(/^([\d.]+)\s*fl\s*oz$/i))) return parseFloat(m[1])
  if ((m = s.match(/^([\d.]+)\s*gal$/i)))  return parseFloat(m[1]) * 128
  if ((m = s.match(/^([\d.]+)\s*pt$/i)))   return parseFloat(m[1]) * 16
  if ((m = s.match(/^([\d.]+)\s*qt$/i)))   return parseFloat(m[1]) * 32
  if ((m = s.match(/^([\d.]+)\s*cl$/i)))   return parseFloat(m[1]) * 0.33814
  // bare number fallback
  const bare = parseFloat(s)
  return isNaN(bare) ? Infinity : bare
}

// ── Single-select dropdown ───────────────────────────────────────────────────

function SingleSelect({ label, value, options, onChange }: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const active = value !== ''
  return (
    <div className="relative shrink-0 flex items-center border-b-2 transition-colors duration-200"
      style={{ borderBottomColor: active ? '#2ea3f2' : 'transparent' }}>
      <span className="text-[13px] tracking-[0.08em] uppercase font-medium pointer-events-none select-none pr-1"
        style={{ color: active ? '#242424' : '#666666' }}>
        {label}
      </span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full">
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="pointer-events-none"
        style={{ color: active ? '#2ea3f2' : '#666666' }}>
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── Grouped multi-select (for Package filter) ────────────────────────────────

function GroupedMultiSelect({ label, selected, groups, onChange }: {
  label: string
  selected: string[]
  groups: { material: string; sizes: string[] }[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const active = selected.length > 0

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])
  }

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        onClick={() => { if (btnRef.current) setRect(btnRef.current.getBoundingClientRect()); setOpen(v => !v) }}
        className="flex items-center gap-1 border-b-2 transition-colors duration-200"
        style={{ borderBottomColor: active ? '#2ea3f2' : 'transparent' }}
      >
        <span className="text-[13px] tracking-[0.08em] uppercase font-medium select-none"
          style={{ color: active ? '#242424' : '#666666' }}>
          {label}{active ? ` (${selected.length})` : ''}
        </span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color: active ? '#2ea3f2' : '#666666' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && rect && createPortal(
        <div ref={dropRef}
          style={{ position: 'fixed', top: rect.bottom + 4, left: rect.left, zIndex: 9999 }}
          className="bg-white border border-[#e2e2e2] shadow-lg min-w-[220px] max-h-[360px] overflow-y-auto py-1">
          {groups.map((group, i) => (
            <div key={group.material}>
              {i > 0 && <div className="border-t border-[#e2e2e2] my-1" />}
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#999999]">
                  {group.material}
                </span>
              </div>
              {group.sizes.map(size => {
                const key = `${size}__${group.material}`
                return (
                  <label key={key} className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-[#f5f8ff] transition-colors duration-100">
                    <input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)}
                      className="accent-[#2ea3f2] w-3.5 h-3.5 shrink-0" />
                    <span className="text-[12px] text-[#242424]">{size}</span>
                  </label>
                )
              })}
            </div>
          ))}
          {selected.length > 0 && (
            <div className="border-t border-[#e2e2e2] mt-1 pt-1">
              <button onClick={() => { onChange([]); setOpen(false) }}
                className="w-full text-left px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase text-[#666666] hover:text-[#242424]">
                Clear
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Shared dropdown (multi-select) ───────────────────────────────────────────

function MultiSelect({ label, selected, options, onChange }: {
  label: string
  selected: string[]
  options: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const active = selected.length > 0

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])
  }

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        onClick={() => { if (btnRef.current) setRect(btnRef.current.getBoundingClientRect()); setOpen(v => !v) }}
        className="flex items-center gap-1 border-b-2 transition-colors duration-200"
        style={{ borderBottomColor: active ? '#2ea3f2' : 'transparent' }}
      >
        <span className="text-[13px] tracking-[0.08em] uppercase font-medium select-none"
          style={{ color: active ? '#242424' : '#666666' }}>
          {label}{active ? ` (${selected.length})` : ''}
        </span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color: active ? '#2ea3f2' : '#666666' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && rect && createPortal(
        <div ref={dropRef}
          style={{ position: 'fixed', top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 228), zIndex: 9999 }}
          className="bg-white border border-[#e2e2e2] shadow-lg min-w-[220px] max-h-[320px] overflow-y-auto py-1">
          {options.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-[#999999]">No options</div>
          )}
          {options.map(o => (
            <label key={o} className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-[#f5f8ff] transition-colors duration-100">
              <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)}
                className="accent-[#2ea3f2] w-3.5 h-3.5 shrink-0" />
              <span className="text-[12px] text-[#242424]">{o}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <div className="border-t border-[#e2e2e2] mt-1 pt-1">
              <button onClick={() => { onChange([]); setOpen(false) }}
                className="w-full text-left px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase text-[#666666] hover:text-[#242424]">
                Clear
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Product modal ────────────────────────────────────────────────────────────

function ProductModal({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,8,6,0.65)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}>
      <div className="relative bg-white w-full max-w-[360px] shadow-2xl"
        style={{ borderRadius: '2px' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#2ea3f2' }}
            className="text-xl font-semibold tracking-[0.12em] uppercase leading-none">
            {product.brand}
          </span>
          <button onClick={onClose} className="text-[#999999] hover:text-[#242424] transition-colors duration-150 -mr-1" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="px-5">
          <div className="w-full bg-white border border-[#e2e2e2]" style={{ aspectRatio: '3 / 4' }}>
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.flavor} className="w-full h-full object-contain p-6" />
              : <div className="w-full h-full flex items-center justify-center text-[#cccccc] text-sm">No image</div>
            }
          </div>
        </div>
        <div className="px-5 pt-4 pb-2">
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            className="text-2xl font-semibold tracking-wide uppercase text-[#242424] leading-tight">
            {product.flavor}
          </h2>
          <p className="text-[13px] text-[#666666] tracking-[0.06em] uppercase mt-0.5">{product.packageName}</p>
        </div>
        <div className="mx-5 border-t border-[#e2e2e2] my-3" />
        <div className="px-5 pb-5 flex flex-col gap-2.5">
          {[
            { label: 'SKU', value: product.sku },
            { label: 'UPC', value: product.upc ?? '—' },
            { label: 'Consumable Units Per Case', value: product.consumableUnitsPerCase || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <span className="text-[11px] tracking-[0.08em] uppercase text-[#666666] shrink-0">{label}</span>
              <span className="text-[13px] text-[#242424] font-medium tabular-nums text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onClick }: { product: CatalogProduct; onClick: () => void }) {
  return (
    <div className="flex flex-col gap-1 group cursor-pointer" onClick={onClick}>
      <div className="relative w-full rounded-sm overflow-hidden"
        style={{ aspectRatio: '2 / 3', background: '#ffffff', outline: '1.5px solid #e2e2e2' }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.flavor}
              className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105" />
          : <div className="absolute inset-0 flex items-center justify-center text-[#cccccc] text-[10px] text-center p-1">No image</div>
        }
      </div>
      <span className="text-[11px] sm:text-[12px] text-[#242424] leading-tight text-center px-0.5 mt-0.5">
        {product.flavor}
      </span>
      {(product.isNew || product.isSeasonal) && (
        <div className="flex flex-wrap gap-1 justify-center">
          {product.isNew && (
            <span className="px-1.5 py-0.5 text-[8px] font-semibold tracking-widest uppercase rounded-sm text-white leading-none"
              style={{ background: '#2a7d3f' }}>New</span>
          )}
          {product.isSeasonal && (
            <span className="px-1.5 py-0.5 text-[8px] font-semibold tracking-widest uppercase rounded-sm text-white leading-none"
              style={{ background: '#2ea3f2' }}>Limited</span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Brand section (list view) ─────────────────────────────────────────────────

function BrandSection({ brand, products, filterPackages, onSelect, brandLogos }: {
  brand: string
  products: CatalogProduct[]
  filterPackages: string[]
  onSelect: (p: CatalogProduct) => void
  brandLogos: Record<string, string | null>
}) {
  const filtered = filterPackages.length > 0
    ? products.filter(p => filterPackages.includes(`${p.size}__${p.material}`))
    : products

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogProduct[]>()
    for (const p of filtered) {
      if (!map.has(p.packageName)) map.set(p.packageName, [])
      map.get(p.packageName)!.push(p)
    }
    return map
  }, [filtered])

  if (grouped.size === 0) return null

  return (
    <div>
      <div className="sticky top-[104px] z-30 bg-white border-b border-[#e2e2e2]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-10 flex items-center gap-4">
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            className="text-xl font-semibold tracking-wide uppercase text-[#242424] leading-none">
            {brand}
          </span>
          <span className="text-[12px] tracking-[0.08em] uppercase text-[#999999]">
            {filtered.length} {filtered.length === 1 ? 'SKU' : 'SKUs'}
          </span>
        </div>
      </div>
      {[...grouped.entries()].map(([pkgName, pkgProducts]) => (
        <div key={pkgName}>
          <div className="sticky top-[144px] z-20 bg-white border-b border-[#e2e2e2]">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 h-9 flex items-center gap-3">
              <span className="text-[13px] tracking-[0.12em] uppercase text-[#242424] font-medium">{pkgName}</span>
              <span className="text-[12px] text-[#999999]">{pkgProducts.length} {pkgProducts.length === 1 ? 'SKU' : 'SKUs'}</span>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3">
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
              {pkgProducts.map(p => (
                <ProductCard key={p.sku} product={p} onClick={() => onSelect(p)} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function CompanyCatalogPage() {
  const { company } = useParams<{ company: string }>()
  if (!company || !VALID_COMPANIES.includes(company as CompanyKey)) {
    return <Navigate to="/pcny" replace />
  }
  return <CatalogContent company={company as CompanyKey} />
}

function CatalogContent({ company }: { company: CompanyKey }) {
  const { products, brands, brandLogos, loading, error } = useCompanyCatalog(company)
  const [searchParams, setSearchParams] = useSearchParams()
  const [modal, setModal] = useState<CatalogProduct | null>(null)

  // All filters live in URL search params (same pattern as BrandsPage)
  const filterCategory   = searchParams.get('category') ?? ''
  const filterPackages   = searchParams.get('packages')?.split(',').filter(Boolean) ?? []
  const filterBrands     = searchParams.get('brands')?.split(',').filter(Boolean) ?? []
  const filterNew        = searchParams.get('new') === '1'
  const filterLimited    = searchParams.get('limited') === '1'

  const isFiltered = filterCategory !== '' || filterPackages.length > 0 ||
    filterBrands.length > 0 || filterNew || filterLimited

  function update(patch: Record<string, string | undefined>) {
    const next = Object.fromEntries(searchParams) as Record<string, string>
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') delete next[k]; else next[k] = v
    }
    setSearchParams(next, { replace: true })
  }

  function setTag(tag: 'new' | 'limited', on: boolean) {
    // New and Limited are mutually exclusive
    update({ new: undefined, limited: undefined, [tag]: on ? '1' : undefined })
  }

  function setCategory(cat: string) {
    update({ category: cat || undefined })
  }

  function setPackages(pkgs: string[]) {
    update({ packages: pkgs.join(',') || undefined })
  }

  function setFilterBrands(bs: string[]) {
    update({ brands: bs.join(',') || undefined })
  }

  // Clicking a brand logo enters list view filtered to that brand
  function selectBrand(brand: string) {
    const current = filterBrands
    const next = current.includes(brand) ? current.filter(b => b !== brand) : [...current, brand]
    setFilterBrands(next)
  }

  // Derived filter data
  const allCategories = useMemo(() =>
    [...new Set(products.map(p => p.category).filter(Boolean) as string[])].sort(),
    [products]
  )

  const categoryFilteredProducts = filterCategory !== ''
    ? products.filter(p => p.category === filterCategory)
    : products

  const brandFilteredProducts = filterBrands.length > 0
    ? products.filter(p => filterBrands.includes(p.brand))
    : products

  // Cascading: category constrains brand options, brand constrains category options
  const brandOptions = useMemo(() =>
    [...new Set(categoryFilteredProducts.map(p => p.brand))].sort(),
    [categoryFilteredProducts]
  )

  const categoryOptions = useMemo(() =>
    [...new Set(brandFilteredProducts.map(p => p.category).filter(Boolean) as string[])].sort(),
    [brandFilteredProducts]
  )

  // Package options: from both category + brand filtered pool
  const filterPool = useMemo(() => {
    let pool = products
    if (filterCategory !== '') pool = pool.filter(p => p.category === filterCategory)
    if (filterBrands.length > 0) pool = pool.filter(p => filterBrands.includes(p.brand))
    return pool
  }, [products, filterCategory, filterBrands])

  const packageGroups = useMemo(() => {
    const byMaterial = new Map<string, Set<string>>()
    for (const p of filterPool) {
      if (!p.size || !p.material) continue
      if (!byMaterial.has(p.material)) byMaterial.set(p.material, new Set())
      byMaterial.get(p.material)!.add(p.size)
    }
    const materialOrder = ['Can', 'PET', 'Glass', 'Bar']
    return [...byMaterial.entries()]
      .sort(([a], [b]) => {
        const ia = materialOrder.indexOf(a)
        const ib = materialOrder.indexOf(b)
        if (ia !== -1 && ib !== -1) return ia - ib
        if (ia !== -1) return -1
        if (ib !== -1) return 1
        return a.localeCompare(b)
      })
      .map(([material, sizes]) => ({ material, sizes: [...sizes].sort((a, b) => sizeToOz(a) - sizeToOz(b)) }))
  }, [filterPool])

  // Final filtered products for list view
  const visibleProducts = useMemo(() => {
    let pool = products
    if (filterCategory !== '') pool = pool.filter(p => p.category === filterCategory)
    if (filterBrands.length > 0) pool = pool.filter(p => filterBrands.includes(p.brand))
    if (filterPackages.length > 0) pool = pool.filter(p => filterPackages.includes(`${p.size}__${p.material}`))
    if (filterNew) pool = pool.filter(p => p.isNew)
    if (filterLimited) pool = pool.filter(p => p.isSeasonal)
    return pool
  }, [products, filterCategory, filterBrands, filterPackages, filterNew, filterLimited])

  // Brands to show in list view
  const visibleBrands = useMemo(() => {
    const brandSet = new Set(visibleProducts.map(p => p.brand))
    return brands.filter(b => brandSet.has(b))
  }, [visibleProducts, brands])

  // Logo grid: filter by selected brands only
  const gridBrands = filterBrands.length > 0 ? brands.filter(b => filterBrands.includes(b)) : brands

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-[13px] tracking-[0.08em] uppercase text-[#999999]">Loading catalog…</div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-[13px] text-red-500">{error}</div>
    </div>
  )

  return (
    <div>
      {/* Page header — only on unfiltered logo grid */}
      {!isFiltered && (
        <div className="border-b border-[#e2e2e2]">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="text-4xl font-semibold tracking-wide uppercase text-[#242424] leading-none">
              Brands
            </h1>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-12 flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <SingleSelect
            label="Category"
            value={filterCategory}
            options={categoryOptions.length > 0 ? categoryOptions : allCategories}
            onChange={setCategory}
          />
          <GroupedMultiSelect
            label="Package"
            selected={filterPackages}
            groups={packageGroups}
            onChange={setPackages}
          />
          <button
            onClick={() => setTag('new', !filterNew)}
            className="shrink-0 text-[13px] tracking-[0.08em] uppercase font-medium transition-colors duration-200 border-b-2"
            style={{ color: filterNew ? '#242424' : '#666666', borderBottomColor: filterNew ? '#2ea3f2' : 'transparent' }}>
            New
          </button>
          <button
            onClick={() => setTag('limited', !filterLimited)}
            className="shrink-0 text-[13px] tracking-[0.08em] uppercase font-medium transition-colors duration-200 border-b-2"
            style={{ color: filterLimited ? '#242424' : '#666666', borderBottomColor: filterLimited ? '#2ea3f2' : 'transparent' }}>
            Limited
          </button>
          <MultiSelect
            label="Brand"
            selected={filterBrands}
            options={brandOptions.length > 0 ? brandOptions : brands}
            onChange={setFilterBrands}
          />
        </div>
      </div>

      {isFiltered ? (
        /* List view: brand > package > products */
        <div className="bg-white shadow-sm">
          {visibleBrands.map(brand => (
            <BrandSection
              key={brand}
              brand={brand}
              products={visibleProducts.filter(p => p.brand === brand)}
              filterPackages={filterPackages}
              onSelect={setModal}
              brandLogos={brandLogos}
            />
          ))}
          {visibleBrands.length === 0 && (
            <div className="flex items-center justify-center py-24 text-[13px] text-[#999999]">
              No products match the selected filters.
            </div>
          )}
        </div>
      ) : (
        /* Logo grid */
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gridBrands.map(brand => (
              <button key={brand} onClick={() => selectBrand(brand)}
                className="group flex items-center justify-center bg-white border border-[#e2e2e2] hover:border-[#c8c3bb] hover:shadow-md transition-all duration-200 rounded-sm w-full"
                style={{ aspectRatio: '3 / 2' }}>
                {brandLogos[brand]
                  ? <img src={brandLogos[brand]!} alt={brand}
                      className="w-3/4 h-3/4 object-contain transition-transform duration-200 group-hover:scale-105" />
                  : <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      className="text-3xl font-semibold tracking-wide uppercase text-[#242424] group-hover:text-[#2ea3f2] transition-colors duration-200 select-none text-center px-4 leading-tight">
                      {brand}
                    </span>
                }
              </button>
            ))}
          </div>
        </div>
      )}

      {modal && <ProductModal product={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
