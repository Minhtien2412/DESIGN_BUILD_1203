/**
 * Stories Viewer Screen
 * Full-screen story viewer with swipe navigation
 */

import type { StoryGroup } from '@/components/stories/stories-bar';
import { StoryViewer } from '@/components/stories/stories-bar';
import { viewStory } from '@/services/stories';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

// Mock data - replace with actual API call
const MOCK_STORY_GROUPS: StoryGroup[] = [
  {
    userId: '1',
    userName: 'John Builder',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    hasUnviewed: true,
    stories: [
      {
        id: 's1',
        userId: '1',
        userName: 'John Builder',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        mediaUrl: 'https://picsum.photos/1080/1920',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.5).toISOString(),
        viewed: false,
      },
      {
        id: 's2',
        userId: '1',
        userName: 'John Builder',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        mediaUrl: 'https://picsum.photos/1080/1921',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.75).toISOString(),
        viewed: false,
      },
    ],
  },
  {
    userId: '2',
    userName: 'Sarah Designer',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    hasUnviewed: true,
    stories: [
      {
        id: 's3',
        userId: '2',
        userName: 'Sarah Designer',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        mediaUrl: 'https://picsum.photos/1080/1922',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.25).toISOString(),
        viewed: false,
      },
    ],
  },
  {
    userId: '3',
    userName: 'Mike Contractor',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    hasUnviewed: false,
    stories: [
      {
        id: 's4',
        userId: '3',
        userName: 'Mike Contractor',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        mediaUrl: 'https://picsum.photos/1080/1923',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
        viewed: true,
      },
    ],
  },
];

export default function StoriesViewerScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Find starting index
  useEffect(() => {
    if (userId) {
      const index = MOCK_STORY_GROUPS.findIndex((g) => g.userId === userId);
      if (index !== -1) {
        setCurrentGroupIndex(index);
      }
    }
  }, [userId]);

  // Mark stories as viewed
  useEffect(() => {
    const currentGroup = MOCK_STORY_GROUPS[currentGroupIndex];
    if (currentGroup) {
      // Mark first story as viewed when opening
      const firstStory = currentGroup.stories[0];
      if (firstStory && !firstStory.viewed) {
        viewStory(firstStory.id).catch(console.error);
      }
    }
  }, [currentGroupIndex]);

  const handleClose = () => {
    router.back();
  };

  const handleNext = () => {
    if (currentGroupIndex < MOCK_STORY_GROUPS.length - 1) {
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

  const currentStoryGroup = MOCK_STORY_GROUPS[currentGroupIndex];

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
});
