import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import ProductDetail from '@/pages/ProductDetail'
import CheckoutPage from '@/pages/CheckoutPage'
import PaymentPage from '@/pages/PaymentPage'
import OrderStatusPage from '@/pages/OrderStatusPage'

function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order-status" element={<OrderStatusPage />} />
        <Route path="/track-order" element={<Navigate to="/order-status" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default Router
