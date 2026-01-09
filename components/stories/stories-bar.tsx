/**
 * Stories Feature (24h expiring stories)
 * Instagram/WhatsApp style stories
 */

import { OptimizedImage } from '@/components/ui/optimized-image';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
  viewed?: boolean;
  viewCount?: number;
  viewers?: string[];
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
}

interface StoriesBarProps {
  stories: StoryGroup[];
  onStoryPress?: (userId: string) => void;
}

export function StoriesBar({ stories, onStoryPress }: StoriesBarProps) {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const handlePress = (userId: string) => {
    if (onStoryPress) {
      onStoryPress(userId);
    } else {
      router.push(`/stories/${userId}` as any);
    }
  };

  const renderStory = ({ item }: { item: StoryGroup }) => (
    <Pressable
      style={styles.storyItem}
      onPress={() => handlePress(item.userId)}
    >
      <View
        style={[
          styles.avatarBorder,
          {
            borderColor: item.hasUnviewed ? '#000000' : borderColor,
            borderWidth: item.hasUnviewed ? 2.5 : 1.5,
          },
        ]}
      >
        <OptimizedImage
          uri={item.userAvatar}
          width={56}
          height={56}
          borderRadius={28}
          cache="force-cache"
        />
      </View>
      <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
        {item.userName}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.userId}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

interface StoryViewerProps {
  storyGroup: StoryGroup;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function StoryViewer({
  storyGroup,
  onClose,
  onNext,
  onPrevious,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = storyGroup.stories[currentIndex];

  useEffect(() => {
    const duration = 5000; // 5 seconds per story
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentIndex < storyGroup.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            // All stories finished
            onNext?.();
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    } else {
      onPrevious?.();
    }
  };

  const handleNext = () => {
    if (currentIndex < storyGroup.stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onNext?.();
    }
  };

  return (
    <View style={styles.viewerContainer}>
      {/* Progress bars */}
      <View style={styles.progressContainer}>
        {storyGroup.stories.map((_, index) => (
          <View key={index} style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${
                    index < currentIndex
                      ? 100
                      : index === currentIndex
                      ? progress
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <OptimizedImage
            uri={storyGroup.userAvatar}
            width={32}
            height={32}
            borderRadius={16}
          />
          <Text style={styles.headerUserName}>{storyGroup.userName}</Text>
          <Text style={styles.timestamp}>
            {getTimeAgo(currentStory.createdAt)}
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* Story content */}
      <OptimizedImage
        uri={currentStory.mediaUrl}
        aspectRatio={9 / 16}
        showLoader
      />

      {/* Navigation areas */}
      <Pressable style={styles.leftArea} onPress={handlePrevious} />
      <Pressable style={styles.rightArea} onPress={handleNext} />
    </View>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Just now';
  if (hours === 1) return '1h ago';
  return `${hours}h ago`;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  avatarBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    marginBottom: 4,
  },
  userName: {
    fontSize: 11,
    textAlign: 'center',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerUserName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
  },
  rightArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '60%',
  },
});
