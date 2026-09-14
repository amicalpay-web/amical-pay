import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAppContext } from '@/contexts/AppContext'
import { Button, Card } from '@/components'
import { ordersService } from '@/services/ordersService'
import { moncashService } from '@/services/moncashService'
import { useState } from 'react'

type PaymentMethod = 'paypal' | 'moncash' | 'natcash'

const paymentMethods: Array<{ id: PaymentMethod; name: string; desc: string }> = [
  { id: 'moncash', name: 'MonCash', desc: 'Paiement sécurisé via MonCash' },
  { id: 'natcash', name: 'NatCash', desc: 'Paiement manuel via NatCash' },
  { id: 'paypal', name: 'PayPal', desc: 'Disponible bientôt' },
]

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useCart()
  const { currency } = useAppContext()
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('moncash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    setError('')

    try {
      const order = await ordersService.createOrder({
        product: item.product,
        playerId: item.playerId,
        whatsappNumber: item.whatsappNumber || '',
        email: item.email || '',
        region: item.product.region,
        currency,
        status: 'pending',
        paymentMethod: selectedPayment,
        totalPrice: price,
        fazerFields: item.fazerFields,
      })

      if (selectedPayment === 'moncash') {
        const payment = await moncashService.createPayment(order.orderNumber, price)
        clearCart()
        window.location.assign(payment.redirectUrl)
        return
      }

      clearCart()
      navigate('/order-confirmation/' + order.orderNumber)
    } catch (requestError) {
      console.error('Order creation or payment failed:', requestError)
      setError('Le paiement n’a pas pu être démarré. Vérifiez votre connexion puis réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Paiement</h1>

        <Card className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Résumé de la commande</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Produit</span>
              <span className="text-white font-semibold">{item.product.name}</span>
            </div>
            {item.playerId && (
              <div className="flex justify-between">
                <span className="text-gray-400">Player ID</span>
                <span className="text-white font-semibold">{item.playerId}</span>
              </div>
            )}
            {item.fazerFields && Object.entries(item.fazerFields).map(([key, value]) => (
              <div className="flex justify-between gap-4" key={key}>
                <span className="text-gray-400">{key}</span>
                <span className="text-white font-semibold text-right">{value}</span>
              </div>
            ))}
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

        <Card>
          <h2 className="text-xl font-bold text-white mb-6">Méthode de paiement</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={'flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ' +
                  (selectedPayment === method.id
                    ? 'border-amical-orange bg-amical-dark-secondary'
                    : 'border-amical-dark-tertiary hover:border-amical-orange/50')}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPayment === method.id}
                  onChange={(event) => setSelectedPayment(event.target.value as PaymentMethod)}
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

          {error && (
            <p className="mt-4 rounded-lg bg-red-900/40 p-3 text-sm text-red-200" role="alert">
              {error}
            </p>
          )}

          <Button
            className="w-full mt-8"
            size="lg"
            onClick={handlePlaceOrder}
            isLoading={loading}
          >
            {selectedPayment === 'moncash' ? 'Payer avec MonCash' : 'Confirmer la commande'}
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default Checkout
