import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock portfolio data
const PORTFOLIO_PROJECTS = [
  {
    id: 1,
    title: 'Biệt thự cao cấp Phú Mỹ Hưng',
    image: 'https://picsum.photos/400/300?random=1',
    area: '450m²',
    type: 'Gạch ceramic cao cấp',
    completedDate: '10/2024',
    description: 'Lát gạch toàn bộ biệt thự 3 tầng, bao gồm phòng khách, phòng ngủ, bếp và sân vườn.',
  },
  {
    id: 2,
    title: 'Nhà phố hiện đại Quận 7',
    image: 'https://picsum.photos/400/300?random=2',
    area: '280m²',
    type: 'Gạch granite',
    completedDate: '09/2024',
    description: 'Thi công lát gạch granite chống trơn cho sân thượng và ban công.',
  },
  {
    id: 3,
    title: 'Chung cư Vinhomes',
    image: 'https://picsum.photos/400/300?random=3',
    area: '120m²',
    type: 'Gạch 3D phòng khách',
    completedDate: '08/2024',
    description: 'Lát gạch 3D tạo điểm nhấn cho phòng khách, ốp tường phòng tắm.',
  },
  {
    id: 4,
    title: 'Khách sạn mini 8 tầng',
    image: 'https://picsum.photos/400/300?random=4',
    area: '650m²',
    type: 'Gạch ceramic + mosaic',
    completedDate: '07/2024',
    description: 'Thi công toàn bộ hệ thống lát gạch cho 15 phòng và khu vực chung.',
  },
];

const CERTIFICATIONS = [
  { id: 1, name: 'Chứng chỉ thi công gạch cao cấp', year: '2020' },
  { id: 2, name: 'Huấn luyện an toàn lao động', year: '2021' },
  { id: 3, name: 'Chứng nhận thi công gạch 3D', year: '2022' },
];

const REVIEWS = [
  {
    id: 1,
    author: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/100?img=8',
    rating: 5,
    date: '15/11/2024',
    content: 'Đội thợ làm việc rất chuyên nghiệp, tỉ mỉ từng chi tiết. Lát gạch rất đẹp và chuẩn mực. Recommend!',
    project: 'Biệt thự Phú Mỹ Hưng',
  },
  {
    id: 2,
    author: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/100?img=20',
    rating: 5,
    date: '08/11/2024',
    content: 'Giá cả hợp lý, tiến độ đúng hẹn. Anh Tuấn tư vấn nhiệt tình, giải đáp mọi thắc mắc.',
    project: 'Nhà phố Quận 7',
  },
  {
    id: 3,
    author: 'Phạm Văn C',
    avatar: 'https://i.pravatar.cc/100?img=33',
    rating: 4,
    date: '01/11/2024',
    content: 'Tốt, làm việc nhanh. Có chút delay vì vật liệu nhưng đội đã khắc phục kịp thời.',
    project: 'Chung cư Vinhomes',
  },
];

