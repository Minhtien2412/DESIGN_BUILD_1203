import { Colors } from '@/constants/theme';
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

// Mock data - sẽ thay bằng API sau
const DESIGN_COMPANIES = [
  {
    id: 1,
    name: 'Công ty Thiết kế A&A',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
    rating: 4.8,
    reviewCount: 256,
    projectCount: 150,
    startPrice: '5.000.000',
    location: 'Hà Nội',
    specialties: ['Biệt thự', 'Nhà phố'],
    image: require('@/assets/images/react-logo.webp'),
  },
  {
    id: 2,
    name: 'Kiến trúc Việt',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
    rating: 4.9,
    reviewCount: 412,
    projectCount: 200,
    startPrice: '7.000.000',
    location: 'TP.HCM',
    specialties: ['Nhà vườn', 'Resort'],
    image: require('@/assets/images/react-logo.webp'),
  },
  {
    id: 3,
    name: 'Homespace Design',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
    rating: 4.7,
    reviewCount: 189,
    projectCount: 120,
    startPrice: '4.500.000',
    location: 'Đà Nẵng',
    specialties: ['Căn hộ', 'Chung cư'],
    image: require('@/assets/images/react-logo.webp'),
  },
  {
    id: 4,
    name: 'Kiến Việt Architecture',
    logo: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
    rating: 4.6,
    reviewCount: 145,
    projectCount: 95,
    startPrice: '6.000.000',
    location: 'Hà Nội',
    specialties: ['Nhà cấp 4', 'Nhà 2 tầng'],
    image: require('@/assets/images/react-logo.webp'),
  },
];

const LOCATIONS = ['Tất cả', 'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ'];
const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { label: '5-10 triệu', min: 5000000, max: 10000000 },
  { label: 'Trên 10 triệu', min: 10000000, max: Infinity },
];

export default function HouseDesignScreen() {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = DESIGN_COMPANIES.filter((company) => {
    const matchLocation = selectedLocation === 'Tất cả' || company.location === selectedLocation;
    const price = parseFloat(company.startPrice.replace(/\./g, ''));
    const matchPrice =
      price >= PRICE_RANGES[selectedPriceRange].min &&
      price <= PRICE_RANGES[selectedPriceRange].max;
    const matchSearch =
      searchQuery === '' ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchPrice && matchSearch;
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thiết kế nhà',
          headerStyle: { backgroundColor: Colors.light.primary },
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
              placeholder="Tìm công ty thiết kế..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          {/* Location Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
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
          </ScrollView>

          {/* Price Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
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
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredCompanies.map((company) => (
            <TouchableOpacity
              key={company.id}
              style={styles.companyCard}
              onPress={() => {
                // Navigate to company detail
                router.push(`/services/company-detail?id=${company.id}`);
              }}
            >
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
                    <Ionicons name="star" size={14} color={Colors.light.primary} />
                    <Text style={styles.ratingText}>{company.rating}</Text>
                    <Text style={styles.reviewText}>({company.reviewCount})</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statItem}>
                    <Ionicons name="briefcase-outline" size={14} color="#666" />
                    <Text style={styles.projectText}>{company.projectCount} dự án</Text>
                  </View>
                </View>

                {/* Specialties */}
                <View style={styles.specialtyRow}>
                  {company.specialties.map((specialty, idx) => (
                    <View key={idx} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>

                {/* Price & Button */}
                <View style={styles.footer}>
                  <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Từ</Text>
                    <Text style={styles.priceValue}>{company.startPrice}₫</Text>
                  </View>
                  <TouchableOpacity style={styles.contactButton}>
                    <Text style={styles.contactButtonText}>Liên hệ</Text>
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
                  setSelectedPriceRange(0);
                  setSearchQuery('');
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
  },
  searchBar: {
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
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    backgroundColor: Colors.light.primary,
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
    color: Colors.light.primary,
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
  specialtyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 11,
    color: Colors.light.primary,
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
    color: Colors.light.primary,
  },
  contactButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: Colors.light.primary,
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
