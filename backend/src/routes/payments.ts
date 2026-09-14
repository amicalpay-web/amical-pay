import { Router, Request, Response, NextFunction } from 'express'
import {
  createMonCashPayment,
  getPaymentFromResponse,
  isMonCashConfigured,
  retrieveOrderPayment,
  retrieveTransactionPayment,
} from '../services/moncash.js'

const router = Router()

router.post('/moncash/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isMonCashConfigured()) {
      res.status(503).json({ error: 'MonCash is not configured on the server' })
      return
    }

    const { orderId, amount } = req.body as { orderId?: unknown; amount?: unknown }
    const numericAmount = typeof amount === 'number' ? amount : Number(amount)

    if (typeof orderId !== 'string' || !orderId.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: 'orderId and a positive amount are required' })
      return
    }

    const payment = await createMonCashPayment(orderId.trim(), numericAmount)
    res.status(201).json({
      orderId: payment.orderId,
      redirectUrl: payment.redirectUrl,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/moncash/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isMonCashConfigured()) {
      res.status(503).json({ error: 'MonCash is not configured on the server' })
      return
    }

    const { orderId, transactionId } = req.body as {
      orderId?: unknown
      transactionId?: unknown
    }

    if (typeof transactionId === 'string' && transactionId.trim()) {
      const response = await retrieveTransactionPayment(transactionId.trim())
      res.json({ payment: getPaymentFromResponse(response), verified: true })
      return
    }

    if (typeof orderId === 'string' && orderId.trim()) {
      const response = await retrieveOrderPayment(orderId.trim())
      res.json({ payment: getPaymentFromResponse(response), verified: true })
      return
    }

    res.status(400).json({ error: 'orderId or transactionId is required' })
  } catch (error) {
    next(error)
  }
})

export default router
