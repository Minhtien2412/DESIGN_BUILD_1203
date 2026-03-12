import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import PortfolioService, { type ArchitectureProject } from '@/services/portfolioService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ArchitectureDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'textMuted');

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [project, setProject] = useState<ArchitectureProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      
      const data = await PortfolioService.getProjectById(params.id || '1');
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Không thể tải thông tin dự án');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProject(true);
  }, [fetchProject]);

  const handleViewFloorPlan = () => {
    alert('Xem mặt bằng dự án');
    // TODO: Navigate to floor plan viewer
  };

  const handleContactDesigner = () => {
    if (project?.designer?.phone) {
      alert(`Liên hệ: ${project.designer.name}\nSĐT: ${project.designer.phone}`);
    } else {
      alert('Liên hệ nhà thiết kế');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container style={{ backgroundColor }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: mutedColor }]}>Đang tải...</Text>
        </View>
      </Container>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <Container style={{ backgroundColor }}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#DC2626" />
          <Text style={[styles.errorText, { color: textColor }]}>
            {error || 'Không tìm thấy dự án'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={() => fetchProject()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={{ color: primaryColor }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const images = project.images || [project.image];

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Main Image Gallery */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {selectedImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        {/* Thumbnail Gallery */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
        >
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImageIndex(index)}
              style={[
                styles.thumbnail,
                selectedImageIndex === index && styles.thumbnailActive,
              ]}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Project Info */}
        <View style={styles.contentSection}>
          <Text style={[styles.projectTitle, { color: textColor }]}>
            {project.title}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={[styles.locationText, { color: '#666' }]}>
              {project.location} - {project.district}, {project.city}
            </Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#FFFFFF" />
            <Text style={[styles.ratingText, { color: textColor }]}>
              {project.rating}
            </Text>
            <Text style={[styles.reviewsText, { color: '#666' }]}>
              ({project.reviews} Đánh giá)
            </Text>
          </View>

          {/* Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <View style={[styles.specIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="bed-outline" size={24} color={primaryColor} />
              </View>
              <Text style={[styles.specLabel, { color: textColor }]}>
                {project.bedrooms} Phòng ngủ
              </Text>
            </View>

            <View style={styles.specItem}>
              <View style={[styles.specIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="water-outline" size={24} color={primaryColor} />
              </View>
              <Text style={[styles.specLabel, { color: textColor }]}>
                {project.bathrooms} Phòng tắm
              </Text>
            </View>

            <View style={styles.specItem}>
              <View style={[styles.specIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="tv-outline" size={24} color={primaryColor} />
              </View>
              <Text style={[styles.specLabel, { color: textColor }]}>
                {project.livingRooms} Phòng khách
              </Text>
            </View>

            <View style={styles.specItem}>
              <View style={[styles.specIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="restaurant-outline" size={24} color={primaryColor} />
              </View>
              <Text style={[styles.specLabel, { color: textColor }]}>
                {project.kitchens} Phòng bếp
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Mô tả</Text>
          <Text style={[styles.descriptionText, { color: '#666' }]}>
            {project.description || 'Chưa có mô tả'}
          </Text>
        </View>

        {/* Features */}
        {project.features && project.features.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Đặc điểm nổi bật</Text>
            {project.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={primaryColor} />
                <Text style={[styles.featureText, { color: '#666' }]}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Location Section */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Vị trí</Text>
          <Text style={[styles.locationDetail, { color: '#666' }]}>
            Đường D9, Khu Dân Cư Phú Mỹ Hưng, Quận 7, Thành Phố Hồ Chí Minh
          </Text>
        </View>

        {/* Area Info */}
        <View style={[styles.areaCard, { backgroundColor: primaryColor + '10' }]}>
          <View style={styles.areaHeader}>
            <Text style={[styles.areaSize, { color: primaryColor }]}>
              10mx20m, 3 Tầng
            </Text>
          </View>
          <Text style={[styles.areaLabel, { color: textColor }]}>
            Diện tích sử dụng: {project.area}m2
          </Text>
          <Text style={[styles.areaNote, { color: '#666' }]}>
            Tối ưu công năng và không gian
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.outlineButton]}
            onPress={handleContactDesigner}
          >
            <Ionicons name="chatbubble-outline" size={20} color={primaryColor} />
            <Text style={[styles.outlineButtonText, { color: primaryColor }]}>
              Liên hệ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleViewFloorPlan}
          >
            <Ionicons name="document-text-outline" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Xem Mặt Bằng Dự án</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    flexDirection: 'row',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGallery: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#E0E0E0',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#0D9488',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 14,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  specItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  locationDetail: {
    fontSize: 14,
    lineHeight: 22,
  },
  areaCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  areaHeader: {
    marginBottom: 8,
  },
  areaSize: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  areaLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  areaNote: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#0D9488',
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 16,
    padding: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});
