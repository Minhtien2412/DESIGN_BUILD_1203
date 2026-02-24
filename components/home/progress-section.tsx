/**
 * Progress Section Component
 * Hiển thị tiến độ xây dựng và thanh toán trên trang chủ
 * Now supports real data from props
 * @updated 2026-01-03
 */

import {
    PerfexProjectsService,
    type PerfexProject
} from '@/services/perfexCRM';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ProgressItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  route: string;
  status: 'on-track' | 'warning' | 'delayed';
  photos?: string[];
}

// Default mock data - will be replaced by real data if available
const DEFAULT_PROGRESS_ITEMS: ProgressItem[] = [
  {
    id: 'construction',
    title: 'Tiến độ xây dựng',
    subtitle: 'Tầng trệt - Đang thi công',
    progress: 45,
    icon: 'construct',
    iconColor: '#666666',
    backgroundColor: '#F3E8FF',
    route: '/construction/progress',
    status: 'on-track',
    photos: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
      'https://images.unsplash.com/photo-1590642916589-592bca10dfbf?w=800',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
    ],
  },
  {
    id: 'payment',
    title: 'Thanh toán thi công',
    subtitle: '3/8 đợt đã thanh toán',
    progress: 37.5,
    icon: 'cash',
    iconColor: '#0D9488',
    backgroundColor: '#D1FAE5',
    route: '/construction/payment-progress',
    status: 'on-track',
    photos: [
      'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800',
    ],
  },
];

interface ProgressSectionProps {
  items?: ProgressItem[];
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({ items: propItems }) => {
  const [loading, setLoading] = useState(true);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>(DEFAULT_PROGRESS_ITEMS);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Fetch real data from CRM
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const response = await PerfexProjectsService.getAll({ status: 2, limit: 5 });
        const projects = response.data || [];
        
        if (projects.length > 0) {
          console.log('[ProgressSection] ✅ Loaded', projects.length, 'projects from CRM');
          
          // Transform CRM projects to ProgressItems
          const transformedItems: ProgressItem[] = projects.slice(0, 2).map((project: PerfexProject, index: number) => {
            const progress = project.progress || 0;
            const status: ProgressItem['status'] = 
              progress >= 80 ? 'on-track' : 
              progress >= 50 ? 'warning' : 
              'delayed';
            
            return {
              id: project.id,
              title: project.name,
              subtitle: getPhaseLabel(progress),
              progress: progress,
              icon: index === 0 ? 'construct' : 'cash',
              iconColor: index === 0 ? '#666666' : '#0D9488',
              backgroundColor: index === 0 ? '#F3E8FF' : '#D1FAE5',
              route: `/projects/${project.id}`,
              status,
              photos: DEFAULT_PROGRESS_ITEMS[index]?.photos || [],
            };
          });
          
          setProgressItems(transformedItems);
          setDataSource('api');
        }
      } catch (error) {
        console.log('[ProgressSection] Using mock data (CRM unavailable)');
      } finally {
        setLoading(false);
      }
    };

    if (propItems) {
      setProgressItems(propItems);
      setDataSource('api');
      setLoading(false);
    } else {
      fetchRealData();
    }
  }, [propItems]);

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  const handlePhotoPress = (photos: string[], index: number) => {
    setSelectedPhotos(photos);
    setCurrentPhotoIndex(index);
    setModalVisible(true);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : selectedPhotos.length - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < selectedPhotos.length - 1 ? prev + 1 : 0));
  };

  const getStatusColor = (status: ProgressItem['status']) => {
    switch (status) {
      case 'on-track':
        return '#0D9488';
      case 'warning':
        return '#0D9488';
      case 'delayed':
        return '#000000';
    }
  };

  const getStatusText = (status: ProgressItem['status']) => {
    switch (status) {
      case 'on-track':
        return 'Đúng tiến độ';
      case 'warning':
        return 'Cần lưu ý';
      case 'delayed':
        return 'Chậm tiến độ';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#666666" />
        <Text style={styles.loadingText}>Đang tải tiến độ...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Data Source Indicator */}
      {dataSource === 'api' && (
        <View style={styles.dataSourceBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.dataSourceText}>Dữ liệu từ CRM</Text>
        </View>
      )}
      
      <View style={styles.container}>
        {progressItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => handlePress(item.route)}
              activeOpacity={0.7}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: item.backgroundColor }]}>
                  <Ionicons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${item.progress}%`,
                        backgroundColor: getStatusColor(item.status),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{item.progress}%</Text>
              </View>

              {/* Status */}
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(item.status)}15` },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Photos */}
            {item.photos && item.photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photosContainer}
                contentContainerStyle={styles.photosContent}
              >
                {item.photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handlePhotoPress(item.photos!, index)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: photo }} style={styles.photo} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.morePhotosBtn}
                  onPress={() => handlePress(item.route)}
                >
                  <Ionicons name="add" size={20} color="#6B7280" />
                  <Text style={styles.morePhotosText}>Xem thêm</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        ))}
      </View>

      {/* Full Width Photo Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Photo Counter */}
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              {currentPhotoIndex + 1} / {selectedPhotos.length}
            </Text>
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedPhotos[currentPhotoIndex] }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>

          {/* Navigation Buttons */}
          {selectedPhotos.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={handlePrevPhoto}
              >
                <Ionicons name="chevron-back" size={32} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNextPhoto}
              >
                <Ionicons name="chevron-forward" size={32} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    minWidth: 45,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  photosContainer: {
    marginTop: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  photosContent: {
    gap: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  morePhotosBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  morePhotosText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    width: width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  // New styles for loading and data source
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488',
    marginRight: 6,
  },
  dataSourceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D9488',
  },
});

// Helper function to get phase label from progress
function getPhaseLabel(progress: number): string {
  if (progress < 10) return 'Chuẩn bị công trường';
  if (progress < 25) return 'Móng - Đang thi công';
  if (progress < 50) return 'Phần thô - Đang thi công';
  if (progress < 75) return 'Hoàn thiện - Đang thi công';
  if (progress < 90) return 'M&E - Đang thi công';
  if (progress < 100) return 'Bàn giao - Kiểm tra';
  return 'Đã hoàn thành';
}
