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

// Mock data - Mason Workers
const MASONS = [
  {
    id: 1,
    name: 'Đội Thợ Xây Minh Tuấn',
    avatar: 'https://i.pravatar.cc/150?img=14',
    rating: 4.9,
    reviews: 187,
    location: 'TP.HCM',
    experience: 16,
    price: '500.000₫',
    priceUnit: '/ ngày',
    specialties: ['Xây nhà phố', 'Xây biệt thự', 'Xây tường rào'],
    teamSize: 5,
    completedProjects: 245,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '090 111 2222',
    pricePerSquare: '180.000₫/m²',
  },
  {
    id: 2,
    name: 'Thợ Xây Anh Dũng',
    avatar: 'https://i.pravatar.cc/150?img=32',
    rating: 4.8,
    reviews: 156,
    location: 'Hà Nội',
    experience: 14,
    price: '480.000₫',
    priceUnit: '/ ngày',
    specialties: ['Tô trát', 'Xây móng', 'Chống thấm'],
    teamSize: 4,
    completedProjects: 198,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '091 222 3333',
    pricePerSquare: '170.000₫/m²',
  },
  {
    id: 3,
    name: 'Đội Xây Dựng Hoàng Gia',
    avatar: 'https://i.pravatar.cc/150?img=52',
    rating: 4.7,
    reviews: 134,
    location: 'Đà Nẵng',
    experience: 12,
    price: '450.000₫',
    priceUnit: '/ ngày',
    specialties: ['Xây nhà cấp 4', 'Sửa chữa', 'Nâng tầng'],
    teamSize: 3,
    completedProjects: 167,
    featured: false,
    availability: 'Sẵn sàng',
    phone: '092 333 4444',
    pricePerSquare: '160.000₫/m²',
  },
  {
    id: 4,
    name: 'Thợ Xây Văn Thành',
    avatar: 'https://i.pravatar.cc/150?img=69',
    rating: 4.6,
    reviews: 98,
    location: 'Cần Thơ',
    experience: 10,
    price: '420.000₫',
    priceUnit: '/ ngày',
    specialties: ['Xây tường', 'Tô tường', 'Láng xi măng'],
    teamSize: 2,
    completedProjects: 123,
    featured: false,
    availability: 'Bận (khả dụng từ 20/11)',
    phone: '093 444 5555',
    pricePerSquare: '150.000₫/m²',
  },
];

