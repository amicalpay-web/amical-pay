import { FazerCatalogCategory } from '@/types'

/**
 * Region tokens that FazerCards commonly appends to a category_id or
 * category_name (e.g. "free_fire_latam", "Steam Wallet (EU)"). Only stripped
 * when they appear as a whole, delimiter-separated segment, never as a
 * substring, so games like "Nintendo eShop" or "PUBG Mobile" are untouched.
 */
const REGION_TOKENS = new Set([
  'latam', 'latin', 'eu', 'europe', 'br', 'brazil', 'brasil', 'mena',
  'global', 'row', 'na', 'us', 'usa', 'asia', 'sea', 'apac', 'international',
])

function splitSegments(value: string): string[] {
  return value
    .replace(/[()[\]]/g, ' ')
    .split(/[\s_\-]+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function isRegionSegment(segment: string): boolean {
  return REGION_TOKENS.has(segment.toLowerCase())
}

function titleCaseWord(word: string): string {
  if (!word) return word
  if (word.toUpperCase() === word && word.length <= 4) return word // keep short acronyms (PUBG, COD...)
  return word[0].toUpperCase() + word.slice(1).toLowerCase()
}

/**
 * Derive a stable grouping key from a raw FazerCards category_id, stripping
 * only whole region segments. Two categories that only differ by region
 * (e.g. "free_fire_latam" / "free_fire_eu") resolve to the same key.
 */
export function gameKeyFromCategoryId(categoryId: string): string {
  const allSegments = splitSegments(categoryId)
  const withoutRegion = allSegments.filter((segment) => !isRegionSegment(segment))
  const segments = withoutRegion.length > 0 ? withoutRegion : allSegments
  return segments.join('_').toLowerCase() || categoryId.toLowerCase()
}

/**
 * Derive a human-friendly game name from a category's display name, with the
 * region portion removed when present.
 */
export function gameNameFromCategory(category: FazerCatalogCategory): string {
  const raw = category.category_name || category.name || category.category_id
  const segments = splitSegments(raw).filter((segment) => !isRegionSegment(segment))
  const cleaned = (segments.length > 0 ? segments : splitSegments(raw)).join(' ').trim()
  const base = cleaned || raw

  // If the source already mixes upper/lowercase, assume it's already
  // formatted correctly (e.g. "Free Fire") and leave it as-is.
  const alreadyFormatted = /[a-z]/.test(base) && /[A-Z]/.test(base)
  return alreadyFormatted ? base : base.split(' ').map(titleCaseWord).join(' ')
}

/**
 * Best-effort label for the region portion of a category, derived by
 * removing the game name from the category's raw display name.
 */
export function regionLabelForCategory(category: FazerCatalogCategory, gameName: string): string {
  const raw = category.category_name || category.category_id
  const escaped = gameName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let residual = raw.replace(new RegExp(escaped, 'i'), '').trim()
  residual = residual.replace(/^[-–—:()\s]+|[-–—:()\s]+$/g, '')
  return residual || raw
}

export interface GameGroup {
  gameKey: string
  gameName: string
  categories: FazerCatalogCategory[]
  image?: string
  description?: string
  hasMultipleRegions: boolean
}

/**
 * Group FazerCards categories by game. This is the only place that decides
 * what counts as "one game" — it must stay purely derived from what
 * /api/products/catalog returns, never a fixed game list, so the sidebar and
 * "Nos catégories" grid stay correct as FazerCards adds or removes categories.
 */
export function groupCategoriesByGame(categories: FazerCatalogCategory[]): GameGroup[] {
  const groups = new Map<string, GameGroup>()

  categories.forEach((category) => {
    const key = gameKeyFromCategoryId(category.category_id)
    const existing = groups.get(key)
    if (existing) {
      existing.categories.push(category)
      if (!existing.image && category.image_url) existing.image = category.image_url
      if (!existing.description && category.description) existing.description = category.description
    } else {
      groups.set(key, {
        gameKey: key,
        gameName: gameNameFromCategory(category),
        categories: [category],
        image: category.image_url,
        description: category.description,
        hasMultipleRegions: false,
      })
    }
  })

  groups.forEach((group) => {
    group.hasMultipleRegions = group.categories.length > 1
    // Prefer the shortest category_name as the canonical display name: it's
    // the one least likely to still be carrying a region suffix.
    const shortest = [...group.categories].sort(
      (a, b) => (a.category_name || '').length - (b.category_name || '').length
    )[0]
    if (shortest) {
      const derived = gameNameFromCategory(shortest)
      if (derived) group.gameName = derived
    }
  })

  return Array.from(groups.values()).sort((a, b) => a.gameName.localeCompare(b.gameName))
}

export function findGroupByKey(groups: GameGroup[], key: string): GameGroup | undefined {
  return groups.find((group) => group.gameKey === key)
}
