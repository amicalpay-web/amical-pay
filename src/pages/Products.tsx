import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import { Button, Card, LoadingSpinner } from '@/components'
import { CategoryDropdown } from '@/components/CategoryDropdown'
import { productsService } from '@/services/productsService'
import type { FazerCatalogItem, Product } from '@/types'

type CategoryLoadState = 'idle' | 'loading' | 'loaded' | 'error'

interface CatalogViewItem extends FazerCatalogItem {
  loadState: CategoryLoadState
}

const FEATURED_GAME_KEYWORDS = [
  'free fire',
  'mobile legends',
  'pubg',
  'valorant',
  'roblox',
  'fortnite',
  'call of duty',
  'minecraft',
  'league of legends',
  'fifa',
]

function isFeaturedCategory(category: CatalogViewItem): boolean {
  const name = category.category.category_name.toLowerCase()
  return FEATURED_GAME_KEYWORDS.some((keyword) => name.includes(keyword))
}

function getFeaturedCategories(categories: CatalogViewItem[]): CatalogViewItem[] {
  const matches = categories.filter(isFeaturedCategory).slice(0, 4)
  const selectedIds = new Set(matches.map((category) => category.category.category_id))
  const fallback = categories
    .filter((category) => !selectedIds.has(category.category.category_id))
    .slice(0, Math.max(0, 4 - matches.length))
  return [...matches, ...fallback]
}

