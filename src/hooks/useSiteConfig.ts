import { useEffect, useState } from 'react'
import { loadSiteConfig, SITE_CONFIG_EVENT, type SiteConfig } from '../lib/siteConfig'

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState(loadSiteConfig)

  useEffect(() => {
    const refresh = () => setConfig(loadSiteConfig())
    window.addEventListener(SITE_CONFIG_EVENT, refresh)
    return () => window.removeEventListener(SITE_CONFIG_EVENT, refresh)
  }, [])

  return config
}
