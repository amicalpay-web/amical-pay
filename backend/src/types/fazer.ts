/**
 * FazerCards API Types
 * Based on official FazerCards API documentation
 * https://api.fzr.cards/public/docs
 */

// ============ CATEGORIES ============

export interface FazerCategory {
  category_id: string
  category_name: string
  name?: string
  description?: string
  image_url?: string
}

export interface FazerCategoriesResponse {
  status: string
  categories: FazerCategory[]
}

\n// ============ CURRENT TOP-UP API SHAPES ============\n\nexport interface FazerTopupCategory {\n  category_id: string\n  name: string\n  note?: string\n  imageurl?: string | null\n}\n\nexport interface FazerCatalogMeta {\n  total: number\n  limit: number\n  next_cursor?: string\n  has_more: boolean\n}\n\nexport interface FazerTopupCatalogPage {\n  kind?: string\n  items: FazerTopupCategory[]\n  meta?: FazerCatalogMeta\n}\n\nexport interface FazerTopupOffer {\n  offer_id: string\n  name: string\n  price_usd: string | number\n  stock?: number\n}\n\nexport interface FazerTopupOffersResponse {\n  kind?: string\n  category_id: string\n  name: string\n  offers: FazerTopupOffer[]\n  fields?: Array<{ key: string; label: string; type: string; options?: Array<Record<string, unknown>> }>\n  note?: string\n}\n// ============ OFFERS / PACKAGES ============

export interface FazerOffer {
  offer_id: string
  offer_name: string
  amount: number // Diamonds/currency amount
  amount_currency?: string // USD, HTG, etc
  price: number // Reseller price in USD
  price_currency: string // USD
  provider?: string
  description?: string
  image_url?: string
  is_popular?: boolean
  price_usd?: string | number
  stock?: number
}

export interface FazerOffersResponse {
  status: string
  category_id: string
  offers: FazerOffer[]
}

// ============ ORDERS ============

export interface FazerOrderRequest {
  category_id: string
  offer_id: string
  fields: {
    player_id: string
    [key: string]: any
  }
}

export interface FazerOrderResponse {
  status: string
  order_id: string
  reference_id?: string
  order_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  amount_currency: string
  created_at: string
  message?: string
}

export interface FazerOrderStatusResponse {
  status: string
  order_id: string
  order_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  amount_currency: string
  created_at: string
  completed_at?: string
  message?: string
}

// ============ BALANCE ============

export interface FazerBalanceResponse {
  status: string
  balance: number
  currency: string
  last_updated: string
}

// ============ API ERRORS ============

export interface FazerErrorResponse {
  status: 'error' | 'fail'
  code?: string
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

export interface FazerApiError extends Error {
  statusCode: number
  fazerId?: string
  fazerCode?: string
  fazerMessage?: string
}

// ============ CONNECTION TEST ============

export type FazerConnectionStatus =
  | 'SUCCESS'
  | 'MISSING_API_KEY'
  | 'AUTHENTICATION_ERROR'
  | 'API_ERROR'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'

export interface FazerConnectionTestResult {
  status: FazerConnectionStatus
  timestamp: string
  apiKeySet: boolean
  fazerApiReachable?: boolean
  authenticationValid?: boolean
  categoriesCount?: number
  error?: string
  details?: string
}
