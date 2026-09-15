import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { Button, Card, Input, LoadingSpinner } from '@/components'
import { productsService } from '@/services/productsService'
import { FazerCatalogItem } from '@/types'

function Products() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { currency } = useAppContext()
  const [categories, setCategories] = useState<FazerCatalogItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadedCategories, setLoadedCategories] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let active = true
    const loadCatalog = async () => {
      setLoading(true)
      setError('')
      try {
        const catalog = await productsService.getCatalog()
        if (!active) return
        setCategories(catalog.categories)
        setSelectedCategoryId((current) =>
          current && catalog.categories.some((category) => category.category.category_id === current)
            ? current
            : catalog.categories[0]?.category.category_id || ''
        )
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le catalogue FazerCards')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadCatalog()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) return
    const selected = categories.find(
      (category) => category.category.category_id === selectedCategoryId
    )
    if (!selected || loadedCategories[selectedCategoryId]) return

    let active = true
    void productsService.getCategoryProducts(selectedCategoryId)
      .then((products) => {
        if (!active) return
        setCategories((current) => current.map((category) =>
          category.category.category_id === selectedCategoryId
            ? { ...category, products }
            : category
        ))
        setLoadedCategories((current) => ({ ...current, [selectedCategoryId]: true }))
      })
      .catch((loadError) => {
        if (active) {
          setLoadedCategories((current) => ({ ...current, [selectedCategoryId]: true }))
          setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les offres')
        }
      })

    return () => {
      active = false
    }
  }, [categories, loadedCategories, selectedCategoryId])

  const selectedCategory = categories.find(
    (category) => category.category.category_id === selectedCategoryId
  )
  const filteredProducts = useMemo(() => {
    const products = selectedCategory?.products || []
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return products
    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery)
    )
  }, [searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">{t('products.title')}</h1>
          <p className="text-gray-400">Catalogue complet FazerCards, chargé dynamiquement.</p>
        </div>

        {loading ? (
          <LoadingSpinner fullScreen />
        ) : error ? (
          <Card>
            <p className="text-red-300" role="alert">{error}</p>
            <p className="text-gray-400 mt-2">Le catalogue réel n’est pas disponible pour le moment.</p>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.category.category_id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.category.category_id)}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    selectedCategoryId === category.category.category_id
                      ? 'border-amical-orange bg-amical-dark-secondary text-white'
                      : 'border-amical-dark-tertiary text-gray-300 hover:border-amical-orange/50'
                  }`}
                >
                  <span className="font-semibold">{category.category.category_name}</span>
                  <span className="block text-xs text-gray-400">
                    {category.products.length} offre{category.products.length === 1 ? '' : 's'}
                  </span>
                </button>
              ))}
            </div>

            <Input
              placeholder={t('products.searchPlaceholder')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-md mb-8"
            />

            {selectedCategory?.error && (
              <Card className="mb-6">
                <p className="text-amber-300">
                  Cette catégorie n’a pas pu être chargée depuis FazerCards : {selectedCategory.error}
                </p>
              </Card>
            )}

            {filteredProducts.length === 0 ? (
              <p className="text-gray-400 text-lg">Aucune offre disponible dans cette catégorie.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{product.name}</h3>
                          {product.diamonds > 0 && (
                            <p className="text-amical-orange font-semibold mt-1">💎 {product.diamonds}</p>
                          )}
                        </div>
                        {product.popular && (
                          <span className="bg-amical-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                            Populaire
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                    </div>

                    <div className="border-t border-amical-dark-tertiary pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">{t('products.price')}</p>
                          <p className="text-2xl font-bold text-amical-orange">
                            {currency === 'USD' ? '$' : 'G'}
                            {currency === 'USD'
                              ? product.sellingPriceUsd.toFixed(2)
                              : product.sellingPriceHtg.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">{t('products.availability')}</p>
                          <p className={`text-sm font-semibold ${
                            product.availability === 'in_stock' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {product.availability === 'in_stock'
                              ? t('products.inStock')
                              : t('products.outOfStock')}
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)}
                        disabled={product.availability === 'out_of_stock'}
                      >
                        {t('common.buy')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products