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
const SKILLS = ['Tất cả', 'Xây tường', 'Đổ móng', 'Xây cột', 'Tô trát', 'Chống thấm'];

interface WorkerCardProps {
  worker: LaborProvider;
  onBooking: () => void;
  onPress: () => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onBooking, onPress }) => {
  const availabilityText = worker.availability === 'available' ? 'Sẵn sàng' : worker.availability === 'busy' ? 'Đang bận' : 'Không khả dụng';
  const priceDisplay = `${worker.priceRange.min.toLocaleString('vi-VN')}₫`;
  
  return (
    <TouchableOpacity style={styles.workerCard} activeOpacity={0.8} onPress={onPress}>
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
            <Text style={styles.reviewsText}>({worker.reviewCount})</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#999" />
            <Text style={styles.locationText}>{worker.city}</Text>
            <View style={styles.divider} />
            <Ionicons name="briefcase" size={12} color="#999" />
            <Text style={styles.experienceText}>{worker.yearExperience} năm</Text>
          </View>
        </View>
      </View>

      <View style={styles.skillsSection}>
        <Text style={styles.skillsLabel}>Kỹ năng:</Text>
        <View style={styles.skillsTags}>
          {worker.services.map((skill: string, index: number) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.teamRow}>
        <Ionicons name="people" size={16} color="#2196f3" />
        <Text style={styles.teamText}>{worker.verified ? 'Đội chuyên nghiệp' : 'Làm việc đơn lẻ'}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{worker.projectCount}+</Text>
          <Text style={styles.statLabel}>Dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              worker.availability === 'available' ? styles.available : styles.busy,
            ]}
          >
            {availabilityText}
          </Text>
          <Text style={styles.statLabel}>Tình trạng</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.price}>{priceDisplay}</Text>
          <Text style={styles.priceUnit}>/ {worker.priceRange.unit}</Text>
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={onBooking}>
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.bookButtonText}>Liên hệ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function NhanCongScreen() {
  const { providers, loading, refreshing, refresh, searchProviders } = useLaborProviders({ type: 'nhan-cong' });
  
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedSkill, setSelectedSkill] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<LaborProvider | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    workType: '',
    duration: '',
    startDate: '',
    notes: '',
  });

  const filteredWorkers = providers.filter((worker) => {
    const matchLocation =
      selectedLocation === 'Tất cả' || worker.city === selectedLocation || worker.address.includes(selectedLocation);
    const matchSkill =
      selectedSkill === 'Tất cả' ||
      worker.services.some((s: string) => s.includes(selectedSkill));
    const matchSearch =
      searchQuery === '' ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchSkill && matchSearch;
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

  const handleBooking = (worker: LaborProvider) => {
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
              workType: '',
              duration: '',
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
          title: 'Nhân công xây dựng',
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
              placeholder="Tìm thợ..."
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
            <Text style={styles.filterLabel}>Kỹ năng:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {SKILLS.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.filterChip,
                    selectedSkill === skill && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSkill(skill)}
                >
                  <Text style={[styles.filterChipText, selectedSkill === skill && styles.filterChipTextActive]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>{filteredWorkers.length} thợ</Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách thợ...</Text>
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
          {filteredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onBooking={() => handleBooking(worker)}
              onPress={() => router.push(`/utilities/team-detail?id=${worker.id}&type=nhan-cong`)}
            />
          ))}

          {filteredWorkers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy thợ phù hợp</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
        )}

        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#4caf50" />
          <Text style={styles.infoBannerText}>
            Thợ có kinh nghiệm • Đánh giá chất lượng
          </Text>
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
              <Text style={styles.bookingModalTitle}>Liên hệ thợ</Text>
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
                        {selectedWorker.rating} ({selectedWorker.reviewCount})
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
                  <Text style={styles.formLabel}>Công việc cần làm</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="VD: Xây nhà 1 tầng, xây tường..."
                    multiline
                    numberOfLines={3}
                    value={bookingData.workType}
                    onChangeText={(text) => setBookingData({ ...bookingData, workType: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Thời gian dự kiến (ngày)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="VD: 30"
                    keyboardType="numeric"
                    value={bookingData.duration}
                    onChangeText={(text) => setBookingData({ ...bookingData, duration: text })}
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
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 12 },
  workerName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#333' },
  reviewsText: { fontSize: 12, color: '#999' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: '#999' },
  divider: { width: 1, height: 12, backgroundColor: '#e0e0e0', marginHorizontal: 6 },
  experienceText: { fontSize: 12, color: '#999' },
  skillsSection: { marginBottom: 12 },
  skillsLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 },
  skillsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillTag: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  skillText: { fontSize: 11, fontWeight: '500', color: '#2196f3' },
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
  bookButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
  bookButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f8e9', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  infoBannerText: { fontSize: 12, color: '#4caf50', flex: 1 },
  bookingModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bookingModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  bookingModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  bookingModalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  bookingModalBody: { padding: 16 },
  selectedWorkerInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 20 },
  selectedAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0e0e0' },
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
