/**
 * Message Search Screen (MSG-006)
 * ================================
 *
 * Search messages across conversations
 * - Full-text search
 * - Filter by conversation, date, type
 * - Highlight matches
 * - Jump to message in conversation
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import {
    SearchFilters,
    SearchResult,
    useMessageSearch,
} from "@/hooks/useMessageSearch";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// Component
// ============================================================================

export default function MessageSearchScreen() {
  const colors = useThemeColor();
  const { conversationId } = useLocalSearchParams<{
    conversationId?: string;
  }>();
  const inputRef = useRef<TextInput>(null);

  const {
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
  } = useMessageSearch({
    minQueryLength: 2,
    debounceMs: 300,
    maxResults: 50,
    saveRecentSearches: true,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    conversationId: conversationId,
  });

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ============================================
  // Handlers
  // ============================================

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await search(query, filters);
  }, [query, filters, search]);

  const handleResultPress = useCallback((result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to conversation and highlight message
    router.push({
      pathname: `/chat/${result.conversationId}`,
      params: {
        highlightMessageId: result.messageId,
        scrollToMessage: "true",
      },
    });
  }, []);

  const handleRecentSearchPress = useCallback(
    (searchText: string) => {
      setQuery(searchText);
      search(searchText, filters);
    },
    [setQuery, search, filters],
  );

  const formatTime = (dateStr: string): string => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  // ============================================
  // Render Highlighted Text
  // ============================================

  const renderHighlightedText = (text: string) => {
    // Split by ** markers
    const parts = text.split(/\*\*(.*?)\*\*/g);

    return (
      <Text style={[styles.resultContent, { color: colors.text }]}>
        {parts.map((part, index) => {
          // Odd indices are highlighted
          if (index % 2 === 1) {
            return (
              <Text
                key={index}
                style={[
                  styles.highlight,
                  { backgroundColor: colors.warning + "40" },
                ]}
              >
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  // ============================================
  // Render Result Item
  // ============================================

  const renderResult = useCallback(
    ({ item }: { item: SearchResult }) => (
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: colors.surface }]}
        onPress={() => handleResultPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resultHeader}>
          <Text style={[styles.resultSender, { color: colors.text }]}>
            {item.senderName}
          </Text>
          <Text style={[styles.resultTime, { color: colors.textSecondary }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>

        {renderHighlightedText(item.highlightedContent)}

        <View style={styles.resultFooter}>
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.resultConversation, { color: colors.textSecondary }]}
          >
            {item.matchCount} kết quả khớp
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [colors, handleResultPress],
  );

  // ============================================
  // Render Recent Searches
  // ============================================

  const renderRecentSearches = () => {
    if (query.length > 0 || recentSearches.length === 0) return null;

    return (
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={[styles.recentTitle, { color: colors.textSecondary }]}>
            Tìm kiếm gần đây
          </Text>
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.clearText, { color: colors.primary }]}>
              Xóa tất cả
            </Text>
          </TouchableOpacity>
        </View>

        {recentSearches.map((searchText, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentItem}
            onPress={() => handleRecentSearchPress(searchText)}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.recentText, { color: colors.text }]}>
              {searchText}
            </Text>
            <TouchableOpacity
              onPress={() => removeRecentSearch(searchText)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ============================================
  // Render Empty State
  // ============================================

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Đang tìm kiếm...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.error}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Đã xảy ra lỗi
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {error}
          </Text>
        </View>
      );
    }

    if (query.length >= 2 && results.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Không tìm thấy kết quả
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Thử tìm kiếm với từ khóa khác
          </Text>
        </View>
      );
    }

    return null;
  };

  // ============================================
  // Main Render
  // ============================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View
        style={[styles.searchBarContainer, { backgroundColor: colors.surface }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            nativeID="chat-message-search"
            accessibilityLabel="Tìm kiếm tin nhắn"
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            showFilters && { backgroundColor: colors.primary + "15" },
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Filters (expandable) */}
      {showFilters && (
        <View
          style={[styles.filtersContainer, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
            Bộ lọc tìm kiếm (sắp ra mắt)
          </Text>
          {/* TODO: Add filter options - conversation, date range, attachment type */}
        </View>
      )}

      {/* Results or Recent Searches */}
      {query.length >= 2 ? (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.messageId}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        renderRecentSearches()
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  filterLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  resultItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  resultSender: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  resultTime: {
    fontSize: 12,
  },
  resultContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: "600",
    borderRadius: 2,
    paddingHorizontal: 2,
  },
  resultFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultConversation: {
    fontSize: 12,
  },
  recentContainer: {
    padding: 16,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  clearText: {
    fontSize: 14,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
