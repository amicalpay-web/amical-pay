import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightLeft,
  BadgeDollarSign,
  CircleUserRound,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Gift,
  HelpCircle,
  Home,
  KeyRound,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Send,
  Settings2,
  Ticket,
  Truck,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import type { HeaderLabels } from './Header'
import logo from '@/assets/logo.svg'

interface MobileMenuProps {
  open: boolean
  userLabel: string
  isAuthenticated: boolean
  labels: HeaderLabels
  onClose: () => void
  onLogout: () => Promise<void>
}

export function MobileMenu({
  open,
  userLabel,
  isAuthenticated,
  labels,
  onClose,
  onLogout,
}: MobileMenuProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: number | undefined

    if (open) {
      setMounted(true)
      timer = window.setTimeout(() => setVisible(true), 16)
    } else {
      setVisible(false)
      timer = window.setTimeout(() => setMounted(false), 220)
    }

    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [open])

  if (!mounted) return null

  const navItems = [
    { to: '/', label: labels.home, icon: Home },
    { to: '/products', label: labels.catalog, icon: LayoutGrid },
    { to: '/#how-it-works', label: labels.howItWorks, icon: HelpCircle },
    { to: '/track-order', label: labels.trackOrder, icon: Truck },
    { to: '/support', label: labels.contact, icon: LifeBuoy },
  ]

  const catalogItems = [
    { to: '/products?catalog=steam-top-up-cis', label: labels.steamTopUpCis, icon: CreditCard },
    { to: '/products?catalog=steam-gift-games', label: labels.steamGiftGames, icon: Gift },
    { to: '/products?catalog=telegram-stars', label: labels.telegramStars, icon: Send },
    { to: '/products?catalog=game-keys', label: labels.gameKeys, icon: KeyRound },
    { to: '/products?catalog=manual-services', label: labels.manualServices, icon: ClipboardList },
    { to: '/products?catalog=gift-cards', label: labels.giftCards, icon: Ticket },
    { to: '/products?catalog=service-top-up', label: labels.serviceTopUp, icon: BadgeDollarSign },
  ]

  const financeItems = [
    { to: '/track-order', label: labels.orders, icon: ClipboardList },
    { to: '/track-order#transactions', label: labels.transactions, icon: ArrowRightLeft },
    { to: '/account#balance', label: labels.balance, icon: WalletCards },
  ]

  const accountItems = [
    { to: '/account', label: labels.profile, icon: UserRound },
    { to: '/account#settings', label: labels.settings, icon: Settings2 },
  ]

  const renderSection = (
    title: string,
    items: Array<{ to: string; label: string; icon: typeof Home }>,
  ) => (
    <nav className="px-4 py-5" aria-label={title}>
      <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">{title}</p>
      <div className="space-y-2">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] px-4 py-3.5 text-[15px] font-medium text-gray-200 transition hover:border-amical-orange/40 hover:bg-white/[0.04] hover:text-white"
          >
            <Icon size={19} strokeWidth={1.8} className="text-gray-500 transition group-hover:text-amical-orange" />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <ChevronRight size={18} className="text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-amical-orange" />
          </Link>
        ))}
      </div>
    </nav>
  )

  return (
    <div>
      <button
        type="button"
        aria-label={labels.closeMenu}
        onClick={onClose}
        className={visible ? 'fixed inset-0 z-[60] bg-black/70 opacity-100 transition-opacity duration-200' : 'fixed inset-0 z-[60] bg-black/70 opacity-0 transition-opacity duration-200'}
      />
      <aside
        aria-label={labels.mobileMenu}
        aria-hidden={!visible}
        className={visible ? 'fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,380px)] translate-x-0 flex-col overflow-y-auto border-l border-white/10 bg-[#101010] shadow-2xl shadow-black/60 transition-transform duration-200 ease-out' : 'fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,380px)] translate-x-full flex-col overflow-y-auto border-l border-white/10 bg-[#101010] shadow-2xl shadow-black/60 transition-transform duration-200 ease-out'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <img src={logo} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
            <span className="text-sm font-black tracking-[0.2em] text-white">AMICAL<span className="text-amical-orange">PAY</span></span>
          </Link>
          <button
            type="button"
            aria-label={labels.closeMenu}
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-gray-300 transition hover:border-amical-orange/50 hover:text-white"
          >
            <X size={21} />
          </button>
        </div>

        {isAuthenticated && (
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-amical-orange/20 bg-amical-orange/10 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amical-orange/20 text-amical-orange">
              <CircleUserRound size={21} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amical-orange">{labels.account}</p>
              <p className="truncate text-sm font-medium text-white">{userLabel}</p>
            </div>
          </div>
        )}

        {renderSection(labels.mainMenu, navItems)}
        <div className="mx-4 border-t border-white/10" />
        {renderSection(labels.catalog, catalogItems)}
        <div className="mx-4 border-t border-white/10" />
        {renderSection(labels.finance, financeItems)}

        <nav className="border-t border-white/10 px-4 py-6" aria-label={labels.accountMenu}>
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">{labels.accountSection}</p>
          {isAuthenticated ? (
            <div className="space-y-1">
              {accountItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <Icon size={18} className="text-gray-500" />
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={async () => {
                  onClose()
                  await onLogout()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut size={18} />
                {labels.logout}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={onClose} className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white transition hover:border-amical-orange/60">
                {labels.login}
              </Link>
              <Link to="/signup" onClick={onClose} className="rounded-xl bg-amical-orange px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-amical-orange-dark">
                {labels.signup}
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </div>
  )
}
