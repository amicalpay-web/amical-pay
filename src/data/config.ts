import { Currency, Language } from '@/types';

// Currency Configuration
export const CURRENCIES = {
  USD: {
    code: 'USD' as Currency,
    symbol: '$',
    exchangeRate: 50, // 1 USD = 50 HTG (mock rate)
  },
  HTG: {
    code: 'HTG' as Currency,
    symbol: 'G',
    exchangeRate: 1,
  },
};

export const DEFAULT_CURRENCY: Currency = 'USD';

// Language Configuration
export const SUPPORTED_LANGUAGES: Language[] = ['fr', 'en', 'es', 'pt', 'ar', 'ru'];

export const LANGUAGE_NAMES: Record<Language, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ar: 'العربية',
  ru: 'Русский',
};

export const DEFAULT_LANGUAGE: Language = 'en';

// Price Calculation Rules
export const PRICE_CONFIG = {
  // Commercial rounding for HTG
  roundingRule: (price: number): number => {
    // Round to nearest 0.5
    return Math.round(price * 2) / 2;
  },
};

// Utility function to convert USD to HTG
export const convertToHTG = (usdAmount: number): number => {
  return usdAmount * CURRENCIES.USD.exchangeRate;
};

// Utility function to convert price to user currency
export const convertPrice = (
  usdAmount: number,
  targetCurrency: Currency
): number => {
  if (targetCurrency === 'USD') {
    return usdAmount;
  }
  if (targetCurrency === 'HTG') {
    return convertToHTG(usdAmount);
  }
  return usdAmount;
};

// Format price for display
export const formatPrice = (
  amount: number,
  currency: Currency,
  locale: string = 'en'
): string => {
  const currencyInfo = CURRENCIES[currency];
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencyInfo.symbol}${formatted}`;
};

// Get locale string for Intl API based on language
export const getLocaleString = (language: Language): string => {
  const localeMap: Record<Language, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    pt: 'pt-BR',
    ar: 'ar-SA',
    ru: 'ru-RU',
  };
  return localeMap[language];
};
