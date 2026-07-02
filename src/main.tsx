import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initGa4 } from './analytics/ga4'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'
import App from './App.tsx'

initGa4()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
