import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Flame, LoaderCircle } from 'lucide-react'
import { productsService } from '@/services/productsService'
import { resolveCatalogMenuItems } from './catalogMenu'
import type { FazerCatalogItem } from '@/types'

const infoLinks = [
  { label: 'Comment ça marche', to: '/#how-it-works' },
  { label: 'Suivre ma commande', to: '/track-order' },
  { label: 'Contact', to: '/support' },
]

export function Sidebar() {
  const location = useLocation()
  const [liveCategories, setLiveCategories] = useState<FazerCatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)

  useEffect(() => {
    let active = true
    productsService.getCatalog()
      .then((catalog) => {
        if (!active) return
        setLiveCategories(catalog.categories)
      })
      .catch(() => {
        if (active) setLiveCategories([])
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const catalogItems = resolveCatalogMenuItems(liveCategories)
  const selectedCategoryId = new URLSearchParams(location.search).get('category')
  const isProducts = location.pathname.startsWith('/products')

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-[5.5rem] space-y-6">
        <div>
          <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-gray-500">
            Catalogue
          </p>
          <nav className="space-y-1" aria-label="Catégories de produits">
            <Link
              to="/products"
              className={'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ' + (isProducts && !selectedCategoryId
                ? 'bg-amical-orange/15 text-amical-orange'
                : 'text-gray-300 hover:bg-white/5 hover:text-white')}
            >
              <Flame size={16} />
              Toutes les catégories
            </Link>

            {catalogItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.categoryId}
                  to={'/products?category=' + encodeURIComponent(item.categoryId)}
                  className={'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ' + (selectedCategoryId === item.categoryId
                    ? 'bg-amical-orange/15 text-amical-orange'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white')}
                >
                  {item.image ? <img src={item.image} alt="" className="h-5 w-5 rounded object-cover" /> : <Icon size={16} />}
                  <span className="min-w-0 flex-1 truncate">{item.labelFr}</span>
                  <ChevronRight size={14} className="text-gray-600" />
                </Link>
              )
            })}

            {catalogLoading && (
              <p className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
                <LoaderCircle size={14} className="animate-spin" />
                Chargement…
              </p>
            )}
          </nav>
        </div>

        <div>
          <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-gray-500">
            Infos
          </p>
          <nav className="space-y-0.5" aria-label="Informations">
            {infoLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="overflow-hidden rounded-2xl border border-amical-orange/30 bg-gradient-to-br from-amical-orange/10 via-transparent to-purple-500/10 p-5">
          <p className="text-base font-black text-white">
            AMICAL <span className="text-amical-orange">PAY</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">Votre boutique digitale de confiance.</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
