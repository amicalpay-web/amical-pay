import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { OrderSummary } from '@/components/OrderSummary'
import { ordersService } from '@/services/ordersService'
import { Order, Product, Region, Currency } from '@/types'

interface PaymentState {
  product: Product
  playerId: string
  email: string
  whatsappNumber: string
  region: Region
  currency: Currency
}

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as PaymentState | null
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Amical Pay - Payment'
  }, [])

  if (!state) {
    return (
      <div className="rounded-xl border border-amical-gold/20 bg-amical-card p-6">
        <p className="text-gray-200">Checkout details missing. Please return to checkout.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    setError('')
    try {
      const order: Order = await ordersService.createOrder({
        product: state.product,
        playerId: state.playerId,
        email: state.email,
        whatsappNumber: state.whatsappNumber,
        region: state.region,
        currency: state.currency,
        totalPrice: state.currency === 'USD' ? state.product.sellingPriceUsd : state.product.sellingPriceHtg,
        status: 'pending',
        paymentMethod: 'moncash',
      })
      navigate(`/order-status?order=${order.orderNumber}`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-amical-gold/20 bg-amical-card p-6">
        <h1 className="mb-4 text-2xl font-bold">Payment</h1>
        <p className="mb-4 text-sm text-gray-300">Payment instructions are shared after order creation.</p>
        <div className="rounded-lg border border-amical-gold/20 bg-amical-dark-soft p-4 text-sm text-gray-200">
          Current processing method: <span className="font-semibold text-amical-gold">MonCash</span>
        </div>
        {error && <p className="mt-4 rounded-md bg-red-900/20 p-3 text-sm text-red-300">{error}</p>}
        <Button className="mt-6 w-full" onClick={handlePlaceOrder} isLoading={submitting}>
          Place order
        </Button>
      </section>

      <OrderSummary
        product={state.product}
        currency={state.currency}
        playerId={state.playerId}
        continueLabel="Ready for payment"
        disabled
      />
    </div>
  )
}

export default PaymentPage
