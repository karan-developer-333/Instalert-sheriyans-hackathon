import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import App from './App.jsx'
import { CookiesProvider } from 'react-cookie'
import Toaster from './ui/components/Toaster'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <CookiesProvider>
        <App />
        <Toaster />
      </CookiesProvider>
    </Provider>
  </StrictMode>,
)
