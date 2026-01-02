/**
 * Live Streams Screen - TikTok/Facebook Live Style
 * Vertical swipe, real-time comments, gifts, reactions
 */

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCurrentLiveStreams, LiveStream } from '@/services/liveStream';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


// Mock comments for demo
const MOCK_COMMENTS = [
  { id: 1, user: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/50?img=1', text: 'Công trình đẹp quá! 👍', time: Date.now() - 5000 },
  { id: 2, user: 'Trần Thị B', avatar: 'https://i.pravatar.cc/50?img=2', text: 'Anh ơi phần móng làm thế nào vậy?', time: Date.now() - 15000 },
  { id: 3, user: 'Lê Văn C', avatar: 'https://i.pravatar.cc/50?img=3', text: 'Chào anh! 👋', time: Date.now() - 25000 },
  { id: 4, user: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/50?img=4', text: 'Đội thợ chuyên nghiệp quá', time: Date.now() - 35000 },
  { id: 5, user: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/50?img=5', text: 'Xin giá xây nhà nhé anh', time: Date.now() - 45000 },
];

const GIFTS = [
  { id: 1, name: 'Hoa', icon: '🌸', value: 1 },
  { id: 2, name: 'Tim', icon: '❤️', value: 5 },
  { id: 3, name: 'Vương miện', icon: '👑', value: 10 },
  { id: 4, name: 'Pháo hoa', icon: '🎉', value: 20 },
  { id: 5, name: 'Rocket', icon: '🚀', value: 50 },
];

export default function LiveStreamsScreen() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [reactions, setReactions] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  const heartScale = useRef(new Animated.Value(0)).current;
  const giftPanelHeight = useRef(new Animated.Value(0)).current;

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
    const interval = setInterval(loadStreams, 30000);
    return () => clearInterval(interval);
  }, [loadStreams]);

  useEffect(() => {
    // Auto add comments for demo
    if (showFullScreen && selectedStream) {
      const interval = setInterval(() => {
        const randomComments = [
          'Công trình tiến độ nhanh quá! 🏗️',
          'Anh ơi tư vấn giá cho em với',
          'Đội thợ làm việc chuyên nghiệp',
          'Phần này làm mất bao lâu vậy anh?',
          'Xin số điện thoại nhé anh',
          'Dự án đẹp quá! 👍',
          'Live hàng ngày nhé anh',
        ];
        const newCmt = {
          id: Date.now(),
          user: `User ${Math.floor(Math.random() * 1000)}`,
          avatar: `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`,
          text: randomComments[Math.floor(Math.random() * randomComments.length)],
          time: Date.now(),
        };
        setComments(prev => [...prev, newCmt].slice(-20));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [showFullScreen, selectedStream]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStreams();
  };

  const handleStreamPress = (stream: LiveStream) => {
    setSelectedStream(stream);
    setShowFullScreen(true);
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: 'Bạn',
        avatar: 'https://i.pravatar.cc/50?img=99',
        text: newComment,
        time: Date.now(),
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const handleLike = () => {
    // Heart animation
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Add floating reaction
    const reaction = {
      id: Date.now(),
      emoji: '❤️',
      x: Math.random() * SCREEN_WIDTH * 0.3,
    };
    setReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  };

  const handleGift = (gift: any) => {
    const reaction = {
      id: Date.now(),
      emoji: gift.icon,
      x: Math.random() * SCREEN_WIDTH * 0.3,
    };
    setReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
    setShowGifts(false);
  };

  const toggleGifts = () => {
    const toValue = showGifts ? 0 : 200;
    setShowGifts(!showGifts);
    Animated.spring(giftPanelHeight, {
      toValue,
      useNativeDriver: false,
    }).start();
  };

  const renderFullScreenLive = () => {
    if (!selectedStream) return null;

    return (
      <View style={styles.fullScreenContainer}>
        {/* Video Background */}
        <Image
          source={{ uri: selectedStream.thumbnailUrl || 'https://via.placeholder.com/400x800' }}
          style={styles.fullScreenVideo}
          blurRadius={5}
        />
        
        {/* Gradient Overlays */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        />

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFullScreen(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.hostInfoBar}>
            <Image source={{ uri: selectedStream.hostAvatar }} style={styles.hostAvatarLive} />
            <View style={styles.hostTextLive}>
              <Text style={styles.hostNameLive}>{selectedStream.hostName}</Text>
              <View style={styles.liveBadgeLive}>
                <View style={styles.liveDotPulse} />
                <Text style={styles.liveTextLive}>LIVE</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>+ Theo dõi</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewerBadgeLive}>
            <Ionicons name="eye" size={16} color="#fff" />
            <Text style={styles.viewerTextLive}>{formatViewerCount(selectedStream.viewerCount)}</Text>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <ScrollView
            style={styles.commentsScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentBubble}>
                <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Floating Reactions */}
        <View style={styles.reactionsContainer}>
          {reactions.map((reaction) => (
            <Animated.Text
              key={reaction.id}
              style={[
                styles.floatingReaction,
                {
                  left: reaction.x,
                  transform: [{
                    translateY: heartScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -SCREEN_HEIGHT * 0.6],
                    }),
                  }],
                  opacity: heartScale.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1, 0],
                  }),
                },
              ]}
            >
              {reaction.emoji}
            </Animated.Text>
          ))}
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons name="heart" size={32} color="#EF4444" />
            <Text style={styles.actionText}>2.5K</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble" size={28} color="#fff" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={toggleGifts}>
            <Text style={styles.giftIcon}>🎁</Text>
            <Text style={styles.actionText}>Quà</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social" size={28} color="#fff" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        {/* Gift Panel */}
        <Animated.View style={[styles.giftPanel, { height: giftPanelHeight }]}>
          <View style={styles.giftHeader}>
            <Text style={styles.giftTitle}>Gửi quà tặng</Text>
            <TouchableOpacity onPress={toggleGifts}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.giftList}>
            {GIFTS.map((gift) => (
              <TouchableOpacity
                key={gift.id}
                style={styles.giftItem}
                onPress={() => handleGift(gift)}
              >
                <Text style={styles.giftEmoji}>{gift.icon}</Text>
                <Text style={styles.giftName}>{gift.name}</Text>
                <Text style={styles.giftValue}>{gift.value} 💎</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Bottom Input */}
        <View style={styles.bottomInput}>
          <TextInput
            style={styles.commentInput}
            placeholder="Bình luận..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleSendComment}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendComment}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStreamCard = ({ item }: { item: LiveStream }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => handleStreamPress(item)}
      activeOpacity={0.9}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/400x225' }}
          style={styles.thumbnail}
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cardGradient}
        />

        {/* LIVE Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDotAnimated} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* Viewer Count */}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye" size={14} color="#fff" />
          <Text style={styles.viewerText}>{formatViewerCount(item.viewerCount)}</Text>
        </View>

        {/* Stream Info Overlay */}
        <View style={styles.cardOverlay}>
          <View style={styles.hostInfoCard}>
            <Image
              source={{ uri: item.hostAvatar || 'https://via.placeholder.com/40' }}
              style={styles.hostAvatarCard}
            />
            <View style={styles.hostDetailsCard}>
              <Text style={styles.hostNameCard}>{item.hostName}</Text>
              <Text style={styles.streamTitleCard} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
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
          {streams.length} người đang phát trực tiếp
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
      <View style={styles.emptyIcon}>
        <Ionicons name="videocam-off-outline" size={64} color="#999" />
      </View>
      <Text style={[styles.emptyText, { color: textColor }]}>Chưa có live stream nào</Text>
      <Text style={[styles.emptySubtext, { color: subtextColor }]}>
        Hãy là người đầu tiên chia sẻ công trình của bạn!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/live/create')}
      >
        <Ionicons name="videocam" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Bắt đầu Live Stream</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <Container scroll={false}>
        <Loader />
      </Container>
    );
  }

  return (
    <>
      {/* Use scroll={false} to avoid nesting FlatList inside ScrollView */}
      <Container fullWidth scroll={false} style={{ backgroundColor, flex: 1 }}>
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

      {/* Full Screen Live Modal */}
      {showFullScreen && renderFullScreenLive()}
    </>
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
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  hostInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostAvatarCard: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  hostDetailsCard: {
    flex: 1,
  },
  hostNameCard: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  streamTitleCard: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.9,
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
  liveDotAnimated: {
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
    borderRadius: 12,
    gap: 4,
  },
  viewerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Full Screen Live Styles (TikTok Live)
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 9999,
  },
  fullScreenVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 12,
  },
  hostInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatarLive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  hostTextLive: {
    flex: 1,
  },
  hostNameLive: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  liveBadgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveTextLive: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  viewerBadgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewerTextLive: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  commentsSection: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 80,
    maxHeight: 300,
  },
  commentsScroll: {
    flex: 1,
  },
  commentBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 16,
    maxWidth: '90%',
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    color: '#fff',
    fontSize: 13,
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: 200,
    right: 16,
    width: 50,
  },
  floatingReaction: {
    position: 'absolute',
    fontSize: 32,
    right: 0,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  giftIcon: {
    fontSize: 28,
  },
  giftPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  giftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  giftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  giftList: {
    flexDirection: 'row',
  },
  giftItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: 80,
  },
  giftEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  giftName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  giftValue: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  bottomInput: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

