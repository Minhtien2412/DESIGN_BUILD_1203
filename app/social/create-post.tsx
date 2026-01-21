/**
 * Create Post Screen - Minimalist Monochrome Design
 * Features: Photo/video upload, text input, tags, audience selection
 * Theme: Monochrome (#1a1a1a, #9ca3af, #fafafa)
 * 
 * @author AI Assistant
 * @date 16/01/2026
 */

import {
    COMMUNITY_COLORS as COLORS,
    COMMUNITY_RADIUS as RADIUS,
    COMMUNITY_SPACING as SPACING,
    COMMUNITY_TYPOGRAPHY as TYPOGRAPHY
} from '@/constants/community-theme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== DATA ====================

const POST_TYPES = [
  { id: 'post', name: 'Bài viết', icon: 'create-outline' },
  { id: 'photo', name: 'Ảnh/Video', icon: 'images-outline' },
  { id: 'reel', name: 'Reels', icon: 'film-outline' },
];

const SUGGESTED_TAGS = [
  'xâydựng', 'kiếntrúc', 'nộithất', 'nhàđẹp', 'thiếtkế',
  'biệtthự', 'nhàphố', 'cănnhộ', 'vậtliệu', 'DIY',
];

const AUDIENCE_OPTIONS = [
  { id: 'public', name: 'Công khai', icon: 'globe-outline', desc: 'Mọi người' },
  { id: 'friends', name: 'Bạn bè', icon: 'people-outline', desc: 'Chỉ bạn bè' },
  { id: 'private', name: 'Chỉ mình tôi', icon: 'lock-closed-outline', desc: 'Riêng tư' },
];

// ==================== COMPONENTS ====================

// Post Type Selector
const PostTypeSelector = ({ selected, onSelect }: { 
  selected: string; 
  onSelect: (id: string) => void 
}) => (
  <View style={styles.postTypesRow}>
    {POST_TYPES.map(type => (
      <TouchableOpacity
        key={type.id}
        style={[styles.postTypeBtn, selected === type.id && styles.postTypeBtnActive]}
        onPress={() => onSelect(type.id)}
      >
        <Ionicons 
          name={type.icon as any} 
          size={20} 
          color={selected === type.id ? COLORS.textInverse : COLORS.textSecondary} 
        />
        <Text style={[styles.postTypeText, selected === type.id && styles.postTypeTextActive]}>
          {type.name}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Media Grid
const MediaGrid = ({ images, onRemove }: { 
  images: string[]; 
  onRemove: (index: number) => void 
}) => {
  if (images.length === 0) return null;
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.mediaGrid}
    >
      {images.map((uri, index) => (
        <View key={index} style={styles.mediaItem}>
          <Image source={{ uri }} style={styles.mediaImage} />
          <TouchableOpacity 
            style={styles.mediaRemoveBtn}
            onPress={() => onRemove(index)}
          >
            <Ionicons name="close" size={16} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

// Tag Chip
const TagChip = ({ tag, selected, onPress }: { 
  tag: string; 
  selected: boolean; 
  onPress: () => void 
}) => (
  <TouchableOpacity 
    style={[styles.tagChip, selected && styles.tagChipActive]}
    onPress={onPress}
  >
    <Text style={[styles.tagText, selected && styles.tagTextActive]}>#{tag}</Text>
  </TouchableOpacity>
);

// Audience Selector
const AudienceSelector = ({ selected, onSelect }: { 
  selected: string; 
  onSelect: (id: string) => void 
}) => (
  <View style={styles.audienceRow}>
    {AUDIENCE_OPTIONS.map(opt => (
      <TouchableOpacity
        key={opt.id}
        style={[styles.audienceBtn, selected === opt.id && styles.audienceBtnActive]}
        onPress={() => onSelect(opt.id)}
      >
        <Ionicons 
          name={opt.icon as any} 
          size={18} 
          color={selected === opt.id ? COLORS.textInverse : COLORS.textSecondary} 
        />
        <Text style={[styles.audienceText, selected === opt.id && styles.audienceTextActive]}>
          {opt.name}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ==================== MAIN COMPONENT ====================

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [postType, setPostType] = useState('post');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [audience, setAudience] = useState('public');
  const [isPosting, setIsPosting] = useState(false);
  
  // Pick images
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh.');
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
  
  // Take photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  // Toggle tag
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Submit post
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo bài viết</Text>
        <TouchableOpacity 
          style={[styles.postBtn, (!content.trim() && images.length === 0) && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={isPosting || (!content.trim() && images.length === 0)}
        >
          <Text style={[styles.postBtnText, (!content.trim() && images.length === 0) && styles.postBtnTextDisabled]}>
            {isPosting ? 'Đang đăng...' : 'Đăng'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Post Types */}
          <PostTypeSelector selected={postType} onSelect={setPostType} />
          
          {/* User Info */}
          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user?.name?.[0] || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
              <TouchableOpacity style={styles.audienceSmall}>
                <Ionicons 
                  name={AUDIENCE_OPTIONS.find(o => o.id === audience)?.icon as any || 'globe-outline'} 
                  size={12} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.audienceSmallText}>
                  {AUDIENCE_OPTIONS.find(o => o.id === audience)?.name || 'Công khai'}
                </Text>
                <Ionicons name="chevron-down" size={12} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Bạn đang nghĩ gì về xây dựng, kiến trúc...?"
            placeholderTextColor={COLORS.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={2000}
          />
          
          {/* Media Grid */}
          <MediaGrid images={images} onRemove={(i) => setImages(images.filter((_, idx) => idx !== i))} />
          
          {/* Media Actions */}
          <View style={styles.mediaActions}>
            <TouchableOpacity style={styles.mediaActionBtn} onPress={pickImages}>
              <Ionicons name="images-outline" size={22} color={COLORS.primary} />
              <Text style={styles.mediaActionText}>Thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaActionBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={22} color={COLORS.primary} />
              <Text style={styles.mediaActionText}>Camera</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tags Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gắn thẻ (tối đa 5)</Text>
            <View style={styles.tagsContainer}>
              {SUGGESTED_TAGS.map(tag => (
                <TagChip
                  key={tag}
                  tag={tag}
                  selected={selectedTags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                />
              ))}
            </View>
          </View>
          
          {/* Audience Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ai có thể xem?</Text>
            <AudienceSelector selected={audience} onSelect={setAudience} />
          </View>
          
          {/* Bottom Padding */}
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
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  postBtnDisabled: {
    backgroundColor: COLORS.surfaceElevated,
  },
  postBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textInverse,
  },
  postBtnTextDisabled: {
    color: COLORS.textTertiary,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Post Types
  postTypesRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    gap: SPACING.xs,
  },
  postTypeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  postTypeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  postTypeTextActive: {
    color: COLORS.textInverse,
  },
  
  // User Row
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  audienceSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  audienceSmallText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  
  // Text Input
  textInput: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  // Media Grid
  mediaGrid: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Media Actions
  mediaActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mediaActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
  },
  mediaActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  
  // Section
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tagChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.full,
  },
  tagChipActive: {
    backgroundColor: COLORS.primary,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tagTextActive: {
    color: COLORS.textInverse,
  },
  
  // Audience
  audienceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  audienceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
  },
  audienceBtnActive: {
    backgroundColor: COLORS.primary,
  },
  audienceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  audienceTextActive: {
    color: COLORS.textInverse,
  },
});
