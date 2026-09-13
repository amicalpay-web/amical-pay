import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { Button, Card, Input, LoadingSpinner } from '@/components'
import { productsService } from '@/services/productsService'
import { Product } from '@/types'

function Products() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { region, currency } = useAppContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      const data = await productsService.getProductsByRegion(region)
      setProducts(data)
      setLoading(false)
    }
    loadProducts()
  }, [region])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">{t('products.title')}</h1>
          <p className="text-gray-400">{t('products.subtitle')}</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder={t('products.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner fullScreen />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t('products.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{product.name}</h3>
                      {product.diamonds > 0 && (
                        <p className="text-amical-orange font-semibold mt-1">
                          💎 {product.diamonds}
                        </p>
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
                      <p
                        className={`text-sm font-semibold ${
                          product.availability === 'in_stock'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {product.availability === 'in_stock'
                          ? t('products.inStock')
                          : t('products.outOfStock')}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/products/${product.id}`)}
                    disabled={product.availability === 'out_of_stock'}
                  >
                    {t('common.buy')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
