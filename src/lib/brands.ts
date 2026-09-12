import { VALID_COMPANIES, type CompanyKey } from './supabase'
import pcnyLogo from '../imports/PCNY.webp'
import pnbLogo from '../imports/PNB.webp'
import cddvLogo from '../imports/CDDV.webp'
import cdpLogo from '../imports/CDP.webp'

/**
 * Single source of truth for per-company branding in this app.
 *
 * Colour values must match the canonical palette in CLAUDE.md and the tokens
 * in honickman-ui/src/tokens/. Do not introduce a new shade here — if a colour
 * is missing, raise it rather than picking a near-miss.
 */
export interface BrandConfig {
  key: CompanyKey
  /** Full legal name — logo alt text and the company picker. */
  name: string
  /** Brand primary: header background, active filters, accents, badges. */
  primary: string
  footerText: string
  favicon: string
  logo: string
}

export const BRANDS: Record<CompanyKey, BrandConfig> = {
  pcny: {
    key: 'pcny',
    name: 'Pepsi-Cola Bottling Company of New York',
    primary: '#174a92',
    footerText: '© 2026 Pepsi-Cola Bottling Company of New York, Inc.',
    favicon: '/pcny-favicon.png',
    logo: pcnyLogo,
  },
  pnb: {
    key: 'pnb',
    name: 'Pepsi-Cola & National Brand Beverages',
    primary: '#174a92',
    footerText: '© 2026 Pepsi-Cola & National Brand Beverages, Ltd.',
    favicon: '/pnb-favicon.png',
    logo: pnbLogo,
  },
  cddv: {
    key: 'cddv',
    name: 'Delaware Valley Bottling Company',
    primary: '#0e4636',
    footerText: '© 2026 Delaware Valley Bottling Company',
    favicon: '/cddv-favicon.png',
    logo: cddvLogo,
  },
  cdp: {
    key: 'cdp',
    name: 'Canada Dry Potomac Corporation',
    primary: '#0e4636',
    footerText: '© 2026 Canada Dry Potomac Corporation',
    favicon: '/cdp-favicon.png',
    logo: cdpLogo,
  },
}

/** Companies in display order, for the picker page. */
export const BRAND_LIST = VALID_COMPANIES.map(k => BRANDS[k])

/** Used when no single bottler is in context (picker page, unknown route). */
export const HONICKMAN = {
  name: 'The Honickman Companies',
  headerBg: '#1e2d3d',
  footerText: '© 2026 The Honickman Companies',
  favicon: '/hongrp-favicon.png',
}

/** Chrome shared by every page. */
export const PAGE_BG = '#f4f6f9'
export const FOOTER_BG = '#2e2e2e'

/** Fallback when the route carries no valid company. */
export const DEFAULT_BRAND = BRANDS.pcny
