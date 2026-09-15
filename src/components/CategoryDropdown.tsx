import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Gamepad2 } from 'lucide-react'
import type { FazerCatalogCategory } from '@/types'

interface CategoryDropdownOption {
  category: FazerCatalogCategory
}

interface CategoryDropdownProps {
  categories: CategoryDropdownOption[]
  selectedCategoryId: string
  onSelect: (categoryId: string) => void
  disabled?: boolean
  label: string
  ariaLabel: string
}

/**
 * Compact, raised "3D" category switcher used on the Products page.
 * Replaces the plain native <select> with a styled trigger + floating
 * listbox so the selection feels premium while staying keyboard and
 * screen-reader accessible (button + role="listbox"/"option").
 */
export function CategoryDropdown({
  categories,
  selectedCategoryId,
  onSelect,
  disabled,
  label,
  ariaLabel,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = categories.find((item) => item.category.category_id === selectedCategoryId)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="relative w-full sm:w-72" ref={containerRef}>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {label}
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={`group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-amical-dark-secondary to-[#141414] px-4 py-3 text-left shadow-[0_10px_22px_-10px_rgba(0,0,0,0.75)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-amical-orange/50 hover:shadow-[0_16px_30px_-10px_rgba(247,107,1,0.35)] focus:outline-none focus:ring-2 focus:ring-amical-orange/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${
          open ? 'border-amical-orange/60 shadow-[0_16px_30px_-10px_rgba(247,107,1,0.35)]' : ''
        }`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amical-orange/15 text-amical-orange transition-transform duration-200 group-hover:scale-105">
          <Gamepad2 size={16} />
        </span>
        <span className="flex-1 truncate text-sm font-semibold text-white">
          {selected?.category.category_name || ariaLabel}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180 text-amical-orange' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#171717]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          {categories.map((item) => {
            const isSelected = item.category.category_id === selectedCategoryId
            return (
              <button
                key={item.category.category_id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelect(item.category.category_id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 hover:bg-white/[0.06] ${
                  isSelected ? 'bg-amical-orange/15 text-amical-orange' : 'text-gray-300 hover:text-white'
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isSelected ? 'bg-amical-orange' : 'bg-white/15'}`} />
                <span className="truncate">{item.category.category_name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
