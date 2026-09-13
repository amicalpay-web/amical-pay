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

export default router
