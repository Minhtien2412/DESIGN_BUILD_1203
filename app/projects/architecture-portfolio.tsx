import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import PortfolioService, {
    type ArchitectureProject,
    PORTFOLIO_CATEGORIES,
} from '@/services/portfolioService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ArchitecturePortfolioScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const warningColor = useThemeColor({}, 'warning');
  const inverseText = useThemeColor({}, 'textInverse');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Biệt thự');
  const [projects, setProjects] = useState<ArchitectureProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount and when category/search changes
  const fetchProjects = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      
      const data = await PortfolioService.getPortfolioProjects(
        selectedCategory,
        searchQuery || undefined
      );
      setProjects(data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects(true);
  }, [fetchProjects]);

  const renderProjectCard = ({ item }: { item: ArchitectureProject }) => (
    <TouchableOpacity
      style={[styles.projectCard, { borderColor: borderColor, backgroundColor: surfaceColor }]}
      onPress={() => {
        // Navigate to project detail
        router.push(`/projects/architecture/${item.id}`);
      }}
    >
      <Image source={{ uri: item.image }} style={[styles.projectImage, { backgroundColor: surfaceAlt }]} />
      
      <View style={styles.projectInfo}>
        <Text style={[styles.projectTitle, { color: textColor }]}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={mutedColor} />
          <Text style={[styles.locationText, { color: mutedColor }]}>
            {item.location} - {item.district}, {item.city}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={warningColor} />
          <Text style={[styles.ratingText, { color: textColor }]}>
            {item.rating}
          </Text>
          <Text style={[styles.reviewsText, { color: mutedColor }]}>
            ({item.reviews} Đánh giá)
          </Text>
        </View>

        {/* Specs */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.bedrooms} Phòng ngủ
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.bathrooms} Phòng tắm
            </Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="tv-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.livingRooms} Phòng khách
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="restaurant-outline" size={20} color={primaryColor} />
            <Text style={[styles.specText, { color: textColor }]}>
              {item.kitchens} Phòng bếp
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container style={{ backgroundColor }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { borderColor: borderColor, backgroundColor: surfaceMuted }]}>
          <Ionicons name="search" size={20} color={mutedColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm loại công trình/ dự án..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.searchIconButton}>
          <Ionicons name="funnel-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Error Banner */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={[styles.errorText, { color: '#DC2626' }]}>{error}</Text>
            <TouchableOpacity onPress={() => fetchProjects()}>
              <Text style={{ color: primaryColor, fontWeight: '600' }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Tabs */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {PORTFOLIO_CATEGORIES.map(category => {
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor: isSelected ? primaryColor : 'transparent',
                        borderBottomWidth: isSelected ? 3 : 0,
                        borderBottomColor: primaryColor,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: isSelected ? inverseText : textColor,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Projects List */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Nổi bật trong tuần
        </Text>

        {/* Loading State */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: mutedColor }]}>
              Đang tải...
            </Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            renderItem={renderProjectCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="home-outline" size={48} color={mutedColor} />
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  Chưa có dự án nào
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={[styles.viewMoreButton, { borderColor: primaryColor }]}
        >
          <Text style={[styles.viewMoreText, { color: primaryColor }]}>
            Xem thêm
          </Text>
          <Ionicons name="chevron-down" size={20} color={primaryColor} />
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  searchIconButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  projectImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E0E0E0',
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 13,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  specText: {
    fontSize: 13,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
});
