import { useEffect } from 'react'

/**
 * Publishes a brand's primary colour as the `--brand-primary` CSS custom
 * property so the whole app picks it up.
 *
 * Set on document.documentElement (:root) rather than on a wrapper element
 * because the filter dropdowns and the product modal render through
 * createPortal into document.body — outside the Layout tree. A variable
 * scoped to a wrapper would not reach them.
 *
 * This mirrors what @honickman/ui's ThemeProvider does, so swapping to the
 * shared package later is a substitution rather than a rewrite.
 */
export function useBrandTheme(primary: string) {
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.getPropertyValue('--brand-primary')
    root.style.setProperty('--brand-primary', primary)
    return () => {
      if (prev) root.style.setProperty('--brand-primary', prev)
      else root.style.removeProperty('--brand-primary')
    }
  }, [primary])
}
