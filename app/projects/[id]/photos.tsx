/**
 * Progress Photos Timeline Screen
 * View construction progress photos with timeline, filters, and before/after comparisons
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import photoTimelineService, {
    PhotoCategory,
    PhotoPhase,
    ProgressPhoto,
} from '@/services/api/photo-timeline.service';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 2;

type ViewMode = 'timeline' | 'grid' | 'comparison';
type FilterTab = 'all' | 'phase' | 'category' | 'date';

export default function ProjectPhotosScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [selectedPhase, setSelectedPhase] = useState<PhotoPhase | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Load photos
  const loadPhotos = async (silent = false) => {
    if (!projectId) return;

    try {
      if (!silent) setLoading(true);

      const response = await photoTimelineService.getPhotos({
        projectId: parseInt(projectId),
      });

      if (response.data) {
        setPhotos(response.data);
        setFilteredPhotos(response.data);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh tiến độ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [projectId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...photos];

    // Filter by phase
    if (selectedPhase !== 'all') {
      filtered = filtered.filter(p => p.phase === selectedPhase);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.location.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPhotos(filtered);
  }, [photos, selectedPhase, selectedCategory, searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPhotos(true);
  };

  const handlePhotoPress = (photo: ProgressPhoto) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handleUploadPhoto = () => {
    router.push(`/projects/${projectId}/upload-photo`);
  };

  // Group photos by date for timeline view
  const photosByDate = filteredPhotos.reduce((acc, photo) => {
    const date = new Date(photo.capturedAt).toLocaleDateString('vi-VN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  const renderPhotoCard = ({ item }: { item: ProgressPhoto }) => (
    <Pressable
      style={[styles.photoCard, { backgroundColor: surface, borderColor: border }]}
      onPress={() => handlePhotoPress(item)}
    >
      <Image source={{ uri: item.thumbnailUrl || item.imageUrl }} style={styles.photoImage} />
      
      <View style={styles.photoInfo}>
        <Text style={[styles.photoLocation, { color: text }]} numberOfLines={1}>
          {item.location}
        </Text>
        <View style={styles.photoMeta}>
          <View style={[styles.photoBadge, { backgroundColor: primary + '20' }]}>
            <Text style={[styles.photoBadgeText, { color: primary }]}>
              {item.phase.replace(/_/g, ' ')}
            </Text>
          </View>
          <Text style={[styles.photoDate, { color: textMuted }]}>
            {new Date(item.capturedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderTimelineSection = ({ item }: { item: [string, ProgressPhoto[]] }) => {
    const [date, datePhotos] = item;
    return (
      <View style={styles.timelineSection}>
        <View style={[styles.timelineHeader, { borderBottomColor: border }]}>
          <Ionicons name="calendar-outline" size={20} color={primary} />
          <Text style={[styles.timelineDate, { color: text }]}>{date}</Text>
          <Text style={[styles.timelineCount, { color: textMuted }]}>
            {datePhotos.length} ảnh
          </Text>
        </View>
        <View style={styles.timelinePhotos}>
          {datePhotos.map(photo => (
            <Pressable
              key={photo.id}
              style={[styles.timelinePhoto, { borderColor: border }]}
              onPress={() => handlePhotoPress(photo)}
            >
              <Image
                source={{ uri: photo.thumbnailUrl || photo.imageUrl }}
                style={styles.timelinePhotoImage}
              />
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, { color: textMuted }]}>Đang tải ảnh...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Ảnh tiến độ</Text>
        <Pressable onPress={handleUploadPhoto} style={styles.uploadButton}>
          <Ionicons name="camera-outline" size={24} color={primary} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: surface }]}>
        <Ionicons name="search-outline" size={20} color={textMuted} />
        <TextInput
          style={[styles.searchInput, { color: text }]}
          placeholder="Tìm kiếm theo vị trí, mô tả..."
          placeholderTextColor={textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={textMuted} />
          </Pressable>
        )}
      </View>

      {/* View Mode Toggle */}
      <View style={[styles.viewModeContainer, { backgroundColor: surface }]}>
        <Pressable
          style={[
            styles.viewModeButton,
            viewMode === 'timeline' && { backgroundColor: primary + '20' },
          ]}
          onPress={() => setViewMode('timeline')}
        >
          <Ionicons
            name="list-outline"
            size={20}
            color={viewMode === 'timeline' ? primary : textMuted}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'timeline' ? primary : textMuted },
            ]}
          >
            Timeline
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.viewModeButton,
            viewMode === 'grid' && { backgroundColor: primary + '20' },
          ]}
          onPress={() => setViewMode('grid')}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={viewMode === 'grid' ? primary : textMuted}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'grid' ? primary : textMuted },
            ]}
          >
            Lưới
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.viewModeButton,
            viewMode === 'comparison' && { backgroundColor: primary + '20' },
          ]}
          onPress={() => setViewMode('comparison')}
        >
          <Ionicons
            name="git-compare-outline"
            size={20}
            color={viewMode === 'comparison' ? primary : textMuted}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'comparison' ? primary : textMuted },
            ]}
          >
            So sánh
          </Text>
        </Pressable>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <Pressable
          style={[
            styles.filterPill,
            { borderColor: border },
            selectedPhase === 'all' && { backgroundColor: primary, borderColor: primary },
          ]}
          onPress={() => setSelectedPhase('all')}
        >
          <Text
            style={[
              styles.filterPillText,
              { color: selectedPhase === 'all' ? '#fff' : text },
            ]}
          >
            Tất cả giai đoạn
          </Text>
        </Pressable>

        {['FOUNDATION', 'STRUCTURE', 'FINISHING'].map(phase => (
          <Pressable
            key={phase}
            style={[
              styles.filterPill,
              { borderColor: border },
              selectedPhase === phase && { backgroundColor: primary, borderColor: primary },
            ]}
            onPress={() => setSelectedPhase(phase as PhotoPhase)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: selectedPhase === phase ? '#fff' : text },
              ]}
            >
              {phase.replace(/_/g, ' ')}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Photos List */}
      {viewMode === 'timeline' ? (
        <FlatList
          data={Object.entries(photosByDate)}
          renderItem={renderTimelineSection}
          keyExtractor={([date]) => date}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color={textMuted} />
              <Text style={[styles.emptyText, { color: textMuted }]}>Chưa có ảnh tiến độ</Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: primary }]}
                onPress={handleUploadPhoto}
              >
                <Text style={styles.emptyButtonText}>Thêm ảnh đầu tiên</Text>
              </Pressable>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredPhotos}
          renderItem={renderPhotoCard}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.photoRow}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color={textMuted} />
              <Text style={[styles.emptyText, { color: textMuted }]}>Không tìm thấy ảnh</Text>
            </View>
          }
        />
      )}

      {/* Photo Detail Modal */}
      <Modal visible={showPhotoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surface }]}>
            <Pressable onPress={() => setShowPhotoModal(false)} style={styles.modalClose}>
              <Ionicons name="close" size={28} color={text} />
            </Pressable>

            {selectedPhoto && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedPhoto.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <View style={styles.modalInfo}>
                  <Text style={[styles.modalLocation, { color: text }]}>
                    {selectedPhoto.location}
                  </Text>

                  {selectedPhoto.description && (
                    <Text style={[styles.modalDescription, { color: textMuted }]}>
                      {selectedPhoto.description}
                    </Text>
                  )}

                  <View style={styles.modalMeta}>
                    <View style={styles.modalMetaRow}>
                      <Ionicons name="layers-outline" size={16} color={textMuted} />
                      <Text style={[styles.modalMetaText, { color: textMuted }]}>
                        {selectedPhoto.phase.replace(/_/g, ' ')}
                      </Text>
                    </View>

                    <View style={styles.modalMetaRow}>
                      <Ionicons name="pricetag-outline" size={16} color={textMuted} />
                      <Text style={[styles.modalMetaText, { color: textMuted }]}>
                        {selectedPhoto.category}
                      </Text>
                    </View>

                    <View style={styles.modalMetaRow}>
                      <Ionicons name="calendar-outline" size={16} color={textMuted} />
                      <Text style={[styles.modalMetaText, { color: textMuted }]}>
                        {new Date(selectedPhoto.capturedAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>

                    {selectedPhoto.uploadedByName && (
                      <View style={styles.modalMetaRow}>
                        <Ionicons name="person-outline" size={16} color={textMuted} />
                        <Text style={[styles.modalMetaText, { color: textMuted }]}>
                          {selectedPhoto.uploadedByName}
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                    <View style={styles.modalTags}>
                      {selectedPhoto.tags.map((tag, index) => (
                        <View key={index} style={[styles.modalTag, { backgroundColor: primary + '20' }]}>
                          <Text style={[styles.modalTagText, { color: primary }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  uploadButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  photoRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  photoCard: {
    width: PHOTO_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: PHOTO_SIZE,
  },
  photoInfo: {
    padding: 12,
  },
  photoLocation: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  photoDate: {
    fontSize: 11,
  },
  timelineSection: {
    marginBottom: 24,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  timelineDate: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  timelineCount: {
    fontSize: 13,
  },
  timelinePhotos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  timelinePhoto: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  timelinePhotoImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: 400,
  },
  modalInfo: {
    padding: 20,
  },
  modalLocation: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalMeta: {
    gap: 12,
    marginBottom: 16,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalMetaText: {
    fontSize: 14,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
