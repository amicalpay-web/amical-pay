import { Router, Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/admin/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.admin) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    res.json({
      total_orders: 0,
      total_revenue: 0,
      pending_orders: 0,
      today_revenue: 0,
      message: 'Mock dashboard data',
    })
  } catch (error) {
    next(error)
  }
})

export default router
