import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

// Mock Free Fire products for each region
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
    },
  ],
  EU: [
    {
      id: 'eu-ff-500',
      name: '500 Diamonds',
      diamonds: 500,
      region: 'EU',
      description: 'Rechargez votre compte avec 500 Diamonds Free Fire',
      sellingPriceUsd: 9.99,
      sellingPriceHtg: 499.5,
      availability: 'in_stock',
      popular: true,
    },
  ],
  BR: [
    {
      id: 'br-ff-500',
      name: '500 Diamantes',
      diamonds: 500,
      region: 'BR',
      description: 'Recarregue sua conta com 500 Diamantes Free Fire',
      sellingPriceUsd: 9.99,
      sellingPriceHtg: 499.5,
      availability: 'in_stock',
      popular: true,
    },
  ],
  MENA: [
    {
      id: 'mena-ff-500',
      name: '500 الماس',
      diamonds: 500,
      region: 'MENA',
      description: 'قم بشحن حسابك بـ 500 ماسة في فري فاير',
      sellingPriceUsd: 9.99,
      sellingPriceHtg: 499.5,
      availability: 'in_stock',
      popular: true,
    },
  ],
}

// GET /api/products?region=LATAM
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const region = (req.query.region as string) || 'LATAM'
    const products = mockProducts[region] || []

    res.json({
      region,
      count: products.length,
      products,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Search in all regions
    for (const region in mockProducts) {
      const product = mockProducts[region].find((p) => p.id === id)
      if (product) {
        return res.json(product)
      }
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
