import { Product, Region } from '@/types'
import { getProductsByRegion as getMockProductsByRegion, getProductById as getMockProductById } from '@/data/products'

interface ProductsResponse {
  products?: Product[]
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function fetchProductsFromApi(region: Region): Promise<Product[]> {
  const response = await fetch(apiUrl(`/api/products?region=${encodeURIComponent(region)}`))

  if (!response.ok) {
    throw new Error(`Products API returned ${response.status}`)
  }

  const data = (await response.json()) as ProductsResponse
  return Array.isArray(data.products) ? data.products : []
}

async function fetchProductFromApi(id: string): Promise<Product | undefined> {
  const response = await fetch(apiUrl(`/api/products/${encodeURIComponent(id)}`))

  if (response.status === 404) {
    return undefined
  }

  if (!response.ok) {
    throw new Error(`Product API returned ${response.status}`)
  }

  return (await response.json()) as Product
}

async function getProductsWithFallback(region: Region): Promise<Product[]> {
  try {
    return await fetchProductsFromApi(region)
  } catch (error) {
    console.warn('Products API unavailable, using local fallback', error)
    return getMockProductsByRegion(region)
  }
}

export const productsService = {
  getAllProducts: async (): Promise<Product[]> => {
    const regions: Region[] = ['EU', 'LATAM', 'BR', 'MENA']
    const products = await Promise.all(regions.map(getProductsWithFallback))
    return products.flat()
  },

  getProductsByRegion: async (region: Region): Promise<Product[]> => {
    return getProductsWithFallback(region)
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      return await fetchProductFromApi(id)
    } catch (error) {
      console.warn('Product API unavailable, using local fallback', error)
      return getMockProductById(id)
    }
  },

  searchProducts: async (query: string, region?: Region): Promise<Product[]> => {
    const products = region ? await getProductsWithFallback(region) : await productsService.getAllProducts()
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return products
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery)
    )
  },

  getPopularProducts: async (region?: Region): Promise<Product[]> => {
    const products = region ? await getProductsWithFallback(region) : await productsService.getAllProducts()
    return products.filter((product) => product.popular)
  },
}
