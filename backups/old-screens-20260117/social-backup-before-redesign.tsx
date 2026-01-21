/**
 * Social Feed Screen - Facebook/Instagram Style
 * Features: Stories, Feed posts, Reels, Likes, Comments, Share
 * External Content: Pexels videos/news khi cần bổ sung dữ liệu
 * Priority: User content → External videos → External news
 * @author AI Assistant
 * @date 03/01/2026
 * @updated 16/01/2026 - Pre-load external content, badge số tin mới
 */

import Avatar from '@/components/ui/avatar';
import { TappableGallery, TappableImage } from '@/components/ui/full-media-viewer';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
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

// External content hooks and components
import { ExternalNewsSection, ExternalVideoSection } from '@/components/ExternalContentSection';
import { useExternalNews, useExternalVideos } from '@/hooks/useExternalContent';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== MOCK DATA ====================

// Stories data
const STORIES = [
  { id: 0, name: 'Bạn', avatar: null, hasStory: false, isUser: true },
  { id: 1, name: 'Kiến trúc A&A', avatar: 'https://i.pravatar.cc/150?u=company1', hasStory: true, viewed: false },
  { id: 2, name: 'Nội thất Luxury', avatar: 'https://i.pravatar.cc/150?u=company2', hasStory: true, viewed: false },
  { id: 3, name: 'Thợ Minh Khang', avatar: 'https://i.pravatar.cc/150?u=worker1', hasStory: true, viewed: true },
  { id: 4, name: 'Decor Studio', avatar: 'https://i.pravatar.cc/150?u=company3', hasStory: true, viewed: false },
  { id: 5, name: 'Phong Thủy VN', avatar: 'https://i.pravatar.cc/150?u=company4', hasStory: true, viewed: true },
  { id: 6, name: 'Công ty XD ABC', avatar: 'https://i.pravatar.cc/150?u=company5', hasStory: true, viewed: false },
  { id: 7, name: 'HomeDesign', avatar: 'https://i.pravatar.cc/150?u=company6', hasStory: true, viewed: true },
];

// Sample posts data
const POSTS = [
  {
    id: 1,
    user: {
      id: 101,
      name: 'Công ty Thiết kế A&A',
      avatar: 'https://i.pravatar.cc/150?u=company1',
      verified: true,
      role: 'Công ty thiết kế',
    },
    content: '🏠 Hoàn thành dự án biệt thự hiện đại tại Quận 2!\n\nDiện tích: 350m²\nPhong cách: Minimalist Modern\nThời gian thi công: 8 tháng\n\n👉 Liên hệ ngay để được tư vấn miễn phí!',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    likes: 1234,
    comments: 89,
    shares: 45,
    time: '2 giờ trước',
    liked: false,
    saved: false,
  },
  {
    id: 2,
    user: {
      id: 102,
      name: 'Thợ xây Minh Khang',
      avatar: 'https://i.pravatar.cc/150?u=worker1',
      verified: false,
      role: 'Thợ xây dựng • 15 năm KN',
    },
    content: '💪 Hôm nay đổ móng cho công trình mới!\n\nAi cần thợ xây dựng chuyên nghiệp liên hệ nhé:\n📞 0909.xxx.xxx\n\n#thoxay #xaydung #construction',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    ],
    video: null,
    likes: 567,
    comments: 34,
    shares: 12,
    time: '4 giờ trước',
    liked: true,
    saved: false,
  },
  {
    id: 3,
    user: {
      id: 103,
      name: 'Nội thất Luxury Home',
      avatar: 'https://i.pravatar.cc/150?u=company2',
      verified: true,
      role: 'Thiết kế nội thất cao cấp',
    },
    content: '✨ MẪU NỘI THẤT PHÒNG KHÁCH 2026 ✨\n\nXu hướng màu Earth Tone kết hợp gỗ tự nhiên\n\n🔥 Ưu đãi 20% cho 10 khách hàng đầu tiên trong tháng!',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
    ],
    likes: 2341,
    comments: 156,
    shares: 89,
    time: '6 giờ trước',
    liked: false,
    saved: true,
  },
  {
    id: 4,
    user: {
      id: 104,
      name: 'Phong Thủy Việt Nam',
      avatar: 'https://i.pravatar.cc/150?u=company4',
      verified: true,
      role: 'Chuyên gia phong thủy',
    },
    content: '🔮 PHONG THỦY NHÀ Ở NĂM 2026 🔮\n\nNhững điều cần tránh khi bố trí phòng khách:\n\n1️⃣ Không đặt gương đối diện cửa chính\n2️⃣ Tránh để cây khô héo trong nhà\n3️⃣ Không bày đồ vật sắc nhọn\n\n💬 Comment hỏi thêm, mình sẽ tư vấn!',
    images: [],
    likes: 890,
    comments: 234,
    shares: 123,
    time: '8 giờ trước',
    liked: false,
    saved: false,
  },
  {
    id: 5,
    user: {
      id: 105,
      name: 'Vật liệu xây dựng Hưng Phát',
      avatar: 'https://i.pravatar.cc/150?u=company7',
      verified: true,
      role: 'Cung cấp vật liệu xây dựng',
    },
    content: '🧱 KHUYẾN MÃI CUỐI NĂM 🧱\n\n✅ Gạch ốp lát: Giảm 30%\n✅ Sơn nước: Mua 3 tặng 1\n✅ Xi măng: Giảm 15%\n\n📦 Giao hàng miễn phí trong TP.HCM\n📞 Hotline: 1900.xxxx',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    likes: 456,
    comments: 67,
    shares: 34,
    time: '1 ngày trước',
    liked: false,
    saved: false,
  },
];

