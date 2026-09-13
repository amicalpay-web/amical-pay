import { Product, Region } from '@/types';
import { allProducts, getProductsByRegion, getProductById } from '@/data/products';

// Mock products service - can be replaced with real API calls later
export const productsService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(allProducts), 300);
    });
  },

  // Get products by region
  getProductsByRegion: async (region: Region): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getProductsByRegion(region)), 300);
    });
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getProductById(id)), 300);
    });
  },

  // Search products
  searchProducts: async (query: string, region?: Region): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase())
        );
        if (region) {
          results = results.filter((p) => p.region === region);
        }
        resolve(results);
      }, 300);
    });
  },

  // Get popular products
  getPopularProducts: async (region?: Region): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = allProducts.filter((p) => p.popular);
        if (region) {
          results = results.filter((p) => p.region === region);
        }
        resolve(results);
      }, 300);
    });
  },
};
