/**
 * Create Post Screen - Full-featured Post Creation
 * Features: Camera/gallery, text, tags, location, mentions
 * @author AI Assistant
 * @date 03/01/2026
 */

import Avatar from '@/components/ui/avatar';
import { TappableImage } from '@/components/ui/full-media-viewer';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Post types
const POST_TYPES = [
  { id: 'post', name: 'Bài viết', icon: 'create-outline' },
  { id: 'photo', name: 'Ảnh/Video', icon: 'images-outline' },
  { id: 'reel', name: 'Reels', icon: 'film-outline' },
  { id: 'story', name: 'Story', icon: 'add-circle-outline' },
  { id: 'live', name: 'Live', icon: 'radio-outline' },
];

// Suggested tags
const SUGGESTED_TAGS = [
  'xâydựng', 'kiếntrúc', 'nộithất', 'nhàđẹp', 'thiếtkế',
  'biệtthự', 'nhàphố', 'cănnhộ', 'phongthủy', 'vậtliệu',
  'thicông', 'sửachữa', 'DIY', 'sanvườn', 'trangtrí',
];

// Audience options
const AUDIENCE_OPTIONS = [
  { id: 'public', name: 'Công khai', icon: 'globe-outline', desc: 'Mọi người có thể xem' },
  { id: 'friends', name: 'Bạn bè', icon: 'people-outline', desc: 'Chỉ bạn bè xem được' },
  { id: 'private', name: 'Chỉ mình tôi', icon: 'lock-closed-outline', desc: 'Chỉ mình bạn xem được' },
];

