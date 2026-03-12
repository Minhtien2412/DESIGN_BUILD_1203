/**
 * TikTok Action Bar Component
 * Right-side action buttons: Like, Comment, Save, Share
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { TikTokVideo } from '@/types/tiktok';
import { formatCompactNumber } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { memo, useRef } from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TikTokActionBarProps {
  video: TikTokVideo;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
  onUserPress: () => void;
}

export const TikTokActionBar = memo(function TikTokActionBar({
  video,
  liked,
  saved,
  onLike,
  onComment,
  onSave,
  onShare,
  onUserPress,
}: TikTokActionBarProps) {
  const likeScale = useRef(new Animated.Value(1)).current;

  // Animate like button when liked
  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.3,
        useNativeDriver: true,
        friction: 3,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }),
    ]).start();
    onLike();
  };

  return (
    <View style={styles.container}>
      {/* User Avatar */}
      <TouchableOpacity style={styles.avatarContainer} onPress={onUserPress}>
        <Image
          source={{ uri: video.author.avatar }}
          style={styles.avatar}
        />
        <View style={styles.followBadge}>
          <Ionicons name="add" size={12} color="white" />
        </View>
      </TouchableOpacity>

      {/* Like */}
      <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={35}
            color={liked ? '#FE2C55' : 'white'}
          />
        </Animated.View>
        <Text style={styles.actionText}>
          {formatCompactNumber(video.likesCount + (liked && !video.isLiked ? 1 : 0))}
        </Text>
      </TouchableOpacity>

      {/* Comment */}
      <TouchableOpacity style={styles.actionButton} onPress={onComment}>
        <Ionicons name="chatbubble-ellipses" size={32} color="white" />
        <Text style={styles.actionText}>
          {formatCompactNumber(video.commentsCount)}
        </Text>
      </TouchableOpacity>

      {/* Save/Bookmark */}
      <TouchableOpacity style={styles.actionButton} onPress={onSave}>
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={32}
          color={saved ? '#FFFC00' : 'white'}
        />
        <Text style={styles.actionText}>
          {formatCompactNumber(video.savesCount + (saved && !video.isSaved ? 1 : 0))}
        </Text>
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity style={styles.actionButton} onPress={onShare}>
        <Ionicons name="arrow-redo" size={32} color="white" />
        <Text style={styles.actionText}>
          {formatCompactNumber(video.sharesCount)}
        </Text>
      </TouchableOpacity>

      {/* Music Disc */}
      {video.music && (
        <View style={styles.musicDiscContainer}>
          <View style={styles.musicDisc}>
            <Image
              source={{ uri: video.music.coverUrl || video.author.avatar }}
              style={styles.musicDiscImage}
            />
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    bottom: 120,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FE2C55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicDiscContainer: {
    marginTop: 10,
  },
  musicDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#1a1a1a',
  },
  musicDiscImage: {
    width: '100%',
    height: '100%',
  },
});
