/**
 * FazerCards API Types
 * Based on the official FazerCards reseller API contract.
 * https://reseller.fazercards.com/en/docs
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
  status?: string
  categories?: FazerCategory[]
  items?: FazerCategory[]
}

// ============ CURRENT TOP-UP API SHAPES ============

export interface FazerTopupCategory {
  category_id: string
  name: string
  note?: string
  imageurl?: string | null
}

export interface FazerCatalogMeta {
  total: number
  limit: number
  next_cursor?: string
  has_more: boolean
}

export interface FazerTopupCatalogPage {
  kind?: string
  items: FazerTopupCategory[]
  meta?: FazerCatalogMeta
}

export interface FazerTopupOffer {
  offer_id: string
  name: string
  price_usd: string | number
  stock?: number
}

export interface FazerTopupOffersResponse {
  kind?: string
  category_id: string
  name: string
  offers: FazerTopupOffer[]
  fields?: Array<{ key: string; label: string; type: string; options?: Array<Record<string, unknown>> }>
  note?: string
}

// ============ OFFERS / PACKAGES ============

export interface FazerOffer {
  offer_id: string
  offer_name: string
  amount?: number
  amount_currency?: string
  price: number
  price_currency: string
  price_usd?: string | number
  stock?: number
  provider?: string
  description?: string
  image_url?: string
  is_popular?: boolean
}

export interface FazerOffersResponse {
  status?: string
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
  status?: string
  balance: number
  currency: string
  last_updated?: string
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
