/**
 * Live Streams Screen
 * Browse and watch live construction project broadcasts
 * Similar to TikTok Live / Instagram Live
 */

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCurrentLiveStreams, LiveStream } from '@/services/liveStream';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LiveStreamsScreen() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');

  // Load live streams
  const loadStreams = useCallback(async () => {
    try {
      const liveStreams = await getCurrentLiveStreams(20);
      setStreams(liveStreams);
    } catch (error) {
      console.error('Failed to load live streams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStreams();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStreams, 30000);
    return () => clearInterval(interval);
  }, [loadStreams]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStreams();
  };

  const renderStreamCard = ({ item }: { item: LiveStream }) => (
    <TouchableOpacity
      style={[styles.streamCard, { borderColor }]}
      onPress={() => router.push(`/live/${item.id}` as any)}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/400x225' }}
          style={styles.thumbnail}
        />
        
        {/* LIVE Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* Viewer Count */}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye" size={14} color="#fff" />
          <Text style={styles.viewerText}>{formatViewerCount(item.viewerCount)}</Text>
        </View>
      </View>

      {/* Stream Info */}
      <View style={styles.streamInfo}>
        <View style={styles.hostInfo}>
          <Image
            source={{ uri: item.hostAvatar || 'https://via.placeholder.com/40' }}
            style={styles.hostAvatar}
          />
          <View style={styles.hostDetails}>
            <Text style={[styles.streamTitle, { color: textColor }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.hostName, { color: subtextColor }]}>{item.hostName}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: textColor }]}>Live Now 🔴</Text>
        <Text style={[styles.headerSubtitle, { color: subtextColor }]}>
          {streams.length} stream{streams.length !== 1 ? 's' : ''} đang phát
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/live/create')}
      >
        <Ionicons name="videocam" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Go Live</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="videocam-off-outline" size={64} color={subtextColor} />
      <Text style={[styles.emptyText, { color: textColor }]}>Không có live stream nào</Text>
      <Text style={[styles.emptySubtext, { color: subtextColor }]}>
        Hãy là người đầu tiên phát trực tiếp!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/live/create')}
      >
        <Text style={styles.emptyButtonText}>Bắt đầu Live Stream</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  return (
    <Container fullWidth style={{ backgroundColor }}>
      <FlatList
        data={streams}
        renderItem={renderStreamCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
    </Container>
  );
}

function formatViewerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  columnWrapper: {
    gap: 12,
  },
  streamCard: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  viewerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  viewerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  streamInfo: {
    padding: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    gap: 10,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hostDetails: {
    flex: 1,
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  hostName: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
