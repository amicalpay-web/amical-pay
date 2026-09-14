import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { ordersService } from '@/services/ordersService'
import { Order } from '@/types'

function OrderStatusPage() {
  const [searchParams] = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Amical Pay - Track Order'
  }, [])

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      setError('Please enter an order number.')
      setOrder(null)
      return
    }

    setLoading(true)
    setError('')
    const foundOrder = await ordersService.getOrderByNumber(orderNumber.trim())
    if (!foundOrder) {
      setError('Order not found.')
      setOrder(null)
    } else {
      setOrder(foundOrder)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (orderNumber) {
      handleTrackOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-xl border border-amical-gold/20 bg-amical-card p-6">
      <h1 className="text-2xl font-bold">Order Status</h1>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="ORD-20260914-1234" />
        <Button onClick={handleTrackOrder} isLoading={loading}>
          Track
        </Button>
      </div>
      {error && <p className="rounded-md bg-red-900/20 p-3 text-sm text-red-300">{error}</p>}
      {order && (
        <div className="rounded-lg border border-amical-gold/30 bg-amical-dark-soft p-4 text-sm">
          <p>
            <span className="text-gray-300">Order:</span> {order.orderNumber}
          </p>
          <p>
            <span className="text-gray-300">Status:</span> <span className="capitalize">{order.status}</span>
          </p>
          <p>
            <span className="text-gray-300">Estimated delivery:</span> 15-30 minutes
          </p>
        </div>
      )}
    </div>
  )
}

export default OrderStatusPage
