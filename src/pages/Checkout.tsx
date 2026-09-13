import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAppContext } from '@/contexts/AppContext'
import { Button, Card } from '@/components'
import { ordersService } from '@/services/ordersService'
import { useState } from 'react'

function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cartItems, clearCart } = useCart()
  const { currency } = useAppContext()
  const [selectedPayment, setSelectedPayment] = useState<'paypal' | 'moncash' | 'natcash'>('moncash')
  const [loading, setLoading] = useState(false)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-amical-dark flex items-center justify-center">
        <Card>
          <p className="text-white">Aucun produit dans le panier</p>
          <Button className="w-full mt-4" onClick={() => navigate('/products')}>
            Retour aux produits
          </Button>
        </Card>
      </div>
    )
  }

  const item = cartItems[0]
  const price = currency === 'USD' ? item.product.sellingPriceUsd : item.product.sellingPriceHtg

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const order = await ordersService.createOrder({
        product: item.product,
        playerId: item.playerId,
        whatsappNumber: item.whatsappNumber || '',
        email: item.email || '',
        region: item.product.region,
        currency: currency as any,
        status: 'pending',
        paymentMethod: selectedPayment,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: '',
        orderNumber: '',
      })
      clearCart()
      navigate(`/order-confirmation/${order.orderNumber}`)
    } catch (error) {
      console.error('Order creation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Paiement</h1>

        {/* Order Summary */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Résumé de la commande</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Produit</span>
              <span className="text-white font-semibold">{item.product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Player ID</span>
              <span className="text-white font-semibold">{item.playerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Région</span>
              <span className="text-white font-semibold">{item.product.region}</span>
            </div>
            <div className="border-t border-amical-dark-tertiary pt-4 flex justify-between">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-amical-orange">
                {currency === 'USD' ? '$' : 'G'}{price.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card>
          <h2 className="text-xl font-bold text-white mb-6">Méthode de paiement</h2>
          <div className="space-y-3">
            {[
              { id: 'moncash', name: 'MonCash', desc: 'Paiement manuel via MonCash' },
              { id: 'natcash', name: 'NatCash', desc: 'Paiement manuel via NatCash' },
              { id: 'paypal', name: 'PayPal', desc: 'Disponible bientôt' },
            ].map((method) => (
              <label
                key={method.id}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPayment === method.id
                    ? 'border-amical-orange bg-amical-dark-secondary'
                    : 'border-amical-dark-tertiary hover:border-amical-orange/50'
                }"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPayment === method.id}
                  onChange={(e) => setSelectedPayment(e.target.value as any)}
                  className="mr-3"
                  disabled={method.id === 'paypal'}
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">{method.name}</p>
                  <p className="text-sm text-gray-400">{method.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <Button
            className="w-full mt-8"
            size="lg"
            onClick={handlePlaceOrder}
            isLoading={loading}
          >
            Confirmer la commande
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default Checkout
