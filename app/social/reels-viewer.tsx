/**
 * Reels Viewer Screen - TikTok/Instagram Style Full-screen Video Player
 * Features: Vertical swipe, like, comment, share, follow, sound toggle
 * @author AI Assistant  
 * @date 03/01/2026
 */

import Avatar from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewToken
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== CONSTRUCTION REELS DATA ====================
// Video miễn phí từ các nguồn như Pexels, Pixabay
const REELS_DATA = [
  {
    id: 'reel_1',
    user: {
      id: 'user_1',
      name: 'Kiến Trúc A&A',
      avatar: 'https://i.pravatar.cc/150?u=architect1',
      verified: true,
      followers: '125K',
      isFollowing: false,
    },
    // Using thumbnail as video preview (in real app would be actual video URL)
    videoUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
    description: '🏠 Biệt thự hiện đại 3 tầng - Phong cách Minimalist\n\n#biethu #kientruc #modern #minimalist #nhadepmoi2026',
    music: '♪ Nhạc nền - Acoustic Chill',
    likes: 12543,
    comments: 234,
    shares: 567,
    saves: 890,
    views: '125K',
    duration: '0:45',
    liked: false,
    saved: false,
    category: 'kiến trúc',
    tags: ['biệt thự', 'modern', 'minimalist'],
  },
  {
    id: 'reel_2',
    user: {
      id: 'user_2',
      name: 'Thợ Xây Minh Khang',
      avatar: 'https://i.pravatar.cc/150?u=worker1',
      verified: false,
      followers: '45.2K',
      isFollowing: true,
    },
    videoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
    description: '💪 Kỹ thuật đổ móng chuẩn - Bước quan trọng nhất!\n\nBí quyết:\n✅ Móng sâu 1.2m\n✅ Thép phi 16\n✅ Bê tông M300\n\n#xaydung #thoikithuat #daoong #foundation',
    music: '♪ Construction Beat',
    likes: 8765,
    comments: 456,
    shares: 234,
    saves: 567,
    views: '87K',
    duration: '1:02',
    liked: true,
    saved: false,
    category: 'thi công',
    tags: ['móng', 'bê tông', 'kỹ thuật'],
  },
  {
    id: 'reel_3',
    user: {
      id: 'user_3',
      name: 'Nội Thất Luxury',
      avatar: 'https://i.pravatar.cc/150?u=interior1',
      verified: true,
      followers: '89.5K',
      isFollowing: false,
    },
    videoUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    description: '✨ Xu hướng nội thất 2026 - Earth Tone kết hợp gỗ tự nhiên\n\n🛋️ Phòng khách 40m²\n💡 Đèn LED âm trần\n🪴 Cây xanh decor\n\n#noithat #earthtone #livingroom #decor2026',
    music: '♪ Chill Lofi - Relax',
    likes: 23456,
    comments: 678,
    shares: 890,
    saves: 1234,
    views: '234K',
    duration: '0:38',
    liked: false,
    saved: true,
    category: 'nội thất',
    tags: ['phòng khách', 'earth tone', 'gỗ tự nhiên'],
  },
  {
    id: 'reel_4',
    user: {
      id: 'user_4',
      name: 'HomeDesign Studio',
      avatar: 'https://i.pravatar.cc/150?u=design1',
      verified: true,
      followers: '156K',
      isFollowing: false,
    },
    videoUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
    description: '🏡 Nhà phố 3 tầng - Diện tích 5x20m\n\n📐 Thiết kế tối ưu không gian\n🌿 Giếng trời thông thoáng\n💨 Hướng Đông Nam\n\n#nhapho #thietkenha #5x20 #nhadep',
    music: '♪ Home Sweet Home',
    likes: 15678,
    comments: 345,
    shares: 456,
    saves: 789,
    views: '156K',
    duration: '0:52',
    liked: false,
    saved: false,
    category: 'thiết kế',
    tags: ['nhà phố', 'giếng trời', 'đông nam'],
  },
  {
    id: 'reel_5',
    user: {
      id: 'user_5',
      name: 'Vật Liệu Xây Dựng Pro',
      avatar: 'https://i.pravatar.cc/150?u=material1',
      verified: false,
      followers: '32.1K',
      isFollowing: false,
    },
    videoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    description: '🧱 So sánh gạch block vs gạch đỏ\n\n📊 Bảng so sánh chi tiết:\n• Cách nhiệt: Block thắng ✓\n• Độ bền: Ngang nhau\n• Giá: Gạch đỏ rẻ hơn\n\n#vatlieu #gach #xaydung #tips',
    music: '♪ Educational Beat',
    likes: 6789,
    comments: 567,
    shares: 345,
    saves: 890,
    views: '67K',
    duration: '1:15',
    liked: false,
    saved: false,
    category: 'vật liệu',
    tags: ['gạch', 'vật liệu', 'so sánh'],
  },
  {
    id: 'reel_6',
    user: {
      id: 'user_6',
      name: 'Phong Thủy Master',
      avatar: 'https://i.pravatar.cc/150?u=fengshui1',
      verified: true,
      followers: '78.9K',
      isFollowing: true,
    },
    videoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
    description: '🔮 Phong thủy cửa chính - 5 điều tối kỵ\n\n⛔ Đừng bao giờ:\n1. Cửa đối diện cầu thang\n2. Gương phản chiếu cửa\n3. Cây khô trước cửa\n4. Giày dép bừa bộn\n5. Đèn hỏng không sửa\n\n#phongthuy #cuachinh #nhadep',
    music: '♪ Zen Garden',
    likes: 34567,
    comments: 890,
    shares: 1234,
    saves: 2345,
    views: '345K',
    duration: '0:58',
    liked: false,
    saved: false,
    category: 'phong thủy',
    tags: ['cửa chính', 'tối kỵ', 'feng shui'],
  },
  {
    id: 'reel_7',
    user: {
      id: 'user_7',
      name: 'Điện Nước 24h',
      avatar: 'https://i.pravatar.cc/150?u=plumber1',
      verified: false,
      followers: '23.4K',
      isFollowing: false,
    },
    videoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600',
    description: '🔧 Sửa vòi nước bị rỉ - Tự làm tại nhà!\n\n🛠️ Dụng cụ cần:\n• Cờ lê 12\n• Ron cao su mới\n• Băng keo Teflon\n\n#suachua #diennuoc #DIY #meo',
    music: '♪ Fix It Sound',
    likes: 5678,
    comments: 234,
    shares: 567,
    saves: 890,
    views: '56K',
    duration: '1:23',
    liked: false,
    saved: false,
    category: 'điện nước',
    tags: ['vòi nước', 'sửa chữa', 'DIY'],
  },
  {
    id: 'reel_8',
    user: {
      id: 'user_8',
      name: 'Sân Vườn Việt',
      avatar: 'https://i.pravatar.cc/150?u=garden1',
      verified: true,
      followers: '67.8K',
      isFollowing: false,
    },
    videoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    description: '🌿 Tiểu cảnh sân vườn mini - Không gian xanh trong nhà phố\n\n🪴 Cây được dùng:\n• Trầu bà\n• Vạn niên thanh\n• Cây kim tiền\n• Hoa giấy\n\n#sanvuon #tieucaanh #cayxanh',
    music: '♪ Nature Sounds',
    likes: 9876,
    comments: 345,
    shares: 234,
    saves: 678,
    views: '98K',
    duration: '0:42',
    liked: false,
    saved: false,
    category: 'sân vườn',
    tags: ['tiểu cảnh', 'cây xanh', 'nhà phố'],
  },
];

