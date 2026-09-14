import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '@/contexts/AppContext'
import { useCart } from '@/contexts/CartContext'
import { Button, Card, Input, LoadingSpinner, Alert } from '@/components'
import { productsService } from '@/services/productsService'
import { Product } from '@/types'
import { fazerService, getValidationFields } from '@/services/fazerService'

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currency } = useAppContext()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fazerFields, setFazerFields] = useState<Record<string, string>>({})
  const [validating, setValidating] = useState(false)

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

  useEffect(() => {
    if (!product) return

    const fields = getValidationFields(product.fazerValidationFields)
    setFazerFields((current) => {
      const next = { ...current }
      for (const field of fields) {
        if (field.key && next[field.key] === undefined) next[field.key] = ''
      }
      return next
    })
  }, [product])

  const validationFields = getValidationFields(
    product?.fazerFields || product?.fazerValidationFields
  )

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email'

    for (const field of validationFields) {
      if (field.key && !fazerFields[field.key]?.trim()) {
        newErrors[field.key] = `${field.label || field.key} est requis`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validateForm()) return
    if (!product) return

    setValidating(true)

    try {
      const fields = Object.fromEntries(
        validationFields
          .filter((field) => field.key)
          .map((field) => [field.key as string, fazerFields[field.key as string].trim()])
      )
      let validatedPlayerId = Object.values(fields)[0] || ''
      if (product.requiresPlayerValidation && product.fazerCategoryId) {
        const validation = await fazerService.validatePlayer({
          categoryId: product.fazerCategoryId,
          fields,
        })
        validatedPlayerId = validation.playerId || validatedPlayerId
      }

      addToCart({
        product,
        playerId: validatedPlayerId,
        whatsappNumber,
        email,
        fazerFields: fields,
      })

      navigate('/checkout')
    } catch (error) {
      setErrors({
        form: error instanceof Error
          ? error.message
          : 'FazerCards n’a pas pu traiter ces informations',
      })
    } finally {
      setValidating(false)
    }
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
            <h2 className="text-2xl font-bold text-white mb-6">
              {product.requiresPlayerValidation ? 'Valider votre commande' : 'Informations de commande'}
            </h2>

            <div className="space-y-4">
              {errors.form && (
                <p className="rounded-lg bg-red-900/40 p-3 text-sm text-red-200" role="alert">
                  {errors.form}
                </p>
              )}
              {validationFields.map((field) => {
                if (!field.key) return null

                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-white mb-2">
                      {field.label || field.key} *
                    </label>
                    <Input
                      type="text"
                      placeholder={field.label || field.key}
                      value={fazerFields[field.key] || ''}
                      onChange={(event) =>
                        setFazerFields((current) => ({
                          ...current,
                          [field.key as string]: event.target.value,
                        }))
                      }
                      error={errors[field.key]}
                      helperText={field.options?.length
                        ? `Valeurs acceptées: ${field.options.map((option) => JSON.stringify(option)).join(', ')}`
                        : product.requiresPlayerValidation
                          ? t('product.playerIdHelp')
                          : undefined}
                    />
                  </div>
                )
              })}

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
                message={product.requiresPlayerValidation
                  ? 'Vérifiez attentivement votre Player ID avant de continuer'
                  : 'Les champs demandés proviennent directement de FazerCards.'}
              />

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleContinue}
                isLoading={validating}
              >
                {validating ? 'Vérification en cours…' : t('common.continue')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
