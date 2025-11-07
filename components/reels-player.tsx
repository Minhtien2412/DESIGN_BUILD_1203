/**
 * Reels Video Player
 * Fullscreen vertical video player giống Facebook Reels / Instagram Reels / TikTok
 * With like, comment, share, and view tracking
 */

import { useAuth } from '@/context/AuthContext';
import { useVideoInteractions } from '@/context/VideoInteractionsContext';
import { HapticFeedback } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Pressable,
    SafeAreaView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommentsModal } from './ui/CommentsModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReelsPlayerProps {
  visible: boolean;
  videoUrl?: string; // URL from API
  videoAsset?: any; // Local asset from require()
  videoId?: string; // Video ID for tracking
  title?: string;
  views?: number;
  likes?: number;
  onClose: () => void;
}

export const ReelsPlayer: React.FC<ReelsPlayerProps> = ({
  visible,
  videoUrl,
  videoAsset,
  videoId = 'unknown',
  title,
  views: initialViews,
  likes: initialLikes,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    likeVideo,
    isVideoLiked,
    getVideoLikes,
    getCommentsCount,
    getVideoViews,
    getVideoShares,
    trackView,
    trackShare,
  } = useVideoInteractions();

  // Track watch time for analytics
  const watchStartTime = useRef<number>(0);
  const totalWatchTime = useRef<number>(0);

  // Get real-time stats
  const isLiked = isVideoLiked(videoId);
  const likesCount = getVideoLikes(videoId) || initialLikes || 0;
  const viewsCount = getVideoViews(videoId) || initialViews || 0;
  const commentsCount = getCommentsCount(videoId);
  const sharesCount = getVideoShares(videoId);

  // Determine video source (URL or local asset)
  const videoSource = videoAsset || videoUrl || '';

  // Use the new expo-video API
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = isMuted;
    player.play();
  });

  // Track view when video starts playing
  useEffect(() => {
    if (visible && !isLoading) {
      watchStartTime.current = Date.now();
    }
  }, [visible, isLoading]);

  // Track view on unmount or close
  useEffect(() => {
    return () => {
      if (watchStartTime.current > 0) {
        const duration = Math.floor((Date.now() - watchStartTime.current) / 1000);
        totalWatchTime.current += duration;
        
        // Track if watched for at least 3 seconds
        if (totalWatchTime.current >= 3) {
          const completed = totalWatchTime.current >= 30; // Consider completed if watched 30+ seconds
          trackView(videoId, totalWatchTime.current, completed);
        }
      }
    };
  }, [videoId, trackView]);

  useEffect(() => {
    if (!visible) {
      player.pause();
      // Save watch time before pausing
      if (watchStartTime.current > 0) {
        const duration = Math.floor((Date.now() - watchStartTime.current) / 1000);
        totalWatchTime.current += duration;
        watchStartTime.current = 0;
      }
    } else {
      setIsLoading(true);
      player.play();
      watchStartTime.current = Date.now();
      // Simulate loading complete after a short delay
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [visible, player]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  const handlePlayPause = useCallback(() => {
    HapticFeedback.light();
    if (player.playing) {
      player.pause();
      // Save watch time
      if (watchStartTime.current > 0) {
        const duration = Math.floor((Date.now() - watchStartTime.current) / 1000);
        totalWatchTime.current += duration;
        watchStartTime.current = 0;
      }
    } else {
      player.play();
      watchStartTime.current = Date.now();
    }
  }, [player]);

  const handleMuteToggle = useCallback(() => {
    HapticFeedback.light();
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleClose = () => {
    HapticFeedback.light();
    onClose();
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Đăng nhập', 'Bạn cần đăng nhập để thích video');
      return;
    }

    HapticFeedback.like();
    await likeVideo(videoId);
  };

  const handleComment = () => {
    if (!user) {
      Alert.alert('Đăng nhập', 'Bạn cần đăng nhập để bình luận');
      return;
    }

    HapticFeedback.light();
    setCommentsVisible(true);
  };

  const handleShare = async () => {
    HapticFeedback.light();
    
    try {
      const shareUrl = videoUrl || `app://video/${videoId}`;
      const result = await Share.share({
        message: title ? `${title}\n\n${shareUrl}` : shareUrl,
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        // Track share
        const platform = result.activityType || 'other';
        await trackShare(videoId, platform as any);
        HapticFeedback.success();
      }
    } catch (error) {
      console.error('[ReelsPlayer] Error sharing:', error);
      HapticFeedback.error();
    }
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.container}>
        {/* Video Player */}
        <Pressable style={styles.videoContainer} onPress={handlePlayPause}>
          {hasError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={64} color="#fff" />
              <Text style={styles.errorText}>Không thể phát video</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                }}
              >
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
              />

              {/* Loading Spinner */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}

              {/* Play/Pause Indicator */}
              {!player.playing && !isLoading && (
                <View style={styles.playPauseIndicator}>
                  <Ionicons name="play" size={80} color="rgba(255,255,255,0.8)" />
                </View>
              )}
            </>
          )}
        </Pressable>

        {/* Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 16 }]}>
          {/* Video Info */}
          <View style={styles.infoSection}>
            {title && (
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            )}
            {(viewsCount > 0 || likesCount > 0 || commentsCount > 0) && (
              <View style={styles.statsRow}>
                {viewsCount > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statText}>{formatNumber(viewsCount)} lượt xem</Text>
                  </View>
                )}
                {likesCount > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="heart" size={16} color={isLiked ? '#ff4444' : 'rgba(255,255,255,0.8)'} />
                    <Text style={styles.statText}>{formatNumber(likesCount)}</Text>
                  </View>
                )}
                {commentsCount > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statText}>{formatNumber(commentsCount)}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Like */}
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <View style={[styles.actionIconContainer, isLiked && styles.actionIconLiked]}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? '#ff4444' : '#fff'}
                />
              </View>
              <Text style={styles.actionLabel}>
                {likesCount > 0 ? formatNumber(likesCount) : 'Thích'}
              </Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>
                {commentsCount > 0 ? formatNumber(commentsCount) : 'Bình luận'}
              </Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="share-social-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>
                {sharesCount > 0 ? formatNumber(sharesCount) : 'Chia sẻ'}
              </Text>
            </TouchableOpacity>

            {/* Mute/Unmute */}
            <TouchableOpacity style={styles.actionButton} onPress={handleMuteToggle}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.actionLabel}>
                {isMuted ? 'Bật âm' : 'Tắt âm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Modal */}
        <CommentsModal
          visible={commentsVisible}
          videoId={videoId}
          videoTitle={title}
          onClose={() => setCommentsVisible(false)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playPauseIndicator: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0891B2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  infoSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconLiked: {
    backgroundColor: 'rgba(255,68,68,0.2)',
  },
  actionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});
