import { HeroSlider } from "@/components/home/hero-slider";
import { MobileMenu } from "@/components/home/mobile-menu";
import { SmartGrid } from "@/components/home/smart-grid";
import { VideoPlayer } from "@/components/home/video-player";
import { QuickActionMenu } from "@/components/quick-action-menu";
import { ReelsPlayer } from "@/components/reels-player";
import { SafeScrollView } from "@/components/ui/safe-area";
import VoiceSearchModal from '@/components/voice/VoiceSearchModal';
import {
    DESIGN_UTILITY_SLUGS,
    LIBRARY_TYPES
} from "@/constants/home-routes";
import { Colors } from "@/constants/theme";
import { useSmartBackHandler } from "@/hooks/useBackHandler";
import { useEdgeSwipe } from "@/hooks/useGestures";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { useVideos } from "@/hooks/useVideos";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Image, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
// Fixed video size: 4 videos per row with gaps
const VIDEO_ITEM_GAP = 8;
const VIDEO_HORIZONTAL_PADDING = 16;
const VIDEO_WIDTH = (SCREEN_W - (VIDEO_HORIZONTAL_PADDING * 2) - (VIDEO_ITEM_GAP * 3)) / 4;
const VIDEO_HEIGHT = VIDEO_WIDTH * 1.4; // Vertical aspect ratio like Reels

// ===== DATA =====
const SERVICES = [
  { id: 1, name: "Thiết kế nhà", icon: require("@/assets/images/icon-dich-vu/thiet-ke-nha.png") },
  { id: 2, name: "Thiết kế nội thất", icon: require("@/assets/images/icon-dich-vu/thiet-ke-noi-that.png") },
  { id: 3, name: "Tra cứu xây dựng", icon: require("@/assets/images/icon-dich-vu/tra-cuu-xay-dung.png") },
  { id: 4, name: "Xin phép", icon: require("@/assets/images/icon-dich-vu/xin-phep.png") },
  { id: 5, name: "Hồ sơ mẫu", icon: require("@/assets/images/icon-dich-vu/ho-so-mau.png") },
  { id: 6, name: "Lỗ ban", icon: require("@/assets/images/icon-dich-vu/lo-ban.png") },
  { id: 7, name: "Bảng mẫu", icon: require("@/assets/images/icon-dich-vu/bang-mau.png") },
  { id: 8, name: "Tư vấn chất lượng", icon: require("@/assets/images/icon-dich-vu/Tư vấn chất lượng.png") },
  { id: 9, name: "Công ty xây dựng", icon: require("@/assets/images/icon-dich-vu/cong-ty-xay-dung.png") },
  { id: 10, name: "Công ty nội thất", icon: require("@/assets/images/icon-dich-vu/cong-ty-noi-that.png") },
  { id: 11, name: "Giám sát chất lượng", icon: require("@/assets/images/icon-dich-vu/giam-sat-chat-luong.png") },
];

const CONSTRUCTION_UTILITIES = [
  { id: 1, name: "Ép cọc", location: "Hà Nội", count: 100, icon: require("@/assets/images/tien-ich-xay-dung/ep-coc.png") },
  { id: 2, name: "Đào đất", location: "Sài Gòn", count: 50, icon: require("@/assets/images/tien-ich-xay-dung/dao-dat.png") },
  { id: 3, name: "Vật liệu", location: "Đà Nẵng", count: 80, icon: require("@/assets/images/tien-ich-xay-dung/vat-lieu.png") },
  { id: 4, name: "Nhân công", location: "Sài Gòn", count: 60, icon: require("@/assets/images/tien-ich-xay-dung/nhan-cong.png") },
  { id: 5, name: "Thợ xây", location: "Hà Nội", count: 78, icon: require("@/assets/images/tien-ich-xay-dung/tho-xay.png") },
  { id: 6, name: "Thợ coffa", location: "Sài Gòn", count: 97, icon: require("@/assets/images/tien-ich-xay-dung/tho-coffa.png") },
  { id: 7, name: "Thợ điện nước", location: "Cần Thơ", count: 50, icon: require("@/assets/images/tien-ich-xay-dung/tho-dien-nuoc.png") },
  { id: 8, name: "Bê tông", location: "Sài Gòn", count: 90, icon: require("@/assets/images/tien-ich-xay-dung/be-tong.png") },
];

