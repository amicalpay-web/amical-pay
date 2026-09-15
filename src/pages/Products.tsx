import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { Button, Card, Input, LoadingSpinner } from '@/components'
import { productsService } from '@/services/productsService'
import { FazerCatalogItem } from '@/types'

type CategoryLoadState = 'loading' | 'loaded' | 'error'

interface CatalogViewItem extends FazerCatalogItem {
  loadState: CategoryLoadState
}

function Products() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategoryId = searchParams.get('category') || ''
  const { t } = useTranslation()
  const { currency } = useAppContext()
  const [categories, setCategories] = useState<CatalogViewItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => () => {
    mountedRef.current = false
  }, [])

  useEffect(() => {
    let active = true

    const loadCatalog = async () => {
      setLoading(true)
      setError('')

      try {
        const catalog = await productsService.getCatalog()
        if (!active) return

        const initialCategories = catalog.categories.map((category) => ({
          ...category,
          products: [],
          loadState: 'loading' as const,
        }))
        setCategories(initialCategories)
        setLoading(false)

        void productsService.getCatalogWithProducts(catalog, (update) => {
          if (!active) return

          setCategories((current) => current.map((category) =>
            category.category.category_id === update.categoryId
              ? {
                ...category,
                products: update.products,
                error: update.error,
                loadState: update.error ? 'error' : 'loaded',
              }
              : category
          ))
        }).catch((loadError: unknown) => {
          if (active) {
            setError(loadError instanceof Error ? loadError.message : t('products.catalogLoadError'))
          }
        })
      } catch (loadError: unknown) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : t('products.catalogLoadError'))
          setLoading(false)
        }
      }
    }

    void loadCatalog()
    return () => {
      active = false
    }
  }, [t])


  useEffect(() => {
    if (categories.length === 0) return

    const categoryExists = categories.some((category) =>
      category.category.category_id === requestedCategoryId
    )
    setSelectedCategoryId(categoryExists ? requestedCategoryId : '')
  }, [requestedCategoryId, categories.length])

  const retryCategory = async (categoryId: string) => {
    setCategories((current) => current.map((category) =>
      category.category.category_id === categoryId
        ? { ...category, loadState: 'loading', error: undefined, products: [] }
        : category
    ))

    try {
      const products = await productsService.retryCategoryProducts(categoryId)
      if (!mountedRef.current) return
      setCategories((current) => current.map((category) =>
        category.category.category_id === categoryId
          ? { ...category, products, error: undefined, loadState: 'loaded' }
          : category
      ))
    } catch (loadError: unknown) {
      if (!mountedRef.current) return
      setCategories((current) => current.map((category) =>
        category.category.category_id === categoryId
          ? {
            ...category,
            products: [],
            error: loadError instanceof Error ? loadError.message : t('products.categoryLoadError'),
            loadState: 'error',
          }
          : category
      ))
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredProductsByCategory = useMemo(() => {
    const productsByCategory = new Map<string, CatalogViewItem['products']>()

    categories.forEach((category) => {
      const products = normalizedQuery
        ? category.products.filter((product) =>
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.description.toLowerCase().includes(normalizedQuery) ||
          product.categoryName?.toLowerCase().includes(normalizedQuery)
        )
        : category.products
      productsByCategory.set(category.category.category_id, products)
    })

    return productsByCategory
  }, [categories, normalizedQuery])

  const visibleCategories = selectedCategoryId
    ? categories.filter((category) => category.category.category_id === selectedCategoryId)
    : categories
  const loadedOfferCount = categories.reduce((total, category) => total + category.products.length, 0)
  const allCategoriesLoaded = categories.every((category) => category.loadState !== 'loading')
  const visibleOfferCount = visibleCategories.reduce(
    (total, category) => total + (filteredProductsByCategory.get(category.category.category_id)?.length || 0),
    0
  )

  const selectCategory = (categoryId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    if (categoryId) {
      nextSearchParams.set('category', categoryId)
    } else {
      nextSearchParams.delete('category')
    }
    setSearchParams(nextSearchParams, { replace: true })
    setSelectedCategoryId(categoryId)
    if (!categoryId) {
      window.requestAnimationFrame(() => {
        document.getElementById('all-catalogs')?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }

    window.requestAnimationFrame(() => {
      document.getElementById(`catalog-${categoryId}`)?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amical-dark py-12 px-4">
        <LoadingSpinner fullScreen />
        <p className="sr-only">{t('products.catalogLoading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amical-dark py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card>
            <p className="text-red-300" role="alert">{error}</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">{t('products.title')}</h1>
          <p className="text-gray-400">{t('products.subtitle')}</p>
        </header>

        <section id="all-catalogs" className="mb-8">
          <Card className="border-amical-orange/30">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{t('products.allCatalogs')}</h2>
                <p className="text-gray-400 mt-1">
                  {t('products.catalogSummary', {
                    categories: categories.length,
                    offers: loadedOfferCount,
                  })}
                </p>
              </div>
              {normalizedQuery && (
                <p className="text-amical-orange font-semibold">
                  {t('products.searchResults', { count: visibleOfferCount })}
                </p>
              )}
            </div>
          </Card>
        </section>

        <section aria-labelledby="catalog-navigation-title" className="mb-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 id="catalog-navigation-title" className="text-xl font-semibold text-white">
              {t('products.categories')}
            </h2>
            <span className="text-sm text-gray-400">{t('products.viewCatalog')}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              size="sm"
              variant={selectedCategoryId ? 'secondary' : 'primary'}
              aria-pressed={!selectedCategoryId}
              onClick={() => selectCategory('')}
            >
              {t('products.allCatalogs')}
            </Button>
            {categories.map((category) => {
              const categoryId = category.category.category_id
              return (
                <a
                  key={categoryId}
                  href={`#catalog-${categoryId}`}
                  onClick={() => selectCategory(categoryId)}
                  className={`rounded-lg border px-4 py-2 text-sm transition ${
                    selectedCategoryId === categoryId
                      ? 'border-amical-orange bg-amical-dark-secondary text-white'
                      : 'border-amical-dark-tertiary text-gray-300 hover:border-amical-orange/50'
                  }`}
                  aria-current={selectedCategoryId === categoryId ? 'true' : undefined}
                >
                  <span className="font-semibold">{category.category.category_name}</span>
                  <span className="block text-xs text-gray-400">
                    {t('products.offersCount', { count: category.products.length })}
                  </span>
                </a>
              )
            })}
          </div>
        </section>

        <div className="mb-10 max-w-md">
          <Input
            label={t('common.search')}
            placeholder={t('products.searchPlaceholder')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="space-y-12">
          {visibleCategories.map((category) => {
            const categoryId = category.category.category_id
            const filteredProducts = filteredProductsByCategory.get(categoryId) || []
            const categoryDescription = category.category.description
            const categoryImage = category.category.image_url

            return (
              <section
                key={categoryId}
                id={`catalog-${categoryId}`}
                aria-labelledby={`catalog-title-${categoryId}`}
                className="scroll-mt-8"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-5">
                  <div className="flex gap-4 items-start">
                    {categoryImage && (
                      <img
                        src={categoryImage}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover border border-amical-dark-tertiary"
                      />
                    )}
                    <div>
                      <h2 id={`catalog-title-${categoryId}`} className="text-2xl font-bold text-white">
                        {category.category.category_name}
                      </h2>
                      {categoryDescription && (
                        <p className="text-gray-400 mt-1 whitespace-pre-line max-w-3xl">
                          {categoryDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {t('products.offersCount', { count: category.products.length })}
                  </span>
                </div>

                {category.loadState === 'loading' && (
                  <Card>
                    <LoadingSpinner size="sm" />
                    <p className="text-gray-400 text-center mt-3">{t('products.offersLoading')}</p>
                  </Card>
                )}

                {category.loadState === 'error' && (
                  <Card className="border-amber-500/50">
                    <p className="text-amber-300" role="alert">{t('products.categoryLoadError')}</p>
                    {category.error && <p className="text-gray-400 text-sm mt-2">{category.error}</p>}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="mt-4"
                      onClick={() => void retryCategory(categoryId)}
                    >
                      {t('products.retry')}
                    </Button>
                  </Card>
                )}

                {category.loadState === 'loaded' && category.products.length === 0 && (
                  <Card>
                    <p className="text-gray-400">{t('products.noOffers')}</p>
                  </Card>
                )}

                {category.loadState === 'loaded' && category.products.length > 0 && filteredProducts.length === 0 && (
                  <Card>
                    <p className="text-gray-400">{t('products.noSearchResults')}</p>
                  </Card>
                )}

                {category.loadState === 'loaded' && filteredProducts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="flex flex-col">
                        {product.image && (
                          <img
                            src={product.image}
                            alt=""
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div>
                              <h3 className="text-xl font-bold text-white">{product.name}</h3>
                              {product.diamonds > 0 && (
                                <p className="text-amical-orange font-semibold mt-1">💎 {product.diamonds}</p>
                              )}
                            </div>
                            {product.popular && (
                              <span className="bg-amical-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                                {t('products.popular')}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-4 whitespace-pre-line">{product.description}</p>
                        </div>

                        <div className="border-t border-amical-dark-tertiary pt-4">
                          <div className="flex items-center justify-between mb-4 gap-4">
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
                                product.availability === 'in_stock'
                                  ? 'text-green-400'
                                  : product.availability === 'limited'
                                    ? 'text-amber-300'
                                    : 'text-red-400'
                              }`}>
                                {product.availability === 'in_stock'
                                  ? t('products.inStock')
                                  : product.availability === 'limited'
                                    ? t('products.limited')
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
              </section>
            )
          })}
        </div>

        {normalizedQuery && allCategoriesLoaded && visibleOfferCount === 0 && (
          <Card className="mt-10">
            <p className="text-gray-400 text-center">{t('products.noSearchResults')}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Products