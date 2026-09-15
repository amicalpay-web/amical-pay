/**
 * FazerCards API Service
 * Handles all communication with FazerCards API
 * All API calls are server-side only - FAZER_API_KEY is never exposed to frontend
 */

import { config } from '../config/env.js'
import {
  FazerCategory,
  FazerOffer,
  FazerOrderRequest,
  FazerOrderResponse,
  FazerOrderStatusResponse,
  FazerBalanceResponse,
  FazerApiError,
  FazerConnectionTestResult,
  FazerCatalogItem,
  FazerCatalogSnapshot,
  FazerTopupCatalogPage,
  FazerTopupOffersResponse,
  FazerValidationCategory,
  FazerValidationCatalogResponse,
  FazerPlayerValidationRequest,
  FazerPlayerValidationResponse,
  FazerValidationField,
} from '../types/fazer.js'

// FazerCards API Configuration
const FAZER_API_BASE = (config.FAZER_API_BASE_URL || 'https://api.fzr.cards/api/v2').replace(/\/+$/, '')
const FAZER_API_KEY = config.FAZER_API_KEY
const REQUEST_TIMEOUT = 30000 // 30 seconds
const RATE_LIMIT_RETRIES = 5
type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {}
}

/**
 * Create headers for FazerCards API requests
 */
function createHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  if (!FAZER_API_KEY) {
    throw new Error('FAZER_API_KEY is not configured')
  }

  return {
    'X-API-Key': FAZER_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...extraHeaders,
  }
}

/**
 * Make a request to FazerCards API with timeout and error handling
 */
async function fazerRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {}
): Promise<T> {
  if (!FAZER_API_KEY) {
    const error = new Error('FAZER_API_KEY environment variable is not set') as FazerApiError
    error.statusCode = 503
    error.status = 503
    throw error
  }

  const url = `${FAZER_API_BASE}${path}`

  for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        method,
        headers: createHeaders(extraHeaders),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const data = asRecord(await response.json())

      if (response.status === 429 && attempt < RATE_LIMIT_RETRIES) {
        const retryAfterHeader = response.headers.get('retry-after')
        const retryAfterBody = typeof data?.error === 'string'
          ? data.error.match(/(\d+)\s*(?:s|sec|second)/i)?.[1]
          : undefined
        const retrySeconds = Number(retryAfterHeader || retryAfterBody || 30)
        const waitMs = Math.min(Math.max(retrySeconds * 1000, 1000), 120000)
        console.warn(`⚠️ FazerCards rate limit for ${path}; retrying in ${Math.ceil(waitMs / 1000)}s`)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        continue
      }

      if (!response.ok) {
        const providerMessage = typeof data.message === 'string' ? data.message : undefined
        const providerError = typeof data.error === 'string' ? data.error : undefined
        const error: FazerApiError = new Error(
          providerMessage || providerError || `FazerCards API error: ${response.status}`
        ) as FazerApiError
        error.statusCode = response.status
        error.status = response.status
        error.fazerId = typeof data.id === 'string' ? data.id : undefined
        error.fazerCode = typeof data.code === 'string' ? data.code : undefined
        error.fazerMessage = providerMessage || providerError

        console.error('❌ FazerCards API Error:', {
          status: response.status,
          path,
          message: data?.message || data?.error,
          code: data?.code,
        })

        throw error
      }

      return data as T
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('abort')) {
        const timeoutError: FazerApiError = new Error(
          'FazerCards API request timeout after 30 seconds'
        ) as FazerApiError
        timeoutError.statusCode = 504
        throw timeoutError
      }

      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw new Error(`FazerCards rate limit retries exhausted for ${path}`)
}

/**
 * Get all purchasable top-up categories from FazerCards.
 * The API is cursor-paginated; collect every page before resolving a region.
 */
