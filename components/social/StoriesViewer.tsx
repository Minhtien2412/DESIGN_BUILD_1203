/**
 * Stories Viewer - Facebook/Instagram Style
 * ==========================================
 * Features:
 * - Swipe left/right to navigate stories
 * - Tap left/right side to go prev/next
 * - Long press to pause
 * - Swipe down to close
 * - Auto-progress with timer
 * - Progress bars at top
 * 
 * @updated 2026-01-05
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Story {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number; // seconds
  timestamp: string;
  viewed?: boolean;
}

interface StoriesViewerProps {
  visible: boolean;
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onStoryComplete?: (storyId: number) => void;
}

export function StoriesViewer({
  visible,
  stories,
  initialIndex = 0,
  onClose,
  onStoryComplete,
}: StoriesViewerProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStory = stories[currentIndex];
  const storyDuration = (currentStory?.duration || 5) * 1000; // Convert to ms

  // Auto-progress timer
  useEffect(() => {
    if (!visible || isPaused) return;

    progressAnim.setValue(0);
    setProgress(0);

    const startTime = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / storyDuration, 1);
      setProgress(newProgress);
      progressAnim.setValue(newProgress);

      if (newProgress >= 1) {
        handleNext();
      }
    }, 16); // ~60fps

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [visible, currentIndex, isPaused, storyDuration]);

  // Navigate to next story
  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      onStoryComplete?.(currentStory.id);
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      // End of stories
      onClose();
    }
  }, [currentIndex, stories.length, onClose, onStoryComplete, currentStory]);

  // Navigate to previous story
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Tap left/right navigation
  const handleTap = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    if (locationX < SCREEN_WIDTH / 3) {
      handlePrevious();
    } else if (locationX > (SCREEN_WIDTH * 2) / 3) {
      handleNext();
    }
  }, [handlePrevious, handleNext]);

  // Long press to pause
  const handleLongPressIn = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsPaused(true);
      Animated.timing(opacity, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 200);
  }, [opacity]);

  const handleLongPressOut = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPaused(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  // Swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const opacityValue = 1 - gestureState.dy / SCREEN_HEIGHT;
          opacity.setValue(Math.max(opacityValue, 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          // Swipe down to close
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose();
            translateY.setValue(0);
            opacity.setValue(1);
          });
        } else {
          // Snap back
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Swipe left/right to change user's stories
  const swipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          // Swipe right - previous
          handlePrevious();
        } else if (gestureState.dx < -100) {
          // Swipe left - next
          handleNext();
        }
      },
    })
  ).current;

  if (!visible || !currentStory) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Background Image */}
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient Overlays */}
        <View style={styles.topGradient} />
        <View style={styles.bottomGradient} />

        {/* Progress Bars */}
        <View style={[styles.progressContainer, { paddingTop: insets.top + 10 }]}>
          {stories.map((story, index) => (
            <View key={story.id} style={styles.progressBarWrapper}>
              <View style={styles.progressBarBackground} />
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      index < currentIndex
                        ? '100%'
                        : index === currentIndex
                        ? progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 50 }]}>
          <Image source={{ uri: currentStory.userAvatar }} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{currentStory.userName}</Text>
            <Text style={styles.timestamp}>{currentStory.timestamp}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tap Zones */}
        <View style={styles.tapZones} {...swipeResponder.panHandlers}>
          {/* Left zone - Previous */}
          <TouchableWithoutFeedback
            onPress={handleTap}
            onPressIn={handleLongPressIn}
            onPressOut={handleLongPressOut}
          >
            <View style={[styles.tapZone, styles.leftZone]} />
          </TouchableWithoutFeedback>

          {/* Right zone - Next */}
          <TouchableWithoutFeedback
            onPress={handleTap}
            onPressIn={handleLongPressIn}
            onPressOut={handleLongPressOut}
          >
            <View style={[styles.tapZone, styles.rightZone]} />
          </TouchableWithoutFeedback>
        </View>

        {/* Pause Indicator */}
        {isPaused && (
          <View style={styles.pauseIndicator}>
            <Ionicons name="pause" size={40} color="#fff" />
          </View>
        )}

        {/* Reply Input (Bottom) */}
        <View style={[styles.replyContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity style={styles.replyInput}>
            <Text style={styles.replyPlaceholder}>Trả lời {currentStory.userName}...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyButton}>
            <Ionicons name="heart-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 4,
    zIndex: 10,
  },
  progressBarWrapper: {
    flex: 1,
    height: 2,
    position: 'relative',
  },
  progressBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  leftZone: {
    // Left third for previous
  },
  rightZone: {
    // Right two-thirds for next
    flex: 2,
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  replyInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  replyPlaceholder: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  replyButton: {
    padding: 8,
  },
});
