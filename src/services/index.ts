import { Currency, Language } from '@/types';
import { supabase } from './supabase'

export const authService = {
  isAuthenticated: async (): Promise<boolean> => {
    if (!supabase) return false
    const { data } = await supabase.auth.getSession()
    return Boolean(data.session)
  },

  login: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase Auth is not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user || !data.session) throw new Error(error?.message || 'Invalid credentials')
    localStorage.setItem('amical_auth_user', data.user.email || email)
    window.dispatchEvent(new Event('amical-auth-changed'))
    return { token: data.session.access_token, user: data.user }
  },

  signup: async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase Auth is not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) throw new Error(error?.message || 'Could not create account')
    if (data.session) {
      localStorage.setItem('amical_auth_user', data.user.email || email)
    }
    window.dispatchEvent(new Event('amical-auth-changed'))
    return data
  },

  getAccessToken: async (): Promise<string | undefined> => {
    if (!supabase) return undefined
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  },

  logout: async (): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    localStorage.removeItem('amical_auth_token')
    localStorage.removeItem('amical_auth_user')
    window.dispatchEvent(new Event('amical-auth-changed'))
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