const LOCATIONS = ['Tất cả', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Khác'];
const SPECIALTIES = ['Tất cả', 'Xây nhà phố', 'Xây móng', 'Tô trát', 'Xây biệt thự', 'Chống thấm'];

interface MasonCardProps {
  mason: any;
  onBooking: () => void;
}

const MasonCard: React.FC<MasonCardProps> = ({ mason, onBooking }) => {
  return (
    <TouchableOpacity style={styles.masonCard} activeOpacity={0.8}>
      {mason.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.featuredText}>Đề xuất</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <Image source={{ uri: mason.avatar }} style={styles.avatar} />
        
        <View style={styles.headerInfo}>
          <Text style={styles.masonName}>{mason.name}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#ffa41c" />
            <Text style={styles.ratingText}>{mason.rating}</Text>
            <Text style={styles.reviewsText}>({mason.reviews})</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#999" />
            <Text style={styles.locationText}>{mason.location}</Text>
            <View style={styles.divider} />
            <Ionicons name="briefcase" size={12} color="#999" />
            <Text style={styles.experienceText}>{mason.experience} năm</Text>
          </View>
        </View>
      </View>

      <View style={styles.specialtiesSection}>
        <Text style={styles.specialtiesLabel}>Chuyên môn:</Text>
        <View style={styles.specialtiesTags}>
          {mason.specialties.map((specialty: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.teamRow}>
        <Ionicons name="people" size={16} color="#2196f3" />
        <Text style={styles.teamText}>Đội {mason.teamSize} người</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mason.completedProjects}+</Text>
          <Text style={styles.statLabel}>Dự án</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              mason.availability === 'Sẵn sàng' ? styles.available : styles.busy,
            ]}
          >
            {mason.availability}
          </Text>
          <Text style={styles.statLabel}>Tình trạng</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.price}>{mason.price}</Text>
          <Text style={styles.priceUnit}>{mason.priceUnit}</Text>
          <Text style={styles.priceSquare}>hoặc {mason.pricePerSquare}</Text>
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={onBooking}>
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.bookButtonText}>Liên hệ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function ThoXayScreen() {
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMason, setSelectedMason] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    workType: '',
    area: '',
    startDate: '',
    notes: '',
  });

  const filteredMasons = MASONS.filter((mason) => {
    const matchLocation = selectedLocation === 'Tất cả' || mason.location === selectedLocation;
    const matchSpecialty = selectedSpecialty === 'Tất cả' || mason.specialties.includes(selectedSpecialty);
    const matchSearch = searchQuery === '' || mason.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchSpecialty && matchSearch;
  });

  const handleBooking = (mason: any) => {
    setSelectedMason(mason);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingData.name || !bookingData.phone || !bookingData.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    Alert.alert(
      'Gửi yêu cầu thành công',
      `Chúng tôi sẽ kết nối bạn với thợ trong vòng 1h.\n\nĐội thợ: ${selectedMason.name}`,
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
          title: 'Thợ xây',
          headerStyle: { backgroundColor: '#90B44C' },
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
              placeholder="Tìm thợ xây..."
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
            <Text style={styles.filterLabel}>Chuyên môn:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {SPECIALTIES.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.filterChip,
                    selectedSpecialty === specialty && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSpecialty(specialty)}
                >
                  <Text style={[styles.filterChipText, selectedSpecialty === specialty && styles.filterChipTextActive]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>{filteredMasons.length} đội thợ</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {filteredMasons.map((mason) => (
            <MasonCard key={mason.id} mason={mason} onBooking={() => handleBooking(mason)} />
          ))}

          {filteredMasons.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="hammer-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy thợ phù hợp</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#4caf50" />
          <Text style={styles.infoBannerText}>Thợ có tay nghề • Cam kết chất lượng</Text>
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
              <Text style={styles.bookingModalTitle}>Liên hệ thợ xây</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookingModalBody}>
              {selectedMason && (
                <View style={styles.selectedMasonInfo}>
                  <Image source={{ uri: selectedMason.avatar }} style={styles.selectedAvatar} />
                  <View style={styles.selectedMasonText}>
                    <Text style={styles.selectedMasonName}>{selectedMason.name}</Text>
                    <View style={styles.selectedRating}>
                      <Ionicons name="star" size={14} color="#ffa41c" />
                      <Text style={styles.selectedRatingText}>
                        {selectedMason.rating} ({selectedMason.reviews})
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
                    placeholder="VD: Xây nhà 1 tầng 100m²..."
                    multiline
                    numberOfLines={3}
                    value={bookingData.workType}
                    onChangeText={(text) => setBookingData({ ...bookingData, workType: text })}
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
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#666', width: 95, paddingLeft: 16 },
  filterScroll: { flex: 1 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f5f5f5', marginHorizontal: 4 },
  filterChipActive: { backgroundColor: '#90B44C' },
  filterChipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  resultsBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  resultsText: { fontSize: 13, fontWeight: '600', color: '#333' },
  content: { flex: 1 },
  listContainer: { padding: 16 },
  masonCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  featuredBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#90B44C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1, gap: 4 },
  featuredText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
  headerInfo: { flex: 1, marginLeft: 12 },
  masonName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 6 },
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
  specialtyTag: { backgroundColor: '#fff3e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  specialtyText: { fontSize: 11, fontWeight: '500', color: '#ff9800' },
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
  price: { fontSize: 18, fontWeight: '700', color: '#90B44C' },
  priceUnit: { fontSize: 12, color: '#999' },
  priceSquare: { fontSize: 11, color: '#666', marginTop: 2 },
  bookButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#90B44C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 },
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
  selectedMasonInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 20 },
  selectedAvatar: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#e0e0e0' },
  selectedMasonText: { flex: 1, marginLeft: 12 },
  selectedMasonName: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  selectedRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedRatingText: { fontSize: 12, color: '#666' },
  form: { marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#90B44C' },
  formInput: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#e0e0e0' },
  formTextArea: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#90B44C', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  formNote: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
});
