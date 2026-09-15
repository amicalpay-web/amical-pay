import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Checkout from '@/pages/Checkout'
import OrderConfirmation from '@/pages/OrderConfirmation'
import PaymentSuccess from '@/pages/PaymentSuccess'
import TrackOrder from '@/pages/TrackOrder'
import Account from '@/pages/Account'
import FAQ from '@/pages/FAQ'
import Support from '@/pages/Support'
import Auth from '@/pages/Auth'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/productspage" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/account" element={<Account />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/support" element={<Support />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

export default Router
