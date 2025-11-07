import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type Worker = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  experience: number;
  price: string;
  priceUnit: string;
  specialties: string[];
  teamSize: number;
  completedProjects: number;
  avatar: string;
  featured?: boolean;
  availability?: 'available' | 'busy' | 'booked';
  pricePerDay?: string;
};

const WORKERS: Worker[] = [
  {
    id: 1,
    name: 'Đội Sơn Chuyên Nghiệp',
    rating: 4.9,
    reviews: 245,
    location: 'TP.HCM',
    experience: 17,
    price: '60.000₫',
    priceUnit: '/ m²',
    specialties: ['Sơn tường', 'Sơn nước', 'Sơn trang trí', 'Chống thấm'],
    teamSize: 4,
    completedProjects: 456,
    avatar: '👨‍🎨',
    featured: true,
    availability: 'available',
    pricePerDay: '500.000₫/ngày',
  },
  {
    id: 2,
    name: 'Thợ Sơn Minh Tuấn',
    rating: 4.8,
    reviews: 218,
    location: 'Hà Nội',
    experience: 15,
    price: '55.000₫',
    priceUnit: '/ m²',
    specialties: ['Sơn tường', 'Sơn dầu', 'Sơn phủ', 'Sơn ngoại thất'],
    teamSize: 3,
    completedProjects: 389,
    avatar: '🎨',
    featured: true,
    availability: 'available',
    pricePerDay: '480.000₫/ngày',
  },
  {
    id: 3,
    name: 'Sơn Trang Trí Đà Nẵng',
    rating: 4.7,
    reviews: 187,
    location: 'Đà Nẵng',
    experience: 13,
    price: '50.000₫',
    priceUnit: '/ m²',
    specialties: ['Sơn trang trí', 'Sơn hiệu ứng', 'Sơn 3D', 'Vẽ tranh tường'],
    teamSize: 3,
    completedProjects: 312,
    avatar: '🖌️',
    availability: 'available',
    pricePerDay: '450.000₫/ngày',
  },
  {
    id: 4,
    name: 'Thợ Sơn Phương Nam',
    rating: 4.6,
    reviews: 156,
    location: 'Cần Thơ',
    experience: 11,
    price: '45.000₫',
    priceUnit: '/ m²',
    specialties: ['Sơn tường', 'Sơn nước', 'Sơn công nghiệp', 'Chống thấm'],
    teamSize: 2,
    completedProjects: 267,
    avatar: '👨‍🎨',
    availability: 'busy',
    pricePerDay: '400.000₫/ngày',
  },
];

const LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const PAINT_TYPES = ['Tất cả', 'Sơn tường', 'Sơn nước', 'Sơn dầu', 'Sơn trang trí', 'Chống thấm'];

