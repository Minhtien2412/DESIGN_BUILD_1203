/**
 * Reels Viewer Screen - TikTok/Instagram Style Full-screen Video Player
 * Features: Vertical swipe, like, comment, share, follow, sound toggle
 * Priority: Server Cache (~2GB) > User uploads > Pexels API > Mock fallback
 * @author AI Assistant  
 * @date 03/01/2026
 * @updated 16/01/2026 - Server Video Cache System with session tracking
 * @updated 16/01/2026 - Real interaction counters with database persistence
 */

import Avatar from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import reelsService, {
  type Reel,
  getServerFeed,
  getServerStats,
  recordServerView,
  resetSession,
} from '@/services/reelsService';
import * as videoInteractionsApi from '@/services/video-interactions';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
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

// ==================== REAL VIDEO SAMPLES ====================
// Video nhẹ từ Pexels - format tối ưu cho mobile
// Mỗi video có slug và searchKeywords cố định để tìm kiếm
// ID = slug để đảm bảo tính đồng nhất khi navigate
const SAMPLE_VIDEOS: Reel[] = [
  {
    id: 'kien-truc-hien-dai-2026',
    slug: 'kien-truc-hien-dai-2026',
    title: 'Kiến trúc hiện đại 2026',
    user: {
      id: 'sample_user_1',
      name: 'Kiến Trúc Pro',
      avatar: 'https://i.pravatar.cc/150?u=architect1',
      verified: true,
      followers: '125K',
      isFollowing: false,
    },
    // Video nhẹ từ Pexels CDN
    videoUrl: 'https://videos.pexels.com/video-files/3571264/3571264-sd_506_960_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/3571264/free-video-3571264.jpg?auto=compress&w=400',
    description: '🏠 Kiến trúc hiện đại 2026\n\n#kientruc #modern #design',
    music: '♪ Modern Architecture',
    likes: 12543,
    comments: 234,
    shares: 567,
    saves: 890,
    views: '125K',
    duration: '0:15',
    liked: false,
    saved: false,
    category: 'kientruc',
    tags: ['kiến trúc', 'hiện đại'],
    searchKeywords: ['kiến trúc', 'architecture', 'hiện đại', 'modern', '2026', 'thiết kế', 'design', 'nhà đẹp'],
    source: 'mock',
  },
  {
    id: 'noi-that-phong-khach-sang-trong',
    slug: 'noi-that-phong-khach-sang-trong',
    title: 'Nội thất phòng khách sang trọng',
    user: {
      id: 'sample_user_2',
      name: 'Nội Thất Studio',
      avatar: 'https://i.pravatar.cc/150?u=interior1',
      verified: true,
      followers: '89.5K',
      isFollowing: false,
    },
    videoUrl: 'https://videos.pexels.com/video-files/6394054/6394054-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/6394054/free-video-6394054.jpg?auto=compress&w=400',
    description: '✨ Nội thất phòng khách sang trọng\n\n#noithat #luxury #interior',
    music: '♪ Interior Design',
    likes: 23456,
    comments: 678,
    shares: 890,
    saves: 1234,
    views: '234K',
    duration: '0:12',
    liked: false,
    saved: true,
    category: 'noithat',
    tags: ['nội thất', 'phòng khách'],
    searchKeywords: ['nội thất', 'interior', 'phòng khách', 'living room', 'sang trọng', 'luxury', 'decor'],
    source: 'mock',
  },
  {
    id: 'ky-thuat-xay-tuong-gach',
    slug: 'ky-thuat-xay-tuong-gach',
    title: 'Kỹ thuật xây tường gạch',
    user: {
      id: 'sample_user_3',
      name: 'Thợ Xây Channel',
      avatar: 'https://i.pravatar.cc/150?u=worker1',
      verified: false,
      followers: '45.2K',
      isFollowing: true,
    },
    videoUrl: 'https://videos.pexels.com/video-files/7578549/7578549-sd_360_640_30fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/7578549/free-video-7578549.jpg?auto=compress&w=400',
    description: '💪 Kỹ thuật xây tường gạch\n\n#xaydung #thicong #kythuat',
    music: '♪ Construction Beat',
    likes: 8765,
    comments: 456,
    shares: 234,
    saves: 567,
    views: '87K',
    duration: '0:18',
    liked: true,
    saved: false,
    category: 'thicong',
    tags: ['thi công', 'xây dựng'],
    searchKeywords: ['xây dựng', 'construction', 'tường gạch', 'brick wall', 'kỹ thuật', 'thợ xây', 'thi công'],
    source: 'mock',
  },
  {
    id: 'nha-pho-hien-dai-3-tang',
    slug: 'nha-pho-hien-dai-3-tang',
    title: 'Nhà phố hiện đại 3 tầng',
    user: {
      id: 'sample_user_4',
      name: 'HomeDesign VN',
      avatar: 'https://i.pravatar.cc/150?u=design1',
      verified: true,
      followers: '156K',
      isFollowing: false,
    },
    videoUrl: 'https://videos.pexels.com/video-files/4625518/4625518-sd_360_640_30fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/4625518/free-video-4625518.jpg?auto=compress&w=400',
    description: '🏡 Nhà phố hiện đại 3 tầng\n\n#nhapho #thietke #modern',
    music: '♪ Home Sweet Home',
    likes: 15678,
    comments: 345,
    shares: 456,
    saves: 789,
    views: '156K',
    duration: '0:20',
    liked: false,
    saved: false,
    category: 'kientruc',
    tags: ['nhà phố', 'hiện đại'],
    searchKeywords: ['nhà phố', 'townhouse', '3 tầng', 'hiện đại', 'modern', 'thiết kế nhà', 'home design'],
    source: 'mock',
  },
  {
    id: 'thiet-ke-san-vuon-mini',
    slug: 'thiet-ke-san-vuon-mini',
    title: 'Thiết kế sân vườn mini đẹp',
    user: {
      id: 'sample_user_5',
      name: 'Garden Master',
      avatar: 'https://i.pravatar.cc/150?u=garden1',
      verified: true,
      followers: '78.9K',
      isFollowing: true,
    },
    videoUrl: 'https://videos.pexels.com/video-files/5147956/5147956-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/5147956/free-video-5147956.jpg?auto=compress&w=400',
    description: '🌿 Thiết kế sân vườn mini đẹp\n\n#sanvuon #garden #landscape',
    music: '♪ Nature Sounds',
    likes: 34567,
    comments: 890,
    shares: 1234,
    saves: 2345,
    views: '345K',
    duration: '0:16',
    liked: false,
    saved: false,
    category: 'sanvuon',
    tags: ['sân vườn', 'landscape'],
    searchKeywords: ['sân vườn', 'garden', 'mini', 'landscape', 'cây cảnh', 'tiểu cảnh', 'thiết kế vườn'],
    source: 'mock',
  },
  {
    id: 'decor-phong-ngu-aesthetic',
    slug: 'decor-phong-ngu-aesthetic',
    title: 'Decor phòng ngủ aesthetic',
    user: {
      id: 'sample_user_6',
      name: 'Decor Vietnam',
      avatar: 'https://i.pravatar.cc/150?u=decor1',
      verified: true,
      followers: '200K',
      isFollowing: false,
    },
    videoUrl: 'https://videos.pexels.com/video-files/6394068/6394068-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/6394068/free-video-6394068.jpg?auto=compress&w=400',
    description: '🛋️ Decor phòng ngủ aesthetic\n\n#decor #bedroom #aesthetic',
    music: '♪ Chill Vibes',
    likes: 45678,
    comments: 567,
    shares: 789,
    saves: 1567,
    views: '456K',
    duration: '0:14',
    liked: false,
    saved: false,
    category: 'noithat',
    tags: ['decor', 'phòng ngủ'],
    searchKeywords: ['decor', 'phòng ngủ', 'bedroom', 'aesthetic', 'trang trí', 'decoration', 'minimalist'],
    source: 'mock',
  },
  {
    id: 'biet-thu-sang-trong-2026',
    slug: 'biet-thu-sang-trong-2026',
    title: 'Biệt thự sang trọng nhất 2026',
    user: {
      id: 'sample_user_7',
      name: 'Villa Design',
      avatar: 'https://i.pravatar.cc/150?u=villa1',
      verified: true,
      followers: '300K',
      isFollowing: false,
    },
    videoUrl: 'https://videos.pexels.com/video-files/5529607/5529607-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/5529607/free-video-5529607.jpg?auto=compress&w=400',
    description: '🏰 Biệt thự sang trọng nhất 2026\n\n#villa #luxury #realestate',
    music: '♪ Luxury Life',
    likes: 78901,
    comments: 1234,
    shares: 2345,
    saves: 3456,
    views: '789K',
    duration: '0:22',
    liked: false,
    saved: false,
    category: 'kientruc',
    tags: ['biệt thự', 'sang trọng'],
    searchKeywords: ['biệt thự', 'villa', 'sang trọng', 'luxury', 'real estate', 'bất động sản', 'nhà đẹp'],
    source: 'mock',
  },
  {
    id: 'diy-sua-nha-don-gian',
    slug: 'diy-sua-nha-don-gian',
    title: 'DIY sửa nhà đơn giản',
    user: {
      id: 'sample_user_8',
      name: 'DIY Home Tips',
      avatar: 'https://i.pravatar.cc/150?u=diy1',
      verified: false,
      followers: '150K',
      isFollowing: true,
    },
    videoUrl: 'https://videos.pexels.com/video-files/6394032/6394032-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/6394032/free-video-6394032.jpg?auto=compress&w=400',
    description: '🔧 DIY sửa nhà đơn giản\n\n#diy #tips #home',
    music: '♪ DIY Music',
    likes: 12345,
    comments: 234,
    shares: 345,
    saves: 456,
    views: '123K',
    duration: '0:19',
    liked: false,
    saved: false,
    category: 'thicong',
    tags: ['DIY', 'tips'],
    searchKeywords: ['DIY', 'sửa nhà', 'home repair', 'tips', 'mẹo vặt', 'tự làm', 'handyman'],
    source: 'mock',
  },
  {
    id: 'thiet-ke-bep-hien-dai',
    slug: 'thiet-ke-bep-hien-dai',
    title: 'Thiết kế bếp hiện đại',
    user: {
      id: 'sample_user_9',
      name: 'Kitchen Design Pro',
      avatar: 'https://i.pravatar.cc/150?u=kitchen1',
      verified: true,
      followers: '180K',
      isFollowing: false,
    },
    videoUrl: 'https://videos.pexels.com/video-files/4109301/4109301-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/4109301/free-video-4109301.jpg?auto=compress&w=400',
    description: '🍳 Thiết kế bếp hiện đại\n\n#kitchen #modern #design',
    music: '♪ Kitchen Vibes',
    likes: 56789,
    comments: 678,
    shares: 890,
    saves: 1234,
    views: '567K',
    duration: '0:17',
    liked: false,
    saved: false,
    category: 'noithat',
    tags: ['bếp', 'modern'],
    searchKeywords: ['bếp', 'kitchen', 'hiện đại', 'modern', 'thiết kế bếp', 'nội thất bếp', 'tủ bếp'],
    source: 'mock',
  },
  {
    id: 'ho-boi-trong-nha-dep',
    slug: 'ho-boi-trong-nha-dep',
    title: 'Hồ bơi trong nhà đẹp',
    user: {
      id: 'sample_user_10',
      name: 'Pool & Spa Design',
      avatar: 'https://i.pravatar.cc/150?u=pool1',
      verified: true,
      followers: '95K',
      isFollowing: false,
    },
    videoUrl: 'https://videos.pexels.com/video-files/5529579/5529579-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/5529579/free-video-5529579.jpg?auto=compress&w=400',
    description: '🏊 Hồ bơi trong nhà đẹp\n\n#pool #spa #luxury',
    music: '♪ Water Sounds',
    likes: 34567,
    comments: 456,
    shares: 567,
    saves: 890,
    views: '345K',
    duration: '0:21',
    liked: false,
    saved: false,
    category: 'sanvuon',
    tags: ['hồ bơi', 'spa'],
    searchKeywords: ['hồ bơi', 'pool', 'spa', 'swimming pool', 'trong nhà', 'indoor', 'luxury'],
    source: 'mock',
  },
  {
    id: 'nha-thong-minh-4-0',
    slug: 'nha-thong-minh-4-0',
    title: 'Nhà thông minh 4.0',
    user: {
      id: 'sample_user_11',
      name: 'Smart Home VN',
      avatar: 'https://i.pravatar.cc/150?u=smarthome1',
      verified: true,
      followers: '250K',
      isFollowing: false,
    },
    videoUrl: 'https://videos.pexels.com/video-files/6394084/6394084-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/6394084/free-video-6394084.jpg?auto=compress&w=400',
    description: '🏠 Nhà thông minh 4.0\n\n#smarthome #tech #iot',
    music: '♪ Tech Beat',
    likes: 67890,
    comments: 890,
    shares: 1234,
    saves: 2345,
    views: '678K',
    duration: '0:18',
    liked: false,
    saved: false,
    category: 'diennuoc',
    tags: ['smart home', 'công nghệ'],
    searchKeywords: ['smart home', 'nhà thông minh', 'IoT', 'công nghệ', 'technology', 'automation', '4.0'],
    source: 'mock',
  },
  {
    id: 'thiet-ke-phong-tam-dep',
    slug: 'thiet-ke-phong-tam-dep',
    title: 'Thiết kế phòng tắm đẹp',
    user: {
      id: 'sample_user_12',
      name: 'Bathroom Ideas',
      avatar: 'https://i.pravatar.cc/150?u=bathroom1',
      verified: false,
      followers: '120K',
      isFollowing: true,
    },
    videoUrl: 'https://videos.pexels.com/video-files/4109265/4109265-sd_360_640_25fps.mp4',
    thumbnail: 'https://images.pexels.com/videos/4109265/free-video-4109265.jpg?auto=compress&w=400',
    description: '🚿 Thiết kế phòng tắm đẹp\n\n#bathroom #design #modern',
    music: '♪ Relaxing',
    likes: 23456,
    comments: 345,
    shares: 456,
    saves: 678,
    views: '234K',
    duration: '0:15',
    liked: false,
    saved: false,
    category: 'diennuoc',
    tags: ['phòng tắm', 'design'],
    searchKeywords: ['phòng tắm', 'bathroom', 'thiết kế', 'design', 'modern', 'hiện đại', 'toilet'],
    source: 'mock',
  },
];

