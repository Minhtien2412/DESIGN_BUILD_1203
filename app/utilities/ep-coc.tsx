import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Mock data - Pile Driving Providers
const PROVIDERS = [
  {
    id: 1,
    name: 'Công ty Ép Cọc Miền Nam',
    avatar: 'https://via.placeholder.com/100x100/ee4d2d/ffffff?text=MIEN+NAM',
    rating: 4.8,
    reviews: 156,
    location: 'TP.HCM',
    experience: 15,
    price: '850.000₫',
    priceUnit: '/ cây',
    pileTypes: ['D250', 'D300', 'D350', 'D400'],
    equipment: ['Máy ép 60 tấn', 'Máy ép 80 tấn'],
    completedProjects: 280,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '028 3850 1234',
    services: [
      { id: 1, name: 'Ép cọc D250', price: '650.000₫', unit: '/ cây' },
      { id: 2, name: 'Ép cọc D300', price: '850.000₫', unit: '/ cây' },
      { id: 3, name: 'Ép cọc D350', price: '1.200.000₫', unit: '/ cây' },
      { id: 4, name: 'Ép cọc D400', price: '1.500.000₫', unit: '/ cây' },
    ],
    description: 'Chuyên ép cọc bê tông ly tâm cho công trình dân dụng và công nghiệp. Đội ngũ kỹ thuật viên giàu kinh nghiệm, thiết bị hiện đại.',
  },
  {
    id: 2,
    name: 'Ép Cọc Thành Đạt',
    avatar: 'https://via.placeholder.com/100x100/4caf50/ffffff?text=TD',
    rating: 4.6,
    reviews: 98,
    location: 'Hà Nội',
    experience: 12,
    price: '800.000₫',
    priceUnit: '/ cây',
    pileTypes: ['D250', 'D300', 'D350'],
    equipment: ['Máy ép 60 tấn', 'Máy ép 100 tấn'],
    completedProjects: 200,
    featured: false,
    availability: 'Sẵn sàng',
    phone: '024 3974 5678',
    services: [
      { id: 1, name: 'Ép cọc D250', price: '600.000₫', unit: '/ cây' },
      { id: 2, name: 'Ép cọc D300', price: '800.000₫', unit: '/ cây' },
      { id: 3, name: 'Ép cọc D350', price: '1.100.000₫', unit: '/ cây' },
    ],
    description: 'Thi công ép cọc nhanh chóng, an toàn. Cam kết chất lượng, bảo hành dài hạn.',
  },
  {
    id: 3,
    name: 'Xây Dựng Hòa Bình',
    avatar: 'https://via.placeholder.com/100x100/2196f3/ffffff?text=HB',
    rating: 4.9,
    reviews: 215,
    location: 'Đà Nẵng',
    experience: 18,
    price: '900.000₫',
    priceUnit: '/ cây',
    pileTypes: ['D250', 'D300', 'D350', 'D400', 'D450'],
    equipment: ['Máy ép 80 tấn', 'Máy ép 120 tấn'],
    completedProjects: 350,
    featured: true,
    availability: 'Bận (khả dụng từ 15/11)',
    phone: '0236 3850 9012',
    services: [
      { id: 1, name: 'Ép cọc D250', price: '700.000₫', unit: '/ cây' },
      { id: 2, name: 'Ép cọc D300', price: '900.000₫', unit: '/ cây' },
      { id: 3, name: 'Ép cọc D350', price: '1.250.000₫', unit: '/ cây' },
      { id: 4, name: 'Ép cọc D400', price: '1.600.000₫', unit: '/ cây' },
    ],
    description: 'Đơn vị hàng đầu miền Trung, chuyên ép cọc các công trình lớn. Có đầy đủ giấy phép và chứng chỉ.',
  },
  {
    id: 4,
    name: 'Ép Cọc Việt Tín',
    avatar: 'https://via.placeholder.com/100x100/ff9800/ffffff?text=VT',
    rating: 4.5,
    reviews: 87,
    location: 'Cần Thơ',
    experience: 10,
    price: '750.000₫',
    priceUnit: '/ cây',
    pileTypes: ['D250', 'D300'],
    equipment: ['Máy ép 60 tấn'],
    completedProjects: 150,
    featured: false,
    availability: 'Sẵn sàng',
    phone: '0292 3850 3456',
    services: [
      { id: 1, name: 'Ép cọc D250', price: '580.000₫', unit: '/ cây' },
      { id: 2, name: 'Ép cọc D300', price: '750.000₫', unit: '/ cây' },
    ],
    description: 'Dịch vụ ép cọc cho nhà ở riêng lẻ, nhà phố. Giá cả hợp lý, thi công nhanh.',
  },
];

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
  provider: any;
  onPress: () => void;
  onBooking: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onPress, onBooking }) => {
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
            <Ionicons name="star" size={14} color="#ffa41c" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewsText}>({provider.reviews})</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#999" />
            <Text style={styles.locationText}>{provider.location}</Text>
            <View style={styles.divider} />
            <Ionicons name="briefcase" size={12} color="#999" />
            <Text style={styles.experienceText}>{provider.experience} năm</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="construct" size={16} color="#2196f3" />
          <Text style={styles.infoLabel}>Loại cọc: </Text>
          <Text style={styles.infoValue}>{provider.pileTypes.join(', ')}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="hardware-chip" size={16} color="#4caf50" />
          <Text style={styles.infoLabel}>Thiết bị: </Text>
          <Text style={styles.infoValue}>{provider.equipment.join(', ')}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.completedProjects}+</Text>
          <Text style={styles.statLabel}>Dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              provider.availability === 'Sẵn sàng' ? styles.available : styles.busy,
            ]}
          >
            {provider.availability}
          </Text>
          <Text style={styles.statLabel}>Tình trạng</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>Từ</Text>
          <Text style={styles.price}>{provider.price}</Text>
          <Text style={styles.priceUnit}>{provider.priceUnit}</Text>
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
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedPileType, setSelectedPileType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
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

  const filteredProviders = PROVIDERS.filter((provider) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || provider.location === selectedLocation;
    const matchPileType =
      selectedPileType === 'Tất cả' ||
      provider.pileTypes.includes(selectedPileType);
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
        return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''));
      case 'price_desc':
        return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''));
      case 'experience':
        return b.experience - a.experience;
      default:
        return 0;
    }
  });

  const handleBooking = (provider: any) => {
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
      `Chúng tôi sẽ liên hệ với bạn trong vòng 2h.\n\nNhà cung cấp: ${selectedProvider.name}`,
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
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
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

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#2196f3" />
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
                      <Ionicons name="star" size={14} color="#ffa41c" />
                      <Text style={styles.selectedRatingText}>
                        {selectedProvider.rating} ({selectedProvider.reviews})
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
    color: '#4caf50',
  },
  busy: {
    color: '#ff9800',
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
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#2196f3',
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
