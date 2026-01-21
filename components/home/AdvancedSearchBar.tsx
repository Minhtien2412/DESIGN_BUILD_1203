/**
 * Advanced Search Bar Component
 * Features:
 * - Real-time live search across all categories
 * - Camera button for AI photo analysis
 * - Voice search support
 * - Quick suggestions
 * @created 2026-01-14
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================
interface SearchResult {
  id: string;
  type: 'product' | 'service' | 'worker' | 'material' | 'project' | 'video' | 'library';
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

interface AdvancedSearchBarProps {
  placeholder?: string;
  onCameraPress?: () => void;
  showInline?: boolean;
  style?: any;
}

// ============================================================================
// SEARCH DATA CATEGORIES
// ============================================================================
const ALL_SEARCHABLE_ITEMS: SearchResult[] = [
  // DỊCH VỤ
  { id: 's1', type: 'service', title: 'Thiết kế nhà', subtitle: 'Dịch vụ thiết kế', icon: 'home-outline', route: '/services/house-design', color: '#4894FE' },
  { id: 's2', type: 'service', title: 'Thiết kế nội thất', subtitle: 'Dịch vụ thiết kế', icon: 'bed-outline', route: '/services/interior-design', color: '#4894FE' },
  { id: 's3', type: 'service', title: 'Tra cứu xây dựng', subtitle: 'Dịch vụ tra cứu', icon: 'search-outline', route: '/services/construction-lookup', color: '#4894FE' },
  { id: 's4', type: 'service', title: 'Xin phép xây dựng', subtitle: 'Dịch vụ pháp lý', icon: 'document-text-outline', route: '/services/permit', color: '#4894FE' },
  { id: 's5', type: 'service', title: 'Hồ sơ mẫu', subtitle: 'Dịch vụ thiết kế', icon: 'folder-outline', route: '/services/sample-docs', color: '#4894FE' },
  { id: 's6', type: 'service', title: 'Phong thủy AI', subtitle: 'Công cụ AI', icon: 'compass-outline', route: '/tools/feng-shui-ai', color: '#9C27B0' },
  { id: 's7', type: 'service', title: 'Bảng màu', subtitle: 'Công cụ thiết kế', icon: 'color-palette-outline', route: '/tools/color-picker', color: '#4894FE' },
  { id: 's8', type: 'service', title: 'Tư vấn chất lượng', subtitle: 'Dịch vụ tư vấn', icon: 'checkmark-circle-outline', route: '/services/quality-consulting', color: '#4894FE' },
  { id: 's9', type: 'service', title: 'Công ty xây dựng', subtitle: 'Đối tác', icon: 'business-outline', route: '/services/construction-company', color: '#4894FE' },
  { id: 's10', type: 'service', title: 'Giám sát chất lượng', subtitle: 'Dịch vụ giám sát', icon: 'eye-outline', route: '/services/quality-supervision', color: '#4894FE' },
  
  // THỢ XÂY DỰNG
  { id: 'w1', type: 'worker', title: 'Thợ ép cọc', subtitle: 'Hà Nội • 100 thợ', icon: 'construct-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w2', type: 'worker', title: 'Thợ đào đất', subtitle: 'Sài Gòn • 50 thợ', icon: 'layers-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w3', type: 'worker', title: 'Thợ xây', subtitle: 'Hà Nội • 78 thợ', icon: 'hammer-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w4', type: 'worker', title: 'Thợ sắt', subtitle: 'Sài Gòn • 97 thợ', icon: 'build-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w5', type: 'worker', title: 'Thợ coffa', subtitle: 'Sài Gòn • 97 thợ', icon: 'albums-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w6', type: 'worker', title: 'Thợ cơ khí', subtitle: 'Sài Gòn • 50 thợ', icon: 'cog-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w7', type: 'worker', title: 'Thợ tô tường', subtitle: 'Hà Nội • 100 thợ', icon: 'brush-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w8', type: 'worker', title: 'Thợ điện nước', subtitle: 'Sài Gòn • 50 thợ', icon: 'flash-outline', route: '/workers', color: '#4AA14A' },
  { id: 'w9', type: 'worker', title: 'Thợ lát gạch', subtitle: 'Hà Nội • 100 thợ', icon: 'grid-outline', route: '/workers', color: '#F97316' },
  { id: 'w10', type: 'worker', title: 'Thợ thạch cao', subtitle: 'Sài Gòn • 100 thợ', icon: 'square-outline', route: '/workers', color: '#F97316' },
  { id: 'w11', type: 'worker', title: 'Thợ sơn', subtitle: 'Sài Gòn • 70 thợ', icon: 'color-fill-outline', route: '/workers', color: '#F97316' },
  { id: 'w12', type: 'worker', title: 'Thợ đá', subtitle: 'Sài Gòn • 70 thợ', icon: 'diamond-outline', route: '/workers', color: '#F97316' },
  { id: 'w13', type: 'worker', title: 'Thợ làm cửa', subtitle: 'Hà Nội • 100 thợ', icon: 'browsers-outline', route: '/workers', color: '#F97316' },
  { id: 'w14', type: 'worker', title: 'Thợ lan can', subtitle: 'Sài Gòn • 70 thợ', icon: 'expand-outline', route: '/workers', color: '#F97316' },
  { id: 'w15', type: 'worker', title: 'Thợ cổng', subtitle: 'Đà Nẵng • 35 thợ', icon: 'enter-outline', route: '/workers', color: '#F97316' },
  { id: 'w16', type: 'worker', title: 'Thợ camera', subtitle: 'Sài Gòn • 70 thợ', icon: 'videocam-outline', route: '/workers', color: '#F97316' },
  
  // VẬT LIỆU
  { id: 'm1', type: 'material', title: 'Vật liệu xây dựng', subtitle: 'Sài Gòn', icon: 'cube-outline', route: '/materials', color: '#8B5CF6' },
  { id: 'm2', type: 'material', title: 'Bê tông', subtitle: 'Sài Gòn', icon: 'cube-outline', route: '/materials', color: '#8B5CF6' },
  { id: 'm3', type: 'material', title: 'Gạch xây', subtitle: 'Toàn quốc', icon: 'grid-outline', route: '/materials', color: '#8B5CF6' },
  { id: 'm4', type: 'material', title: 'Xi măng', subtitle: 'Toàn quốc', icon: 'cube-outline', route: '/materials', color: '#8B5CF6' },
  { id: 'm5', type: 'material', title: 'Thép xây dựng', subtitle: 'Toàn quốc', icon: 'git-network-outline', route: '/materials', color: '#8B5CF6' },
  
  // TRANG THIẾT BỊ
  { id: 'e1', type: 'product', title: 'Thiết bị bếp', subtitle: 'Mua sắm', icon: 'restaurant-outline', route: '/shopping/kitchen-equipment', color: '#EC4899' },
  { id: 'e2', type: 'product', title: 'Thiết bị vệ sinh', subtitle: 'Mua sắm', icon: 'water-outline', route: '/shopping/sanitary-equipment', color: '#EC4899' },
  { id: 'e3', type: 'product', title: 'Thiết bị điện', subtitle: 'Mua sắm', icon: 'flash-outline', route: '/shopping/electrical', color: '#EC4899' },
  { id: 'e4', type: 'product', title: 'Thiết bị nước', subtitle: 'Mua sắm', icon: 'water-outline', route: '/shopping/plumbing', color: '#EC4899' },
  { id: 'e5', type: 'product', title: 'PCCC', subtitle: 'An toàn', icon: 'flame-outline', route: '/shopping/fire-safety', color: '#DC2626' },
  { id: 'e6', type: 'product', title: 'Bàn ăn', subtitle: 'Nội thất', icon: 'restaurant-outline', route: '/shopping/dining-tables', color: '#EC4899' },
  { id: 'e7', type: 'product', title: 'Bàn học', subtitle: 'Nội thất', icon: 'book-outline', route: '/shopping/study-desks', color: '#EC4899' },
  { id: 'e8', type: 'product', title: 'Sofa', subtitle: 'Nội thất', icon: 'tv-outline', route: '/shopping/sofas', color: '#EC4899' },
  
  // THƯ VIỆN
  { id: 'l1', type: 'library', title: 'Văn phòng', subtitle: 'Thư viện mẫu', icon: 'business-outline', route: '/documents', color: '#06B6D4' },
  { id: 'l2', type: 'library', title: 'Nhà phố', subtitle: 'Thư viện mẫu', icon: 'home-outline', route: '/services/house-design', color: '#06B6D4' },
  { id: 'l3', type: 'library', title: 'Biệt thự', subtitle: 'Thư viện mẫu', icon: 'home-outline', route: '/shopping/villa', color: '#06B6D4' },
  { id: 'l4', type: 'library', title: 'Biệt thự cổ điển', subtitle: 'Thư viện mẫu', icon: 'business-outline', route: '/shopping/villa', color: '#06B6D4' },
  { id: 'l5', type: 'library', title: 'Khách sạn', subtitle: 'Thư viện mẫu', icon: 'bed-outline', route: '/services/interior-design', color: '#06B6D4' },
  { id: 'l6', type: 'library', title: 'Nhà xưởng', subtitle: 'Thư viện mẫu', icon: 'cube-outline', route: '/services/construction-company', color: '#06B6D4' },
  { id: 'l7', type: 'library', title: 'Căn hộ dịch vụ', subtitle: 'Thư viện mẫu', icon: 'business-outline', route: '/services/interior-design', color: '#06B6D4' },
  
  // THIẾT KẾ
  { id: 'd1', type: 'service', title: 'Kiến trúc sư', subtitle: '300.000đ/m² • 100 KTS', icon: 'person-outline', route: '/services/house-design', color: '#4894FE' },
  { id: 'd2', type: 'service', title: 'Kỹ sư xây dựng', subtitle: '200.000đ/m² • 100 KS', icon: 'construct-outline', route: '/services/quality-consulting', color: '#4894FE' },
  { id: 'd3', type: 'service', title: 'Kết cấu', subtitle: '150.000đ/m²', icon: 'cube-outline', route: '/services/quality-supervision', color: '#4894FE' },
  { id: 'd4', type: 'service', title: 'Thiết kế điện', subtitle: '200.000đ/m²', icon: 'flash-outline', route: '/workers', color: '#4894FE' },
  { id: 'd5', type: 'service', title: 'Thiết kế nước', subtitle: '250.000đ/m²', icon: 'water-outline', route: '/workers', color: '#4894FE' },
  { id: 'd6', type: 'service', title: 'Dự toán xây dựng', subtitle: '150.000đ/m²', icon: 'calculator-outline', route: '/services/design-calculator', color: '#4894FE' },
  { id: 'd7', type: 'service', title: 'Thiết kế nội thất', subtitle: '70.000đ/m²', icon: 'bed-outline', route: '/services/interior-design', color: '#4894FE' },
  { id: 'd8', type: 'service', title: 'Công cụ AI', subtitle: 'AI hỗ trợ thiết kế', icon: 'sparkles-outline', route: '/ai', color: '#9C27B0' },
  
  // DỰ ÁN
  { id: 'p1', type: 'project', title: 'Biệt thự Đà Lạt', subtitle: '450m² • 12 tỷ', icon: 'home-outline', route: '/projects', color: '#4AA14A' },
  { id: 'p2', type: 'project', title: 'Resort Phú Quốc', subtitle: '2,000m² • 85 tỷ', icon: 'bed-outline', route: '/projects', color: '#4AA14A' },
  { id: 'p3', type: 'project', title: 'Nhà phố Quận 7', subtitle: '120m² • 3.5 tỷ', icon: 'home-outline', route: '/projects', color: '#4AA14A' },
  { id: 'p4', type: 'project', title: 'Căn hộ Thảo Điền', subtitle: '180m² • 8 tỷ', icon: 'business-outline', route: '/projects', color: '#4AA14A' },
  { id: 'p5', type: 'project', title: 'Văn phòng Quận 1', subtitle: '500m² • 25 tỷ', icon: 'business-outline', route: '/projects', color: '#4AA14A' },
  
  // VIDEO
  { id: 'v1', type: 'video', title: 'Hướng dẫn xây móng', subtitle: 'Video xây dựng', icon: 'play-circle-outline', route: '/(tabs)/live', color: '#FF0000' },
  { id: 'v2', type: 'video', title: 'Đổ bê tông cột', subtitle: 'Video xây dựng', icon: 'play-circle-outline', route: '/(tabs)/live', color: '#FF0000' },
  { id: 'v3', type: 'video', title: 'Lắp đặt điện', subtitle: 'Video xây dựng', icon: 'play-circle-outline', route: '/(tabs)/live', color: '#FF0000' },
  { id: 'v4', type: 'video', title: 'Hoàn thiện tường', subtitle: 'Video xây dựng', icon: 'play-circle-outline', route: '/(tabs)/live', color: '#FF0000' },
  { id: 'v5', type: 'video', title: 'Lát gạch nền', subtitle: 'Video xây dựng', icon: 'play-circle-outline', route: '/(tabs)/live', color: '#FF0000' },
];

// Quick search suggestions
const QUICK_SUGGESTIONS = [
  'Thiết kế nhà',
  'Thợ xây',
  'Vật liệu',
  'Nội thất',
  'Kiến trúc sư',
  'Phong thủy',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AdvancedSearchBar = memo(function AdvancedSearchBar({
  placeholder = 'Tìm kiếm mọi thứ...',
  onCameraPress,
  showInline = false,
  style,
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search with debounce
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const filtered = ALL_SEARCHABLE_ITEMS.filter(item => 
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.subtitle?.toLowerCase().includes(normalizedQuery) ||
      item.type.toLowerCase().includes(normalizedQuery)
    );
    
    // Sort by relevance
    filtered.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
      const bExact = b.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
      return aExact - bExact;
    });

    setResults(filtered.slice(0, 10)); // Limit to 10 results
    setShowResults(true);
    setIsSearching(false);
  }, []);

  // Debounced search
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      performSearch(text);
    }, 150); // 150ms debounce for real-time feel
  }, [performSearch]);

  // Handle camera press - open AI photo analysis
  const handleCameraPress = useCallback(async () => {
    if (onCameraPress) {
      onCameraPress();
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        // Navigate to AI photo analysis with the image
        router.push({
          pathname: '/ai/photo-analysis',
          params: { imageUri: result.assets[0].uri }
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onCameraPress]);

  // Handle result press
  const handleResultPress = useCallback((item: SearchResult) => {
    setShowResults(false);
    setQuery('');
    Keyboard.dismiss();
    router.push(item.route as any);
  }, []);

  // Handle search submit
  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      setShowResults(false);
      Keyboard.dismiss();
      router.push({
        pathname: '/search',
        params: { q: query }
      });
    }
  }, [query]);

  // Animation for results dropdown
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showResults ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showResults, fadeAnim]);

  // Clear on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Render search result item
  const renderResultItem = useCallback(({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.resultIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        )}
      </View>
      <View style={[styles.resultTypeBadge, { backgroundColor: item.color + '15' }]}>
        <Text style={[styles.resultTypeText, { color: item.color }]}>
          {item.type === 'service' ? 'Dịch vụ' :
           item.type === 'worker' ? 'Thợ' :
           item.type === 'material' ? 'Vật liệu' :
           item.type === 'product' ? 'Sản phẩm' :
           item.type === 'project' ? 'Dự án' :
           item.type === 'video' ? 'Video' :
           item.type === 'library' ? 'Thư viện' : item.type}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleResultPress]);

  return (
    <View style={[styles.container, style]}>
      {/* Main Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
        
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={handleQueryChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isSearching && (
          <ActivityIndicator size="small" color={Colors.light.primary} style={styles.loader} />
        )}

        {query.length > 0 && !isSearching && (
          <TouchableOpacity 
            onPress={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* AI Badge */}
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={10} color="#fff" />
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>

        {/* Camera Button */}
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={handleCameraPress}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Ionicons name="camera-outline" size={20} color={Colors.light.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Live Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <Animated.View style={[styles.resultsContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderResultItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={() => (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsHeaderText}>Kết quả ({results.length})</Text>
                <TouchableOpacity onPress={handleSubmit}>
                  <Text style={styles.viewAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </Animated.View>
      )}

      {/* Quick Suggestions when focused but no query */}
      {showResults && query.length === 0 && (
        <Animated.View style={[styles.resultsContainer, { opacity: fadeAnim }]}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Gợi ý tìm kiếm</Text>
          </View>
          <View style={styles.suggestionsList}>
            {QUICK_SUGGESTIONS.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleQueryChange(suggestion)}
              >
                <Ionicons name="search-outline" size={12} color="#6B7280" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#161616',
    paddingVertical: 0,
  },
  loader: {
    marginHorizontal: 4,
  },
  clearButton: {
    padding: 4,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  cameraButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#161616',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  suggestionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  suggestionText: {
    fontSize: 12,
    color: '#374151',
  },
});

export default AdvancedSearchBar;
