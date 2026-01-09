import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import ContractorService, {
    Contractor,
    CONTRACTOR_CATEGORIES,
    CONTRACTOR_FILTERS,
    LOCATIONS,
    MOCK_CONTRACTORS
} from '@/services/contractorService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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

export default function FindContractorsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const inverseText = useThemeColor({}, 'textInverse');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Load contractors from API
  const loadContractors = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(false);
      
      const data = await ContractorService.searchContractors({
        category: selectedCategory || undefined,
        location: selectedLocation,
        search: searchQuery || undefined,
        minRating: selectedFilters.includes('4 sao trở lên') ? 4 : undefined,
        minExperience: selectedFilters.includes('Trên 10 Năm kinh nghiệm') ? 10 :
                       selectedFilters.includes('1-5 Năm Kinh Nghiệm') ? 1 : undefined,
      });
      setContractors(data);
    } catch (err) {
      console.error('Contractor load error:', err);
      setError(true);
      setContractors(MOCK_CONTRACTORS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContractors();
  }, [selectedCategory, selectedLocation, selectedFilters]);

  const onRefresh = () => {
    setRefreshing(true);
    loadContractors(true);
  };

  const handleSearch = () => {
    loadContractors();
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        <Ionicons name="star" size={14} color={warningColor} />
        <Text style={[styles.ratingText, { color: textColor }]}>{rating}</Text>
      </View>
    );
  };

  const renderContractorCard = ({ item }: { item: Contractor }) => (
    <View style={[styles.contractorCard, { borderColor: borderColor, backgroundColor: surfaceColor }]}>
      {/* Image */}
      <Image
        source={{ uri: item.image }}
        style={[styles.contractorImage, { backgroundColor: surfaceAlt }]}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        {/* Name */}
        <Text style={[styles.contractorName, { color: textColor }]}>
          {item.name}
        </Text>

        {/* Price */}
        <Text style={[styles.contractorPrice, { color: primaryColor }]}>
          {item.price.toLocaleString('vi-VN')} {item.unit}
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {renderStars(item.rating)}
          <Text style={[styles.statText, { color: textColor }]}>
            • {item.experience} năm KN
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Ionicons name="briefcase-outline" size={14} color={mutedColor} />
          <Text style={[styles.statText, { color: textColor }]}>
            Dự án {item.projects}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'available' ? successColor : warningColor,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: inverseText }]}>
              {item.status === 'available' ? 'Đang rảnh' : 'Hẹn lịch'}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: primaryColor }]}
          onPress={() => {
            // Navigate to contractor detail screen (stub route). Replace with real route when available.
            try {
              // Example future route: /projects/contractors/[id]
              // router.push(`/projects/contractors/${item.id}` as const);
              // For now, show a quick info and emulate adding to project
              alert(`Đã chọn ${item.name}`);
            } catch {
              alert(`Đã chọn ${item.name}`);
            }
          }}
        >
          <Text style={[styles.selectButtonText, { color: inverseText }]}>Chọn Thợ Này</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Container style={{ backgroundColor }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { borderColor: borderColor, backgroundColor: surfaceMuted }]}>
          <Ionicons name="search" size={20} color={mutedColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm thợ/ chuyên ngành/ thành phố"
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchIconButton}>
          <Ionicons name="person-circle-outline" size={28} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {loading && !contractors.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: mutedColor }]}>Đang tìm nhà thầu...</Text>
        </View>
      ) : (
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color="#0066CC" />
            <Text style={styles.errorText}>Server không khả dụng - Dùng dữ liệu demo</Text>
          </View>
        )}
        
        {/* Categories */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {CONTRACTOR_CATEGORIES.map(category => {
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? primaryColor : surfaceMuted,
                        borderColor: isSelected ? primaryColor : borderColor,
                      },
                    ]}
                    onPress={() =>
                      setSelectedCategory(isSelected ? '' : category)
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isSelected ? inverseText : textColor },
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

        {/* Filters */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {CONTRACTOR_FILTERS.map(filter => {
                const isSelected = selectedFilters.includes(filter);
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? primaryColor : surfaceColor,
                        borderColor: isSelected ? primaryColor : borderColor,
                      },
                    ]}
                    onPress={() => toggleFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: isSelected ? inverseText : textColor },
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Location Tabs */}
        <View style={styles.section}>
          <View style={styles.locationTabs}>
            {LOCATIONS.map(location => {
              const isSelected = selectedLocation === location;
              return (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationTab,
                    isSelected && {
                      borderBottomWidth: 2,
                      borderBottomColor: primaryColor,
                    },
                  ]}
                  onPress={() => setSelectedLocation(location)}
                >
                  <Text
                    style={[
                      styles.locationText,
                      {
                        color: isSelected ? primaryColor : textColor,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contractors List */}
        <FlatList
          data={contractors}
          renderItem={renderContractorCard}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: '#0066CC',
    fontSize: 13,
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
  section: {
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  locationTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
  },
  locationTab: {
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 15,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  contractorCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  contractorImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E0E0E0',
  },
  cardContent: {
    padding: 12,
  },
  contractorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contractorPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statText: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
