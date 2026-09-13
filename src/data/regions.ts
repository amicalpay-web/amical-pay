import { Region, Language, RegionInfo } from '@/types';

export const regions: RegionInfo[] = [
  {
    id: 'EU',
    name: 'Europe',
    flag: '🇪🇺',
    defaultLanguage: 'fr',
  },
  {
    id: 'LATAM',
    name: 'Latinoamérica',
    flag: '🌎',
    defaultLanguage: 'es',
  },
  {
    id: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    defaultLanguage: 'pt',
  },
  {
    id: 'MENA',
    name: 'الشرق الأوسط',
    flag: '🌍',
    defaultLanguage: 'ar',
  },
];

export const getRegionInfo = (region: Region): RegionInfo | undefined => {
  return regions.find(r => r.id === region);
};

export const getDefaultLanguageForRegion = (region: Region): Language => {
  const regionInfo = getRegionInfo(region);
  return regionInfo?.defaultLanguage || 'en';
};
