import { Menu, Moon, ShoppingCart, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAppContext } from '@/contexts/AppContext'
import { useCart } from '@/contexts/CartContext'
import { Region } from '@/types'

const regions: Region[] = ['LATAM', 'EU', 'BR', 'MENA']

export function Header() {
  const { region, setRegion, language, setLanguage } = useAppContext()
  const { cartItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const cartCount = cartItems.length || 2

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('light-theme', !next)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-amical-gold/30 bg-amical-dark/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-amical-gold">
          Amical Pay
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className="text-sm text-gray-200 hover:text-amical-gold">
            Home
          </NavLink>
          <NavLink to="/order-status" className="text-sm text-gray-200 hover:text-amical-gold">
            Track Order
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            className={`rounded-md px-2 py-1 text-xs ${language === 'en' ? 'bg-amical-gold text-black' : 'text-gray-200'}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            className={`rounded-md px-2 py-1 text-xs ${language === 'ru' ? 'bg-amical-gold text-black' : 'text-gray-200'}`}
            onClick={() => setLanguage('ru')}
          >
            RU
          </button>
          <select
            className="rounded-md border border-amical-gold/40 bg-amical-card px-2 py-1 text-xs text-gray-100"
            value={region}
            onChange={(event) => setRegion(event.target.value as Region)}
          >
            {regions.map((regionOption) => (
              <option key={regionOption} value={regionOption}>
                {regionOption}
              </option>
            ))}
          </select>
          <button onClick={toggleTheme} className="rounded-md p-2 text-gray-200 hover:text-amical-gold">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="relative text-gray-100">
            <ShoppingCart size={18} />
            <span className="absolute -right-2 -top-2 rounded-full bg-amical-gold px-1.5 text-[10px] font-bold text-black">
              {cartCount}
            </span>
          </div>
        </div>

        <button className="md:hidden text-gray-100" onClick={() => setMenuOpen((open) => !open)}>
          <Menu size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-amical-gold/20 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" onClick={() => setMenuOpen(false)} className="text-sm text-gray-200">
              Home
            </NavLink>
            <NavLink to="/order-status" onClick={() => setMenuOpen(false)} className="text-sm text-gray-200">
              Track Order
            </NavLink>
          </div>
        </div>
      )}
    </header>
  )
}
