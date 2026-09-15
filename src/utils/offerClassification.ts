import { Product } from '@/types'

/**
 * FazerCards offers have no explicit "type" field — one array mixes top-up
 * currency (e.g. "110 Diamonds") and passes/subscriptions (e.g. "Weekly
 * Membership", "Booyah Pass") for the same category. We classify by name.
 *
 * Per-game overrides let a game with a different virtual currency name
 * (Robux for Roblox, V-Bucks for Fortnite, ...) still match correctly, keyed
 * by the same gameKey produced by gameGrouping.ts.
 */
const CURRENCY_LABEL_OVERRIDES: Record<string, string> = {
  roblox: 'Robux',
  fortnite: 'V-Bucks',
}

const CURRENCY_PATTERN = /\d[\d,.]*\s*(diamonds?|gems?|points?|robux|v-?bucks|coins?|cristaux|gemmes|jetons|pi[eè]ces)/i

export function isCurrencyOffer(offerName: string): boolean {
  return CURRENCY_PATTERN.test(offerName)
}

export interface ClassifiedProducts {
  currency: Product[]
  passes: Product[]
}

export function classifyProducts(products: Product[]): ClassifiedProducts {
  const currency: Product[] = []
  const passes: Product[] = []
  products.forEach((product) => {
    if (isCurrencyOffer(product.name)) currency.push(product)
    else passes.push(product)
  })
  return { currency, passes }
}

/**
 * Best label for the "currency" tab: a configured override for the game, or
 * the currency word actually found in the loaded offers, falling back to the
 * generic "Diamonds".
 */
export function currencyLabelForGame(gameKey: string, products: Product[]): string {
  const override = CURRENCY_LABEL_OVERRIDES[gameKey]
  if (override) return override

  for (const product of products) {
    const match = product.name.match(CURRENCY_PATTERN)
    if (match) {
      const word = match[1]
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }
  }
  return 'Diamonds'
}
