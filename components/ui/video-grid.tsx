import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/layout';
import { VideoItem } from '@/data/videos';
import { videoService } from '@/services/videoManager';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { VideoCard } from './video-card';

interface VideoGridProps {
  category?: string;
  showAuthor?: boolean;
  showStats?: boolean;
  numColumns?: number;
  onVideoPress?: (video: VideoItem) => void;
}

export function VideoGrid({
  category,
  showAuthor = true,
  showStats = true,
  numColumns = 2,
  onVideoPress
}: VideoGridProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Load videos from API
      await videoService.loadVideosFromDatabase();

      // Get videos as VideoItem array
      let allVideos = videoService.getAllVideosAsVideoItems();

      // Filter by category if specified
      if (category) {
        allVideos = allVideos.filter(video => video.category === category);
      }

      setVideos(allVideos);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Không thể tải video. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [category]);

  const handleRefresh = () => {
    loadVideos(true);
  };

  const renderVideo = ({ item }: { item: VideoItem }) => (
    <View style={[styles.videoContainer, { width: `${100 / numColumns}%` }]}>
      <VideoCard
        video={item}
        showAuthor={showAuthor}
        showStats={showStats}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        {error || 'Không có video nào'}
      </ThemedText>
    </View>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#666" />
        <ThemedText style={styles.footerText}>Đang tải...</ThemedText>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
        <ThemedText style={styles.loadingText}>Đang tải video...</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={renderVideo}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#666']}
          tintColor="#666"
        />
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={10}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.sm,
  },
  videoContainer: {
    padding: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  footerText: {
    marginLeft: Spacing.sm,
    color: '#666',
    fontSize: 12,
  },
});