const FINISHING_UTILITIES = [
  { id: 1, name: "Thợ lát gạch", location: "Hà Nội", count: 100, icon: require("@/assets/images/tien-ich-hoan-thien/tho-lat-gach.png") },
  { id: 2, name: "Thợ thạch cao", location: "Sài Gòn", count: 60, icon: require("@/assets/images/tien-ich-hoan-thien/tho-thachcao-.png") },
  { id: 3, name: "Thợ sơn", location: "Đà Nẵng", count: 85, icon: require("@/assets/images/tien-ich-hoan-thien/tho-son.png") },
  { id: 4, name: "Thợ đá", location: "Sài Gòn", count: 70, icon: require("@/assets/images/tien-ich-hoan-thien/tho-da.png") },
  { id: 5, name: "Thợ làm cửa", location: "Hà Nội", count: 68, icon: require("@/assets/images/tien-ich-hoan-thien/tho-lam-cua.png") },
  { id: 6, name: "Thợ lan can", location: "Sài Gòn", count: 95, icon: require("@/assets/images/tien-ich-hoan-thien/tho-lan-can.png") },
  { id: 7, name: "Thợ công", location: "Cần Thơ", count: 40, icon: require("@/assets/images/tien-ich-hoan-thien/tho-cong.png") },
  { id: 8, name: "Thợ camera", location: "Sài Gòn", count: 70, icon: require("@/assets/images/tien-ich-hoan-thien/tho-camera.png") },
];

