/**
 * Video Discovery Screen - Explore Construction Videos
 * Features: Category filter, trending videos, search, suggestions
 * @author AI Assistant
 * @date 03/01/2026
 */

import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    RefreshControl,
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

// ==================== VIDEO DATA ====================

// Video categories with icons
const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'apps', color: '#0066CC' },
  { id: 'kientruc', name: 'Kiến trúc', icon: 'business', color: '#3b82f6' },
  { id: 'noithat', name: 'Nội thất', icon: 'bed', color: '#666666' },
  { id: 'thicong', name: 'Thi công', icon: 'construct', color: '#0066CC' },
  { id: 'vatlieu', name: 'Vật liệu', icon: 'cube', color: '#0066CC' },
  { id: 'phongthuy', name: 'Phong thủy', icon: 'compass', color: '#666666' },
  { id: 'diennuoc', name: 'Điện nước', icon: 'water', color: '#06b6d4' },
  { id: 'sanvuon', name: 'Sân vườn', icon: 'leaf', color: '#0066CC' },
  { id: 'diy', name: 'DIY', icon: 'hammer', color: '#0066CC' },
  { id: 'tips', name: 'Mẹo hay', icon: 'bulb', color: '#eab308' },
];

// Trending videos
const TRENDING_VIDEOS = [
  {
    id: 'trend_1',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
    title: 'Top 10 mẫu biệt thự đẹp nhất 2026',
    user: { name: 'Kiến Trúc A&A', avatar: 'https://i.pravatar.cc/150?u=arch1', verified: true },
    views: '1.2M',
    duration: '5:45',
    likes: 89000,
    category: 'kientruc',
  },
  {
    id: 'trend_2',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    title: 'Xu hướng nội thất 2026 không thể bỏ qua',
    user: { name: 'Nội Thất Luxury', avatar: 'https://i.pravatar.cc/150?u=int1', verified: true },
    views: '856K',
    duration: '8:12',
    likes: 67000,
    category: 'noithat',
  },
  {
    id: 'trend_3',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
    title: 'Kỹ thuật xây móng nhà 3 tầng chuẩn',
    user: { name: 'Thợ Xây Pro', avatar: 'https://i.pravatar.cc/150?u=worker1', verified: false },
    views: '543K',
    duration: '12:30',
    likes: 45000,
    category: 'thicong',
  },
];

// Featured creators
const FEATURED_CREATORS = [
  { id: 'c1', name: 'Kiến Trúc Sư Minh', avatar: 'https://i.pravatar.cc/150?u=c1', followers: '234K', videos: 156, verified: true },
  { id: 'c2', name: 'Thợ Xây Bền', avatar: 'https://i.pravatar.cc/150?u=c2', followers: '189K', videos: 203, verified: false },
  { id: 'c3', name: 'Nội Thất Studio', avatar: 'https://i.pravatar.cc/150?u=c3', followers: '312K', videos: 89, verified: true },
  { id: 'c4', name: 'DIY Việt Nam', avatar: 'https://i.pravatar.cc/150?u=c4', followers: '567K', videos: 345, verified: true },
  { id: 'c5', name: 'Phong Thủy 360', avatar: 'https://i.pravatar.cc/150?u=c5', followers: '123K', videos: 78, verified: true },
];

// All videos
const ALL_VIDEOS = [
  {
    id: 'v1',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    title: 'Nhà phố 5x20m - Thiết kế tối ưu không gian',
    user: { name: 'HomeDesign', avatar: 'https://i.pravatar.cc/150?u=hd1' },
    views: '234K',
    duration: '3:45',
    category: 'kientruc',
  },
  {
    id: 'v2',
    thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400',
    title: 'Phòng ngủ master sang trọng 30m²',
    user: { name: 'Interior Pro', avatar: 'https://i.pravatar.cc/150?u=ip1' },
    views: '156K',
    duration: '4:20',
    category: 'noithat',
  },
  {
    id: 'v3',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    title: 'So sánh các loại gạch ốp lát 2026',
    user: { name: 'Vật Liệu XD', avatar: 'https://i.pravatar.cc/150?u=vl1' },
    views: '89K',
    duration: '6:15',
    category: 'vatlieu',
  },
  {
    id: 'v4',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    title: 'Hướng nhà hợp tuổi Giáp Thìn',
    user: { name: 'Phong Thủy VN', avatar: 'https://i.pravatar.cc/150?u=pt1' },
    views: '445K',
    duration: '7:30',
    category: 'phongthuy',
  },
  {
    id: 'v5',
    thumbnail: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
    title: 'Tự sửa vòi nước bị rỉ tại nhà',
    user: { name: 'DIY Master', avatar: 'https://i.pravatar.cc/150?u=diy1' },
    views: '123K',
    duration: '5:45',
    category: 'diy',
  },
  {
    id: 'v6',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    title: 'Villa hiện đại 500m² - Full tour',
    user: { name: 'Luxury Homes', avatar: 'https://i.pravatar.cc/150?u=lh1' },
    views: '567K',
    duration: '10:20',
    category: 'kientruc',
  },
  {
    id: 'v7',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    title: 'Cách đổ bê tông sàn đúng kỹ thuật',
    user: { name: 'Xây Dựng Pro', avatar: 'https://i.pravatar.cc/150?u=xd1' },
    views: '234K',
    duration: '8:45',
    category: 'thicong',
  },
  {
    id: 'v8',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    title: 'Tiểu cảnh sân vườn mini đẹp',
    user: { name: 'Garden Art', avatar: 'https://i.pravatar.cc/150?u=ga1' },
    views: '78K',
    duration: '4:30',
    category: 'sanvuon',
  },
];

