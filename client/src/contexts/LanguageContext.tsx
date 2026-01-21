import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { zh } from '../i18n/zh';

export type Language = 'en' | 'zh';
export type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  translateCountry: (countryZh: string) => string;
  translateIndustry: (industryZh: string) => string;
  translateProvince: (provinceZh: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en,
  zh,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Try to get language from localStorage, default to Chinese
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'zh') ? saved : 'zh';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const translateCountry = (countryZh: string): string => {
    return translations[language].countries[countryZh as keyof typeof translations.en.countries] || countryZh;
  };

  const translateIndustry = (industryZh: string): string => {
    return translations[language].industries[industryZh as keyof typeof translations.en.industries] || industryZh;
  };

  const translateProvince = (provinceZh: string): string => {
    return translations[language].provinces[provinceZh as keyof typeof translations.en.provinces] || provinceZh;
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    translateCountry,
    translateIndustry,
    translateProvince,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
