import { AppProvider } from '@/contexts/AppContext'
import { CartProvider } from '@/contexts/CartContext'
import { BrowserRouter } from 'react-router-dom'
import Router from '@/router'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <CartProvider>
          <Router />
        </CartProvider>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
