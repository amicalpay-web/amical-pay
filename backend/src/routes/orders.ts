import { Router, Request, Response, NextFunction } from 'express'
import * as fazer from '../services/fazerCards.js'

const router = Router()

// Temporary persistence retained to avoid changing the existing storage layer.
// Render restarts still require the project's real database/storage integration.
export const mockOrders: Record<string, any> = {}

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
  if (Object.keys(fields).length === 0) return { required: false }

  // This lookup is deliberately made only on the purchase path. Catalogue
  // loading never depends on getPlayerValidationCatalog().
  const validationCategory = (await fazer.getPlayerValidationCatalog())
    .find((category) => category.category_id === categoryId)

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
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
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
    const order = {
      id: Math.random().toString(36).substr(2, 9),
      order_number: orderNumber,
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

    mockOrders[orderNumber] = order
    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
})

// Execute the supplier order once a payment is verified. This is exported for
// the MonCash webhook and remains idempotent for repeated callbacks.
export async function fulfillFazerOrder(orderNumber: string): Promise<any> {
  const order = mockOrders[orderNumber]
  if (!order) throw new Error(`Order not found: ${orderNumber}`)
  if (order.fazer_order_id) return order

  const fazerOrder = await fazer.createOrder(
    order.fazer_category_id,
    order.fazer_offer_id,
    order.fazer_fields,
    `amicalpay-${order.order_number}`,
    order.fazer_validation_status === 'confirmed'
      ? Object.keys(order.fazer_fields).map((key) => ({ key }))
      : [],
  )

  order.fazer_order_id = fazerOrder.order_id
  order.fazer_order_status = fazerOrder.order_status
  order.status = 'processing'
  order.updated_at = new Date().toISOString()
  return order
}

router.get('/player/:playerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = Object.values(mockOrders)
      .filter((order) => order.player_id === req.params.playerId)
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

router.get('/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = mockOrders[req.params.orderNumber]
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