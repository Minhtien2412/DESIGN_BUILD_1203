/**
 * ThemeContext - Quản lý theme cho toàn bộ ứng dụng
 * Lưu trữ preference trong AsyncStorage và sync với system theme nếu chọn 'auto'
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [theme, setThemeState] = React.useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = React.useState(true);

  // Resolve theme based on preference and system setting
  const resolvedTheme: ResolvedTheme = React.useMemo(() => {
    if (theme === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemColorScheme]);

  // Load saved theme on mount
  React.useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Re-export hook that uses the context theme
export function useAppColorScheme(): ResolvedTheme {
  const context = React.useContext(ThemeContext);
  // Fallback to system scheme if not in provider
  const systemScheme = useSystemColorScheme();
  
  if (context) {
    return context.resolvedTheme;
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}
