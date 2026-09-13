import { Currency, Language } from '@/types';

// Mock authentication service
export const authService = {
  // Check if user is authenticated (mock)
  isAuthenticated: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem('amical_auth_token');
        resolve(!!token);
      }, 100);
    });
  },

  // Login (mock)
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const token = 'mock_token_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('amical_auth_token', token);
          resolve({
            token,
            user: { email, id: Math.random().toString(36).substr(2, 9) },
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  // Logout (mock)
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('amical_auth_token');
        resolve();
      }, 100);
    });
  },
};

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
