import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Gamepad2, Flame } from 'lucide-react'
import { productsService } from '@/services/productsService'
import type { FazerCatalogItem } from '@/types'

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

function isFeaturedCategory(category: FazerCatalogItem): boolean {
  const name = category.category.category_name.toLowerCase()
  return FEATURED_GAME_KEYWORDS.some((keyword) => name.includes(keyword))
}

function getFeaturedCategories(categories: FazerCatalogItem[]): FazerCatalogItem[] {
  const matches = categories.filter(isFeaturedCategory).slice(0, 4)
  const selectedIds = new Set(matches.map((category) => category.category.category_id))
  const fallback = categories
    .filter((category) => !selectedIds.has(category.category.category_id))
    .slice(0, Math.max(0, 4 - matches.length))
  return [...matches, ...fallback]
}

/**
 * "Commencez par un jeu" quick-picker — moved here from the Products page.
 * Purely a discovery shortcut: picking a card just navigates to
 * /products?category=... where the real offers/selection UI lives.
 * Fails quietly (renders nothing) if the catalog can't be reached, since
 * this is a supplementary section on the home page, not the main content.
 */
export function FeaturedGames() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [categories, setCategories] = useState<FazerCatalogItem[]>([])

  useEffect(() => {
    let active = true

    productsService
      .getCatalog()
      .then((catalog) => {
        if (active) setCategories(catalog.categories)
      })
      .catch(() => {
        // Silently skip — the rest of the home page still works.
      })

    return () => {
      active = false
    }
  }, [])

  const featuredCategories = getFeaturedCategories(categories)

  if (featuredCategories.length === 0) return null

  return (
    <section aria-labelledby="home-featured-games-title" className="px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-semibold text-amical-orange">{t('products.selectionTitle')}</p>
          <h2 id="home-featured-games-title" className="text-2xl font-bold text-white">
            {t('products.featuredGames')}
          </h2>
        </div>
        <span className="hidden text-sm text-gray-500 sm:block">{t('products.selectionSubtitle')}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {featuredCategories.map((category) => {
          const categoryId = category.category.category_id
          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => navigate(`/products?category=${encodeURIComponent(categoryId)}`)}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-amical-orange/50 hover:bg-amical-dark-secondary"
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                {category.category.image_url ? (
                  <img
                    src={category.category.image_url}
                    alt=""
                    className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-amical-dark-tertiary text-amical-orange">
                    <Gamepad2 size={22} />
                  </span>
                )}
                {isFeaturedCategory(category) && (
                  <Flame size={16} className="text-amical-orange" aria-label={t('products.featured')} />
                )}
              </div>
              <p className="line-clamp-2 min-h-12 font-semibold text-white">
                {category.category.category_name}
              </p>
              <p className="mt-2 text-xs text-gray-500">{t('products.chooseGame')}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default FeaturedGames
