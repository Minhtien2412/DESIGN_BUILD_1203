import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useLaborProviders } from '@/hooks/useLaborProviders';
import { LaborProvider } from '@/services/api/labor.service';

const LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const PILE_TYPES = ['Tất cả', 'D250', 'D300', 'D350', 'D400', 'D450'];
const SORT_OPTIONS = [
  { label: 'Đề xuất', value: 'featured' },
  { label: 'Đánh giá cao', value: 'rating' },
  { label: 'Giá thấp', value: 'price_asc' },
  { label: 'Giá cao', value: 'price_desc' },
  { label: 'Kinh nghiệm', value: 'experience' },
];

interface ProviderCardProps {
  provider: LaborProvider;
  onPress: () => void;
  onBooking: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onPress, onBooking }) => {
  const availabilityText = provider.availability === 'available' ? 'Sẵn sàng' : provider.availability === 'busy' ? 'Đang bận' : 'Không khả dụng';
  const priceDisplay = `${provider.priceRange.min.toLocaleString('vi-VN')}₫`;
  // Extract pile types from services (e.g., "Ép cọc D250" -> "D250")
  const pileTypes = provider.services.filter(s => s.includes('D')).map(s => {
    const match = s.match(/D\d+/);
    return match ? match[0] : s;
  });
  
  return (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {provider.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.featuredText}>Đề xuất</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <Image source={{ uri: provider.avatar }} style={styles.avatar} />
        
        <View style={styles.headerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#0D9488" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewsText}>({provider.reviewCount})</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#999" />
            <Text style={styles.locationText}>{provider.city}</Text>
            <View style={styles.divider} />
            <Ionicons name="briefcase" size={12} color="#999" />
            <Text style={styles.experienceText}>{provider.yearExperience} năm</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="construct" size={16} color="#0D9488" />
          <Text style={styles.infoLabel}>Loại cọc: </Text>
          <Text style={styles.infoValue}>{pileTypes.length > 0 ? pileTypes.join(', ') : provider.services.slice(0, 3).join(', ')}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="hardware-chip" size={16} color="#0D9488" />
          <Text style={styles.infoLabel}>Dịch vụ: </Text>
          <Text style={styles.infoValue}>{provider.services.slice(0, 2).join(', ')}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.projectCount}+</Text>
          <Text style={styles.statLabel}>Dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              provider.availability === 'available' ? styles.available : styles.busy,
            ]}
          >
            {availabilityText}
          </Text>
          <Text style={styles.statLabel}>Tình trạng</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>Từ</Text>
          <Text style={styles.price}>{priceDisplay}</Text>
          <Text style={styles.priceUnit}>/ {provider.priceRange.unit}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.bookButton}
          onPress={onBooking}
        >
          <Ionicons name="calendar" size={16} color="#fff" />
          <Text style={styles.bookButtonText}>Đặt dịch vụ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function EpCocScreen() {
  const { providers, loading, refreshing, refresh, searchProviders } = useLaborProviders({ type: 'ep-coc' });
  
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedPileType, setSelectedPileType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LaborProvider | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    pileCount: '',
    pileType: '',
    startDate: '',
    notes: '',
  });

  const filteredProviders = providers.filter((provider) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || provider.city === selectedLocation || provider.address.includes(selectedLocation);
    const matchPileType =
      selectedPileType === 'Tất cả' ||
      provider.services.some(s => s.includes(selectedPileType));
    const matchSearch =
      searchQuery === '' ||
      provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchPileType && matchSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (a.featured === b.featured) return b.rating - a.rating;
        return b.featured ? 1 : -1;
      case 'rating':
        return b.rating - a.rating;
      case 'price_asc':
        return a.priceRange.min - b.priceRange.min;
      case 'price_desc':
        return b.priceRange.min - a.priceRange.min;
      case 'experience':
        return b.yearExperience - a.yearExperience;
      default:
        return 0;
    }
  });

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchProviders(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProviders]);

  const handleBooking = (provider: LaborProvider) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingData.name || !bookingData.phone || !bookingData.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    Alert.alert(
      'Đặt dịch vụ thành công',
      `Chúng tôi sẽ liên hệ với bạn trong vòng 2h.\n\nNhà cung cấp: ${selectedProvider?.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            setBookingData({
              name: '',
              phone: '',
              address: '',
              pileCount: '',
              pileType: '',
              startDate: '',
              notes: '',
            });
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dịch vụ Ép cọc',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        {/* Search & Sort Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm nhà cung cấp..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          {/* Location Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Khu vực:</Text>
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
          </View>

          {/* Pile Type Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Loại cọc:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {PILE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedPileType === type && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedPileType(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedPileType === type && styles.filterChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Results Info */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {filteredProviders.length} nhà cung cấp
          </Text>
          <Text style={styles.sortLabel}>
            {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
          </Text>
        </View>

        {/* Providers List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách nhà cung cấp...</Text>
          </View>
        ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
        >
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onPress={() => {}}
              onBooking={() => handleBooking(provider)}
            />
          ))}

          {/* Empty State */}
          {filteredProviders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy nhà cung cấp phù hợp</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedLocation('Tất cả');
                  setSelectedPileType('Tất cả');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#0D9488" />
          <Text style={styles.infoBannerText}>
            Hỗ trợ tư vấn miễn phí • Hotline: 1900 123 456
          </Text>
        </View>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalContent}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.bookingModalOverlay}>
          <View style={styles.bookingModalContent}>
            <View style={styles.bookingModalHeader}>
              <Text style={styles.bookingModalTitle}>Đặt dịch vụ ép cọc</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookingModalBody}>
              {/* Provider Info */}
              {selectedProvider && (
                <View style={styles.selectedProviderInfo}>
                  <Image
                    source={{ uri: selectedProvider.avatar }}
                    style={styles.selectedAvatar}
                  />
                  <View style={styles.selectedProviderText}>
                    <Text style={styles.selectedProviderName}>
                      {selectedProvider.name}
                    </Text>
                    <View style={styles.selectedRating}>
                      <Ionicons name="star" size={14} color="#0D9488" />
                      <Text style={styles.selectedRatingText}>
                        {selectedProvider.rating} ({selectedProvider.reviewCount})
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Họ và tên <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nguyễn Văn A"
                    value={bookingData.name}
                    onChangeText={(text) =>
                      setBookingData({ ...bookingData, name: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Số điện thoại <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0901234567"
                    keyboardType="phone-pad"
                    value={bookingData.phone}
                    onChangeText={(text) =>
                      setBookingData({ ...bookingData, phone: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Địa chỉ công trình <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Địa chỉ đầy đủ"
                    multiline
                    numberOfLines={3}
                    value={bookingData.address}
                    onChangeText={(text) =>
                      setBookingData({ ...bookingData, address: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Số lượng cọc dự kiến</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: 50"
                    keyboardType="numeric"
                    value={bookingData.pileCount}
                    onChangeText={(text) =>
                      setBookingData({ ...bookingData, pileCount: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Loại cọc</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: D300"
                    value={bookingData.pileType}
                    onChangeText={(text) =>
                      setBookingData({ ...bookingData, pileType: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ngày dự kiến thi công</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    value={bookingData.startDate}
                    onChangeText={(text) =>
                      setBookingData({ ...bookingData, startDate: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ghi chú</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Yêu cầu hoặc ghi chú thêm..."
                    multiline
                    numberOfLines={4}
                    value={bookingData.notes}
                    onChangeText={(text) =>
                      setBookingData({ ...bookingData, notes: text })
                    }
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitBooking}
              >
                <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
              </TouchableOpacity>

              <Text style={styles.formNote}>
                * Thông tin của bạn sẽ được bảo mật tuyệt đối
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  sortButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 85,
    paddingLeft: 16,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  sortLabel: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  reviewsText: {
    fontSize: 12,
    color: '#999',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 6,
  },
  experienceText: {
    fontSize: 12,
    color: '#999',
  },
  infoSection: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  available: {
    color: '#0D9488',
  },
  busy: {
    color: '#0D9488',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: '#999',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#0D9488',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333',
  },
  sortOptionTextActive: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
  bookingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bookingModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  bookingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bookingModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  bookingModalBody: {
    padding: 16,
  },
  selectedProviderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  selectedProviderText: {
    flex: 1,
    marginLeft: 12,
  },
  selectedProviderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  selectedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedRatingText: {
    fontSize: 12,
    color: '#666',
  },
  form: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: Colors.light.primary,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  formNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
});