export async function getCategories(): Promise<FazerCategory[]> {
  const categories: FazerCategory[] = []
  let cursor: string | undefined

  do {
    const query = new URLSearchParams({ limit: '100' })
    if (cursor) query.set('cursor', cursor)

    const response = await fazerRequest<FazerTopupCatalogPage>(
      'GET',
      `/topups?${query.toString()}`
    )

    const items = Array.isArray(response.items) ? response.items : []
    categories.push(...items.map((item) => ({
      category_id: item.category_id,
      category_name: item.name,
      name: item.name,
      description: item.note,
      image_url: item.imageurl ?? undefined,
    })))

    cursor = response.meta?.has_more ? response.meta.next_cursor : undefined
  } while (cursor)

  console.log(`✅ Fetched ${categories.length} FazerCards top-up categories`)
  return categories
}

/**
 * Get all offers/packages for a purchasable top-up category.
 * FazerCards returns price_usd and name; the legacy shape is kept for callers.
 */
export async function getOffers(categoryId: string): Promise<FazerOffer[]> {
  const response = await getTopupOffers(categoryId)

  return response.offers.map((offer) => ({
    offer_id: offer.offer_id,
    offer_name: offer.name,
    amount: extractNumericAmount(offer.name),
    price: Number(offer.price_usd),
    price_currency: 'USD',
    price_usd: offer.price_usd,
    stock: offer.stock,
    description: offer.description || response.note || response.name,
    image_url: offer.image_url || offer.image || undefined,
    is_popular: false,
    fields: offer.fields || response.fields || [],
    metadata: offer.metadata || response.metadata,
    category_id: response.category_id,
    category_name: response.name,
  }))
}

/**
 * Get the raw offers response, including the dynamic fields required by
 * FazerCards for player validation and ordering.
 */
export async function getTopupOffers(categoryId: string): Promise<FazerTopupOffersResponse> {
  return fazerRequest<FazerTopupOffersResponse>(
    'GET',
    `/topups/offers?category_id=${encodeURIComponent(categoryId)}`
  )
}

/**
 * Get the dynamic list of games/categories that support Player ID validation.
 * Never hard-code category IDs or field names: FazerCards owns this catalog.
 */
export async function getPlayerValidationCatalog(): Promise<FazerValidationCategory[]> {
  const response = await fazerRequest<FazerValidationCatalogResponse>(
    'GET',
    '/topups/validate-id'
  )

  return response.items
}

/**
 * Validate a player through FazerCards before accepting an AmicalPay order.
 */
export async function validatePlayer(
  categoryId: string,
  fields: Record<string, unknown>
): Promise<FazerPlayerValidationResponse> {
  if (!categoryId || !fields || Object.keys(fields).length === 0) {
    const error = new Error('categoryId and validation fields are required') as FazerApiError
    error.statusCode = 400
    error.status = 400
    throw error
  }

  const request: FazerPlayerValidationRequest = {
    category_id: categoryId,
    fields,
  }

  const response = await fazerRequest<FazerPlayerValidationResponse>(
    'POST',
    '/topups/validate-id',
    request
  )

  if (!response.valid) {
    const error = new Error('FazerCards could not confirm this player ID') as FazerApiError
    error.statusCode = 422
    error.status = 422
    throw error
  }

  return response
}

const CATALOG_CACHE_TTL = 5 * 60 * 1000
// FazerCards exposes hundreds of categories. Serial loading makes the public
// catalog exceed Render's proxy timeout, while an unbounded fan-out triggers
// upstream rate limits. Eight workers keeps the full catalog responsive.
const CATALOG_CONCURRENCY = 8
let catalogCache: { snapshot: FazerCatalogSnapshot; expiresAt: number } | undefined
let catalogRequest: Promise<FazerCatalogSnapshot> | undefined

/**
 * Import the complete FazerCards catalog without exposing the API key.
 * Categories are fetched with cursor pagination and offers are loaded with
 * bounded concurrency. The short cache avoids repeating dozens of upstream
 * requests for every storefront visitor while keeping prices reasonably fresh.
 */
