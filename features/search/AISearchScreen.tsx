/**
 * AI Search Screen - Tìm kiếm thông minh với AI
 * Features: Voice search, AI suggestions, image search, smart filters
 * Sử dụng Gemini AI để hiểu ngữ cảnh tìm kiếm
 */

import { searchVideos } from "@/app/social/shorts";
import VoiceSearch from "@/components/VoiceSearch";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { Product, PRODUCTS } from "@/data/products";
import { geminiAI, GeminiMessage } from "@/services/geminiAI";
import { Reel } from "@/services/reelsService";
import { VoiceSearchResult } from "@/services/voiceSearchService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================
type SearchMode = "text" | "voice" | "image" | "ai";
type FilterCategory =
  | "all"
  | "villa"
  | "design"
  | "construction"
  | "consult"
  | "material"
  | "worker";

interface AISearchResult {
  products: Product[];
  videos: Reel[];
  aiSuggestion?: string;
  relatedSearches?: string[];
  categories?: string[];
}

interface SearchHistory {
  query: string;
  timestamp: number;
  type: "text" | "voice" | "ai";
}

// ============================================================================
// CONSTANTS
// ============================================================================
const QUICK_FILTERS = [
  {
    id: "all",
    label: "Tất cả",
    icon: "apps-outline",
    color: MODERN_COLORS.primary,
  },
  { id: "villa", label: "Biệt thự", icon: "home-outline", color: "#FF6B6B" },
  {
    id: "design",
    label: "Thiết kế",
    icon: "color-palette-outline",
    color: "#4ECDC4",
  },
  {
    id: "construction",
    label: "Thi công",
    icon: "construct-outline",
    color: "#45B7D1",
  },
  { id: "material", label: "Vật liệu", icon: "cube-outline", color: "#96CEB4" },
  { id: "worker", label: "Thợ", icon: "people-outline", color: "#FFEAA7" },
];

const AI_SUGGESTIONS = [
  "Tìm kiến trúc sư thiết kế biệt thự hiện đại",
  "Báo giá xây nhà 3 tầng 100m2",
  "So sánh giá vật liệu xây dựng",
  "Tìm thợ sửa nhà uy tín gần đây",
  "Mẫu nhà phố đẹp năm 2024",
  "Chi phí hoàn thiện nội thất căn hộ",
];

const TRENDING_SEARCHES = [
  { text: "Biệt thự hiện đại", count: "2.5k" },
  { text: "Thiết kế nội thất", count: "1.8k" },
  { text: "Nhà phố 3 tầng", count: "1.2k" },
  { text: "Vật liệu xây dựng", count: "980" },
  { text: "Kiến trúc sư", count: "756" },
];

