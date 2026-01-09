import { Container } from '@/components/ui/container';
import { ProductCard } from '@/components/ui/product-card';
import { SearchBar, SearchSuggestion } from '@/components/ui/search-bar';
import { PRODUCTS } from '@/data/products';
import { useSearchHistory } from '@/hooks/use-search-history';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const POPULAR_SEARCHES = [
  'xi măng',
  'gạch men',
  'sơn',
  'cửa gỗ',
  'điều hòa',
  'nội thất',
  'vật liệu xây',
  'thợ xây',
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { history, addToHistory, clearHistory } = useSearchHistory();

  // Generate suggestions based on query
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    if (!query.trim()) {
      return history.map((text, index) => ({
        id: `history-${index}`,
        text,
        type: 'history' as const,
      }));
    }

    const queryLower = query.toLowerCase();
    const productSuggestions = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(queryLower)
    )
      .slice(0, 5)
      .map(p => ({
        id: `product-${p.id}`,
        text: p.name,
        type: 'product' as const,
      }));

    const popularSuggestions = POPULAR_SEARCHES.filter(s =>
      s.toLowerCase().includes(queryLower)
    ).map((text, index) => ({
      id: `popular-${index}`,
      text,
      type: 'suggestion' as const,
    }));

    return [...productSuggestions, ...popularSuggestions];
  }, [query, history]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const queryLower = query.toLowerCase();
    return PRODUCTS.filter(
      p =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower)
    );
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowResults(true);
    addToHistory(searchQuery);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const handlePopularPress = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSearch={handleSearch}
            suggestions={suggestions}
            showSuggestions={!showResults}
            onSuggestionPress={handleSuggestionPress}
            onClear={() => setShowResults(false)}
            autoFocus
          />
        </View>
      </View>

      {/* Content */}
      {showResults ? (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Tìm thấy {filteredProducts.length} kết quả
            </Text>
            {filteredProducts.length > 0 && (
              <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.productList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
              <Text style={styles.emptyText}>
                Thử tìm kiếm với từ khóa khác
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.defaultContent} showsVerticalScrollIndicator={false}>
          {/* Search History */}
          {history.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagContainer}>
                {history.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handleSearch(item)}
                  >
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.tagText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
            <View style={styles.tagContainer}>
              {POPULAR_SEARCHES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => handlePopularPress(item)}
                >
                  <Ionicons name="trending-up" size={16} color="#0066CC" />
                  <Text style={styles.tagText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh mục nổi bật</Text>
            <View style={styles.categoryGrid}>
              {[
                { name: 'Vật liệu xây', icon: 'cube-outline' },
                { name: 'Điện nước', icon: 'flash-outline' },
                { name: 'Sơn', icon: 'color-palette-outline' },
                { name: 'Gạch men', icon: 'grid-outline' },
                { name: 'Nội thất', icon: 'home-outline' },
                { name: 'Điều hòa', icon: 'snow-outline' },
              ].map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryCard}
                  onPress={() => handlePopularPress(cat.name)}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name={cat.icon as any} size={24} color="#0066CC" />
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  productList: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  defaultContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
    color: '#0066CC',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    borderRadius: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});
