import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Grid3x3, Package, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, LoadingSpinner } from '@/components'
import { productsService } from '@/services/productsService'
import type { FazerCatalogItem } from '@/types'

const LOCAL_CATALOG_IMAGES: Record<string, string> = {
  playstation: '/catalogs/playstation.jpg',
  xbox: '/catalogs/xbox.jpg',
  steam: '/catalogs/steam.jpg',
  roblox: '/catalogs/roblox.jpg',
}

function getLocalImage(name: string): string | undefined {
  const normalized = name.toLowerCase()
  return Object.entries(LOCAL_CATALOG_IMAGES).find(([keyword]) => normalized.includes(keyword))?.[1]
}

function Catalogues() {
  const [categories, setCategories] = useState<FazerCatalogItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    productsService.getCatalog()
      .then((catalog) => {
        if (active) setCategories(catalog.categories)
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les catalogues.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const visibleCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return categories
    return categories.filter((item) =>
      item.category.category_name.toLowerCase().includes(normalizedQuery) ||
      item.category.description?.toLowerCase().includes(normalizedQuery),
    )
  }, [categories, query])

  return (
    <main className="min-h-screen bg-amical-dark px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-amical-orange">Amical Pay</p>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Nos catalogues</h1>
          <p className="text-gray-400">
            Parcourez les catégories disponibles, puis ouvrez le catalogue correspondant pour voir les offres.
          </p>
        </header>

        <label className="mb-8 flex max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-amical-dark-secondary px-4 py-3">
          <Search size={18} className="shrink-0 text-amical-orange" />
          <span className="sr-only">Rechercher un catalogue</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un catalogue…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </label>

        {loading && <LoadingSpinner fullScreen />}

        {!loading && error && (
          <Card>
            <p className="text-red-300" role="alert">{error}</p>
          </Card>
        )}

        {!loading && !error && visibleCategories.length === 0 && (
          <Card>
            <p className="text-center text-gray-400">Aucun catalogue ne correspond à votre recherche.</p>
          </Card>
        )}

        {!loading && !error && visibleCategories.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((item) => {
              const categoryName = item.category.category_name
              const image = getLocalImage(categoryName) || item.category.image_url
              return (
                <Link
                  key={item.category.category_id}
                  to={`/products?category=${encodeURIComponent(item.category.category_id)}`}
                  className="group relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-amical-dark-secondary transition hover:border-amical-orange/60"
                >
                  {image ? (
                    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 transition group-hover:opacity-50" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amical-orange/20 to-transparent">
                      <Package size={52} className="text-amical-orange/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="relative flex h-full min-h-56 flex-col justify-end p-5">
                    <div className="mb-3 flex items-center gap-2 text-amical-orange">
                      <Grid3x3 size={17} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Catalogue</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{categoryName}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-300">
                      {item.category.description || 'Voir les offres disponibles dans cette catégorie.'}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amical-orange">
                      Voir les produits <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default Catalogues