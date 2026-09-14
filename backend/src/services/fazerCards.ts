/**
 * FazerCards API Service
 * Handles all communication with FazerCards API
 * All API calls are server-side only - FAZER_API_KEY is never exposed to frontend
 */

import { config } from '../config/env.js'
import {
  FazerCategory,
  FazerCategoriesResponse,
  FazerOffer,
  FazerOffersResponse,
  FazerOrderRequest,
  FazerOrderResponse,
  FazerOrderStatusResponse,
  FazerBalanceResponse,
  FazerApiError,
  FazerConnectionTestResult,
  FazerTopupCatalogPage,
  FazerTopupOffersResponse,
} from '../types/fazer.js'

// FazerCards API Configuration
const FAZER_API_BASE = (config.FAZER_API_BASE_URL || 'https://api.fzr.cards/api/v2').replace(/\/+$/, '')
const FAZER_API_KEY = config.FAZER_API_KEY
const REQUEST_TIMEOUT = 30000 // 30 seconds

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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(url, {
      method,
      headers: createHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = (await response.json()) as any

    // Handle API errors
    if (!response.ok) {
      const error: FazerApiError = new Error(
        data?.message || `FazerCards API error: ${response.status}`
      ) as FazerApiError
      error.statusCode = response.status
      error.fazerId = data?.id
      error.fazerCode = data?.code
      error.fazerMessage = data?.message

      console.error('❌ FazerCards API Error:', {
        status: response.status,
        path,
        message: data?.message,
        code: data?.code,
      })

      throw error
    }

    return data as T
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof TypeError && error.message.includes('abort')) {
      const timeoutError: FazerApiError = new Error(
        'FazerCards API request timeout after 30 seconds'
      ) as FazerApiError
      timeoutError.statusCode = 504
      throw timeoutError
    }

    throw error
  }
}

/**
 * Get all available categories (Free Fire Latam, EU, etc)
 */
export async function getCategories(): Promise<FazerCategory[]> {
  try {
    console.log('📡 Fetching FazerCards categories...')
    const response = await fazerRequest<FazerCategoriesResponse>(
      'GET',
      '/topups/categories'
    )

    if (response.status !== 'success') {
      throw new Error(`FazerCards API returned status: ${response.status}`)
    }

    console.log(`✅ Fetched ${response.categories.length} categories`)
    return response.categories
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    throw error
  }
}

/**
 * Get all offers/packages for a category
 * Example: Free Fire Latam diamonds packages (500, 1000, etc)
 */
export async function getOffers(categoryId: string): Promise<FazerOffer[]> {
  try {
    console.log(`📡 Fetching offers for category: ${categoryId}...`)
    const response = await fazerRequest<FazerOffersResponse>(
      'GET',
      `/topups/offers?category_id=${encodeURIComponent(categoryId)}`
    )

    if (response.status !== 'success') {
      throw new Error(`FazerCards API returned status: ${response.status}`)
    }

    console.log(`✅ Fetched ${response.offers.length} offers for ${categoryId}`)
    return response.offers
  } catch (error) {
    console.error(`❌ Error fetching offers for ${categoryId}:`, error)
    throw error
  }
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
