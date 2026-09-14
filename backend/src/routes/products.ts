/**
 * Products Routes
 * Fetches real Free Fire products from FazerCards API
 * Falls back to mock data if FazerCards is unavailable
 */

import { Router, Request, Response, NextFunction } from 'express'
import * as fazer from '../services/fazerCards.js'

const router = Router()

// ============ MOCK DATA (Fallback only) ============

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

// ============ HELPER FUNCTIONS ============

/**
 * Normalize FazerCards offer to AmicalPay product format
 */
function normalizeOffer(offer: any, region: string, index: number): any {
  return {
    id: `${region.toLowerCase()}-ff-${offer.offer_id}`,
    name: offer.offer_name,
    diamonds: offer.amount,
    region,
    description: offer.description || `Free Fire ${region} - ${offer.offer_name}`,
    sellingPriceUsd: Number(offer.price_usd ?? offer.price ?? 0),
    sellingPriceHtg: Number(offer.price_usd ?? offer.price ?? 0) * 50, // Existing HTG display rate
    availability: typeof offer.stock === 'number' && offer.stock <= 0 ? 'out_of_stock' : 'in_stock',
    popular: offer.is_popular || index < 2,
    source: 'fazer',
    fazerOfferId: offer.offer_id,
  }
}

// ============ CATEGORY RESOLUTION ============\n\nconst regionHints: Record<string, string[]> = {\n  LATAM: ['latam', 'latin', 'south america'],\n  EU: ['eu', 'europe'],\n  BR: ['br', 'brazil'],\n  MENA: ['mena', 'middle east', 'arab'],\n}\n\nasync function resolveCategoryId(region: string): Promise<string> {\n  const categories = await fazer.getCategories()\n  const freeFire = categories.filter((category) => {\n    const text = `${category.category_id} ${category.category_name}`.toLowerCase()\n    return text.includes('free_fire') || text.includes('free fire')\n  })\n  const hints = regionHints[region] || []\n  const regional = freeFire.find((category) => {\n    const text = `${category.category_id} ${category.category_name}`.toLowerCase()\n    return hints.some((hint) => text.includes(hint))\n  })\n  const fallback = freeFire.find((category) => category.category_id.toLowerCase().includes('auto')) || freeFire[0]\n\n  if (!regional && !fallback) {\n    throw new Error(`No purchasable Free Fire category found for region ${region}`)\n  }\n\n  return (regional || fallback).category_id\n}\n\n// ============ ROUTES ============

/**
 * GET /api/products?region=LATAM
 * Get products for a specific region
 * Fetches real data from FazerCards, falls back to mock if unavailable
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const region = (req.query.region as string) || 'LATAM'

    console.log(`📦 Fetching products for region: ${region}`)

    // Map regions to FazerCards category IDs
    const categoryMap: Record<string, string> = {
      LATAM: 'free_fire_latam',
      EU: 'free_fire_eu',
      BR: 'free_fire_br',
      MENA: 'free_fire_mena',
    }

    const categoryId = categoryMap[region]

    if (!categoryId) {
      return res.status(400).json({
        error: 'Invalid region',
        supportedRegions: Object.keys(categoryMap),
      })
    }

    let products = []
    let source = 'unknown'

    try {
      // Try to fetch from FazerCards API
      console.log(`📡 Fetching ${region} offers from FazerCards...`)
      const offers = await fazer.getOffers(categoryId)

      products = offers.map((offer, index) => normalizeOffer(offer, region, index))
      source = 'fazer'

      console.log(`✅ Fetched ${products.length} products from FazerCards for ${region}`)
    } catch (error) {\n      const details = error instanceof Error ? error.message : 'Unknown FazerCards error'\n      console.error(`❌ FazerCards unavailable for ${region}: ${details}`)\n\n      if (process.env.NODE_ENV === 'production') {\n        return res.status(502).json({\n          error: 'FazerCards catalogue unavailable',\n          region,\n          source: 'fazer_error',\n          details,\n        })\n      }\n\n      console.warn(`📦 Using ${products.length} mock products for ${region} outside production`)\n      products = mockProducts[region] || []\n      source = 'mock'\n    }\n\n    res.json({
      region,
      count: products.length,
      products,
      source, // Indicates whether data came from FazerCards or mock
      _debug: {
        timestamp: new Date().toISOString(),
        dataSource: source === 'fazer' ? 'Real FazerCards API' : 'Fallback Mock Data',
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/products/:id
 * Get a specific product by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    console.log(`🔍 Searching for product: ${id}`)

    // Search in all mock products
    for (const region in mockProducts) {
      const product = mockProducts[region].find((p) => p.id === id)
      if (product) {
        return res.json(product)
      }
    }

    // If not found in mock, try to fetch from FazerCards
    try {
      // This is a simplified approach - in production, you'd need better matching
      const regions = ['LATAM', 'EU', 'BR', 'MENA']
      const categoryMap: Record<string, string> = {
        LATAM: 'free_fire_latam',
        EU: 'free_fire_eu',
        BR: 'free_fire_br',
        MENA: 'free_fire_mena',
      }

      for (const region of regions) {
        const categoryId = categoryMap[region]
        const offers = await fazer.getOffers(categoryId)

        for (const offer of offers) {
          const productId = `${region.toLowerCase()}-ff-${offer.offer_id}`
          if (productId === id) {
            return res.json(normalizeOffer(offer, region, 0))
          }
        }
      }
    } catch (error) {
      console.warn('Failed to search FazerCards:', error instanceof Error ? error.message : error)
    }

    // Not found
    res.status(404).json({
      error: 'Product not found',
      id,
    })
  } catch (error) {
    next(error)
  }
})

export default router
