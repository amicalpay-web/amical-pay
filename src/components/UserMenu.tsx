import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  CircleUserRound,
  LifeBuoy,
  LogOut,
  ReceiptText,
  ShoppingBag,
  UserRound,
  WalletCards,
} from 'lucide-react'
import type { HeaderLabels } from './Header'

interface UserMenuProps {
  userLabel: string
  labels: HeaderLabels
  onLogout: () => Promise<void>
}

export function UserMenu({ userLabel, labels, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const menuItems = [
    { to: '/account', label: labels.profile, icon: UserRound },
    { to: '/track-order', label: labels.orders, icon: ShoppingBag },
    { to: '/account#balance', label: labels.balance, icon: WalletCards },
    { to: '/track-order#transactions', label: labels.transactions, icon: ReceiptText },
    { to: '/support', label: labels.support, icon: LifeBuoy },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={labels.accountMenu}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-left transition hover:border-amical-orange/60 hover:bg-white/[0.08]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amical-orange/15 text-amical-orange">
          <CircleUserRound size={18} strokeWidth={1.8} />
        </span>
        <span className="hidden max-w-28 truncate text-sm font-medium text-white lg:block">{userLabel}</span>
        <ChevronDown size={15} className={open ? 'rotate-180 text-amical-orange transition-transform' : 'text-gray-400 transition-transform'} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#171717]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amical-orange">{labels.account}</p>
            <p className="mt-1 truncate text-sm text-white">{userLabel}</p>
          </div>
          <nav className="py-1" aria-label={labels.accountMenu}>
            {menuItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                <Icon size={17} className="text-gray-500" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/10 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false)
                await onLogout()
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut size={17} />
              {labels.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
