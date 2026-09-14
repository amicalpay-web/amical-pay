import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

// POST /api/webhook/fazer
// Receive webhook updates from FazerCards
router.post('/fazer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { event, order_id, status, data } = req.body

    console.log(`📨 Webhook received: ${event}`, {
      order_id,
      status,
      timestamp: new Date().toISOString(),
    })

    // TODO: Implement webhook validation and order status update
    // 1. Verify webhook signature
    // 2. Update order status in database
    // 3. Send notification to customer
    // 4. Log for audit trail

    res.json({
      received: true,
      event,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})

// MonCash return URL.
// MonCash may redirect here with transactionId/orderId query parameters.
// Payment verification must happen server-to-server before an order is marked paid.
const handleMonCashReturn = (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.method === 'GET' ? req.query : req.body

    console.log('📨 MonCash payment notification received', {
      payload,
      timestamp: new Date().toISOString(),
    })

    // TODO: Retrieve the payment from MonCash using transactionId or orderId.
    // Never mark an order as paid from this request alone.
    res.status(200).json({
      received: true,
      provider: 'moncash',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
}

// GET and POST are supported for MonCash return/callback compatibility.
router.get('/moncash', handleMonCashReturn)
router.post('/moncash', handleMonCashReturn)

export default router
