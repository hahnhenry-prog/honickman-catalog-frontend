import { Link, useParams } from 'react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { useBrandTheme } from '../hooks/useBrandTheme'
import { VALID_COMPANIES, type CompanyKey } from '../lib/supabase'
import { BRANDS, DEFAULT_BRAND, HONICKMAN, PAGE_BG, FOOTER_BG } from '../lib/brands'

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ company?: string }>()
  const company = params.company && VALID_COMPANIES.includes(params.company as CompanyKey)
    ? params.company as CompanyKey
    : null
  const brand = company ? BRANDS[company] : null

  const primary = brand?.primary ?? DEFAULT_BRAND.primary
  const logo = brand?.logo ?? DEFAULT_BRAND.logo
  const logoAlt = brand?.name ?? 'Product Catalog'
  const footerText = brand?.footerText ?? HONICKMAN.footerText
  const showAllTo = company ? `/${company}` : '/'

  // Publishes --brand-primary to :root; drives every accent on the page.
  useBrandTheme(primary)
  usePageMeta('Our Products', brand?.favicon ?? HONICKMAN.favicon)

  return (
    <div className="min-h-full text-[#242424]" style={{ background: PAGE_BG }}>
      <header className="sticky top-0 z-50" style={{ background: primary }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to={showAllTo}>
            <img src={logo} alt={logoAlt} className="h-8 sm:h-9 w-auto" />
          </Link>
          <Link to={showAllTo}
            className="text-[12px] sm:text-[13px] tracking-[0.08em] uppercase font-medium text-white/70 hover:text-white transition-colors duration-200">
            Show All
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-4" style={{ background: FOOTER_BG }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-center">
          <span className="text-[12px] text-white">{footerText}</span>
        </div>
      </footer>
    </div>
  )
}
