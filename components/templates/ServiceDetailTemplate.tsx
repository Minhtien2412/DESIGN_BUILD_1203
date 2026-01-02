import { MODERN_COLORS } from '@/constants/modern-theme';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ServiceDetailTemplateProps {
  serviceId: string;
  serviceName: string;
  serviceType: 'design' | 'construction' | 'finishing' | 'consulting';
  apiEndpoint: string;
  features?: string[];
  priceRange?: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  description?: string;
}

interface ServiceData {
  id: string;
  name: string;
  description: string;
  features: string[];
  priceRange: string;
  rating: number;
  reviews: number;
  images: string[];
  provider?: {
    name: string;
    logo: string;
    rating: number;
  };
}

export function ServiceDetailTemplate({
  serviceId,
  serviceName,
  serviceType,
  apiEndpoint,
  features = [],
  priceRange,
  rating = 4.5,
  reviews = 0,
  images = [],
  description,
}: ServiceDetailTemplateProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ServiceData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadServiceData();
  }, [serviceId]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(apiEndpoint);
      setData(response as ServiceData);
    } catch (error) {
      console.log('Using fallback data');
      // Use props as fallback
      setData({
        id: serviceId,
        name: serviceName,
        description: description || `Dịch vụ ${serviceName} chuyên nghiệp, uy tín`,
        features,
        priceRange: priceRange || 'Liên hệ',
        rating,
        reviews,
        images: images.length > 0 ? images : [
          'https://salt.tikicdn.com/cache/w1200/ts/product/e0/7a/29/1e7a29c8c0f2e1f3a2b4c5d6e7f8g9h0.jpg'
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = () => {
    router.push({
      pathname: '/utilities/quote-request',
      params: { serviceType: serviceId, serviceName }
    } as any);
  };

  const handleBookNow = () => {
    Alert.alert(
      'Đặt lịch',
      'Bạn muốn đặt lịch tư vấn dịch vụ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lịch',
          onPress: () => {
            Alert.alert('Thành công', 'Đã gửi yêu cầu đặt lịch!');
          },
        },
      ]
    );
  };

  const handleCallNow = () => {
    Alert.alert('Hotline', '1900 xxxx');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadServiceData}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Slider */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: data.images[selectedImageIndex] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          {data.images.length > 1 && (
            <View style={styles.imageDots}>
              {data.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === selectedImageIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Service Info */}
        <View style={styles.infoSection}>
          <Text style={styles.serviceName}>{data.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{data.rating}</Text>
              <Text style={styles.reviewsText}>({data.reviews} đánh giá)</Text>
            </View>
            <Text style={styles.priceRange}>{data.priceRange}</Text>
          </View>

          <Text style={styles.description}>{data.description}</Text>

          {/* Features */}
          {data.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
              {data.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={MODERN_COLORS.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Provider Info (if available) */}
          {data.provider && (
            <View style={styles.providerSection}>
              <Text style={styles.sectionTitle}>Nhà cung cấp</Text>
              <View style={styles.providerCard}>
                <Image
                  source={{ uri: data.provider.logo }}
                  style={styles.providerLogo}
                />
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{data.provider.name}</Text>
                  <View style={styles.providerRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.providerRatingText}>{data.provider.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Related Services */}
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Dịch vụ liên quan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((item) => (
                <TouchableOpacity key={item} style={styles.relatedCard}>
                  <Image
                    source={{ uri: 'https://salt.tikicdn.com/cache/280x280/ts/product/e0/7a/29/1e7a29c8c0f2e1f3a2b4c5d6e7f8g9h0.jpg' }}
                    style={styles.relatedImage}
                  />
                  <Text style={styles.relatedTitle}>Dịch vụ {item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callButton} onPress={handleCallNow}>
          <Ionicons name="call" size={20} color={MODERN_COLORS.primary} />
          <Text style={styles.callText}>Gọi ngay</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quoteButton} onPress={handleRequestQuote}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.quoteText}>Yêu cầu báo giá</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookText}>Đặt lịch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  heroSection: {
    position: 'relative' as const,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  backButton: {
    position: 'absolute' as const,
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  imageDots: {
    position: 'absolute' as const,
    bottom: 16,
    flexDirection: 'row' as const,
    alignSelf: 'center' as const,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 20,
  },
  infoSection: {
    padding: 16,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  reviewsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  priceRange: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: MODERN_COLORS.primary,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  providerSection: {
    marginBottom: 24,
  },
  providerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  providerInfo: {
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  providerRating: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  providerRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  relatedSection: {
    marginBottom: 100,
  },
  relatedCard: {
    width: 120,
    marginRight: 12,
  },
  relatedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedTitle: {
    fontSize: 12,
    color: '#333',
  },
  bottomBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
    borderRadius: 8,
    marginRight: 8,
  },
  callText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600' as const,
    color: MODERN_COLORS.primary,
  },
  quoteButton: {
    flex: 1.5,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 8,
    marginRight: 8,
  },
  quoteText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  bookButton: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    backgroundColor: '#00c853',
    borderRadius: 8,
  },
  bookText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
};
