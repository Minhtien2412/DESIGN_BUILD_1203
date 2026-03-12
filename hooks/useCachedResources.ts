import { useEffect, useState } from "react";

/**
 * Hook to handle resource loading (fonts, assets)
 * Skip fontfaceobserver on web to prevent 6000ms timeout error
 */
export function useCachedResources() {
  // On web, immediately return true to skip all async loading
  // This prevents fontfaceobserver timeout issues
  const [isLoadingComplete, _setLoadingComplete] = useState(true);

  useEffect(() => {
    // Skip all resource loading - not needed for this app
    // Fonts are loaded via CSS in index.html
    // Native platforms use system fonts
    return;

    /* Commented out - kept for reference if needed in future
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

    if (Platform.OS !== 'web') {
      loadResourcesAndDataAsync();
    }
    */
  }, []);

  return isLoadingComplete;
}
