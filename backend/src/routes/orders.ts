import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

// Mock orders storage (in-memory)
const mockOrders: Record<string, any> = {}

function generateOrderNumber(): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `ORD-${date}-${random}`
}

// POST /api/orders
// Create a new order
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product_id, player_id, whatsapp_number, email, region, currency } = req.body

    // Validate required fields
    if (!product_id || !player_id || !email) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['product_id', 'player_id', 'email'],
      })
      return
    }

    // Validate player ID (must be numeric)
    if (!/^\d+$/.test(player_id)) {
      res.status(400).json({
        error: 'Invalid player ID format',
        details: 'Player ID must contain only numbers',
      })
      return
    }

    // TODO: Validate with FazerCards API
    // const isValid = await validateWithFazerCards(player_id, region)

    // Create order
    const orderNumber = generateOrderNumber()
    const order = {
      id: Math.random().toString(36).substr(2, 9),
      order_number: orderNumber,
      product_id,
      player_id,
      whatsapp_number,
      email,
      region,
      currency,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Store in mock database
    mockOrders[orderNumber] = order

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
})

// GET /api/orders/:orderNumber
// Track order status
router.get('/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber } = req.params
    const order = mockOrders[orderNumber]

    if (!order) {
      res.status(404).json({
        error: 'Order not found',
        order_number: orderNumber,
      })
      return
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
})

export default router
