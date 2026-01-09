/**
 * Stories Viewer Screen
 * Full-screen story viewer with swipe navigation
 */

import type { StoryGroup } from '@/components/stories/stories-bar';
import { StoryViewer } from '@/components/stories/stories-bar';
import { viewStory } from '@/services/stories';
import StoriesService from '@/services/storiesService';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StoriesViewerScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stories from API
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const groups = await StoriesService.getStoryGroups();
      
      // Convert to StoryGroup format if needed
      const formattedGroups: StoryGroup[] = groups.map(g => ({
        userId: g.userId,
        userName: g.userName,
        userAvatar: g.userAvatar,
        hasUnviewed: g.hasUnviewed,
        stories: g.stories.map(s => ({
          id: s.id,
          userId: g.userId,
          userName: g.userName,
          userAvatar: g.userAvatar,
          mediaUrl: s.mediaUrl,
          mediaType: s.mediaType,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          viewed: s.viewed,
        })),
      }));
      
      setStoryGroups(formattedGroups);
      
      // Find starting index
      if (userId) {
        const index = formattedGroups.findIndex((g) => g.userId === userId);
        if (index !== -1) {
          setCurrentGroupIndex(index);
        }
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Không thể tải stories');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Mark stories as viewed
  useEffect(() => {
    const currentGroup = storyGroups[currentGroupIndex];
    if (currentGroup) {
      // Mark first story as viewed when opening
      const firstStory = currentGroup.stories[0];
      if (firstStory && !firstStory.viewed) {
        viewStory(firstStory.id).catch(console.error);
      }
    }
  }, [currentGroupIndex, storyGroups]);

  const handleClose = () => {
    router.back();
  };

  const handleNext = () => {
    if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    } else {
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    } else {
      router.back();
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Đang tải stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStories}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStoryGroup = storyGroups[currentGroupIndex];

  if (!currentStoryGroup) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StoryViewer
          storyGroup={currentStoryGroup}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0066CC',
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeText: {
    color: '#999',
  },
});
