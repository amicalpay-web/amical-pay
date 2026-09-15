/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { Region, Language, Currency } from '@/types'
import { preferencesService } from '@/services'
import { getDefaultLanguageForRegion } from '@/data/regions'
import i18n from '@/i18n'

interface AppContextType {
  region: Region
  setRegion: (region: Region) => void
  language: Language
  setLanguage: (language: Language) => void
  currency: Currency
  setCurrency: (currency: Currency) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<Region>(
    (preferencesService.getRegion() as Region) || 'EU'
  )
  const [language, setLanguageState] = useState<Language>(
    preferencesService.getLanguage()
  )
  const [currency, setCurrencyState] = useState<Currency>(
    preferencesService.getCurrency()
  )

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion)
    preferencesService.setRegion(newRegion)
    const defaultLang = getDefaultLanguageForRegion(newRegion)
    if (defaultLang) {
      setLanguageState(defaultLang)
      preferencesService.setLanguage(defaultLang)
    }
  }

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    preferencesService.setLanguage(newLanguage)
  }

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    preferencesService.setCurrency(newCurrency)
  }

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language])

  return (
    <AppContext.Provider value={{ region, setRegion, language, setLanguage, currency, setCurrency }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
