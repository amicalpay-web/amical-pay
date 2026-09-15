import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Gamepad2, Joystick, Box, Puzzle, Flame } from 'lucide-react'
import { productsService } from '@/services/productsService'

const categories = [
  {
    label: 'Free Fire',
    sub: 'Diamonds, Passes & Abonnements',
    to: '/products?category=free_fire_latam',
    icon: Flame,
    accent: 'from-amical-orange/40 to-transparent',
    featured: true,
  },
  {
    label: 'Steam',
    sub: 'Cartes cadeaux & Solde',
    to: '/products?category=steam',
    icon: Gamepad2,
    image: '/catalogs/steam.jpg',
    accent: 'from-amical-accent/30 to-transparent',
  },
  {
    label: 'PlayStation',
    sub: 'Cartes cadeaux & Abonnements',
    to: '/products?category=playstation',
    icon: Joystick,
    image: '/catalogs/playstation.jpg',
    accent: 'from-blue-500/30 to-transparent',
  },
  {
    label: 'Xbox',
    sub: 'Cartes cadeaux & Abonnements',
    to: '/products?category=xbox',
    icon: Box,
    image: '/catalogs/xbox.jpg',
    accent: 'from-green-500/30 to-transparent',
  },
  {
    label: 'Roblox',
    sub: 'Robux & Cartes cadeaux',
    to: '/products?category=roblox',
    icon: Puzzle,
    image: '/catalogs/roblox.jpg',
    accent: 'from-purple-500/30 to-transparent',
  },
]

export function CategoryGrid() {
  // Category artwork is matched with live catalogue data when local artwork
  // is not available.
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    productsService
      .getCatalog()
      .then((catalog) => {
        if (!active) return
        const images: Record<string, string> = {}

        categories.forEach(({ label }) => {
          const match = catalog.categories.find((item) => {
            const name = item.category.category_name?.toLowerCase() || ''
            return name.includes(label.toLowerCase())
          })
          if (match?.category.image_url) {
            images[label] = match.category.image_url
          }
        })

        setCategoryImages(images)
      })
      .catch(() => {
        // Silently fall back to icons if the catalog can't be reached —
        // the grid still works, just without artwork.
      })

    return () => {
      active = false
    }
  }, [])

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
          {(categoryImages['Free Fire'] || categories[0].image) && (
            <img
              src={categoryImages['Free Fire'] || categories[0].image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40 transition group-hover:opacity-55"
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${categories[0].accent} via-black/10 to-transparent`} />
          <Flame size={22} className="relative mb-2 text-amical-orange" />
          <p className="relative text-sm font-bold text-white">Free Fire</p>
          <p className="relative text-xs text-gray-300">Diamonds, Passes & Abonnements</p>
          <ArrowRight size={16} className="absolute right-3 top-3 text-gray-300 transition group-hover:text-white" />
        </Link>

        {categories.slice(1).map(({ label, sub, to, icon: Icon, image: localImage, accent }) => {
          const image = categoryImages[label] || localImage
          return (
            <Link
              key={label}
              to={to}
              className="group relative flex min-h-[9rem] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-amical-dark-secondary p-4 transition hover:border-amical-orange/50"
            >
              {image && (
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-35 transition group-hover:opacity-50"
                />
              )}
              <div className={`absolute inset-0 bg-gradient-to-t ${accent} via-transparent to-transparent`} />
              <Icon size={22} className="relative text-gray-200" />
              <div className="relative">
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-gray-300">{sub}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default CategoryGrid
