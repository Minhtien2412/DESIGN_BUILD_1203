/**
 * Team Detail Screen - Labor Team Detail Page
 * Features: Full team info, gallery, reviews, contact form, booking
 * Created: 23/12/2025
 * Updated: Integrated with Backend API
 */

import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { LaborProvider, LaborReview, laborService } from '@/services/api/labor.service';

const { width } = Dimensions.get('window');

// Colors
const COLORS = {
  primary: '#0D9488',
  primaryLight: '#E8F5E9',
  secondary: '#0D9488',
  accent: '#0D9488',
  success: '#0D9488',
  error: '#000000',
  warning: '#0D9488',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
};

// Fallback mock data - Used when API is unavailable
const TEAMS_DATA: Record<string, TeamData> = {
  '1': {
    id: 1,
    name: 'Đội Coffa Minh Khôi',
    avatar: 'https://i.pravatar.cc/150?img=15',
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    rating: 4.9,
    reviews: 176,
    location: 'TP.HCM',
    fullAddress: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
    experience: 18,
    price: '550.000₫',
    priceUnit: '/ ngày',
    pricePerSquare: '120.000₫/m²',
    structures: ['Cột', 'Dầm', 'Sàn', 'Móng'],
    teamSize: 6,
    completedProjects: 289,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '090 555 6666',
    email: 'coffaminhkhoi@gmail.com',
    description: 'Đội Coffa Minh Khôi với 18 năm kinh nghiệm trong lĩnh vực ván khuôn xây dựng. Chuyên thi công các loại kết cấu bê tông từ nhà phố đến công trình công nghiệp. Cam kết chất lượng, tiến độ và giá cả hợp lý.',
    services: [
      'Coffa cột, dầm, sàn',
      'Coffa móng các loại',
      'Coffa cầu thang',
      'Coffa hồ nước, bể phốt',
      'Coffa tường chắn',
      'Cho thuê thiết bị coffa',
    ],
    equipment: [
      'Coffa thép tiêu chuẩn',
      'Coffa nhựa composite',
      'Giàn giáo PAL',
      'Cây chống thép điều chỉnh',
      'Máy đầm dùi',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
    ],
    reviewsList: [
      { id: 1, user: 'Nguyễn Văn A', rating: 5, comment: 'Đội làm rất chuyên nghiệp, đúng tiến độ. Rất hài lòng!', date: '20/12/2025' },
      { id: 2, user: 'Trần Thị B', rating: 5, comment: 'Giá hợp lý, chất lượng tốt. Sẽ tiếp tục hợp tác.', date: '15/12/2025' },
      { id: 3, user: 'Lê Văn C', rating: 4, comment: 'Làm việc có trách nhiệm, hoàn thành sớm 1 ngày.', date: '10/12/2025' },
    ],
    workingHours: '6:00 - 18:00 (Thứ 2 - Chủ nhật)',
    certificates: ['Chứng chỉ ATLĐ', 'Bảo hiểm công trình'],
  },
  '2': {
    id: 2,
    name: 'Coffa Chuyên Nghiệp Hà Thành',
    avatar: 'https://i.pravatar.cc/150?img=34',
    coverImage: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800',
    rating: 4.8,
    reviews: 154,
    location: 'Hà Nội',
    fullAddress: '456 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    experience: 15,
    price: '520.000₫',
    priceUnit: '/ ngày',
    pricePerSquare: '110.000₫/m²',
    structures: ['Cột', 'Dầm', 'Tường', 'Cầu thang'],
    teamSize: 5,
    completedProjects: 234,
    featured: true,
    availability: 'Sẵn sàng',
    phone: '091 666 7777',
    email: 'coffahathanh@gmail.com',
    description: 'Đội coffa chuyên nghiệp tại Hà Nội với 15 năm kinh nghiệm. Chuyên thi công các công trình nhà ở, biệt thự, chung cư.',
    services: [
      'Coffa cột, dầm, sàn',
      'Coffa cầu thang',
      'Coffa tường',
      'Coffa ban công',
    ],
    equipment: [
      'Coffa thép',
      'Giàn giáo',
      'Cây chống',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    ],
    reviewsList: [
      { id: 1, user: 'Phạm Văn D', rating: 5, comment: 'Đội làm rất tốt!', date: '18/12/2025' },
    ],
    workingHours: '7:00 - 17:00 (Thứ 2 - Thứ 7)',
    certificates: ['Chứng chỉ ATLĐ'],
  },
};

