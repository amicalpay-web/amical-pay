import { Link, useLocation } from 'react-router-dom'
import {
  Flame,
  Gem,
  Ticket,
  Star,
  Gamepad2,
  Joystick,
  Box,
  Radio,
  Puzzle,
  Swords,
  Crosshair,
  Target,
} from 'lucide-react'

interface CategoryLink {
  label: string
  to: string
  icon: React.ReactNode
}

const freeFireLinks: CategoryLink[] = [
  { label: 'Diamonds', to: '/products?category=free_fire_latam&type=diamonds', icon: <Gem size={16} /> },
  { label: 'Passes & Abonnements', to: '/products?category=free_fire_latam&type=passes', icon: <Ticket size={16} /> },
  { label: 'Autres produits Free Fire', to: '/products?category=free_fire_latam', icon: <Star size={16} /> },
]

const gameLinks: CategoryLink[] = [
  { label: 'Steam', to: '/products?category=steam', icon: <Gamepad2 size={16} /> },
  { label: 'PlayStation', to: '/products?category=playstation', icon: <Joystick size={16} /> },
  { label: 'Xbox', to: '/products?category=xbox', icon: <Box size={16} /> },
  { label: 'Nintendo', to: '/products?category=nintendo', icon: <Radio size={16} /> },
  { label: 'Roblox', to: '/products?category=roblox', icon: <Puzzle size={16} /> },
  { label: 'Mobile Legends', to: '/products?category=mobile_legends', icon: <Swords size={16} /> },
  { label: 'Valorant', to: '/products?category=valorant', icon: <Target size={16} /> },
  { label: 'Call of Duty', to: '/products?category=cod', icon: <Crosshair size={16} /> },
]

const infoLinks: CategoryLink[] = [
  { label: 'Comment ça marche', to: '/#how-it-works', icon: null },
  { label: 'Suivre ma commande', to: '/track-order', icon: null },
  { label: 'Contact', to: '/support', icon: null },
]

export function Sidebar() {
  const location = useLocation()
  const isProducts = location.pathname.startsWith('/products')

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-[5.5rem] space-y-6">
        <div>
          <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-gray-500">
            Catégories
          </p>
          <nav className="space-y-1" aria-label="Catégories de produits">
            <Link
              to="/products"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isProducts
                  ? 'bg-amical-orange/15 text-amical-orange'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Flame size={16} />
              Tous les produits
            </Link>

            <div className="pt-2">
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-white">
                <Flame size={16} className="text-amical-orange" />
                Free Fire
              </div>
              <div className="ml-4 space-y-0.5 border-l border-white/10 pl-3">
                {freeFireLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-400 transition hover:text-white"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <p className="mb-1 px-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                Jeux
              </p>
              {gameLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
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
