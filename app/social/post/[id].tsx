/**
 * Post Detail Screen
 * Full post view with comments
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { CommentSection, PostCard } from '@/components/social';
import { SocialProvider, useSocial } from '@/context/SocialContext';
import { Post } from '@/types/social';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function PostDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state, loadFeed } = useSocial();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Find post in feed or fetch
  useEffect(() => {
    const findPost = () => {
      // Check in home feed
      const homeFeed = state.feeds['news_feed'];
      const posts = homeFeed?.posts || [];
      const found = posts.find((p: Post) => p.id === id);
      
      if (found) {
        setPost(found);
        setIsLoading(false);
      } else {
        // TODO: Fetch single post from API
        // For now, simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    findPost();
  }, [id, state.feeds]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#BCC0C4" />
        <Text style={styles.errorTitle}>Không tìm thấy bài viết</Text>
        <Text style={styles.errorSubtitle}>
          Bài viết có thể đã bị xóa hoặc bạn không có quyền xem
        </Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Post */}
        <PostCard
          post={post}
          onAuthorPress={() => router.push(`/social/profile/${post.author.id}` as any)}
        />

        {/* Divider */}
        <View style={styles.divider} />
      </ScrollView>

      {/* Comments Section */}
      <View style={[styles.commentsContainer, { paddingBottom: insets.bottom }]}>
        <CommentSection
          postId={post.id}
          initialCommentsCount={post.commentsCount}
        />
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bài viết',
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#050505" />
            </TouchableOpacity>
          ),
        }}
      />
      <SocialProvider>
        <PostDetailContent />
      </SocialProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#050505',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 15,
    color: '#65676B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: '#1877F2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  divider: {
    height: 8,
    backgroundColor: '#F0F2F5',
  },
  commentsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
    maxHeight: '60%',
  },
});
