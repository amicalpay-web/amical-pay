import { AppProvider } from '@/contexts/AppContext'
import { CartProvider } from '@/contexts/CartContext'
import { BrowserRouter } from 'react-router-dom'
import Router from '@/router'
import Header from '@/components/Header'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <CartProvider>
          <Header />
          <Router />
        </CartProvider>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
