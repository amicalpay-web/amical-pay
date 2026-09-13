import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { Button, Card, Input, LoadingSpinner } from '@/components'
import { ordersService } from '@/services/ordersService'
import { Order } from '@/types'

function TrackOrder() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialOrderNumber = searchParams.get('order') || ''
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      setError('Veuillez entrer un numéro de commande')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await ordersService.getOrderByNumber(orderNumber)
      if (data) {
        setOrder(data)
      } else {
        setError('Commande non trouvée')
        setOrder(null)
      }
    } catch (err) {
      setError('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumber(initialOrderNumber)
      handleSearch()
    }
  }, [])

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Suivre votre commande</h1>

        <Card className="mb-8">
          <div className="flex gap-4">
            <Input
              placeholder="ORD-20240913-001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
            <Button onClick={handleSearch} isLoading={loading}>
              {t('tracking.search')}
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="mb-8 bg-red-900/20 border-red-500/30">
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        {order && (
          <Card>
            <h2 className="text-xl font-bold text-white mb-6">Détails de la commande</h2>
            <div className="space-y-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Numéro de commande</p>
                <p className="text-white font-semibold text-lg">{order.orderNumber}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-4">Statut</p>
                <div className="space-y-3">
                  {[
                    { status: 'pending', label: 'En attente', icon: '⏱️' },
                    { status: 'payment_verification', label: 'Vérification', icon: '🔍' },
                    { status: 'processing', label: 'En traitement', icon: '⚙️' },
                    { status: 'completed', label: 'Terminé', icon: '✅' },
                  ].map((step) => (
                    <div key={step.status} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          order.status === step.status || order.status === 'completed'
                            ? 'bg-amical-orange text-white'
                            : 'bg-amical-dark-tertiary text-gray-400'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={`${
                          order.status === step.status
                            ? 'text-white font-semibold'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-amical-dark-tertiary pt-6">
                <p className="text-gray-400 text-sm mb-2">Produit</p>
                <p className="text-white font-semibold">{order.product.name}</p>
              </div>
            </div>
          </Card>
        )}

        <Button variant="ghost" className="mt-8" onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </div>
    </div>
  )
}

export default TrackOrder
