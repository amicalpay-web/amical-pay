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
} from '../types/fazer.js'

// FazerCards API Configuration
const FAZER_API_BASE = (config.FAZER_API_BASE_URL || 'https://api.fzr.cards/api/v2').replace(/\/+$/, '')
const FAZER_API_KEY = config.FAZER_API_KEY
const REQUEST_TIMEOUT = 30000 // 30 seconds
const RATE_LIMIT_RETRIES = 5

/**
 * Create headers for FazerCards API requests
 */
function createHeaders(): Record<string, string> {
  if (!FAZER_API_KEY) {
    throw new Error('FAZER_API_KEY is not configured')
  }

  return {
    'X-API-Key': FAZER_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

/**
 * Make a request to FazerCards API with timeout and error handling
 */
async function fazerRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: any
): Promise<T> {
  if (!FAZER_API_KEY) {
    throw new Error('FAZER_API_KEY environment variable is not set')
  }

  const url = `${FAZER_API_BASE}${path}`

  for (let attempt = 0; attempt <= RATE_LIMIT_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        method,
        headers: createHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const data = (await response.json()) as any

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
        const error: FazerApiError = new Error(
          data?.message || data?.error || `FazerCards API error: ${response.status}`
        ) as FazerApiError
        error.statusCode = response.status
        error.fazerId = data?.id
        error.fazerCode = data?.code
        error.fazerMessage = data?.message || data?.error

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

    categories.push(...response.items.map((item) => ({
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
  const response = await fazerRequest<FazerTopupOffersResponse>(
    'GET',
    `/topups/offers?category_id=${encodeURIComponent(categoryId)}`
  )

  return response.offers.map((offer) => ({
    offer_id: offer.offer_id,
    offer_name: offer.name,
    amount: extractNumericAmount(offer.name),
    price: Number(offer.price_usd),
    price_currency: 'USD',
    price_usd: offer.price_usd,
    stock: offer.stock,
    description: response.name,
    is_popular: false,
  }))
}

const CATALOG_CACHE_TTL = 5 * 60 * 1000
const CATALOG_CONCURRENCY = 1
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
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= categories.length) return

      const category = categories[index]
      try {
        const offers = await getOffers(category.category_id)
        catalog.push({ category, offers })
      } catch (error) {
        failures.push({
          categoryId: category.category_id,
          error: error instanceof Error ? error.message : 'Unknown FazerCards error',
        })
      }
    }
  }

  const workerCount = Math.min(CATALOG_CONCURRENCY, categories.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  if (failures.length > 0) {
    const error = new Error(`FazerCards catalog import failed for ${failures.length} categories`) as FazerApiError & {
      failures: Array<{ categoryId: string; error: string }>
    }
    error.statusCode = 502
    error.failures = failures
    throw error
  }

  catalog.sort((left, right) => left.category.category_name.localeCompare(right.category.category_name))
  return {
    fetched_at: new Date().toISOString(),
    total_categories: catalog.length,
    total_offers: catalog.reduce((total, item) => total + item.offers.length, 0),
    categories: catalog,
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
  playerId: string
): Promise<FazerOrderResponse> {
  try {
    // Validate inputs
    if (!categoryId || !offerId || !playerId) {
      throw new Error('Missing required fields: categoryId, offerId, playerId')
    }

    if (!/^\d+$/.test(playerId)) {
      throw new Error('Invalid player ID format - must be numeric')
    }

    console.log(`📡 Creating order for player ${playerId}...`)

    const orderRequest: FazerOrderRequest = {
      category_id: categoryId,
      offer_id: offerId,
      fields: {
        player_id: playerId,
      },
    }

    const response = await fazerRequest<FazerOrderResponse>(
      'POST',
      '/topups/order',
      orderRequest
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
    const err = error as any

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

/**
 * Validate a Free Fire Player ID
 * This makes a test request to see if the player exists
 * Note: FazerCards may not have a dedicated validation endpoint,
 * so we might need to attempt a mock order or use their validation if available
 */
export async function validatePlayerFreeFireLatam(
  playerId: string
): Promise<{ valid: boolean; playerName?: string; error?: string }> {
  try {
    // Basic format validation
    if (!playerId || !/^\d+$/.test(playerId)) {
      return {
        valid: false,
        error: 'Invalid Free Fire Player ID format - must be numeric',
      }
    }

    // TODO: If FazerCards provides a validation endpoint, use it here
    // For now, we'll return validation success for numeric IDs
    // Real validation will happen when creating an order

    console.log(`✅ Free Fire Player ID format validated: ${playerId}`)

    return {
      valid: true,
      // Player name would be fetched from FazerCards if their API provides it
    }
  } catch (error) {
    console.error('❌ Error validating player ID:', error)
    return {
      valid: false,
      error: 'Failed to validate player ID',
    }
  }
}
