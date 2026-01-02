import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
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

// Mock data - Tile Workers
const WORKERS = [
  {
    id: 1,
    name: 'Đội Lát Gạch Minh Tuấn',
    avatar: 'https://i.pravatar.cc/150?img=17',
    rating: 4.9,
    reviews: 213,
    location: 'TP.HCM',
    experience: 18,
    price: '180.000₫',
    priceUnit: '/ m²',
    specialties: ['Gạch ceramic', 'Gạch granite', 'Gạch 3D', 'Gạch mosaic'],
    teamSize: 4,
    completedProjects: 387,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '090 111 2222',
    pricePerDay: '550.000₫/ngày',
  },
  {
    id: 2,
    name: 'Thợ Lát Chuyên Nghiệp Hà Nội',
    avatar: 'https://i.pravatar.cc/150?img=36',
    rating: 4.8,
    reviews: 189,
    location: 'Hà Nội',
    experience: 15,
    price: '170.000₫',
    priceUnit: '/ m²',
    specialties: ['Gạch ceramic', 'Gạch granite', 'Gạch ốp tường'],
    teamSize: 3,
    completedProjects: 324,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '091 222 3333',
    pricePerDay: '520.000₫/ngày',
  },
  {
    id: 3,
    name: 'Lát Gạch Miền Trung',
    avatar: 'https://i.pravatar.cc/150?img=55',
    rating: 4.7,
    reviews: 156,
    location: 'Đà Nẵng',
    experience: 12,
    price: '160.000₫',
    priceUnit: '/ m²',
    specialties: ['Gạch ceramic', 'Gạch granite'],
    teamSize: 2,
    completedProjects: 267,
    featured: false,
    availability: 'Sẵn sàng',
    phone: '092 333 4444',
    pricePerDay: '480.000₫/ngày',
  },
  {
    id: 4,
    name: 'Thợ Lát Phương Nam',
    avatar: 'https://i.pravatar.cc/150?img=72',
    rating: 4.6,
    reviews: 134,
    location: 'Cần Thơ',
    experience: 10,
    price: '150.000₫',
    priceUnit: '/ m²',
    specialties: ['Gạch ceramic', 'Gạch lát sân'],
    teamSize: 2,
    completedProjects: 198,
    featured: false,
    availability: 'Bận (khả dụng từ 10/12)',
    phone: '093 444 5555',
    pricePerDay: '450.000₫/ngày',
  },
];

const LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const TILE_TYPES = ['Tất cả', 'Gạch ceramic', 'Gạch granite', 'Gạch 3D', 'Gạch mosaic', 'Gạch ốp tường'];

interface WorkerCardProps {
  worker: any;
  onBooking: () => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onBooking }) => {
  const handleCardPress = () => {
    router.push(`/finishing/worker-profile/${worker.id}`);
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
          <Text style={styles.workerName}>{worker.name}</Text>
          
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

      <View style={styles.specialtiesSection}>
        <Text style={styles.specialtiesLabel}>Chuyên môn:</Text>
        <View style={styles.specialtiesTags}>
          {worker.specialties.map((specialty: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.teamRow}>
        <Ionicons name="people" size={16} color="#2196f3" />
        <Text style={styles.teamText}>Đội {worker.teamSize} người</Text>
      </View>

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

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.price}>{worker.price}</Text>
          <Text style={styles.priceUnit}>{worker.priceUnit}</Text>
          <Text style={styles.priceDay}>hoặc {worker.pricePerDay}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.bookButton} 
          onPress={(e) => {
            e.stopPropagation();
            onBooking();
          }}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.bookButtonText}>Liên hệ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function LatGachScreen() {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedTileType, setSelectedTileType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    tileType: '',
    area: '',
    startDate: '',
    notes: '',
  });

  const filteredWorkers = WORKERS.filter((worker) => {
    const matchLocation = selectedLocation === 'Tất cả' || worker.location === selectedLocation;
    const matchTileType = selectedTileType === 'Tất cả' || worker.specialties.includes(selectedTileType);
    const matchSearch = searchQuery === '' || worker.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchTileType && matchSearch;
  });

  const handleBooking = (worker: any) => {
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
      `Chúng tôi sẽ kết nối bạn với thợ trong vòng 1h.\n\nThợ: ${selectedWorker.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            setBookingData({
              name: '',
              phone: '',
              address: '',
              tileType: '',
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
    <>
      <Stack.Screen
        options={{
          title: 'Thợ lát gạch',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm thợ lát gạch..."
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
                  <Text style={[styles.filterChipText, selectedLocation === location && styles.filterChipTextActive]}>
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Loại gạch:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {TILE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedTileType === type && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedTileType(type)}
                >
                  <Text style={[styles.filterChipText, selectedTileType === type && styles.filterChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>{filteredWorkers.length} thợ</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {filteredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} onBooking={() => handleBooking(worker)} />
          ))}

          {filteredWorkers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="grid-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy thợ phù hợp</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#4caf50" />
          <Text style={styles.infoBannerText}>Thi công chuyên nghiệp • Bảo hành công trình</Text>
        </View>
      </View>

      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.bookingModalOverlay}>
          <View style={styles.bookingModalContent}>
            <View style={styles.bookingModalHeader}>
              <Text style={styles.bookingModalTitle}>Liên hệ thợ lát gạch</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookingModalBody}>
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
                  <Text style={styles.formLabel}>Loại gạch</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: Gạch ceramic 60x60"
                    value={bookingData.tileType}
                    onChangeText={(text) => setBookingData({ ...bookingData, tileType: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Diện tích (m²)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: 100"
                    keyboardType="numeric"
                    value={bookingData.area}
                    onChangeText={(text) => setBookingData({ ...bookingData, area: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ngày bắt đầu</Text>
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
  workerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  featuredBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1, gap: 4 },
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
  specialtiesSection: { marginBottom: 12 },
  specialtiesLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  specialtiesTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specialtyTag: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  specialtyText: { fontSize: 11, fontWeight: '500', color: '#2196f3' },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  teamText: { fontSize: 12, color: '#666', flex: 1 },
  statsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12, marginBottom: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  available: { color: '#4caf50' },
  busy: { color: '#ff9800' },
  statLabel: { fontSize: 11, color: '#999' },
  statDivider: { width: 1, height: 40, backgroundColor: '#f0f0f0' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 18, fontWeight: '700', color: Colors.light.primary },
  priceUnit: { fontSize: 12, color: '#999' },
  priceDay: { fontSize: 11, color: '#666', marginTop: 2 },
  bookButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
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
  selectedWorkerInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 20 },
  selectedAvatar: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#e0e0e0' },
  selectedWorkerText: { flex: 1, marginLeft: 12 },
  selectedWorkerName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
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
