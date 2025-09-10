import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Locale = 'en-US' | 'pt-BR';
type Translations = Record<string, any>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLocale = (): Locale => {
  const stored = typeof localStorage !== 'undefined' ? (localStorage.getItem('locale') as Locale) : undefined;
  if (stored && ['en-US', 'pt-BR'].includes(stored)) return stored;
  const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  return browserLang.startsWith('pt') ? 'pt-BR' : 'en-US';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale());
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/locales/${locale}/translation.json`);
        if (!response.ok) throw new Error(`Failed to load translations for ${locale}`);
        const data = await response.json();
        if (!aborted) {
          setTranslations(data);
          localStorage.setItem('locale', locale);
        }
      } catch (e) {
        console.error(e);
        if (!aborted) {
          if (locale !== 'en-US') setLocale('en-US');
          else setTranslations({});
        }
      } finally {
        if (!aborted) setIsLoading(false);
      }
    };
    fetchTranslations();
    return () => { aborted = true; };
  }, [locale]);

  const value = { locale, setLocale, translations, isLoading };
  return <LanguageContext.Provider value={value}>{!isLoading && children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};

