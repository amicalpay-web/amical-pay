import { FazerCatalogResponse, Product, Region } from '@/types'

interface ProductsResponse {
  products?: Product[]
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

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
  return Array.isArray(data.products) ? data.products : []
}

export const productsService = {
  getCatalog: fetchCatalogFromApi,
  getCategoryProducts: fetchCategoryProductsFromApi,

  getAllProducts: async (): Promise<Product[]> => {
    const catalog = await fetchCatalogFromApi()
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