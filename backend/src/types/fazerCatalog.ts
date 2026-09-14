export type FazerCatalogSource =
  | 'topup'
  | 'gamekeys'
  | 'giftcards'
  | 'manual-services'
  | 'steam-topup'
  | 'steam-gifts'
  | 'telegram'

export interface FazerCatalogError {
  source: FazerCatalogSource
  endpoint: string
  status: number
  code?: string
  message: string
  retryable: boolean
  categoryId?: string
}

export interface FazerCatalogEntry {
  id: string
  name: string
  source: FazerCatalogSource
  category?: Record<string, unknown>
  offers?: Array<Record<string, unknown>>
  fields?: Array<Record<string, unknown>>
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface FazerCatalogFamily {
  source: FazerCatalogSource
  endpoint: string
  fetched_at: string
  total_categories: number
  total_offers: number
  categories: FazerCatalogEntry[]
  quotes?: Record<string, unknown>
  meta?: Record<string, unknown>
  errors: FazerCatalogError[]
}

export interface FazerFullCatalog {
  fetched_at: string
  sources: FazerCatalogFamily[]
  errors: FazerCatalogError[]
}

export interface FazerOrderPayload {
  [key: string]: unknown
}