export default function WorkerProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const workerId = params.id;
  
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'info'>('portfolio');

  // Mock worker data (in real app, fetch from API using workerId)
  const worker = {
    id: workerId,
    name: 'Đội Lát Gạch Minh Tuấn',
    avatar: 'https://i.pravatar.cc/200?img=17',
    rating: 4.9,
    reviews: 213,
    location: 'TP.HCM',
    experience: 18,
    price: '180.000₫',
    priceUnit: '/ m²',
    specialties: ['Gạch ceramic', 'Gạch granite', 'Gạch 3D', 'Gạch mosaic'],
    teamSize: 4,
    completedProjects: 387,
    availability: 'Sẵn sàng',
    phone: '090 111 2222',
    pricePerDay: '550.000₫/ngày',
    bio: 'Với hơn 18 năm kinh nghiệm trong nghề lát gạch, đội của chúng tôi cam kết mang đến chất lượng thi công hoàn hảo nhất. Chuyên thi công các loại gạch cao cấp cho biệt thự, nhà phố, chung cư và các công trình thương mại.',
    services: [
      'Lát gạch phòng khách, phòng ngủ',
      'Ốp gạch phòng tắm, bếp',
      'Lát gạch sân vườn, ban công',
      'Thi công gạch 3D, mosaic',
      'Tu sửa, thay thế gạch cũ',
    ],
  };

  const handleCall = () => {
    Linking.openURL(`tel:${worker.phone.replace(/\s/g, '')}`);
  };

  const handleMessage = () => {
    // Navigate to chat or open SMS
    Linking.openURL(`sms:${worker.phone.replace(/\s/g, '')}`);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-outline'}
            size={16}
            color="#FFA41C"
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Hồ sơ thợ',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
        }}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Image source={{ uri: worker.avatar }} style={styles.largeAvatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <View style={styles.ratingRow}>
                {renderStars(worker.rating)}
                <Text style={styles.ratingText}>{worker.rating}</Text>
                <Text style={styles.reviewCount}>({worker.reviews})</Text>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#999" />
                <Text style={styles.locationText}>{worker.location}</Text>
                <View style={styles.dot} />
                <Ionicons name="time" size={14} color="#999" />
                <Text style={styles.locationText}>{worker.experience} năm</Text>
              </View>
            </View>
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesSection}>
            <Text style={styles.sectionLabel}>Chuyên môn:</Text>
            <View style={styles.specialtiesWrap}>
              {worker.specialties.map((spec, index) => (
                <View key={index} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.completedProjects}+</Text>
              <Text style={styles.statLabel}>Công trình</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.teamSize} người</Text>
              <Text style={styles.statLabel}>Đội ngũ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.light.success, fontSize: 14 }]}>
                {worker.availability}
              </Text>
              <Text style={styles.statLabel}>Tình trạng</Text>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{worker.bio}</Text>
          </View>

          {/* Price & Actions */}
          <View style={styles.priceActionRow}>
            <View>
              <Text style={styles.priceValue}>{worker.price}</Text>
              <Text style={styles.priceUnit}>{worker.priceUnit}</Text>
              <Text style={styles.priceAlt}>hoặc {worker.pricePerDay}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callButtonText}>Gọi ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                <Ionicons name="chatbubbles" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'portfolio' && styles.tabActive]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.tabTextActive]}>
              Công trình ({PORTFOLIO_PROJECTS.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
              Đánh giá ({REVIEWS.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
              Thông tin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'portfolio' && (
            <View>
              {PORTFOLIO_PROJECTS.map((project) => (
                <TouchableOpacity 
                  key={project.id} 
                  style={styles.projectCard}
                  onPress={() => router.push(`/finishing/project-detail/${project.id}`)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: project.image }} style={styles.projectImage} />
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View style={styles.projectMeta}>
                      <Ionicons name="resize" size={14} color="#666" />
                      <Text style={styles.projectMetaText}>{project.area}</Text>
                      <View style={styles.dot} />
                      <Ionicons name="calendar" size={14} color="#666" />
                      <Text style={styles.projectMetaText}>{project.completedDate}</Text>
                    </View>
                    <View style={styles.projectTypeTag}>
                      <Text style={styles.projectTypeText}>{project.type}</Text>
                    </View>
                    <Text style={styles.projectDesc}>{project.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {REVIEWS.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                    <View style={styles.reviewHeaderInfo}>
                      <Text style={styles.reviewAuthor}>{review.author}</Text>
                      <View style={styles.reviewMeta}>
                        {renderStars(review.rating)}
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewContent}>{review.content}</Text>
                  <View style={styles.reviewProject}>
                    <Ionicons name="briefcase-outline" size={12} color="#999" />
                    <Text style={styles.reviewProjectText}>{review.project}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'info' && (
            <View>
              {/* Services */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Dịch vụ cung cấp</Text>
                {worker.services.map((service, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.light.success} />
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>

              {/* Certifications */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Chứng chỉ & Đào tạo</Text>
                {CERTIFICATIONS.map((cert) => (
                  <View key={cert.id} style={styles.certItem}>
                    <Ionicons name="ribbon" size={18} color={Colors.light.primary} />
                    <View style={styles.certInfo}>
                      <Text style={styles.certName}>{cert.name}</Text>
                      <Text style={styles.certYear}>Năm {cert.year}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Contact Info */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Liên hệ</Text>
                <View style={styles.contactItem}>
                  <Ionicons name="call" size={18} color="#666" />
                  <Text style={styles.contactText}>{worker.phone}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="location" size={18} color="#666" />
                  <Text style={styles.contactText}>Khu vực: {worker.location}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  specialtiesSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  specialtiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  specialtyText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  bioSection: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: '#999',
  },
  priceAlt: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.success,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: 12,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  projectInfo: {
    padding: 12,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  projectTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  projectTypeText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
  },
  projectDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  reviewHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  reviewContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 8,
  },
  reviewProject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewProjectText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  serviceText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  certYear: {
    fontSize: 11,
    color: '#999',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 13,
    color: '#666',
  },
});