// ==================== VIDEO SEARCH HELPER ====================
// Tìm video theo ID, slug, title hoặc keywords
export function findVideoByIdOrSlug(idOrSlug: string): Reel | undefined {
  const normalizedSearch = idOrSlug.toLowerCase().trim();
  return SAMPLE_VIDEOS.find(v => 
    v.id === idOrSlug || 
    v.slug === idOrSlug ||
    v.id.toLowerCase() === normalizedSearch ||
    v.slug?.toLowerCase() === normalizedSearch
  );
}

// Tìm kiếm video theo từ khóa
export function searchVideos(query: string): Reel[] {
  if (!query || query.trim().length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  
  return SAMPLE_VIDEOS.filter(video => {
    // Tìm trong title
    if (video.title?.toLowerCase().includes(normalizedQuery)) return true;
    
    // Tìm trong description  
    if (video.description.toLowerCase().includes(normalizedQuery)) return true;
    
    // Tìm trong tags
    if (video.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) return true;
    
    // Tìm trong searchKeywords
    if (video.searchKeywords?.some(kw => kw.toLowerCase().includes(normalizedQuery))) return true;
    
    // Tìm từng từ
    return words.some(word => 
      video.title?.toLowerCase().includes(word) ||
      video.description.toLowerCase().includes(word) ||
      video.tags.some(tag => tag.toLowerCase().includes(word)) ||
      video.searchKeywords?.some(kw => kw.toLowerCase().includes(word))
    );
  });
}

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
  onDownload,
  isMuted,
  onToggleMute,
}: {
  reel: Reel;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onFollow: () => void;
  onUserPress: () => void;
  onDownload: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);
  
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
      // Double tap = like
      handleDoubleTap();
    } else {
      // Single tap = pause/play video
      setIsPaused(!isPaused);
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

  // Long press state for TikTok-style menu
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Check if this is a real video URL (not just an image)
  // Mở rộng để nhận diện nhiều định dạng video hơn
  const isRealVideo = reel.videoUrl && (
    reel.videoUrl.includes('.mp4') || 
    reel.videoUrl.includes('.mov') || 
    reel.videoUrl.includes('.webm') ||
    reel.videoUrl.includes('.m3u8') || // HLS
    reel.videoUrl.includes('.avi') ||
    reel.videoUrl.includes('pexels.com') ||
    reel.videoUrl.includes('/reels/stream/') || // Server cache streaming
    reel.videoUrl.includes('baotienweb.cloud') || // Our server
    reel.source === 'server' || // Always treat server videos as real
    reel.videoUrl.includes('googleapis.com') || // Google storage
    reel.videoUrl.includes('cloudinary.com') ||
    reel.videoUrl.includes('video') ||
    reel.videoUrl.includes('/v1/') // Common API video path
  );

  // State for video error
  const [hasVideoError, setHasVideoError] = useState(false);

  return (
    <Pressable style={styles.reelContainer} onPress={handleTap}>
      {/* Thumbnail background - shows while video loads */}
      <Image 
        source={{ uri: reel.thumbnail }} 
        style={[styles.reelBackground, { zIndex: 0 }]}
        resizeMode="cover"
        blurRadius={isVideoLoading && isRealVideo ? 3 : 0}
      />

      {/* Video Player - Auto-play when active, optimized for performance */}
      {isRealVideo && !hasVideoError && (
        <Video
          ref={videoRef}
          source={{ uri: reel.videoUrl }}
          style={styles.reelVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive && !isPaused}
          isLooping
          isMuted={isMuted}
          // Performance optimizations
          progressUpdateIntervalMillis={1000}
          onLoadStart={() => setIsVideoLoading(true)}
          onLoad={() => {
            setIsVideoLoading(false);
            setHasVideoError(false);
          }}
          onError={(e) => {
            console.log('Video error:', reel.videoUrl, e);
            setIsVideoLoading(false);
            setHasVideoError(true);
          }}
          posterSource={{ uri: reel.thumbnail }}
          usePoster={isVideoLoading}
        />
      )}

      {/* Video Error State */}
      {hasVideoError && (
        <View style={styles.videoErrorOverlay}>
          <Ionicons name="alert-circle-outline" size={48} color="#fff" />
          <Text style={styles.videoErrorText}>Không thể phát video</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setHasVideoError(false);
              setIsVideoLoading(true);
            }}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading indicator */}
      {isVideoLoading && isRealVideo && isActive && (
        <View style={styles.videoLoadingIndicator}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Pause indicator */}
      {isPaused && isActive && (
        <View style={styles.pauseIndicator}>
          <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
        </View>
      )}
      
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
      
      {/* Header - Back & Camera */}
      <View style={[styles.reelHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.reelHeaderTitle}>Video</Text>
        
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
        
        {/* Download */}
        <TouchableOpacity style={styles.actionItem} onPress={onDownload}>
          <Ionicons name="download-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>Tải</Text>
        </TouchableOpacity>
        
        {/* More */}
        <TouchableOpacity style={styles.actionItem} onPress={() => setShowMoreMenu(true)}>
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
  
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Real comments state
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataSource, setDataSource] = useState<'user' | 'pexels' | 'mixed' | 'mock' | 'server'>('mock');
  
  // Server cache stats
  const [serverStats, setServerStats] = useState<{
    watched: number;
    remaining: number;
    videoCount?: number;
    usedPercent?: number;
  } | null>(null);
  
  // Watch time tracking
  const watchStartTime = useRef<number>(0);
  const currentReelId = useRef<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  
  // ==================== LOAD REELS (SERVER CACHE PRIORITY) ====================
  const loadReels = useCallback(async (page = 1, category = 'all', refresh = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      console.log(`[Reels] Loading page ${page}, category: ${category}, refresh: ${refresh}`);
      
      // PRIORITY 1: Server Video Cache (~2GB stored videos)
      // Random, không trùng lặp cho mỗi session
      const serverResponse = await getServerFeed(15);
      
      if (serverResponse.reels.length > 0) {
        console.log(`[Reels] 🚀 Loaded ${serverResponse.reels.length} videos from Server Cache`);
        
        if (refresh || page === 1) {
          setReels(serverResponse.reels);
        } else {
          // Load more: append unique videos
          setReels(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const newReels = serverResponse.reels.filter(r => !existingIds.has(r.id));
            return [...prev, ...newReels];
          });
        }
        
        setDataSource('server');
        setHasMore(serverResponse.hasMore);
        
        // Update stats
        if (serverResponse.stats) {
          setServerStats(serverResponse.stats);
          console.log(`[Reels] Stats: watched=${serverResponse.stats.watched}, remaining=${serverResponse.stats.remaining}`);
        }
        
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        return; // Thành công từ server cache
      }
      
      // PRIORITY 2: Fallback to original reelsService (user + pexels + mock)
      console.log('[Reels] Server cache empty, falling back to reelsService');
      const response = await reelsService.getReels(category, page, 10);
      
      if (response.reels.length > 0) {
        if (refresh || page === 1) {
          setReels(response.reels);
        } else {
          setReels(prev => [...prev, ...response.reels]);
        }
        setDataSource(response.source);
        setHasMore(response.hasMore);
        setCurrentPage(response.nextPage || page + 1);
        
        console.log(`[Reels] Loaded ${response.reels.length} reels from ${response.source}`);
      } else {
        // Fallback: Dùng sample videos thật (có URL .mp4)
        console.log('[Reels] No reels from API, using sample videos');
        setReels(SAMPLE_VIDEOS);
        setDataSource('mock');
        setHasMore(false);
      }
    } catch (error) {
      console.error('[Reels] Error loading reels:', error);
      // Sử dụng sample videos khi lỗi
      if (page === 1) {
        setReels(SAMPLE_VIDEOS);
        setDataSource('mock');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, []);
  
  // Load server stats on mount
  useEffect(() => {
    const loadStats = async () => {
      const stats = await getServerStats();
      if (stats) {
        console.log(`[Reels] 📊 Server: ${stats.videoCount} videos, ${stats.usedPercent}% used`);
      }
    };
    loadStats();
  }, []);
  
  // Initial load
  useEffect(() => {
    loadReels(1, selectedCategory, true);
  }, [selectedCategory]);
  
  // Handle category from params
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);
  
  // Find initial reel by id/slug và scroll đến video đó
  useEffect(() => {
    const targetId = params.id;
    if (targetId && reels.length > 0) {
      // Tìm video theo ID hoặc slug
      const index = reels.findIndex(r => 
        r.id === targetId || 
        r.slug === targetId ||
        r.id.toLowerCase() === targetId.toLowerCase() ||
        r.slug?.toLowerCase() === targetId.toLowerCase()
      );
      
      if (index >= 0) {
        console.log(`[Reels] Found video at index ${index}: ${reels[index].title || reels[index].id}`);
        setCurrentIndex(index);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 100);
      } else {
        // Nếu không tìm thấy trong reels hiện tại, tìm trong SAMPLE_VIDEOS
        const sampleVideo = findVideoByIdOrSlug(targetId);
        if (sampleVideo) {
          console.log(`[Reels] Video found in samples, adding to reels: ${sampleVideo.title}`);
          // Thêm video vào đầu danh sách và scroll đến nó
          setReels(prev => {
            // Kiểm tra xem video đã có chưa
            if (prev.some(r => r.id === sampleVideo.id)) return prev;
            return [sampleVideo, ...prev];
          });
          setCurrentIndex(0);
        }
      }
    }
  }, [params.id, reels]);
  
  // ==================== EVENT HANDLERS ====================
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setCurrentPage(1);
    loadReels(1, selectedCategory, true);
  }, [selectedCategory, loadReels]);
  
  // Reset session để xem lại tất cả video từ đầu
  const handleResetSession = useCallback(async () => {
    try {
      console.log('[Reels] 🔄 Resetting session...');
      await resetSession();
      setReels([]);
      setServerStats(null);
      setCurrentIndex(0);
      setIsRefreshing(true);
      await loadReels(1, 'all', true);
      console.log('[Reels] ✅ Session reset complete');
    } catch (error) {
      console.error('[Reels] Failed to reset session:', error);
    }
  }, [loadReels]);
  
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadReels(currentPage, selectedCategory, false);
    }
  }, [isLoadingMore, hasMore, currentPage, selectedCategory, loadReels]);
  
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setReels([]);
    // loadReels will be triggered by useEffect
  }, []);
  
  // Store reels in a ref for stable callback access
  const reelsRef = useRef(reels);
  useEffect(() => {
    reelsRef.current = reels;
  }, [reels]);
  
  // Use useRef to avoid "Changing onViewableItemsChanged on the fly" error
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      // Record watch duration for previous video
      if (currentReelId.current && watchStartTime.current > 0) {
        const watchDuration = Math.floor((Date.now() - watchStartTime.current) / 1000);
        const prevReel = reelsRef.current.find(r => r.id === currentReelId.current);
        
        if (watchDuration > 0) {
          // Send to new interactions API
          videoInteractionsApi.trackVideoView({
            videoId: currentReelId.current,
            duration: watchDuration,
            completed: watchDuration >= 5,
          });
          
          // Also send to server cache if from server
          if (prevReel?.source === 'server') {
            recordServerView(currentReelId.current, watchDuration, watchDuration >= 5);
          }
          console.log(`[Reels] ⏱️ Watched ${currentReelId.current} for ${watchDuration}s`);
        }
      }
      
      setCurrentIndex(viewableItems[0].index);
      
      // Start tracking new video
      const reel = viewableItems[0].item as Reel;
      currentReelId.current = reel.id;
      watchStartTime.current = Date.now();
      
      // Track view based on source
      if (reel.source === 'user') {
        reelsService.incrementReelView(reel.id);
      } else if (reel.source === 'server') {
        // Update stats on viewing server video
        setServerStats(prev => prev ? {
          ...prev,
          watched: prev.watched + 1,
          remaining: Math.max(0, prev.remaining - 1),
        } : null);
      }
    }
  }).current;
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;
  
  const handleLike = useCallback(async (reelId: string) => {
    // Optimistic update
    setReels(prev => prev.map(r => 
      r.id === reelId 
        ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
        : r
    ));
    
    // Call API to persist
    try {
      const response = await videoInteractionsApi.toggleVideoLike({ videoId: reelId, userId: user?.id || '' });
      if (response.success) {
        // Update with real count from server
        setReels(prev => prev.map(r => 
          r.id === reelId 
            ? { ...r, liked: response.isLiked, likes: response.likesCount }
            : r
        ));
      }
    } catch (error) {
      console.warn('[Reels] Like API error, local state used:', error);
    }
  }, [user]);
  
  // Load comments from API
  const loadComments = useCallback(async (videoId: string, page = 1, reset = false) => {
    if (isLoadingComments) return;
    
    setIsLoadingComments(true);
    try {
      const response = await videoInteractionsApi.getVideoComments({
        videoId,
        limit: 20,
        offset: (page - 1) * 20,
        sortBy: 'latest',
      });
      
      if (response.success) {
        if (reset || page === 1) {
          setComments(response.comments);
        } else {
          setComments(prev => [...prev, ...response.comments]);
        }
        setHasMoreComments(response.hasMore);
        setCommentsPage(page);
      }
    } catch (error) {
      console.error('[Reels] Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [isLoadingComments]);
  
  // Send new comment
  const handleSendComment = useCallback(async () => {
    if (!commentText.trim() || !selectedReel || !user || isSendingComment) return;
    
    const content = commentText.trim();
    setCommentText('');
    setIsSendingComment(true);
    
    try {
      const response = await videoInteractionsApi.addVideoComment({
        videoId: selectedReel.id,
        userId: user.id,
        userName: user.name || 'User',
        userAvatar: user.avatar,
        content,
      });
      
      if (response.success && response.comment) {
        // Add new comment to top of list
        setComments(prev => [response.comment, ...prev]);
        
        // Update comment count in reels list
        setReels(prev => prev.map(r => 
          r.id === selectedReel.id 
            ? { ...r, comments: r.comments + 1 }
            : r
        ));
        
        // Update selected reel
        setSelectedReel(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
      }
    } catch (error) {
      console.error('[Reels] Error sending comment:', error);
      Alert.alert('Lỗi', 'Không thể gửi bình luận. Vui lòng thử lại.');
      setCommentText(content); // Restore text on error
    } finally {
      setIsSendingComment(false);
    }
  }, [commentText, selectedReel, user, isSendingComment]);
  
  // Like a comment
  const handleLikeComment = useCallback(async (commentId: string) => {
    if (!selectedReel || !user) return;
    
    try {
      const response = await videoInteractionsApi.likeComment(
        selectedReel.id,
        commentId,
        user.id
      );
      
      if (response.success) {
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { ...c, likes: response.likes, liked: response.liked }
            : c
        ));
      }
    } catch (error) {
      console.error('[Reels] Error liking comment:', error);
    }
  }, [selectedReel, user]);
  
  const handleComment = useCallback((reel: Reel) => {
    setSelectedReel(reel);
    setComments([]);
    setCommentsPage(1);
    setHasMoreComments(true);
    setShowComments(true);
    loadComments(reel.id, 1, true);
  }, [loadComments]);
  
  const handleShare = useCallback(async (reel: Reel) => {
    try {
      const result = await Share.share({
        message: `Xem video "${reel.description.split('\n')[0]}" từ ${reel.user.name} trên HomeXD!\n\nhttps://homexd.app/reels/${reel.id}`,
      });
      
      if (result.action === Share.sharedAction) {
        // Record share to server
        const platform = result.activityType || 'other';
        try {
          const response = await videoInteractionsApi.shareVideo({
            videoId: reel.id,
            userId: user?.id,
            platform: platform as any,
          });
          if (response.success) {
            setReels(prev => prev.map(r => 
              r.id === reel.id ? { ...r, shares: response.sharesCount } : r
            ));
          }
        } catch {
          // Silent fail - share was successful, tracking can fail silently
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [user]);
  
  const handleSave = useCallback(async (reelId: string) => {
    // Optimistic update
    setReels(prev => prev.map(r => 
      r.id === reelId ? { ...r, saved: !r.saved, saves: r.saved ? (r.saves || 0) - 1 : (r.saves || 0) + 1 } : r
    ));
    
    // Call API to persist
    try {
      const response = await videoInteractionsApi.toggleVideoSave(reelId);
      if (response.success) {
        setReels(prev => prev.map(r => 
          r.id === reelId ? { ...r, saved: response.saved, saves: response.savesCount } : r
        ));
      }
    } catch (error) {
      console.warn('[Reels] Save API error, local state used:', error);
    }
  }, []);
  
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

  // Handle video download - TikTok style + track downloads
  const handleDownload = useCallback(async (reel: Reel) => {
    try {
      // Track download to server first
      try {
        const response = await videoInteractionsApi.recordVideoDownload(reel.id);
        if (response.success) {
          console.log(`[Reels] ⬇️ Download tracked: ${response.downloadsCount}`);
        }
      } catch {
        // Silent fail - download tracking can fail silently
      }
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Share the video URL directly - user can save from share sheet
        await Sharing.shareAsync(reel.videoUrl, {
          dialogTitle: 'Lưu video',
          mimeType: 'video/mp4',
        });
      } else {
        // Fallback: Share via system share
        await Share.share({
          message: `Tải video: ${reel.videoUrl}`,
          url: reel.videoUrl,
          title: 'Tải video',
        });
      }
    } catch (error) {
      console.error('Download/Share error:', error);
      // Fallback to standard share
      try {
        await Share.share({
          message: `Xem video của ${reel.user.name}:\n${reel.videoUrl}`,
        });
      } catch {
        Alert.alert('Lỗi', 'Không thể chia sẻ video');
      }
    }
  }, []);
  
  // Filter reels by search
  const filteredReels = reels.filter(reel => {
    if (!searchQuery) return true;
    return reel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // ==================== RENDER ====================
  if (isLoading && reels.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Đang tải video...</Text>
        {dataSource === 'server' && (
          <Text style={styles.serverSourceText}>📺 Từ Server Cache</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Server Stats Overlay (only show when using server cache) */}
      {dataSource === 'server' && serverStats && (
        <View style={[styles.serverStatsOverlay, { top: insets.top + 60 }]}>
          <View style={styles.statsChip}>
            <Ionicons name="server" size={12} color="#fff" />
            <Text style={styles.statsChipText}>
              {serverStats.watched}/{serverStats.watched + serverStats.remaining}
            </Text>
          </View>
          {serverStats.remaining === 0 && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleResetSession}
            >
              <Ionicons name="refresh" size={12} color="#fff" />
              <Text style={styles.resetButtonText}>Xem lại</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Reels List - Tối ưu performance */}
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
            onDownload={() => handleDownload(item)}
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
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        updateCellsBatchingPeriod={100}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={['#0066CC']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : null
        }
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
              onPress={() => handleCategoryChange(cat.id)}
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
            
            {/* Comments List - Real data */}
            <FlatList
              data={comments.length > 0 ? comments : SAMPLE_COMMENTS}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.commentsList}
              onEndReached={() => {
                if (hasMoreComments && selectedReel && !isLoadingComments) {
                  loadComments(selectedReel.id, commentsPage + 1);
                }
              }}
              onEndReachedThreshold={0.3}
              ListHeaderComponent={
                isLoadingComments && comments.length === 0 ? (
                  <View style={styles.commentsLoading}>
                    <ActivityIndicator size="small" color="#0066CC" />
                    <Text style={styles.commentsLoadingText}>Đang tải bình luận...</Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !isLoadingComments ? (
                  <View style={styles.commentsEmpty}>
                    <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                    <Text style={styles.commentsEmptyText}>Chưa có bình luận nào</Text>
                    <Text style={styles.commentsEmptySubtext}>Hãy là người đầu tiên bình luận!</Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                isLoadingComments && comments.length > 0 ? (
                  <View style={styles.commentsLoadingMore}>
                    <ActivityIndicator size="small" color="#0066CC" />
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image 
                    source={{ uri: item.user?.avatar || item.avatar || `https://i.pravatar.cc/150?u=${item.userId}` }} 
                    style={styles.commentAvatar} 
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{item.user?.name || item.userName || 'User'}</Text>
                      <Text style={styles.commentTime}>
                        {item.createdAt 
                          ? new Date(item.createdAt).toLocaleDateString('vi-VN') 
                          : (item.time || '')
                        }
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity 
                        style={styles.commentAction}
                        onPress={() => handleLikeComment(item.id.toString())}
                      >
                        <Ionicons 
                          name={item.liked ? "heart" : "heart-outline"} 
                          size={16} 
                          color={item.liked ? "#ff2d55" : "#666"} 
                        />
                        <Text style={styles.commentActionText}>{item.likes || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.commentAction}>
                        <Ionicons name="chatbubble-outline" size={14} color="#666" />
                        <Text style={styles.commentActionText}>
                          {item.repliesCount || item.replies?.length || 0} phản hồi
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
            
            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <Avatar name={user?.name || 'U'} size="md" />
              <TextInput
                style={styles.commentInput}
                placeholder={user ? "Thêm bình luận..." : "Đăng nhập để bình luận"}
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                editable={!!user && !isSendingComment}
                onSubmitEditing={handleSendComment}
                returnKeyType="send"
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!commentText.trim() || !user || isSendingComment) && styles.sendButtonDisabled
                ]}
                disabled={!commentText.trim() || !user || isSendingComment}
                onPress={handleSendComment}
              >
                {isSendingComment ? (
                  <ActivityIndicator size="small" color="#0066CC" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={commentText.trim() && user ? '#0066CC' : '#ccc'} 
                  />
                )}
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
    backgroundColor: '#000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  loadingMore: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  reelBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  reelVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  videoLoadingIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  videoErrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  videoErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pauseIndicator: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    zIndex: 5,
  },
  reelGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -50,
  },
  reelHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
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
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff2d55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  musicDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 8,
    borderColor: '#333',
    overflow: 'hidden',
    marginTop: 8,
  },
  musicDiscImage: {
    width: '100%',
    height: '100%',
  },
  reelInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
    paddingHorizontal: 16,
  },
  reelUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reelUserName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reelDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  seeMore: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  musicText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
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
  muteIndicator: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
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
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: '#0066CC',
  },
  categoryChipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  commentsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentsSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
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
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Comments loading/empty states
  commentsLoading: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  commentsLoadingText: {
    fontSize: 14,
    color: '#666',
  },
  commentsLoadingMore: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  commentsEmpty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  commentsEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  commentsEmptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  // Server Stats Styles
  serverSourceText: {
    marginTop: 12,
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  serverStatsOverlay: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statsChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
