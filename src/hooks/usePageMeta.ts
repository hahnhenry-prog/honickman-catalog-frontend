import { useEffect } from 'react'

export function usePageMeta(title: string, faviconPath: string) {
  useEffect(() => {
    document.title = title

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    const prev = link.href
    link.href = faviconPath

    return () => { link!.href = prev }
  }, [title, faviconPath])
}
