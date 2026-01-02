import { getItem, setItem } from '@/utils/storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'service' | 'worker';
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => Promise<void>;
  clearFavorites: () => Promise<void>;
  totalFavorites: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = 'user_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load favorites from local storage (backend doesn't have favorites endpoint)
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await getItem(FAVORITES_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error('[FavoritesContext] Failed to load from storage:', error);
      } finally {
        setLoaded(true);
      }
    };
    loadFavorites();
  }, []);

  // Persist favorites to storage
  useEffect(() => {
    if (loaded) {
      setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch(console.error);
    }
  }, [favorites, loaded]);

  const addFavorite = async (item: Omit<FavoriteItem, 'addedAt'>) => {
    // Update state
    const newItem = { ...item, addedAt: new Date().toISOString() };
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) return prev;
      const updated = [...prev, newItem];
      // Persist to storage (fire-and-forget)
      setItem(FAVORITES_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  };

  const removeFavorite = async (id: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Persist to storage (fire-and-forget)
      setItem(FAVORITES_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some(f => f.id === id);
  };

  const toggleFavorite = async (item: Omit<FavoriteItem, 'addedAt'>) => {
    if (isFavorite(item.id)) {
      await removeFavorite(item.id);
    } else {
      await addFavorite(item);
    }
  };

  const clearFavorites = async () => {
    setFavorites([]);
    // Persist to storage (fire-and-forget)
    setItem(FAVORITES_KEY, JSON.stringify([])).catch(console.error);
  };

  const totalFavorites = favorites.length;

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        clearFavorites,
        totalFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
