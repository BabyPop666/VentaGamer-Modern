import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadLanguage } from './lib/i18n'

const initial = localStorage.getItem("ventagamer.lang") ?? "es";
void loadLanguage(initial);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