async function fetchCompleteCatalog(): Promise<FazerCatalogSnapshot> {
  const categories = await getCategories()
  const catalog: FazerCatalogItem[] = []
  const failures: Array<{ categoryId: string; error: string }> = []
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < categories.length) {
      const index = nextIndex
      nextIndex += 1

      const category = categories[index]
      try {
        const response = await getTopupOffers(category.category_id)
        const offers = response.offers.map((offer) => ({
          offer_id: offer.offer_id,
          offer_name: offer.name,
          amount: extractNumericAmount(offer.name),
          price: Number(offer.price_usd),
          price_currency: 'USD',
          price_usd: offer.price_usd,
          stock: offer.stock,
          description: offer.description || response.note || category.description,
          image_url: offer.image_url || offer.image || category.image_url,
          is_popular: false,
          fields: offer.fields || response.fields || [],
          metadata: offer.metadata || response.metadata,
          category_id: response.category_id,
          category_name: response.name || category.category_name,
        }))
        catalog.push({
          category,
          offers,
          fields: response.fields || [],
          note: response.note,
          metadata: response.metadata,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown FazerCards error'
        failures.push({
          categoryId: category.category_id,
          error: message,
        })
        // Keep the category visible so one upstream failure cannot hide the
        // rest of the catalog. The frontend can show the error and retry later.
        catalog.push({
          category,
          offers: [],
          error: message,
        })
      }
    }
  }

  const workerCount = Math.min(CATALOG_CONCURRENCY, categories.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  catalog.sort((left, right) => left.category.category_name.localeCompare(right.category.category_name))
  return {
    fetched_at: new Date().toISOString(),
    total_categories: categories.length,
    total_offers: catalog.reduce((total, item) => total + item.offers.length, 0),
    categories: catalog,
    errors: failures.map((failure) => ({
      categoryId: failure.categoryId,
      categoryName: categories.find((category) => category.category_id === failure.categoryId)?.category_name || failure.categoryId,
      error: failure.error,
    })),
  }
}

export async function getCatalog(): Promise<FazerCatalogSnapshot> {
  if (catalogCache && catalogCache.expiresAt > Date.now()) {
    return catalogCache.snapshot
  }

  if (!catalogRequest) {
    catalogRequest = fetchCompleteCatalog()
      .then((snapshot) => {
        catalogCache = {
          snapshot,
          expiresAt: Date.now() + CATALOG_CACHE_TTL,
        }
        return snapshot
      })
      .finally(() => {
        catalogRequest = undefined
      })
  }

  return catalogRequest
}

function extractNumericAmount(value: string): number | undefined {
  const match = value.match(/[0-9][0-9,]*/)
  return match ? Number(match[0].replace(/,/g, '')) : undefined
}

/**
 * Create a top-up order for Free Fire Latam
 * This creates a real order - use with caution
 */
export async function createOrder(
  categoryId: string,
  offerId: string,
  fields: Record<string, unknown>,
  idempotencyKey?: string,
  validationFields?: FazerValidationField[]
): Promise<FazerOrderResponse> {
  try {
    // Validate inputs
    if (!categoryId || !offerId || !fields || typeof fields !== 'object') {
      throw new Error('Missing required fields: categoryId, offerId, fields')
    }

    // Validation is only required for categories that FazerCards explicitly
    // exposes in its validation catalog. Other products can use their own
    // order fields without being forced through Player ID validation.
    const requiredValidationFields = validationFields || (
      Object.keys(fields).length > 0
        ? (await getPlayerValidationCatalog()).find((category) => category.category_id === categoryId)?.fields || []
        : []
    )
    if (requiredValidationFields.length > 0) {
      await validatePlayer(categoryId, fields)
    }

    console.log(`📡 Creating FazerCards order for category ${categoryId}...`)

    const orderRequest: FazerOrderRequest = {
      category_id: categoryId,
      offer_id: offerId,
      fields,
    }

    const response = await fazerRequest<FazerOrderResponse>(
      'POST',
      '/topups/order',
      orderRequest,
      idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}
    )

    if (response.status !== 'success') {
      throw new Error(`FazerCards API returned status: ${response.status}`)
    }

    console.log(`✅ Order created: ${response.order_id}`)
    return response
  } catch (error) {
    console.error('❌ Error creating order:', error)
    throw error
  }
}

