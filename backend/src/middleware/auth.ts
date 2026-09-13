import { Request, Response, NextFunction } from 'express'
import { config } from '../config/env.js'

export interface AuthRequest extends Request {
  admin?: boolean
  token?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' })
    return
  }

  if (token !== config.ADMIN_TOKEN) {
    res.status(403).json({ error: 'Invalid authorization token' })
    return
  }

  req.admin = true
  req.token = token
  next()
}
