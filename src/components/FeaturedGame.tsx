import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Gem } from 'lucide-react'
import { Button } from './Button'
import { OfferImage } from './OfferImage'
import { productsService } from '@/services/productsService'
import { Product } from '@/types'

const MAX_OFFERS = 6

function OfferCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-amical-dark-tertiary bg-amical-dark-secondary p-4">
      <div className="mb-4 h-32 w-full animate-pulse rounded-lg bg-amical-dark-tertiary" />
      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-amical-dark-tertiary" />
      <div className="mb-4 h-3 w-1/2 animate-pulse rounded bg-amical-dark-tertiary" />
      <div className="mt-auto h-9 w-full animate-pulse rounded-lg bg-amical-dark-tertiary" />
    </div>
  )
}

/**
 * Free Fire is AmicalPay's flagship category today, so it gets its own
 * curated section (real offers from FazerCards, capped at MAX_OFFERS) rather
 * than being just another tile in the category grid. "Voir toutes les
 * offres" sends people to the full, filterable /products?category=... view
 * for everything this section doesn't show.
 */
export function FeaturedGame() {
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState('')
  const [offers, setOffers] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'loaded' | 'empty' | 'error'>('loading')

  useEffect(() => {
    let active = true

    productsService
      .getCatalog()
      .then(async (catalog) => {
        if (!active) return
        const freeFire = catalog.categories.find((category) =>
          category.category.category_name?.toLowerCase().includes('free fire')
        )

        if (!freeFire) {
          setStatus('empty')
          return
        }

        setCategoryId(freeFire.category.category_id)

        const products = await productsService.getCategoryProducts(freeFire.category.category_id)
        if (!active) return

        const curated = [...products]
          .sort((a, b) => Number(b.popular) - Number(a.popular))
          .slice(0, MAX_OFFERS)

        setOffers(curated)
        setStatus(curated.length > 0 ? 'loaded' : 'empty')
      })
      .catch(() => {
        if (active) setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  if (status === 'empty') return null

  return (
    <section id="free-fire" className="scroll-mt-24 px-4 py-14 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amical-orange">
            <Flame size={16} />
            Jeu en vedette
          </p>
          <h2 className="text-3xl font-bold text-white">Free Fire</h2>
          <p className="mt-1 text-gray-400">Rechargez vos Diamonds rapidement et simplement.</p>
        </div>
        {categoryId && (
          <Link
            to={`/products?category=${encodeURIComponent(categoryId)}`}
            className="hidden shrink-0 items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-amical-orange/50 hover:text-white sm:flex"
          >
            Voir toutes les offres <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {status === 'error' && (
        <p className="text-sm text-gray-400">Impossible de charger les offres Free Fire pour le moment.</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {status === 'loading' &&
          Array.from({ length: 3 }).map((_, index) => <OfferCardSkeleton key={index} />)}

        {status === 'loaded' &&
          offers.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-xl border border-amical-dark-tertiary bg-amical-dark-secondary p-4 transition hover:border-amical-orange/50"
            >
              <OfferImage
                src={product.image}
                alt={product.name}
                icon={Gem}
                className="mb-4 h-32 w-full rounded-lg"
              />
              <div className="mb-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white">{product.name}</h3>
                  {product.popular && (
                    <span className="shrink-0 rounded-full bg-amical-orange px-2 py-0.5 text-[11px] font-bold text-white">
                      Populaire
                    </span>
                  )}
                </div>
                {product.diamonds > 0 && (
                  <p className="mt-1 text-sm text-amical-orange">{product.diamonds} diamonds</p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <p className="text-lg font-bold text-white">${product.sellingPriceUsd.toFixed(2)}</p>
                <Button size="sm" onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)}>
                  Acheter
                </Button>
              </div>
            </div>
          ))}
      </div>

      {categoryId && status === 'loaded' && (
        <div className="mt-8 text-center sm:hidden">
          <Link
            to={`/products?category=${encodeURIComponent(categoryId)}`}
            className="inline-flex items-center gap-1.5 font-semibold text-amical-orange"
          >
            Voir toutes les offres <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  )
}

export default FeaturedGame
