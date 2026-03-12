/**
 * TikTok User Profile Card
 * Compact user profile with follow button
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { TikTokUser } from '@/types/tiktok';
import { formatCompactNumber } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TikTokUserCardProps {
  user: TikTokUser;
  isFollowing: boolean;
  onPress?: () => void;
  onFollow?: () => void;
  compact?: boolean;
}

export const TikTokUserCard = memo(function TikTokUserCard({
  user,
  isFollowing,
  onPress,
  onFollow,
  compact = false,
}: TikTokUserCardProps) {
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
        <Image source={{ uri: user.avatar }} style={styles.compactAvatar} />
        <View style={styles.compactInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.compactName} numberOfLines={1}>
              {user.displayName}
            </Text>
            {user.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#20D5EC" />
            )}
          </View>
          <Text style={styles.compactUsername}>@{user.username}</Text>
        </View>
        {onFollow && (
          <TouchableOpacity
            style={[
              styles.compactFollowButton,
              isFollowing && styles.followingButton,
            ]}
            onPress={onFollow}
          >
            <Text style={[
              styles.compactFollowText,
              isFollowing && styles.followingText,
            ]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {user.displayName}
          </Text>
          {user.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#20D5EC" />
          )}
        </View>
        <Text style={styles.username}>@{user.username}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{formatCompactNumber(user.followersCount)}</Text> Followers
          </Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{formatCompactNumber(user.likesCount)}</Text> Likes
          </Text>
        </View>
      </View>
      {onFollow && (
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={onFollow}
        >
          <Text style={[styles.followText, isFollowing && styles.followingText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statText: {
    fontSize: 13,
    color: '#888',
  },
  statNumber: {
    fontWeight: '600',
    color: '#333',
  },
  statDot: {
    marginHorizontal: 6,
    color: '#888',
  },
  followButton: {
    backgroundColor: '#FE2C55',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  followText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  followingText: {
    color: '#333',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  compactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  compactUsername: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },
  compactFollowButton: {
    backgroundColor: '#FE2C55',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  compactFollowText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default TikTokUserCard;
