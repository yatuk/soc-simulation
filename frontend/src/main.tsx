import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={200}>
      <HashRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-card border border-border text-foreground text-sm',
          }}
        />
      </HashRouter>
    </TooltipProvider>
  </StrictMode>,
)
