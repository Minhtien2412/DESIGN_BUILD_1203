import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Hook to handle resource loading (fonts, assets)
 * Skip fontfaceobserver on web to prevent 6000ms timeout error
 */
export function useCachedResources() {
  // Hooks must be called unconditionally
  const [isLoadingComplete, setLoadingComplete] = useState(Platform.OS === 'web');

  useEffect(() => {
    // On web, skip all async loading to prevent fontfaceobserver timeout
    // Web browsers handle fonts via CSS
    if (Platform.OS === 'web') {
      return;
    }

    async function loadResourcesAndDataAsync() {
      try {
        // Native platforms can load fonts if needed
        // Add expo-font loading here if required in future
        // await Font.loadAsync({ ... });
        
        setLoadingComplete(true);
      } catch (e) {
        console.warn('[useCachedResources] Error loading resources:', e);
        // Continue anyway to prevent blocking the app
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
