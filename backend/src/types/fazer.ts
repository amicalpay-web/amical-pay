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
  metadata?: Record<string, unknown>
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
  description?: string
  image?: string | null
  image_url?: string | null
  metadata?: Record<string, unknown>
  fields?: FazerValidationField[]
}

export interface FazerValidationField {
  key?: string
  name?: string
  label?: string
  type?: string
  required?: boolean
  options?: Array<Record<string, unknown>>
}

export interface FazerTopupOffersResponse {
  kind?: string
  category_id: string
  name: string
  offers: FazerTopupOffer[]
  fields?: FazerValidationField[]
  note?: string
  metadata?: Record<string, unknown>
}

export interface FazerValidationCategory {
  category_id: string
  name: string
  fields: FazerValidationField[]
}

export interface FazerValidationCatalogResponse {
  ok: true
  kind: 'topup'
  items: FazerValidationCategory[]
}

export interface FazerPlayerValidationRequest {
  category_id: string
  fields: Record<string, unknown>
}

export interface FazerPlayerValidationResponse {
  ok: true
  category_id: string
  valid: boolean
  player_name: string | null
  player_id?: string | null
  region?: string | null
}

export interface FazerCatalogItem {
  category: FazerCategory
  offers: FazerOffer[]
  fields?: FazerValidationField[]
  note?: string
  metadata?: Record<string, unknown>
  error?: string
}

export interface FazerCatalogSnapshot {
  fetched_at: string
  total_categories: number
  total_offers: number
  categories: FazerCatalogItem[]
  errors?: Array<{ categoryId: string; categoryName: string; error: string }>
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
  fields?: FazerValidationField[]
  metadata?: Record<string, unknown>
  category_id?: string
  category_name?: string
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
  fields: Record<string, unknown>
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
  status?: number
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
