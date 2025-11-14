/**
 * Short Videos Feed Screen (TikTok-style)
 * Vertical swipe video player
 */

import { OptimizedImage } from '@/components/ui/optimized-image';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewToken,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShortVideo {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  videoUrl: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  liked: boolean;
  duration: number;
}

// Mock data
const MOCK_VIDEOS: ShortVideo[] = [
  {
    id: 'v1',
    userId: 'u1',
    userName: 'John Builder',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    videoUrl: 'https://example.com/video1.mp4',
    thumbnail: 'https://picsum.photos/1080/1920',
    caption: 'Amazing construction progress! 🏗️ #construction #timelapse',
    likes: 1234,
    comments: 89,
    shares: 45,
    views: 12456,
    liked: false,
    duration: 15,
  },
  {
    id: 'v2',
    userId: 'u2',
    userName: 'Sarah Designer',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    videoUrl: 'https://example.com/video2.mp4',
    thumbnail: 'https://picsum.photos/1080/1921',
    caption: 'Modern kitchen design reveal ✨ #interiordesign #kitchen',
    likes: 2345,
    comments: 156,
    shares: 78,
    views: 23456,
    liked: true,
    duration: 22,
  },
  {
    id: 'v3',
    userId: 'u3',
    userName: 'Mike Contractor',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    videoUrl: 'https://example.com/video3.mp4',
    thumbnail: 'https://picsum.photos/1080/1922',
    caption: 'Foundation work in progress 💪 #concrete #foundation',
    likes: 987,
    comments: 67,
    shares: 23,
    views: 9876,
    liked: false,
    duration: 18,
  },
];

export default function ShortVideosScreen() {
  const [videos] = useState<ShortVideo[]>(MOCK_VIDEOS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null && index !== currentIndex) {
          setCurrentIndex(index);
        }
      }
    },
    [currentIndex]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const renderVideo = ({ item, index }: { item: ShortVideo; index: number }) => (
    <VideoItem
      video={item}
      isActive={index === currentIndex}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item.id)}
      onShare={() => handleShare(item.id)}
    />
  );

  const handleLike = (videoId: string) => {
    console.log('Like video:', videoId);
  };

  const handleComment = (videoId: string) => {
    console.log('Comment on video:', videoId);
  };

  const handleShare = (videoId: string) => {
    console.log('Share video:', videoId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews
        maxToRenderPerBatch={2}
        windowSize={3}
      />
    </View>
  );
}

interface VideoItemProps {
  video: ShortVideo;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

function VideoItem({ video, isActive, onLike, onComment, onShare }: VideoItemProps) {
  const textColor = useThemeColor({}, 'text');
  const [liked, setLiked] = useState(video.liked);

  const handleLikePress = () => {
    setLiked(!liked);
    onLike();
  };

  return (
    <View style={styles.videoContainer}>
      {/* Video placeholder - replace with actual video player */}
      <OptimizedImage
        uri={video.thumbnail}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
      />

      {/* Play/Pause overlay (would show when video is paused) */}
      {!isActive && (
        <View style={styles.pausedOverlay}>
          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.8)" />
        </View>
      )}

      {/* Top gradient */}
      <View style={styles.topGradient} />

      {/* Bottom gradient */}
      <View style={styles.bottomGradient} />

      {/* User info and caption */}
      <View style={styles.bottomContent}>
        <View style={styles.userInfo}>
          <OptimizedImage
            uri={video.userAvatar}
            width={40}
            height={40}
            borderRadius={20}
          />
          <Text style={styles.userName}>{video.userName}</Text>
        </View>
        <Text style={styles.caption} numberOfLines={2}>
          {video.caption}
        </Text>
        <Text style={styles.views}>{formatViews(video.views)} views</Text>
      </View>

      {/* Right action buttons */}
      <View style={styles.actionButtons}>
        {/* Like */}
        <Pressable style={styles.actionButton} onPress={handleLikePress}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={32}
            color={liked ? '#EF4444' : '#FFFFFF'}
          />
          <Text style={styles.actionText}>{formatCount(video.likes)}</Text>
        </Pressable>

        {/* Comment */}
        <Pressable style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={32} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatCount(video.comments)}</Text>
        </Pressable>

        {/* Share */}
        <Pressable style={styles.actionButton} onPress={onShare}>
          <Ionicons name="arrow-redo-outline" size={32} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatCount(video.shares)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function formatViews(views: number): string {
  return formatCount(views);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  views: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
