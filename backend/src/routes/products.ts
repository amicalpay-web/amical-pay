/**
 * Product routes backed by live FazerCards offers.
 */

import { Router, Request, Response, NextFunction } from 'express'
import * as fazer from '../services/fazerCards.js'

const router = Router()

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

function normalizeOffer(offer: fazer.FazerOffer, region: string, index: number) {
  return {
    id: region.toLowerCase() + '-ff-' + offer.offer_id,
    name: offer.offer_name,
    diamonds: offer.amount,
    region,
    description: offer.description || 'Free Fire ' + region + ' - ' + offer.offer_name,
    sellingPriceUsd: offer.price,
    // FazerCards quotes in USD. HTG remains a configurable storefront conversion.
    sellingPriceHtg: offer.price * 50,
    availability: 'in_stock',
    popular: offer.is_popular || index < 2,
    source: 'fazer',
    fazerOfferId: offer.offer_id,
  }
}

async function getLiveProducts(region: string) {
  const category = await fazer.getCategoryForRegion(region)
  const offers = await fazer.getOffers(category.category_id)
  return offers.map((offer, index) => normalizeOffer(offer, region, index))
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const region = ((req.query.region as string) || 'LATAM').toUpperCase()

    try {
      const category = await fazer.getCategoryForRegion(region)
      const products = await getLiveProducts(region)
      res.json({
        region,
        count: products.length,
        products,
        source: 'fazer',
        category: {
          id: category.category_id,
          name: category.category_name,
          imageUrl: category.image_url,
        },
        fetchedAt: new Date().toISOString(),
      })
      return
    } catch (error) {
      const products = mockProducts[region] || []
      console.warn(
        'FazerCards unavailable for ' + region + ', using fallback:',
        error instanceof Error ? error.message : error,
      )
      res.json({
        region,
        count: products.length,
        products,
        source: 'mock',
        fetchedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const mockProduct = Object.values(mockProducts).flat().find((product) => product.id === id)
    if (mockProduct) {
      res.json(mockProduct)
      return
    }

    const regionPrefix = id.split('-ff-')[0]?.toUpperCase()
    const regions = regionPrefix ? [regionPrefix] : ['LATAM', 'EU', 'BR', 'MENA']

    for (const region of regions) {
      try {
        const products = await getLiveProducts(region)
        const product = products.find((item) => item.id === id)
        if (product) {
          res.json(product)
          return
        }
      } catch (error) {
        console.warn('Failed to fetch FazerCards products for ' + region + ':', error)
      }
    }

    res.status(404).json({ error: 'Product not found', id })
  } catch (error) {
    next(error)
  }
})

export default router
