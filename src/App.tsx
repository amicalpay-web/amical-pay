import { AppProvider } from '@/contexts/AppContext'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import Router from '@/router'
import Header from '@/components/Header'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <CartProvider>
            <Header />
            <Router />
          </CartProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
