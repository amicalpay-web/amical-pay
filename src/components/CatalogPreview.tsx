import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, LayoutGrid, Package } from 'lucide-react'
import { Button } from './Button'
import { OfferImage } from './OfferImage'
import { productsService } from '@/services/productsService'
import { FazerCatalogItem } from '@/types'

const MAX_CATEGORIES = 6

function CategoryCardSkeleton() {
  return (
    <div className="rounded-xl border border-amical-dark-tertiary bg-amical-dark-secondary p-4">
      <div className="mb-3 h-20 w-full animate-pulse rounded-lg bg-amical-dark-tertiary" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-amical-dark-tertiary" />
    </div>
  )
}

/**
 * A deliberately small preview of the catalog. With 300+ categories in the
 * live FazerCards catalog, the homepage teases a handful and sends people to
 * /products for the rest — it never tries to render the whole list here.
 */
export function CatalogPreview() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<FazerCatalogItem[]>([])
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    let active = true

    productsService
      .getCatalog()
      .then((catalog) => {
        if (!active) return
        const others = catalog.categories.filter(
          (category) => !category.category.category_name?.toLowerCase().includes('free fire')
        )
        setCategories(others.slice(0, MAX_CATEGORIES))
        setStatus('loaded')
      })
      .catch(() => {
        if (active) setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  if (status === 'error') return null

  return (
    <section className="bg-amical-dark-secondary/40 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-2 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide text-amical-orange">
            <LayoutGrid size={16} />
            Catalogue complet
          </p>
          <h2 className="text-3xl font-bold text-white">Explorez tout le catalogue</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-400">
            Des milliers d'offres disponibles dans de nombreuses catégories.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {status === 'loading' &&
            Array.from({ length: MAX_CATEGORIES }).map((_, index) => <CategoryCardSkeleton key={index} />)}

          {status === 'loaded' &&
            categories.map((category) => (
              <Link
                key={category.category.category_id}
                to={`/products?category=${encodeURIComponent(category.category.category_id)}`}
                className="group rounded-xl border border-amical-dark-tertiary bg-amical-dark-secondary p-4 transition hover:border-amical-orange/50"
              >
                <OfferImage
                  src={category.category.image_url}
                  alt={category.category.category_name}
                  icon={Package}
                  className="mb-3 h-20 w-full rounded-lg"
                />
                <p className="truncate text-sm font-semibold text-white group-hover:text-amical-orange">
                  {category.category.category_name}
                </p>
              </Link>
            ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" onClick={() => navigate('/products')}>
            <span className="flex items-center gap-2">
              Voir toutes les catégories
              <ArrowRight size={18} />
            </span>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CatalogPreview
