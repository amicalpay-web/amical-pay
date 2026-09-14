/**
 * FazerCards API Types
 * Based on https://api.fzr.cards/public/docs/openapi.json
 */

export interface FazerCategory {
  category_id: string
  category_name: string
  description?: string
  image_url?: string
}

export interface FazerCategoryItem {
  category_id: string
  name: string
  note?: string
  imageurl?: string | null
}

export interface FazerCategoriesResponse {
  ok: true
  kind: 'topup'
  items: FazerCategoryItem[]
  meta?: {
    total: number
    limit: number
    next_cursor: string | null
    has_more: boolean
  }
}

export interface FazerApiOffer {
  offer_id: string | null
  name: string
  price_usd: string
}

export interface FazerField {
  key: string
  label: string
  type: string
  options?: Array<Record<string, unknown>>
}

export interface FazerOffersResponse {
  ok: true
  kind: 'topup'
  category_id: string
  name: string
  note?: string
  imageurl?: string | null
  offers: FazerApiOffer[]
  fields: FazerField[]
}

export interface FazerOffer {
  offer_id: string
  offer_name: string
  amount: number
  amount_currency: string
  price: number
  price_currency: 'USD'
  provider?: string
  description?: string
  image_url?: string
  is_popular?: boolean
}

export interface FazerOrderRequest {
  category_id: string
  offer_id: string
  fields: Record<string, string>
}

export interface FazerOrderResponse {
  status: 'success'
  order_id: string
  reference_id?: string
  order_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  amount_currency: string
  created_at: string
  message?: string
}

export interface FazerOrderStatusResponse {
  status: 'success'
  order_id: string
  order_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  amount_currency: string
  created_at: string
  completed_at?: string
  message?: string
}

export interface FazerBalanceResponse {
  status: 'success'
  balance: number
  currency: string
  last_updated: string
}

export interface FazerApiError extends Error {
  statusCode: number
  fazerId?: string
  fazerCode?: string
  fazerMessage?: string
}

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
