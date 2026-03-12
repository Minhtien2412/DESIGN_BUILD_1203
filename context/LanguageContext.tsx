/**
 * Language Context & Hook
 * React integration for i18n system
 * @created 04/02/2026
 */

import {
    SupportedLanguage,
    TranslationStrings,
    getAvailableLanguages,
    getTranslations,
    initializeLanguage,
    setLanguage as setStoredLanguage,
    t as translate
} from "@/lib/i18n";
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

interface LanguageContextType {
  language: SupportedLanguage;
  translations: TranslationStrings;
  isLoading: boolean;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (keyPath: string) => string;
  availableLanguages: Array<{
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }>;
}

// ============================================================================
// Context
// ============================================================================

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// ============================================================================
// Provider
// ============================================================================

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>("vi");
  const [translations, setTranslations] =
    useState<TranslationStrings>(getTranslations());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language from storage
  useEffect(() => {
    const init = async () => {
      try {
        const savedLanguage = await initializeLanguage();
        setLanguageState(savedLanguage);
        setTranslations(getTranslations());
      } catch (error) {
        console.warn("Failed to initialize language:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Change language
  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      await setStoredLanguage(lang);
      setLanguageState(lang);
      setTranslations(getTranslations());
    } catch (error) {
      console.warn("Failed to change language:", error);
    }
  }, []);

  // Translate function
  const t = useCallback(
    (keyPath: string): string => {
      return translate(keyPath);
    },
    [language],
  ); // Re-create when language changes

  const value: LanguageContextType = {
    language,
    translations,
    isLoading,
    setLanguage,
    t,
    availableLanguages: getAvailableLanguages(),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access language/translation context
 * @example
 * const { t, language, setLanguage } = useLanguage();
 * <Text>{t('home.title')}</Text>
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

/**
 * Simple translation hook (just the t function)
 * @example
 * const t = useTranslation();
 * <Text>{t('common.loading')}</Text>
 */
export function useTranslation(): (keyPath: string) => string {
  const { t } = useLanguage();
  return t;
}

// ============================================================================
// HOC for Class Components (if needed)
// ============================================================================

export interface WithTranslationProps {
  t: (keyPath: string) => string;
  language: SupportedLanguage;
}

export function withTranslation<P extends WithTranslationProps>(
  Component: React.ComponentType<P>,
) {
  return function WithTranslationComponent(
    props: Omit<P, keyof WithTranslationProps>,
  ) {
    const { t, language } = useLanguage();
    return <Component {...(props as P)} t={t} language={language} />;
  };
}

export default {
  LanguageProvider,
  useLanguage,
  useTranslation,
  withTranslation,
};
