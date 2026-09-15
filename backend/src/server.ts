import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { getEnv } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authMiddleware, supabaseAuthMiddleware } from './middleware/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'
import webhookRoutes from './routes/webhook.js'
import fazerRoutes from './routes/fazer.js'
import fazerCatalogRoutes from './routes/fazerCatalog.js'
import paymentRoutes from './routes/payments.js'

export function createServer(): Express {
  const app = express()
  const FRONTEND_URL = getEnv('FRONTEND_URL')
  const NODE_ENV = getEnv('NODE_ENV')
  const allowedOrigins = FRONTEND_URL
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)

  // Middleware: CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server requests and health checks without an Origin.
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
          callback(null, true)
          return
        }
        callback(new Error(`CORS origin not allowed: ${origin}`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )

  // Middleware: JSON
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Middleware: Logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${req.method} ${req.path}`)
    next()
  })

  // Routes: Health Check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    })
  })

  // Routes: Render Health Check (compatible with Render health check path)
  app.get('/healthz', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    })
  })

  // Routes: API
  app.use('/api/products', productRoutes)
  app.use('/api/orders', (req, res, next) => {
    if (req.method === 'POST' || req.path === '/me') {
      void supabaseAuthMiddleware(req, res, next)
      return
    }
    next()
  }, orderRoutes)
  app.use('/api/payments', paymentRoutes)
  app.use('/api/webhook', webhookRoutes)
  app.use('/api/fazer', fazerRoutes)
  app.use('/api/fazer', fazerCatalogRoutes)
  app.use('/api/admin', authMiddleware, adminRoutes)

  // Routes: 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      method: req.method,
    })
  })

  // Middleware: Error Handler
  app.use(errorHandler)

  return app
}
