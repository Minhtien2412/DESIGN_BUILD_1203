/**
 * Pexels Gallery Screen
 * Hiển thị ảnh và video miễn phí từ Pexels API
 * Created: 13/01/2026
 */

import pexelsService, {
    type PexelsPhoto,
    type PexelsVideo,
    CONSTRUCTION_KEYWORDS,
} from '@/services/pexelsService';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = (SCREEN_WIDTH - 48) / 2;

type TabType = 'photos' | 'videos';
type CategoryKey = keyof typeof CONSTRUCTION_KEYWORDS;

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'general', label: 'Xây dựng', icon: 'construct' },
  { key: 'villa', label: 'Biệt thự', icon: 'home' },
  { key: 'resort', label: 'Resort', icon: 'business' },
  { key: 'interior', label: 'Nội thất', icon: 'bed' },
  { key: 'landscape', label: 'Cảnh quan', icon: 'leaf' },
  { key: 'material', label: 'Vật liệu', icon: 'cube' },
  { key: 'technique', label: 'Kỹ thuật', icon: 'build' },
];

interface PhotoCardProps {
  photo: PexelsPhoto;
  onPress: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onPress }) => (
  <TouchableOpacity style={styles.photoCard} onPress={onPress}>
    <Image
      source={{ uri: photo.src.medium }}
      style={[styles.photoImage, { backgroundColor: photo.avg_color }]}
      resizeMode="cover"
    />
    <View style={styles.photoOverlay}>
      <Text style={styles.photographerName} numberOfLines={1}>
        📷 {photo.photographer}
      </Text>
    </View>
  </TouchableOpacity>
);

