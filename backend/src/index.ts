import 'dotenv/config.js'
import { createServer } from './server.js'
import { getEnv, validateConfig } from './config/env.js'

const PORT = getEnv('PORT')

// Validate environment on startup
try {
  validateConfig()
  console.log('✅ Configuration validated')
} catch (error) {
  console.error('❌ Configuration error:', error instanceof Error ? error.message : error)
  process.exit(1)
}

const server = createServer()

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 AmicalPay API Server`)
  console.log(`📍 Listening on port ${PORT}`)
  console.log(`🌍 Environment: ${getEnv('NODE_ENV')}`)
  console.log(`📱 Frontend URL: ${getEnv('FRONTEND_URL')}`)
  console.log('\n✅ Server ready to accept requests\n')
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