function Products() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategoryId = searchParams.get('category') || ''
  const searchQuery = searchParams.get('q')?.trim() || ''
  const initialRequestedCategoryId = useRef(requestedCategoryId)
  const { t } = useTranslation()
  const { currency } = useAppContext()
  const [categories, setCategories] = useState<CatalogViewItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => () => {
    mountedRef.current = false
  }, [])

  useEffect(() => {
    let active = true

    if (!searchQuery) {
      setSearchResults([])
      setSearchLoading(false)
      setSearchError('')
      return () => {
        active = false
      }
    }

    setSearchLoading(true)
    setSearchError('')
    productsService.searchProducts(searchQuery)
      .then((products) => {
        if (active) setSearchResults(products)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setSearchResults([])
          setSearchError(loadError instanceof Error ? loadError.message : 'Impossible de lancer la recherche.')
        }
      })
      .finally(() => {
        if (active) setSearchLoading(false)
      })

    return () => {
      active = false
    }
  }, [searchQuery])

  useEffect(() => {
    let active = true

    const loadCatalog = async () => {
      setLoadingCatalog(true)
      setError('')

      try {
        const catalog = await productsService.getCatalog()
        if (!active) return

        const initialCategories = catalog.categories.map((category) => ({
          ...category,
          products: [],
          loadState: 'idle' as const,
        }))
        setCategories(initialCategories)

        const requestedCategoryExists = initialCategories.some((category) =>
          category.category.category_id === initialRequestedCategoryId.current
        )
        const firstFeaturedCategory = getFeaturedCategories(initialCategories)[0]
        const initialCategoryId = requestedCategoryExists
          ? initialRequestedCategoryId.current
          : firstFeaturedCategory?.category.category_id || initialCategories[0]?.category.category_id || ''
        setSelectedCategoryId(initialCategoryId)
        setLoadingCatalog(false)
      } catch (loadError: unknown) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : t('products.catalogLoadError'))
          setLoadingCatalog(false)
        }
      }
    }

    void loadCatalog()
    return () => {
      active = false
    }
  }, [t])

  useEffect(() => {
    if (!requestedCategoryId || categories.length === 0 || requestedCategoryId === selectedCategoryId) return
    const categoryExists = categories.some((category) =>
      category.category.category_id === requestedCategoryId
    )
    if (categoryExists) setSelectedCategoryId(requestedCategoryId)
  }, [requestedCategoryId, categories, selectedCategoryId])

  const loadCategory = useCallback(async (categoryId: string, force = false) => {
    if (!categoryId) return

    setCategories((current) => current.map((category) =>
      category.category.category_id === categoryId
        ? { ...category, loadState: 'loading', error: undefined, products: force ? [] : category.products }
        : category
    ))

    try {
      const products = await productsService[force ? 'retryCategoryProducts' : 'getCategoryProducts'](categoryId)
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
  }, [t])

  useEffect(() => {
    const selectedCategory = categories.find((category) =>
      category.category.category_id === selectedCategoryId
    )
    if (!selectedCategory || selectedCategory.loadState !== 'idle') return
    void loadCategory(selectedCategoryId)
  }, [categories, loadCategory, selectedCategoryId])

  const selectedCategory = categories.find((category) =>
    category.category.category_id === selectedCategoryId
  )
  const isLoadingOffers = selectedCategory?.loadState === 'loading'

  const selectCategory = (categoryId: string) => {
    if (!categoryId || isLoadingOffers) return
    setSelectedCategoryId(categoryId)
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('category', categoryId)
    setSearchParams(nextSearchParams, { replace: true })
  }

  if (loadingCatalog) {
    return (
      <div className="min-h-screen bg-amical-dark px-4 py-12">
        <LoadingSpinner fullScreen />
        <p className="sr-only">{t('products.catalogLoading')}</p>
      </div>
    )
  }

  if (searchQuery) {
    return (
      <main className="min-h-screen bg-amical-dark px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-amical-orange">Recherche Amical Pay</p>
            <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              Résultats pour « {searchQuery} »
            </h1>
            <p className="text-gray-400">
              Recherchez dans les produits et les catégories disponibles.
            </p>
          </header>

          {searchLoading && (
            <Card>
              <LoadingSpinner size="sm" />
              <p className="mt-3 text-center text-gray-400">Recherche en cours…</p>
            </Card>
          )}

          {!searchLoading && searchError && (
            <Card>
              <p className="text-red-300" role="alert">{searchError}</p>
            </Card>
          )}

          {!searchLoading && !searchError && searchResults.length === 0 && (
            <Card>
              <p className="text-center text-gray-400">Aucun produit ne correspond à votre recherche.</p>
            </Card>
          )}

          {!searchLoading && !searchError && searchResults.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {searchResults.map((product) => (
                <Card key={product.id} className="flex flex-col">
                  {product.image && (
                    <img src={product.image} alt="" className="mb-4 h-32 w-full rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amical-orange">
                      {product.categoryName || 'Catalogue'}
                    </p>
                    <h2 className="text-xl font-bold text-white">{product.name}</h2>
                    <p className="mt-2 text-sm text-gray-400">{product.description}</p>
                  </div>
                  <div className="mt-5 border-t border-amical-dark-tertiary pt-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-400">{t('products.price')}</p>
                        <p className="text-2xl font-bold text-amical-orange">
                          {currency === 'USD' ? '$' : 'G'}
                          {(currency === 'USD' ? product.sellingPriceUsd : product.sellingPriceHtg).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-green-400">{t('products.inStock')}</p>
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
      </main>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amical-dark px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <p className="text-red-300" role="alert">{error}</p>
          </Card>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-amical-dark px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <p className="text-center text-gray-400">{t('products.noGames')}</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-amical-dark px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Compact header: eyebrow + selected game + 3D category switcher in one raised bar,
            replacing the old separate hero block + label to shorten the page. */}
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-amical-dark-secondary to-amical-dark p-4 shadow-[0_18px_36px_-20px_rgba(0,0,0,0.8)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            {selectedCategory.category.image_url ? (
              <img
                src={selectedCategory.category.image_url}
                alt=""
                className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover shadow-lg shadow-black/40"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-amical-dark-tertiary text-amical-orange shadow-lg shadow-black/40">
                <Gamepad2 size={22} />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amical-orange">
                {t('products.eyebrow')}
              </p>
              <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
                {selectedCategory.category.category_name}
              </h1>
            </div>
          </div>

          <CategoryDropdown
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={selectCategory}
            disabled={Boolean(isLoadingOffers)}
            label={t('products.otherGames')}
            ariaLabel={t('products.chooseGame')}
          />
        </header>

        <section aria-labelledby="selected-game-title" className="scroll-mt-8">
          <h2 id="selected-game-title" className="sr-only">{selectedCategory.category.category_name}</h2>

          {selectedCategory.category.description && (
            <p className="mb-6 max-w-3xl whitespace-pre-line text-sm text-gray-400">
              {selectedCategory.category.description}
            </p>
          )}

          {selectedCategory.loadState === 'loading' && (
            <Card>
              <LoadingSpinner size="sm" />
              <p className="mt-3 text-center text-gray-400">{t('products.loadingGame')}</p>
            </Card>
          )}

          {selectedCategory.loadState === 'error' && (
            <Card className="border-amber-500/50">
              <p className="text-amber-300" role="alert">{t('products.categoryLoadError')}</p>
              {selectedCategory.error && <p className="mt-2 text-sm text-gray-400">{selectedCategory.error}</p>}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() => void loadCategory(selectedCategoryId, true)}
              >
                {t('products.retry')}
              </Button>
            </Card>
          )}

          {selectedCategory.loadState === 'loaded' && selectedCategory.products.length === 0 && (
            <Card>
              <p className="text-gray-400">{t('products.noOffers')}</p>
            </Card>
          )}

          {selectedCategory.loadState === 'loaded' && selectedCategory.products.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-400">
                  {t('products.loadedOffers', { count: selectedCategory.products.length })}
                </p>
                <p className="hidden text-xs text-gray-500 sm:block">{t('products.gameSelectionHint')}</p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {selectedCategory.products.map((product) => (
                  <Card
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_44px_-18px_rgba(0,0,0,0.65)]"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    {product.image && (
                      <img src={product.image} alt="" className="mb-4 h-32 w-full rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">{product.name}</h3>
                          {product.diamonds > 0 && (
                            <p className="mt-1 font-semibold text-amical-orange">💎 {product.diamonds}</p>
                          )}
                        </div>
                        {product.popular && (
                          <span className="rounded-full bg-amical-orange px-3 py-1 text-xs font-bold text-white shadow-md shadow-amical-orange/30">
                            {t('products.popular')}
                          </span>
                        )}
                      </div>
                      <p className="mb-4 whitespace-pre-line text-sm text-gray-400">{product.description}</p>
                    </div>

                    <div className="border-t border-amical-dark-tertiary pt-4">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-400">{t('products.price')}</p>
                          <p className="text-2xl font-bold text-amical-orange">
                            {currency === 'USD' ? '$' : 'G'}
                            {currency === 'USD'
                              ? product.sellingPriceUsd.toFixed(2)
                              : product.sellingPriceHtg.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{t('products.availability')}</p>
                          <p className={'text-sm font-semibold ' + (
                            product.availability === 'in_stock'
                              ? 'text-green-400'
                              : product.availability === 'limited'
                                ? 'text-amber-300'
                                : 'text-red-400'
                          )}>
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
                        onClick={() => navigate('/products/' + encodeURIComponent(product.id))}
                        disabled={product.availability === 'out_of_stock'}
                      >
                        {t('common.buy')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default Products
