import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock data - Interior design companies
const INTERIOR_COMPANIES = [
  {
    id: 101,
    name: 'Nhà Đẹp Interior',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.png'),
    rating: 4.9,
    reviewCount: 324,
    projectCount: 180,
    startPrice: '3.500.000',
    location: 'Hà Nội',
    styles: ['Hiện đại', 'Tối giản'],
    image: require('@/assets/images/react-logo.png'),
    featured: true,
  },
  {
    id: 102,
    name: 'Luxury Home Design',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.png'),
    rating: 4.8,
    reviewCount: 298,
    projectCount: 150,
    startPrice: '5.000.000',
    location: 'TP.HCM',
    styles: ['Cổ điển', 'Sang trọng'],
    image: require('@/assets/images/react-logo.png'),
    featured: true,
  },
  {
    id: 103,
    name: 'Minimal Space Studio',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.png'),
    rating: 4.7,
    reviewCount: 215,
    projectCount: 120,
    startPrice: '3.000.000',
    location: 'Đà Nẵng',
    styles: ['Tối giản', 'Scandinavian'],
    image: require('@/assets/images/react-logo.png'),
    featured: false,
  },
  {
    id: 104,
    name: 'Classic Interior Vietnam',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.png'),
    rating: 4.6,
    reviewCount: 187,
    projectCount: 95,
    startPrice: '4.000.000',
    location: 'Hà Nội',
    styles: ['Cổ điển', 'Indochine'],
    image: require('@/assets/images/react-logo.png'),
    featured: false,
  },
  {
    id: 105,
    name: 'Urban Living Design',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.png'),
    rating: 4.8,
    reviewCount: 256,
    projectCount: 140,
    startPrice: '3.800.000',
    location: 'TP.HCM',
    styles: ['Hiện đại', 'Industrial'],
    image: require('@/assets/images/react-logo.png'),
    featured: false,
  },
];

const LOCATIONS = ['Tất cả', 'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ'];
const STYLES = [
  'Tất cả',
  'Hiện đại',
  'Cổ điển',
  'Tối giản',
  'Scandinavian',
  'Industrial',
  'Indochine',
  'Sang trọng',
];
const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 3 triệu', min: 0, max: 3000000 },
  { label: '3-5 triệu', min: 3000000, max: 5000000 },
  { label: 'Trên 5 triệu', min: 5000000, max: Infinity },
];

export default function InteriorDesignScreen() {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedStyle, setSelectedStyle] = useState('Tất cả');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  const filteredCompanies = INTERIOR_COMPANIES.filter((company) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || company.location === selectedLocation;
    const price = parseFloat(company.startPrice.replace(/\./g, ''));
    const matchPrice =
      price >= PRICE_RANGES[selectedPriceRange].min &&
      price <= PRICE_RANGES[selectedPriceRange].max;
    const matchSearch =
      searchQuery === '' ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStyle =
      selectedStyle === 'Tất cả' || company.styles.includes(selectedStyle);
    const matchFeatured = !showFeatured || company.featured;
    return matchLocation && matchPrice && matchSearch && matchStyle && matchFeatured;
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thiết kế nội thất',
          headerStyle: { backgroundColor: '#ee4d2d' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm công ty thiết kế nội thất..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.featuredButton, showFeatured && styles.featuredButtonActive]}
            onPress={() => setShowFeatured(!showFeatured)}
          >
            <Ionicons
              name={showFeatured ? 'star' : 'star-outline'}
              size={18}
              color={showFeatured ? '#fff' : '#ee4d2d'}
            />
            <Text
              style={[
                styles.featuredButtonText,
                showFeatured && styles.featuredButtonTextActive,
              ]}
            >
              Nổi bật
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section - All in one row */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.filterChip,
                  selectedStyle === style && styles.filterChipActive,
                ]}
                onPress={() => setSelectedStyle(style)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStyle === style && styles.filterChipTextActive,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
            
            {LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.filterChip,
                  selectedLocation === location && styles.filterChipActive,
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedLocation === location && styles.filterChipTextActive,
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
            
            {PRICE_RANGES.map((range, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterChip,
                  selectedPriceRange === index && styles.filterChipActive,
                ]}
                onPress={() => setSelectedPriceRange(index)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedPriceRange === index && styles.filterChipTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Company List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredCompanies.map((company) => (
            <TouchableOpacity
              key={company.id}
              style={styles.companyCard}
              onPress={() => {
                router.push(`/services/company-detail?id=${company.id}`);
              }}
            >
              {/* Featured Badge */}
              {company.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.featuredBadgeText}>Nổi bật</Text>
                </View>
              )}

              {/* Company Image */}
              <Image source={company.image} style={styles.companyImage} />

              {/* Company Info */}
              <View style={styles.companyInfo}>
                {/* Header */}
                <View style={styles.companyHeader}>
                  <Image source={company.logo} style={styles.companyLogo} />
                  <View style={styles.companyNameSection}>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {company.name}
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={12} color="#666" />
                      <Text style={styles.locationText}>{company.location}</Text>
                    </View>
                  </View>
                </View>

                {/* Rating & Projects */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={14} color="#ee4d2d" />
                    <Text style={styles.ratingText}>{company.rating}</Text>
                    <Text style={styles.reviewText}>({company.reviewCount})</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <Ionicons name="images-outline" size={14} color="#666" />
                    <Text style={styles.projectText}>{company.projectCount} dự án</Text>
                  </View>
                </View>

                {/* Styles */}
                <View style={styles.styleRow}>
                  {company.styles.map((style, idx) => (
                    <View key={idx} style={styles.styleTag}>
                      <Text style={styles.styleText}>{style}</Text>
                    </View>
                  ))}
                </View>

                {/* Price & Button */}
                <View style={styles.footer}>
                  <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Từ</Text>
                    <Text style={styles.priceValue}>{company.startPrice}₫</Text>
                    <Text style={styles.priceUnit}>/m²</Text>
                  </View>
                  <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                    <Text style={styles.contactButtonText}>Tư vấn</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty State */}
          {filteredCompanies.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedLocation('Tất cả');
                  setSelectedStyle('Tất cả');
                  setSelectedPriceRange(0);
                  setSearchQuery('');
                  setShowFeatured(false);
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ee4d2d',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  featuredButtonActive: {
    backgroundColor: '#ee4d2d',
  },
  featuredButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ee4d2d',
    marginLeft: 4,
  },
  featuredButtonTextActive: {
    color: '#fff',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  filterScroll: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#ee4d2d',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  companyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
  },
  companyImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  companyInfo: {
    padding: 12,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  companyNameSection: {
    flex: 1,
    marginLeft: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ee4d2d',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  projectText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  styleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  styleTag: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  styleText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ee4d2d',
  },
  priceUnit: {
    fontSize: 12,
    color: '#999',
    marginLeft: 2,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

