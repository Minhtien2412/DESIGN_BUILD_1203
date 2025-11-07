import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data - Quality Consultants
const CONSULTANTS = [
  {
    id: 1,
    name: 'KS. Nguyễn Văn An',
    specialty: 'Giám định kết cấu',
    experience: 15,
    education: 'Đại học Xây dựng Hà Nội',
    rating: 4.9,
    reviews: 127,
    rate: '800.000₫',
    rateUnit: '/ buổi',
    image: 'https://i.pravatar.cc/150?img=12',
    certifications: ['Kỹ sư xây dựng dân dụng', 'Chứng chỉ giám định'],
    languages: ['Tiếng Việt', 'English'],
    availability: 'Sáng thứ 2-6',
    projects: 150,
    featured: true,
  },
  {
    id: 2,
    name: 'KS. Trần Thị Hoa',
    specialty: 'Tư vấn chất lượng vật liệu',
    experience: 12,
    education: 'Đại học Bách Khoa TP.HCM',
    rating: 4.8,
    reviews: 98,
    rate: '750.000₫',
    rateUnit: '/ buổi',
    image: 'https://i.pravatar.cc/150?img=47',
    certifications: ['Kỹ sư vật liệu xây dựng', 'Chuyên gia chất lượng'],
    languages: ['Tiếng Việt'],
    availability: 'Chiều thứ 2-6',
    projects: 120,
    featured: true,
  },
  {
    id: 3,
    name: 'KS. Lê Minh Tuấn',
    specialty: 'Giám định an toàn công trình',
    experience: 18,
    education: 'Đại học Xây dựng',
    rating: 5.0,
    reviews: 156,
    rate: '900.000₫',
    rateUnit: '/ buổi',
    image: 'https://i.pravatar.cc/150?img=33',
    certifications: ['Kỹ sư xây dựng công trình', 'Chứng chỉ an toàn lao động'],
    languages: ['Tiếng Việt', 'English', '日本語'],
    availability: 'Linh hoạt',
    projects: 200,
    featured: false,
  },
  {
    id: 4,
    name: 'KS. Phạm Thu Hằng',
    specialty: 'Tư vấn thiết kế kỹ thuật',
    experience: 10,
    education: 'Đại học Kiến trúc TP.HCM',
    rating: 4.7,
    reviews: 84,
    rate: '700.000₫',
    rateUnit: '/ buổi',
    image: 'https://i.pravatar.cc/150?img=45',
    certifications: ['Kỹ sư kiến trúc', 'Tư vấn giám sát'],
    languages: ['Tiếng Việt', 'English'],
    availability: 'Sáng & chiều thứ 3-7',
    projects: 95,
    featured: false,
  },
  {
    id: 5,
    name: 'KS. Hoàng Đức Minh',
    specialty: 'Kiểm định chất lượng thi công',
    experience: 14,
    education: 'Đại học Xây dựng Miền Trung',
    rating: 4.9,
    reviews: 112,
    rate: '850.000₫',
    rateUnit: '/ buổi',
    image: 'https://i.pravatar.cc/150?img=68',
    certifications: ['Kỹ sư xây dựng', 'ISO 9001 Lead Auditor'],
    languages: ['Tiếng Việt'],
    availability: 'Thứ 2-6',
    projects: 140,
    featured: false,
  },
  {
    id: 6,
    name: 'KS. Vũ Thị Mai',
    specialty: 'Tư vấn mua nhà & nghiệm thu',
    experience: 8,
    education: 'Đại học Kinh tế Xây dựng',
    rating: 4.8,
    reviews: 67,
    rate: '650.000₫',
    rateUnit: '/ buổi',
    image: 'https://i.pravatar.cc/150?img=20',
    certifications: ['Kỹ sư xây dựng', 'Chứng chỉ thẩm định giá'],
    languages: ['Tiếng Việt', 'English'],
    availability: 'Cuối tuần',
    projects: 80,
    featured: false,
  },
];

const SPECIALTIES = [
  'Tất cả',
  'Giám định kết cấu',
  'Chất lượng vật liệu',
  'An toàn công trình',
  'Thiết kế kỹ thuật',
  'Kiểm định thi công',
  'Nghiệm thu',
];

