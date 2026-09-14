import { config } from '../config/env.js'
import { getCatalog as getTopupCatalog } from './fazerCards.js'
import {
  FazerCatalogEntry,
  FazerCatalogError,
  FazerCatalogFamily,
  FazerCatalogSource,
  FazerFullCatalog,
  FazerOrderPayload,
} from '../types/fazerCatalog.js'

const FAZER_API_BASE = (config.FAZER_API_BASE_URL || 'https://api.fzr.cards/api/v2').replace(/\/+$/, '')
const REQUEST_TIMEOUT = 30000
const CATALOG_CACHE_TTL = 5 * 60 * 1000
const FAMILY_TIMEOUT = 8000

type JsonRecord = Record<string, unknown>

interface FazerCatalogApiError extends Error {
  status?: number
  code?: string
  retryable?: boolean
  endpoint?: string
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {}
}

function createApiError(
  message: string,
  endpoint: string,
  status = 503,
  code?: string
): FazerCatalogApiError {
  const error = new Error(message) as FazerCatalogApiError
  error.status = status
  error.code = code
  error.endpoint = endpoint
  error.retryable = status === 408 || status === 425 || status === 429 || status >= 500
  return error
}

async function requestJson<T>(
  method: 'GET' | 'POST',
  endpoint: string,
  body?: FazerOrderPayload,
  extraHeaders: Record<string, string> = {}
): Promise<T> {
  const apiKey = config.FAZER_API_KEY
  if (!apiKey) {
    throw createApiError(
      'FAZER_API_KEY environment variable is not set',
      endpoint,
      503,
      'missing_api_key'
    )
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    try {
      const response = await fetch(FAZER_API_BASE + endpoint, {
        method,
        headers: {
          'X-API-Key': apiKey,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...extraHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
      const data = await response.json().catch(() => ({})) as unknown

      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get('retry-after') || 1)
        await new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(retryAfter * 1000, 1000), 10000)))
        continue
      }

      if (!response.ok) {
        const payload = asRecord(data)
        throw createApiError(
          String(payload.error || payload.message || ('FazerCards API error: ' + response.status)),
          endpoint,
          response.status,
          typeof payload.code === 'string' ? payload.code : undefined
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw createApiError('FazerCards API request timeout after 30 seconds', endpoint, 504, 'timeout')
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  throw createApiError('FazerCards rate limit retries exhausted', endpoint, 429, 'rate_limited')
}

function toCatalogError(
  source: FazerCatalogSource,
  endpoint: string,
  error: unknown,
  categoryId?: string
): FazerCatalogError {
  const apiError = error as FazerCatalogApiError
  const status = typeof apiError.status === 'number' ? apiError.status : 503
  return {
    source,
    endpoint,
    status,
    ...(apiError.code ? { code: apiError.code } : {}),
    message: error instanceof Error ? error.message : 'Unknown FazerCards error',
    retryable: apiError.retryable ?? (status === 408 || status === 425 || status === 429 || status >= 500),
    ...(categoryId ? { categoryId } : {}),
  }
}

function createFamily(source: FazerCatalogSource, endpoint: string): FazerCatalogFamily {
  return {
    source,
    endpoint,
    fetched_at: new Date().toISOString(),
    total_categories: 0,
    total_offers: 0,
    categories: [],
    errors: [],
  }
}

async function loadCursorItems(
  endpoint: string
): Promise<{ items: JsonRecord[]; meta: JsonRecord }> {
  const items: JsonRecord[] = []
  let cursor: string | undefined
  let meta: JsonRecord = {}

  do {
    const query = new URLSearchParams({ limit: '100', include_ui: '1' })
    if (cursor) query.set('cursor', cursor)
    const page = asRecord(await requestJson<unknown>('GET', endpoint + '?' + query.toString()))
    const pageItems = Array.isArray(page.items) ? page.items.filter(isRecord) : []
    items.push(...pageItems)
    meta = asRecord(page.meta)
    const nextCursor = meta.next_cursor
    cursor = meta.has_more && typeof nextCursor === 'string' && nextCursor ? nextCursor : undefined
  } while (cursor)

  return { items, meta }
}

async function loadTopupFamily(): Promise<FazerCatalogFamily> {
  const family = createFamily('topup', '/topups')
  try {
    const snapshot = await getTopupCatalog()
    family.categories = snapshot.categories.map((item) => ({
      id: item.category.category_id,
      name: item.category.category_name,
      source: 'topup' as const,
      category: item.category as unknown as JsonRecord,
      offers: item.offers.map((offer) => ({
        offer_id: offer.offer_id,
        name: offer.offer_name,
        price_usd: offer.price_usd ?? offer.price,
        stock: offer.stock,
        description: offer.description,
        image: offer.image_url,
        fields: offer.fields,
        metadata: offer.metadata,
      })),
      fields: item.fields,
      ...(item.note ? { note: item.note } : {}),
    }))
    family.total_categories = family.categories.length
    family.total_offers = family.categories.reduce(
      (total, category) => total + (Array.isArray(category.offers) ? category.offers.length : 0),
      0
    )
    family.meta = {
      total: family.total_categories,
      limit: family.total_categories,
      has_more: false,
    }
    if (snapshot.errors) {
      family.errors.push(...snapshot.errors.map((error) => ({
        source: 'topup' as const,
        endpoint: '/topups/offers?category_id=' + encodeURIComponent(error.categoryId),
        status: 503,
        message: error.error,
        retryable: true,
        categoryId: error.categoryId,
      })))
    }
  } catch (error) {
    family.errors.push(toCatalogError('topup', '/topups', error))
  }
  return family
}
async function loadGameKeyFamily(): Promise<FazerCatalogFamily> {
  const family = createFamily('gamekeys', '/gamekeys')
  try {
    const result = await loadCursorItems('/gamekeys')
    family.meta = result.meta
    for (const category of result.items) {
      const gameId = String(category.game_id || '')
      const entry: FazerCatalogEntry = {
        id: gameId,
        name: String(category.name || category.GameName || gameId),
        source: 'gamekeys',
        category,
        offers: [],
      }
      try {
        const response = asRecord(await requestJson<unknown>(
          'GET',
          '/gamekeys/keys?game_id=' + encodeURIComponent(gameId) + '&include_ui=1'
        ))
        const offers = Array.isArray(response.keys) ? response.keys.filter(isRecord) : []
        entry.offers = offers
        family.total_offers += offers.length
      } catch (error) {
        family.errors.push(toCatalogError(
          'gamekeys',
          '/gamekeys/keys?game_id=' + encodeURIComponent(gameId),
          error,
          gameId
        ))
      }
      family.categories.push(entry)
    }
    family.total_categories = family.categories.length
  } catch (error) {
    family.errors.push(toCatalogError('gamekeys', '/gamekeys', error))
  }
  return family
}

async function loadGiftCardFamily(): Promise<FazerCatalogFamily> {
  const family = createFamily('giftcards', '/giftcards')
  try {
    const result = await loadCursorItems('/giftcards')
    family.meta = result.meta
    for (const category of result.items) {
      const categoryId = String(category.category_id || '')
      const entry: FazerCatalogEntry = {
        id: categoryId,
        name: String(category.name || categoryId),
        source: 'giftcards',
        category,
        offers: [],
      }
      try {
        const response = asRecord(await requestJson<unknown>(
          'GET',
          '/giftcards/cards?category_id=' + encodeURIComponent(categoryId) + '&include_ui=1'
        ))
        const offers = Array.isArray(response.offers) ? response.offers.filter(isRecord) : []
        entry.offers = offers
        family.total_offers += offers.length
      } catch (error) {
        family.errors.push(toCatalogError(
          'giftcards',
          '/giftcards/cards?category_id=' + encodeURIComponent(categoryId),
          error,
          categoryId
        ))
      }
      family.categories.push(entry)
    }
    family.total_categories = family.categories.length
  } catch (error) {
    family.errors.push(toCatalogError('giftcards', '/giftcards', error))
  }
  return family
}

async function loadManualServiceFamily(): Promise<FazerCatalogFamily> {
  const family = createFamily('manual-services', '/manual-services')
  try {
    const response = asRecord(await requestJson<unknown>('GET', '/manual-services?include_ui=1'))
    const services = Array.isArray(response.items) ? response.items.filter(isRecord) : []
    for (const service of services) {
      const serviceId = String(service.id || '')
      const entry: FazerCatalogEntry = {
        id: serviceId,
        name: String(service.name || serviceId),
        source: 'manual-services',
        category: service,
        offers: [],
      }
      try {
        const detail = asRecord(await requestJson<unknown>(
          'GET',
          '/manual-services/' + encodeURIComponent(serviceId) + '/offers?include_ui=1'
        ))
        const offers = Array.isArray(detail.items) ? detail.items.filter(isRecord) : []
        entry.offers = offers
        entry.fields = Array.isArray(detail.fields) ? detail.fields.filter(isRecord) : []
        family.total_offers += offers.length
      } catch (error) {
        family.errors.push(toCatalogError(
          'manual-services',
          '/manual-services/' + encodeURIComponent(serviceId) + '/offers',
          error,
          serviceId
        ))
      }
      family.categories.push(entry)
    }
    family.total_categories = family.categories.length
  } catch (error) {
    family.errors.push(toCatalogError('manual-services', '/manual-services', error))
  }
  return family
}

async function loadSteamGiftFamily(): Promise<FazerCatalogFamily> {
  const family = createFamily('steam-gifts', '/steam-gifts/games')
  try {
    const response = asRecord(await requestJson<unknown>('GET', '/steam-gifts/games'))
    const games = Array.isArray(response.games) ? response.games.filter(isRecord) : []
    family.meta = asRecord(response.meta)
    family.categories = games.map((game) => {
      const appId = String(game.appid || '')
      return {
        id: appId,
        name: String(game.name || appId),
        source: 'steam-gifts' as const,
        category: game,
        offers: [],
        offers_endpoint: '/steam-gifts/games/' + encodeURIComponent(appId),
      }
    })
    family.total_categories = family.categories.length
  } catch (error) {
    family.errors.push(toCatalogError('steam-gifts', '/steam-gifts/games', error))
  }
  return family
}

async function loadSteamTopupFamily(): Promise<FazerCatalogFamily> {
  const family = createFamily('steam-topup', '/steam-topup/rates')
  try {
    const rates = asRecord(await requestJson<unknown>('GET', '/steam-topup/rates'))
    family.quotes = { rates }
  } catch (error) {
    family.errors.push(toCatalogError('steam-topup', '/steam-topup/rates', error))
  }
  return family
}

async function loadTelegramFamily(): Promise<FazerCatalogFamily> {
  const family = createFamily('telegram', '/telegram')
  const [stars, premium] = await Promise.allSettled([
    requestJson<unknown>('GET', '/telegram/stars'),
    requestJson<unknown>('GET', '/telegram/premium'),
  ])
  const quotes: JsonRecord = {}
  if (stars.status === 'fulfilled') quotes.stars = stars.value
  else family.errors.push(toCatalogError('telegram', '/telegram/stars', stars.reason))
  if (premium.status === 'fulfilled') quotes.premium = premium.value
  else family.errors.push(toCatalogError('telegram', '/telegram/premium', premium.reason))
  family.quotes = quotes
  return family
}

const familyEndpoints: Record<FazerCatalogSource, string> = {
  topup: '/topups',
  gamekeys: '/gamekeys',
  giftcards: '/giftcards',
  'manual-services': '/manual-services',
  'steam-topup': '/steam-topup/rates',
  'steam-gifts': '/steam-gifts/games',
  telegram: '/telegram',
}

const familyLoaders: Record<FazerCatalogSource, () => Promise<FazerCatalogFamily>> = {
  topup: loadTopupFamily,
  gamekeys: loadGameKeyFamily,
  giftcards: loadGiftCardFamily,
  'manual-services': loadManualServiceFamily,
  'steam-topup': loadSteamTopupFamily,
  'steam-gifts': loadSteamGiftFamily,
  telegram: loadTelegramFamily,
}

function loadFamilySafely(source: FazerCatalogSource): Promise<FazerCatalogFamily> {
  return new Promise((resolve) => {
    let settled = false
    const finish = (family: FazerCatalogFamily): void => {
      if (settled) return
      settled = true
      resolve(family)
    }
    const timeout = setTimeout(() => {
      const family = createFamily(source, familyEndpoints[source])
      family.errors.push(toCatalogError(
        source,
        familyEndpoints[source],
        createApiError('FazerCards catalog family timed out', familyEndpoints[source], 504, 'catalog_family_timeout')
      ))
      finish(family)
    }, FAMILY_TIMEOUT)

    familyLoaders[source]().then((family) => {
      clearTimeout(timeout)
      finish(family)
    }).catch((error) => {
      clearTimeout(timeout)
      const family = createFamily(source, familyEndpoints[source])
      family.errors.push(toCatalogError(source, familyEndpoints[source], error))
      finish(family)
    })
  })
}

let catalogCache: { value: FazerFullCatalog; expiresAt: number } | undefined
let catalogRequest: Promise<FazerFullCatalog> | undefined

export async function getFullCatalog(): Promise<FazerFullCatalog> {
  if (catalogCache && catalogCache.expiresAt > Date.now()) return catalogCache.value
  if (!catalogRequest) {
    catalogRequest = Promise.all((Object.keys(familyLoaders) as FazerCatalogSource[]).map(loadFamilySafely))
      .then((sources) => {
        const value: FazerFullCatalog = {
          fetched_at: new Date().toISOString(),
          sources,
          errors: sources.flatMap((source) => source.errors),
        }
        catalogCache = { value, expiresAt: Date.now() + CATALOG_CACHE_TTL }
        return value
      }).finally(() => {
        catalogRequest = undefined
      })
  }
  return catalogRequest
}

export async function getCatalogFamily(source: FazerCatalogSource): Promise<FazerCatalogFamily | undefined> {
  if (catalogCache && catalogCache.expiresAt > Date.now()) {
    return catalogCache.value.sources.find((family) => family.source === source)
  }
  return loadFamilySafely(source)
}

export async function getGameKeyOffers(gameId: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('GET', '/gamekeys/keys?game_id=' + encodeURIComponent(gameId) + '&include_ui=1')
}

export async function getGiftCardOffers(categoryId: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('GET', '/giftcards/cards?category_id=' + encodeURIComponent(categoryId) + '&include_ui=1')
}

export async function getManualServiceOffers(serviceId: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('GET', '/manual-services/' + encodeURIComponent(serviceId) + '/offers?include_ui=1')
}

export async function getSteamGiftOffers(appId: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('GET', '/steam-gifts/games/' + encodeURIComponent(appId))
}

export async function getSteamTopupRates(): Promise<JsonRecord> {
  return requestJson<JsonRecord>('GET', '/steam-topup/rates')
}

export async function getTelegramQuotes(): Promise<JsonRecord> {
  const [stars, premium] = await Promise.all([
    requestJson<JsonRecord>('GET', '/telegram/stars'),
    requestJson<JsonRecord>('GET', '/telegram/premium'),
  ])
  return { stars, premium }
}

function idempotencyHeaders(idempotencyKey?: string): Record<string, string> {
  return idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}
}

export function createGameKeyOrder(payload: FazerOrderPayload, idempotencyKey?: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('POST', '/gamekeys/order', payload, idempotencyHeaders(idempotencyKey))
}

export function createGiftCardOrder(payload: FazerOrderPayload, idempotencyKey?: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('POST', '/giftcards/order', payload, idempotencyHeaders(idempotencyKey))
}

export function createManualServiceOrder(payload: FazerOrderPayload, idempotencyKey?: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('POST', '/manual-services/order', payload, idempotencyHeaders(idempotencyKey))
}

export function createSteamTopupOrder(payload: FazerOrderPayload, idempotencyKey?: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('POST', '/steam-topup/order', payload, idempotencyHeaders(idempotencyKey))
}

export function createSteamGiftOrder(payload: FazerOrderPayload, idempotencyKey?: string): Promise<JsonRecord> {
  return requestJson<JsonRecord>('POST', '/steam-gifts/order', payload, idempotencyHeaders(idempotencyKey))
}

export function buyTelegramStars(payload: FazerOrderPayload): Promise<JsonRecord> {
  return requestJson<JsonRecord>('POST', '/telegram/stars/buy', payload)
}

export function buyTelegramPremium(payload: FazerOrderPayload): Promise<JsonRecord> {
  return requestJson<JsonRecord>('POST', '/telegram/premium/buy', payload)
}
