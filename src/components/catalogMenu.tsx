import type { LucideIcon } from 'lucide-react'
import {
  Flame,
  Gift,
  KeyRound,
  Package,
  Send,
  WalletCards,
  Zap,
} from 'lucide-react'
import type { FazerCatalogItem } from '@/types'

export type CatalogMenuLabelKey =
  | 'steamTopUpCis'
  | 'steamGiftGames'
  | 'telegramStars'
  | 'gameKeys'
  | 'manualServices'
  | 'giftCards'
  | 'serviceTopUp'
  | 'freeFire'

export interface ResolvedCatalogMenuItem {
  categoryId: string
  categoryName: string
  labelKey: CatalogMenuLabelKey
  labelFr: string
  labelEn: string
  icon: LucideIcon
  image?: string
  offerCount: number
}

interface CatalogMenuDefinition {
  labelKey: CatalogMenuLabelKey
  labelFr: string
  labelEn: string
  aliases: string[]
  icon: LucideIcon
}

const CATALOG_MENU_DEFINITIONS: CatalogMenuDefinition[] = [
  {
    labelKey: 'steamTopUpCis',
    labelFr: 'Recharge Steam (CIS)',
    labelEn: 'Steam Top-Up (CIS)',
    aliases: ['steam top-up', 'steam top up', 'steam cis'],
    icon: WalletCards,
  },
  {
    labelKey: 'steamGiftGames',
    labelFr: 'Jeux cadeaux Steam',
    labelEn: 'Steam Gift Games',
    aliases: ['steam gift', 'steam games gift'],
    icon: Gift,
  },
  {
    labelKey: 'telegramStars',
    labelFr: 'Étoiles Telegram',
    labelEn: 'Telegram Stars',
    aliases: ['telegram star', 'telegram stars'],
    icon: Send,
  },
  {
    labelKey: 'gameKeys',
    labelFr: 'Clés de jeu',
    labelEn: 'Game Keys',
    aliases: ['game key', 'game keys'],
    icon: KeyRound,
  },
  {
    labelKey: 'manualServices',
    labelFr: 'Services manuels',
    labelEn: 'Manual Services',
    aliases: ['manual service', 'manual services'],
    icon: Package,
  },
  {
    labelKey: 'giftCards',
    labelFr: 'Cartes cadeaux',
    labelEn: 'Gift Cards',
    aliases: ['gift card', 'gift cards'],
    icon: Gift,
  },
  {
    labelKey: 'serviceTopUp',
    labelFr: 'Recharge de services',
    labelEn: 'Service Top-Up',
    aliases: ['service top-up', 'service top up'],
    icon: Zap,
  },
  {
    labelKey: 'freeFire',
    labelFr: 'Free Fire',
    labelEn: 'Free Fire',
    aliases: ['free fire'],
    icon: Flame,
  },
]

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function resolveCatalogMenuItems(categories: FazerCatalogItem[]): ResolvedCatalogMenuItem[] {
  const usedCategoryIds = new Set<string>()

  return CATALOG_MENU_DEFINITIONS.flatMap((definition) => {
    const found = categories.find((item) => {
      const categoryId = item.category.category_id
      if (usedCategoryIds.has(categoryId)) return false

      const categoryName = normalize(item.category.category_name || item.category.name || '')
      return definition.aliases.some((alias) => categoryName.includes(normalize(alias)))
    })

    if (!found) return []

    const categoryId = found.category.category_id
    usedCategoryIds.add(categoryId)
    return [{
      categoryId,
      categoryName: found.category.category_name,
      labelKey: definition.labelKey,
      labelFr: definition.labelFr,
      labelEn: definition.labelEn,
      icon: definition.icon,
      image: found.category.image_url,
      offerCount: found.products?.length || found.offers?.length || 0,
    }]
  })
}