// Search suggestions
const SEARCH_SUGGESTIONS = [
  'Biệt thự hiện đại',
  'Nội thất phòng khách',
  'Cách xây tường gạch',
  'Phong thủy nhà ở',
  'Sơn nhà màu gì đẹp',
  'Thiết kế nhà phố 5m',
  'Cầu thang xoắn ốc',
  'Bể bơi mini gia đình',
];

// ==================== COMPONENTS ====================

// Category Chip
const CategoryChip = ({ 
  category, 
  isSelected, 
  onPress 
}: { 
  category: typeof CATEGORIES[0];
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.categoryChip,
      isSelected && { backgroundColor: category.color }
    ]}
    onPress={onPress}
  >
    <Ionicons 
      name={category.icon as any} 
      size={18} 
      color={isSelected ? '#fff' : category.color} 
    />
    <Text style={[
      styles.categoryChipText,
      isSelected && styles.categoryChipTextActive
    ]}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

// Trending Video Card
const TrendingVideoCard = ({ 
  video, 
  index,
  onPress 
}: { 
  video: typeof TRENDING_VIDEOS[0];
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.trendingCard} onPress={onPress}>
    <View style={styles.trendingImageContainer}>
      <Image source={{ uri: video.thumbnail }} style={styles.trendingImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.trendingGradient}
      />
      <View style={styles.trendingRank}>
        <Text style={styles.trendingRankText}>#{index + 1}</Text>
      </View>
      <View style={styles.trendingDuration}>
        <Text style={styles.durationText}>{video.duration}</Text>
      </View>
      <View style={styles.trendingInfo}>
        <Text style={styles.trendingTitle} numberOfLines={2}>{video.title}</Text>
        <View style={styles.trendingStats}>
          <View style={styles.trendingUser}>
            <Image source={{ uri: video.user.avatar }} style={styles.trendingAvatar} />
            <Text style={styles.trendingUserName}>{video.user.name}</Text>
            {video.user.verified && (
              <Ionicons name="checkmark-circle" size={12} color="#3b82f6" />
            )}
          </View>
          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={12} color="#fff" />
            <Text style={styles.viewsText}>{video.views}</Text>
          </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// Creator Card
const CreatorCard = ({ 
  creator, 
  onPress, 
  onFollow 
}: { 
  creator: typeof FEATURED_CREATORS[0];
  onPress: () => void;
  onFollow: () => void;
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  return (
    <TouchableOpacity style={styles.creatorCard} onPress={onPress}>
      <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} />
      <View style={styles.creatorInfo}>
        <View style={styles.creatorNameRow}>
          <Text style={styles.creatorName} numberOfLines={1}>{creator.name}</Text>
          {creator.verified && (
            <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
          )}
        </View>
        <Text style={styles.creatorStats}>{creator.followers} người theo dõi</Text>
        <Text style={styles.creatorVideos}>{creator.videos} video</Text>
      </View>
      <TouchableOpacity 
        style={[styles.followBtn, isFollowing && styles.followingBtn]}
        onPress={() => {
          setIsFollowing(!isFollowing);
          onFollow();
        }}
      >
        <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Video Grid Item
const VideoGridItem = ({ 
  video, 
  onPress 
}: { 
  video: typeof ALL_VIDEOS[0];
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.videoGridItem} onPress={onPress}>
    <View style={styles.videoThumbnailContainer}>
      <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
      <View style={styles.videoDuration}>
        <Text style={styles.durationText}>{video.duration}</Text>
      </View>
      <View style={styles.videoPlayIcon}>
        <Ionicons name="play-circle" size={36} color="rgba(255,255,255,0.9)" />
      </View>
    </View>
    <View style={styles.videoInfo}>
      <Image source={{ uri: video.user.avatar }} style={styles.videoUserAvatar} />
      <View style={styles.videoTextInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.videoMeta}>{video.user.name} • {video.views} lượt xem</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ==================== MAIN COMPONENT ====================

export default function VideoDiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const scrollY = new Animated.Value(0);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);
  
  const handleVideoPress = (videoId: string) => {
    router.push(`/social/reels-viewer?id=${videoId}` as any);
  };
  
  const handleCreatorPress = (creatorId: string) => {
    router.push(`/profile/${creatorId}` as any);
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
      // Navigate to search results
      router.push(`/social/search-results?q=${encodeURIComponent(searchQuery)}` as any);
    }
  };
  
  // Filter videos by category
  const filteredVideos = selectedCategory === 'all' 
    ? ALL_VIDEOS 
    : ALL_VIDEOS.filter(v => v.category === selectedCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm video xây dựng, nội thất..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Search Suggestions */}
      {isSearchFocused && searchQuery.length === 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Tìm kiếm phổ biến</Text>
          <View style={styles.suggestionsList}>
            {SEARCH_SUGGESTIONS.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(suggestion);
                  handleSearch();
                }}
              >
                <Ionicons name="trending-up" size={16} color="#0066CC" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Main Content */}
      {!isSearchFocused && (
        <Animated.ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0066CC']} />
          }
        >
          {/* Categories */}
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {CATEGORIES.map(category => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                />
              ))}
            </ScrollView>
          </View>
          
          {/* Trending Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flame" size={22} color="#0066CC" />
                <Text style={styles.sectionTitle}>Đang thịnh hành</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingContainer}
            >
              {TRENDING_VIDEOS.map((video, index) => (
                <TrendingVideoCard
                  key={video.id}
                  video={video}
                  index={index}
                  onPress={() => handleVideoPress(video.id)}
                />
              ))}
            </ScrollView>
          </View>
          
          {/* Featured Creators */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="star" size={22} color="#0066CC" />
                <Text style={styles.sectionTitle}>Nhà sáng tạo nổi bật</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.creatorsContainer}
            >
              {FEATURED_CREATORS.map(creator => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onPress={() => handleCreatorPress(creator.id)}
                  onFollow={() => console.log('Follow:', creator.name)}
                />
              ))}
            </ScrollView>
          </View>
          
          {/* Video Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="grid" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'all' ? 'Video mới nhất' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </Text>
              </View>
            </View>
            
            <View style={styles.videoGrid}>
              {filteredVideos.map(video => (
                <VideoGridItem
                  key={video.id}
                  video={video}
                  onPress={() => handleVideoPress(video.id)}
                />
              ))}
            </View>
          </View>
          
          {/* Free Resources Banner */}
          <View style={styles.freeBanner}>
            <LinearGradient
              colors={['#0066CC', '#004499']}
              style={styles.freeBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.freeBannerContent}>
                <Ionicons name="gift" size={40} color="#fff" />
                <View style={styles.freeBannerText}>
                  <Text style={styles.freeBannerTitle}>Video xây dựng MIỄN PHÍ</Text>
                  <Text style={styles.freeBannerSubtitle}>
                    Hàng ngàn video hướng dẫn từ các chuyên gia
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.freeBannerButton}>
                <Text style={styles.freeBannerButtonText}>Khám phá ngay</Text>
                <Ionicons name="arrow-forward" size={16} color="#004499" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
          
          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      )}
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Suggestions
  suggestionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Categories
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  
  // Section
  section: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  
  // Trending
  trendingContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },
  trendingCard: {
    width: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  trendingImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  trendingRank: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0066CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  trendingRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  trendingDuration: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendingInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  trendingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendingUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendingAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  trendingUserName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
    color: '#fff',
  },
  durationText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  
  // Creators
  creatorsContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },
  creatorCard: {
    width: 160,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  creatorInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    maxWidth: 120,
  },
  creatorStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  creatorVideos: {
    fontSize: 11,
    color: '#999',
  },
  followBtn: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followingBtn: {
    backgroundColor: '#f0f0f0',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  followingBtnText: {
    color: '#666',
  },
  
  // Video Grid
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  videoGridItem: {
    width: (SCREEN_WIDTH - 32) / 2,
    marginBottom: 8,
  },
  videoThumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -18,
  },
  videoInfo: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  videoUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  videoTextInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    lineHeight: 18,
  },
  videoMeta: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  
  // Free Banner
  freeBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  freeBannerGradient: {
    padding: 20,
  },
  freeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  freeBannerText: {
    flex: 1,
  },
  freeBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  freeBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  freeBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
  },
  freeBannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004499',
  },
});
