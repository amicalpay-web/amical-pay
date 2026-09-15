import { Router, Response, NextFunction } from 'express'
import * as fazer from '../services/fazerCards.js'
import { AuthRequest } from '../middleware/auth.js'
import {
  getOrderByNumber as getPersistedOrderByNumber,
  getOrdersByUserId,
  insertOrder,
  updateOrder,
} from '../services/supabase.js'

const router = Router()

function generateOrderNumber(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `ORD-${date}-${random}`
}

async function validateIfRequired(
  categoryId: string,
  fields: Record<string, unknown>
): Promise<{ required: boolean; playerName?: string | null; region?: string | null }> {
  // Resolve the canonical validation category even when the client sends no
  // fields. A client must never be able to bypass validation with an empty
  // payload when the selected FazerCards game requires account identifiers.
  const validationCategory = await fazer.getValidationCategoryForTopup(categoryId)

  if (!validationCategory || validationCategory.fields.length === 0) {
    return { required: false }
  }

  const validation = await fazer.validatePlayer(categoryId, fields)
  return {
    required: true,
    playerName: validation.player_name,
    region: validation.region,
  }
}

// POST /api/orders
// Creates the local order after validation, but does not execute the supplier
// order until MonCash confirms payment.
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      product_id,
      player_id,
      whatsapp_number,
      email,
      region,
      currency,
      total_price,
      payment_method,
      fazer_category_id,
      fazer_offer_id,
      fazer_fields,
    } = req.body

    if (
      !product_id ||
      !email ||
      typeof fazer_category_id !== 'string' ||
      !fazer_category_id.trim() ||
      typeof fazer_offer_id !== 'string' ||
      !fazer_offer_id.trim() ||
      !fazer_fields ||
      typeof fazer_fields !== 'object' ||
      Array.isArray(fazer_fields)
    ) {
      res.status(400).json({
        error: 'Missing required fields',
        required: [
          'product_id',
          'email',
          'fazer_category_id',
          'fazer_offer_id',
          'fazer_fields',
        ],
      })
      return
    }

    const fields = fazer_fields as Record<string, unknown>
    const validation = await validateIfRequired(fazer_category_id.trim(), fields)
    const parsedTotalPrice = Number(total_price)
    const orderNumber = generateOrderNumber()
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required to create an order' })
      return
    }

    const order = {
      order_number: orderNumber,
      user_id: req.user.id,
      product_id,
      player_id: typeof player_id === 'string' ? player_id : '',
      whatsapp_number,
      email,
      region,
      currency,
      total_price: Number.isFinite(parsedTotalPrice) ? parsedTotalPrice : null,
      payment_method: payment_method || null,
      fazer_category_id: fazer_category_id.trim(),
      fazer_offer_id: fazer_offer_id.trim(),
      fazer_fields: fields,
      fazer_player_name: validation.playerName || null,
      fazer_player_region: validation.region || null,
      fazer_validation_status: validation.required ? 'confirmed' : 'not_required',
      fazer_order_id: null,
      fazer_order_status: 'not_created',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const persistedOrder = await insertOrder(order)
    res.status(201).json(persistedOrder)
  } catch (error) {
    next(error)
  }
})

// Execute the supplier order once a payment is verified. This is exported for
// the MonCash webhook and remains idempotent for repeated callbacks.
export async function fulfillFazerOrder(orderNumber: string): Promise<Record<string, unknown>> {
  const order = await getPersistedOrderByNumber(orderNumber)
  if (!order) throw new Error(`Order not found: ${orderNumber}`)
  if (order.fazer_order_id) return order

  const categoryId = String(order.fazer_category_id || '')
  const offerId = String(order.fazer_offer_id || '')
  const fields = (order.fazer_fields && typeof order.fazer_fields === 'object')
    ? order.fazer_fields as Record<string, unknown>
    : {}

  const fazerOrder = await fazer.createOrder(
    categoryId,
    offerId,
    fields,
    `amicalpay-${String(order.order_number)}`,
    order.fazer_validation_status === 'confirmed'
      ? Object.keys(fields).map((key) => ({ key }))
      : [],
  )

  return updateOrder(orderNumber, {
    fazer_order_id: fazerOrder.order_id,
    fazer_order_status: fazerOrder.order_status,
    status: 'processing',
    updated_at: new Date().toISOString(),
  })
}

router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    const orders = await getOrdersByUserId(req.user.id)
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

router.get('/:orderNumber', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await getPersistedOrderByNumber(req.params.orderNumber)
    if (!order) {
      res.status(404).json({
        error: 'Order not found',
        order_number: req.params.orderNumber,
      })
      return
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
})

export default router