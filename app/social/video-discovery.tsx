/**
 * Video Discovery Screen - Minimalist Monochrome Design
 * Features: Category filter, trending videos, creators, grid view
 * Theme: Monochrome (#1a1a1a, #9ca3af, #fafafa)
 * 
 * @author AI Assistant
 * @date 16/01/2026
 */

import {
  COMMUNITY_COLORS as COLORS,
  COMMUNITY_RADIUS as RADIUS,
  COMMUNITY_SHADOWS as SHADOWS,
  COMMUNITY_SPACING as SPACING,
  COMMUNITY_TYPOGRAPHY as TYPOGRAPHY,
} from '@/constants/community-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
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

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'apps' },
  { id: 'kientruc', name: 'Kiến trúc', icon: 'business' },
  { id: 'noithat', name: 'Nội thất', icon: 'bed' },
  { id: 'thicong', name: 'Thi công', icon: 'construct' },
  { id: 'vatlieu', name: 'Vật liệu', icon: 'cube' },
  { id: 'diy', name: 'DIY', icon: 'hammer' },
  { id: 'tips', name: 'Mẹo hay', icon: 'bulb' },
];

const TRENDING_VIDEOS = [
  {
    id: 'trend_1',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
    title: 'Top 10 mẫu biệt thự đẹp nhất 2026',
    user: { name: 'Kiến Trúc A&A', avatar: 'https://i.pravatar.cc/150?u=arch1', verified: true },
    views: '1.2M',
    duration: '5:45',
    category: 'kientruc',
  },
  {
    id: 'trend_2',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    title: 'Xu hướng nội thất 2026',
    user: { name: 'Nội Thất Luxury', avatar: 'https://i.pravatar.cc/150?u=int1', verified: true },
    views: '856K',
    duration: '8:12',
    category: 'noithat',
  },
  {
    id: 'trend_3',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
    title: 'Kỹ thuật xây móng chuẩn',
    user: { name: 'Thợ Xây Pro', avatar: 'https://i.pravatar.cc/150?u=worker1', verified: false },
    views: '543K',
    duration: '12:30',
    category: 'thicong',
  },
];

const CREATORS = [
  { id: 'c1', name: 'Kiến Trúc Sư Minh', avatar: 'https://i.pravatar.cc/150?u=c1', followers: '234K', verified: true },
  { id: 'c2', name: 'Thợ Xây Bền', avatar: 'https://i.pravatar.cc/150?u=c2', followers: '189K', verified: false },
  { id: 'c3', name: 'Nội Thất Studio', avatar: 'https://i.pravatar.cc/150?u=c3', followers: '312K', verified: true },
  { id: 'c4', name: 'DIY Việt Nam', avatar: 'https://i.pravatar.cc/150?u=c4', followers: '567K', verified: true },
];

