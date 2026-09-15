import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Home as HomeIcon,
  LayoutGrid,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { MobileMenu } from './MobileMenu'
import { UserMenu } from './UserMenu'

export interface HeaderLabels {
  home: string
  overview: string
  catalog: string
  catalogues: string
  products: string
  freeFire: string
  finance: string
  statistics: string
  addOns: string
  steamTopUpCis: string
  steamGiftGames: string
  telegramStars: string
  gameKeys: string
  manualServices: string
  giftCards: string
  serviceTopUp: string
  support: string
  login: string
  signup: string
  account: string
  accountMenu: string
  mainMenu: string
  mobileMenu: string
  main: string
  accountSection: string
  profile: string
  orders: string
  balance: string
  transactions: string
  settings: string
  logout: string
  search: string
  language: string
  closeMenu: string
  howItWorks: string
  trackOrder: string
  contact: string
  searchPlaceholder: string
  searchSubmit: string
}

const translations: Record<'fr' | 'en', HeaderLabels> = {
  fr: {
    home: 'Accueil',
    overview: 'Vue d’ensemble',
    catalog: 'Catalogues',
    catalogues: 'Catalogues',
    products: 'Produits',
    freeFire: 'Free Fire',
    finance: 'Finance',
    statistics: 'Statistiques',
    addOns: 'Add-ons',
    steamTopUpCis: 'Recharge Steam (CIS)',
    steamGiftGames: 'Jeux cadeaux Steam',
    telegramStars: 'Étoiles Telegram',
    gameKeys: 'Clés de jeu',
    manualServices: 'Services manuels',
    giftCards: 'Cartes cadeaux',
    serviceTopUp: 'Recharge de services',
    support: 'Support',
    login: 'Connexion',
    signup: 'Créer un compte',
    account: 'Mon compte',
    accountMenu: 'Menu du compte',
    mainMenu: 'Navigation principale',
    mobileMenu: 'Menu',
    main: 'Principal',
    accountSection: 'Compte',
    profile: 'Mon profil',
    orders: 'Mes commandes',
    balance: 'Mon solde',
    transactions: 'Mes transactions',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    search: 'Rechercher',
    language: 'Langue',
    closeMenu: 'Fermer le menu',
    howItWorks: 'Comment ça marche',
    trackOrder: 'Suivre ma commande',
    contact: 'Contact',
    searchPlaceholder: 'Rechercher un produit, une marque ou une catégorie…',
    searchSubmit: 'Lancer la recherche',
  },
  en: {
    home: 'Home',
    overview: 'Overview',
    catalog: 'Catalogues',
    catalogues: 'Catalogues',
    products: 'Products',
    freeFire: 'Free Fire',
    finance: 'Finance',
    statistics: 'Statistics',
    addOns: 'Add-ons',
    steamTopUpCis: 'Steam Top-Up (CIS)',
    steamGiftGames: 'Steam Gift Games',
    telegramStars: 'Telegram Stars',
    gameKeys: 'Game Keys',
    manualServices: 'Manual Services',
    giftCards: 'Gift Cards',
    serviceTopUp: 'Service Top-Up',
    support: 'Support',
    login: 'Sign in',
    signup: 'Create account',
    account: 'My account',
    accountMenu: 'Account menu',
    mainMenu: 'Main navigation',
    mobileMenu: 'Menu',
    main: 'Main',
    accountSection: 'Account',
    profile: 'My profile',
    orders: 'My orders',
    balance: 'My balance',
    transactions: 'My transactions',
    settings: 'Settings',
    logout: 'Sign out',
    search: 'Search',
    language: 'Language',
    closeMenu: 'Close menu',
    howItWorks: 'How it works',
    trackOrder: 'Track order',
    contact: 'Contact',
    searchPlaceholder: 'Search a product, brand, or category…',
    searchSubmit: 'Search',
  },
}

function Brand() {
  return <img src="/amical-pay-icon.webp" alt="Amical Pay" className="h-10 w-10 shrink-0" />
}

function Header() {
  const { language, setLanguage } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(location.search).get('q') || '')
  const { user, profile, signOut } = useAuth()
  const labels = useMemo(() => translations[language === 'en' ? 'en' : 'fr'], [language])
  const isAuthenticated = Boolean(user)
  const userLabel = profile?.display_name || user?.email || labels.account

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    setSearchTerm(new URLSearchParams(location.search).get('q') || '')
  }, [location.search])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    const result = await signOut()
    if (!result.error) navigate('/')
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchTerm.trim()
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0f0f0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-3 px-3 sm:px-5 lg:px-8">
        <button
          type="button"
          aria-label={mobileOpen ? labels.closeMenu : labels.mobileMenu}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-xl border border-white/10 p-2 text-gray-300 transition hover:border-amical-orange/50 hover:text-white"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" aria-label="Amical Pay - accueil" className="shrink-0">
          <Brand />
        </Link>

        <nav className="ml-5 hidden items-center gap-1 lg:flex" aria-label={labels.mainMenu}>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            <HomeIcon size={16} />
            {labels.home}
          </Link>
          <Link
            to="/catalogues"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.05] hover:text-amical-orange"
          >
            <LayoutGrid size={16} />
            {labels.catalogues}
          </Link>
          <Link
            to="/products"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ShoppingBag size={16} />
            {labels.products}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <label className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-amical-orange/40">
            <span className="sr-only">{labels.language}</span>
            <select
              value={language === 'en' ? 'en' : 'fr'}
              onChange={(event) => setLanguage(event.target.value as 'fr' | 'en')}
              className="cursor-pointer appearance-none bg-transparent pr-0.5 text-xs font-semibold text-gray-200 outline-none"
              aria-label={labels.language}
            >
              <option value="fr" className="bg-[#171717]">FR</option>
              <option value="en" className="bg-[#171717]">EN</option>
            </select>
            <ChevronDown size={13} className="text-gray-500" />
          </label>

          <UserMenu
            userLabel={userLabel}
            labels={labels}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <div className="border-t border-white/[0.06] bg-black/20">
        <form onSubmit={handleSearch} className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-5 lg:px-8">
          <Search size={17} className="shrink-0 text-amical-orange" aria-hidden="true" />
          <label htmlFor="global-product-search" className="sr-only">{labels.search}</label>
          <input
            id="global-product-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
          <button
            type="submit"
            aria-label={labels.searchSubmit}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-amical-orange/50 hover:text-white"
          >
            {labels.search}
          </button>
        </form>
      </div>

      <MobileMenu
        open={mobileOpen}
        userLabel={userLabel}
        isAuthenticated={isAuthenticated}
        labels={labels}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
    </header>
  )
}

export default Header
