import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LiveStream {
  id: string;
  title: string;
  host: {
    name: string;
    avatar: string;
  };
  thumbnail: string;
  viewers: number;
  isLive: boolean;
  category: string;
}

export default function TikTokLiveScreen() {
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'Tất cả' },
    { key: 'construction', label: 'Xây dựng' },
    { key: 'design', label: 'Thiết kế' },
    { key: 'tutorial', label: 'Hướng dẫn' },
    { key: 'review', label: 'Review' },
    { key: 'qa', label: 'Hỏi đáp' },
  ];

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setStreams([
        {
          id: '1',
          title: 'Hướng dẫn đổ bê tông móng đúng kỹ thuật',
          host: { name: 'Kỹ sư Minh', avatar: 'https://i.pravatar.cc/100?img=1' },
          thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
          viewers: 1520,
          isLive: true,
          category: 'construction',
        },
        {
          id: '2',
          title: 'Review vật liệu xây dựng tháng 1/2025',
          host: { name: 'Thầu Hùng', avatar: 'https://i.pravatar.cc/100?img=2' },
          thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          viewers: 892,
          isLive: true,
          category: 'review',
        },
        {
          id: '3',
          title: 'Thiết kế nội thất phòng khách hiện đại',
          host: { name: 'KTS Linh', avatar: 'https://i.pravatar.cc/100?img=3' },
          thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400',
          viewers: 2341,
          isLive: true,
          category: 'design',
        },
        {
          id: '4',
          title: 'Q&A: Giải đáp thắc mắc xây nhà',
          host: { name: 'Chuyên gia Tâm', avatar: 'https://i.pravatar.cc/100?img=4' },
          thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
          viewers: 567,
          isLive: true,
          category: 'qa',
        },
        {
          id: '5',
          title: 'Hướng dẫn lắp đặt điện âm tường',
          host: { name: 'Thợ điện Bình', avatar: 'https://i.pravatar.cc/100?img=5' },
          thumbnail: 'https://images.unsplash.com/photo-1558618047-f4b511b69293?w=400',
          viewers: 723,
          isLive: true,
          category: 'tutorial',
        },
        {
          id: '6',
          title: 'Kỹ thuật ốp lát gạch chuẩn',
          host: { name: 'Anh Ba Gạch', avatar: 'https://i.pravatar.cc/100?img=6' },
          thumbnail: 'https://images.unsplash.com/photo-1609766857326-18a124ba5ecd?w=400',
          viewers: 1105,
          isLive: true,
          category: 'tutorial',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatViewers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const filteredStreams = streams.filter(
    stream => selectedCategory === 'all' || stream.category === selectedCategory
  );

  const renderStreamCard = ({ item }: { item: LiveStream }) => (
    <TouchableOpacity style={styles.streamCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.liveOverlay}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewersBadge}>
          <Ionicons name="eye" size={12} color="#fff" />
          <Text style={styles.viewersText}>{formatViewers(item.viewers)}</Text>
        </View>
      </View>
      <View style={styles.streamInfo}>
        <Image source={{ uri: item.host.avatar }} style={styles.hostAvatar} />
        <View style={styles.streamDetails}>
          <Text style={styles.streamTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.hostName}>{item.host.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Stream</Text>
          <TouchableOpacity style={styles.goLiveButton}>
            <Ionicons name="videocam" size={20} color="#fff" />
            <Text style={styles.goLiveText}>Go Live</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  selectedCategory === item.key && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(item.key)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.key && styles.categoryTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Streams Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStreams}
            numColumns={2}
            contentContainerStyle={styles.streamsList}
            columnWrapperStyle={styles.streamsRow}
            keyExtractor={(item) => item.id}
            renderItem={renderStreamCard}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="videocam-off" size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>Không có livestream nào</Text>
              </View>
            }
          />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  goLiveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesContainer: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  streamsList: {
    padding: 8,
  },
  streamsRow: {
    justifyContent: 'space-between',
  },
  streamCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#2a2a2a',
  },
  liveOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  liveBadge: {
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
    fontSize: 10,
    fontWeight: '700',
  },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  viewersText: {
    color: '#fff',
    fontSize: 11,
  },
  streamInfo: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  streamDetails: {
    flex: 1,
  },
  streamTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  hostName: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
});
