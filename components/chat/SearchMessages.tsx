/**
 * SearchMessages Component
 * ========================
 *
 * Search tin nhắn trong conversation hoặc toàn bộ
 *
 * Features:
 * - Full-text search
 * - Filter by type, date, sender
 * - Highlighted results
 * - Jump to message
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useDebounce } from "@/hooks/use-debounce";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// Types
// ============================================================================

export interface SearchResult {
  message: {
    id: string;
    conversationId: string;
    seq: number;
    sender: {
      id: number;
      name: string;
      avatar?: string | null;
    };
    type: string;
    content?: string | null;
    createdAt: string;
  };
  highlight?: string;
  conversationName?: string;
}

export interface SearchMessagesProps {
  /** Conversation ID to search in (optional for global search) */
  conversationId?: string;
  /** Callback when selecting a result */
  onSelectResult?: (result: SearchResult) => void;
  /** Callback to close search */
  onClose?: () => void;
  /** Placeholder text */
  placeholder?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SearchMessages({
  conversationId,
  onSelectResult,
  onClose,
  placeholder = "Tìm kiếm tin nhắn...",
}: SearchMessagesProps) {
  // State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  const insets = useSafeAreaInsets();

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // ============================================
  // Search Effect
  // ============================================

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      let endpoint: string;
      if (conversationId) {
        // Search in specific conversation
        endpoint = `/conversations/${conversationId}/messages/search?q=${encodeURIComponent(searchQuery)}&limit=30`;
      } else {
        // Global search
        endpoint = `/messages/search?q=${encodeURIComponent(searchQuery)}&limit=30`;
      }

      const response = await apiFetch<{
        results?: SearchResult[];
        messages?: any[];
      }>(endpoint);

      // Handle both response formats (response is directly the data)
      if (response.results) {
        setResults(response.results);
      } else if (response.messages) {
        // Convert messages format to results format
        setResults(
          response.messages.map((m: any) => ({
            message: m,
            highlight: m.content,
          })),
        );
      }
    } catch (error) {
      console.error("[SearchMessages] Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Handlers
  // ============================================

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  }, []);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      onSelectResult?.(result);
    },
    [onSelectResult],
  );

  // ============================================
  // Render Item
  // ============================================

  const renderResult = useCallback(
    ({ item }: { item: SearchResult }) => {
      const { message, highlight, conversationName } = item;

      return (
        <TouchableOpacity
          style={[styles.resultItem, { borderBottomColor: surfaceColor }]}
          onPress={() => handleSelectResult(item)}
          activeOpacity={0.7}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {message.sender.avatar ? (
              <Image
                source={{ uri: message.sender.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {message.sender.name?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <Text
                style={[styles.senderName, { color: textColor }]}
                numberOfLines={1}
              >
                {message.sender.name}
              </Text>
              <Text style={[styles.timestamp, { color: secondaryTextColor }]}>
                {formatDate(message.createdAt)}
              </Text>
            </View>

            {/* Conversation name (for global search) */}
            {conversationName && !conversationId && (
              <Text
                style={[styles.conversationName, { color: primaryColor }]}
                numberOfLines={1}
              >
                {conversationName}
              </Text>
            )}

            {/* Message content with highlight */}
            <Text
              style={[styles.messagePreview, { color: secondaryTextColor }]}
              numberOfLines={2}
            >
              {highlight || message.content || getTypeLabel(message.type)}
            </Text>
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={20} color={surfaceColor} />
        </TouchableOpacity>
      );
    },
    [
      conversationId,
      surfaceColor,
      textColor,
      primaryColor,
      secondaryTextColor,
      handleSelectResult,
    ],
  );

  // ============================================
  // Render
  // ============================================

  return (
    <View
      style={[styles.container, { backgroundColor, paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: surfaceColor }]}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}

        {/* Search Input */}
        <View style={[styles.searchInput, { backgroundColor: surfaceColor }]}>
          <Ionicons name="search" size={18} color={secondaryTextColor} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={secondaryTextColor}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons
                name="close-circle"
                size={18}
                color={secondaryTextColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={primaryColor} size="large" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.message.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : hasSearched ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color={surfaceColor} />
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
            Không tìm thấy kết quả
          </Text>
          <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
            Thử tìm kiếm với từ khóa khác
          </Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color={surfaceColor} />
          <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
            Tìm kiếm tin nhắn
          </Text>
          <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
            Nhập ít nhất 2 ký tự để tìm kiếm
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("vi-VN", { weekday: "short" });
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    IMAGE: "📷 Hình ảnh",
    VIDEO: "🎬 Video",
    FILE: "📎 Tệp đính kèm",
    AUDIO: "🎵 Audio",
    VOICE: "🎤 Tin nhắn thoại",
    LOCATION: "📍 Vị trí",
  };
  return labels[type] || "";
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },

  // Results
  listContent: {
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  resultContent: {
    flex: 1,
    marginRight: 8,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  senderName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  conversationName: {
    fontSize: 12,
    marginBottom: 2,
  },
  messagePreview: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Empty state
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});

export default SearchMessages;