const ALL_VIDEOS = [
  { id: 'v1', thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', title: 'Nhà phố 5x20m tối ưu', user: 'HomeDesign', views: '234K', duration: '3:45', category: 'kientruc' },
  { id: 'v2', thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400', title: 'Phòng ngủ master 30m²', user: 'Interior Pro', views: '156K', duration: '4:20', category: 'noithat' },
  { id: 'v3', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', title: 'So sánh gạch ốp lát', user: 'Vật Liệu XD', views: '89K', duration: '6:15', category: 'vatlieu' },
  { id: 'v4', thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', title: 'Phong thủy nhà ở', user: 'Phong Thủy VN', views: '445K', duration: '7:30', category: 'tips' },
  { id: 'v5', thumbnail: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400', title: 'Tự sửa vòi nước', user: 'DIY Master', views: '123K', duration: '5:45', category: 'diy' },
  { id: 'v6', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', title: 'Đổ bê tông đúng kỹ thuật', user: 'Xây Dựng Pro', views: '234K', duration: '8:45', category: 'thicong' },
];

// ==================== COMPONENTS ====================

// Category Chip - Minimal
const CategoryChip = ({ item, isSelected, onPress }: { 
  item: typeof CATEGORIES[0]; 
  isSelected: boolean; 
  onPress: () => void 
}) => (
  <TouchableOpacity 
    style={[styles.categoryChip, isSelected && styles.categoryChipActive]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons 
      name={item.icon as any} 
      size={16} 
      color={isSelected ? COLORS.textInverse : COLORS.textSecondary} 
    />
    <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

// Trending Video Card - Minimal horizontal
const TrendingCard = ({ item, index, onPress }: { 
  item: typeof TRENDING_VIDEOS[0]; 
  index: number;
  onPress: () => void 
}) => (
  <TouchableOpacity style={styles.trendingCard} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: item.thumbnail }} style={styles.trendingImage} />
    <View style={styles.trendingOverlay}>
      <View style={styles.trendingRank}>
        <Text style={styles.trendingRankText}>#{index + 1}</Text>
      </View>
      <View style={styles.trendingDuration}>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
    </View>
    <View style={styles.trendingInfo}>
      <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.trendingMeta}>
        <Text style={styles.trendingUser}>{item.user.name}</Text>
        <Text style={styles.trendingViews}>{item.views}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Creator Card - Minimal circle
const CreatorCard = ({ item, onPress }: { item: typeof CREATORS[0]; onPress: () => void }) => {
  const [following, setFollowing] = useState(false);
  
  return (
    <TouchableOpacity style={styles.creatorCard} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: item.avatar }} style={styles.creatorAvatar} />
      <Text style={styles.creatorName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.creatorFollowers}>{item.followers}</Text>
      <TouchableOpacity 
        style={[styles.followBtn, following && styles.followingBtn]}
        onPress={() => setFollowing(!following)}
      >
        <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
          {following ? 'Đang theo' : 'Theo dõi'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Video Grid Item - Minimal
const VideoGridItem = ({ item, onPress }: { item: typeof ALL_VIDEOS[0]; onPress: () => void }) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.gridThumbnail}>
      <Image source={{ uri: item.thumbnail }} style={styles.gridImage} />
      <View style={styles.gridDuration}>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
      <View style={styles.gridPlayIcon}>
        <Ionicons name="play" size={24} color={COLORS.textInverse} />
      </View>
    </View>
    <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
    <Text style={styles.gridMeta}>{item.user} • {item.views}</Text>
  </TouchableOpacity>
);

// Section Header
const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAllText}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ==================== MAIN COMPONENT ====================

export default function VideoDiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);
  
  const handleVideoPress = (videoId: string) => {
    router.push(`/social/reels-viewer?id=${videoId}` as any);
  };
  
  const handleCreatorPress = (creatorId: string) => {
    router.push(`/social/profile/${creatorId}` as any);
  };
  
  const filteredVideos = selectedCategory === 'all' 
    ? ALL_VIDEOS 
    : ALL_VIDEOS.filter(v => v.category === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khám phá Video</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="options-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm video..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat.id}
              item={cat}
              isSelected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>
        
        {/* Trending Section */}
        <SectionHeader 
          title="Xu hướng" 
          onSeeAll={() => router.push('/social/reels-viewer')}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingContainer}
        >
          {TRENDING_VIDEOS.map((video, index) => (
            <TrendingCard
              key={video.id}
              item={video}
              index={index}
              onPress={() => handleVideoPress(video.id)}
            />
          ))}
        </ScrollView>
        
        {/* Creators Section */}
        <SectionHeader title="Nhà sáng tạo" />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.creatorsContainer}
        >
          {CREATORS.map(creator => (
            <CreatorCard
              key={creator.id}
              item={creator}
              onPress={() => handleCreatorPress(creator.id)}
            />
          ))}
        </ScrollView>
        
        {/* All Videos Grid */}
        <SectionHeader title={selectedCategory === 'all' ? 'Tất cả video' : CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Video'} />
        <View style={styles.videoGrid}>
          {filteredVideos.map(video => (
            <VideoGridItem
              key={video.id}
              item={video}
              onPress={() => handleVideoPress(video.id)}
            />
          ))}
        </View>
        
        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================

const GRID_ITEM_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

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
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    paddingVertical: 0,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Categories
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryTextActive: {
    color: COLORS.textInverse,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  
  // Trending
  trendingContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  trendingCard: {
    width: 260,
    marginRight: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  trendingImage: {
    width: '100%',
    height: 140,
  },
  trendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 140,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  trendingRank: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  trendingRankText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textInverse,
  },
  trendingDuration: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textInverse,
  },
  trendingInfo: {
    padding: SPACING.md,
  },
  trendingTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trendingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendingUser: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  trendingViews: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
  },
  
  // Creators
  creatorsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  creatorCard: {
    width: 120,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  creatorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: SPACING.sm,
  },
  creatorName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  creatorFollowers: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.sm,
  },
  followBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  followingBtn: {
    backgroundColor: COLORS.surfaceElevated,
  },
  followBtnText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textInverse,
  },
  followingBtnText: {
    color: COLORS.textSecondary,
  },
  
  // Video Grid
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    marginBottom: SPACING.md,
  },
  gridThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceElevated,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridDuration: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  gridPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  gridMeta: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
});
