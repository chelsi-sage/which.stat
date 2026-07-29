import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Open Sans bundled locally (works offline — no web-font CDN).
import '@fontsource/open-sans/400.css'
import '@fontsource/open-sans/600.css'
import '@fontsource/open-sans/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
