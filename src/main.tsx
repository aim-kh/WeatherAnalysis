import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App_rev0.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
