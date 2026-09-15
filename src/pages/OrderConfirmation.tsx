import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, Card, LoadingSpinner } from '@/components'
import { SeoHead } from '@/components/SeoHead'
import { ordersService } from '@/services/ordersService'
import { Order } from '@/types'

function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (orderNumber) {
        const data = await ordersService.getOrderByNumber(orderNumber)
        setOrder(data ?? null)
      }
      setLoading(false)
    }
    loadOrder()
  }, [orderNumber])

  if (loading) return <LoadingSpinner fullScreen />

  if (!order) {
    return (
      <div className="min-h-screen bg-amical-dark flex items-center justify-center">
        <SeoHead title="Commande non trouvée" path="/order-confirmation" noindex />
        <Card>
          <p className="text-white text-center">Commande non trouvée</p>
          <Button className="w-full mt-4" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <SeoHead title="Confirmation de commande" path="/order-confirmation" noindex />

      <div className="max-w-2xl mx-auto">
        <Card className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-white mb-2">Commande reçue!</h1>
          <p className="text-gray-400 mb-6">Numéro de commande: {order.orderNumber}</p>
        </Card>

        <Card className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Détails de la commande</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Produit</span>
              <span className="text-white font-semibold">{order.product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Player ID</span>
              <span className="text-white font-semibold">{order.playerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Montant</span>
              <span className="text-white font-semibold">
                {order.currency === 'USD' ? '$' : 'G'}{order.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Statut</span>
              <span className="text-yellow-400 font-semibold">En attente de paiement</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => navigate('/track-order?order=' + encodeURIComponent(order.orderNumber))}
          >
            Suivre ma commande
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
