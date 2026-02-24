import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { makePhoneCall, sendSMS } from '@/utils/phone-actions';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock project data (would come from API)
const PROJECT_DATA: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Chung cư Vinhomes',
    area: '120m²',
    completedDate: '08/2024',
    type: 'Gạch 3D phòng khách',
    description: 'Lát gạch 3D tạo điểm nhấn cho phòng khách, ốp tường phòng tắm.',
    images: [
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    location: 'Quận 1, TP.HCM',
    client: 'Anh Nguyễn Văn A',
    duration: '2 tháng',
    budget: '250 - 300 triệu',
    workers: 'Nguyễn Văn Thợ',
    workerAvatar: 'https://i.pravatar.cc/150?img=8',
    workerPhone: '0901234567',
    materials: [
      'Gạch 3D Ceramic cao cấp',
      'Xi măng chống thấm',
      'Keo dán gạch chuyên dụng',
      'Vữa chà ron',
    ],
    features: [
      'Thiết kế 3D độc đáo tạo điểm nhấn',
      'Chống thấm tuyệt đối',
      'Dễ dàng vệ sinh',
      'Bền màu theo thời gian',
      'Thi công chuyên nghiệp',
    ],
    timeline: [
      { phase: 'Khảo sát & Thiết kế', duration: '3 ngày', status: 'completed' },
      { phase: 'Chuẩn bị mặt bằng', duration: '5 ngày', status: 'completed' },
      { phase: 'Thi công lát gạch', duration: '30 ngày', status: 'completed' },
      { phase: 'Hoàn thiện & Bàn giao', duration: '7 ngày', status: 'completed' },
    ],
    rating: 4.9,
    clientReview: 'Đội thợ làm việc rất chuyên nghiệp và tỉ mỉ. Kết quả vượt mong đợi của gia đình tôi. Sẽ giới thiệu cho bạn bè.',
  },
  '2': {
    id: '2',
    title: 'Nhà phố Thảo Điền',
    area: '180m²',
    completedDate: '05/2024',
    type: 'Gạch granite toàn bộ',
    description: 'Lát gạch granite cao cấp cho toàn bộ tầng trệt và tầng 1.',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
      'https://images.unsplash.com/photo-1600566753051-f0b9d3c2e8bc?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
    ],
    location: 'Quận 2, TP.HCM',
    client: 'Chị Trần Thị B',
    duration: '3 tháng',
    budget: '400 - 500 triệu',
    workers: 'Nguyễn Văn Thợ',
    workerAvatar: 'https://i.pravatar.cc/150?img=8',
    workerPhone: '0901234567',
    materials: [
      'Gạch granite 80x80cm',
      'Keo dán siêu dính',
      'Vữa chống ẩm',
      'Ron gạch cao cấp',
    ],
    features: [
      'Bề mặt granite bóng đẹp',
      'Chống trầy xước tốt',
      'Dễ lau chùi',
      'Sang trọng, hiện đại',
      'Thi công tỉ mỉ',
    ],
    timeline: [
      { phase: 'Khảo sát & Thiết kế', duration: '5 ngày', status: 'completed' },
      { phase: 'Chuẩn bị & Vận chuyển', duration: '7 ngày', status: 'completed' },
      { phase: 'Thi công chính', duration: '50 ngày', status: 'completed' },
      { phase: 'Hoàn thiện', duration: '10 ngày', status: 'completed' },
    ],
    rating: 5.0,
    clientReview: 'Công trình được hoàn thành đúng tiến độ. Chất lượng tuyệt vời!',
  },
  '3': {
    id: '3',
    title: 'Biệt thự An Phú',
    area: '250m²',
    completedDate: '02/2024',
    type: 'Gạch Terrazzo sân vườn',
    description: 'Lát gạch Terrazzo cho sân vườn và lối đi ngoài trời.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    location: 'Quận 9, TP.HCM',
    client: 'Ông Lê Văn C',
    duration: '2.5 tháng',
    budget: '350 - 400 triệu',
    workers: 'Nguyễn Văn Thợ',
    workerAvatar: 'https://i.pravatar.cc/150?img=8',
    workerPhone: '0901234567',
    materials: [
      'Gạch Terrazzo đặc biệt',
      'Xi măng chống thấm ngoài trời',
      'Vữa đặc chủng',
    ],
    features: [
      'Chống trơn trượt',
      'Chịu nắng mưa tốt',
      'Hoa văn độc đáo',
      'Thân thiện môi trường',
    ],
    timeline: [
      { phase: 'Khảo sát', duration: '3 ngày', status: 'completed' },
      { phase: 'Thi công', duration: '45 ngày', status: 'completed' },
      { phase: 'Hoàn thiện', duration: '7 ngày', status: 'completed' },
    ],
    rating: 4.8,
    clientReview: 'Sân vườn đẹp hơn mong đợi. Cảm ơn đội thợ!',
  },
  '4': {
    id: '4',
    title: 'Căn hộ Landmark 81',
    area: '95m²',
    completedDate: '11/2023',
    type: 'Gạch marble phòng ngủ',
    description: 'Lát gạch marble cao cấp cho phòng ngủ master và phòng khách.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
    ],
    location: 'Bình Thạnh, TP.HCM',
    client: 'Chị Phạm Thị D',
    duration: '1.5 tháng',
    budget: '180 - 220 triệu',
    workers: 'Nguyễn Văn Thợ',
    workerAvatar: 'https://i.pravatar.cc/150?img=8',
    workerPhone: '0901234567',
    materials: [
      'Gạch marble nhập khẩu',
      'Keo dán chuyên dụng',
      'Vữa cao cấp',
    ],
    features: [
      'Vân đá tự nhiên đẹp',
      'Sang trọng, tinh tế',
      'Dễ bảo dưỡng',
    ],
    timeline: [
      { phase: 'Khảo sát', duration: '2 ngày', status: 'completed' },
      { phase: 'Thi công', duration: '25 ngày', status: 'completed' },
      { phase: 'Hoàn thiện', duration: '5 ngày', status: 'completed' },
    ],
    rating: 4.9,
    clientReview: 'Rất hài lòng với chất lượng thi công!',
  },
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const project = PROJECT_DATA[id || '1'];

  if (!project) {
    return (
      <Container>
        <View style={styles.notFound}>
          <Ionicons name="folder-open-outline" size={64} color="#999" />
          <Text style={styles.notFoundText}>Không tìm thấy dự án</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const handleCall = () => {
    makePhoneCall(project.workerPhone);
  };

  const handleMessage = () => {
    sendSMS(project.workerPhone, `Xin chào, tôi muốn tìm hiểu thêm về dự án "${project.title}"`);
  };

  return (
    <View style={styles.container}>
      {/* Header with Image Gallery */}
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveImageIndex(index);
        }}
        style={styles.imageGallery}
      >
        {project.images.map((image: string, index: number) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.headerImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageGradient}
            />
          </View>
        ))}
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Image Indicators */}
      <View style={styles.indicators}>
        {project.images.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.indicator,
              activeImageIndex === index && styles.indicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="resize" size={16} color="#666" />
              <Text style={styles.metaText}>{project.area}</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.metaText}>{project.completedDate}</Text>
            </View>
          </View>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{project.type}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        {/* Project Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin dự án</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa điểm</Text>
                <Text style={styles.infoValue}>{project.location}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={18} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Chủ đầu tư</Text>
                <Text style={styles.infoValue}>{project.client}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={18} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>{project.duration}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={18} color={Colors.light.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngân sách</Text>
                <Text style={styles.infoValue}>{project.budget}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vật liệu sử dụng</Text>
          {project.materials.map((material: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.light.success} />
              <Text style={styles.listText}>{material}</Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặc điểm nổi bật</Text>
          {project.features.map((feature: string, index: number) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="star" size={18} color="#FCD34D" />
              <Text style={styles.listText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiến độ thi công</Text>
          {project.timeline.map((phase: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <Ionicons 
                  name={phase.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={24} 
                  color={phase.status === 'completed' ? Colors.light.success : '#ccc'} 
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelinePhase}>{phase.phase}</Text>
                <Text style={styles.timelineDuration}>{phase.duration}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Client Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá của khách hàng</Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(project.rating) ? 'star' : 'star-outline'}
                    size={16}
                    color="#FCD34D"
                  />
                ))}
                <Text style={styles.ratingText}>{project.rating}</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>{project.clientReview}</Text>
            <Text style={styles.reviewAuthor}>- {project.client}</Text>
          </View>
        </View>

        {/* Worker Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thợ thi công</Text>
          <View style={styles.workerCard}>
            <Image source={{ uri: project.workerAvatar }} style={styles.workerAvatar} />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{project.workers}</Text>
              <Text style={styles.workerPhone}>{project.workerPhone}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.contactButton} onPress={handleMessage}>
          <Ionicons name="chatbubbles" size={22} color="#fff" />
          <Text style={styles.contactButtonText}>Nhắn tin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={22} color="#fff" />
          <Text style={styles.callButtonText}>Gọi ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageGallery: {
    height: 350,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 350,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  indicators: {
    position: 'absolute',
    top: 310,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
    marginHorizontal: 8,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelinePhase: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  timelineDuration: {
    fontSize: 13,
    color: '#999',
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  reviewHeader: {
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  reviewAuthor: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  workerPhone: {
    fontSize: 14,
    color: '#666',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 12,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  notFoundText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
