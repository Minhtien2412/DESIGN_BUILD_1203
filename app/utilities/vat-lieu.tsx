import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
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
    View,
} from 'react-native';

import { useLaborProviders } from '@/hooks/useLaborProviders';
import { LaborProvider } from '@/services/api/labor.service';

const LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const MATERIAL_TYPES = ['Tất cả', 'Xi măng', 'Cát', 'Đá', 'Thép', 'Gạch', 'Ngói'];

interface ProviderCardProps {
  provider: LaborProvider;
  onBooking: () => void;
  onPress: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onBooking, onPress }) => {
  const availabilityText = provider.availability === 'available' ? 'Sẵn sàng' : provider.availability === 'busy' ? 'Đang bận' : 'Không khả dụng';
  
  return (
    <TouchableOpacity style={styles.providerCard} activeOpacity={0.8} onPress={onPress}>
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
            <Ionicons name="time" size={12} color="#999" />
            <Text style={styles.experienceText}>{provider.yearExperience} năm</Text>
          </View>
        </View>
      </View>

      <View style={styles.materialsSection}>
        <Text style={styles.materialsLabel}>Vật liệu:</Text>
        <View style={styles.materialsTags}>
          {provider.services.map((service: string, index: number) => (
            <View key={index} style={styles.materialTag}>
              <Text style={styles.materialText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.brandsRow}>
        <Ionicons name="ribbon" size={16} color="#0D9488" />
        <Text style={styles.brandsLabel}>Thương hiệu: </Text>
        <Text style={styles.brandsText}>{provider.verified ? 'Đã xác minh' : 'Uy tín'}</Text>
      </View>

      <View style={styles.deliveryRow}>
        <Ionicons name="car" size={16} color="#0D9488" />
        <Text style={styles.deliveryText}>Giao hàng nhanh</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.projectCount}+</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, provider.availability === 'available' ? styles.available : styles.busy]}>
            {availabilityText}
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
  const { providers, loading, refreshing, refresh, searchProviders } = useLaborProviders({ type: 'vat-lieu' });
  
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedMaterialType, setSelectedMaterialType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<LaborProvider | null>(null);
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

  const filteredProviders = providers.filter((provider) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || provider.city === selectedLocation || provider.address.includes(selectedLocation);
    const matchMaterialType =
      selectedMaterialType === 'Tất cả' ||
      provider.services.includes(selectedMaterialType);
    const matchSearch =
      searchQuery === '' ||
      provider.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchMaterialType && matchSearch;
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
      'Đặt hàng thành công',
      `Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 1h.\n\nNhà cung cấp: ${selectedProvider?.name}`,
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[Colors.light.primary]} />
            }
          >
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onBooking={() => handleBooking(provider)}
                onPress={() => router.push(`/utilities/team-detail?id=${provider.id}&type=vat-lieu`)}
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
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#0D9488" />
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
                      <Ionicons name="star" size={14} color="#0D9488" />
                      <Text style={styles.selectedRatingText}>
                        {selectedProvider.rating} ({selectedProvider.reviewCount})
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
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
  materialTag: { backgroundColor: '#F0FDFA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  materialText: { fontSize: 11, fontWeight: '500', color: '#0D9488' },
  brandsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  brandsLabel: { fontSize: 12, fontWeight: '600', color: '#666' },
  brandsText: { fontSize: 12, color: '#333', flex: 1 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, backgroundColor: '#f1f8e9', padding: 8, borderRadius: 6 },
  deliveryText: { fontSize: 12, color: '#0D9488', fontWeight: '600', flex: 1 },
  statsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12, marginBottom: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  available: { color: '#0D9488' },
  busy: { color: '#0D9488' },
  statLabel: { fontSize: 11, color: '#999' },
  statDivider: { width: 1, height: 40, backgroundColor: '#f0f0f0' },
  bookButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.primary, paddingVertical: 12, borderRadius: 8, gap: 6 },
  bookButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 16 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f8e9', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  infoBannerText: { fontSize: 12, color: '#0D9488', flex: 1 },
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