// Reels data
const REELS = [
  {
    id: 1,
    user: { name: 'Công ty A&A', avatar: 'https://i.pravatar.cc/150?u=company1' },
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    views: '12.3K',
    title: 'Biệt thự hiện đại',
  },
  {
    id: 2,
    user: { name: 'Thợ xây Minh', avatar: 'https://i.pravatar.cc/150?u=worker1' },
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    views: '8.5K',
    title: 'Kỹ thuật đổ móng',
  },
  {
    id: 3,
    user: { name: 'Nội thất Luxury', avatar: 'https://i.pravatar.cc/150?u=company2' },
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    views: '25.1K',
    title: 'Phòng khách 2026',
  },
  {
    id: 4,
    user: { name: 'HomeDesign', avatar: 'https://i.pravatar.cc/150?u=company6' },
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    views: '6.7K',
    title: 'Nhà phố 3 tầng',
  },
];

// ==================== COMPONENTS ====================

// Story Item Component
const StoryItem = ({ item, onPress }: { item: typeof STORIES[0]; onPress: () => void }) => {
  const { user } = useAuth();
  
  return (
    <TouchableOpacity style={styles.storyItem} onPress={onPress}>
      <View style={styles.storyAvatarContainer}>
        {item.isUser ? (
          <View style={styles.addStoryButton}>
            <Avatar name={user?.name || 'U'} size="xl" />
            <View style={styles.addStoryIcon}>
              <Ionicons name="add" size={14} color="#fff" />
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={item.viewed ? ['#8e8e8e', '#8e8e8e'] : ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
            style={styles.storyRing}
          >
            <View style={styles.storyAvatarWrapper}>
              <Image source={{ uri: item.avatar || '' }} style={styles.storyAvatar} />
            </View>
          </LinearGradient>
        )}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

// Post Card Component
const PostCard = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onSave,
  onUserPress,
}: { 
  post: typeof POSTS[0];
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onUserPress: () => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullContent, setShowFullContent] = useState(false);
  
  const isLongContent = post.content.length > 200;
  const displayContent = showFullContent || !isLongContent 
    ? post.content 
    : post.content.slice(0, 200) + '...';
  
  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <TouchableOpacity style={styles.postHeader} onPress={onUserPress}>
        <Image source={{ uri: post.user.avatar }} style={styles.postAvatar} />
        <View style={styles.postUserInfo}>
          <View style={styles.postUserNameRow}>
            <Text style={styles.postUserName}>{post.user.name}</Text>
            {post.user.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#0095f6" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.postUserRole}>{post.user.role}</Text>
        </View>
        <TouchableOpacity style={styles.postMoreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#333" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postText}>{displayContent}</Text>
        {isLongContent && !showFullContent && (
          <TouchableOpacity onPress={() => setShowFullContent(true)}>
            <Text style={styles.seeMoreText}>Xem thêm</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Images */}
      {post.images.length > 0 && (
        <View style={styles.postImagesContainer}>
          {post.images.length === 1 ? (
            <TappableImage 
              source={{ uri: post.images[0] }} 
              style={styles.postSingleImage}
              title={`Ảnh từ ${post.user.name}`}
              description={post.content.substring(0, 100)}
            />
          ) : (
            <TappableGallery
              key={`gallery-${post.id}`}
              images={post.images.map((img, idx) => ({
                id: `${post.id}-${idx}`,
                uri: img,
                title: `Ảnh ${idx + 1}/${post.images.length}`,
              }))}
              horizontal
              imageStyle={{ width: SCREEN_WIDTH, height: 300 }}
            />
          )}
          {post.images.length > 1 && (
            <View style={styles.imagePagination}>
              {post.images.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.paginationDot, idx === currentImageIndex && styles.paginationDotActive]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Post Stats */}
      <View style={styles.postStats}>
        <View style={styles.postLikesCount}>
          <View style={styles.likeIconsRow}>
            <View style={[styles.reactionIcon, { backgroundColor: '#0866ff' }]}>
              <Ionicons name="thumbs-up" size={10} color="#fff" />
            </View>
            <View style={[styles.reactionIcon, { backgroundColor: '#f33e58', marginLeft: -4 }]}>
              <Ionicons name="heart" size={10} color="#fff" />
            </View>
          </View>
          <Text style={styles.statsText}>{post.likes.toLocaleString()}</Text>
        </View>
        <Text style={styles.statsText}>
          {post.comments} bình luận • {post.shares} chia sẻ
        </Text>
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons 
            name={post.liked ? "thumbs-up" : "thumbs-up-outline"} 
            size={20} 
            color={post.liked ? '#0866ff' : '#65676b'} 
          />
          <Text style={[styles.actionText, post.liked && { color: '#0866ff' }]}>Thích</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Bình luận</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#65676b" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onSave}>
          <Ionicons 
            name={post.saved ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={post.saved ? '#0066CC' : '#65676b'} 
          />
        </TouchableOpacity>
      </View>

      {/* Post Time */}
      <Text style={styles.postTime}>{post.time}</Text>
    </View>
  );
};

// Reel Item Component
const ReelItem = ({ item, onPress }: { item: typeof REELS[0]; onPress: () => void }) => (
  <TouchableOpacity style={styles.reelItem} onPress={onPress}>
    <Image source={{ uri: item.thumbnail }} style={styles.reelThumbnail} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.7)']}
      style={styles.reelOverlay}
    >
      <View style={styles.reelInfo}>
        <View style={styles.reelViews}>
          <Ionicons name="play" size={12} color="#fff" />
          <Text style={styles.reelViewsText}>{item.views}</Text>
        </View>
        <Text style={styles.reelTitle} numberOfLines={2}>{item.title}</Text>
      </View>
    </LinearGradient>
    <View style={styles.reelPlayIcon}>
      <Ionicons name="play" size={24} color="#fff" />
    </View>
  </TouchableOpacity>
);

// ==================== MAIN COMPONENT ====================

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(POSTS);
  const [activeTab, setActiveTab] = useState<'feed' | 'reels'>('feed');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<typeof POSTS[0] | null>(null);
  const [commentText, setCommentText] = useState('');
  const [newContentCount, setNewContentCount] = useState(0); // Badge cho tin mới
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  // ========== INFINITE SCROLL STATE ==========
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [preloadedPosts, setPreloadedPosts] = useState<typeof POSTS>([]); // Cache bài đã preload
  const POSTS_PER_PAGE = 5; // Load 5 bài mỗi lần
  const AUTO_LOAD_THRESHOLD = 5; // Còn 5 bài thì load thêm
  const [visiblePostIndex, setVisiblePostIndex] = useState(0); // Track bài đang xem
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  
  // ========== PRE-LOAD EXTERNAL CONTENT (5-10 items mỗi loại) ==========
  // Load sẵn videos và news để hiển thị ngay khi scroll xuống
  
  // External Videos từ Pexels - Load sẵn 10 videos
  const { 
    videos: externalVideos, 
    isLoading: videosLoading,
    refetch: refetchVideos,
    loadMore: loadMoreVideos,
    hasMore: hasMoreVideos
  } = useExternalVideos({ 
    category: 'general',
    perPage: 10,  // Load sẵn 10 videos
    enabled: true // Luôn load sẵn
  });
  
  // External News từ GNews - Load sẵn 8 tin
  const { 
    articles: externalNews, 
    isLoading: newsLoading,
    refetch: refetchNews 
  } = useExternalNews({ 
    category: 'general',
    max: 8,  // Load sẵn 8 tin tức
    enabled: true // Luôn load sẵn
  });
  
  // Tính tổng số nội dung mới để hiển thị badge
  useEffect(() => {
    const totalNewContent = externalVideos.length + externalNews.length;
    if (totalNewContent > 0 && !videosLoading && !newsLoading) {
      setNewContentCount(totalNewContent);
    }
  }, [externalVideos.length, externalNews.length, videosLoading, newsLoading]);
  
  // ========== AUTO LOAD MORE (Facebook-style) ==========
  // Load thêm khi còn 5 bài cuối - Preload vào cache trước
  
  // Preload posts vào cache ngay khi mount
  useEffect(() => {
    // Preload page 2 ngay sau khi load xong
    const timer = setTimeout(() => {
      if (posts.length > 0 && preloadedPosts.length === 0 && hasMorePosts) {
        console.log('🚀 Initial preload triggered');
        // Preload next batch
        const nextPosts = POSTS.map((post, idx) => ({
          ...post,
          id: post.id + 20 + idx, // Page 2
          time: '2 ngày trước',
        }));
        setPreloadedPosts(nextPosts);
      }
    }, 2000); // Preload sau 2s khi user đã bắt đầu scroll
    
    return () => clearTimeout(timer);
  }, [posts.length]);
  
  // Preload posts vào cache (chạy ngầm) - INFINITE
  const preloadNextPosts = useCallback(async () => {
    if (preloadedPosts.length > 0) return; // Đã có cache
    
    // Generate fresh content với random data
    const randomSeed = Date.now() + 1000;
    const newPosts = POSTS.map((post, idx) => ({
      ...post,
      id: randomSeed + idx,
      time: ['Vừa xong', '10 phút trước', '1 giờ trước', '3 giờ trước'][Math.floor(Math.random() * 4)],
      images: post.images.length > 0 
        ? [`https://images.unsplash.com/photo-${1600000000000 + randomSeed + idx}?w=800`]
        : [],
      likes: Math.floor(Math.random() * 3000) + 50,
      comments: Math.floor(Math.random() * 300) + 5,
    }));
    
    setPreloadedPosts(newPosts); // Lưu vào cache
    console.log('📦 Preloaded', newPosts.length, 'posts into cache');
  }, [preloadedPosts.length]);
  
  // Load thêm posts từ cache hoặc API - INFINITE (không giới hạn)
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Nếu có cache, dùng cache ngay lập tức
    if (preloadedPosts.length > 0) {
      setPosts(prev => [...prev, ...preloadedPosts]);
      setCurrentPage(prev => prev + 1);
      setPreloadedPosts([]); // Clear cache
      setIsLoadingMore(false);
      console.log('⚡ Loaded from cache instantly');
      return;
    }
    
    // Fetch từ API - Mix user content với external để luôn có dữ liệu mới
    setTimeout(() => {
      // Tạo random content để luôn có dữ liệu mới, không lặp lại
      const randomSeed = Date.now();
      const newPosts = POSTS.map((post, idx) => ({
        ...post,
        id: randomSeed + idx, // Unique ID mỗi lần load
        time: getRandomTime(),
        // Random images mới từ Unsplash để không bị lặp
        images: post.images.length > 0 
          ? post.images.map((_, imgIdx) => 
              `https://images.unsplash.com/photo-${1600000000000 + randomSeed + imgIdx}?w=800&random=${randomSeed}`
            ).filter(() => Math.random() > 0.3) // Random bớt ảnh
          : [],
        likes: Math.floor(Math.random() * 5000) + 100,
        comments: Math.floor(Math.random() * 500) + 10,
        shares: Math.floor(Math.random() * 200) + 5,
      }));
      
      setPosts(prev => [...prev, ...newPosts]);
      setCurrentPage(prev => prev + 1);
      // Luôn có more - infinite scroll
      setHasMorePosts(true);
      
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore, preloadedPosts]);
  
  // Helper: Random time string
  const getRandomTime = () => {
    const times = ['Vừa xong', '5 phút trước', '15 phút trước', '30 phút trước', 
                   '1 giờ trước', '2 giờ trước', '3 giờ trước', '5 giờ trước',
                   '1 ngày trước', '2 ngày trước', '3 ngày trước'];
    return times[Math.floor(Math.random() * times.length)];
  }
  
  // Check và auto load khi còn 5 bài - INFINITE (luôn load thêm)
  const checkAndAutoLoad = useCallback((currentIndex: number) => {
    const remainingPosts = posts.length - currentIndex - 1;
    
    // Còn 7 bài thì preload ngầm (load trước)
    if (remainingPosts <= AUTO_LOAD_THRESHOLD + 2 && preloadedPosts.length === 0) {
      preloadNextPosts();
    }
    
    // Còn 5 bài thì load thêm ngay
    if (remainingPosts <= AUTO_LOAD_THRESHOLD && !isLoadingMore) {
      console.log('🔄 Auto loading - remaining:', remainingPosts);
      loadMorePosts();
    }
  }, [posts.length, isLoadingMore, preloadedPosts.length, loadMorePosts, preloadNextPosts]);
  
  // Track scroll position để biết đang xem bài nào
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Estimate current post index based on scroll position
    // Assuming each post is ~400px height on average
    const estimatedPostHeight = 400;
    const scrolledPosts = Math.floor(contentOffset.y / estimatedPostHeight);
    
    if (scrolledPosts !== visiblePostIndex) {
      setVisiblePostIndex(scrolledPosts);
      checkAndAutoLoad(scrolledPosts);
    }
  }, [visiblePostIndex, checkAndAutoLoad]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLastRefreshTime(new Date());
    setCurrentPage(1);
    setHasMorePosts(true);
    setPosts(POSTS); // Reset về initial posts
    setPreloadedPosts([]); // Clear cache
    setVisiblePostIndex(0);
    
    // Refresh cả external content
    Promise.all([refetchVideos(), refetchNews()]).finally(() => {
      setTimeout(() => setRefreshing(false), 1500);
    });
  }, [refetchVideos, refetchNews]);
  
  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } 
        : p
    ));
  };
  
  const handleComment = (post: typeof POSTS[0]) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };
  
  const handleShare = (postId: number) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };
  
  const handleSave = (postId: number) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, saved: !p.saved } : p
    ));
  };
  
  const handleStoryPress = (story: typeof STORIES[0]) => {
    if (story.isUser) {
      // Open create post screen
      router.push('/social/create-post');
    } else {
      // View story - navigate to story viewer
      router.push(`/social/story-viewer?userId=user_${story.id}&index=${story.id}` as any);
    }
  };
  
  const handleUserPress = (userId: number, userName: string) => {
    // Navigate to chat with this user
    router.push(`/messages/chat/conv_social_${userId}` as `/messages/chat/${string}`);
  };
  
  const handleReelPress = (reelId: number) => {
    // Navigate to reels viewer
    router.push(`/social/reels-viewer?id=reel_${reelId}` as any);
  };

  const handleCreatePost = () => {
    // Navigate to create post screen
    router.push('/social/create-post');
  };

  const handleVideoDiscovery = () => {
    // Navigate to video discovery screen
    router.push('/social/video-discovery');
  };

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header với badge số tin mới */}
      <Animated.View style={[styles.header, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Cộng đồng</Text>
          {/* Badge hiển thị tổng số nội dung mới */}
          {newContentCount > 0 && (
            <View style={styles.newContentBadge}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.newContentBadgeText}>+{newContentCount} mới</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCreatePost}>
            <Ionicons name="add-circle-outline" size={26} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleVideoDiscovery}>
            <Ionicons name="search-outline" size={24} color="#333" />
            {/* Badge cho videos mới */}
            {externalVideos.length > 0 && (
              <View style={styles.smallBadge}>
                <Text style={styles.smallBadgeText}>{externalVideos.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/messages/unified')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
            <View style={styles.messageBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'feed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons 
            name="newspaper-outline" 
            size={20} 
            color={activeTab === 'feed' ? '#0066CC' : '#65676b'} 
          />
          <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
            Bảng tin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'reels' && styles.tabButtonActive]}
          onPress={() => setActiveTab('reels')}
        >
          <Ionicons 
            name="film-outline" 
            size={20} 
            color={activeTab === 'reels' ? '#0066CC' : '#65676b'} 
          />
          <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
            Reels
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'feed' ? (
        <Animated.ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            // Animated scroll for header
            Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )(event);
            // Auto load more check
            handleScroll(event);
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0066CC']} />
          }
        >
          {/* Stories Section */}
          <View style={styles.storiesSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesContainer}
            >
              {STORIES.map(story => (
                <StoryItem 
                  key={story.id} 
                  item={story} 
                  onPress={() => handleStoryPress(story)} 
                />
              ))}
            </ScrollView>
          </View>

          {/* Create Post Card */}
          <View style={styles.createPostCard}>
            <Avatar name={user?.name || 'U'} size="md" />
            <TouchableOpacity 
              style={styles.createPostInput}
              onPress={handleCreatePost}
            >
              <Text style={styles.createPostPlaceholder}>Bạn đang nghĩ gì?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createPostButton} onPress={handleCreatePost}>
              <Ionicons name="images-outline" size={22} color="#45bd62" />
            </TouchableOpacity>
          </View>

          {/* Video Discovery Banner */}
          <TouchableOpacity style={styles.discoveryBanner} onPress={handleVideoDiscovery}>
            <LinearGradient
              colors={['#0066CC', '#004499']}
              style={styles.discoveryBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.discoveryBannerContent}>
                <Ionicons name="play-circle" size={32} color="#fff" />
                <View style={styles.discoveryBannerText}>
                  <Text style={styles.discoveryBannerTitle}>Video xây dựng miễn phí</Text>
                  <Text style={styles.discoveryBannerSubtitle}>Hàng ngàn video từ chuyên gia</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Reels Preview - User's reels first */}
          <View style={styles.reelsPreviewSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="film" size={20} color="#0066CC" />
                <Text style={styles.sectionTitle}>Reels</Text>
                {REELS.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{REELS.length}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={handleVideoDiscovery}>
                <Text style={styles.seeAllText}>Khám phá</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reelsContainer}
            >
              {REELS.map(reel => (
                <ReelItem 
                  key={reel.id} 
                  item={reel} 
                  onPress={() => handleReelPress(reel.id)} 
                />
              ))}
            </ScrollView>
          </View>

          {/* ========== USER CONTENT FIRST (Ưu tiên bài đăng khách hàng) ========== */}
          
          {/* Posts Feed - Bài đăng từ khách hàng hiển thị trước */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="newspaper" size={20} color="#0066CC" />
              <Text style={styles.sectionTitle}>Bài đăng mới</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{posts.length}</Text>
              </View>
              {/* Badge cho cache sẵn sàng */}
              {preloadedPosts.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: '#45bd62', marginLeft: 4 }]}>
                  <Ionicons name="flash" size={10} color="#fff" />
                  <Text style={[styles.countBadgeText, { marginLeft: 2 }]}>+{preloadedPosts.length}</Text>
                </View>
              )}
            </View>
            {/* Auto-load indicator */}
            <Text style={styles.autoLoadHint}>Tự động tải thêm</Text>
          </View>
          
          {posts.map((post, index) => (
            <PostCard
              key={`${post.id}-${index}`}
              post={post}
              onLike={() => handleLike(post.id)}
              onComment={() => handleComment(post)}
              onShare={() => handleShare(post.id)}
              onSave={() => handleSave(post.id)}
              onUserPress={() => handleUserPress(post.user.id, post.user.name)}
            />
          ))}
          
          {/* ========== LOADING MORE INDICATOR (Auto load khi scroll) ========== */}
          {isLoadingMore && (
            <View style={styles.loadingMoreSection}>
              <View style={styles.loadingMoreIndicator}>
                <Ionicons name="reload" size={20} color="#0066CC" />
                <Text style={styles.loadingMoreText}>Đang tải thêm bài viết...</Text>
              </View>
            </View>
          )}
          
          {/* Infinite scroll - luôn có thêm content */}
          {!isLoadingMore && posts.length > 0 && (
            <View style={styles.infiniteScrollHint}>
              <Ionicons name="infinite" size={16} color="#45bd62" />
              <Text style={styles.infiniteScrollText}>Cuộn để xem thêm • {posts.length} bài đăng</Text>
            </View>
          )}

          {/* ========== EXTERNAL CONTENT (Nội dung giải trí bổ sung) ========== */}
          
          {/* Divider giữa user content và external content */}
          <View style={styles.contentDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>📺 Giải trí & Tham khảo</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {/* External Videos Section - Video giải trí từ Pexels */}
          {externalVideos.length > 0 && (
            <ExternalVideoSection 
              videos={externalVideos}
              title="🎬 Video xây dựng giải trí"
              subtitle={`${externalVideos.length} video từ Pexels`}
              isLoading={videosLoading}
              onSeeAll={handleVideoDiscovery}
            />
          )}
          
          {/* Load more videos button */}
          {hasMoreVideos && externalVideos.length > 0 && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={loadMoreVideos}
              disabled={videosLoading}
            >
              <Ionicons name="add-circle-outline" size={20} color="#0066CC" />
              <Text style={styles.loadMoreButtonText}>Xem thêm video</Text>
            </TouchableOpacity>
          )}
          
          {/* External News Section - Tin tức từ GNews */}
          {externalNews.length > 0 && (
            <ExternalNewsSection 
              articles={externalNews}
              title="📰 Tin tức xây dựng"
              subtitle={`${externalNews.length} tin từ GNews`}
              isLoading={newsLoading}
              onSeeAll={() => router.push('/news')}
            />
          )}
          
          {/* Loading indicator khi đang fetch external content */}
          {(videosLoading || newsLoading) && (
            <View style={styles.loadingSection}>
              <Text style={styles.loadingText}>Đang tải nội dung mới...</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      ) : (
        // Reels Tab
        <FlatList
          data={REELS}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reelsGrid}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.reelGridItem} 
              onPress={() => handleReelPress(item.id)}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.reelGridThumbnail} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.reelGridOverlay}
              >
                <View style={styles.reelGridInfo}>
                  <View style={styles.reelViews}>
                    <Ionicons name="play" size={14} color="#fff" />
                    <Text style={styles.reelViewsText}>{item.views}</Text>
                  </View>
                </View>
              </LinearGradient>
              <View style={styles.reelGridPlayIcon}>
                <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0066CC']} />
          }
        />
      )}

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.commentModalOverlay}>
          <View style={styles.commentModalContent}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Bình luận</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.commentsList}>
              {/* Sample comments */}
              {[
                { id: 1, user: 'Nguyễn Văn A', content: 'Thiết kế đẹp quá! 👍', time: '1 giờ' },
                { id: 2, user: 'Trần Thị B', content: 'Cho em hỏi giá bao nhiêu ạ?', time: '2 giờ' },
                { id: 3, user: 'Lê Văn C', content: 'Rất chuyên nghiệp!', time: '3 giờ' },
              ].map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <Avatar name={comment.user} size="md" />
                  <View style={styles.commentContent}>
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                    <View style={styles.commentActions}>
                      <Text style={styles.commentTime}>{comment.time}</Text>
                      <TouchableOpacity>
                        <Text style={styles.commentAction}>Thích</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={styles.commentAction}>Trả lời</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.commentInputContainer}>
              <Avatar name={user?.name || 'U'} size="sm" />
              <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                disabled={!commentText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? '#0866ff' : '#ccc'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  
  // Header
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0066CC',
  },
  // Badge hiển thị số nội dung mới
  newContentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newContentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  smallBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  smallBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066CC',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#0066CC',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#65676b',
  },
  tabTextActive: {
    color: '#0066CC',
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Stories
  storiesSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 8,
  },
  storiesContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyAvatarContainer: {
    marginBottom: 4,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
  },
  storyAvatarWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
  },
  addStoryButton: {
    position: 'relative',
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0866ff',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyName: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    width: 72,
  },
  
  // Create Post
  createPostCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  createPostInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  createPostPlaceholder: {
    color: '#65676b',
    fontSize: 14,
  },
  createPostButton: {
    padding: 4,
  },
  
  // Discovery Banner
  discoveryBanner: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  discoveryBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  discoveryBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discoveryBannerText: {},
  discoveryBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  discoveryBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  
  // Reels Preview
  reelsPreviewSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0866ff',
  },
  autoLoadHint: {
    fontSize: 11,
    color: '#45bd62',
    fontWeight: '500',
  },
  reelsContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  reelItem: {
    width: 110,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  reelThumbnail: {
    width: '100%',
    height: '100%',
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: 8,
  },
  reelInfo: {
    gap: 4,
  },
  reelViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reelViewsText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  reelTitle: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  reelPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    opacity: 0.8,
  },
  
  // Post Card
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  postUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  postUserRole: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  postMoreButton: {
    padding: 8,
  },
  postContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  seeMoreText: {
    color: '#65676b',
    fontSize: 14,
    marginTop: 4,
  },
  postImagesContainer: {
    position: 'relative',
  },
  postSingleImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: '#f0f0f0',
  },
  postMultiImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: '#f0f0f0',
  },
  imagePagination: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  postLikesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  statsText: {
    fontSize: 13,
    color: '#65676b',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#65676b',
  },
  postTime: {
    fontSize: 11,
    color: '#999',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  
  // Reels Grid
  reelsGrid: {
    padding: 2,
  },
  reelGridItem: {
    flex: 1,
    margin: 2,
    aspectRatio: 9 / 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  reelGridThumbnail: {
    width: '100%',
    height: '100%',
  },
  reelGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 8,
  },
  reelGridInfo: {},
  reelGridPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  
  // Comment Modal
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  commentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  commentModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  commentsList: {
    padding: 12,
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f0f2f5',
    borderRadius: 16,
    padding: 10,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 8,
    gap: 16,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676b',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    padding: 4,
  },
  
  // Content Divider - Phân cách user content và external content
  contentDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#65676b',
    paddingHorizontal: 12,
  },
  
  // Loading Section
  loadingSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#65676b',
  },
  
  // Loading More (Infinite Scroll)
  loadingMoreSection: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  
  // Infinite Scroll Hint
  infiniteScrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  infiniteScrollText: {
    fontSize: 12,
    color: '#45bd62',
    fontWeight: '500',
  },
  
  // Load More Button
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4fd',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
});
