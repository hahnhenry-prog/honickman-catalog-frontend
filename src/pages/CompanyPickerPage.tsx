import { useNavigate } from 'react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { BRAND_LIST, HONICKMAN, PAGE_BG, FOOTER_BG } from '../lib/brands'
import honickmanLogo from '../imports/TheHonickmanCompanies-1.svg'

export default function CompanyPickerPage() {
  const navigate = useNavigate()
  usePageMeta('Product Catalogs', HONICKMAN.favicon)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG }}>
      {/* Header */}
      <header style={{ background: HONICKMAN.headerBg }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-5">
          <img src={honickmanLogo} alt={HONICKMAN.name} className="h-8 w-auto" />
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
          {BRAND_LIST.map(brand => (
            <button key={brand.key} onClick={() => navigate(`/${brand.key}`)}
              className="group flex items-center justify-center rounded-sm border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: brand.primary, borderColor: brand.primary, aspectRatio: '3 / 1.2' }}>
              <img src={brand.logo} alt={brand.name}
                className="w-4/5 h-3/5 object-contain transition-transform duration-200 group-hover:scale-105" />
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: FOOTER_BG }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center">
          <span className="text-[12px] text-white">{HONICKMAN.footerText}</span>
        </div>
      </footer>
    </div>
  )
}