interface VideoCardProps {
  video: PexelsVideo;
  onPress: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => (
  <TouchableOpacity style={styles.videoCard} onPress={onPress}>
    <Image
      source={{ uri: video.image }}
      style={styles.videoThumbnail}
      resizeMode="cover"
    />
    <View style={styles.videoDuration}>
      <Ionicons name="time-outline" size={12} color="#fff" />
      <Text style={styles.durationText}>
        {pexelsService.formatDuration(video.duration)}
      </Text>
    </View>
    <View style={styles.videoPlayButton}>
      <Ionicons name="play" size={24} color="#fff" />
    </View>
    <View style={styles.videoInfo}>
      <Text style={styles.videoAuthor} numberOfLines={1}>
        🎬 {video.user.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function PexelsGalleryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('photos');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('general');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Modal states
  const [selectedPhoto, setSelectedPhoto] = useState<PexelsPhoto | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PexelsVideo | null>(null);

  const loadPhotos = useCallback(async (pageNum = 1, refresh = false) => {
    if (loading && !refresh) return;
    
    setLoading(true);
    try {
      const response = await pexelsService.getConstructionPhotos(selectedCategory, pageNum, 20);
      
      if (refresh || pageNum === 1) {
        setPhotos(response.photos);
      } else {
        setPhotos(prev => [...prev, ...response.photos]);
      }
      
      setHasMore(response.photos.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh từ Pexels');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, loading]);

  const loadVideos = useCallback(async (pageNum = 1, refresh = false) => {
    if (loading && !refresh) return;
    
    setLoading(true);
    try {
      const response = await pexelsService.getConstructionVideos(selectedCategory, pageNum, 15);
      
      if (refresh || pageNum === 1) {
        setVideos(response.videos);
      } else {
        setVideos(prev => [...prev, ...response.videos]);
      }
      
      setHasMore(response.videos.length === 15);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Lỗi', 'Không thể tải video từ Pexels');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, loading]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    if (activeTab === 'photos') {
      loadPhotos(1, true);
    } else {
      loadVideos(1, true);
    }
  }, [activeTab, selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    if (activeTab === 'photos') {
      loadPhotos(1, true);
    } else {
      loadVideos(1, true);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      if (activeTab === 'photos') {
        loadPhotos(page + 1);
      } else {
        loadVideos(page + 1);
      }
    }
  };

  const handleOpenPexels = (url: string) => {
    Linking.openURL(url);
  };

  const renderPhotoModal = () => (
    <Modal
      visible={!!selectedPhoto}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectedPhoto(null)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.modalClose}
          onPress={() => setSelectedPhoto(null)}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        
        {selectedPhoto && (
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedPhoto.src.large }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{selectedPhoto.alt || 'Untitled'}</Text>
              <Text style={styles.modalAuthor}>📷 {selectedPhoto.photographer}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => handleOpenPexels(selectedPhoto.url)}
                >
                  <Ionicons name="open-outline" size={18} color="#fff" />
                  <Text style={styles.modalButtonText}>Xem trên Pexels</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#22c55e' }]}
                  onPress={() => handleOpenPexels(selectedPhoto.src.original)}
                >
                  <Ionicons name="download-outline" size={18} color="#fff" />
                  <Text style={styles.modalButtonText}>Tải xuống</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );

  const renderVideoModal = () => (
    <Modal
      visible={!!selectedVideo}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectedVideo(null)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.modalClose}
          onPress={() => setSelectedVideo(null)}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        
        {selectedVideo && (
          <View style={styles.modalContent}>
            <Video
              source={{ uri: pexelsService.getSDVideoUrl(selectedVideo) }}
              style={styles.modalVideo}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
            />
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>Video #{selectedVideo.id}</Text>
              <Text style={styles.modalAuthor}>🎬 {selectedVideo.user.name}</Text>
              <Text style={styles.modalDuration}>
                ⏱️ {pexelsService.formatDuration(selectedVideo.duration)}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => handleOpenPexels(selectedVideo.url)}
                >
                  <Ionicons name="open-outline" size={18} color="#fff" />
                  <Text style={styles.modalButtonText}>Xem trên Pexels</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#f97316', '#ea580c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image 
            source={{ uri: 'https://images.pexels.com/lib/api/pexels-white.png' }}
            style={styles.pexelsLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Pexels Gallery</Text>
        </View>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Linking.openURL('https://www.pexels.com')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
        >
          <Ionicons 
            name="images" 
            size={20} 
            color={activeTab === 'photos' ? '#f97316' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            Ảnh
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}
        >
          <Ionicons 
            name="videocam" 
            size={20} 
            color={activeTab === 'videos' ? '#f97316' : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Video
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesList}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryChip,
              selectedCategory === cat.key && styles.activeCategoryChip,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={14} 
              color={selectedCategory === cat.key ? '#fff' : '#f97316'} 
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.key && styles.activeCategoryText,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {activeTab === 'photos' ? (
        <FlatList
          data={photos}
          keyExtractor={(item) => `photo-${item.id}`}
          numColumns={2}
          renderItem={({ item }) => (
            <PhotoCard photo={item} onPress={() => setSelectedPhoto(item)} />
          )}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && !refreshing ? (
              <ActivityIndicator size="large" color="#f97316" style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="images-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>Không có ảnh nào</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => `video-${item.id}`}
          renderItem={({ item }) => (
            <VideoCard video={item} onPress={() => setSelectedVideo(item)} />
          )}
          contentContainerStyle={styles.videoListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && !refreshing ? (
              <ActivityIndicator size="large" color="#f97316" style={styles.loader} />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="videocam-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>Không có video nào</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="heart" size={14} color="#f97316" />
        <Text style={styles.infoBannerText}>
          Ảnh & Video miễn phí từ Pexels • Sử dụng cho mục đích thương mại
        </Text>
      </View>

      {renderPhotoModal()}
      {renderVideoModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pexelsLogo: {
    width: 80,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoButton: {
    padding: 8,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#f97316',
  },

  // Categories
  categoriesContainer: {
    backgroundColor: '#fff',
    maxHeight: 56,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f97316',
  },
  activeCategoryText: {
    color: '#fff',
  },

  // Photo Grid
  gridContent: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoCard: {
    width: PHOTO_WIDTH,
    height: PHOTO_WIDTH * 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  photographerName: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },

  // Video List
  videoListContent: {
    padding: 16,
  },
  videoCard: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#1f2937',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoDuration: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoAuthor: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },

  // Loader & Empty
  loader: {
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#fff7ed',
    borderTopWidth: 1,
    borderTopColor: '#fed7aa',
  },
  infoBannerText: {
    fontSize: 11,
    color: '#c2410c',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalContent: {
    width: SCREEN_WIDTH - 32,
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  modalVideo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  modalInfo: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  modalAuthor: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  modalDuration: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f97316',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
