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
  const ADMIN_TOKEN = getEnv('ADMIN_TOKEN')

  if (NODE_ENV === 'production') {
    if (!FAZER_API_KEY) {
      throw new Error('FAZER_API_KEY is required in production')
    }
    if (!ADMIN_TOKEN) {
      throw new Error('ADMIN_TOKEN is required in production')
    }
  }
}

export const config = {
  // Server
  PORT: getPort(),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:3000'),

  // FazerCards
  FAZER_API_KEY: getEnv('FAZER_API_KEY'),
  FAZER_API_BASE_URL: getEnv('FAZER_API_BASE_URL', 'https://api.fazercards.com'),

  // Admin
  ADMIN_TOKEN: getEnv('ADMIN_TOKEN'),

  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
}
