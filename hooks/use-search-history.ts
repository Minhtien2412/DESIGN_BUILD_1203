import { getItem, setItem } from '@/utils/storage';
import { useEffect, useState } from 'react';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const addToHistory = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const newHistory = [
      trimmed,
      ...history.filter(item => item !== trimmed),
    ].slice(0, MAX_HISTORY_ITEMS);

    setHistory(newHistory);
    try {
      await setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      await setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const removeFromHistory = async (query: string) => {
    const newHistory = history.filter(item => item !== query);
    setHistory(newHistory);
    try {
      await setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to remove from search history:', error);
    }
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
