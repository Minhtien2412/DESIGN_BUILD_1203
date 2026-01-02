import { SafeScrollView } from "@/components/ui/safe-area";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Real sample video URLs from Google CDN
const SAMPLE_VIDEOS = {
  forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  forBiggerEscapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  forBiggerFun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  forBiggerJoyrides: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  forBiggerMeltdowns: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  subaru: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
};

const VIDEO_CATEGORIES: Record<string, { title: string; videos: any[] }> = {
  design: {
    title: "Design Live",
    videos: [
      { id: 1, title: "Phòng bếp đẹp", thumbnail: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'), url: SAMPLE_VIDEOS.forBiggerBlazes },
      { id: 2, title: "Đèn thông tầng", thumbnail: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.webp'), url: SAMPLE_VIDEOS.forBiggerEscapes },
      { id: 3, title: "Maika", thumbnail: require('@/assets/images/icon-dich-vu/cong-ty-noi-that.webp'), url: SAMPLE_VIDEOS.forBiggerFun },
      { id: 4, title: "Carbon", thumbnail: require('@/assets/images/icon-dich-vu/ho-so-mau.webp'), url: SAMPLE_VIDEOS.forBiggerJoyrides },
      { id: 5, title: "Nội thất hiện đại", thumbnail: require('@/assets/images/icon-dich-vu/bang-mau.webp'), url: SAMPLE_VIDEOS.forBiggerMeltdowns },
      { id: 6, title: "Căn hộ sang trọng", thumbnail: require('@/assets/images/icon-dich-vu/giam-sat-chat-luong.webp'), url: SAMPLE_VIDEOS.subaru },
    ]
  },
  construction: {
    title: "Video Constructions",
    videos: [
      { id: 1, title: "Cảm nhận khách hàng", thumbnail: require('@/assets/images/icon-dich-vu/cong-ty-xay-dung.webp'), url: SAMPLE_VIDEOS.forBiggerBlazes },
      { id: 2, title: "Kiểm tra bê tông", thumbnail: require('@/assets/images/icon-dich-vu/tra-cuu-xay-dung.webp'), url: SAMPLE_VIDEOS.forBiggerEscapes },
      { id: 3, title: "Công trường A", thumbnail: require('@/assets/images/icon-dich-vu/lo-ban.webp'), url: SAMPLE_VIDEOS.forBiggerFun },
      { id: 4, title: "Thi công thô", thumbnail: require('@/assets/images/icon-dich-vu/giam-sat-chat-luong.webp'), url: SAMPLE_VIDEOS.forBiggerJoyrides },
      { id: 5, title: "Hoàn thiện nội thất", thumbnail: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.webp'), url: SAMPLE_VIDEOS.forBiggerMeltdowns },
      { id: 6, title: "Bàn giao dự án", thumbnail: require('@/assets/images/icon-dich-vu/thiet-ke-nha.webp'), url: SAMPLE_VIDEOS.subaru },
    ]
  },
};

export default function VideoCategoryScreen() {
  const params = useLocalSearchParams<{ category: string }>();
  const category = params.category || 'design';
  const categoryData = VIDEO_CATEGORIES[category] || VIDEO_CATEGORIES.design;

  return (
    <SafeScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryData.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Video Grid */}
      <View style={styles.grid}>
        {categoryData.videos.map((video) => (
          <VideoCard key={video.id} item={video} />
        ))}
      </View>
    </SafeScrollView>
  );
}

function VideoCard({ item }: { item: any }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.videoCard}
      activeOpacity={1}
      onPress={() => router.push('/videos')}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.videoCardInner, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={item.thumbnail} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  videoCard: {
    width: '48%',
    aspectRatio: 0.7,
  },
  videoCardInner: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 16,
  },
});
