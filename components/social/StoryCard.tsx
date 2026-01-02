/**
 * StoryCard Component
 * Instagram/Facebook-style story cards
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useAuth } from '@/context/AuthContext';
import { Story } from '@/types/social';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface StoriesListProps {
  stories: Story[];
  onStoryPress?: (story: Story) => void;
  onCreateStory?: () => void;
}

interface StoryCardProps {
  story: Story;
  onPress?: (story: Story) => void;
}

interface CreateStoryCardProps {
  onPress?: () => void;
}

// Create Story Card
const CreateStoryCard = memo(function CreateStoryCardComponent({
  onPress,
}: CreateStoryCardProps) {
  const { user } = useAuth();

  const handlePress = useCallback(() => {
    lightImpact();
    onPress?.();
  }, [onPress]);

  return (
    <TouchableOpacity style={styles.storyCard} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.createStoryImageContainer}>
        <Image
          source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
          style={styles.createStoryImage}
        />
        <View style={styles.createStoryBottom}>
          <View style={styles.createStoryButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.createStoryText}>Tạo tin</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Single Story Card
const StoryCard = memo(function StoryCardComponent({ story, onPress }: StoryCardProps) {
  const handlePress = useCallback(() => {
    lightImpact();
    onPress?.(story);
  }, [story, onPress]);

  // Get thumbnail from first media item
  const mediaItems = Array.isArray(story.media) ? story.media : [];
  const thumbnail = mediaItems[0]?.url || 'https://via.placeholder.com/200';
  const isVideo = mediaItems[0]?.type === 'video';

  return (
    <TouchableOpacity style={styles.storyCard} onPress={handlePress} activeOpacity={0.8}>
      <Image source={{ uri: thumbnail }} style={styles.storyImage} />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.5)']}
        style={styles.storyGradient}
      />

      {/* Video indicator */}
      {isVideo && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play" size={12} color="#FFFFFF" />
        </View>
      )}

      {/* Author avatar */}
      <View style={[styles.storyAvatarContainer, !story.hasViewed && styles.storyAvatarUnviewed]}>
        <Image
          source={{ uri: story.author.avatar || 'https://via.placeholder.com/32' }}
          style={styles.storyAvatar}
        />
      </View>

      {/* Author name */}
      <Text style={styles.storyAuthorName} numberOfLines={2}>
        {story.author.displayName}
      </Text>
    </TouchableOpacity>
  );
});

// Stories List
function StoriesListComponent({ stories, onStoryPress, onCreateStory }: StoriesListProps) {
  const handleStoryPress = useCallback(
    (story: Story) => {
      if (onStoryPress) {
        onStoryPress(story);
      } else {
        // Default: Navigate to story viewer
        router.push(`/stories/${story.id}` as any);
      }
    },
    [onStoryPress]
  );

  const handleCreateStory = useCallback(() => {
    if (onCreateStory) {
      onCreateStory();
    } else {
      // Default: Navigate to story creator
      router.push('/stories/create' as any);
    }
  }, [onCreateStory]);

  const renderItem = useCallback(
    ({ item, index }: { item: Story; index: number }) => (
      <StoryCard
        story={item}
        onPress={handleStoryPress}
      />
    ),
    [handleStoryPress]
  );

  const keyExtractor = useCallback((item: Story) => item.id, []);

  const renderHeader = useCallback(
    () => <CreateStoryCard onPress={handleCreateStory} />,
    [handleCreateStory]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesList}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

// Compact Stories Row (smaller version for feed)
interface CompactStoriesProps {
  stories: Story[];
  onPress?: (story: Story) => void;
}

function CompactStoriesComponent({ stories, onPress }: CompactStoriesProps) {
  const renderItem = useCallback(
    ({ item }: { item: Story }) => (
      <TouchableOpacity
        style={styles.compactStory}
        onPress={() => onPress?.(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.compactAvatarRing, !item.hasViewed && styles.compactAvatarUnviewed]}>
          <Image
            source={{ uri: item.author.avatar || 'https://via.placeholder.com/50' }}
            style={styles.compactAvatar}
          />
        </View>
        <Text style={styles.compactName} numberOfLines={1}>
          {item.author.displayName.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    ),
    [onPress]
  );

  const keyExtractor = useCallback((item: Story) => item.id, []);

  return (
    <FlatList
      data={stories}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.compactList}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  storiesList: {
    paddingHorizontal: 8,
    gap: 8,
  },
  storyCard: {
    width: 110,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E4E6EB',
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storyGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  storyAvatarContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: 2,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  storyAvatarUnviewed: {
    backgroundColor: '#1877F2',
  },
  storyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyAuthorName: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Create Story Card
  createStoryImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  createStoryImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  createStoryBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  createStoryButton: {
    position: 'absolute',
    top: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  createStoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#050505',
    marginTop: 4,
  },

  // Compact Stories
  compactList: {
    paddingHorizontal: 12,
    gap: 12,
  },
  compactStory: {
    alignItems: 'center',
    width: 64,
  },
  compactAvatarRing: {
    padding: 2,
    borderRadius: 34,
    backgroundColor: '#E4E6EB',
  },
  compactAvatarUnviewed: {
    backgroundColor: '#1877F2',
  },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  compactName: {
    fontSize: 12,
    color: '#65676B',
    marginTop: 4,
    textAlign: 'center',
  },
});

export const StoriesList = memo(StoriesListComponent);
export const CompactStories = memo(CompactStoriesComponent);
export { StoryCard };
export default StoriesList;