// ==================== MAIN COMPONENT ====================
export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [postType, setPostType] = useState('post');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState('public');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  // Pick images from gallery
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });
    
    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  // Toggle tag
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Add custom tag
  const addCustomTag = () => {
    const tag = customTag.trim().replace(/\s+/g, '').toLowerCase();
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTag('');
    }
  };
  
  // Post content
  const handlePost = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung hoặc thêm ảnh.');
      return;
    }
    
    setIsPosting(true);
    
    // Simulate posting
    setTimeout(() => {
      setIsPosting(false);
      Alert.alert('Thành công', 'Bài viết đã được đăng!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1500);
  };
  
  const selectedAudience = AUDIENCE_OPTIONS.find(a => a.id === audience);
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Tạo bài viết</Text>
        
        <TouchableOpacity 
          style={[styles.postButton, (!content.trim() && images.length === 0) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={isPosting || (!content.trim() && images.length === 0)}
        >
          {isPosting ? (
            <Text style={styles.postButtonText}>Đang đăng...</Text>
          ) : (
            <Text style={styles.postButtonText}>Đăng</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User info & audience */}
          <View style={styles.userSection}>
            <Avatar name={user?.name || 'U'} size="md" />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
              <TouchableOpacity 
                style={styles.audienceButton}
                onPress={() => setShowAudienceModal(!showAudienceModal)}
              >
                <Ionicons name={selectedAudience?.icon as any} size={14} color="#666" />
                <Text style={styles.audienceText}>{selectedAudience?.name}</Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Audience selector */}
          {showAudienceModal && (
            <View style={styles.audienceModal}>
              {AUDIENCE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.audienceOption, audience === option.id && styles.audienceOptionActive]}
                  onPress={() => {
                    setAudience(option.id);
                    setShowAudienceModal(false);
                  }}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={audience === option.id ? '#0066CC' : '#666'} 
                  />
                  <View style={styles.audienceOptionInfo}>
                    <Text style={[styles.audienceOptionName, audience === option.id && styles.audienceOptionNameActive]}>
                      {option.name}
                    </Text>
                    <Text style={styles.audienceOptionDesc}>{option.desc}</Text>
                  </View>
                  {audience === option.id && (
                    <Ionicons name="checkmark" size={20} color="#0066CC" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Post type tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postTypesContainer}
          >
            {POST_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[styles.postTypeTab, postType === type.id && styles.postTypeTabActive]}
                onPress={() => setPostType(type.id)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={20} 
                  color={postType === type.id ? '#0066CC' : '#666'} 
                />
                <Text style={[styles.postTypeText, postType === type.id && styles.postTypeTextActive]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Content input */}
          <TextInput
            style={styles.contentInput}
            placeholder="Bạn đang nghĩ gì? Chia sẻ về dự án xây dựng, nội thất, thiết kế..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
          
          {/* Images preview */}
          {images.length > 0 && (
            <View style={styles.imagesSection}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesContainer}
              >
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <TappableImage 
                      source={{ uri }} 
                      style={styles.previewImage}
                      title={`Ảnh ${index + 1}`}
                      allowDelete
                      onDelete={() => removeImage(index)}
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {/* Add more images button */}
                <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                  <Ionicons name="add" size={32} color="#666" />
                  <Text style={styles.addImageText}>Thêm ảnh</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
          
          {/* Media buttons */}
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>Thêm vào bài viết</Text>
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImages}>
                <Ionicons name="images" size={24} color="#45bd62" />
                <Text style={styles.mediaButtonText}>Ảnh/Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#f02849" />
                <Text style={styles.mediaButtonText}>Chụp ảnh</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mediaButton}>
                <Ionicons name="location" size={24} color="#f7b928" />
                <Text style={styles.mediaButtonText}>Vị trí</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mediaButton}>
                <Ionicons name="pricetag" size={24} color="#1877f2" />
                <Text style={styles.mediaButtonText}>Gắn thẻ</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Location */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Vị trí</Text>
            <View style={styles.locationInputContainer}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <TextInput
                style={styles.locationInput}
                placeholder="Thêm vị trí"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationSuggestions}>
              {['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Cần Thơ'].map(loc => (
                <TouchableOpacity 
                  key={loc} 
                  style={styles.locationChip}
                  onPress={() => setLocation(loc)}
                >
                  <Text style={styles.locationChipText}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>
              Hashtag ({selectedTags.length}/10)
            </Text>
            
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <View style={styles.selectedTagsContainer}>
                {selectedTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.selectedTag}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={styles.selectedTagText}>#{tag}</Text>
                    <Ionicons name="close" size={14} color="#0066CC" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Custom tag input */}
            <View style={styles.customTagContainer}>
              <TextInput
                style={styles.customTagInput}
                placeholder="Thêm hashtag..."
                placeholderTextColor="#999"
                value={customTag}
                onChangeText={setCustomTag}
                onSubmitEditing={addCustomTag}
              />
              {customTag.trim() && (
                <TouchableOpacity style={styles.addTagButton} onPress={addCustomTag}>
                  <Text style={styles.addTagButtonText}>Thêm</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Suggested tags */}
            <Text style={styles.suggestedTitle}>Gợi ý</Text>
            <View style={styles.suggestedTagsContainer}>
              {SUGGESTED_TAGS.filter(t => !selectedTags.includes(t)).map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={styles.suggestedTag}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={styles.suggestedTagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Tips */}
          <View style={styles.tipsSection}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.tipsGradient}
            >
              <Ionicons name="bulb-outline" size={24} color="#0369a1" />
              <View style={styles.tipsContent}>
                <Text style={styles.tipsTitle}>Mẹo tạo bài viết hay</Text>
                <Text style={styles.tipsText}>
                  • Thêm ảnh/video chất lượng cao{'\n'}
                  • Sử dụng hashtag phổ biến{'\n'}
                  • Chia sẻ kinh nghiệm thực tế{'\n'}
                  • Tag vị trí để tăng reach
                </Text>
              </View>
            </LinearGradient>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  postButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // User section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  userInfo: {},
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  audienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    gap: 4,
  },
  audienceText: {
    fontSize: 12,
    color: '#666',
  },
  
  // Audience modal
  audienceModal: {
    marginHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  audienceOptionActive: {
    backgroundColor: '#fff5f5',
  },
  audienceOptionInfo: {
    flex: 1,
  },
  audienceOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  audienceOptionNameActive: {
    color: '#0066CC',
  },
  audienceOptionDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  
  // Post types
  postTypesContainer: {
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 12,
  },
  postTypeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  postTypeTabActive: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  postTypeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  postTypeTextActive: {
    color: '#0066CC',
  },
  
  // Content input
  contentInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    lineHeight: 24,
  },
  
  // Images
  imagesSection: {
    paddingVertical: 12,
  },
  imagesContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Media section
  mediaSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    gap: 4,
  },
  mediaButtonText: {
    fontSize: 11,
    color: '#666',
  },
  
  // Location
  locationSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  locationSuggestions: {
    marginTop: 8,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f4f8',
    borderRadius: 16,
    marginRight: 8,
  },
  locationChipText: {
    fontSize: 12,
    color: '#0891b2',
  },
  
  // Tags
  tagsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0066CC',
    gap: 4,
  },
  selectedTagText: {
    fontSize: 13,
    color: '#0066CC',
  },
  customTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingLeft: 12,
    marginBottom: 12,
  },
  customTagInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  addTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0066CC',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  addTagButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  suggestedTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  suggestedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  suggestedTagText: {
    fontSize: 12,
    color: '#666',
  },
  
  // Tips
  tipsSection: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tipsGradient: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 20,
  },
});
