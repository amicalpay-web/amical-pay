import { Router, Request, Response, NextFunction } from 'express'
import { config } from '../config/env.js'
import {
  getPaymentFromResponse,
  isMonCashConfigured,
  retrieveOrderPayment,
  retrieveTransactionPayment,
} from '../services/moncash.js'

const router = Router()

type CallbackPayload = Record<string, unknown>

function firstString(payload: CallbackPayload, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

// POST /api/webhook/fazer
// Receive webhook updates from FazerCards
router.post('/fazer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { event, order_id, status } = req.body

    console.log(`📨 Webhook received: ${event}`, {
      order_id,
      status,
      timestamp: new Date().toISOString(),
    })

    // TODO: Implement webhook validation and order status update
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
// MonCash returns transactionId/orderId here; payment is verified server-to-server.
const handleMonCashReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = (req.method === 'GET' ? req.query : req.body) as CallbackPayload
    const orderId = firstString(payload, ['orderId', 'order_id'])
    const transactionId = firstString(payload, ['transactionId', 'transaction_id'])
    let verificationStatus = 'pending'
    let payment: Record<string, unknown> = {}

    if (isMonCashConfigured() && (orderId || transactionId)) {
      try {
        const response = transactionId
          ? await retrieveTransactionPayment(transactionId)
          : await retrieveOrderPayment(orderId as string)
        payment = getPaymentFromResponse(response) as Record<string, unknown>
        const message = typeof payment.message === 'string' ? payment.message.toLowerCase() : ''
        verificationStatus = message === 'successful' ? 'success' : 'pending'
      } catch (error) {
        console.error('MonCash payment verification failed:', error)
        verificationStatus = 'verification_error'
      }
    }

    console.log('📨 MonCash payment notification received', {
      orderId,
      transactionId,
      verificationStatus,
      timestamp: new Date().toISOString(),
    })

    if (req.method === 'GET') {
      const redirectUrl = new URL(config.MONCASH_ALERT_URL)
      redirectUrl.searchParams.set('status', verificationStatus)
      if (orderId) redirectUrl.searchParams.set('orderId', orderId)
      if (transactionId) redirectUrl.searchParams.set('transactionId', transactionId)
      res.redirect(303, redirectUrl.toString())
      return
    }

    res.status(verificationStatus === 'verification_error' ? 502 : 200).json({
      received: true,
      provider: 'moncash',
      status: verificationStatus,
      orderId,
      transactionId,
      payment,
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