// AI Search System Prompt
const AI_SEARCH_PROMPT = `Bạn là AI tìm kiếm thông minh cho ứng dụng thiết kế xây dựng.
Nhiệm vụ: Phân tích câu tìm kiếm của người dùng và trả về JSON với cấu trúc:
{
  "intent": "mô tả ý định tìm kiếm",
  "keywords": ["từ khóa 1", "từ khóa 2"],
  "category": "villa/design/construction/material/worker/all",
  "priceRange": { "min": số, "max": số } hoặc null,
  "suggestions": ["gợi ý tìm kiếm liên quan 1", "gợi ý 2", "gợi ý 3"],
  "response": "Câu trả lời ngắn gọn cho người dùng"
}
Luôn trả về JSON hợp lệ, không có text thừa.`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AISearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();

  // State
  const [query, setQuery] = useState(params.q || "");
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [videoResults, setVideoResults] = useState<Reel[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [relatedSearches, setRelatedSearches] = useState<string[]>([]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [aiMessages, setAiMessages] = useState<GeminiMessage[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // Refs
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto focus input
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Chuẩn hóa chuỗi tiếng Việt để tìm kiếm
   * - Loại bỏ dấu để tìm kiếm không dấu
   * - Hỗ trợ tìm "phong thuy" khớp với "phong thuỷ"
   */
  const normalizeVietnamese = useCallback((str: string): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .trim();
  }, []);

  // Basic text search with Vietnamese support
  const basicSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setVideoResults([]);
        return [];
      }

      const originalQuery = searchQuery.toLowerCase().trim();
      const normalizedQuery = normalizeVietnamese(searchQuery);

      // Search products with full Vietnamese support
      const productResults = PRODUCTS.filter((p) => {
        // Search in name
        if (
          p.name.toLowerCase().includes(originalQuery) ||
          normalizeVietnamese(p.name).includes(normalizedQuery)
        ) {
          return true;
        }

        // Search in description
        if (
          p.description &&
          (p.description.toLowerCase().includes(originalQuery) ||
            normalizeVietnamese(p.description).includes(normalizedQuery))
        ) {
          return true;
        }

        // Search in category
        if (
          p.category &&
          (p.category.toLowerCase().includes(originalQuery) ||
            normalizeVietnamese(p.category).includes(normalizedQuery))
        ) {
          return true;
        }

        // Search in brand
        if (
          p.brand &&
          (p.brand.toLowerCase().includes(originalQuery) ||
            normalizeVietnamese(p.brand).includes(normalizedQuery))
        ) {
          return true;
        }

        // Search in tags
        if (
          p.tags &&
          p.tags.some(
            (tag) =>
              tag.toLowerCase().includes(originalQuery) ||
              normalizeVietnamese(tag).includes(normalizedQuery),
          )
        ) {
          return true;
        }

        return false;
      });

      // Search videos using the helper function
      const videoSearchResults = searchVideos(searchQuery);

      setSearchResults(productResults);
      setVideoResults(videoSearchResults);
      return productResults;
    },
    [normalizeVietnamese],
  );

  // AI-powered search
  const aiSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      setAiThinking(true);
      setIsLoading(true);

      try {
        // First do basic search - this always works
        const basicResults = basicSearch(searchQuery);

        // If basic search finds results, show immediately
        if (basicResults.length > 0) {
          setSearchResults(basicResults);
        }

        // Then try to enhance with AI
        const aiPrompt = `${AI_SEARCH_PROMPT}\n\nCâu tìm kiếm: "${searchQuery}"`;

        const response = await geminiAI.generateContent(aiPrompt);

        if (response) {
          try {
            // Parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const aiResult = JSON.parse(jsonMatch[0]);

              // Set AI response
              setAiResponse(
                aiResult.response ||
                  `Tìm thấy ${basicResults.length} kết quả cho "${searchQuery}"`,
              );
              setRelatedSearches(
                aiResult.suggestions || [
                  `${searchQuery} giá rẻ`,
                  `${searchQuery} cao cấp`,
                  `${searchQuery} uy tín`,
                ],
              );

              // Filter results by AI-detected category
              if (aiResult.category && aiResult.category !== "all") {
                const filteredResults = basicResults.filter(
                  (p) =>
                    p.category?.toLowerCase() ===
                    aiResult.category.toLowerCase(),
                );
                if (filteredResults.length > 0) {
                  setSearchResults(filteredResults);
                }
              }
            } else {
              // No JSON but AI responded
              setAiResponse(
                `Đã tìm kiếm: "${searchQuery}". Tìm thấy ${basicResults.length} kết quả.`,
              );
            }
          } catch {
            // If JSON parse fails, show friendly message
            setAiResponse(
              `Tìm thấy ${basicResults.length} kết quả cho "${searchQuery}"`,
            );
          }

          // Add to history
          setSearchHistory((prev) => [
            {
              query: searchQuery,
              timestamp: Date.now(),
              type: "ai",
            },
            ...prev.slice(0, 9),
          ]);
        } else {
          // AI returned null, use basic results
          setAiResponse(
            basicResults.length > 0
              ? `Tìm thấy ${basicResults.length} kết quả cho "${searchQuery}"`
              : `Không tìm thấy kết quả cho "${searchQuery}". Thử từ khóa khác.`,
          );
          setRelatedSearches([
            "Biệt thự hiện đại",
            "Thiết kế nội thất",
            "Vật liệu xây dựng",
          ]);
        }
      } catch (error) {
        console.error("AI Search error:", error);
        // Still show basic search results
        const fallbackResults = basicSearch(searchQuery);
        setSearchResults(fallbackResults);
        setAiResponse(
          fallbackResults.length > 0
            ? `Tìm thấy ${fallbackResults.length} kết quả cho "${searchQuery}"`
            : `Không tìm thấy kết quả. Thử tìm: Biệt thự, Nội thất, Vật liệu`,
        );
        setRelatedSearches([
          "Biệt thự hiện đại",
          "Thiết kế nội thất",
          "Thi công xây dựng",
        ]);
      } finally {
        setAiThinking(false);
        setIsLoading(false);
      }
    },
    [basicSearch],
  );

  // Handle search submit
  const handleSearch = useCallback(() => {
    Keyboard.dismiss();
    if (searchMode === "ai") {
      aiSearch(query);
    } else {
      basicSearch(query);
      // Add to history
      if (query.trim()) {
        setSearchHistory((prev) => [
          {
            query: query.trim(),
            timestamp: Date.now(),
            type: "text",
          },
          ...prev.slice(0, 9),
        ]);
      }
    }
  }, [query, searchMode, aiSearch, basicSearch]);

  // Handle voice search result
  const handleVoiceSearchResult = useCallback(
    (result: VoiceSearchResult) => {
      if (result.success && result.query) {
        setQuery(result.query);
        // Add to history as voice search
        setSearchHistory((prev) => [
          {
            query: result.query!,
            timestamp: Date.now(),
            type: "voice",
          },
          ...prev.slice(0, 9),
        ]);
        // Apply AI suggestions if available
        if (result.suggestions && result.suggestions.length > 0) {
          setRelatedSearches(result.suggestions);
        }
        if (result.intent) {
          setAiResponse(`Tìm kiếm: "${result.query}" - ${result.intent}`);
        }
        // Perform search with transcribed text
        aiSearch(result.query);
      }
    },
    [aiSearch],
  );

  // Handle AI chat
  const sendAIMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      const userMessage: GeminiMessage = {
        role: "user",
        parts: [{ text: message }],
      };
      setAiMessages((prev) => [...prev, userMessage]);
      setAiThinking(true);

      try {
        const response = await geminiAI.sendMessage(message);
        if (response) {
          const aiMessage: GeminiMessage = {
            role: "model",
            parts: [{ text: response }],
          };
          setAiMessages((prev) => [...prev, aiMessage]);
        }
      } catch (error) {
        console.error("AI Chat error:", error);
      } finally {
        setAiThinking(false);
      }
    },
    [aiMessages],
  );

  // Filter products by category
  const filteredResults = useMemo(() => {
    if (selectedFilter === "all") return searchResults;
    return searchResults.filter((p) => p.category === selectedFilter);
  }, [searchResults, selectedFilter]);

  // Format price
  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)}M`;
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  // Search Mode Tabs
  const renderSearchModes = () => (
    <View style={styles.searchModes}>
      <TouchableOpacity
        style={[styles.modeTab, searchMode === "text" && styles.modeTabActive]}
        onPress={() => setSearchMode("text")}
      >
        <Ionicons
          name="search"
          size={18}
          color={
            searchMode === "text"
              ? MODERN_COLORS.surface
              : MODERN_COLORS.textSecondary
          }
        />
        <Text
          style={[
            styles.modeTabText,
            searchMode === "text" && styles.modeTabTextActive,
          ]}
        >
          Văn bản
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeTab, searchMode === "ai" && styles.modeTabActive]}
        onPress={() => setSearchMode("ai")}
      >
        <MaterialCommunityIcons
          name="robot-outline"
          size={18}
          color={
            searchMode === "ai"
              ? MODERN_COLORS.surface
              : MODERN_COLORS.textSecondary
          }
        />
        <Text
          style={[
            styles.modeTabText,
            searchMode === "ai" && styles.modeTabTextActive,
          ]}
        >
          AI Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeTab, searchMode === "voice" && styles.modeTabActive]}
        onPress={() => {
          setSearchMode("voice");
          setShowVoiceSearch(true);
        }}
      >
        <Ionicons
          name="mic"
          size={18}
          color={
            searchMode === "voice"
              ? MODERN_COLORS.surface
              : MODERN_COLORS.textSecondary
          }
        />
        <Text
          style={[
            styles.modeTabText,
            searchMode === "voice" && styles.modeTabTextActive,
          ]}
        >
          Giọng nói
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeTab, searchMode === "image" && styles.modeTabActive]}
        onPress={() => setSearchMode("image")}
      >
        <Ionicons
          name="camera"
          size={18}
          color={
            searchMode === "image"
              ? MODERN_COLORS.surface
              : MODERN_COLORS.textSecondary
          }
        />
        <Text
          style={[
            styles.modeTabText,
            searchMode === "image" && styles.modeTabTextActive,
          ]}
        >
          Hình ảnh
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Quick Filters
  const renderQuickFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {QUICK_FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterChip,
            selectedFilter === filter.id && { backgroundColor: filter.color },
          ]}
          onPress={() => setSelectedFilter(filter.id as FilterCategory)}
        >
          <Ionicons
            name={filter.icon as any}
            size={14}
            color={
              selectedFilter === filter.id
                ? MODERN_COLORS.surface
                : filter.color
            }
          />
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === filter.id && styles.filterChipTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // AI Response Box
  const renderAIResponse = () => {
    if (!aiResponse && !aiThinking) return null;

    return (
      <View style={styles.aiResponseBox}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiGradient}
        >
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons
              name="robot-happy"
              size={24}
              color={MODERN_COLORS.surface}
            />
            <Text style={styles.aiHeaderText}>AI Assistant</Text>
            {aiThinking && (
              <ActivityIndicator size="small" color={MODERN_COLORS.surface} />
            )}
          </View>

          {aiThinking ? (
            <View style={styles.aiThinkingContainer}>
              <Text style={styles.aiThinkingText}>Đang phân tích...</Text>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          ) : (
            <Text style={styles.aiResponseText}>{aiResponse}</Text>
          )}

          {relatedSearches.length > 0 && !aiThinking && (
            <View style={styles.relatedSearches}>
              <Text style={styles.relatedTitle}>Gợi ý tìm kiếm:</Text>
              <View style={styles.relatedTags}>
                {relatedSearches.slice(0, 3).map((search, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.relatedTag}
                    onPress={() => {
                      setQuery(search);
                      aiSearch(search);
                    }}
                  >
                    <Text style={styles.relatedTagText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  // AI Suggestions (when no query)
  const renderAISuggestions = () => {
    if (query.trim() || searchResults.length > 0) return null;

    return (
      <View style={styles.suggestionsSection}>
        {/* AI Suggestions */}
        <View style={styles.suggestionBlock}>
          <View style={styles.suggestionHeader}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={20}
              color={MODERN_COLORS.primary}
            />
            <Text style={styles.suggestionTitle}>Hỏi AI bất cứ điều gì</Text>
          </View>
          {AI_SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionItem}
              onPress={() => {
                setQuery(suggestion);
                setSearchMode("ai");
                aiSearch(suggestion);
              }}
            >
              <MaterialCommunityIcons
                name="robot-outline"
                size={16}
                color="#667eea"
              />
              <Text style={styles.suggestionText} numberOfLines={1}>
                {suggestion}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={MODERN_COLORS.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending */}
        <View style={styles.suggestionBlock}>
          <View style={styles.suggestionHeader}>
            <Ionicons name="trending-up" size={20} color="#FF6B6B" />
            <Text style={styles.suggestionTitle}>Xu hướng tìm kiếm</Text>
          </View>
          <View style={styles.trendingGrid}>
            {TRENDING_SEARCHES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.trendingItem}
                onPress={() => {
                  setQuery(item.text);
                  handleSearch();
                }}
              >
                <Text style={styles.trendingRank}>{idx + 1}</Text>
                <Text style={styles.trendingText} numberOfLines={1}>
                  {item.text}
                </Text>
                <Text style={styles.trendingCount}>{item.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent History */}
        {searchHistory.length > 0 && (
          <View style={styles.suggestionBlock}>
            <View style={styles.suggestionHeader}>
              <Ionicons
                name="time-outline"
                size={20}
                color={MODERN_COLORS.textSecondary}
              />
              <Text style={styles.suggestionTitle}>Tìm kiếm gần đây</Text>
              <TouchableOpacity onPress={() => setSearchHistory([])}>
                <Text style={styles.clearHistory}>Xóa</Text>
              </TouchableOpacity>
            </View>
            {searchHistory.slice(0, 5).map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.historyItem}
                onPress={() => {
                  setQuery(item.query);
                  if (item.type === "ai") {
                    setSearchMode("ai");
                    aiSearch(item.query);
                  } else {
                    basicSearch(item.query);
                  }
                }}
              >
                {item.type === "ai" ? (
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={16}
                    color="#667eea"
                  />
                ) : (
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={MODERN_COLORS.textSecondary}
                  />
                )}
                <Text style={styles.historyText} numberOfLines={1}>
                  {item.query}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setSearchHistory((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={MODERN_COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Product Card
  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={
          typeof item.image === "string" ? { uri: item.image } : item.image
        }
        style={styles.productImage}
        resizeMode="cover"
      />
      {item.discountPercent && item.discountPercent > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discountPercent}%</Text>
        </View>
      )}
      <TouchableOpacity style={styles.favoriteBtn}>
        <Ionicons
          name="heart-outline"
          size={18}
          color={MODERN_COLORS.surface}
        />
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={MODERN_COLORS.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            {/* Unified Search Button */}
            <TouchableOpacity
              style={styles.unifiedSearchBtn}
              onPress={() => router.push("/unified-search")}
            >
              <Ionicons name="apps" size={18} color={MODERN_COLORS.primary} />
            </TouchableOpacity>
            <Ionicons
              name="search"
              size={20}
              color={MODERN_COLORS.textSecondary}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={
                searchMode === "ai"
                  ? "Hỏi AI bất cứ điều gì..."
                  : "Tìm dịch vụ, sản phẩm..."
              }
              placeholderTextColor={MODERN_COLORS.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={MODERN_COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
            {searchMode === "ai" && (
              <TouchableOpacity
                style={styles.aiSearchBtn}
                onPress={handleSearch}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={18}
                  color={MODERN_COLORS.surface}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Search Mode Tabs */}
        {renderSearchModes()}

        {/* Quick Filters */}
        {renderQuickFilters()}

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI Response */}
          {renderAIResponse()}

          {/* Suggestions (when no results) */}
          {renderAISuggestions()}

          {/* Search Results */}
          {filteredResults.length > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  {filteredResults.length} sản phẩm
                </Text>
                <TouchableOpacity style={styles.sortBtn}>
                  <Ionicons
                    name="swap-vertical"
                    size={18}
                    color={MODERN_COLORS.text}
                  />
                  <Text style={styles.sortText}>Sắp xếp</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={filteredResults}
                keyExtractor={(item) => item.id}
                renderItem={renderProductCard}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Video Results - Hiển thị video tìm được */}
          {videoResults.length > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Ionicons
                    name="videocam"
                    size={20}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.resultsCount}>
                    {videoResults.length} video
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.sortBtn}
                  onPress={() => router.push("/social/shorts")}
                >
                  <Text
                    style={[styles.sortText, { color: MODERN_COLORS.primary }]}
                  >
                    Xem tất cả
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={MODERN_COLORS.primary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: MODERN_SPACING.md,
                  gap: 12,
                }}
              >
                {videoResults.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoCard}
                    onPress={() => router.push(`/social/shorts?id=${video.id}`)}
                  >
                    <Image
                      source={{ uri: video.thumbnail }}
                      style={styles.videoThumbnail}
                    />
                    <View style={styles.videoDuration}>
                      <Text style={styles.videoDurationText}>
                        {video.duration}
                      </Text>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle} numberOfLines={2}>
                        {video.title || video.description.split("\n")[0]}
                      </Text>
                      <View style={styles.videoStats}>
                        <Ionicons
                          name="eye-outline"
                          size={12}
                          color={MODERN_COLORS.textSecondary}
                        />
                        <Text style={styles.videoStatText}>{video.views}</Text>
                        <Ionicons
                          name="heart-outline"
                          size={12}
                          color={MODERN_COLORS.textSecondary}
                        />
                        <Text style={styles.videoStatText}>
                          {video.likes > 1000
                            ? `${(video.likes / 1000).toFixed(1)}K`
                            : video.likes}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* No Results */}
          {query.trim() &&
            filteredResults.length === 0 &&
            videoResults.length === 0 &&
            !isLoading && (
              <View style={styles.noResults}>
                <Ionicons
                  name="search-outline"
                  size={64}
                  color={MODERN_COLORS.textSecondary}
                />
                <Text style={styles.noResultsTitle}>
                  Không tìm thấy kết quả
                </Text>
                <Text style={styles.noResultsText}>
                  Thử tìm với từ khóa khác hoặc sử dụng AI Search
                </Text>
                <TouchableOpacity
                  style={styles.tryAIBtn}
                  onPress={() => {
                    setSearchMode("ai");
                    aiSearch(query);
                  }}
                >
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={20}
                    color={MODERN_COLORS.surface}
                  />
                  <Text style={styles.tryAIText}>Thử AI Search</Text>
                </TouchableOpacity>
              </View>
            )}
        </ScrollView>

        {/* AI Chat Button */}
        <TouchableOpacity
          style={styles.aiChatFab}
          onPress={() => setShowAIChat(true)}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.fabGradient}
          >
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={24}
              color={MODERN_COLORS.surface}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Voice Search Modal */}
        <VoiceSearch
          visible={showVoiceSearch}
          onClose={() => setShowVoiceSearch(false)}
          onResult={handleVoiceSearchResult}
          onTextResult={(text) => setQuery(text)}
          config={{
            language: "vi",
            category: selectedFilter !== "all" ? selectedFilter : undefined,
          }}
          title="Đang nghe..."
          subtitle="Nói để tìm kiếm sản phẩm, dịch vụ"
          maxDuration={15000}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
    gap: MODERN_SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    height: 46,
    gap: MODERN_SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },
  aiSearchBtn: {
    backgroundColor: "#667eea",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  unifiedSearchBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  // Search Modes
  searchModes: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    gap: MODERN_SPACING.xs,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },
  modeTabActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  modeTabText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: MODERN_COLORS.surface,
  },

  // Filters
  filtersContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: MODERN_COLORS.background,
    borderWidth: 1,
    borderColor: MODERN_COLORS.divider,
    height: 28,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
  },
  filterChipTextActive: {
    color: MODERN_COLORS.surface,
  },

  // AI Response
  aiResponseBox: {
    margin: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.md,
  },
  aiGradient: {
    padding: MODERN_SPACING.md,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.sm,
  },
  aiHeaderText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.surface,
    flex: 1,
  },
  aiThinkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  aiThinkingText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.surface,
    opacity: 0.9,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MODERN_COLORS.surface,
    opacity: 0.6,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
  aiResponseText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.surface,
    lineHeight: 22,
  },
  relatedSearches: {
    marginTop: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  relatedTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.surface,
    opacity: 0.8,
    marginBottom: MODERN_SPACING.xs,
  },
  relatedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
  },
  relatedTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.full,
  },
  relatedTagText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.surface,
  },

  // Content
  content: {
    flex: 1,
  },

  // Suggestions
  suggestionsSection: {
    padding: MODERN_SPACING.md,
  },
  suggestionBlock: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  suggestionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    flex: 1,
  },
  clearHistory: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.primary,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.divider,
  },
  suggestionText: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },
  trendingGrid: {
    gap: MODERN_SPACING.xs,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.sm,
  },
  trendingRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.primary + "15",
    textAlign: "center",
    lineHeight: 24,
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  trendingText: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },
  trendingCount: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.textSecondary,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.sm,
  },
  historyText: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.text,
  },

  // Results
  resultsSection: {
    padding: MODERN_SPACING.md,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.md,
  },
  resultsCount: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.text,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: MODERN_COLORS.text,
  },
  productRow: {
    justifyContent: "space-between",
    marginBottom: MODERN_SPACING.md,
  },
  productCard: {
    width: "48%",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: MODERN_COLORS.background,
  },
  discountBadge: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    left: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.danger,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.sm,
  },
  discountText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.surface,
  },
  favoriteBtn: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    right: MODERN_SPACING.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: MODERN_SPACING.sm,
  },
  productName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.primary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    color: MODERN_COLORS.textSecondary,
  },

  // No Results
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    padding: MODERN_SPACING.xl * 2,
  },
  noResultsTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xl,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.bold,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
  },
  noResultsText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginTop: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.lg,
  },
  tryAIBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    backgroundColor: "#667eea",
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.full,
  },
  tryAIText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    color: MODERN_COLORS.surface,
  },

  // AI Chat FAB
  aiChatFab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    ...MODERN_SHADOWS.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  // Video Card Styles
  videoCard: {
    width: 160,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  videoThumbnail: {
    width: "100%",
    height: 220,
    backgroundColor: MODERN_COLORS.background,
  },
  videoDuration: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  videoInfo: {
    padding: MODERN_SPACING.sm,
  },
  videoTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  videoStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  videoStatText: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginRight: 8,
  },
});
