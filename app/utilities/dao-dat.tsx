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
    View,
} from 'react-native';

// Mock data - Excavation Providers
const PROVIDERS = [
  {
    id: 1,
    name: 'Công ty Đào đất Hoàng Long',
    avatar: 'https://via.placeholder.com/100x100/ff9800/ffffff?text=HL',
    rating: 4.7,
    reviews: 142,
    location: 'TP.HCM',
    experience: 12,
    price: '180.000₫',
    priceUnit: '/ m³',
    services: ['Đào móng', 'Đào hố thang máy', 'San lấp mặt bằng', 'Vận chuyển đất'],
    equipment: ['Máy đào PC200', 'Máy ủi D6', 'Xe ben 15 tấn'],
    completedProjects: 180,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '028 3850 2345',
  },
  {
    id: 2,
    name: 'Đào đất Miền Bắc',
    avatar: 'https://via.placeholder.com/100x100/4caf50/ffffff?text=MB',
    rating: 4.8,
    reviews: 165,
    location: 'Hà Nội',
    experience: 15,
    price: '200.000₫',
    priceUnit: '/ m³',
    services: ['Đào móng', 'Đào hầm', 'San lấp', 'Đào ao hồ'],
    equipment: ['Máy đào PC300', 'Máy ủi D7', 'Xe ben 20 tấn'],
    completedProjects: 250,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '024 3974 6789',
  },
  {
    id: 3,
    name: 'Thi Công Thành Đạt',
    avatar: 'https://via.placeholder.com/100x100/2196f3/ffffff?text=TD',
    rating: 4.5,
    reviews: 98,
    location: 'Đà Nẵng',
    experience: 10,
    price: '170.000₫',
    priceUnit: '/ m³',
    services: ['Đào móng', 'San lấp mặt bằng', 'Vận chuyển đất'],
    equipment: ['Máy đào PC160', 'Xe ben 10 tấn'],
    completedProjects: 120,
    featured: false,
    availability: 'Sẵn sàng',
    phone: '0236 3850 5678',
  },
  {
    id: 4,
    name: 'Đào Đất Phương Nam',
    avatar: 'https://via.placeholder.com/100x100/9c27b0/ffffff?text=PN',
    rating: 4.6,
    reviews: 112,
    location: 'Cần Thơ',
    experience: 8,
    price: '150.000₫',
    priceUnit: '/ m³',
    services: ['Đào móng nhà ở', 'San lấp', 'Đào ao'],
    equipment: ['Máy đào PC120', 'Xe ben 8 tấn'],
    completedProjects: 95,
    featured: false,
    availability: 'Bận (khả dụng từ 10/11)',
    phone: '0292 3850 7890',
  },
];

const LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const SERVICE_TYPES = ['Tất cả', 'Đào móng', 'San lấp', 'Đào hầm', 'Đào ao hồ', 'Vận chuyển đất'];

