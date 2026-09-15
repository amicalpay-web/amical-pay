import { Request, Response, NextFunction } from 'express'
import { config } from '../config/env.js'
import { User } from '@supabase/supabase-js'
import { verifySupabaseToken } from '../services/supabase.js'

export interface AuthRequest extends Request {
  admin?: boolean
  token?: string
  user?: User
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

export async function supabaseAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''

  if (!token) {
    res.status(401).json({ error: 'Missing Supabase access token' })
    return
  }

  try {
    req.user = await verifySupabaseToken(token)
    req.token = token
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired Supabase access token' })
  }
}
