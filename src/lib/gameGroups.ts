// Groups Fazer catalogue categories into "game family" sections so that
// regional variants of the same game (LATAM, EU, BR, MENA, Garena, Global...)
// live together instead of being scattered across one long flat list.

interface GameGroupDefinition {
  key: string
  label: string
  aliases: string[]
}

export interface CatalogGameGroup<T> {
  key: string
  label: string
  items: T[]
}

const GAME_GROUPS: GameGroupDefinition[] = [
  { key: 'free_fire', label: 'Free Fire', aliases: ['free fire'] },
  { key: 'call_of_duty', label: 'Call of Duty', aliases: ['call of duty', 'codm', 'cod mobile'] },
  { key: 'pubg', label: 'PUBG Mobile', aliases: ['pubg'] },
  { key: 'mobile_legends', label: 'Mobile Legends', aliases: ['mobile legends'] },
  { key: 'valorant', label: 'Valorant', aliases: ['valorant'] },
  { key: 'fortnite', label: 'Fortnite', aliases: ['fortnite'] },
  { key: 'league_of_legends', label: 'League of Legends', aliases: ['league of legends', 'wild rift'] },
  { key: 'genshin_impact', label: 'Genshin Impact', aliases: ['genshin'] },
  { key: 'fifa', label: 'FIFA / EA Sports FC', aliases: ['fifa', 'ea sports fc'] },
  { key: 'minecraft', label: 'Minecraft', aliases: ['minecraft'] },
  { key: 'roblox', label: 'Roblox', aliases: ['roblox'] },
  { key: 'steam', label: 'Steam', aliases: ['steam'] },
  { key: 'playstation', label: 'PlayStation', aliases: ['playstation', 'psn'] },
  { key: 'xbox', label: 'Xbox', aliases: ['xbox'] },
  { key: 'telegram', label: 'Telegram', aliases: ['telegram'] },
]

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Groups any list of catalogue items (categories, products...) by game
 * family, matching on the category name. Items that don't match a known
 * game are collected under a final "Autres" group instead of being dropped,
 * so nothing ever disappears from the page.
 */
export function groupCategoriesByGame<T>(
  items: T[],
  getCategoryName: (item: T) => string,
  otherLabel = 'Autres'
): Array<CatalogGameGroup<T>> {
  const byKey = new Map<string, CatalogGameGroup<T>>()
  const other: T[] = []

  items.forEach((item) => {
    const normalizedName = normalize(getCategoryName(item))
    const definition = GAME_GROUPS.find((group) =>
      group.aliases.some((alias) => normalizedName.includes(normalize(alias)))
    )

    if (!definition) {
      other.push(item)
      return
    }

    const existing = byKey.get(definition.key)
    if (existing) {
      existing.items.push(item)
    } else {
      byKey.set(definition.key, { key: definition.key, label: definition.label, items: [item] })
    }
  })

  const orderedGroups = GAME_GROUPS
    .map((definition) => byKey.get(definition.key))
    .filter((group): group is CatalogGameGroup<T> => Boolean(group))

  if (other.length > 0) {
    orderedGroups.push({ key: 'other', label: otherLabel, items: other })
  }

  return orderedGroups
}
