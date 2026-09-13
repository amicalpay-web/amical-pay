import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fr } from './locales/fr';
import { en } from './locales/en';
import { es } from './locales/es';
import { pt } from './locales/pt';
import { ar } from './locales/ar';
import { preferencesService } from '@/services';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  ar: { translation: ar },
};

const savedLanguage = preferencesService.getLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
