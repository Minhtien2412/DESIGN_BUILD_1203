/**
 * Settings Context
 * Manage app-wide settings including FAB visibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppSettings {
  fabEnabled: boolean;
  fabPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  fabSize: number;
  darkMode: boolean;
  notifications: boolean;
  language: 'vi' | 'en';
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  toggleFAB: () => Promise<void>;
  loading: boolean;
}

const defaultSettings: AppSettings = {
  fabEnabled: true,
  fabPosition: 'bottom-right',
  fabSize: 56,
  darkMode: false,
  notifications: true,
  language: 'vi'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = '@app_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const toggleFAB = async () => {
    await updateSettings({ fabEnabled: !settings.fabEnabled });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleFAB, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
