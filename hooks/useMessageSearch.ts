/**
 * useMessageSearch Hook
 * Search messages within conversations
 *
 * Features:
 * - Search across all conversations or specific one
 * - Real-time search results
 * - Highlight matching text
 * - Recent searches history
 */

import messagesApi from "@/services/api/messagesApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface SearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  highlightedContent: string;
  senderId: number;
  senderName: string;
  createdAt: string;
  matchCount: number;
}

export interface SearchFilters {
  conversationId?: string;
  senderId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachment?: boolean;
}

interface UseMessageSearchOptions {
  /** Minimum characters to trigger search */
  minQueryLength?: number;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Max results to return */
  maxResults?: number;
  /** Save recent searches */
  saveRecentSearches?: boolean;
}

interface UseMessageSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  recentSearches: string[];

  // Actions
  setQuery: (query: string) => void;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  clearResults: () => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (search: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RECENT_SEARCHES_KEY = "@message_recent_searches";
const MAX_RECENT_SEARCHES = 10;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Highlight matching text in content
 */
function highlightText(content: string, query: string): string {
  if (!query.trim()) return content;

  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  let highlighted = content;

  words.forEach((word) => {
    const regex = new RegExp(`(${escapeRegex(word)})`, "gi");
    highlighted = highlighted.replace(regex, "**$1**");
  });

  return highlighted;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Count matches in content
 */
function countMatches(content: string, query: string): number {
  if (!query.trim()) return 0;

  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  let count = 0;

  const lowerContent = content.toLowerCase();
  words.forEach((word) => {
    const matches = lowerContent.match(new RegExp(escapeRegex(word), "gi"));
    count += matches ? matches.length : 0;
  });

  return count;
}

// ============================================================================
// HOOK
// ============================================================================

export function useMessageSearch(
  options: UseMessageSearchOptions = {},
): UseMessageSearchReturn {
  const {
    minQueryLength = 2,
    debounceMs = 300,
    maxResults = 50,
    saveRecentSearches = true,
  } = options;

  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    if (saveRecentSearches) {
      loadRecentSearches();
    }
  }, [saveRecentSearches]);

  // ============================================================================
  // RECENT SEARCHES MANAGEMENT
  // ============================================================================

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (err) {
      console.error("[useMessageSearch] Failed to load recent searches:", err);
    }
  };

  const saveRecentSearch = async (searchQuery: string) => {
    if (!saveRecentSearches || !searchQuery.trim()) return;

    try {
      const updated = [
        searchQuery.trim(),
        ...recentSearches.filter(
          (s) => s.toLowerCase() !== searchQuery.toLowerCase(),
        ),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("[useMessageSearch] Failed to save recent search:", err);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error("[useMessageSearch] Failed to clear recent searches:", err);
    }
  };

  const removeRecentSearch = async (search: string) => {
    try {
      const updated = recentSearches.filter((s) => s !== search);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("[useMessageSearch] Failed to remove recent search:", err);
    }
  };

  // ============================================================================
  // SEARCH LOGIC
  // ============================================================================

  const search = useCallback(
    async (searchQuery: string, filters?: SearchFilters) => {
      if (searchQuery.length < minQueryLength) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call API to search messages
        const response = await messagesApi.searchMessages({
          query: searchQuery,
          conversationId: filters?.conversationId,
          senderId: filters?.senderId,
          dateFrom: filters?.dateFrom?.toISOString(),
          dateTo: filters?.dateTo?.toISOString(),
          hasAttachment: filters?.hasAttachment,
          limit: maxResults,
        });

        // Process results
        const processedResults: SearchResult[] = response.messages.map(
          (msg) => ({
            messageId: msg.id,
            conversationId: msg.conversationId,
            content: msg.content,
            highlightedContent: highlightText(msg.content, searchQuery),
            senderId: msg.senderId,
            senderName: msg.sender?.name || "Unknown",
            createdAt: msg.createdAt,
            matchCount: countMatches(msg.content, searchQuery),
          }),
        );

        // Sort by match count and date
        processedResults.sort((a, b) => {
          if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount;
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setResults(processedResults);

        // Save to recent searches
        if (searchQuery.trim().length >= minQueryLength) {
          saveRecentSearch(searchQuery);
        }
      } catch (err: any) {
        console.error("[useMessageSearch] Search error:", err);
        setError(err.message || "Không thể tìm kiếm tin nhắn");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [minQueryLength, maxResults, saveRecentSearches],
  );

  // Debounced query setter
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);

      // Clear previous timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Don't search if query too short
      if (newQuery.length < minQueryLength) {
        setResults([]);
        return;
      }

      // Set debounced search
      const timeout = setTimeout(() => {
        search(newQuery);
      }, debounceMs);

      setDebounceTimeout(timeout);
    },
    [debounceMs, minQueryLength, search, debounceTimeout],
  );

  const clearResults = useCallback(() => {
    setQueryState("");
    setResults([]);
    setError(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return {
    query,
    results,
    loading,
    error,
    recentSearches,
    setQuery,
    search,
    clearResults,
    clearRecentSearches,
    removeRecentSearch,
  };
}

export default useMessageSearch;