// Video categories
const VIDEO_CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'apps' },
  { id: 'kientruc', name: 'Kiến trúc', icon: 'business' },
  { id: 'noithat', name: 'Nội thất', icon: 'bed' },
  { id: 'thicong', name: 'Thi công', icon: 'construct' },
  { id: 'vatlieu', name: 'Vật liệu', icon: 'cube' },
  { id: 'phongthuy', name: 'Phong thủy', icon: 'compass' },
  { id: 'diennuoc', name: 'Điện nước', icon: 'water' },
  { id: 'sanvuon', name: 'Sân vườn', icon: 'leaf' },
];

// Comment data
const SAMPLE_COMMENTS = [
  { id: 1, user: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=a', content: 'Video hay quá! 👍', likes: 234, time: '2h', replies: 12 },
  { id: 2, user: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=b', content: 'Cho em hỏi chi phí khoảng bao nhiêu ạ?', likes: 89, time: '3h', replies: 8 },
  { id: 3, user: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=c', content: 'Rất chuyên nghiệp! Đã theo dõi ❤️', likes: 156, time: '5h', replies: 3 },
  { id: 4, user: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=d', content: 'Ước gì nhà mình cũng đẹp như vậy 🏠', likes: 67, time: '6h', replies: 1 },
  { id: 5, user: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/150?u=e', content: 'Anh ơi cho em xin số tư vấn với ạ', likes: 45, time: '8h', replies: 5 },
];

// ==================== REEL ITEM COMPONENT ====================
const ReelItem = ({
  reel,
  isActive,
  onLike,
  onComment,
  onShare,
  onSave,
  onFollow,
  onUserPress,
  isMuted,
  onToggleMute,
}: {
  reel: typeof REELS_DATA[0];
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onFollow: () => void;
  onUserPress: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  
  // Double tap to like animation
  const handleDoubleTap = useCallback(() => {
    if (!reel.liked) {
      onLike();
    }
    // Show heart animation
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(600),
      Animated.timing(heartAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reel.liked, onLike, heartAnim]);
  
  const lastTap = useRef<number>(0);
  
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleDoubleTap();
    } else {
      onToggleMute();
    }
    lastTap.current = now;
  };
  
  // Like button animation
  const handleLikePress = () => {
    Animated.sequence([
      Animated.spring(likeAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(likeAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
    onLike();
  };
  
  const isLongDesc = reel.description.length > 80;
  const displayDesc = showFullDesc || !isLongDesc 
    ? reel.description 
    : reel.description.slice(0, 80) + '...';

  return (
    <Pressable style={styles.reelContainer} onPress={handleTap}>
      {/* Video/Image Background */}
      <Image 
        source={{ uri: reel.thumbnail }} 
        style={styles.reelBackground}
        resizeMode="cover"
      />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
        style={styles.reelGradient}
        locations={[0, 0.5, 1]}
      />
      
      {/* Double tap heart animation */}
      <Animated.View 
        style={[
          styles.doubleTapHeart,
          {
            opacity: heartAnim,
            transform: [{ scale: heartAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1.2],
            })}],
          }
        ]}
      >
        <Ionicons name="heart" size={100} color="#ff2d55" />
      </Animated.View>
      
      {/* Header - Back & Search */}
      <View style={[styles.reelHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.reelHeaderTitle}>Reels</Text>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="camera-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Right Actions */}
      <View style={[styles.reelActions, { bottom: insets.bottom + 80 }]}>
        {/* User Avatar with Follow */}
        <TouchableOpacity style={styles.actionUserAvatar} onPress={onUserPress}>
          <Image source={{ uri: reel.user.avatar }} style={styles.actionAvatar} />
          {!reel.user.isFollowing && (
            <TouchableOpacity style={styles.followButton} onPress={onFollow}>
              <Ionicons name="add" size={12} color="#fff" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        {/* Like */}
        <TouchableOpacity style={styles.actionItem} onPress={handleLikePress}>
          <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
            <Ionicons 
              name={reel.liked ? "heart" : "heart-outline"} 
              size={32} 
              color={reel.liked ? "#ff2d55" : "#fff"} 
            />
          </Animated.View>
          <Text style={styles.actionCount}>{formatNumber(reel.likes)}</Text>
        </TouchableOpacity>
        
        {/* Comment */}
        <TouchableOpacity style={styles.actionItem} onPress={onComment}>
          <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
          <Text style={styles.actionCount}>{formatNumber(reel.comments)}</Text>
        </TouchableOpacity>
        
        {/* Share */}
        <TouchableOpacity style={styles.actionItem} onPress={onShare}>
          <Ionicons name="paper-plane" size={28} color="#fff" />
          <Text style={styles.actionCount}>{formatNumber(reel.shares)}</Text>
        </TouchableOpacity>
        
        {/* Save */}
        <TouchableOpacity style={styles.actionItem} onPress={onSave}>
          <Ionicons 
            name={reel.saved ? "bookmark" : "bookmark-outline"} 
            size={28} 
            color={reel.saved ? "#0066CC" : "#fff"} 
          />
          <Text style={styles.actionCount}>{formatNumber(reel.saves)}</Text>
        </TouchableOpacity>
        
        {/* More */}
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Music disc */}
        <Animated.View style={styles.musicDisc}>
          <Image source={{ uri: reel.user.avatar }} style={styles.musicDiscImage} />
        </Animated.View>
      </View>
      
      {/* Bottom Info */}
      <View style={[styles.reelInfo, { paddingBottom: insets.bottom + 80 }]}>
        {/* User info */}
        <TouchableOpacity style={styles.reelUserInfo} onPress={onUserPress}>
          <Text style={styles.reelUserName}>@{reel.user.name.toLowerCase().replace(/ /g, '_')}</Text>
          {reel.user.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#3b82f6" style={{ marginLeft: 4 }} />
          )}
          {!reel.user.isFollowing && (
            <TouchableOpacity style={styles.followTextButton} onPress={onFollow}>
              <Text style={styles.followText}>Theo dõi</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        {/* Description */}
        <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
          <Text style={styles.reelDescription}>{displayDesc}</Text>
          {isLongDesc && (
            <Text style={styles.seeMore}>{showFullDesc ? 'Thu gọn' : 'Xem thêm'}</Text>
          )}
        </TouchableOpacity>
        
        {/* Music */}
        <View style={styles.musicInfo}>
          <Ionicons name="musical-notes" size={14} color="#fff" />
          <Text style={styles.musicText} numberOfLines={1}>{reel.music}</Text>
        </View>
      </View>
      
      {/* Progress bar */}
      <View style={[styles.progressBar, { bottom: insets.bottom + 76 }]}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>
      
      {/* Mute indicator */}
      {isMuted && (
        <View style={styles.muteIndicator}>
          <Ionicons name="volume-mute" size={20} color="#fff" />
        </View>
      )}
    </Pressable>
  );
};

// Format number helper
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// ==================== MAIN COMPONENT ====================
export default function ReelsViewerScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string; category?: string }>();
  
  const [reels, setReels] = useState(REELS_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedReel, setSelectedReel] = useState<typeof REELS_DATA[0] | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const flatListRef = useRef<FlatList>(null);
  
  // Find initial reel by id
  useEffect(() => {
    if (params.id) {
      const index = reels.findIndex(r => r.id === params.id);
      if (index > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 100);
      }
    }
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.id, params.category]);
  
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;
  
  const handleLike = (reelId: string) => {
    setReels(prev => prev.map(r => 
      r.id === reelId 
        ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
        : r
    ));
  };
  
  const handleComment = (reel: typeof REELS_DATA[0]) => {
    setSelectedReel(reel);
    setShowComments(true);
  };
  
  const handleShare = async (reel: typeof REELS_DATA[0]) => {
    try {
      await Share.share({
        message: `Xem video "${reel.description.split('\n')[0]}" từ ${reel.user.name} trên HomeXD!\n\nhttps://homexd.app/reels/${reel.id}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };
  
  const handleSave = (reelId: string) => {
    setReels(prev => prev.map(r => 
      r.id === reelId ? { ...r, saved: !r.saved } : r
    ));
  };
  
  const handleFollow = (userId: string) => {
    setReels(prev => prev.map(r => 
      r.user.id === userId 
        ? { ...r, user: { ...r.user, isFollowing: true } }
        : r
    ));
  };
  
  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };
  
  // Filter reels by category and search
  const filteredReels = reels.filter(reel => {
    const matchCategory = selectedCategory === 'all' || 
      reel.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = !searchQuery || 
      reel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Reels List */}
      <FlatList
        ref={flatListRef}
        data={filteredReels}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelItem
            reel={item}
            isActive={index === currentIndex}
            onLike={() => handleLike(item.id)}
            onComment={() => handleComment(item)}
            onShare={() => handleShare(item)}
            onSave={() => handleSave(item.id)}
            onFollow={() => handleFollow(item.user.id)}
            onUserPress={() => handleUserPress(item.user.id)}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
      
      {/* Category Filter Overlay */}
      <View style={[styles.categoryOverlay, { top: insets.top + 50 }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {VIDEO_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={14} 
                color={selectedCategory === cat.id ? '#fff' : 'rgba(255,255,255,0.8)'} 
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.commentsOverlay}>
          <Pressable 
            style={styles.commentsBackdrop} 
            onPress={() => setShowComments(false)} 
          />
          
          <View style={[styles.commentsSheet, { paddingBottom: insets.bottom }]}>
            {/* Handle */}
            <View style={styles.sheetHandle} />
            
            {/* Header */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>
                {selectedReel?.comments.toLocaleString()} bình luận
              </Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Comments List */}
            <FlatList
              data={SAMPLE_COMMENTS}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.commentsList}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{item.user}</Text>
                      <Text style={styles.commentTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity style={styles.commentAction}>
                        <Ionicons name="heart-outline" size={16} color="#666" />
                        <Text style={styles.commentActionText}>{item.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.commentAction}>
                        <Ionicons name="chatbubble-outline" size={14} color="#666" />
                        <Text style={styles.commentActionText}>{item.replies} phản hồi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
            
            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <Avatar name={user?.name || 'U'} size={36} />
              <TextInput
                style={styles.commentInput}
                placeholder="Thêm bình luận..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  !commentText.trim() && styles.sendButtonDisabled
                ]}
                disabled={!commentText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? '#0066CC' : '#ccc'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper ScrollView import
const { ScrollView } = require('react-native');

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Reel Item
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  reelBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  reelGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  
  // Header
  reelHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Actions
  reelActions: {
    position: 'absolute',
    right: 12,
    alignItems: 'center',
    gap: 16,
  },
  actionUserAvatar: {
    marginBottom: 8,
  },
  actionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  musicDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 8,
    borderColor: '#333',
    overflow: 'hidden',
    marginTop: 8,
  },
  musicDiscImage: {
    width: '100%',
    height: '100%',
  },
  
  // Info
  reelInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  reelUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reelUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  followTextButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  followText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  reelDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 4,
  },
  seeMore: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  musicText: {
    fontSize: 13,
    color: '#fff',
    flex: 1,
  },
  
  // Progress
  progressBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  
  // Double tap heart
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    zIndex: 100,
  },
  
  // Mute indicator
  muteIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Category Filter
  categoryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
  },
  categoryContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#0066CC',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  
  // Comments Modal
  commentsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentsSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 8,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: '#666',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
