import { api } from '@/config/api'
import { Product, Region } from '@/types'
import { allProducts, getProductById as getMockProductById, getProductsByRegion as getMockProductsByRegion } from '@/data/products'

export const productsService = {
  getAllProducts: async (): Promise<Product[]> => allProducts,

  getProductsByRegion: async (region: Region): Promise<Product[]> => {
    try {
      const response = await api.getProductsByRegion(region)
      return response.products
    } catch (error) {
      console.error('Failed to fetch products from API, falling back to local data:', error)
      return getMockProductsByRegion(region)
    }
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      return await api.getProductById(id)
    } catch (error) {
      console.error('Failed to fetch product by ID from API, falling back to local data:', error)
      return getMockProductById(id)
    }
  },

  searchProducts: async (query: string, region?: Region): Promise<Product[]> => {
    const allRegionProducts = region ? await productsService.getProductsByRegion(region) : allProducts
    return allRegionProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    )
  },

  getPopularProducts: async (region?: Region): Promise<Product[]> => {
    const allRegionProducts = region ? await productsService.getProductsByRegion(region) : allProducts
    return allRegionProducts.filter((product) => product.popular)
  },
}
