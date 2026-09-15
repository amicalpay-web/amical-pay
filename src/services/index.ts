import { Currency, Language } from '@/types';
export { authService } from './authService'

// Local storage preference service
export const preferencesService = {
  // Get language preference
  getLanguage: (): Language => {
    return (localStorage.getItem('amical_language') as Language) || 'en';
  },

  // Set language preference
  setLanguage: (language: Language): void => {
    localStorage.setItem('amical_language', language);
  },

  // Get currency preference
  getCurrency: (): Currency => {
    return (localStorage.getItem('amical_currency') as Currency) || 'USD';
  },

  // Set currency preference
  setCurrency: (currency: Currency): void => {
    localStorage.setItem('amical_currency', currency);
  },

  // Get region preference
  getRegion: () => {
    return localStorage.getItem('amical_region') || 'EU';
  },

  // Set region preference
  setRegion: (region: string): void => {
    localStorage.setItem('amical_region', region);
  },
};