/**
 * Get order status
 */
export async function getOrderStatus(
  orderId: string
): Promise<FazerOrderStatusResponse> {
  try {
    console.log(`📡 Fetching order status: ${orderId}...`)
    const response = await fazerRequest<FazerOrderStatusResponse>(
      'GET',
      `/orders/${encodeURIComponent(orderId)}`
    )

    if (response.status !== 'success') {
      throw new Error(`FazerCards API returned status: ${response.status}`)
    }

    console.log(`✅ Order status: ${response.order_status}`)
    return response
  } catch (error) {
    console.error(`❌ Error fetching order status:`, error)
    throw error
  }
}

/**
 * Get account balance
 */
export async function getBalance(): Promise<FazerBalanceResponse> {
  try {
    console.log('📡 Fetching account balance...')
    const response = await fazerRequest<FazerBalanceResponse>(
      'GET',
      '/balance'
    )

    if (response.status !== 'success') {
      throw new Error(`FazerCards API returned status: ${response.status}`)
    }

    console.log(`✅ Balance: ${response.balance} ${response.currency}`)
    return response
  } catch (error) {
    console.error('❌ Error fetching balance:', error)
    throw error
  }
}

/**
 * Test connection to FazerCards API
 * Used for health checks and diagnostics
 * NEVER exposes the actual API key
 */
export async function testConnection(): Promise<FazerConnectionTestResult> {
  const result: FazerConnectionTestResult = {
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    apiKeySet: !!FAZER_API_KEY,
  }

  // Check if API key is configured
  if (!FAZER_API_KEY) {
    result.status = 'MISSING_API_KEY'
    result.error = 'FAZER_API_KEY environment variable is not set'
    console.error('❌ FAZER_API_KEY is not configured')
    return result
  }

  try {
    // Try to fetch categories to verify connection and authentication
    const categories = await getCategories()
    result.fazerApiReachable = true
    result.authenticationValid = true
    result.categoriesCount = categories.length
    result.status = 'SUCCESS'

    console.log(`✅ FazerCards connection test PASSED`)
  } catch (error) {
    const err: FazerApiError = error instanceof Error
      ? error as FazerApiError
      : new Error('Unknown FazerCards error') as FazerApiError

    // Determine the type of error
    if (err.statusCode === 401 || err.statusCode === 403) {
      result.status = 'AUTHENTICATION_ERROR'
      result.error = 'Authentication failed - API key may be invalid'
      result.details = `HTTP ${err.statusCode}: ${err.fazerMessage || err.message}`
    } else if (err.message?.includes('timeout')) {
      result.status = 'TIMEOUT'
      result.error = 'Request timed out'
      result.details = 'FazerCards API is not responding within 30 seconds'
    } else if (err instanceof SyntaxError) {
      result.status = 'INVALID_RESPONSE'
      result.error = 'Invalid API response'
      result.details = 'FazerCards API returned invalid JSON'
    } else if (err.statusCode) {
      result.status = 'API_ERROR'
      result.error = `HTTP ${err.statusCode}: ${err.fazerMessage || err.message}`
      result.details = err.fazerCode ? `Code: ${err.fazerCode}` : undefined
    } else {
      result.status = 'API_ERROR'
      result.error = err.message || 'Unknown error'
      result.details = err.toString()
    }

    result.fazerApiReachable = err.statusCode ? true : false

    console.error(`❌ FazerCards connection test FAILED: ${result.status}`, {
      error: result.error,
      details: result.details,
    })
  }

  return result
}
