import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CircleUserRound,
  Flame,
  HelpCircle,
  Home,
  LifeBuoy,
  LogOut,
  Receipt,
  Settings2,
  ShoppingBag,
  Tag,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import type { HeaderLabels } from './Header'

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

  const mainItems = [
    { to: '/', label: labels.home, icon: Home },
    { to: '/products', label: labels.freeFire, icon: Flame },
    { to: '/products?promotion=true', label: labels.promotions, icon: Tag },
    { to: '/#how-it-works', label: labels.howItWorks, icon: HelpCircle },
    { to: '/support', label: labels.support, icon: LifeBuoy },
  ]

  const accountItems = [
    { to: '/account', label: labels.profile, icon: UserRound },
    { to: '/track-order', label: labels.orders, icon: ShoppingBag },
    { to: '/account#balance', label: labels.balance, icon: WalletCards },
    { to: '/track-order#transactions', label: labels.transactions, icon: Receipt },
    { to: '/account#settings', label: labels.settings, icon: Settings2 },
  ]

  return (
    <div className="md:hidden">
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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amical-orange text-sm font-black text-white shadow-lg shadow-amical-orange/20">A</span>
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

        <nav className="px-4 py-6" aria-label={labels.mainMenu}>
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">{labels.main}</p>
          <div className="space-y-1">
            {mainItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                <Icon size={18} className="text-amical-orange" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mx-4 border-t border-white/10" />

        <nav className="px-4 py-6" aria-label={labels.accountMenu}>
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
              <Link to="/account" onClick={onClose} className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white transition hover:border-amical-orange/60">
                {labels.login}
              </Link>
              <Link to="/account" onClick={onClose} className="rounded-xl bg-amical-orange px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-amical-orange-dark">
                {labels.signup}
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </div>
  )
}
