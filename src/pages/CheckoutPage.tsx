import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '@/components/Input'
import { OrderSummary } from '@/components/OrderSummary'
import { productsService } from '@/services/productsService'
import { useAppContext } from '@/contexts/AppContext'
import { Currency, Product, Region } from '@/types'

interface CheckoutState {
  product?: Product
}

function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { region, setRegion, currency, setCurrency } = useAppContext()
  const [product, setProduct] = useState<Product | null>((location.state as CheckoutState | null)?.product || null)
  const [playerId, setPlayerId] = useState('')
  const [email, setEmail] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const productId = searchParams.get('productId')

  useEffect(() => {
    document.title = 'Amical Pay - Checkout'
  }, [])

  useEffect(() => {
    const loadProduct = async () => {
      if (!product && productId) {
        const fetchedProduct = await productsService.getProductById(productId)
        setProduct(fetchedProduct || null)
      }
    }
    loadProduct()
  }, [product, productId])

  const playerIdError = useMemo(() => errors.playerId, [errors.playerId])

  const handleRegionChange = async (nextRegion: Region) => {
    if (!product) return
    setRegion(nextRegion)
    const regionalProducts = await productsService.getProductsByRegion(nextRegion)
    const matchingProduct = regionalProducts.find((item) => item.id === product.id) || regionalProducts[0] || null
    setProduct(matchingProduct)
  }

  const handleContinue = () => {
    const nextErrors: Record<string, string> = {}
    if (!playerId.trim()) nextErrors.playerId = 'Player ID is required.'
    if (playerId.trim() && !/^\d+$/.test(playerId)) nextErrors.playerId = 'Player ID must be numeric.'
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !product) return

    navigate('/payment', {
      state: {
        product,
        playerId,
        email,
        whatsappNumber,
        region: product.region,
        currency,
      },
    })
  }

  if (!product) {
    return <p className="text-gray-300">Product not found. Please return to the catalog.</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-amical-gold/20 bg-amical-card p-6">
        <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
        <div className="space-y-4">
          <Input
            label="Player ID"
            value={playerId}
            onChange={(event) => setPlayerId(event.target.value)}
            placeholder="Enter your Free Fire Player ID"
            error={errors.playerId}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@email.com"
            error={errors.email}
          />
          <Input
            label="WhatsApp"
            type="tel"
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            placeholder="+123456789"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-300">Region</span>
              <select
                value={region}
                onChange={(event) => handleRegionChange(event.target.value as Region)}
                className="w-full rounded-lg border border-amical-gold/30 bg-amical-dark-soft px-3 py-2 text-white"
              >
                {(['LATAM', 'EU', 'BR', 'MENA'] as Region[]).map((regionOption) => (
                  <option key={regionOption} value={regionOption}>
                    {regionOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-300">Currency</span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as Currency)}
                className="w-full rounded-lg border border-amical-gold/30 bg-amical-dark-soft px-3 py-2 text-white"
              >
                {(['USD', 'HTG'] as Currency[]).map((currencyOption) => (
                  <option key={currencyOption} value={currencyOption}>
                    {currencyOption}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <OrderSummary
        product={product}
        currency={currency}
        playerId={playerId}
        playerIdError={playerIdError}
        onContinue={handleContinue}
        continueLabel="Continue to payment"
      />
    </div>
  )
}

export default CheckoutPage