interface ProviderCardProps {
  provider: any;
  onBooking: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onBooking }) => {
  return (
    <TouchableOpacity style={styles.providerCard} activeOpacity={0.8}>
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

      <View style={styles.servicesSection}>
        <Text style={styles.servicesLabel}>Dịch vụ:</Text>
        <View style={styles.servicesTags}>
          {provider.services.slice(0, 3).map((service: string, index: number) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.equipmentRow}>
        <Ionicons name="construct" size={16} color="#2196f3" />
        <Text style={styles.equipmentText}>
          {provider.equipment.join(', ')}
        </Text>
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
        
        <TouchableOpacity style={styles.bookButton} onPress={onBooking}>
          <Ionicons name="calendar" size={16} color="#fff" />
          <Text style={styles.bookButtonText}>Đặt dịch vụ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function DaoDatScreen() {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedServiceType, setSelectedServiceType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    volume: '',
    serviceType: '',
    startDate: '',
    notes: '',
  });

  const filteredProviders = PROVIDERS.filter((provider) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || provider.location === selectedLocation;
    const matchServiceType =
      selectedServiceType === 'Tất cả' ||
      provider.services.some((s: string) =>
        s.toLowerCase().includes(selectedServiceType.toLowerCase())
      );
    const matchSearch =
      searchQuery === '' ||
      provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchServiceType && matchSearch;
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
              volume: '',
              serviceType: '',
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
          title: 'Dịch vụ Đào đất',
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
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Khu vực:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Dịch vụ:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedServiceType === type && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedServiceType(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedServiceType === type && styles.filterChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>{filteredProviders.length} nhà cung cấp</Text>
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
              onBooking={() => handleBooking(provider)}
            />
          ))}

          {filteredProviders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy nhà cung cấp phù hợp</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#2196f3" />
          <Text style={styles.infoBannerText}>
            Báo giá miễn phí • Hotline: 1900 123 456
          </Text>
        </View>
      </View>

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
              <Text style={styles.bookingModalTitle}>Đặt dịch vụ đào đất</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookingModalBody}>
              {selectedProvider && (
                <View style={styles.selectedProviderInfo}>
                  <Image source={{ uri: selectedProvider.avatar }} style={styles.selectedAvatar} />
                  <View style={styles.selectedProviderText}>
                    <Text style={styles.selectedProviderName}>{selectedProvider.name}</Text>
                    <View style={styles.selectedRating}>
                      <Ionicons name="star" size={14} color="#ffa41c" />
                      <Text style={styles.selectedRatingText}>
                        {selectedProvider.rating} ({selectedProvider.reviews})
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Họ và tên <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nguyễn Văn A"
                    value={bookingData.name}
                    onChangeText={(text) => setBookingData({ ...bookingData, name: text })}
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
                    onChangeText={(text) => setBookingData({ ...bookingData, phone: text })}
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
                    onChangeText={(text) => setBookingData({ ...bookingData, address: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Khối lượng dự kiến (m³)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: 100"
                    keyboardType="numeric"
                    value={bookingData.volume}
                    onChangeText={(text) => setBookingData({ ...bookingData, volume: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Loại dịch vụ</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Đào móng"
                    value={bookingData.serviceType}
                    onChangeText={(text) => setBookingData({ ...bookingData, serviceType: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ngày dự kiến thi công</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    value={bookingData.startDate}
                    onChangeText={(text) => setBookingData({ ...bookingData, startDate: text })}
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
                    onChangeText={(text) => setBookingData({ ...bookingData, notes: text })}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBooking}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchSection: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  filterSection: { backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#666', width: 85, paddingLeft: 16 },
  filterScroll: { flex: 1 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f5f5f5', marginHorizontal: 4 },
  filterChipActive: { backgroundColor: '#ee4d2d' },
  filterChipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  resultsBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  resultsText: { fontSize: 13, fontWeight: '600', color: '#333' },
  content: { flex: 1 },
  listContainer: { padding: 16 },
  providerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  featuredBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ee4d2d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1, gap: 4 },
  featuredText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 12 },
  providerName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#333' },
  reviewsText: { fontSize: 12, color: '#999' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#999' },
  divider: { width: 1, height: 12, backgroundColor: '#e0e0e0', marginHorizontal: 6 },
  experienceText: { fontSize: 12, color: '#999' },
  servicesSection: { marginBottom: 12 },
  servicesLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  servicesTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  serviceTag: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  serviceText: { fontSize: 11, fontWeight: '500', color: '#2196f3' },
  equipmentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  equipmentText: { fontSize: 12, color: '#666', flex: 1 },
  statsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12, marginBottom: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  available: { color: '#4caf50' },
  busy: { color: '#ff9800' },
  statLabel: { fontSize: 11, color: '#999' },
  statDivider: { width: 1, height: 40, backgroundColor: '#f0f0f0' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { fontSize: 12, color: '#999' },
  price: { fontSize: 18, fontWeight: '700', color: '#ee4d2d' },
  priceUnit: { fontSize: 12, color: '#999' },
  bookButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ee4d2d', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
  bookButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 16 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  infoBannerText: { fontSize: 12, color: '#2196f3', flex: 1 },
  bookingModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bookingModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  bookingModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  bookingModalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  bookingModalBody: { padding: 16 },
  selectedProviderInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 20 },
  selectedAvatar: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#e0e0e0' },
  selectedProviderText: { flex: 1, marginLeft: 12 },
  selectedProviderName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  selectedRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedRatingText: { fontSize: 12, color: '#666' },
  form: { marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#ee4d2d' },
  formInput: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#e0e0e0' },
  formTextArea: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#ee4d2d', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  formNote: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
});
