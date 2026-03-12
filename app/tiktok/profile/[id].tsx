/**
 * TikTok User Profile Screen
 * User profile with video grid, followers, following
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import * as tiktokService from '@/services/tiktokService';
import { TikTokVideo, UserProfile } from '@/types/tiktok';
import { formatCompactNumber } from '@/utils/format';
import { HapticFeedback } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_SIZE = (SCREEN_WIDTH - 4) / 3;

type TabType = 'videos' | 'liked' | 'saved';

export default function TikTokProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Load user profile
  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await tiktokService.getUserProfile(id);
      if (response.success) {
        setUser(response.user);
        setIsFollowing(response.user.isFollowing || false);
        loadVideos('videos');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideos = async (type: TabType) => {
    try {
      const videoType = type === 'videos' ? 'uploaded' : type;
      const response = await tiktokService.getUserVideos(id!, videoType as any);
      if (response.success) {
        setVideos(response.videos);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    loadVideos(tab);
  };

  const handleFollow = async () => {
    HapticFeedback.medium();
    setIsFollowing(!isFollowing);
    try {
      await tiktokService.toggleFollowUser(id!);
    } catch (error) {
      setIsFollowing(!isFollowing); // Revert on error
    }
  };

  const handleVideoPress = (video: TikTokVideo, index: number) => {
    router.push(`../video/${video.id}` as any);
  };

  const handleMessage = () => {
    router.push(`/messages/${id}` as any);
  };

  const renderVideoItem = useCallback(
    ({ item, index }: { item: TikTokVideo; index: number }) => (
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => handleVideoPress(item, index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnailUrl || item.videoUrl }}
          style={styles.videoThumbnail}
        />
        <View style={styles.videoOverlay}>
          <Ionicons name="play" size={14} color="white" />
          <Text style={styles.viewCount}>
            {formatCompactNumber(item.viewsCount)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FE2C55" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: user.username,
          headerTintColor: '#333',
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + 50 }]}>
            {/* Avatar */}
            <Image source={{ uri: user.avatar }} style={styles.avatar} />

            {/* Username */}
            <View style={styles.usernameRow}>
              <Text style={styles.username}>@{user.username}</Text>
              {user.verified && (
                <Ionicons name="checkmark-circle" size={18} color="#20D5EC" />
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCompactNumber(user.followingCount)}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCompactNumber(user.followersCount)}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCompactNumber(user.likesCount)}
                </Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                ]}
                onPress={handleFollow}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing && styles.followingButtonText,
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleMessage}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="person-add-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Bio */}
            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

            {/* Social Links */}
            {user.socialLinks && (
              <View style={styles.socialLinks}>
                {user.socialLinks.instagram && (
                  <TouchableOpacity style={styles.socialLink}>
                    <Ionicons name="logo-instagram" size={16} color="#888" />
                    <Text style={styles.socialLinkText}>
                      {user.socialLinks.instagram}
                    </Text>
                  </TouchableOpacity>
                )}
                {user.socialLinks.youtube && (
                  <TouchableOpacity style={styles.socialLink}>
                    <Ionicons name="logo-youtube" size={16} color="#888" />
                    <Text style={styles.socialLinkText}>
                      {user.socialLinks.youtube}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                onPress={() => handleTabChange('videos')}
              >
                <Ionicons
                  name="grid-outline"
                  size={22}
                  color={activeTab === 'videos' ? '#333' : '#888'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
                onPress={() => handleTabChange('liked')}
              >
                <Ionicons
                  name="heart-outline"
                  size={22}
                  color={activeTab === 'liked' ? '#333' : '#888'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
                onPress={() => handleTabChange('saved')}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={22}
                  color={activeTab === 'saved' ? '#333' : '#888'}
                />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
  },
  headerButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  followButton: {
    backgroundColor: '#FE2C55',
    paddingHorizontal: 48,
    paddingVertical: 12,
    borderRadius: 4,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#333',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bio: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialLinkText: {
    fontSize: 13,
    color: '#888',
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#333',
  },
  listContent: {
    paddingBottom: 100,
  },
  videoItem: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE * 1.3,
    margin: 0.5,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
  },
});
