import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import logo from '@/assets/logo.svg'
import { MobileMenu } from './MobileMenu'
import { UserMenu } from './UserMenu'

export interface HeaderLabels {
  home: string
  overview: string
  catalog: string
  finance: string
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
}

const translations: Record<'fr' | 'en', HeaderLabels> = {
  fr: {
    home: 'Accueil',
    overview: 'Vue d’ensemble',
    catalog: 'Produits',
    finance: 'Finance',
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
  },
  en: {
    home: 'Home',
    overview: 'Overview',
    catalog: 'Products',
    finance: 'Finance',
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
  },
}

function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <img src={logo} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
      <span className="text-[13px] font-black tracking-[0.2em] text-white sm:text-sm">AMICAL<span className="text-amical-orange">PAY</span></span>
    </span>
  )
}

function Header() {
  const { language, setLanguage } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const labels = useMemo(() => translations[language === 'en' ? 'en' : 'fr'], [language])
  const isAuthenticated = Boolean(user)
  const userLabel = profile?.display_name || user?.email || labels.account

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search, location.hash])

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

        <Link to="/" aria-label="AmicalPay - accueil" className="shrink-0">
          <Brand />
        </Link>

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
