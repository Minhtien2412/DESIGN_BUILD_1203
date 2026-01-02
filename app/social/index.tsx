/**
 * Social Feed - Main Screen
 * Facebook-style news feed with posts and stories
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import {
    PostCard,
    PostComposer,
    StoriesList,
} from '@/components/social';
import { useAuth } from '@/context/AuthContext';
import { SocialProvider, useSocial } from '@/context/SocialContext';
import { Post } from '@/types/social';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Feed Header with Create Post shortcut
function FeedHeader({ onCreatePost }: { onCreatePost: () => void }) {
  const { user } = useAuth();
  
  return (
    <View style={styles.feedHeader}>
      <Image
        source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }}
        style={styles.headerAvatar}
      />
      <TouchableOpacity style={styles.createPostInput} onPress={onCreatePost}>
        <Text style={styles.createPostPlaceholder}>Bạn đang nghĩ gì?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerAction}>
        <Ionicons name="images" size={24} color="#45BD62" />
      </TouchableOpacity>
    </View>
  );
}

// Divider
function Divider() {
  return <View style={styles.divider} />;
}

// Main Feed Content
function FeedContent() {
  const insets = useSafeAreaInsets();
  const { state, loadFeed, refreshFeed, loadStories } = useSocial();
  const [isComposerVisible, setComposerVisible] = useState(false);

  // Load initial data
  useEffect(() => {
    loadFeed(); // Uses default 'news_feed'
    loadStories();
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshFeed(),
      loadStories(),
    ]);
  }, [refreshFeed, loadStories]);

  // Load more
  const handleLoadMore = useCallback(() => {
    const currentTimeline = state.feeds[state.currentFeed];
    if (!state.isLoading && currentTimeline?.hasMore) {
      loadFeed();
    }
  }, [state.isLoading, state.feeds, state.currentFeed, loadFeed]);

  // Open composer
  const handleCreatePost = useCallback(() => {
    setComposerVisible(true);
  }, []);

  // Close composer
  const handleCloseComposer = useCallback(() => {
    setComposerVisible(false);
  }, []);

  // Render post
  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onPress={() => router.push(`/social/post/${item.id}` as any)}
        onAuthorPress={() => router.push(`/social/profile/${item.author.id}` as any)}
      />
    ),
    []
  );

  // Render header
  const renderHeader = useCallback(
    () => (
      <>
        <StoriesList
          stories={state.stories}
          onStoryPress={(story) => console.log('Story:', story.id)}
          onCreateStory={() => console.log('Create story')}
        />
        <Divider />
        <FeedHeader onCreatePost={handleCreatePost} />
        <Divider />
      </>
    ),
    [state.stories, handleCreatePost]
  );

  // Render footer
  const renderFooter = useCallback(() => {
    if (!state.isLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1877F2" />
      </View>
    );
  }, [state.isLoading]);

  // Empty state
  const renderEmpty = useCallback(() => {
    if (state.isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={64} color="#BCC0C4" />
        <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
        <Text style={styles.emptySubtitle}>
          Kết nối với bạn bè để xem bài viết của họ tại đây
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleCreatePost}>
          <Text style={styles.emptyButtonText}>Tạo bài viết đầu tiên</Text>
        </TouchableOpacity>
      </View>
    );
  }, [state.isLoading, handleCreatePost]);

  // Get posts from current feed
  const currentTimeline = state.feeds[state.currentFeed];
  const posts = currentTimeline?.posts || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={Divider}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            colors={['#1877F2']}
            tintColor="#1877F2"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 16 },
        ]}
      />

      {/* Post Composer Modal */}
      <PostComposer
        visible={isComposerVisible}
        onClose={handleCloseComposer}
      />
    </View>
  );
}

// Main Screen with Provider
export default function SocialFeedScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bảng tin',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="search" size={24} color="#050505" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#050505" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SocialProvider>
        <FeedContent />
      </SocialProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  listContent: {
    flexGrow: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  createPostInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  createPostPlaceholder: {
    fontSize: 16,
    color: '#65676B',
  },
  headerAction: {
    padding: 8,
  },
  divider: {
    height: 8,
    backgroundColor: '#F0F2F5',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#050505',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#65676B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: '#1877F2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
