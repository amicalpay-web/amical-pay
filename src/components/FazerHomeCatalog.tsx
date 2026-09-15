import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Alert, Button, Card, Input, LoadingSpinner } from '@/components'
import { productsService } from '@/services/productsService'
import { FazerCatalogItem } from '@/types'

type CategoryLoadState = 'loading' | 'loaded' | 'error'

interface CatalogViewItem extends FazerCatalogItem {
  loadState: CategoryLoadState
}

/**
 * Real FazerCards catalog embedded on the home page.
 *
 * This intentionally reuses productsService as-is (getCatalog /
 * getCatalogWithProducts / retryCategoryProducts) instead of duplicating
 * catalog-loading logic: categories load first, then each category's real
 * offers load independently (Promise.allSettled under the hood), so one
 * failing category never blocks the others. "All catalogs" is a frontend
 * filter only and is never sent to the backend as a category.
 */
export function FazerHomeCatalog() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
        setSelectedCategoryId('')
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
          product.categoryName?.toLowerCase().includes(normalizedQuery) ||
          category.category.category_name.toLowerCase().includes(normalizedQuery)
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
  const visibleOfferCount = visibleCategories.reduce(
    (total, category) => total + (filteredProductsByCategory.get(category.category.category_id)?.length || 0),
    0
  )
  const allCategoriesLoaded = categories.length > 0 && categories.every((category) => category.loadState !== 'loading')

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    const targetId = categoryId ? `home-catalog-${categoryId}` : 'home-catalog'
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <section id="home-catalog" className="scroll-mt-8 bg-amical-dark px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-amical-orange">
            {t('home.catalogEyebrow')}
          </p>
          <h2 className="mb-3 text-3xl font-bold text-white">{t('home.catalogTitle')}</h2>
          <p className="mx-auto max-w-2xl text-gray-400">{t('home.catalogSubtitle')}</p>
        </div>

        {loading && (
          <div className="py-16">
            <LoadingSpinner />
            <p className="mt-4 text-center text-gray-400">{t('products.catalogLoading')}</p>
          </div>
        )}

        {!loading && error && (
          <Alert type="error" title={t('products.catalogLoadError')} message={error} />
        )}

        {!loading && !error && categories.length === 0 && (
          <Card>
            <p className="text-center text-gray-400">{t('products.noOffers')}</p>
          </Card>
        )}

        {!loading && !error && categories.length > 0 && (
          <>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-gray-400">
                {t('products.catalogSummary', { categories: categories.length, offers: loadedOfferCount })}
              </p>
              {normalizedQuery && (
                <p className="font-semibold text-amical-orange">
                  {t('products.searchResults', { count: visibleOfferCount })}
                </p>
              )}
            </div>

            <div className="mb-6 max-w-md">
              <Input
                label={t('common.search')}
                placeholder={t('products.searchPlaceholder')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div
              className="-mx-4 mb-10 flex gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:flex-wrap md:px-0"
              role="tablist"
              aria-label={t('products.categories')}
            >
              <button
                type="button"
                role="tab"
                aria-selected={!selectedCategoryId}
                onClick={() => selectCategory('')}
                className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  !selectedCategoryId
                    ? 'border-amical-orange bg-amical-dark-secondary text-white'
                    : 'border-amical-dark-tertiary text-gray-300 hover:border-amical-orange/50'
                }`}
              >
                {t('products.allCatalogs')}
              </button>
              {categories.map((category) => {
                const categoryId = category.category.category_id
                return (
                  <button
                    key={categoryId}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategoryId === categoryId}
                    onClick={() => selectCategory(categoryId)}
                    className={`shrink-0 rounded-lg border px-4 py-2 text-left text-sm transition ${
                      selectedCategoryId === categoryId
                        ? 'border-amical-orange bg-amical-dark-secondary text-white'
                        : 'border-amical-dark-tertiary text-gray-300 hover:border-amical-orange/50'
                    }`}
                  >
                    <span className="block whitespace-nowrap font-semibold">{category.category.category_name}</span>
                    <span className="block text-xs text-gray-400">
                      {t('products.offersCount', { count: category.products.length })}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-14">
              {visibleCategories.map((category) => {
                const categoryId = category.category.category_id
                const filteredProducts = filteredProductsByCategory.get(categoryId) || []
                const categoryDescription = category.category.description
                const categoryImage = category.category.image_url

                return (
                  <div key={categoryId} id={`home-catalog-${categoryId}`} className="scroll-mt-8">
                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div className="flex items-start gap-4">
                        {categoryImage ? (
                          <img
                            src={categoryImage}
                            alt=""
                            className="h-14 w-14 rounded-lg border border-amical-dark-tertiary object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-amical-dark-tertiary bg-amical-dark-secondary text-amical-orange">
                            <Package size={22} />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-white">{category.category.category_name}</h3>
                          {categoryDescription && (
                            <p className="mt-1 max-w-2xl whitespace-pre-line text-sm text-gray-400">
                              {categoryDescription}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm text-gray-400">
                        {t('products.offersCount', { count: category.products.length })}
                      </span>
                    </div>

                    {category.loadState === 'loading' && (
                      <Card>
                        <LoadingSpinner size="sm" />
                        <p className="mt-3 text-center text-sm text-gray-400">{t('products.offersLoading')}</p>
                      </Card>
                    )}

                    {category.loadState === 'error' && (
                      <div className="space-y-3">
                        <Alert type="warning" title={t('products.categoryLoadError')} message={category.error} />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => void retryCategory(categoryId)}
                        >
                          {t('products.retry')}
                        </Button>
                      </div>
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
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
                          <Card key={product.id} className="flex flex-col">
                            {product.image && (
                              <img src={product.image} alt="" className="mb-4 h-32 w-full rounded-lg object-cover" />
                            )}
                            <div className="flex-1">
                              <div className="mb-2 flex items-start justify-between gap-3">
                                <h4 className="text-lg font-bold text-white">{product.name}</h4>
                                {product.popular && (
                                  <span className="shrink-0 rounded-full bg-amical-orange px-2.5 py-1 text-xs font-bold text-white">
                                    {t('products.popular')}
                                  </span>
                                )}
                              </div>
                              <p className="mb-4 whitespace-pre-line text-sm text-gray-400">{product.description}</p>
                            </div>

                            <div className="border-t border-amical-dark-tertiary pt-4">
                              <div className="mb-4 grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-gray-400">{t('home.priceUsd')}</p>
                                  <p className="text-lg font-bold text-amical-orange">
                                    ${product.sellingPriceUsd.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">{t('home.priceHtg')}</p>
                                  <p className="text-lg font-bold text-white">
                                    HTG {product.sellingPriceHtg.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs text-gray-400">{t('products.availability')}</p>
                                <p
                                  className={`text-sm font-semibold ${
                                    product.availability === 'in_stock'
                                      ? 'text-green-400'
                                      : product.availability === 'limited'
                                        ? 'text-amber-300'
                                        : 'text-red-400'
                                  }`}
                                >
                                  {product.availability === 'in_stock'
                                    ? t('products.inStock')
                                    : product.availability === 'limited'
                                      ? t('products.limited')
                                      : t('products.outOfStock')}
                                </p>
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
                  </div>
                )
              })}
            </div>

            {normalizedQuery && allCategoriesLoaded && visibleOfferCount === 0 && (
              <Card className="mt-10">
                <p className="text-center text-gray-400">{t('products.noSearchResults')}</p>
              </Card>
            )}

            <div className="mt-14 text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 font-semibold text-amical-orange transition hover:text-amical-orange-dark"
              >
                {t('home.viewFullCatalog')}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
