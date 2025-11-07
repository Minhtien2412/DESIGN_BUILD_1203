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
    View,
} from 'react-native';

// Mock data - Material Suppliers
const PROVIDERS = [
  {
    id: 1,
    name: 'Vật Liệu Xây Dựng Hòa Phát',
    avatar: 'https://via.placeholder.com/100x100/ee4d2d/ffffff?text=HP',
    rating: 4.9,
    reviews: 342,
    location: 'TP.HCM',
    experience: 20,
    materials: ['Xi măng', 'Thép', 'Gạch', 'Đá'],
    brands: ['Holcim', 'Hòa Phát', 'Viglacera'],
    completedOrders: 1500,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '028 3850 1111',
    delivery: 'Giao hàng miễn phí bán kính 10km',
  },
  {
    id: 2,
    name: 'Công Ty VLXD Miền Bắc',
    avatar: 'https://via.placeholder.com/100x100/4caf50/ffffff?text=MB',
    rating: 4.8,
    reviews: 287,
    location: 'Hà Nội',
    experience: 18,
    materials: ['Xi măng', 'Cát', 'Đá', 'Gạch'],
    brands: ['Vissai', 'Tân Thành', 'Viglacera'],
    completedOrders: 1200,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '024 3974 2222',
    delivery: 'Giao hàng trong ngày',
  },
  {
    id: 3,
    name: 'Vật Liệu Xây Dựng Phú Cường',
    avatar: 'https://via.placeholder.com/100x100/2196f3/ffffff?text=PC',
    rating: 4.7,
    reviews: 198,
    location: 'Đà Nẵng',
    experience: 12,
    materials: ['Cát', 'Đá', 'Xi măng', 'Thép'],
    brands: ['Holcim', 'Vissai', 'Pomina'],
    completedOrders: 850,
    featured: false,
    availability: 'Sẵn sàng',
    phone: '0236 3850 3333',
    delivery: 'Giao hàng trong 24h',
  },
  {
    id: 4,
    name: 'Cửa Hàng VLXD Thành Công',
    avatar: 'https://via.placeholder.com/100x100/ff9800/ffffff?text=TC',
    rating: 4.6,
    reviews: 156,
    location: 'Cần Thơ',
    experience: 10,
    materials: ['Xi măng', 'Gạch', 'Ngói'],
    brands: ['Vissai', 'Viglacera', 'Đồng Tâm'],
    completedOrders: 620,
    featured: false,
    availability: 'Sẵn sàng',
    phone: '0292 3850 4444',
    delivery: 'Giao hàng miễn phí nội thành',
  },
];

const LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const MATERIAL_TYPES = ['Tất cả', 'Xi măng', 'Cát', 'Đá', 'Thép', 'Gạch', 'Ngói'];

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
            <Ionicons name="time" size={12} color="#999" />
            <Text style={styles.experienceText}>{provider.experience} năm</Text>
          </View>
        </View>
      </View>

      <View style={styles.materialsSection}>
        <Text style={styles.materialsLabel}>Vật liệu:</Text>
        <View style={styles.materialsTags}>
          {provider.materials.map((material: string, index: number) => (
            <View key={index} style={styles.materialTag}>
              <Text style={styles.materialText}>{material}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.brandsRow}>
        <Ionicons name="ribbon" size={16} color="#ff9800" />
        <Text style={styles.brandsLabel}>Thương hiệu: </Text>
        <Text style={styles.brandsText}>{provider.brands.join(', ')}</Text>
      </View>

      <View style={styles.deliveryRow}>
        <Ionicons name="car" size={16} color="#4caf50" />
        <Text style={styles.deliveryText}>{provider.delivery}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.completedOrders}+</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.available]}>
            {provider.availability}
          </Text>
          <Text style={styles.statLabel}>Tình trạng</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={onBooking}>
        <Ionicons name="cart" size={16} color="#fff" />
        <Text style={styles.bookButtonText}>Đặt hàng</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function VatLieuScreen() {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedMaterialType, setSelectedMaterialType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    materials: '',
    quantity: '',
    deliveryDate: '',
    notes: '',
  });

  const filteredProviders = PROVIDERS.filter((provider) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || provider.location === selectedLocation;
    const matchMaterialType =
      selectedMaterialType === 'Tất cả' ||
      provider.materials.includes(selectedMaterialType);
    const matchSearch =
      searchQuery === '' ||
      provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchMaterialType && matchSearch;
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
      'Đặt hàng thành công',
      `Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 1h.\n\nNhà cung cấp: ${selectedProvider.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            setBookingData({
              name: '',
              phone: '',
              address: '',
              materials: '',
              quantity: '',
              deliveryDate: '',
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
          title: 'Vật liệu xây dựng',
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
              placeholder="Tìm nhà cung cấp, vật liệu..."
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
            <Text style={styles.filterLabel}>Vật liệu:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {MATERIAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedMaterialType === type && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedMaterialType(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedMaterialType === type && styles.filterChipTextActive,
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
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy nhà cung cấp phù hợp</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#4caf50" />
          <Text style={styles.infoBannerText}>
            Vật liệu chính hãng • Giá cạnh tranh • Giao hàng nhanh
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
              <Text style={styles.bookingModalTitle}>Đặt hàng vật liệu</Text>
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
                    Địa chỉ giao hàng <Text style={styles.required}>*</Text>
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
                  <Text style={styles.formLabel}>Vật liệu cần mua</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="VD: Xi măng Holcim, Cát vàng, Đá 1x2..."
                    multiline
                    numberOfLines={3}
                    value={bookingData.materials}
                    onChangeText={(text) => setBookingData({ ...bookingData, materials: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Số lượng dự kiến</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: 100 bao xi măng, 10m³ cát..."
                    value={bookingData.quantity}
                    onChangeText={(text) => setBookingData({ ...bookingData, quantity: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ngày giao hàng mong muốn</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    value={bookingData.deliveryDate}
                    onChangeText={(text) => setBookingData({ ...bookingData, deliveryDate: text })}
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
                <Text style={styles.submitButtonText}>Gửi đơn hàng</Text>
              </TouchableOpacity>

              <Text style={styles.formNote}>
                * Nhà cung cấp sẽ gọi lại để xác nhận giá và thời gian giao hàng
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
  filterChipActive: { backgroundColor: Colors.light.primary },
  filterChipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  resultsBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  resultsText: { fontSize: 13, fontWeight: '600', color: '#333' },
  content: { flex: 1 },
  listContainer: { padding: 16 },
  providerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  featuredBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1, gap: 4 },
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
  materialsSection: { marginBottom: 12 },
  materialsLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  materialsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  materialTag: { backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  materialText: { fontSize: 11, fontWeight: '500', color: '#ff9800' },
  brandsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  brandsLabel: { fontSize: 12, fontWeight: '600', color: '#666' },
  brandsText: { fontSize: 12, color: '#333', flex: 1 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, backgroundColor: '#f1f8e9', padding: 8, borderRadius: 6 },
  deliveryText: { fontSize: 12, color: '#4caf50', fontWeight: '600', flex: 1 },
  statsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12, marginBottom: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  available: { color: '#4caf50' },
  statLabel: { fontSize: 11, color: '#999' },
  statDivider: { width: 1, height: 40, backgroundColor: '#f0f0f0' },
  bookButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.primary, paddingVertical: 12, borderRadius: 8, gap: 6 },
  bookButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 16 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f8e9', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  infoBannerText: { fontSize: 12, color: '#4caf50', flex: 1 },
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
  required: { color: Colors.light.primary },
  formInput: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#e0e0e0' },
  formTextArea: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: Colors.light.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  formNote: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
});
