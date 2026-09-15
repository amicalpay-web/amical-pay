/**
 * Product and catalog routes.
 *
 * FazerCards is the source of truth. The backend never returns the local
 * mock-products file from these routes, including in production.
 */

import { Router, Request, Response, NextFunction } from 'express'
import * as fazer from '../services/fazerCards.js'
import {
  FazerCatalogItem,
  FazerOffer,
  FazerValidationCategory,
  FazerValidationField,
} from '../types/fazer.js'

const router = Router()

const supportedRegions = ['LATAM', 'EU', 'BR', 'MENA'] as const
type SupportedRegion = (typeof supportedRegions)[number]

const regionHints: Record<SupportedRegion, string[]> = {
  LATAM: ['latam', 'latin', 'south america'],
  EU: ['eu', 'europe'],
  BR: ['br', 'brazil'],
  MENA: ['mena', 'middle east', 'arab'],
}

function productId(categoryId: string, offerId: string): string {
  return `fazer-${categoryId}--${offerId}`
}

function isValidationCategory(
  validationFields: FazerValidationField[] | undefined
): boolean {
  return Array.isArray(validationFields) && validationFields.length > 0
}

function inferRegion(category: { category_id: string; category_name: string }): SupportedRegion {
  const text = `${category.category_id} ${category.category_name}`.toLowerCase()
  for (const region of supportedRegions) {
    if (regionHints[region].some((hint) => text.includes(hint))) return region
  }
  return 'LATAM'
}

function normalizeOffer(
  offer: FazerOffer,
  category: FazerCatalogItem['category'],
  fields: FazerValidationField[] = [],
  index = 0,
  validationCategory?: FazerValidationCategory
): Record<string, unknown> {
  const price = Number(offer.price_usd ?? offer.price ?? 0)
  const offerFields = offer.fields || fields
  const validationFields = validationCategory?.fields || []
  const requiresPlayerValidation = isValidationCategory(validationFields)
  const region = inferRegion(category)

  return {
    id: productId(category.category_id, offer.offer_id),
    name: offer.offer_name,
    diamonds: offer.amount || 0,
    region,
    categoryId: category.category_id,
    categoryName: category.category_name,
    description: offer.description || category.description || offer.offer_name,
    sellingPriceUsd: price,
    sellingPriceHtg: price * 50,
    availability: typeof offer.stock === 'number' && offer.stock <= 0 ? 'out_of_stock' : 'in_stock',
    stock: offer.stock,
    image: offer.image_url || category.image_url,
    popular: offer.is_popular || index < 2,
    source: 'fazer',
    metadata: offer.metadata || {},
    fazerFields: offerFields,
    fazerValidationFields: validationFields,
    fazerCategoryId: category.category_id,
    fazerValidationCategoryId: validationCategory?.category_id,
    fazerOfferId: offer.offer_id,
    requiresPlayerValidation,
  }
}

function emptyCatalogItem(category: FazerCatalogItem['category']): FazerCatalogItem {
  return {
    category,
    offers: [],
    fields: [],
  }
}

async function categoryWithOffers(categoryId: string): Promise<FazerCatalogItem> {
  const category = (await fazer.getCategories())
    .find((candidate) => candidate.category_id === categoryId)
  if (!category) {
    throw new Error(`FazerCards category not found: ${categoryId}`)
  }

  const response = await fazer.getTopupOffers(categoryId)
  return {
    category,
    offers: response.offers.map((offer) => ({
      offer_id: offer.offer_id,
      offer_name: offer.name,
      price: Number(offer.price_usd),
      price_currency: 'USD',
      price_usd: offer.price_usd,
      stock: offer.stock,
      description: offer.description || response.note || category.description,
      image_url: offer.image_url || offer.image || category.image_url,
      fields: offer.fields || response.fields || [],
      metadata: offer.metadata || response.metadata,
      category_id: category.category_id,
      category_name: category.category_name,
    })),
    fields: response.fields || [],
    note: response.note,
    metadata: response.metadata,
  }
}

