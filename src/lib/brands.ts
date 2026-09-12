import { BRANDS as UI_BRANDS, type BrandId } from '@honickman/ui'
import honickmanLogo from '@honickman/ui/logos/honickman.svg'
import pcnyLogo from '@honickman/ui/logos/pcny.png'
import pnbLogo from '@honickman/ui/logos/pnb.png'
import cddvLogo from '@honickman/ui/logos/cddv.png'
import cdpLogo from '@honickman/ui/logos/cdp.png'
import { VALID_COMPANIES, type CompanyKey } from './supabase'

/**
 * App-level brand data.
 *
 * Names and theme assignment come from @honickman/ui — this file does not
 * restate them. What lives here is what only this app needs: the logo asset,
 * the legal footer line, and the favicon.
 *
 * Colours are NOT here. They come from the theme via ThemeProvider, which
 * publishes them as CSS custom properties (--color-primary and friends).
 */

/** Logos must be imported statically so the bundler can resolve them. */
export const LOGOS: Record<BrandId, string> = {
  honickman: honickmanLogo,
  pcny: pcnyLogo,
  pnb: pnbLogo,
  cddv: cddvLogo,
  cdp: cdpLogo,
}

/** Legal copy is app-specific and deliberately not in the shared package. */
const FOOTER: Record<CompanyKey, string> = {
  pcny: '© 2026 Pepsi-Cola Bottling Company of New York, Inc.',
  pnb:  '© 2026 Pepsi-Cola & National Brand Beverages, Ltd.',
  cddv: '© 2026 Delaware Valley Bottling Company',
  cdp:  '© 2026 Canada Dry Potomac Corporation',
}

export interface CompanyBrand {
  key: CompanyKey
  name: string
  logo: string
  footerText: string
  favicon: string
}

function build(key: CompanyKey): CompanyBrand {
  return {
    key,
    name: UI_BRANDS[key].name,
    logo: LOGOS[key],
    footerText: FOOTER[key],
    favicon: `/${key}-favicon.png`,
  }
}

export const COMPANY_BRANDS: Record<CompanyKey, CompanyBrand> =
  Object.fromEntries(VALID_COMPANIES.map(k => [k, build(k)])) as Record<CompanyKey, CompanyBrand>

/** Companies in display order, for the picker page. */
export const BRAND_LIST = VALID_COMPANIES.map(k => COMPANY_BRANDS[k])

/** Parent-company chrome, used where no single bottler is in context. */
export const HONICKMAN = {
  name: UI_BRANDS.honickman.name,
  logo: LOGOS.honickman,
  footerText: '© 2026 The Honickman Companies',
  favicon: '/hongrp-favicon.png',
}

export const DEFAULT_COMPANY: CompanyKey = 'pcny'
