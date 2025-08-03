'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos
export type Language = 'pt' | 'en';
export type TranslationKey = string;

interface Translations {
  [key: string]: any;
}

interface LanguageState {
  currentLanguage: Language;
  translations: Translations;
  isLoading: boolean;
  setLanguage: (language: Language) => Promise<void>;
}

// Store Zustand para persistir idioma
const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'pt',
      translations: {},
      isLoading: true,
      
      setLanguage: async (language: Language) => {
        set({ isLoading: true });
        try {
          const translations = await loadTranslations(language);
          set({ 
            currentLanguage: language, 
            translations,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error loading translations:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'language-store',
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
);

// Função para carregar traduções
async function loadTranslations(language: Language): Promise<Translations> {
  try {
    const response = await fetch(`/locales/${language}/common.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading translations:', error);
    // Fallback para português se não conseguir carregar
    if (language !== 'pt') {
      return loadTranslations('pt');
    }
    return {};
  }
}

// Hook para usar traduções
export function useTranslation() {
  const { currentLanguage, translations, isLoading, setLanguage } = useLanguageStore();
  
  const t = (key: TranslationKey, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return (typeof value === 'string' ? value : fallback) || key;
  };

  const changeLanguage = async (language: Language) => {
    await setLanguage(language);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    isLoading,
    languages: [
      { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' },
      { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    ],
  };
}

// Context (opcional, para casos especiais)
const I18nContext = createContext<ReturnType<typeof useTranslation> | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({ children, defaultLanguage = 'pt' }: I18nProviderProps) {
  const translation = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeTranslations = async () => {
      const { currentLanguage, setLanguage } = useLanguageStore.getState();
      
      // Se não há idioma definido, usa o padrão
      const languageToLoad = currentLanguage || defaultLanguage;
      
      await setLanguage(languageToLoad);
      setIsInitialized(true);
    };

    initializeTranslations();
  }, [defaultLanguage]);

  if (!isInitialized || translation.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={translation}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook para usar o context (opcional)
export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}
