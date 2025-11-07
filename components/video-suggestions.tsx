/**
 * Video Suggestions Component
 * Smart video recommendations based on user context and activity
 * Categories: Construction, Materials, Life Hacks, Interior Design
 */

import { VideoPlayer } from '@/components/home/video-player';
import { HapticFeedback } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_CARD_WIDTH = SCREEN_WIDTH * 0.7;
const VIDEO_CARD_HEIGHT = VIDEO_CARD_WIDTH * (9 / 16);

export interface VideoSuggestion {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  category: 'construction' | 'materials' | 'life-hacks' | 'interior-design';
  duration: string;
  views: number;
  likes: number;
  author: string;
  uploadDate: string;
}

interface VideoSuggestionsProps {
  /**
   * Video category to display
   */
  category?: 'construction' | 'materials' | 'life-hacks' | 'interior-design' | 'all';
  
  /**
   * Maximum number of videos to show
   */
  limit?: number;
  
  /**
   * Show category tabs
   */
  showTabs?: boolean;
  
  /**
   * Title of the section
   */
  title?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: 'apps' as const },
  { id: 'construction', label: 'Xây dựng', icon: 'construct' as const },
  { id: 'materials', label: 'Vật liệu', icon: 'cube' as const },
  { id: 'life-hacks', label: 'Mẹo hay', icon: 'bulb' as const },
  { id: 'interior-design', label: 'Nội thất', icon: 'home' as const },
];

// Mock data - replace with real API call
const MOCK_VIDEOS: VideoSuggestion[] = [
  {
    id: 'v1',
    title: 'Cách ép cọc móng nhà đúng kỹ thuật',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'construction',
    duration: '12:34',
    views: 15234,
    likes: 892,
    author: 'Xây Dựng Pro',
    uploadDate: '2024-10-15',
  },
  {
    id: 'v2',
    title: 'Review xi măng chất lượng cao nhất',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    category: 'materials',
    duration: '8:45',
    views: 23456,
    likes: 1234,
    author: 'Vật Liệu 365',
    uploadDate: '2024-10-20',
  },
  {
    id: 'v3',
    title: 'Mẹo tính toán vật liệu xây nhà chính xác',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'life-hacks',
    duration: '6:12',
    views: 34567,
    likes: 2345,
    author: 'Tips & Tricks',
    uploadDate: '2024-10-22',
  },
  {
    id: 'v4',
    title: 'Thiết kế phòng khách hiện đại 2024',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    category: 'interior-design',
    duration: '10:23',
    views: 45678,
    likes: 3456,
    author: 'Interior Designer',
    uploadDate: '2024-10-25',
  },
  {
    id: 'v5',
    title: 'Kỹ thuật đổ bê tông sàn tầng 2',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    category: 'construction',
    duration: '15:45',
    views: 12345,
    likes: 789,
    author: 'Xây Dựng Pro',
    uploadDate: '2024-10-26',
  },
];

export const VideoSuggestions: React.FC<VideoSuggestionsProps> = ({
  category = 'all',
  limit,
  showTabs = true,
  title = 'Video gợi ý',
}) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [videos, setVideos] = useState<VideoSuggestion[]>(MOCK_VIDEOS);

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  const displayVideos = limit ? filteredVideos.slice(0, limit) : filteredVideos;

  const handleCategoryPress = (cat: string) => {
    HapticFeedback.selection();
    setSelectedCategory(cat as any);
  };

  const handleVideoPress = (video: VideoSuggestion) => {
    HapticFeedback.light();
    // Navigate to video player or detail page
    router.push(`/projects?videoId=${video.id}` as any);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={() => router.push('/projects?tab=videos' as any)}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      {showTabs && (
        <View style={styles.tabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedCategory === item.id && styles.tabActive,
                ]}
                onPress={() => handleCategoryPress(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={selectedCategory === item.id ? '#0891B2' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === item.id && styles.tabTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.tabsList}
          />
        </View>
      )}

      {/* Videos List */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={displayVideos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => handleVideoPress(item)}
            activeOpacity={0.95}
          >
            <VideoPlayer
              url={item.url}
              thumbnail={item.thumbnail}
              title={item.title}
              autoPlay={false}
              muted={true}
              loop={false}
              compact={true}
              style={styles.videoPlayer}
            />
            
            {/* Video Info */}
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {item.title}
              </Text>
              
              <View style={styles.videoMeta}>
                <Text style={styles.author}>{item.author}</Text>
                <View style={styles.stats}>
                  <Ionicons name="eye-outline" size={14} color="#6B7280" />
                  <Text style={styles.statText}>{formatNumber(item.views)}</Text>
                  
                  <Ionicons name="heart-outline" size={14} color="#6B7280" style={{ marginLeft: 12 }} />
                  <Text style={styles.statText}>{formatNumber(item.likes)}</Text>
                </View>
              </View>
              
              {/* Duration Badge */}
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color="#fff" />
                <Text style={styles.duration}>{item.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.videosList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0891B2',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#E0F2FE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#0891B2',
  },
  videosList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  videoCard: {
    width: VIDEO_CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  videoPlayer: {
    width: VIDEO_CARD_WIDTH,
    height: VIDEO_CARD_HEIGHT,
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  durationBadge: {
    position: 'absolute',
    top: VIDEO_CARD_HEIGHT - 32,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  duration: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});
