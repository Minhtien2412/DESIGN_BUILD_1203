import { getItem, setItem } from '@/utils/storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface CompareItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'service' | 'worker';
  specs?: Record<string, any>;
}

interface CompareContextType {
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => boolean;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  compareCount: number;
  maxCompareItems: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const COMPARE_KEY = 'compare_items';
const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadCompare = async () => {
      try {
        const stored = await getItem(COMPARE_KEY);
        if (stored) {
          setCompareItems(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load compare items:', error);
      } finally {
        setLoaded(true);
      }
    };
    loadCompare();
  }, []);

  useEffect(() => {
    if (loaded) {
      setItem(COMPARE_KEY, JSON.stringify(compareItems)).catch(console.error);
    }
  }, [compareItems, loaded]);

  const addToCompare = (item: CompareItem): boolean => {
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      return false; // Max limit reached
    }
    if (isInCompare(item.id)) {
      return false; // Already in compare
    }
    setCompareItems(prev => [...prev, item]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setCompareItems(prev => prev.filter(item => item.id !== id));
  };

  const isInCompare = (id: string): boolean => {
    return compareItems.some(item => item.id === id);
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        compareCount: compareItems.length,
        maxCompareItems: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
}
