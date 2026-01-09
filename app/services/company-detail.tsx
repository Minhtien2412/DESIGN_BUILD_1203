import { useUnifiedMessaging } from '@/hooks/crm/useUnifiedMessaging';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Mock data - sẽ thay bằng API
const COMPANY_DETAIL = {
  id: 1,
  name: 'Công ty Thiết kế A&A',
  logo: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
  coverImage: require('@/assets/images/react-logo.webp'),
  rating: 4.8,
  reviewCount: 256,
  projectCount: 150,
  establishedYear: 2015,
  location: 'Hà Nội',
  address: '123 Nguyễn Trãi, Thanh Xuân, Hà Nội',
  phone: '0123 456 789',
  email: 'contact@aanda.vn',
  website: 'https://aanda.vn',
  description:
    'Công ty thiết kế kiến trúc A&A chuyên cung cấp dịch vụ thiết kế nhà ở cao cấp, biệt thự, nhà phố với phong cách hiện đại và sang trọng. Đội ngũ kiến trúc sư giàu kinh nghiệm, tư vấn nhiệt tình.',
  specialties: ['Biệt thự', 'Nhà phố', 'Nhà vườn', 'Resort'],
  services: [
    { id: 1, name: 'Thiết kế kiến trúc', price: '5.000.000₫/m²' },
    { id: 2, name: 'Thiết kế nội thất', price: '3.000.000₫/m²' },
    { id: 3, name: 'Thi công trọn gói', price: '8.000.000₫/m²' },
    { id: 4, name: 'Giám sát thi công', price: '2.000.000₫/tháng' },
  ],
  portfolio: [
    {
      id: 1,
      title: 'Biệt thự hiện đại 2 tầng',
      location: 'Hà Nội',
      area: '250m²',
      year: 2024,
      image: require('@/assets/images/react-logo.webp'),
    },
    {
      id: 2,
      title: 'Nhà phố 3 tầng',
      location: 'TP.HCM',
      area: '180m²',
      year: 2024,
      image: require('@/assets/images/react-logo.webp'),
    },
    {
      id: 3,
      title: 'Villa sang trọng',
      location: 'Đà Nẵng',
      area: '400m²',
      year: 2023,
      image: require('@/assets/images/react-logo.webp'),
    },
    {
      id: 4,
      title: 'Nhà vườn 1 tầng',
      location: 'Bình Dương',
      area: '300m²',
      year: 2023,
      image: require('@/assets/images/react-logo.webp'),
    },
  ],
  reviews: [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      avatar: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
      rating: 5,
      date: '15/10/2024',
      comment:
        'Đội ngũ thiết kế rất chuyên nghiệp, tư vấn tận tình. Thiết kế đẹp và phù hợp với nhu cầu gia đình.',
    },
    {
      id: 2,
      user: 'Trần Thị B',
      avatar: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
      rating: 4,
      date: '20/09/2024',
      comment: 'Thiết kế đẹp, thi công nhanh. Giá cả hợp lý.',
    },
    {
      id: 3,
      user: 'Lê Văn C',
      avatar: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'),
      rating: 5,
      date: '05/08/2024',
      comment: 'Rất hài lòng với dịch vụ. Sẽ giới thiệu cho bạn bè.',
    },
  ],
};

const TABS = [
  { id: 'about', name: 'Giới thiệu', icon: 'information-circle-outline' },
  { id: 'services', name: 'Dịch vụ', icon: 'briefcase-outline' },
  { id: 'portfolio', name: 'Dự án', icon: 'images-outline' },
  { id: 'reviews', name: 'Đánh giá', icon: 'star-outline' },
];

