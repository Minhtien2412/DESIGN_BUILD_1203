/**
 * TikTok Video Card Component
 * Fullscreen video card with user info and action buttons
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useTikTok } from '@/context/TikTokContext';
import { TikTokVideo } from '@/types/tiktok';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DoubleTapHeart } from './DoubleTapHeart';
import { TikTokActionBar } from './TikTokActionBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TikTokVideoCardProps {
  video: TikTokVideo;
  isActive: boolean;
  onUserPress?: (userId: string) => void;
  onMusicPress?: (musicId: string) => void;
  onHashtagPress?: (hashtag: string) => void;
}

export const TikTokVideoCard = memo(function TikTokVideoCard({
  video,
  isActive,
  onUserPress,
  onMusicPress,
  onHashtagPress,
}: TikTokVideoCardProps) {
  const {
    state,
    likeVideo,
    saveVideo,
    shareVideo,
    followUser,
    openComments,
    toggleMute,
    isVideoLiked,
    isVideoSaved,
    isUserFollowed,
  } = useTikTok();

  const [showHeart, setShowHeart] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const lastTap = useRef<number>(0);

  // Video player
  const player = useVideoPlayer(video.videoUrl, (p) => {
    p.loop = true;
    p.muted = state.isMuted;
  });

  // Control playback based on active state
  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  // Sync mute state
  useEffect(() => {
    player.muted = state.isMuted;
  }, [state.isMuted, player]);

  // Double tap to like
  const handleDoubleTap = useCallback((event: any) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      const { locationX, locationY } = event.nativeEvent;
      setHeartPosition({ x: locationX, y: locationY });
      setShowHeart(true);

      if (!isVideoLiked(video.id)) {
        likeVideo(video.id);
      }

      setTimeout(() => setShowHeart(false), 1000);
    }

    lastTap.current = now;
  }, [video.id, isVideoLiked, likeVideo]);

  // Single tap to toggle play/pause
  const handleSingleTap = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const liked = isVideoLiked(video.id);
  const saved = isVideoSaved(video.id);
  const following = isUserFollowed(video.author.id);

  return (
    <View style={styles.container}>
      {/* Video */}
      <Pressable 
        style={styles.videoContainer} 
        onPress={handleDoubleTap}
      >
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Double tap heart animation */}
        {showHeart && (
          <DoubleTapHeart x={heartPosition.x} y={heartPosition.y} />
        )}
      </Pressable>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={[styles.bottomGradient, { pointerEvents: 'none' }]}
      />

      {/* Video Info */}
      <View style={styles.videoInfo}>
        {/* Author */}
        <TouchableOpacity 
          style={styles.authorRow}
          onPress={() => onUserPress?.(video.author.id)}
        >
          <Image 
            source={{ uri: video.author.avatar }} 
            style={styles.avatar}
          />
          <Text style={styles.username}>@{video.author.username}</Text>
          {video.author.verified && (
            <Ionicons name="checkmark-circle" size={14} color="#20D5EC" />
          )}
          {!following && (
            <TouchableOpacity 
              style={styles.followButton}
              onPress={() => followUser(video.author.id)}
            >
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Caption */}
        <Text style={styles.caption} numberOfLines={2}>
          {video.caption}
        </Text>

        {/* Hashtags */}
        <View style={styles.hashtagsRow}>
          {video.hashtags.slice(0, 3).map((tag, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => onHashtagPress?.(tag)}
            >
              <Text style={styles.hashtag}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Music */}
        {video.music && (
          <TouchableOpacity 
            style={styles.musicRow}
            onPress={() => video.music && onMusicPress?.(video.music.id)}
          >
            <Ionicons name="musical-notes" size={14} color="white" />
            <Text style={styles.musicText} numberOfLines={1}>
              {video.music.name} - {video.music.artist}
            </Text>
            <View style={styles.musicDisc}>
              <Image 
                source={{ uri: video.music.coverUrl || video.author.avatar }} 
                style={styles.musicDiscImage}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Bar (Right side) */}
      <TikTokActionBar
        video={video}
        liked={liked}
        saved={saved}
        onLike={() => likeVideo(video.id)}
        onComment={() => openComments(video.id)}
        onSave={() => saveVideo(video.id)}
        onShare={() => shareVideo(video.id, video)}
        onUserPress={() => onUserPress?.(video.author.id)}
      />

      {/* Mute indicator */}
      <TouchableOpacity 
        style={styles.muteButton}
        onPress={toggleMute}
      >
        <Ionicons 
          name={state.isMuted ? 'volume-mute' : 'volume-high'} 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 100,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: 10,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  followButton: {
    backgroundColor: '#FE2C55',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  followText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  hashtag: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: 'white',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  musicDisc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    marginLeft: 10,
    overflow: 'hidden',
  },
  musicDiscImage: {
    width: '100%',
    height: '100%',
  },
  muteButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TikTokVideoCard;
