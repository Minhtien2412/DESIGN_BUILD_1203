import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  completionDate: Date;
  location: string;
  client: string;
  duration: string;
  budget?: string;
  tags: string[];
  rating?: number;
  testimonial?: string;
}

interface ContractorPortfolioProps {
  projects: PortfolioProject[];
  editable?: boolean;
  onAddProject?: () => void;
  onEditProject?: (project: PortfolioProject) => void;
  onDeleteProject?: (projectId: string) => void;
}

const PROJECT_CATEGORIES = [
  'Tất cả',
  'Thiết kế kiến trúc',
  'Thiết kế nội thất',
  'Xây dựng nhà ở',
  'Xây dựng thương mại',
  'Cảnh quan',
  'Hoàn thiện',
];

export function ContractorPortfolio({
  projects,
  editable = false,
  onAddProject,
  onEditProject,
  onDeleteProject,
}: ContractorPortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  const filteredProjects = selectedCategory === 'Tất cả'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const openImageViewer = (images: string[], startIndex: number = 0) => {
    setSelectedImages(images);
    setSelectedImageIndex(startIndex);
    setImageViewerVisible(true);
  };

  const renderProjectCard = ({ item }: { item: PortfolioProject }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor }]}
      onPress={() => setSelectedProject(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.projectImage}
          resizeMode="cover"
        />
        {item.images.length > 1 && (
          <View style={[styles.imageCount, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <Ionicons name="images-outline" size={12} color="white" />
            <Text style={styles.imageCountText}>{item.images.length}</Text>
          </View>
        )}
        {editable && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={(e) => {
                e.stopPropagation();
                onEditProject?.(item);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#000000' }]}
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert(
                  'Xóa dự án',
                  'Bạn có chắc chắn muốn xóa dự án này?',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', style: 'destructive', onPress: () => onDeleteProject?.(item.id) },
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.projectInfo}>
        <Text style={[styles.projectTitle, { color: textColor }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.projectCategory, { color: primaryColor }]}>
          {item.category}
        </Text>
        <Text style={[styles.projectLocation, { color: textColor }]} numberOfLines={1}>
          📍 {item.location}
        </Text>
        
        {item.rating && (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating! ? 'star' : 'star-outline'}
                size={12}
                color="#FFB800"
              />
            ))}
            <Text style={[styles.ratingText, { color: textColor }]}>
              ({item.rating.toFixed(1)})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {PROJECT_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            selectedCategory === category && { 
              backgroundColor: primaryColor,
            }
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === category && { color: 'white' }
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProjectDetail = () => (
    <Modal
      visible={!!selectedProject}
      animationType="slide"
      onRequestClose={() => setSelectedProject(null)}
    >
      <View style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setSelectedProject(null)}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: textColor }]}>Chi tiết dự án</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedProject && (
          <ScrollView style={styles.modalContent}>
            {/* Image Gallery */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
            >
              {selectedProject.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openImageViewer(selectedProject.images, index)}
                >
                  <Image source={{ uri: image }} style={styles.galleryImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.projectDetails}>
              <Text style={[styles.detailTitle, { color: textColor }]}>
                {selectedProject.title}
              </Text>
              
              <View style={styles.projectMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="folder-outline" size={16} color={primaryColor} />
                  <Text style={[styles.metaText, { color: textColor }]}>
                    {selectedProject.category}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color={primaryColor} />
                  <Text style={[styles.metaText, { color: textColor }]}>
                    {selectedProject.location}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={primaryColor} />
                  <Text style={[styles.metaText, { color: textColor }]}>
                    {selectedProject.completionDate.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={primaryColor} />
                  <Text style={[styles.metaText, { color: textColor }]}>
                    {selectedProject.duration}
                  </Text>
                </View>
                {selectedProject.budget && (
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={16} color={primaryColor} />
                    <Text style={[styles.metaText, { color: textColor }]}>
                      {selectedProject.budget}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.sectionTitle, { color: textColor }]}>Mô tả</Text>
              <Text style={[styles.description, { color: textColor }]}>
                {selectedProject.description}
              </Text>

              <Text style={[styles.sectionTitle, { color: textColor }]}>Khách hàng</Text>
              <Text style={[styles.clientName, { color: textColor }]}>
                {selectedProject.client}
              </Text>

              {selectedProject.tags.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedProject.tags.map((tag, index) => (
                      <View key={index} style={[styles.tag, { borderColor: primaryColor }]}>
                        <Text style={[styles.tagText, { color: primaryColor }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {selectedProject.testimonial && (
                <>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Nhận xét từ khách hàng
                  </Text>
                  <View style={styles.testimonialContainer}>
                    <Ionicons name="chatbubble-outline" size={20} color={primaryColor} />
                    <Text style={[styles.testimonial, { color: textColor }]}>
                      &quot;{selectedProject.testimonial}&quot;
                    </Text>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderImageViewer = () => (
    <Modal
      visible={imageViewerVisible}
      animationType="fade"
      onRequestClose={() => setImageViewerVisible(false)}
    >
      <View style={styles.imageViewerContainer}>
        <TouchableOpacity
          style={styles.closeImageViewer}
          onPress={() => setImageViewerVisible(false)}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        
        <FlatList
          data={selectedImages}
          horizontal
          pagingEnabled
          initialScrollIndex={selectedImageIndex > 0 && selectedImageIndex < selectedImages.length ? selectedImageIndex : 0}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <View style={styles.imageViewerSlide}>
              <Image source={{ uri: item }} style={styles.fullScreenImage} />
              <Text style={styles.imageCounter}>
                {index + 1} / {selectedImages.length}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Portfolio ({projects.length} dự án)
        </Text>
        {editable && onAddProject && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={onAddProject}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Thêm dự án</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.projectRow}
          contentContainerStyle={styles.projectsGrid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            Chưa có dự án nào
          </Text>
          <Text style={[styles.emptyDescription, { color: textColor }]}>
            {selectedCategory === 'Tất cả' 
              ? 'Bắt đầu thêm dự án đầu tiên của bạn'
              : `Không có dự án nào trong danh mục "${selectedCategory}"`
            }
          </Text>
          {editable && onAddProject && selectedCategory === 'Tất cả' && (
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: primaryColor }]}
              onPress={onAddProject}
            >
              <Text style={styles.emptyButtonText}>Thêm dự án</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modals */}
      {renderProjectDetail()}
      {renderImageViewer()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  projectsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  projectRow: {
    justifyContent: 'space-between',
  },
  projectCard: {
    width: (screenWidth - 48) / 2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  projectImage: {
    width: '100%',
    height: 120,
  },
  imageCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  imageCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  cardActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectInfo: {
    padding: 12,
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    marginLeft: 4,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  imageGallery: {
    height: 250,
  },
  galleryImage: {
    width: screenWidth,
    height: 250,
  },
  projectDetails: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  projectMeta: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metaText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  testimonialContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  testimonial: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeImageViewer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerSlide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: '80%',
    resizeMode: 'contain',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
