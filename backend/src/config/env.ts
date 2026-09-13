export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key]

  if (!value && !defaultValue) {
    console.warn(`⚠️  Environment variable ${key} is not set`)
  }

  return value || defaultValue || ''
}

export function getPort(): number {
  return parseInt(getEnv('PORT', '5000'), 10)
}

export function validateConfig(): void {
  const NODE_ENV = getEnv('NODE_ENV', 'development')
  const FAZER_API_KEY = getEnv('FAZER_API_KEY')

  // FAZER_API_KEY is required in production for FazerCards integration
  if (NODE_ENV === 'production') {
    if (!FAZER_API_KEY) {
      throw new Error('FAZER_API_KEY is required in production')
    }
  }

  // ADMIN_TOKEN is optional - it's only used for protecting admin routes if provided
  // The backend can run without ADMIN_TOKEN
  const ADMIN_TOKEN = getEnv('ADMIN_TOKEN')
  if (!ADMIN_TOKEN && NODE_ENV === 'production') {
    console.warn('⚠️  ADMIN_TOKEN is not set - admin routes will be accessible without authentication')
  }
}

export const config = {
  // Server
  PORT: getPort(),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:3000'),

  // FazerCards (REQUIRED for production)
  FAZER_API_KEY: getEnv('FAZER_API_KEY'),
  FAZER_API_BASE_URL: getEnv('FAZER_API_BASE_URL', 'https://api.fazercards.com'),

  // Admin (OPTIONAL - not required for FazerCards integration)
  ADMIN_TOKEN: getEnv('ADMIN_TOKEN'),

  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
}