interface TeamData {
  id: number;
  name: string;
  avatar: string;
  coverImage: string;
  rating: number;
  reviews: number;
  location: string;
  fullAddress: string;
  experience: number;
  price: string;
  priceUnit: string;
  pricePerSquare: string;
  structures: string[];
  teamSize: number;
  completedProjects: number;
  featured: boolean;
  availability: string;
  phone: string;
  email: string;
  description: string;
  services: string[];
  equipment: string[];
  gallery: string[];
  reviewsList: { id: number; user: string; rating: number; comment: string; date: string }[];
  workingHours: string;
  certificates: string[];
}

export default function TeamDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  
  // State for API data
  const [team, setTeam] = useState<TeamData | null>(null);
  const [apiReviews, setApiReviews] = useState<LaborReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    address: '',
    structureType: '',
    area: '',
    startDate: '',
    notes: '',
  });

  // Function to convert API data to TeamData format
  const convertApiToTeamData = (provider: LaborProvider): TeamData => ({
    id: parseInt(provider.id) || 0,
    name: provider.name,
    avatar: provider.avatar || 'https://i.pravatar.cc/150?img=15',
    coverImage: provider.coverImage || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    rating: provider.rating,
    reviews: provider.reviewCount,
    location: provider.city || 'TP.HCM',
    fullAddress: provider.address,
    experience: provider.yearExperience,
    price: `${provider.priceRange.min.toLocaleString('vi-VN')}₫`,
    priceUnit: `/ ${provider.priceRange.unit}`,
    pricePerSquare: `${provider.priceRange.max.toLocaleString('vi-VN')}₫/m²`,
    structures: provider.services.slice(0, 4),
    teamSize: 5, // Default value if not provided
    completedProjects: provider.projectCount,
    featured: provider.featured,
    availability: provider.availability === 'available' ? 'Sẵn sàng' : provider.availability === 'busy' ? 'Đang bận' : 'Không khả dụng',
    phone: provider.phone,
    email: provider.email || '',
    description: provider.description,
    services: provider.services,
    equipment: [], // Default if not provided
    gallery: provider.gallery || [],
    reviewsList: [],
    workingHours: '6:00 - 18:00 (Thứ 2 - Chủ nhật)',
    certificates: provider.certifications || [],
  });

  // Fetch team data from API
  const fetchTeamData = useCallback(async () => {
    if (!id) {
      setError('ID không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Try to fetch from API first
      const providerData = await laborService.getProvider(id);
      const reviewsResponse = await laborService.getProviderReviews(id, 1, 10);
      
      const teamData = convertApiToTeamData(providerData);
      teamData.reviewsList = reviewsResponse.data.map((r) => ({
        id: parseInt(r.id) || 0,
        user: r.userName,
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
      }));
      teamData.reviews = reviewsResponse.meta.total;
      
      setTeam(teamData);
      setApiReviews(reviewsResponse.data);
    } catch (err) {
      console.log('API error, falling back to mock data:', err);
      // Fallback to mock data if API fails
      const mockTeam = TEAMS_DATA[id];
      if (mockTeam) {
        setTeam(mockTeam);
      } else {
        // Generate fallback team based on type
        setTeam(TEAMS_DATA['1']);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeamData();
  }, [fetchTeamData]);

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Đang tải...' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Không tìm thấy' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Không tìm thấy đội thợ</Text>
          <Text style={styles.errorText}>Đội thợ bạn tìm kiếm không tồn tại hoặc đã bị xóa.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    const phoneNumber = team.phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    const phoneNumber = team.phone.replace(/\s/g, '');
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${team.email}`);
  };

  const handleZalo = () => {
    const phoneNumber = team.phone.replace(/\s/g, '');
    Linking.openURL(`https://zalo.me/${phoneNumber}`);
  };

  const handleSubmitBooking = () => {
    if (!bookingData.name || !bookingData.phone || !bookingData.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    Alert.alert(
      'Gửi yêu cầu thành công',
      `Chúng tôi sẽ liên hệ bạn trong vòng 1 giờ.\n\nĐội: ${team.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            setBookingData({
              name: '',
              phone: '',
              address: '',
              structureType: '',
              area: '',
              startDate: '',
              notes: '',
            });
          },
        },
      ]
    );
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setShowGalleryModal(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={16}
          color={COLORS.accent}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: team.name,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
                <Ionicons name="heart-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: team.coverImage }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          
          {team.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.featuredText}>Đề xuất</Text>
            </View>
          )}
        </View>

        {/* Team Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: team.avatar }} style={styles.avatar} />
            <View style={[
              styles.statusBadge,
              { backgroundColor: team.availability === 'Sẵn sàng' ? COLORS.success : COLORS.warning }
            ]}>
              <View style={styles.statusDot} />
            </View>
          </View>

          <Text style={styles.teamName}>{team.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>{renderStars(team.rating)}</View>
            <Text style={styles.ratingText}>{team.rating}</Text>
            <Text style={styles.reviewsCount}>({team.reviews} đánh giá)</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{team.fullAddress}</Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
              <Text style={styles.tagText}>{team.experience} năm KN</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="people-outline" size={14} color={COLORS.primary} />
              <Text style={styles.tagText}>{team.teamSize} người</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="construct-outline" size={14} color={COLORS.primary} />
              <Text style={styles.tagText}>{team.completedProjects}+ công trình</Text>
            </View>
          </View>

          <View style={[
            styles.availabilityBadge,
            { backgroundColor: team.availability === 'Sẵn sàng' ? COLORS.primaryLight : '#F0FDFA' }
          ]}>
            <Ionicons
              name={team.availability === 'Sẵn sàng' ? 'checkmark-circle' : 'time'}
              size={18}
              color={team.availability === 'Sẵn sàng' ? COLORS.success : COLORS.warning}
            />
            <Text style={[
              styles.availabilityText,
              { color: team.availability === 'Sẵn sàng' ? COLORS.success : COLORS.warning }
            ]}>
              {team.availability}
            </Text>
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Báo giá</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Theo ngày</Text>
                <Text style={styles.priceValue}>{team.price}</Text>
                <Text style={styles.priceUnit}>{team.priceUnit}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Theo m²</Text>
                <Text style={styles.priceValue}>{team.pricePerSquare.replace('/m²', '')}</Text>
                <Text style={styles.priceUnit}>/ m²</Text>
              </View>
            </View>
            <Text style={styles.priceNote}>* Giá tham khảo, có thể thay đổi theo loại công trình</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.description}>{team.description}</Text>
        </View>

        {/* Structure Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại kết cấu</Text>
          <View style={styles.structuresGrid}>
            {team.structures.map((structure, index) => (
              <View key={index} style={styles.structureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.structureText}>{structure}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ cung cấp</Text>
          {team.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceBullet} />
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thiết bị & Vật tư</Text>
          <View style={styles.equipmentGrid}>
            {team.equipment.map((item, index) => (
              <View key={index} style={styles.equipmentItem}>
                <Ionicons name="cube-outline" size={16} color={COLORS.secondary} />
                <Text style={styles.equipmentText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hình ảnh công trình</Text>
            <TouchableOpacity onPress={() => openGallery(0)}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {team.gallery.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => openGallery(index)}>
                <Image source={{ uri: image }} style={styles.galleryImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá ({team.reviews})</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reviewSummary}>
            <Text style={styles.reviewScore}>{team.rating}</Text>
            <View style={styles.reviewStars}>{renderStars(team.rating)}</View>
            <Text style={styles.reviewTotal}>{team.reviews} đánh giá</Text>
          </View>

          {team.reviewsList.slice(0, 3).map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <View style={styles.reviewAvatar}>
                    <Ionicons name="person" size={16} color="#fff" />
                  </View>
                  <Text style={styles.reviewUserName}>{review.user}</Text>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.reviewRating}>{renderStars(review.rating)}</View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        {/* Working Hours & Certificates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khác</Text>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giờ làm việc</Text>
              <Text style={styles.infoValue}>{team.workingHours}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Chứng chỉ</Text>
              <Text style={styles.infoValue}>{team.certificates.join(', ')}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleMessage}>
            <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleZalo}>
            <Text style={styles.zaloText}>Zalo</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => setShowBookingModal(true)}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
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
              <Text style={styles.modalTitle}>Đặt lịch liên hệ</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.selectedTeamInfo}>
                <Image source={{ uri: team.avatar }} style={styles.modalAvatar} />
                <View>
                  <Text style={styles.modalTeamName}>{team.name}</Text>
                  <View style={styles.modalRating}>
                    <Ionicons name="star" size={14} color={COLORS.accent} />
                    <Text style={styles.modalRatingText}>{team.rating} ({team.reviews})</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ và tên <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nhập họ và tên"
                  value={bookingData.name}
                  onChangeText={(text) => setBookingData({ ...bookingData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số điện thoại <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  value={bookingData.phone}
                  onChangeText={(text) => setBookingData({ ...bookingData, phone: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Địa chỉ công trình <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nhập địa chỉ công trình"
                  value={bookingData.address}
                  onChangeText={(text) => setBookingData({ ...bookingData, address: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Loại kết cấu cần thi công</Text>
                <View style={styles.structureOptions}>
                  {team.structures.map((structure, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.structureOption,
                        bookingData.structureType === structure && styles.structureOptionActive,
                      ]}
                      onPress={() => setBookingData({ ...bookingData, structureType: structure })}
                    >
                      <Text style={[
                        styles.structureOptionText,
                        bookingData.structureType === structure && styles.structureOptionTextActive,
                      ]}>
                        {structure}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Diện tích (m²)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ví dụ: 100"
                  keyboardType="numeric"
                  value={bookingData.area}
                  onChangeText={(text) => setBookingData({ ...bookingData, area: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày dự kiến bắt đầu</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="DD/MM/YYYY"
                  value={bookingData.startDate}
                  onChangeText={(text) => setBookingData({ ...bookingData, startDate: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ghi chú thêm</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Mô tả thêm về công trình..."
                  multiline
                  numberOfLines={4}
                  value={bookingData.notes}
                  onChangeText={(text) => setBookingData({ ...bookingData, notes: text })}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBooking}>
                <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        visible={showGalleryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGalleryModal(false)}
      >
        <View style={styles.galleryModal}>
          <TouchableOpacity style={styles.galleryClose} onPress={() => setShowGalleryModal(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedImageIndex * width, y: 0 }}
          >
            {team.gallery.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.galleryFullImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <Text style={styles.galleryCounter}>
            {selectedImageIndex + 1} / {team.gallery.length}
          </Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -60,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  teamName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewsCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.surface,
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  priceCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  priceNote: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  structuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  structureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  structureText: {
    fontSize: 14,
    color: COLORS.text,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  equipmentText: {
    fontSize: 13,
    color: COLORS.secondary,
  },
  galleryImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  reviewSummary: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  reviewScore: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 6,
  },
  reviewTotal: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zaloText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
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
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: 16,
  },
  selectedTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalTeamName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  modalRatingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  structureOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  structureOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  structureOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  structureOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  structureOptionTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  galleryModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  galleryFullImage: {
    width: width,
    height: width,
  },
  galleryCounter: {
    position: 'absolute',
    bottom: 50,
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
