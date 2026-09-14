/**
 * FazerCards API service.
 * Secrets stay server-side in FAZER_API_KEY.
 * Contract aligned with https://api.fzr.cards/public/docs/openapi.json
 */

import { config } from '../config/env.js'
import {
  FazerApiError,
  FazerApiOffer,
  FazerBalanceResponse,
  FazerCategoriesResponse,
  FazerCategory,
  FazerConnectionTestResult,
  FazerField,
  FazerOffer,
  FazerOffersResponse,
  FazerOrderRequest,
  FazerOrderResponse,
  FazerOrderStatusResponse,
} from '../types/fazer.js'

const FAZER_API_BASE = 'https://api.fzr.cards/api/v2'
const FAZER_API_KEY = config.FAZER_API_KEY
const REQUEST_TIMEOUT = 30000

type FazerErrorPayload = {
  error?: string
  message?: string
  code?: string
  id?: string
}

type FazerOrderPayload = {
  id?: string
  order_id?: string
  public_id?: string
  status?: string
  order_status?: FazerOrderResponse['order_status']
  amount?: number | string
  amount_usd?: number | string
  currency?: string
  created_at?: string
  completed_at?: string
  message?: string
}

function createHeaders(): Record<string, string> {
  if (!FAZER_API_KEY) {
    throw new Error('FAZER_API_KEY is not configured')
  }

  return {
    Authorization: 'Bearer ' + FAZER_API_KEY,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function fazerRequest<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  if (!FAZER_API_KEY) {
    throw new Error('FAZER_API_KEY environment variable is not set')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(FAZER_API_BASE + path, {
      method,
      headers: createHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })

    const data = await response.json().catch(() => ({})) as FazerErrorPayload & T

    if (!response.ok) {
      const error = new Error(
        data.message || data.error || 'FazerCards API error: ' + response.status,
      ) as FazerApiError
      error.statusCode = response.status
      error.fazerId = data.id
      error.fazerCode = data.code
      error.fazerMessage = data.message || data.error
      throw error
    }

    return data as T
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(
        'FazerCards API request timeout after ' + REQUEST_TIMEOUT + 'ms',
      ) as FazerApiError
      timeoutError.statusCode = 504
      throw timeoutError
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getCategories(): Promise<FazerCategory[]> {
  const response = await fazerRequest<FazerCategoriesResponse>(
    'GET',
    '/topups?limit=100&include_ui=1',
  )

  if (response.ok !== true || !Array.isArray(response.items)) {
    throw new Error('FazerCards returned an invalid categories response')
  }

  return response.items.map((item) => ({
    category_id: item.category_id,
    category_name: item.name,
    description: item.note,
    image_url: item.imageurl || undefined,
  }))
}

const regionAliases: Record<string, string[]> = {
  LATAM: ['latam', 'latin america', 'latinamerica', 'south america'],
  EU: ['europe', 'eu'],
  BR: ['brazil', 'brasil', 'br'],
  MENA: ['mena', 'middle east', 'north africa', 'arab'],
}

export async function getCategoryForRegion(region: string): Promise<FazerCategory> {
  const categories = await getCategories()
  const normalizedRegion = region.trim().toUpperCase()
  const aliases = regionAliases[normalizedRegion] || [normalizedRegion.toLowerCase()]
  const freeFireCategories = categories.filter((category) => {
    const text = (category.category_name + ' ' + category.category_id).toLowerCase()
    return text.includes('free fire') || text.includes('freefire')
  })
  const candidates = freeFireCategories.length > 0 ? freeFireCategories : categories
  const match = candidates.find((category) => {
    const text = (category.category_name + ' ' + category.category_id).toLowerCase()
    return aliases.some((alias) => text.includes(alias))
  })

  if (match) return match
  if (candidates.length === 1) return candidates[0]

  throw new Error('No FazerCards category found for region ' + normalizedRegion)
}

function parseOfferAmount(name: string): number {
  const match = name.match(/[0-9][0-9,\s.]*/)
  if (!match) return 0
  return Number(match[0].replace(/[,.\s]/g, '')) || 0
}

export async function getOffers(categoryId: string): Promise<FazerOffer[]> {
  const response = await fazerRequest<FazerOffersResponse>(
    'GET',
    '/topups/offers?category_id=' + encodeURIComponent(categoryId) + '&include_ui=1',
  )

  if (response.ok !== true || !Array.isArray(response.offers)) {
    throw new Error('FazerCards returned an invalid offers response')
  }

  return response.offers
    .filter((offer: FazerApiOffer) => Boolean(offer.offer_id))
    .map((offer: FazerApiOffer, index: number) => ({
      offer_id: offer.offer_id as string,
      offer_name: offer.name,
      amount: parseOfferAmount(offer.name),
      amount_currency: 'diamonds',
      price: Number.parseFloat(offer.price_usd),
      price_currency: 'USD' as const,
      description: offer.name,
      is_popular: index < 2,
    }))
}

function normalizeOrder(order: FazerOrderPayload): FazerOrderResponse {
  const orderId = order.public_id || order.id || order.order_id || ''
  const amount = Number(order.amount_usd ?? order.amount ?? 0)
  return {
    status: 'success',
    order_id: orderId,
    order_status: order.order_status || 'pending',
    amount,
    amount_currency: order.currency || 'USD',
    created_at: order.created_at || new Date().toISOString(),
    completed_at: order.completed_at,
    message: order.message,
  }
}

export async function createOrder(
  categoryId: string,
  offerId: string,
  playerId: string,
): Promise<FazerOrderResponse> {
  if (!categoryId || !offerId || !playerId) {
    throw new Error('Missing required fields: categoryId, offerId, playerId')
  }

  if (!/^[0-9]+$/.test(playerId)) {
    throw new Error('Invalid player ID format - must be numeric')
  }

  const request: FazerOrderRequest = {
    category_id: categoryId,
    offer_id: offerId,
    fields: { player_id: playerId },
  }
  const response = await fazerRequest<{ ok: true; order: FazerOrderPayload }>(
    'POST',
    '/topups/order',
    request,
  )

  if (response.ok !== true || !response.order) {
    throw new Error('FazerCards returned an invalid order response')
  }

  return normalizeOrder(response.order)
}

export async function getOrderStatus(orderId: string): Promise<FazerOrderStatusResponse> {
  const response = await fazerRequest<{ ok: true; order: FazerOrderPayload }>(
    'GET',
    '/orders/' + encodeURIComponent(orderId),
  )

  if (response.ok !== true || !response.order) {
    throw new Error('FazerCards returned an invalid order status response')
  }

  return normalizeOrder(response.order)
}

export async function getBalance(): Promise<FazerBalanceResponse> {
  const response = await fazerRequest<{ ok: true; balance: string; currency: string }>(
    'GET',
    '/balance',
  )

  if (response.ok !== true) {
    throw new Error('FazerCards returned an invalid balance response')
  }

  return {
    status: 'success',
    balance: Number.parseFloat(response.balance),
    currency: response.currency,
    last_updated: new Date().toISOString(),
  }
}

export async function testConnection(): Promise<FazerConnectionTestResult> {
  const result: FazerConnectionTestResult = {
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    apiKeySet: Boolean(FAZER_API_KEY),
  }

  if (!FAZER_API_KEY) {
    result.status = 'MISSING_API_KEY'
    result.error = 'FAZER_API_KEY environment variable is not set'
    return result
  }

  try {
    const categories = await getCategories()
    result.fazerApiReachable = true
    result.authenticationValid = true
    result.categoriesCount = categories.length
    return result
  } catch (error) {
    const err = error as FazerApiError
    result.fazerApiReachable = Boolean(err.statusCode)
    result.authenticationValid = err.statusCode !== 401 && err.statusCode !== 403
    result.status = err.statusCode === 401 || err.statusCode === 403
      ? 'AUTHENTICATION_ERROR'
      : err.statusCode === 504
        ? 'TIMEOUT'
        : 'API_ERROR'
    result.error = err.message || 'Unknown FazerCards error'
    result.details = err.fazerMessage
    return result
  }
}

export async function validatePlayerFreeFireLatam(
  playerId: string,
): Promise<{ valid: boolean; playerName?: string; error?: string }> {
  if (!playerId || !/^[0-9]+$/.test(playerId)) {
    return { valid: false, error: 'Invalid Free Fire Player ID format - must be numeric' }
  }

  try {
    const response = await fazerRequest<{
      ok: true
      items: Array<{ category_id: string; name: string; fields: FazerField[] }>
    }>('GET', '/topups/validate-id')
    const game = response.items.find((item) => /free\s*fire/i.test(item.name))

    if (!game) {
      return { valid: false, error: 'Free Fire validation is not available in FazerCards' }
    }

    const playerField = game.fields.find((field) => field.type === 'text') || game.fields[0]
    const validation = await fazerRequest<{
      ok: true
      valid: boolean
      player_name?: string | null
    }>('POST', '/topups/validate-id', {
      category_id: game.category_id,
      fields: { [playerField.key]: playerId },
    })

    return {
      valid: validation.valid,
      playerName: validation.player_name || undefined,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate player ID',
    }
  }
}
