import { Link, useParams } from 'react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { VALID_COMPANIES, type CompanyKey } from '../lib/supabase'
import pcnyLogo from '../imports/PCNY.webp'
import pnbLogo from '../imports/PNB.webp'
import cddvLogo from '../imports/CDDV.webp'
import cdpLogo from '../imports/CDP.webp'

const COMPANY_CONFIG: Record<CompanyKey, {
  logo: string
  name: string
  headerBg: string
  footerText: string
  favicon: string
}> = {
  pcny: {
    logo: pcnyLogo,
    name: 'Pepsi-Cola Bottling Company of New York',
    headerBg: '#174a92',
    footerText: '© 2026 Pepsi-Cola Bottling Company of New York, Inc.',
    favicon: '/pcny-favicon.png',
  },
  pnb: {
    logo: pnbLogo,
    name: 'Pepsi-Cola & National Brand Beverages',
    headerBg: '#174a92',
    footerText: '© 2026 Pepsi-Cola & National Brand Beverages, Ltd.',
    favicon: '/pnb-favicon.png',
  },
  cddv: {
    logo: cddvLogo,
    name: 'Delaware Valley Bottling Company',
    headerBg: '#0e4636',
    footerText: '© 2026 Delaware Valley Bottling Company',
    favicon: '/cddv-favicon.png',
  },
  cdp: {
    logo: cdpLogo,
    name: 'Canada Dry Potomac Corporation',
    headerBg: '#0e4636',
    footerText: '© 2026 Canada Dry Potomac Corporation',
    favicon: '/cdp-favicon.png',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ company?: string }>()
  const company = params.company && VALID_COMPANIES.includes(params.company as CompanyKey)
    ? params.company as CompanyKey
    : null
  const config = company ? COMPANY_CONFIG[company] : null

  const headerBg = config?.headerBg ?? '#174a92'
  const logo = config?.logo ?? pcnyLogo
  const logoAlt = config?.name ?? 'Product Catalog'
  const footerText = config?.footerText ?? '© 2026 The Honickman Companies'
  const showAllTo = company ? `/${company}` : '/'

  usePageMeta('Our Products', config?.favicon ?? '/hongrp-favicon.png')

  return (
    <div className="min-h-full text-[#242424]" style={{ background: '#f4f6f9' }}>
      <header className="sticky top-0 z-50" style={{ background: headerBg }}>
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

      <footer className="mt-4" style={{ background: '#2e2e2e' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-center">
          <span className="text-[12px] text-white">{footerText}</span>
        </div>
      </footer>
    </div>
  )
}
