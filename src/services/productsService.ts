import { FazerCatalogResponse, Product, Region } from '@/types'
import { apiUrl } from './api'

interface ProductsResponse {
  products?: Product[]
}

export interface CategoryProductsUpdate {
  categoryId: string
  products: Product[]
  error?: string
}

const CATEGORY_REQUEST_CONCURRENCY = 8
const categoryProductsRequests = new Map<string, Promise<Product[]>>()

async function parseError(response: Response, resource: string): Promise<never> {
  const payload = await response.json().catch(() => ({})) as { error?: string }
  throw new Error(payload.error || `${resource} returned ${response.status}`)
}

async function fetchProductsFromApi(region: Region): Promise<Product[]> {
  const response = await fetch(apiUrl(`/api/products?region=${encodeURIComponent(region)}`))
  if (!response.ok) await parseError(response, 'Products API')

  const data = (await response.json()) as ProductsResponse
  return Array.isArray(data.products) ? data.products : []
}

async function fetchProductFromApi(id: string): Promise<Product | undefined> {
  const response = await fetch(apiUrl(`/api/products/${encodeURIComponent(id)}`))
  if (response.status === 404) return undefined
  if (!response.ok) await parseError(response, 'Product API')
  return (await response.json()) as Product
}

async function fetchCatalogFromApi(): Promise<FazerCatalogResponse> {
  const response = await fetch(apiUrl('/api/products/catalog'))
  if (!response.ok) await parseError(response, 'Catalog API')
  return (await response.json()) as FazerCatalogResponse
}

async function fetchCategoryProductsFromApi(categoryId: string): Promise<Product[]> {
  const response = await fetch(apiUrl(`/api/products/catalog/${encodeURIComponent(categoryId)}`))
  if (!response.ok) await parseError(response, 'Category catalog API')
  const data = await response.json() as { products?: Product[] }
  return (Array.isArray(data.products) ? data.products : []).map((product, index) => {
    const originalId = typeof product.id === 'string' ? product.id : ''
    const productId = product.fazerOfferId || originalId || `offer-${index + 1}`
    const normalizedId = originalId.startsWith(`fazer-${categoryId}--`)
      ? originalId
      : `fazer-${categoryId}--${productId}`

    return {
      ...product,
      id: normalizedId,
      categoryId: product.categoryId || categoryId,
      categoryName: product.categoryName || categoryId,
      description: product.description || product.name,
    }
  })
}

function getCachedCategoryProducts(categoryId: string): Promise<Product[]> {
  const existingRequest = categoryProductsRequests.get(categoryId)
  if (existingRequest) return existingRequest

  const request = fetchCategoryProductsFromApi(categoryId).catch((error: unknown) => {
    categoryProductsRequests.delete(categoryId)
    throw error
  })
  categoryProductsRequests.set(categoryId, request)
  return request
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown category catalog error'
}

async function fetchCatalogWithProducts(
  catalog?: FazerCatalogResponse,
  onCategoryUpdate?: (update: CategoryProductsUpdate) => void
): Promise<FazerCatalogResponse> {
  const sourceCatalog = catalog || await fetchCatalogFromApi()
  const categories = [...sourceCatalog.categories]
  const errors = [...(sourceCatalog.errors || [])]

  for (let start = 0; start < categories.length; start += CATEGORY_REQUEST_CONCURRENCY) {
    const batch = categories.slice(start, start + CATEGORY_REQUEST_CONCURRENCY)
    const settled = await Promise.allSettled(
      batch.map((category) => getCachedCategoryProducts(category.category.category_id))
    )

    settled.forEach((result, batchIndex) => {
      const categoryIndex = start + batchIndex
      const category = categories[categoryIndex]

      if (result.status === 'fulfilled') {
        categories[categoryIndex] = {
          ...category,
          products: result.value,
          error: undefined,
        }
        onCategoryUpdate?.({
          categoryId: category.category.category_id,
          products: result.value,
        })
        return
      }

      const message = errorMessage(result.reason)
      categories[categoryIndex] = {
        ...category,
        products: [],
        error: message,
      }
      errors.push({
        categoryId: category.category.category_id,
        categoryName: category.category.category_name,
        error: message,
      })
      onCategoryUpdate?.({
        categoryId: category.category.category_id,
        products: [],
        error: message,
      })
    })
  }

  return {
    ...sourceCatalog,
    categories,
    total_offers: categories.reduce((total, category) => total + category.products.length, 0),
    errors,
  }
}

export const productsService = {
  getCatalog: fetchCatalogFromApi,
  getCategoryProducts: getCachedCategoryProducts,
  getCatalogWithProducts: fetchCatalogWithProducts,
  retryCategoryProducts: (categoryId: string): Promise<Product[]> => {
    categoryProductsRequests.delete(categoryId)
    return getCachedCategoryProducts(categoryId)
  },

  getAllProducts: async (): Promise<Product[]> => {
    const catalog = await fetchCatalogWithProducts()
    return catalog.categories.flatMap((category) => category.products)
  },

  getProductsByRegion: fetchProductsFromApi,

  getProductById: fetchProductFromApi,

  searchProducts: async (query: string, region?: Region): Promise<Product[]> => {
    const products = region
      ? await fetchProductsFromApi(region)
      : await productsService.getAllProducts()
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) return products

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.categoryName?.toLowerCase().includes(normalizedQuery)
    )
  },

  getPopularProducts: async (region?: Region): Promise<Product[]> => {
    const products = region
      ? await fetchProductsFromApi(region)
      : await productsService.getAllProducts()
    return products.filter((product) => product.popular)
  },
}