import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  status?: number
  code?: string
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  const code = err.code || 'INTERNAL_ERROR'

  console.error(`❌ Error [${status}]:`, {
    message,
    code,
    path: req.path,
    method: req.method,
    stack: err.stack,
  })

  res.status(status).json({
    error: message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