export default function PainterScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedPaintType, setSelectedPaintType] = useState('Tất cả');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    address: '',
    paintType: '',
    area: '',
    startDate: '',
    notes: '',
  });

  const filteredWorkers = WORKERS.filter((worker) => {
    const matchesSearch =
      searchQuery === '' ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      selectedLocation === 'Tất cả' || worker.location === selectedLocation;

    const matchesPaintType =
      selectedPaintType === 'Tất cả' ||
      worker.specialties.some((s) => s.includes(selectedPaintType));

    return matchesSearch && matchesLocation && matchesPaintType;
  });

  const handleBooking = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    console.log('Booking submitted:', bookingForm);
    setShowBookingModal(false);
    setBookingForm({
      name: '',
      phone: '',
      address: '',
      paintType: '',
      area: '',
      startDate: '',
      notes: '',
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('Tất cả');
    setSelectedPaintType('Tất cả');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thợ sơn</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm thợ sơn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Location Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Khu vực</Text>
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

        {/* Paint Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Loại sơn</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {PAINT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  selectedPaintType === type && styles.filterChipActive,
                ]}
                onPress={() => setSelectedPaintType(type)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedPaintType === type && styles.filterChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredWorkers.length} thợ sơn
          </Text>
          {(selectedLocation !== 'Tất cả' || selectedPaintType !== 'Tất cả' || searchQuery) && (
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetButton}>Đặt lại</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Worker Cards */}
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <View key={worker.id} style={styles.workerCard}>
              {worker.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.featuredText}>Đề xuất</Text>
                </View>
              )}

              <View style={styles.workerHeader}>
                <View style={styles.workerAvatar}>
                  <Text style={styles.avatarEmoji}>{worker.avatar}</Text>
                </View>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#ffa000" />
                    <Text style={styles.ratingText}>{worker.rating}</Text>
                    <Text style={styles.reviewsText}>({worker.reviews} đánh giá)</Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.locationText}>{worker.location}</Text>
                    <Text style={styles.experienceText}>• {worker.experience} năm kinh nghiệm</Text>
                  </View>
                </View>
              </View>

              <View style={styles.specialtiesContainer}>
                {worker.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.teamSizeRow}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.teamSizeText}>Đội {worker.teamSize} người</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4caf50" />
                  <Text style={styles.statText}>{worker.completedProjects} công trình</Text>
                </View>
                <View
                  style={[
                    styles.availabilityBadge,
                    worker.availability === 'available' && styles.availabilityAvailable,
                    worker.availability === 'busy' && styles.availabilityBusy,
                  ]}
                >
                  <Text
                    style={[
                      styles.availabilityText,
                      worker.availability === 'available' && styles.availabilityTextAvailable,
                      worker.availability === 'busy' && styles.availabilityTextBusy,
                    ]}
                  >
                    {worker.availability === 'available' ? 'Sẵn sàng' : 'Đang bận'}
                  </Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>Giá thi công</Text>
                  <Text style={styles.priceText}>
                    {worker.price}
                    <Text style={styles.priceUnit}>{worker.priceUnit}</Text>
                  </Text>
                  {worker.pricePerDay && (
                    <Text style={styles.priceAlt}>{worker.pricePerDay}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBooking(worker)}
                >
                  <Ionicons name="call-outline" size={18} color="#fff" />
                  <Text style={styles.bookButtonText}>Liên hệ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="color-palette-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy thợ sơn</Text>
            <TouchableOpacity onPress={resetFilters} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#4caf50" />
          <Text style={styles.infoBannerText}>
            Thi công chuyên nghiệp • Bảo hành màng sơn
          </Text>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đặt lịch thi công</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {selectedWorker && (
                <View style={styles.selectedWorkerInfo}>
                  <Text style={styles.selectedWorkerName}>{selectedWorker.name}</Text>
                  <Text style={styles.selectedWorkerPrice}>{selectedWorker.price}{selectedWorker.priceUnit}</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ và tên *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nhập họ và tên"
                  value={bookingForm.name}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số điện thoại *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nhập số điện thoại"
                  value={bookingForm.phone}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Địa chỉ thi công *</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Nhập địa chỉ chi tiết"
                  value={bookingForm.address}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, address: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Loại sơn</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: Sơn nước nội thất"
                  value={bookingForm.paintType}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, paintType: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Diện tích (m²)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nhập diện tích cần sơn"
                  value={bookingForm.area}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, area: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày bắt đầu</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="DD/MM/YYYY"
                  value={bookingForm.startDate}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, startDate: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ghi chú</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Thêm ghi chú (tùy chọn)"
                  value={bookingForm.notes}
                  onChangeText={(text) => setBookingForm({ ...bookingForm, notes: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBooking}>
                <Text style={styles.submitButtonText}>Xác nhận đặt lịch</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  filterSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  resetButton: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  workerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    position: 'relative',
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
    gap: 4,
  },
  featuredText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  workerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  workerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 11,
    color: '#ff9800',
    fontWeight: '500',
  },
  teamSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  teamSizeText: {
    fontSize: 13,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityAvailable: {
    backgroundColor: '#e8f5e9',
  },
  availabilityBusy: {
    backgroundColor: '#fff3e0',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  availabilityTextAvailable: {
    color: '#4caf50',
  },
  availabilityTextBusy: {
    color: '#ff9800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
  },
  priceAlt: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#33691e',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalForm: {
    padding: 16,
  },
  selectedWorkerInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedWorkerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  selectedWorkerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
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
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
