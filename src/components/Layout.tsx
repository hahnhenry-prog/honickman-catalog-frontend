import { Link, useParams } from 'react-router'
import { ThemeProvider } from '@honickman/ui'
import { usePageMeta } from '../hooks/usePageMeta'
import { VALID_COMPANIES, type CompanyKey } from '../lib/supabase'
import { COMPANY_BRANDS, DEFAULT_COMPANY, HONICKMAN } from '../lib/brands'

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ company?: string }>()
  const company = params.company && VALID_COMPANIES.includes(params.company as CompanyKey)
    ? (params.company as CompanyKey)
    : null

  // Brand drives both identity (logo, footer) and appearance (theme).
  const brand = COMPANY_BRANDS[company ?? DEFAULT_COMPANY]
  const showAllTo = company ? `/${company}` : '/'
  const footerText = company ? brand.footerText : HONICKMAN.footerText

  usePageMeta('Our Products', company ? brand.favicon : HONICKMAN.favicon)

  return (
    // ThemeProvider publishes this brand's palette as CSS custom properties on
    // :root, so everything below — including the filter dropdowns and product
    // modal, which render through portals into document.body — picks them up.
    <ThemeProvider brand={brand.key}>
      <div className="min-h-full" style={{ background: 'var(--color-background)', color: 'var(--color-foreground)' }}>
        <header className="sticky top-0 z-50" style={{ background: 'var(--color-primary)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link to={showAllTo}>
              <img src={brand.logo} alt={brand.name} className="h-8 sm:h-9 w-auto" />
            </Link>
            <Link to={showAllTo}
              className="text-[12px] sm:text-[13px] tracking-[0.08em] uppercase font-medium text-white/70 hover:text-white transition-colors duration-200">
              Show All
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-4" style={{ background: 'var(--color-surface-inverse)' }}>
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-center">
            <span className="text-[12px]" style={{ color: 'var(--color-surface-inverse-foreground)' }}>{footerText}</span>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
