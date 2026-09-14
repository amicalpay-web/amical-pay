import { createServer } from 'node:http'
import { access, readFile } from 'node:fs/promises'
import { extname, join, normalize, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), 'dist')
const port = Number(process.env.PORT || 10000)

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function resolvePath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname)
  const candidate = normalize(join(root, pathname === '/' ? 'index.html' : pathname))

  if (candidate !== root && !candidate.startsWith(root + sep)) {
    return null
  }

  return { candidate, pathname }
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' })
    response.end('Method Not Allowed')
    return
  }

  try {
    const resolved = resolvePath(request.url || '/')
    if (!resolved) {
      response.writeHead(400)
      response.end('Bad Request')
      return
    }

    let filePath = resolved.candidate
    try {
      await access(filePath)
    } catch {
      if (extname(resolved.pathname)) {
        response.writeHead(404)
        response.end('Not Found')
        return
      }
      filePath = join(root, 'index.html')
    }

    const content = await readFile(filePath)
    const extension = extname(filePath).toLowerCase()
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    })

    if (request.method === 'HEAD') {
      response.end()
    } else {
      response.end(content)
    }
  } catch (error) {
    console.error('Frontend server error:', error)
    response.writeHead(500)
    response.end('Internal Server Error')
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`AmicalPay frontend listening on 0.0.0.0:${port}`)
})