export default function CompanyDetailScreen() {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('about');
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultingServiceId, setConsultingServiceId] = useState<number | null>(null);
  
  const { getOrCreateConversation } = useUnifiedMessaging();

  const handleCall = () => {
    Linking.openURL(`tel:${COMPANY_DETAIL.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${COMPANY_DETAIL.email}`);
  };

  const handleWebsite = () => {
    Linking.openURL(COMPANY_DETAIL.website);
  };
  
  // Handle consult button - navigate to chat
  const handleConsult = async (serviceId?: number, serviceName?: string) => {
    try {
      if (serviceId) {
        setConsultingServiceId(serviceId);
      } else {
        setIsConsulting(true);
      }
      const conversationId = await getOrCreateConversation({
        userId: COMPANY_DETAIL.id,
        userName: COMPANY_DETAIL.name,
        userRole: serviceName ? `DESIGN_${serviceName.toUpperCase()}` : 'DESIGN_COMPANY',
      });
      router.push(`/messages/chat/${conversationId}` as `/messages/chat/${string}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsConsulting(false);
      setConsultingServiceId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-outline'}
            size={16}
            color="#0066CC"
          />
        ))}
      </View>
    );
  };

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Về chúng tôi</Text>
        <Text style={styles.description}>{COMPANY_DETAIL.description}</Text>
      </View>

      {/* Specialties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chuyên môn</Text>
        <View style={styles.specialtyGrid}>
          {COMPANY_DETAIL.specialties.map((specialty, idx) => (
            <View key={idx} style={styles.specialtyChip}>
              <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
              <Text style={styles.specialtyChipText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        
        <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{COMPANY_DETAIL.phone}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{COMPANY_DETAIL.email}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{COMPANY_DETAIL.address}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} onPress={handleWebsite}>
          <Ionicons name="globe-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{COMPANY_DETAIL.website}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bảng giá dịch vụ</Text>
        {COMPANY_DETAIL.services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.servicePrice}>{service.price}</Text>
            </View>
            <TouchableOpacity 
              style={styles.serviceButton}
              onPress={() => handleConsult(service.id, service.name)}
              disabled={consultingServiceId === service.id}
            >
              {consultingServiceId === service.id ? (
                <ActivityIndicator size="small" color="#0066CC" />
              ) : (
                <Text style={styles.serviceButtonText}>Tư vấn</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.portfolioGrid}>
        {COMPANY_DETAIL.portfolio.map((project) => (
          <TouchableOpacity key={project.id} style={styles.portfolioCard}>
            <Image source={project.image} style={styles.portfolioImage} />
            <View style={styles.portfolioInfo}>
              <Text style={styles.portfolioTitle} numberOfLines={2}>
                {project.title}
              </Text>
              <View style={styles.portfolioMeta}>
                <Ionicons name="location" size={12} color="#999" />
                <Text style={styles.portfolioMetaText}>{project.location}</Text>
              </View>
              <View style={styles.portfolioMeta}>
                <Ionicons name="resize" size={12} color="#999" />
                <Text style={styles.portfolioMetaText}>{project.area}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      {/* Rating Summary */}
      <View style={styles.ratingSummary}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingNumber}>{COMPANY_DETAIL.rating}</Text>
          {renderStars(COMPANY_DETAIL.rating)}
          <Text style={styles.ratingCount}>
            {COMPANY_DETAIL.reviewCount} đánh giá
          </Text>
        </View>
        <TouchableOpacity style={styles.writeReviewButton}>
          <Ionicons name="create-outline" size={18} color="#0066CC" />
          <Text style={styles.writeReviewText}>Viết đánh giá</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <View style={styles.section}>
        {COMPANY_DETAIL.reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={review.avatar} style={styles.reviewAvatar} />
              <View style={styles.reviewUserInfo}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                <View style={styles.reviewMeta}>
                  {renderStars(review.rating)}
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: COMPANY_DETAIL.name,
          headerStyle: { backgroundColor: '#0066CC' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          <Image source={COMPANY_DETAIL.coverImage} style={styles.coverImage} />

          {/* Company Header */}
          <View style={styles.header}>
            <Image source={COMPANY_DETAIL.logo} style={styles.logo} />
            <View style={styles.headerInfo}>
              <Text style={styles.companyName}>{COMPANY_DETAIL.name}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#0066CC" />
                  <Text style={styles.statText}>{COMPANY_DETAIL.rating}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Ionicons name="briefcase-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{COMPANY_DETAIL.projectCount} dự án</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{COMPANY_DETAIL.establishedYear}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={18}
                    color={activeTab === tab.id ? '#0066CC' : '#999'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.tabTextActive,
                    ]}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content */}
          {activeTab === 'about' && renderAboutTab()}
          {activeTab === 'services' && renderServicesTab()}
          {activeTab === 'portfolio' && renderPortfolioTab()}
          {activeTab === 'reviews' && renderReviewsTab()}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#0066CC" />
            <Text style={styles.actionButtonSecondaryText}>Gọi điện</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButtonPrimary}
            onPress={() => handleConsult()}
            disabled={isConsulting}
          >
            {isConsulting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                <Text style={styles.actionButtonPrimaryText}>Liên hệ ngay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specialtyChipText: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '600',
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0066CC',
  },
  serviceButton: {
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  serviceButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  portfolioCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  portfolioImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  portfolioInfo: {
    padding: 10,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  portfolioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  portfolioMetaText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  ratingSummary: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLeft: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#999',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    marginLeft: 6,
  },
  reviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  reviewUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    marginLeft: 6,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
});

