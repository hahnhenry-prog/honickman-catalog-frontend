import { useNavigate } from 'react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import honickmanLogo from '../imports/TheHonickmanCompanies-1.svg'
import pcnyLogo from '../imports/PCNY.webp'
import pnbLogo from '../imports/PNB.webp'
import cddvLogo from '../imports/CDDV.webp'
import cdpLogo from '../imports/CDP.webp'

const COMPANIES = [
  { slug: 'pcny', logo: pcnyLogo, name: 'Pepsi-Cola Bottling Company of New York', bg: '#174a92', border: '#174a92' },
  { slug: 'pnb',  logo: pnbLogo,  name: 'Pepsi-Cola & National Brand Beverages',   bg: '#174a92', border: '#174a92' },
  { slug: 'cddv', logo: cddvLogo, name: 'Delaware Valley Bottling Company',         bg: '#0e4636', border: '#0e4636' },
  { slug: 'cdp',  logo: cdpLogo,  name: 'Canada Dry Potomac Corporation',           bg: '#0e4636', border: '#0e4636' },
]

export default function CompanyPickerPage() {
  const navigate = useNavigate()
  usePageMeta('Product Catalogs', '/hongrp-favicon.png')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f4f6f9' }}>
      {/* Header */}
      <header style={{ background: '#1e2d3d' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-5">
          <img src={honickmanLogo} alt="The Honickman Companies" className="h-8 w-auto" />
          <div className="w-px h-6 bg-white/20" />
          <span className="text-[12px] tracking-[0.14em] uppercase text-white/60 font-medium">
            Product Catalogs
          </span>
        </div>
      </header>

      {/* Picker */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          className="text-3xl font-semibold tracking-wide uppercase text-[#242424] mb-2 text-center">
          Select a Company
        </h1>
        <p className="text-[13px] text-[#666666] mb-10 text-center">
          Choose A Honickman company to view its product catalog.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {COMPANIES.map(co => (
            <button key={co.slug} onClick={() => navigate(`/${co.slug}`)}
              className="group flex items-center justify-center rounded-sm border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: co.bg, borderColor: co.border, aspectRatio: '3 / 1.2' }}>
              <img src={co.logo} alt={co.name}
                className="w-4/5 h-3/5 object-contain transition-transform duration-200 group-hover:scale-105" />
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#2e2e2e' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center">
          <span className="text-[12px] text-white">
            © 2026 The Honickman Companies
          </span>
        </div>
      </footer>
    </div>
  )
}
