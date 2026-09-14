import { Router, Request, Response, NextFunction } from 'express'
import {
  buyTelegramPremium,
  buyTelegramStars,
  createGameKeyOrder,
  createGiftCardOrder,
  createManualServiceOrder,
  createSteamGiftOrder,
  createSteamTopupOrder,
  getCatalogFamily,
  getGameKeyOffers,
  getGiftCardOffers,
  getManualServiceOffers,
  getSteamGiftOffers,
  getSteamTopupRates,
  getTelegramQuotes,
} from '../services/fazerCatalog.js'
import { FazerCatalogSource, FazerOrderPayload } from '../types/fazerCatalog.js'

const router = Router()
const catalogSources: FazerCatalogSource[] = [
  'topup',
  'gamekeys',
  'giftcards',
  'manual-services',
  'steam-topup',
  'steam-gifts',
  'telegram',
]

function isRecord(value: unknown): value is FazerOrderPayload {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getRouteParam(req: Request, key: string): string {
  return String(req.params[key] || '').trim()
}

function getHandler(
  loader: () => Promise<unknown>
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (_req, res, next) => {
    try {
      res.json(await loader())
    } catch (error) {
      next(error)
    }
  }
}

function registerPost(
  path: string,
  requiredFields: string[],
  handler: (body: FazerOrderPayload, idempotencyKey?: string) => Promise<unknown>
): void {
  router.post(path, async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isRecord(req.body)) {
        res.status(400).json({ error: 'JSON object body is required', code: 'INVALID_BODY' })
        return
      }
      const missing = requiredFields.filter((field) => {
        const value = req.body[field]
        return value === undefined || value === null || value === ''
      })
      if (missing.length > 0) {
        res.status(400).json({
          error: 'Missing required FazerCards fields',
          code: 'MISSING_REQUIRED_FIELDS',
          required: requiredFields,
          missing,
        })
        return
      }
      const idempotencyKey = req.header('idempotency-key') || undefined
      res.json(await handler(req.body, idempotencyKey))
    } catch (error) {
      next(error)
    }
  })
}

// GET /api/fazer/catalog/:source
// Read one isolated FazerCards family without mixing its categories with top-ups.
router.get('/catalog/:source', async (req, res, next) => {
  try {
    const source = getRouteParam(req, 'source') as FazerCatalogSource
    if (!catalogSources.includes(source)) {
      res.status(400).json({ error: 'Unknown FazerCards catalog source', code: 'INVALID_SOURCE', sources: catalogSources })
      return
    }
    const family = await getCatalogFamily(source)
    res.json({ status: 'success', source, family })
  } catch (error) {
    next(error)
  }
})

router.get('/gamekeys/:gameId/offers', async (req, res, next) => {
  try {
    const gameId = getRouteParam(req, 'gameId')
    if (!gameId) {
      res.status(400).json({ error: 'gameId is required', code: 'MISSING_GAME_ID' })
      return
    }
    res.json(await getGameKeyOffers(gameId))
  } catch (error) {
    next(error)
  }
})

router.get('/giftcards/:categoryId/offers', async (req, res, next) => {
  try {
    const categoryId = getRouteParam(req, 'categoryId')
    if (!categoryId) {
      res.status(400).json({ error: 'categoryId is required', code: 'MISSING_CATEGORY_ID' })
      return
    }
    res.json(await getGiftCardOffers(categoryId))
  } catch (error) {
    next(error)
  }
})

router.get('/manual-services/:serviceId/offers', async (req, res, next) => {
  try {
    const serviceId = getRouteParam(req, 'serviceId')
    if (!serviceId) {
      res.status(400).json({ error: 'serviceId is required', code: 'MISSING_SERVICE_ID' })
      return
    }
    res.json(await getManualServiceOffers(serviceId))
  } catch (error) {
    next(error)
  }
})

router.get('/steam-gifts/games/:appId', async (req, res, next) => {
  try {
    const appId = getRouteParam(req, 'appId')
    if (!appId) {
      res.status(400).json({ error: 'appId is required', code: 'MISSING_APP_ID' })
      return
    }
    res.json(await getSteamGiftOffers(appId))
  } catch (error) {
    next(error)
  }
})

router.get('/steam-topup/rates', getHandler(getSteamTopupRates))
router.get('/telegram/quotes', getHandler(getTelegramQuotes))

registerPost('/gamekeys/order', ['game_id', 'key_id', 'quantity'], createGameKeyOrder)
registerPost('/giftcards/order', ['category_id', 'card_id', 'quantity'], createGiftCardOrder)
registerPost('/manual-services/order', ['manual_service_id', 'product_id'], createManualServiceOrder)
registerPost('/steam-topup/order', ['steamLogin', 'currency', 'amount'], createSteamTopupOrder)
registerPost('/steam-gifts/order', ['invite_url', 'sub_id', 'app_id', 'region'], createSteamGiftOrder)
registerPost('/telegram/stars/buy', ['telegram_username', 'quantity'], async (body) => buyTelegramStars(body))
registerPost('/telegram/premium/buy', ['telegram_username', 'months'], async (body) => buyTelegramPremium(body))

export default router
