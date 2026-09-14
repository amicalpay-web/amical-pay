import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { useCart } from '@/contexts/CartContext'
import { Button, Card, Input, LoadingSpinner, Alert } from '@/components'
import { productsService } from '@/services/productsService'
import { Product } from '@/types'

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currency } = useAppContext()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [playerId, setPlayerId] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const data = await productsService.getProductById(id)
        setProduct(data || null)
      }
      setLoading(false)
    }
    loadProduct()
  }, [id])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!playerId.trim()) newErrors.playerId = 'Player ID is required'
    if (!/^\d+$/.test(playerId)) newErrors.playerId = 'Player ID must be numeric'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validateForm()) return
    if (!product) return

    addToCart({
      product,
      playerId,
      whatsappNumber,
      email,
    })

    navigate('/checkout')
  }

  if (loading) return <LoadingSpinner fullScreen />

  if (!product) {
    return (
      <div className="min-h-screen bg-amical-dark flex items-center justify-center px-4">
        <Card>
          <p className="text-white text-center">Produit non trouvé</p>
          <Button className="w-full mt-4" onClick={() => navigate('/products')}>
            Retour aux produits
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/products')}
          className="text-amical-orange hover:text-amical-orange-dark mb-8"
        >
          ← {t('common.back')}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Info */}
          <Card>
            <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
            {product.diamonds > 0 && (
              <p className="text-amical-orange text-xl font-semibold mb-4">💎 {product.diamonds}</p>
            )}
            <p className="text-gray-400 mb-6">{product.description}</p>

            <div className="space-y-4 border-t border-amical-dark-tertiary pt-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Région</p>
                <p className="text-white font-semibold">{product.region}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Prix</p>
                <p className="text-3xl font-bold text-amical-orange">
                  {currency === 'USD' ? '$' : 'G'}
                  {currency === 'USD'
                    ? product.sellingPriceUsd.toFixed(2)
                    : product.sellingPriceHtg.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Form */}
          <Card>
            <h2 className="text-2xl font-bold text-white mb-6">Valider votre commande</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Player ID Free Fire *</label>
                <Input
                  type="text"
                  placeholder="Entrez votre Player ID"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  error={errors.playerId}
                  helperText={t('product.playerIdHelp')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email *</label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">WhatsApp (optionnel)</label>
                <Input
                  type="tel"
                  placeholder="+50943882372"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>

              <Alert
                type="info"
                title="Information"
                message="Vérifiez attentivement votre Player ID avant de continuer"
              />

              <Button className="w-full mt-6" size="lg" onClick={handleContinue}>
                {t('common.continue')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
