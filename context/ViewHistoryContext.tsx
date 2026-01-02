import { getItem, setItem } from '@/utils/storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ViewHistoryItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'service' | 'worker';
  viewedAt: string;
}

interface ViewHistoryContextType {
  history: ViewHistoryItem[];
  addToHistory: (item: Omit<ViewHistoryItem, 'viewedAt'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

const ViewHistoryContext = createContext<ViewHistoryContextType | undefined>(undefined);

const HISTORY_KEY = 'view_history';
const MAX_HISTORY_ITEMS = 50;

export function ViewHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ViewHistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await getItem(HISTORY_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load view history:', error);
      } finally {
        setLoaded(true);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (loaded) {
      setItem(HISTORY_KEY, JSON.stringify(history)).catch(console.error);
    }
  }, [history, loaded]);

  const addToHistory = (item: Omit<ViewHistoryItem, 'viewedAt'>) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== item.id);
      const newHistory = [
        { ...item, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  return (
    <ViewHistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
      }}
    >
      {children}
    </ViewHistoryContext.Provider>
  );
}

export function useViewHistory() {
  const context = useContext(ViewHistoryContext);
  if (!context) {
    throw new Error('useViewHistory must be used within ViewHistoryProvider');
  }
  return context;
}
