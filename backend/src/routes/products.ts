/**
 * Products Routes
 * Reads real Free Fire top-up offers from FazerCards through the backend.
 */

import { Router, Request, Response, NextFunction } from 'express'
import * as fazer from '../services/fazerCards.js'

const router = Router()

// ============ MOCK DATA (development fallback only) ============

const mockProducts: Record<string, any[]> = {
  LATAM: [
    {
      id: 'latam-ff-500',
      name: '500 Diamantes',
      diamonds: 500,
      region: 'LATAM',
      description: 'Recarga tu cuenta con 500 Diamantes de Free Fire',
      sellingPriceUsd: 9.99,
      sellingPriceHtg: 499.5,
      availability: 'in_stock',
      popular: true,
      source: 'mock',
    },
    {
      id: 'latam-ff-1000',
      name: '1000 Diamantes',
      diamonds: 1000,
      region: 'LATAM',
      description: 'Recarga tu cuenta con 1000 Diamantes de Free Fire',
      sellingPriceUsd: 19.99,
      sellingPriceHtg: 999.5,
      availability: 'in_stock',
      popular: true,
      source: 'mock',
    },
  ],
}

function normalizeOffer(
  offer: any,
  region: string,
  index: number,
  categoryId?: string,
  validationFields?: unknown[]
): any {
  const price = Number(offer.price_usd ?? offer.price ?? 0)
  return {
    id: `${region.toLowerCase()}-ff-${offer.offer_id}`,
    name: offer.offer_name,
    diamonds: offer.amount || 0,
    region,
    description: offer.description || `Free Fire ${region} - ${offer.offer_name}`,
    sellingPriceUsd: price,
    sellingPriceHtg: price * 50,
    availability: typeof offer.stock === 'number' && offer.stock <= 0 ? 'out_of_stock' : 'in_stock',
    popular: offer.is_popular || index < 2,
    source: 'fazer',
    fazerCategoryId: categoryId,
    fazerOfferId: offer.offer_id,
    fazerValidationFields: validationFields,
  }
}

const regionHints: Record<string, string[]> = {
  LATAM: ['latam', 'latin', 'south america'],
  EU: ['eu', 'europe'],
  BR: ['br', 'brazil'],
  MENA: ['mena', 'middle east', 'arab'],
}

async function resolveCategoryId(region: string): Promise<string> {
  const categories = await fazer.getCategories()
  const freeFire = categories.filter((category) => {
    const text = `${category.category_id} ${category.category_name}`.toLowerCase()
    return text.includes('free_fire') || text.includes('free fire')
  })
  const hints = regionHints[region] || []
  const regional = freeFire.find((category) => {
    const text = `${category.category_id} ${category.category_name}`.toLowerCase()
    return hints.some((hint) => text.includes(hint))
  })
  if (!regional) {
    throw new Error(`No purchasable Free Fire category found for region ${region}`)
  }

  return regional.category_id
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const region = ((req.query.region as string) || 'LATAM').toUpperCase()
    console.log(`📦 Fetching products for region: ${region}`)

    if (!Object.prototype.hasOwnProperty.call(regionHints, region)) {
      return res.status(400).json({
        error: 'Invalid region',
        supportedRegions: Object.keys(regionHints),
      })
    }

    let products: any[] = []
    let source = 'unknown'

    try {
      const categoryId = await resolveCategoryId(region)
      console.log(`📡 Fetching ${region} offers from FazerCards category ${categoryId}...`)
      const [offers, validationCategories] = await Promise.all([
        fazer.getOffers(categoryId),
        fazer.getPlayerValidationCatalog(),
      ])
      const validationCategory = validationCategories.find(
        (category) => category.category_id === categoryId
      )

      if (!validationCategory) {
        throw new Error(`FazerCards category ${categoryId} does not support player validation`)
      }

      products = offers.map((offer, index) =>
        normalizeOffer(
          offer,
          region,
          index,
          categoryId,
          validationCategory.fields
        )
      )
      source = 'fazer'
      console.log(`✅ Fetched ${products.length} products from FazerCards for ${region}`)
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unknown FazerCards error'
      console.error(`❌ FazerCards unavailable for ${region}: ${details}`)

      if (process.env.NODE_ENV === 'production') {
        return res.status(502).json({
          error: 'FazerCards catalogue unavailable',
          region,
          source: 'fazer_error',
          details,
        })
      }

      console.warn(`📦 Using mock products for ${region} outside production`)
      products = mockProducts[region] || []
      source = 'mock'
    }

    res.json({
      region,
      count: products.length,
      products,
      source,
      _debug: {
        timestamp: new Date().toISOString(),
        dataSource: source === 'fazer' ? 'Real FazerCards API' : 'Fallback Mock Data',
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/products/catalog
// Import and return every FazerCards category and offer.
router.get('/catalog', async (_req: Request, res: Response) => {
  try {
    const snapshot = await fazer.getCatalog()
    res.setHeader('Cache-Control', 'private, max-age=300')
    res.json({
      source: 'fazer',
      ...snapshot,
    })
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown FazerCards error'
    const failures = error && typeof error === 'object' && 'failures' in error
      ? (error as { failures?: Array<{ categoryId: string; error: string }> }).failures
      : undefined

    res.status(502).json({
      error: 'FazerCards catalog import failed',
      source: 'fazer_error',
      details,
      failures,
    })
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    for (const region in mockProducts) {
      const product = mockProducts[region].find((p) => p.id === id)
      if (product) return res.json(product)
    }

    try {
      const regions = ['LATAM', 'EU', 'BR', 'MENA']
      const validationCategories = await fazer.getPlayerValidationCatalog()
      for (const region of regions) {
        const categoryId = await resolveCategoryId(region)
        const offers = await fazer.getOffers(categoryId)
        const validationCategory = validationCategories.find(
          (category) => category.category_id === categoryId
        )
        if (!validationCategory) continue
        for (const offer of offers) {
          const productId = `${region.toLowerCase()}-ff-${offer.offer_id}`
          if (productId === id) {
            return res.json(
              normalizeOffer(
                offer,
                region,
                0,
                categoryId,
                validationCategory.fields
              )
            )
          }
        }
      }
    } catch (error) {
      console.warn('Failed to search FazerCards:', error instanceof Error ? error.message : error)
    }

    res.status(404).json({
      error: 'Product not found',
      id,
    })
  } catch (error) {
    next(error)
  }
})

export default router
