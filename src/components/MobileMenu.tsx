import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  ArrowRightLeft,
  BarChart3,
  CircleUserRound,
  ChevronRight,
  ClipboardList,
  Grid3x3,
  Home,
  LifeBuoy,
  LogOut,
  Package,
  Plus,
  Settings2,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import type { HeaderLabels } from './Header'
import { productsService } from '@/services/productsService'
import { resolveCatalogMenuItems } from './catalogMenu'
import type { FazerCatalogItem } from '@/types'
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
  const [liveCategories, setLiveCategories] = useState<FazerCatalogItem[]>([])
  const [catalogTotal, setCatalogTotal] = useState(0)

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

  useEffect(() => {
    if (!open || liveCategories.length > 0) return
    let active = true

    productsService
      .getCatalog()
      .then((catalog) => {
        if (!active) return
        setLiveCategories(catalog.categories)
        setCatalogTotal(catalog.total_categories || catalog.categories.length)
      })
      .catch(() => {
        // The full catalog link remains available if the live catalog is unavailable.
      })

    return () => {
      active = false
    }
  }, [open, liveCategories.length])

  if (!mounted) return null

  const overviewItems = [
    { to: '/', label: labels.home, icon: Home },
    { to: '/track-order', label: labels.orders, icon: ClipboardList },
    { to: '/track-order#transactions', label: labels.transactions, icon: ArrowRightLeft },
  ]

  const catalogItems = resolveCatalogMenuItems(liveCategories)
  const financeItems = [
    { to: '/account#balance', label: labels.balance, icon: WalletCards },
  ]
  const addOnItems = [
    { to: '/products', label: labels.addOns, icon: Plus },
  ]
  const accountItems = [
    { to: '/account#statistics', label: labels.statistics, icon: BarChart3 },
    { to: '/account', label: labels.profile, icon: UserRound },
    { to: '/account#settings', label: labels.settings, icon: Settings2 },
    { to: '/support', label: labels.support, icon: LifeBuoy },
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

  return createPortal(
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

        {renderSection(labels.overview, overviewItems)}
        <div className="mx-4 border-t border-white/10" />

        <nav className="px-4 py-5" aria-label={labels.catalog}>
          <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">{labels.catalog}</p>
          <div className="space-y-2">
            {catalogItems.map((item) => {
              const Icon = item.icon
              const label = labels[item.labelKey]
              return (
                <Link
                  key={item.categoryId}
                  to={'/products?category=' + encodeURIComponent(item.categoryId)}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] px-4 py-3.5 text-[15px] font-medium text-gray-200 transition hover:border-amical-orange/40 hover:bg-white/[0.04] hover:text-white"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <Icon size={19} strokeWidth={1.8} className="shrink-0 text-gray-500 transition group-hover:text-amical-orange" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <ChevronRight size={18} className="shrink-0 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-amical-orange" />
                </Link>
              )
            })}

            <Link
              to="/products"
              onClick={onClose}
              className="group flex items-center gap-3 rounded-2xl border border-amical-orange/25 bg-amical-orange/[0.06] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:border-amical-orange/50 hover:bg-amical-orange/10"
            >
              <Grid3x3 size={19} strokeWidth={1.8} className="shrink-0 text-amical-orange" />
              <span className="min-w-0 flex-1 truncate">
                {labels.catalog}
                {catalogTotal > 0 && (
                  <span className="ml-1.5 font-normal text-gray-400">({catalogTotal})</span>
                )}
              </span>
              <ChevronRight size={18} className="shrink-0 text-amical-orange transition group-hover:translate-x-0.5" />
            </Link>

            {catalogItems.length === 0 && liveCategories.length === 0 && (
              <p className="flex items-center gap-2 px-2 text-xs text-gray-500">
                <Package size={14} />
                Chargement du catalogue…
              </p>
            )}
          </div>
        </nav>
        <div className="mx-4 border-t border-white/10" />
        {renderSection(labels.finance, financeItems)}
        <div className="mx-4 border-t border-white/10" />
        {renderSection(labels.addOns, addOnItems)}
        <div className="mx-4 border-t border-white/10" />

        <nav className="px-4 py-5" aria-label={labels.accountSection}>
          <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">{labels.accountSection}</p>
          {isAuthenticated ? (
            <div className="space-y-2">
              {accountItems.map(({ to, label, icon: Icon }) => (
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
              <button
                type="button"
                onClick={async () => {
                  onClose()
                  await onLogout()
                }}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] px-4 py-3.5 text-left text-[15px] font-medium text-gray-200 transition hover:border-amical-orange/40 hover:bg-white/[0.04] hover:text-white"
              >
                <LogOut size={19} strokeWidth={1.8} className="text-gray-500 transition group-hover:text-amical-orange" />
                <span className="min-w-0 flex-1 truncate">{labels.logout}</span>
                <ChevronRight size={18} className="text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-amical-orange" />
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
    </div>,
    document.body,
  )
}
