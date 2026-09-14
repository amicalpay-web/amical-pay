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
  image?: string;
  popular?: boolean;
  badge?: string;
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
export type Language = 'fr' | 'en' | 'es' | 'pt' | 'ar' | 'ru';

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
}

export type OrderStatus = 'pending' | 'payment_verification' | 'processing' | 'completed' | 'failed';

export type PaymentMethod = 'paypal' | 'moncash' | 'natcash';

// Cart Types
export interface CartItem {
  product: Product;
  playerId: string;
  whatsappNumber?: string;
  email?: string;
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