async function findFreeFireCategory(region: SupportedRegion): Promise<FazerCatalogItem['category']> {
  const categories = await fazer.getCategories()
  const freeFireCategories = categories.filter((category) => {
    const text = `${category.category_id} ${category.category_name}`.toLowerCase()
    return text.includes('free_fire') || text.includes('free fire')
  })
  const hints = regionHints[region]
  const category = freeFireCategories.find((candidate) => {
    const text = `${candidate.category_id} ${candidate.category_name}`.toLowerCase()
    return hints.some((hint) => text.includes(hint))
  })

  if (!category) {
    throw new Error(`No purchasable Free Fire category found for region ${region}`)
  }

  return category
}

// GET /api/products
// Legacy Free Fire endpoint, now using real offers without requiring the
// separate validation catalog.
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const region = ((req.query.region as string) || 'LATAM').toUpperCase() as SupportedRegion
    if (!supportedRegions.includes(region)) {
      res.status(400).json({ error: 'Invalid region', supportedRegions })
      return
    }

    const category = await findFreeFireCategory(region)
    const topupOffers = await fazer.getTopupOffers(category.category_id)
    const item: FazerCatalogItem = {
      category,
      offers: topupOffers.offers.map((offer) => ({
        offer_id: offer.offer_id,
        offer_name: offer.name,
        price: Number(offer.price_usd),
        price_currency: 'USD',
        price_usd: offer.price_usd,
        stock: offer.stock,
        description: offer.description || topupOffers.note || category.description,
        image_url: offer.image_url || offer.image || category.image_url,
        fields: offer.fields || topupOffers.fields || [],
        metadata: offer.metadata || topupOffers.metadata,
        category_id: category.category_id,
        category_name: category.category_name,
      })),
      fields: topupOffers.fields || [],
      note: topupOffers.note,
      metadata: topupOffers.metadata,
    }

    const validationCategory = await fazer.getValidationCategoryForTopup(
      category.category_id,
      category.category_name
    )
    const products = item.offers.map((offer, index) =>
      normalizeOffer(offer, category, item.fields, index, validationCategory)
    )

    res.setHeader('Cache-Control', 'private, max-age=300')
    res.json({
      status: 'success',
      region,
      category: {
        id: category.category_id,
        name: category.category_name,
      },
      count: products.length,
      products,
      source: 'fazer',
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/products/catalog
// Return every category, its real offers, dynamic fields and partial failures.
router.get('/catalog', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await fazer.getCategories()
    res.setHeader('Cache-Control', 'private, max-age=300')
    res.json({
      status: 'success',
      source: 'fazer',
      fetched_at: new Date().toISOString(),
      total_categories: categories.length,
      total_offers: 0,
      categories: categories.map(emptyCatalogItem),
      lazy_offers: true,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/products/catalog/:categoryId
// Load one category's offers on demand instead of blocking the storefront on
// hundreds of upstream requests.
router.get('/catalog/:categoryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await categoryWithOffers(req.params.categoryId)
    const validationCategory = await fazer.getValidationCategoryForTopup(
      item.category.category_id,
      item.category.category_name
    )
    const products = item.offers.map((offer, index) =>
      normalizeOffer(offer, item.category, item.fields, index, validationCategory)
    )

    res.setHeader('Cache-Control', 'private, max-age=300')
    res.json({
      status: 'success',
      source: 'fazer',
      category: item.category,
      products,
      fields: item.fields || [],
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/products/:id
// Resolve products from the same dynamic FazerCards catalog used by the UI.
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = req.params.id.match(/^fazer-(.+)--(.+)$/)
    if (!match) {
      res.status(404).json({ error: 'Product not found', id: req.params.id })
      return
    }

    const item = await categoryWithOffers(match[1])
    const validationCategory = await fazer.getValidationCategoryForTopup(
      item.category.category_id,
      item.category.category_name
    )
    const product = item.offers
      .map((offer, index) => normalizeOffer(offer, item.category, item.fields, index, validationCategory))
      .find((candidate) => candidate.id === req.params.id)
    if (!product) {
      res.status(404).json({ error: 'Product not found', id: req.params.id })
      return
    }
    res.json(product)
  } catch (error) {
    next(error)
  }
})

export default router