import { Link } from 'react-router-dom'
import { ArrowRight, Gamepad2, Joystick, Box, Puzzle, Flame } from 'lucide-react'

const categories = [
  {
    label: 'Free Fire',
    sub: 'Diamonds, Passes & Abonnements',
    to: '/products?category=free_fire_latam',
    icon: Flame,
    featured: true,
  },
  { label: 'Steam', sub: 'Cartes cadeaux & Solde', to: '/products?category=steam', icon: Gamepad2 },
  { label: 'PlayStation', sub: 'Cartes cadeaux & Abonnements', to: '/products?category=playstation', icon: Joystick },
  { label: 'Xbox', sub: 'Cartes cadeaux & Abonnements', to: '/products?category=xbox', icon: Box },
  { label: 'Roblox', sub: 'Robux & Cartes cadeaux', to: '/products?category=roblox', icon: Puzzle },
]

export function CategoryGrid() {
  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Flame size={18} className="text-amical-orange" />
            Nos catégories
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Choisissez votre produit et commencez dès maintenant.
          </p>
        </div>
        <Link
          to="/products"
          className="hidden shrink-0 items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-amical-orange/50 hover:text-white sm:flex"
        >
          Voir tout <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Link
          to={categories[0].to}
          className="group relative col-span-2 flex min-h-[9rem] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#241a3a] via-[#1a1030] to-amical-dark p-4 transition hover:border-amical-orange/50 sm:col-span-1 lg:col-span-1"
        >
          <Flame size={22} className="mb-2 text-amical-orange" />
          <p className="text-sm font-bold text-white">Free Fire</p>
          <p className="text-xs text-gray-400">Diamonds, Passes & Abonnements</p>
          <ArrowRight size={16} className="absolute right-3 top-3 text-gray-500 transition group-hover:text-white" />
        </Link>

        {categories.slice(1).map(({ label, sub, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex min-h-[9rem] flex-col justify-between rounded-2xl border border-white/10 bg-amical-dark-secondary p-4 transition hover:border-amical-orange/50"
          >
            <Icon size={22} className="text-gray-300" />
            <div>
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CategoryGrid
