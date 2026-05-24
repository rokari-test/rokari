const CONFIG_KEY = 'inkscroll-site-config'
export const SITE_CONFIG_EVENT = 'inkscroll-site-config'

export interface SiteConfig {
  siteName: string
  tagline: string
}

const defaults: SiteConfig = {
  siteName: 'Rokari',
  tagline: 'Premium manhwa reading — clean, fast, distraction-free.',
}

export function loadSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function saveSiteConfig(config: Partial<SiteConfig>) {
  const next = { ...loadSiteConfig(), ...config }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(SITE_CONFIG_EVENT))
}
