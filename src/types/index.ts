// Product Types
export interface Product {
  id: string;
  name: string;
  diamonds: number;
  region: Region;
  description: string;
  sellingPriceUsd: number;
  sellingPriceHtg: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  stock?: number;
  image?: string;
  popular?: boolean;
  badge?: string;
  categoryId?: string;
  categoryName?: string;
  metadata?: Record<string, unknown>;
  fazerFields?: FazerValidationField[];
  fazerCategoryId?: string;
  fazerValidationCategoryId?: string;
  fazerOfferId?: string;
  fazerValidationFields?: FazerValidationField[];
  requiresPlayerValidation?: boolean;
}

export interface FazerValidationField {
  key?: string;
  label?: string;
  type?: string;
  options?: Array<Record<string, unknown>>;
}

export interface FazerCatalogCategory {
  category_id: string;
  category_name: string;
  name?: string;
  description?: string;
  image_url?: string;
}

export interface FazerCatalogProduct extends Product {}

export interface FazerCatalogItem {
  category: FazerCatalogCategory;
  offers: Array<Record<string, unknown>>;
  products: FazerCatalogProduct[];
  fields?: FazerValidationField[];
  note?: string;
  error?: string;
}

export interface FazerCatalogResponse {
  status: string;
  source: 'fazer';
  fetched_at: string;
  total_categories: number;
  total_offers: number;
  categories: FazerCatalogItem[];
  errors?: Array<{ categoryId: string; categoryName: string; error: string }>;
}

// Region Types
export type Region = 'EU' | 'LATAM' | 'BR' | 'MENA';

export interface RegionInfo {
  id: Region;
  name: string;
  flag: string;
  defaultLanguage: Language;
}

// Language Types
export type Language = 'fr' | 'en' | 'es' | 'pt' | 'ar';

// Currency Types
export type Currency = 'USD' | 'HTG';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  exchangeRate: number; // HTG per 1 USD
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  product: Product;
  playerId: string;
  whatsappNumber: string;
  email: string;
  region: Region;
  currency: Currency;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  completedAt?: Date;
  fazerFields?: Record<string, string>;
}

export type OrderStatus = 'pending' | 'payment_verification' | 'processing' | 'completed' | 'failed';

export type PaymentMethod = 'paypal' | 'moncash' | 'natcash';

// Cart Types
export interface CartItem {
  product: Product;
  playerId: string;
  whatsappNumber?: string;
  email?: string;
  fazerFields?: Record<string, string>;
}

// Price Calculation (Internal - never shown to customer)
export interface PriceData {
  supplierId?: string;
  supplierCostUsd: number;
  regionalMargin: number; // percentage
  customMargin: number; // percentage
  sellingPriceUsd: number;
  exchangeRate: number;
  sellingPriceHtg: number;
  profit: number; // USD
}
