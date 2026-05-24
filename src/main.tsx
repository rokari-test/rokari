import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  applyDisplayPreferences,
  loadPreferences,
  PREFS_EVENT,
} from './lib/preferences'
import { applyThemeFromPreferences } from './lib/theme'
import { ensureCoinDealCatalog } from './lib/commerce'
import App from './App.tsx'

const syncPrefs = () => {
  const prefs = loadPreferences()
  applyThemeFromPreferences(prefs)
  applyDisplayPreferences(prefs)
}

syncPrefs()
ensureCoinDealCatalog()
window.addEventListener(PREFS_EVENT, syncPrefs)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