const EQUIPMENT_SHOPPING = [
  { id: 1, name: "Thiết bị bếp", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.png") },
  { id: 2, name: "Thiết bị vệ sinh", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-ve-sinh.png") },
  { id: 3, name: "Điện", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/dien.png") },
  { id: 4, name: "Nước", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/nuoc.png") },
  { id: 5, name: "PCCC", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/pccc.png") },
  { id: 6, name: "Bàn ăn", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-an.png") },
  { id: 7, name: "Bàn học", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/ban-hoc.png") },
  { id: 8, name: "Sofa", icon: require("@/assets/images/tien-ich-mua-sam-trang-thiet-bi/sofa.png") },
];

const LIBRARY = [
  { id: 1, name: "Văn phòng", icon: require("@/assets/images/thu-vien/van-phong.png") },
  { id: 2, name: "Nhà phố", icon: require("@/assets/images/thu-vien/nha-pho.png") },
  { id: 3, name: "Biệt thự", icon: require("@/assets/images/thu-vien/biet-thu.png") },
  { id: 4, name: "Biệt thự cổ điển", icon: require("@/assets/images/thu-vien/biet-thu-co-dien.png") },
  { id: 5, name: "Khách sạn", icon: require("@/assets/images/thu-vien/khach-san.png") },
  { id: 6, name: "Nhà xưởng", icon: require("@/assets/images/thu-vien/nha-xuong.png") },
  { id: 7, name: "Căn hộ dịch vụ", icon: require("@/assets/images/thu-vien/can-ho-dich-vu.png") },
];

const DESIGN_UTILITIES = [
  { id: 1, name: "Kiến trúc sư", price: "100k", icon: require("@/assets/images/tien-ich-thiet-ke/kien-truc-su.png") },
  { id: 2, name: "Kỹ sư giám sát", price: "80k", icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-giam-sat.png") },
  { id: 3, name: "Kỹ sư kết cấu", price: "90k", icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-ket-cau.png") },
  { id: 4, name: "Kỹ sư điện", price: "70k", icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-dien.png") },
  { id: 5, name: "Kỹ sư nước", price: "70k", icon: require("@/assets/images/tien-ich-thiet-ke/ky-su-nuoc.png") },
  { id: 6, name: "Dự toán", price: "60k", icon: require("@/assets/images/tien-ich-thiet-ke/du-toan.png") },
  { id: 7, name: "Nội thất", price: "100k", icon: require("@/assets/images/tien-ich-thiet-ke/kien-tru-su-noi-that.png") },
];

// Video URLs - use remote URLs instead of bundling large files
const DESIGN_LIVE_VIDEOS = [
  { id: 1, title: "Phòng bếp đẹp", thumbnail: require("@/assets/images/icon-dich-vu/thiet-ke-nha.png") },
  { id: 2, title: "Đèn thông tầng", thumbnail: require("@/assets/images/icon-dich-vu/thiet-ke-noi-that.png") },
  { id: 3, title: "Maika", thumbnail: require("@/assets/images/thu-vien/biet-thu.png") },
  { id: 4, title: "Carbon", thumbnail: require("@/assets/images/thu-vien/van-phong.png") },
];

const CONSTRUCTION_VIDEOS = [
  { id: 1, title: "Cảm nhận khách hàng", thumbnail: require("@/assets/images/tien-ich-xay-dung/ep-coc.png") },
  { id: 2, title: "Kiểm tra bê tông", thumbnail: require("@/assets/images/tien-ich-xay-dung/be-tong.png") },
  { id: 3, title: "Video 1", thumbnail: require("@/assets/images/tien-ich-xay-dung/dao-dat.png") },
  { id: 4, title: "Video 2", thumbnail: require("@/assets/images/tien-ich-xay-dung/vat-lieu.png") },
];

// ===== COMPONENTS =====
const Section = ({ 
  title, 
  data, 
  renderItem, 
  isGrid = false,
  icon 
}: { 
  title: string; 
  data: any[]; 
  renderItem: (item: any, expanded: boolean) => React.ReactNode;
  isGrid?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) => {
  const [expanded, setExpanded] = useState(false);
  const displayData = expanded ? data : data.slice(0, isGrid ? 8 : 4);

  return (
    <View style={{ 
      marginBottom: 20,
      backgroundColor: 'transparent'
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 12,
        paddingHorizontal: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon && (
            <Ionicons name={icon} size={16} color="#333" />
          )}
          <Text style={{ 
            fontSize: 15, 
            fontWeight: '600', 
            color: '#1a1a1a',
            letterSpacing: -0.2
          }}>
            {title}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setExpanded(!expanded)} 
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            paddingVertical: 4,
            paddingHorizontal: 8
          }}
        >
          <Text style={{ color: '#90B44C', fontWeight: '500', fontSize: 13 }}>
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-forward'} 
            size={14} 
            color="#90B44C" 
          />
        </TouchableOpacity>
      </View>
      {isGrid ? (
        <View style={{ paddingHorizontal: 16 }}>
          <SmartGrid
            data={displayData}
            renderItem={(item) => renderItem(item, expanded)}
            itemsPerRow={4}
            showPlaceholder={!expanded}
            placeholderTitle="Xem thêm"
            onPlaceholderPress={() => setExpanded(true)}
          />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
          decelerationRate="fast"
          snapToInterval={80 + 12}
          snapToAlignment="start"
        >
          {displayData.map((item) => renderItem(item, expanded))}
        </ScrollView>
      )}
    </View>
  );
};

const IconCard = ({ item, onPress }: { item: any; onPress?: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4
    }).start();
  };

  return (
    <TouchableOpacity 
      style={{ 
        width: 80,
        alignItems: 'center', 
        marginBottom: 16,
      }} 
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ 
        transform: [{ scale: scaleAnim }],
        width: 64, 
        height: 64, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.surfaceMuted,
        borderRadius: 32,
        overflow: 'hidden'
      }}>
        <Image 
          source={item.icon} 
          style={{ width: 48, height: 48 }} 
          resizeMode="contain" 
        />
      </Animated.View>
      <Text style={{ 
        fontSize: 10, 
        textAlign: 'center', 
        marginTop: 6, 
        lineHeight: 13, 
        color: '#333', 
        fontWeight: '500',
        paddingHorizontal: 2,
        width: 80
      }} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const RoundIcon = ({ item, onPress }: { item: any; onPress?: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4
    }).start();
  };

  return (
    <TouchableOpacity 
      style={{ 
        width: 80,
        alignItems: 'center', 
        marginBottom: 16 
      }} 
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ 
        transform: [{ scale: scaleAnim }],
        width: 64,
        height: 64, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.surfaceMuted,
        borderRadius: 32,
        overflow: 'hidden'
      }}>
        <Image 
          source={item.icon} 
          style={{ width: 48, height: 48 }} 
          resizeMode="contain" 
        />
      </Animated.View>
      <Text style={{ 
        fontSize: 10, 
        textAlign: 'center', 
        marginTop: 6, 
        color: '#333', 
        fontWeight: '500',
        paddingHorizontal: 2,
        width: 80
      }} numberOfLines={2}>
        {item.name}
      </Text>
      {item.location && (
        <View style={{ 
          marginTop: 4, 
          paddingHorizontal: 6, 
          paddingVertical: 2, 
          borderRadius: 10, 
          backgroundColor: 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          maxWidth: 80
        }}>
          <Ionicons name="location" size={10} color="#666" />
          <Text style={{ fontSize: 9, color: '#666', fontWeight: '400' }} numberOfLines={1}>
            {item.location}
          </Text>
          <Text style={{ fontSize: 8, color: '#ccc' }}>·</Text>
          <Text style={{ fontSize: 9, color: '#666', fontWeight: '400' }}>
            {item.count}
          </Text>
        </View>
      )}
      {item.price && (
        <View style={{ 
          marginTop: 4, 
          paddingHorizontal: 6, 
          paddingVertical: 2, 
          borderRadius: 8, 
          backgroundColor: 'transparent'
        }}>
          <Text style={{ fontSize: 11, color: '#90B44C', fontWeight: '600' }}>
            {item.price}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const VideoTile = ({ item, onPress }: { item: any; onPress?: () => void }) => (
  <TouchableOpacity 
    style={{ 
      width: VIDEO_WIDTH, 
      height: VIDEO_HEIGHT, 
      borderRadius: 8, 
      backgroundColor: '#f5f5f5',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center'
    }}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <Image 
      source={item.thumbnail} 
      style={{ width: '80%', height: '80%', opacity: 0.9 }} 
      resizeMode="contain" 
    />
    
    {/* Title - Shopee style */}
    <View style={{ 
      position: 'absolute', 
      bottom: 6, 
      left: 6, 
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 4,
      padding: 4
    }}>
      <Text style={{ 
        fontSize: 9, 
        color: '#fff', 
        textAlign: 'center', 
        fontWeight: '500'
      }} numberOfLines={1}>
        {item.title}
      </Text>
    </View>
    
    {/* Play button - minimalist */}
    <View style={{
      position: 'absolute',
      backgroundColor: 'transparent',
      borderRadius: 28,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.light.primary
    }}>
      <Ionicons name="play" size={18} color={Colors.light.primary} style={{ marginLeft: 2 }} />
    </View>
  </TouchableOpacity>
);

// New VideoCard with fixed size - 4 videos per row
const VideoCard = ({ item, autoPlay = false, onPress }: { item: any; autoPlay?: boolean; onPress?: () => void }) => (
  <TouchableOpacity 
    style={{ 
      width: VIDEO_WIDTH, 
      marginRight: VIDEO_ITEM_GAP,
      marginBottom: VIDEO_ITEM_GAP
    }}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={{ 
      width: VIDEO_WIDTH, 
      height: VIDEO_HEIGHT,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#F3F4F6'
    }}>
      <VideoPlayer
        url={item.url}
        asset={item.asset}  // Support local videos
        thumbnail={item.thumbnail || item.thumbnailUrl}
        title={item.title}
        autoPlay={false}  // Don't autoplay in grid view
        muted={true}
        loop={true}
        compact={true}
        style={{ 
          width: VIDEO_WIDTH, 
          height: VIDEO_HEIGHT
        }}
      />
    </View>
    
    {/* Video stats overlay */}
    {(item.views || item.likes) && (
      <View style={{ 
        position: 'absolute',
        bottom: 8,
        left: 4,
        right: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4
      }}>
        {item.views && (
          <>
            <Ionicons name="eye-outline" size={10} color="#fff" />
            <Text style={{ fontSize: 9, color: '#fff', fontWeight: '600' }}>
              {item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}K` : item.views}
            </Text>
          </>
        )}
        {item.likes && (
          <>
            <Ionicons name="heart" size={10} color="#EF4444" style={{ marginLeft: 4 }} />
            <Text style={{ fontSize: 9, color: '#fff', fontWeight: '600' }}>
              {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}K` : item.likes}
            </Text>
          </>
        )}
      </View>
    )}
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { user, loading, refresh } = useProfile();
  const { counts } = useUnreadCounts(true); // Auto-refresh every 30s
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  
  // Reels player state
  const [reelsVisible, setReelsVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  // Sticky header state
  const [scrollY, setScrollY] = useState(0);
  const stickyHeaderOpacity = useRef(new Animated.Value(0)).current;
  const stickyHeaderTranslateY = useRef(new Animated.Value(-60)).current;
  
  // Fetch videos from server
  const { videos: designVideos, loading: loadingDesign } = useVideos({ category: 'design', limit: 6 });
  const { videos: constructionVideos, loading: loadingConstruction } = useVideos({ category: 'construction', limit: 6 });

  // Edge swipe gesture to open quick menu from bottom
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const edgeSwipe = useEdgeSwipe({
    onSwipeFromBottom: () => setQuickMenuVisible(true),
  });

  // Smart back handler: Double back to exit on home, navigate back on other screens
  useSmartBackHandler({
    message: 'Nhấn lại một lần nữa để thoát ứng dụng',
  });

  // Animate sticky header based on scroll position
  React.useEffect(() => {
    if (scrollY > 150) {
      // Show sticky header
      Animated.parallel([
        Animated.timing(stickyHeaderOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.spring(stickyHeaderTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8
        })
      ]).start();
    } else {
      // Hide sticky header
      Animated.parallel([
        Animated.timing(stickyHeaderOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.spring(stickyHeaderTranslateY, {
          toValue: -60,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8
        })
      ]).start();
    }
  }, [scrollY]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const handleServicePress = (item: any) => {
    // Push static service routes using literal strings for strong typing
    switch (item.id) {
      case 1: return router.push('/services/house-design');
      case 2: return router.push('/services/interior-design');
      case 3: return router.push('/services/construction-lookup');
      case 4: return router.push('/services/permit');
      case 5: return router.push('/services/sample-docs');
      case 6: return router.push('/services/feng-shui');
      case 7: return router.push('/services/color-chart');
      case 8: return router.push('/services/quality-consulting');
      case 9: return router.push('/services/construction-company');
  case 10: return router.push('/services/company-detail');
      case 11: return router.push('/services/quality-supervision');
      default:
        return;
    }
  };

  const handleUtilityPress = (item: any) => {
    // Navigate to construction booking with pre-selected worker type
    const constructionItem = CONSTRUCTION_UTILITIES.find(u => u.id === item.id);
    if (constructionItem) {
      // Map construction utilities to worker types
      let workerType = 'mason'; // Default
      switch (item.id) {
        case 5: // Thợ xây
          workerType = 'mason';
          break;
        case 7: // Thợ điện nước
          workerType = 'electrician';
          break;
        default:
          workerType = 'mason';
      }
      return router.push(`/construction/booking?workerType=${workerType}`);
    }

    const finishingItem = FINISHING_UTILITIES.find(u => u.id === item.id);
    if (finishingItem) {
      // Map finishing utilities to worker types
      let workerType = 'mason'; // Default
      switch (item.id) {
        case 3: // Thợ sơn
          workerType = 'painter';
          break;
        case 7: // Thợ công (plumber)
          workerType = 'plumber';
          break;
        default:
          workerType = 'mason';
      }
      return router.push(`/construction/booking?workerType=${workerType}`);
    }

    const designItem = DESIGN_UTILITIES.find(u => u.id === item.id);
    if (designItem) {
      const slug = DESIGN_UTILITY_SLUGS[item.id as keyof typeof DESIGN_UTILITY_SLUGS];
      if (slug) return router.push({ pathname: '/utilities/[slug]', params: { slug } });
    }
  };

  const handleVideoPress = (item: any) => {
    // Open Reels-style fullscreen video player
    setSelectedVideo(item);
    setReelsVisible(true);
  };

  const handleLibraryPress = (item: any) => {
    // Navigate with query param using typed object form
    const type = LIBRARY_TYPES[item.id as keyof typeof LIBRARY_TYPES];
    if (type) {
      router.push({ pathname: '/projects/architecture-portfolio', params: { type } });
    }
  };

  const handleEquipmentPress = (item: any) => {
    // Navigate to materials shopping for construction equipment
    router.push('/materials/index');
  };

  const [voiceVisible, setVoiceVisible] = useState(false);

  return (
    <>
      <SafeScrollView 
        style={{ flex: 1, backgroundColor: '#f5f5f5' }}
        showsVerticalScrollIndicator={false}
        hasTabBar={true}
        extraPadding={20}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#90B44C']} />
        }
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          setScrollY(offsetY);
        }}
        scrollEventThrottle={16}
        onTouchStart={(e) => edgeSwipe.handleTouchStart(e, screenWidth, screenHeight)}
        onTouchEnd={(e) => edgeSwipe.handleTouchEnd(e, screenWidth, screenHeight)}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Enhanced User Greeting Banner - Modern Style */}
      {user && (
        <View style={{ 
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 16,
          padding: 16,
          backgroundColor: '#fff',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 4, fontWeight: '500' }}>
                {getGreeting()} 👋
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a', letterSpacing: -0.3 }}>
                {user.name || user.email?.split('@')[0] || 'Khách hàng'}
              </Text>
            </View>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#f5f5f5',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="person" size={22} color="#666" />
            </View>
          </View>
        </View>
      )}

      {/* Enhanced Quick Action Bar - Shopee Style */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 4,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8
      }}>
        {/* Video Call */}
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 12
          }}
          activeOpacity={0.7}
          onPress={() => router.push('/communications')}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4
          }}>
            <Ionicons name="videocam" size={20} color="#1976d2" />
          </View>
          <Text style={{ 
            fontSize: 10, 
            fontWeight: '600', 
            color: '#1976d2',
            letterSpacing: 0
          }}>
            Cuộc gọi
          </Text>
          {counts.calls > 0 && (
            <View style={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: '#ef4444',
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4
            }}>
              <Text style={{ 
                color: '#fff', 
                fontSize: 9, 
                fontWeight: '700' 
              }}>
                {counts.calls > 99 ? '99+' : counts.calls}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Messages */}
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 12
          }}
          activeOpacity={0.7}
          onPress={() => router.push('/communications')}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4
          }}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#43a047" />
          </View>
          <Text style={{ 
            fontSize: 10, 
            fontWeight: '600', 
            color: '#43a047',
            letterSpacing: 0
          }}>
            Tin nhắn
          </Text>
          {counts.messages > 0 && (
            <View style={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: '#ef4444',
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4
            }}>
              <Text style={{ 
                color: '#fff', 
                fontSize: 9, 
                fontWeight: '700' 
              }}>
                {counts.messages > 99 ? '99+' : counts.messages}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 12
          }}
          activeOpacity={0.7}
          onPress={() => router.push('/notifications')}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4
          }}>
            <Ionicons name="notifications" size={20} color="#f57c00" />
          </View>
          <Text style={{ 
            fontSize: 10, 
            fontWeight: '600', 
            color: '#f57c00',
            letterSpacing: 0
          }}>
            Thông báo
          </Text>
          {counts.notifications > 0 && (
            <View style={{
              position: 'absolute',
              top: 6,
              right: 6,
              backgroundColor: '#ef4444',
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4
            }}>
              <Text style={{ 
                color: '#fff', 
                fontSize: 9, 
                fontWeight: '700' 
              }}>
                {counts.notifications > 99 ? '99+' : counts.notifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar - Shopee Style */}
      <View style={{ paddingHorizontal: 16, paddingTop: user ? 8 : 48, paddingBottom: 16 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/search')}
          style={{ 
          backgroundColor: '#f5f5f5', 
          borderRadius: 20, 
          borderWidth: 1,
          borderColor: Colors.light.border,
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 14, 
          paddingVertical: 10,
        }}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <Text style={{ color: '#999', flex: 1, marginLeft: 10, fontSize: 13 }}>Tìm kiếm sản phẩm, dịch vụ...</Text>
          <TouchableOpacity 
            onPress={() => setVoiceVisible(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 8 }}
          >
            <Ionicons name="mic-outline" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu-outline" size={20} color="#666" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Mobile Menu */}
      <MobileMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)}
        userIsAdmin={user?.role === 'admin' || false}
      />

      {/* Hero Slider - Banner Top */}
      <View style={{ paddingHorizontal: 16, marginTop: 4, marginBottom: 16 }}>
        <HeroSlider
          images={[
            { id: 'banner-1', source: require('@/assets/images/banner/Rectangle 21.png') },
            { id: 'banner-2', source: require('@/assets/images/banner/Rectangle 213.png') },
            { id: 'banner-3', source: require('@/assets/images/banner/Rectangle 214.png') },
          ]}
          height={170}
          autoPlay
          intervalMs={4500}
          rounded={16}
        />
      </View>

      {/* DỊCH VỤ - Grid */}
      <Section
        title="DỊCH VỤ"
        icon="grid"
        data={SERVICES}
        isGrid={true}
        renderItem={(item, expanded) => <IconCard key={item.id} item={item} onPress={() => handleServicePress(item)} />}
      />

      {/* DESIGN LIVE - Videos from Server */}
      <Section
        title="DESIGN LIVE"
        icon="videocam"
        data={loadingDesign ? DESIGN_LIVE_VIDEOS : designVideos}
        isGrid={true}
        renderItem={(item, expanded) => {
          // Use VideoCard for server videos, VideoTile for fallback
          if (item.url) {
            return (
              <VideoCard 
                key={item.id} 
                item={item} 
                autoPlay={false}
                onPress={() => handleVideoPress(item)}
              />
            );
          }
          return <VideoTile key={item.id} item={item} onPress={() => handleVideoPress(item)} />;
        }}
      />

      

      {/* TIỆN ÍCH XÂY DỰNG */}
      <Section
        title="TIỆN ÍCH XÂY DỰNG"
        icon="construct"
        data={CONSTRUCTION_UTILITIES}
        isGrid={true}
        renderItem={(item, expanded) => <RoundIcon key={item.id} item={item} onPress={() => handleUtilityPress(item)} />}
      />

      {/* VIDEO CONSTRUCTIONS - Videos from Server */}
      <Section
        title="VIDEO CONSTRUCTIONS"
        icon="play-circle"
        data={loadingConstruction ? CONSTRUCTION_VIDEOS : constructionVideos}
        isGrid={true}
        renderItem={(item, expanded) => {
          // Use VideoCard for server videos, VideoTile for fallback
          if (item.url) {
            return (
              <VideoCard 
                key={item.id} 
                item={item} 
                autoPlay={false}
                onPress={() => handleVideoPress(item)}
              />
            );
          }
          return <VideoTile key={item.id} item={item} onPress={() => handleVideoPress(item)} />;
        }}
      />

      {/* TIỆN ÍCH HOÀN THIỆN */}
      <Section
        title="TIỆN ÍCH HOÀN THIỆN"
        icon="color-palette"
        data={FINISHING_UTILITIES}
        isGrid={true}
        renderItem={(item, expanded) => <RoundIcon key={item.id} item={item} onPress={() => handleUtilityPress(item)} />}
      />

      {/* TIỆN ÍCH MUA SẮM THIẾT BỊ - Horizontal Scroll */}
      <Section
        title="TIỆN ÍCH MUA SẮM THIẾT BỊ"
        icon="cart"
        data={EQUIPMENT_SHOPPING}
        isGrid={false}
        renderItem={(item, expanded) => <IconCard key={item.id} item={item} onPress={() => handleEquipmentPress(item)} />}
      />

      {/* THƯ VIỆN - Horizontal Scroll */}
      <Section
        title="THƯ VIỆN"
        icon="library"
        data={LIBRARY}
        isGrid={false}
        renderItem={(item, expanded) => <IconCard key={item.id} item={item} onPress={() => handleLibraryPress(item)} />}
      />

      {/* TIỆN ÍCH THIẾT KẾ */}
      <Section
        title="TIỆN ÍCH THIẾT KẾ"
        icon="brush"
        data={DESIGN_UTILITIES}
        isGrid={true}
        renderItem={(item, expanded) => <RoundIcon key={item.id} item={item} onPress={() => handleUtilityPress(item)} />}
      />
    </SafeScrollView>

    {/* Reels Video Player */}
    {selectedVideo && (
      <ReelsPlayer
        visible={reelsVisible}
        videoUrl={selectedVideo.url}
        videoAsset={selectedVideo.asset}  // Support local videos
        videoId={selectedVideo.id}  // Add video ID for tracking
        title={selectedVideo.title}
        views={selectedVideo.views}
        likes={selectedVideo.likes}
        onClose={() => {
          setReelsVisible(false);
          setTimeout(() => setSelectedVideo(null), 300);
        }}
      />
    )}

    {/* Quick Action Menu */}
    <QuickActionMenu 
      visible={quickMenuVisible} 
      onClose={() => setQuickMenuVisible(false)} 
    />

    {/* Mobile Menu */}
    <MobileMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

    {/* Sticky Search Bar */}
    <Animated.View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        opacity: stickyHeaderOpacity,
        transform: [{ translateY: stickyHeaderTranslateY }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 100
      }}
      pointerEvents={scrollY > 150 ? 'auto' : 'none'}
    >
      <View style={{ 
        backgroundColor: '#f5f5f5', 
        borderRadius: 20, 
        borderWidth: 1,
        borderColor: Colors.light.border,
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 14, 
        paddingVertical: 10,
      }}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <Text style={{ color: '#999', flex: 1, marginLeft: 10, fontSize: 13 }}>Tìm kiếm sản phẩm, dịch vụ...</Text>
        <TouchableOpacity 
          onPress={() => setVoiceVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginRight: 8 }}
        >
          <Ionicons name="mic-outline" size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </Animated.View>
      <VoiceSearchModal 
        visible={voiceVisible}
        onClose={() => setVoiceVisible(false)}
        onResult={(text) => {
          setVoiceVisible(false);
          router.push({ pathname: '/search', params: { q: text } });
        }}
      />
  </>
  );
}
