import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Package } from 'lucide-react'
import { Button } from './Button'
import { OfferImage } from './OfferImage'
import { useAppContext } from '@/contexts/AppContext'
import { productsService } from '@/services/productsService'
import { Product } from '@/types'

const MAX_OFFERS = 8

function OfferCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-amical-dark-tertiary bg-amical-dark-secondary p-4">
      <div className="mb-4 h-28 w-full animate-pulse rounded-lg bg-amical-dark-tertiary" />
      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-amical-dark-tertiary" />
      <div className="mb-4 h-3 w-1/2 animate-pulse rounded bg-amical-dark-tertiary" />
      <div className="mt-auto h-9 w-full animate-pulse rounded-lg bg-amical-dark-tertiary" />
    </div>
  )
}

/**
 * Cross-catalog "popular" picks (backend-flagged, not something we invent on
 * the frontend). Uses the lighter /api/products?region= endpoint via
 * getPopularProducts rather than crawling every category, since this is a
 * homepage teaser, not the full catalog browser.
 */
export function PopularOffers() {
  const navigate = useNavigate()
  const { region } = useAppContext()
  const [offers, setOffers] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'loaded' | 'empty' | 'error'>('loading')

  useEffect(() => {
    let active = true
    setStatus('loading')

    productsService
      .getPopularProducts(region)
      .then((products) => {
        if (!active) return
        const curated = products.slice(0, MAX_OFFERS)
        setOffers(curated)
        setStatus(curated.length > 0 ? 'loaded' : 'empty')
      })
      .catch(() => {
        if (active) setStatus('error')
      })

    return () => {
      active = false
    }
  }, [region])

  if (status === 'empty' || status === 'error') return null

  return (
    <section className="px-4 py-14 sm:px-6">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amical-orange">
          <Sparkles size={16} />
          Sélection du moment
        </p>
        <h2 className="text-3xl font-bold text-white">Les offres populaires</h2>
        <p className="mt-1 text-gray-400">Les produits les plus demandés du catalogue.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {status === 'loading' &&
          Array.from({ length: 4 }).map((_, index) => <OfferCardSkeleton key={index} />)}

        {status === 'loaded' &&
          offers.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-xl border border-amical-dark-tertiary bg-amical-dark-secondary p-4 transition hover:border-amical-orange/50"
            >
              <OfferImage src={product.image} alt={product.name} icon={Package} className="mb-4 h-28 w-full rounded-lg" />
              <div className="mb-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{product.name}</h3>
                  <span className="shrink-0 rounded-full bg-amical-orange px-2 py-0.5 text-[10px] font-bold text-white">
                    Populaire
                  </span>
                </div>
                {product.categoryName && (
                  <p className="mt-1 text-xs text-gray-400">{product.categoryName}</p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <p className="font-bold text-white">${product.sellingPriceUsd.toFixed(2)}</p>
                <Button size="sm" onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`)}>
                  Acheter
                </Button>
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}

export default PopularOffers
