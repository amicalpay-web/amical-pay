/**
 * FazerCards Health Check & Diagnostics Routes
 * These routes test the connection to FazerCards API
 * They DO NOT expose the API key to the frontend
 */

import { Router, Request, Response, NextFunction } from 'express'
import * as fazer from '../services/fazerCards.js'
import { AuthRequest, authMiddleware } from '../middleware/auth.js'
import { getFullCatalog } from '../services/fazerCatalog.js'

const router = Router()

// ============ PUBLIC ENDPOINTS ============

/**
 * GET /api/fazer/health
 * Test FazerCards API connection
 * Returns: Connection status without exposing API key
 */
router.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await fazer.testConnection()

    // Return appropriate HTTP status based on connection result
    const statusCode = result.status === 'SUCCESS' ? 200 : 503

    res.status(statusCode).json({
      message: 'FazerCards Connection Test',
      ...result,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/fazer/categories
 * Get all available product categories from FazerCards
 * Example: Free Fire Latam, Free Fire EU, etc
 */
router.get(
  '/categories',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await fazer.getCategories()

      res.json({
        status: 'success',
        count: categories.length,
        categories: categories.map((cat) => ({
          id: cat.category_id,
          name: cat.category_name,
          description: cat.description,
          image: cat.image_url,
        })),
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/fazer/offers/:categoryId
 * Get all packages/offers for a specific category
 * Example: GET /api/fazer/offers/free_fire_latam
 * Returns: List of diamond packages with prices
 */
router.get(
  '/offers/:categoryId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params

      if (!categoryId) {
        res.status(400).json({
          error: 'Missing category ID',
        })
        return
      }

      const offers = await fazer.getOffers(categoryId)

      res.json({
        status: 'success',
        categoryId,
        count: offers.length,
        offers: offers.map((offer) => ({
          id: offer.offer_id,
          name: offer.offer_name,
          amount: offer.amount,
          price: offer.price,
          priceUsd: offer.price_usd,
          currency: offer.price_currency,
          stock: offer.stock,
          description: offer.description,
          image: offer.image_url,
          isPopular: offer.is_popular,
          fields: offer.fields || [],
          metadata: offer.metadata || {},
        })),
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/fazer/catalog
 * Return the complete FazerCards catalog without coupling it to validation.
 */
router.get(
  '/catalog',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const snapshot = await getFullCatalog()
      res.setHeader('Cache-Control', 'private, max-age=300')
      res.json({ status: 'success', source: 'fazer', ...snapshot })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/fazer/validation-options
 * Return FazerCards' dynamic validation categories and fields.
 */
router.get(
  '/validation-options',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await fazer.getPlayerValidationCatalog()
      res.json({ status: 'success', items })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/fazer/validate-player
 * Validate a player through FazerCards.
 * Body: { categoryId: string, fields: Record<string, unknown> }
 */
router.post(
  '/validate-player',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId, fields } = req.body as {
        categoryId?: unknown
        fields?: unknown
      }

      if (
        typeof categoryId !== 'string' ||
        !categoryId.trim() ||
        !fields ||
        typeof fields !== 'object' ||
        Array.isArray(fields)
      ) {
        res.status(400).json({
          status: 'error',
          error: 'categoryId and fields are required',
        })
        return
      }

      const validationResult = await fazer.validatePlayer(
        categoryId.trim(),
        fields as Record<string, unknown>
      )

      res.json({
        status: 'success',
        valid: validationResult.valid,
        categoryId: validationResult.category_id,
        playerId: validationResult.player_id,
        playerName: validationResult.player_name,
        region: validationResult.region,
        message: 'Account identifiers were confirmed by FazerCards',
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/fazer/balance
 * Get FazerCards account balance
 * Protected: Requires admin token
 */
router.get(
  '/balance',
  authMiddleware,
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const balance = await fazer.getBalance()

      res.json({
        status: 'success',
        balance: balance.balance,
        currency: balance.currency,
        lastUpdated: balance.last_updated,
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * GET /api/fazer/order/:orderId
 * Get order status
 * Protected: Requires admin token
 */
router.get(
  '/order/:orderId',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params

      if (!orderId) {
        res.status(400).json({
          error: 'Missing order ID',
        })
        return
      }

      const orderStatus = await fazer.getOrderStatus(orderId)

      res.json({
        status: 'success',
        orderId: orderStatus.order_id,
        orderStatus: orderStatus.order_status,
        amount: orderStatus.amount,
        currency: orderStatus.amount_currency,
        createdAt: orderStatus.created_at,
        completedAt: orderStatus.completed_at,
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router