const SORT_OPTIONS = [
  { label: 'Đề xuất', value: 'featured' },
  { label: 'Đánh giá cao', value: 'rating' },
  { label: 'Kinh nghiệm nhiều', value: 'experience' },
  { label: 'Giá thấp', value: 'price_asc' },
  { label: 'Giá cao', value: 'price_desc' },
];

interface ConsultantCardProps {
  consultant: any;
  onPress: () => void;
  onBooking: () => void;
}

const ConsultantCard: React.FC<ConsultantCardProps> = ({ consultant, onPress, onBooking }) => {
  return (
    <TouchableOpacity
      style={styles.consultantCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {consultant.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.featuredText}>Nổi bật</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        {/* Avatar & Basic Info */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: consultant.image }} style={styles.avatar} />
          
          <View style={styles.headerInfo}>
            <Text style={styles.consultantName}>{consultant.name}</Text>
            <Text style={styles.specialty}>{consultant.specialty}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color="#ffa41c" />
                <Text style={styles.statText}>{consultant.rating}</Text>
                <Text style={styles.statSubtext}>({consultant.reviews})</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="briefcase-outline" size={14} color="#666" />
                <Text style={styles.statText}>{consultant.experience} năm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Education & Certifications */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{consultant.education}</Text>
          </View>
          
          <View style={styles.certRow}>
            {consultant.certifications.slice(0, 2).map((cert: string, index: number) => (
              <View key={index} style={styles.certBadge}>
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color="#999" />
            <Text style={styles.infoItemText}>{consultant.availability}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="language-outline" size={14} color="#999" />
            <Text style={styles.infoItemText}>{consultant.languages.join(', ')}</Text>
          </View>
        </View>

        {/* Price & Action */}
        <View style={styles.cardFooter}>
          <View style={styles.priceSection}>
            <Text style={styles.price}>{consultant.rate}</Text>
            <Text style={styles.priceUnit}>{consultant.rateUnit}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.bookButton}
            onPress={onBooking}
          >
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.bookButtonText}>Đặt lịch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function QualityConsultingScreen() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);

  const filteredConsultants = CONSULTANTS.filter((consultant) => {
    const matchSpecialty =
      selectedSpecialty === 'Tất cả' ||
      consultant.specialty.includes(selectedSpecialty);
    const matchSearch =
      searchQuery === '' ||
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSpecialty && matchSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return b.featured ? 1 : -1;
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.experience - a.experience;
      case 'price_asc':
        return parseInt(a.rate.replace(/\D/g, '')) - parseInt(b.rate.replace(/\D/g, ''));
      case 'price_desc':
        return parseInt(b.rate.replace(/\D/g, '')) - parseInt(a.rate.replace(/\D/g, ''));
      default:
        return 0;
    }
  });

  const handleBooking = (consultant: any) => {
    setSelectedConsultant(consultant);
  };

  const handleCallConsultant = () => {
    Linking.openURL('tel:1900123456');
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-outline'}
            size={16}
            color="#ffa41c"
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tư vấn chất lượng',
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
              placeholder="Tìm chuyên gia, chuyên môn..."
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

        {/* Specialty Filter */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {SPECIALTIES.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.filterChip,
                  selectedSpecialty === specialty && styles.filterChipActive,
                ]}
                onPress={() => setSelectedSpecialty(specialty)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSpecialty === specialty && styles.filterChipTextActive,
                  ]}
                >
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Info */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {filteredConsultants.length} chuyên gia
          </Text>
          <Text style={styles.sortLabel}>
            {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
          </Text>
        </View>

        {/* Consultants List */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {filteredConsultants.map((consultant) => (
            <ConsultantCard
              key={consultant.id}
              consultant={consultant}
              onPress={() => {}}
              onBooking={() => handleBooking(consultant)}
            />
          ))}

          {/* Empty State */}
          {filteredConsultants.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy chuyên gia phù hợp</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedSpecialty('Tất cả');
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
          <Ionicons name="information-circle-outline" size={16} color={Colors.light.info} />
          <Text style={styles.infoBannerText}>
            Tư vấn miễn phí 15 phút đầu tiên • Hỗ trợ 24/7
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
        visible={selectedConsultant !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedConsultant(null)}
      >
        <View style={styles.bookingModalOverlay}>
          <View style={styles.bookingModalContent}>
            <View style={styles.bookingModalHeader}>
              <Text style={styles.bookingModalTitle}>Đặt lịch tư vấn</Text>
              <TouchableOpacity onPress={() => setSelectedConsultant(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedConsultant && (
              <ScrollView style={styles.bookingModalBody}>
                {/* Consultant Info */}
                <View style={styles.bookingConsultantInfo}>
                  <Image
                    source={{ uri: selectedConsultant.image }}
                    style={styles.bookingAvatar}
                  />
                  <View style={styles.bookingConsultantText}>
                    <Text style={styles.bookingConsultantName}>
                      {selectedConsultant.name}
                    </Text>
                    <Text style={styles.bookingConsultantSpecialty}>
                      {selectedConsultant.specialty}
                    </Text>
                    {renderStars(selectedConsultant.rating)}
                  </View>
                </View>

                {/* Service Info */}
                <View style={styles.serviceInfoBox}>
                  <View style={styles.serviceInfoRow}>
                    <Text style={styles.serviceInfoLabel}>Phí tư vấn</Text>
                    <Text style={styles.serviceInfoValue}>
                      {selectedConsultant.rate}
                      <Text style={styles.serviceInfoUnit}>{selectedConsultant.rateUnit}</Text>
                    </Text>
                  </View>
                  <View style={styles.serviceInfoRow}>
                    <Text style={styles.serviceInfoLabel}>Thời gian khả dụng</Text>
                    <Text style={styles.serviceInfoValue}>
                      {selectedConsultant.availability}
                    </Text>
                  </View>
                  <View style={styles.serviceInfoRow}>
                    <Text style={styles.serviceInfoLabel}>Số dự án đã tư vấn</Text>
                    <Text style={styles.serviceInfoValue}>
                      {selectedConsultant.projects}+
                    </Text>
                  </View>
                </View>

                {/* Contact Options */}
                <View style={styles.contactSection}>
                  <Text style={styles.contactTitle}>Liên hệ đặt lịch</Text>
                  
                  <TouchableOpacity
                    style={styles.contactOption}
                    onPress={handleCallConsultant}
                  >
                    <View style={styles.contactOptionIcon}>
                      <Ionicons name="call" size={20} color={Colors.light.primary} />
                    </View>
                    <View style={styles.contactOptionText}>
                      <Text style={styles.contactOptionLabel}>Gọi điện thoại</Text>
                      <Text style={styles.contactOptionSub}>1900 123 456</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactOption}>
                    <View style={styles.contactOptionIcon}>
                      <Ionicons name="chatbubbles" size={20} color="#4caf50" />
                    </View>
                    <View style={styles.contactOptionText}>
                      <Text style={styles.contactOptionLabel}>Nhắn tin Zalo</Text>
                      <Text style={styles.contactOptionSub}>Phản hồi trong 5 phút</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactOption}>
                    <View style={styles.contactOptionIcon}>
                      <Ionicons name="mail" size={20} color="#2196f3" />
                    </View>
                    <View style={styles.contactOptionText}>
                      <Text style={styles.contactOptionLabel}>Gửi email</Text>
                      <Text style={styles.contactOptionSub}>Phản hồi trong 24h</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                </View>

                {/* Notes */}
                <View style={styles.notesSection}>
                  <Ionicons name="information-circle" size={16} color="#999" />
                  <Text style={styles.notesText}>
                    Vui lòng đặt lịch trước ít nhất 2 ngày. Bạn sẽ nhận được xác nhận qua email/SMS.
                  </Text>
                </View>
              </ScrollView>
            )}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 13,
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
  consultantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  consultantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statSubtext: {
    fontSize: 11,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  certRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  certBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  certText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#2196f3',
  },
  additionalInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoItemText: {
    fontSize: 11,
    color: '#999',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 13,
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
    backgroundColor: '#ee4d2d',
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
    color: Colors.light.info,
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
    maxHeight: '85%',
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
  bookingConsultantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  bookingConsultantText: {
    flex: 1,
    marginLeft: 12,
  },
  bookingConsultantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  bookingConsultantSpecialty: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  serviceInfoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  serviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceInfoLabel: {
    fontSize: 13,
    color: '#666',
  },
  serviceInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  serviceInfoUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
  },
  contactSection: {
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  contactOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  contactOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactOptionSub: {
    fontSize: 12,
    color: '#999',
  },
  notesSection: {
    flexDirection: 'row',
    backgroundColor: '#fff9e6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
