import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language, translations, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('pahala-lang') as Language;
    if (stored === 'sw' || stored === 'en') return stored;
    // Auto-detect from browser on first visit
    const browserLang = navigator.language?.toLowerCase() ?? '';
    return browserLang.startsWith('sw') ? 'sw' : 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pahala-lang', lang);
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string>): string => {
      let value: string = translations[key]?.[language] ?? '';
      if (!value) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation: "${key}" for language "${language}"`);
        }
        return key;
      }
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
        });
      }
      return value;
    },
    [language]
  );

  // Set HTML lang attribute on mount and language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
