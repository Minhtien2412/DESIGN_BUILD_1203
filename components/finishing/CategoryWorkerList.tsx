/**
 * CategoryWorkerList - Shared component for finishing category pages
 * Displays list of workers/contractors with filtering, search, and contact functionality
 * Used by: Lát gạch, Sơn, Thạch cao, Làm cửa, Nội thất, etc.
 */
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ==================== TYPES ====================

export interface Worker {
  id: string | number;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  location: string;
  experience: number;
  price: string;
  priceUnit: string;
  specialties: string[];
  teamSize?: number;
  completedProjects: number;
  featured?: boolean;
  availability: string;
  phone: string;
  pricePerDay?: string;
  bio?: string;
  services?: string[];
}

export interface CategoryConfig {
  /** Category key for routing */
  categoryKey: string;
  /** Display title */
  title: string;
  /** Location filter options */
  locations?: string[];
  /** Specialty filter options */
  specialtyTypes?: string[];
  /** Label for specialty filter */
  specialtyLabel?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Info banner text */
  infoBannerText?: string;
  /** Form field labels */
  formLabels?: {
    serviceType?: string;
    serviceTypePlaceholder?: string;
    areaLabel?: string;
    areaPlaceholder?: string;
  };
}

export interface CategoryWorkerListProps {
  /** Workers data array */
  workers: Worker[];
  /** Category configuration */
  config: CategoryConfig;
  /** Optional custom header component */
  headerComponent?: React.ReactNode;
  /** Route prefix for worker profile */
  profileRoutePrefix?: string;
}

// ==================== DEFAULT VALUES ====================

const DEFAULT_LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];

// ==================== SUB-COMPONENTS ====================

interface WorkerCardProps {
  worker: Worker;
  categoryKey: string;
  onBooking: () => void;
  profileRoutePrefix?: string;
}

