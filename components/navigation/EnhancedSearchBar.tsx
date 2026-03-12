/**
 * Enhanced SearchBar - Intelligent search with auto-complete
 * Features: Vietnamese-friendly fuzzy search, recent searches, category filters
 * Used in home screen header
 */

import {
    searchRoutes,
    type AppRoute,
    type RouteMetadata
} from '@/constants/typed-routes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 5;

export interface EnhancedSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder = 'Tìm kiếm dịch vụ, vật liệu, công cụ...',
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<RouteMetadata[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      const results = searchRoutes(query);
      setSuggestions(results.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchQuery: string) => {
    try {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const updated = [
        trimmed,
        ...recentSearches.filter(s => s !== trimmed),
      ].slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      setShowSuggestions(false);
      
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}` as any);
      }
    }
  };

  const handleSuggestionPress = (route: AppRoute) => {
    saveRecentSearch(query);
    setShowSuggestions(false);
    setQuery('');
    router.push(route as any);
  };

  const handleRecentSearchPress = (search: string) => {
    setQuery(search);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(search);
    } else {
      router.push(`/search?q=${encodeURIComponent(search)}` as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          onFocus={() => {
            if (query.trim().length >= 2) {
              setShowSuggestions(true);
            }
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions Modal */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {/* Auto-complete suggestions */}
          {suggestions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Gợi ý</Text>
              <FlatList
                data={suggestions}
                keyExtractor={(item, index) => `suggestion-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(item.route)}
                  >
                    <Ionicons name={item.icon as any} size={20} color="#666" />
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle}>{item.titleVi}</Text>
                      <Text style={styles.suggestionCategory}>{item.category} • Layer {item.layer}</Text>
                    </View>
                    {item.badge && (
                      <View style={[styles.badge, getBadgeColor(item.badge)]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </>
          )}

          {/* Recent searches */}
          {suggestions.length === 0 && recentSearches.length > 0 && (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearButton}>Xóa</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={`recent-${index}`}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearchPress(search)}
                >
                  <Ionicons name="time-outline" size={18} color="#999" />
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* No results */}
          {query.length >= 2 && suggestions.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons name="sad-outline" size={32} color="#CCC" />
              <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
              <Text style={styles.noResultsHint}>Thử từ khóa khác hoặc tìm trong toàn bộ app</Text>
            </View>
          )}
        </View>
      )}

      {/* Backdrop */}
      {showSuggestions && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        />
      )}
    </View>
  );
};

const getBadgeColor = (badge: 'HOT' | 'NEW' | 'PRO') => {
  switch (badge) {
    case 'HOT':
      return { backgroundColor: '#FF6B6B' };
    case 'NEW':
      return { backgroundColor: '#51CF66' };
    case 'PRO':
      return { backgroundColor: '#FFD43B' };
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 11,
    color: '#999',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  recentText: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginTop: 8,
  },
  noResultsHint: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 4,
    textAlign: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: -1,
  },
});