const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  categoryKey,
  onBooking,
  profileRoutePrefix,
}) => {
  const handleCardPress = () => {
    // Navigate to shared worker-profile-new with category param
    router.push(`/finishing/worker-profile-new/${worker.id}?category=${categoryKey}`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${worker.phone.replace(/\s/g, '')}`);
  };

  const handleMessage = () => {
    // Navigate to in-app chat
    router.push(`/messages/${worker.id}`);
  };

  return (
    <TouchableOpacity style={styles.workerCard} activeOpacity={0.8} onPress={handleCardPress}>
      {worker.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.featuredText}>Đề xuất</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <Image source={{ uri: worker.avatar }} style={styles.avatar} />

        <View style={styles.headerInfo}>
          <Text style={styles.workerName} numberOfLines={1}>
            {worker.name}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#ffa41c" />
            <Text style={styles.ratingText}>{worker.rating}</Text>
            <Text style={styles.reviewsText}>({worker.reviews})</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#999" />
            <Text style={styles.locationText}>{worker.location}</Text>
            <View style={styles.divider} />
            <Ionicons name="briefcase" size={12} color="#999" />
            <Text style={styles.experienceText}>{worker.experience} năm</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.specialtiesSection}>
        <Text style={styles.specialtiesLabel}>Chuyên môn:</Text>
        <View style={styles.specialtiesTags}>
          {worker.specialties.slice(0, 4).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
          {worker.specialties.length > 4 && (
            <View style={[styles.specialtyTag, { backgroundColor: '#f0f0f0' }]}>
              <Text style={[styles.specialtyText, { color: '#666' }]}>
                +{worker.specialties.length - 4}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Team Size */}
      {worker.teamSize && (
        <View style={styles.teamRow}>
          <Ionicons name="people" size={16} color="#2196f3" />
          <Text style={styles.teamText}>Đội {worker.teamSize} người</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{worker.completedProjects}+</Text>
          <Text style={styles.statLabel}>Công trình</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              worker.availability === 'Sẵn sàng' ? styles.available : styles.busy,
            ]}
          >
            {worker.availability}
          </Text>
          <Text style={styles.statLabel}>Tình trạng</Text>
        </View>
      </View>

      {/* Price & Actions */}
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.price}>{worker.price}</Text>
          <Text style={styles.priceUnit}>{worker.priceUnit}</Text>
          {worker.pricePerDay && <Text style={styles.priceDay}>hoặc {worker.pricePerDay}</Text>}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={(e) => {
              e.stopPropagation();
              handleMessage();
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color={Colors.light.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callButton}
            onPress={(e) => {
              e.stopPropagation();
              handleCall();
            }}
          >
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.callButtonText}>Gọi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={(e) => {
              e.stopPropagation();
              onBooking();
            }}
          >
            <Text style={styles.bookButtonText}>Liên hệ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ==================== MAIN COMPONENT ====================

export function CategoryWorkerList({
  workers,
  config,
  headerComponent,
  profileRoutePrefix,
}: CategoryWorkerListProps) {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    serviceType: '',
    area: '',
    startDate: '',
    notes: '',
  });

  const locations = config.locations || DEFAULT_LOCATIONS;
  const specialtyTypes = config.specialtyTypes || [];

  // Filter workers
  const filteredWorkers = workers.filter((worker) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || worker.location === selectedLocation;
    const matchSpecialty =
      selectedSpecialty === 'Tất cả' || worker.specialties.includes(selectedSpecialty);
    const matchSearch =
      searchQuery === '' || worker.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchSpecialty && matchSearch;
  });

  const handleBooking = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingData.name || !bookingData.phone || !bookingData.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    Alert.alert(
      'Gửi yêu cầu thành công',
      `Chúng tôi sẽ kết nối bạn với thợ trong vòng 1h.\n\nThợ: ${selectedWorker?.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            setBookingData({
              name: '',
              phone: '',
              address: '',
              serviceType: '',
              area: '',
              startDate: '',
              notes: '',
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      {headerComponent}

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={config.searchPlaceholder || `Tìm thợ ${config.title.toLowerCase()}...`}
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
        {/* Location Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Khu vực:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[styles.filterChip, selectedLocation === location && styles.filterChipActive]}
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

        {/* Specialty Filter */}
        {specialtyTypes.length > 0 && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{config.specialtyLabel || 'Loại:'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['Tất cả', ...specialtyTypes].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedSpecialty === type && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSpecialty(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSpecialty === type && styles.filterChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>{filteredWorkers.length} thợ</Text>
      </View>

      {/* Workers List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {filteredWorkers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            categoryKey={config.categoryKey}
            onBooking={() => handleBooking(worker)}
            profileRoutePrefix={profileRoutePrefix}
          />
        ))}

        {filteredWorkers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy thợ phù hợp</Text>
            <Text style={styles.emptySubText}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="shield-checkmark" size={16} color="#4caf50" />
        <Text style={styles.infoBannerText}>
          {config.infoBannerText || 'Thi công chuyên nghiệp • Bảo hành công trình'}
        </Text>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Liên hệ {config.title.toLowerCase()}</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Selected Worker Info */}
              {selectedWorker && (
                <View style={styles.selectedWorkerInfo}>
                  <Image source={{ uri: selectedWorker.avatar }} style={styles.selectedAvatar} />
                  <View style={styles.selectedWorkerText}>
                    <Text style={styles.selectedWorkerName}>{selectedWorker.name}</Text>
                    <View style={styles.selectedRating}>
                      <Ionicons name="star" size={14} color="#ffa41c" />
                      <Text style={styles.selectedRatingText}>
                        {selectedWorker.rating} ({selectedWorker.reviews})
                      </Text>
                    </View>
                  </View>

                  {/* Quick Actions */}
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => Linking.openURL(`tel:${selectedWorker.phone.replace(/\s/g, '')}`)}
                    >
                      <Ionicons name="call" size={20} color={Colors.light.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => router.push(`/messages/${selectedWorker.id}`)}
                    >
                      <Ionicons name="chatbubble" size={20} color="#4caf50" />
                    </TouchableOpacity>
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
                  <Text style={styles.formLabel}>
                    {config.formLabels?.serviceType || 'Loại dịch vụ'}
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={config.formLabels?.serviceTypePlaceholder || 'VD: Thi công toàn bộ'}
                    value={bookingData.serviceType}
                    onChangeText={(text) => setBookingData({ ...bookingData, serviceType: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    {config.formLabels?.areaLabel || 'Diện tích (m²)'}
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={config.formLabels?.areaPlaceholder || 'VD: 100'}
                    keyboardType="numeric"
                    value={bookingData.area}
                    onChangeText={(text) => setBookingData({ ...bookingData, area: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ngày bắt đầu dự kiến</Text>
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
                * Thợ sẽ liên hệ lại để thống nhất giá và thời gian
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Search
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },

  // Filters
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 85,
    paddingLeft: 16,
  },
  filterScroll: { flex: 1 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: { backgroundColor: Colors.light.primary },
  filterChipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },

  // Results
  resultsBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsText: { fontSize: 13, fontWeight: '600', color: '#333' },

  // Content
  content: { flex: 1 },
  listContainer: { padding: 16 },

  // Worker Card
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
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
  featuredText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 12 },
  workerName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#333' },
  reviewsText: { fontSize: 12, color: '#999' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#999' },
  divider: { width: 1, height: 12, backgroundColor: '#e0e0e0', marginHorizontal: 6 },
  experienceText: { fontSize: 12, color: '#999' },

  // Specialties
  specialtiesSection: { marginBottom: 12 },
  specialtiesLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  specialtiesTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specialtyTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: { fontSize: 11, fontWeight: '500', color: '#2196f3' },

  // Team
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  teamText: { fontSize: 12, color: '#666', flex: 1 },

  // Stats
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
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  available: { color: '#4caf50' },
  busy: { color: '#ff9800' },
  statLabel: { fontSize: 11, color: '#999' },
  statDivider: { width: 1, height: 40, backgroundColor: '#f0f0f0' },

  // Price & Actions
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 18, fontWeight: '700', color: Colors.light.primary },
  priceUnit: { fontSize: 12, color: '#999' },
  priceDay: { fontSize: 11, color: '#666', marginTop: 2 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(238, 77, 45, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  callButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  bookButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 16 },
  emptySubText: { fontSize: 13, color: '#ccc', marginTop: 8 },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  infoBannerText: { fontSize: 12, color: '#4caf50', flex: 1 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
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
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  modalBody: { padding: 16 },

  // Selected Worker
  selectedWorkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedAvatar: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#e0e0e0' },
  selectedWorkerText: { flex: 1, marginLeft: 12 },
  selectedWorkerName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  selectedRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedRatingText: { fontSize: 12, color: '#666' },
  quickActions: { flexDirection: 'row', gap: 8 },
  quickActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form
  form: { marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: Colors.light.primary },
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
  formTextArea: { height: 80, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  formNote: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
});

export default CategoryWorkerList;
