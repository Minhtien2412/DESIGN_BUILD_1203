/**
 * Story Viewer Screen - Instagram-style Full-screen Stories
 * Features: Progress bar, tap navigation, swipe gestures, replies
 * @author AI Assistant
 * @date 03/01/2026
 */

import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Keyboard,
    PanResponder,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== STORY DATA ====================
const STORIES_DATA = [
  {
    userId: 'user_1',
    userName: 'Kiến Trúc A&A',
    userAvatar: 'https://i.pravatar.cc/150?u=company1',
    verified: true,
    stories: [
      {
        id: 's1_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
        duration: 5000,
        time: '2 giờ trước',
        caption: '🏠 Dự án biệt thự mới hoàn thành!',
        viewers: 1234,
        hasLink: true,
        linkText: 'Xem chi tiết',
        linkUrl: '/project/123',
      },
      {
        id: 's1_2',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
        duration: 5000,
        time: '2 giờ trước',
        caption: 'Góc phòng khách sang trọng ✨',
        viewers: 987,
      },
      {
        id: 's1_3',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
        duration: 5000,
        time: '1 giờ trước',
        caption: 'Sân vườn xanh mát 🌿',
        viewers: 756,
      },
    ],
  },
  {
    userId: 'user_2',
    userName: 'Nội Thất Luxury',
    userAvatar: 'https://i.pravatar.cc/150?u=company2',
    verified: true,
    stories: [
      {
        id: 's2_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
        duration: 5000,
        time: '3 giờ trước',
        caption: 'Phòng khách Earth Tone 2026 🛋️',
        viewers: 2345,
        hasLink: true,
        linkText: 'Liên hệ tư vấn',
        linkUrl: '/contact',
      },
      {
        id: 's2_2',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        duration: 5000,
        time: '3 giờ trước',
        caption: 'Không gian phòng ngủ thư giãn',
        viewers: 1876,
      },
    ],
  },
  {
    userId: 'user_3',
    userName: 'Thợ Xây Minh Khang',
    userAvatar: 'https://i.pravatar.cc/150?u=worker1',
    verified: false,
    stories: [
      {
        id: 's3_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
        duration: 5000,
        time: '5 giờ trước',
        caption: '💪 Đổ móng công trình mới!\n\n📍 Quận 2, TP.HCM',
        viewers: 567,
      },
    ],
  },
  {
    userId: 'user_4',
    userName: 'Decor Studio',
    userAvatar: 'https://i.pravatar.cc/150?u=company3',
    verified: true,
    stories: [
      {
        id: 's4_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        duration: 5000,
        time: '4 giờ trước',
        caption: '🎨 Trang trí nội thất đơn giản mà đẹp',
        viewers: 890,
      },
      {
        id: 's4_2',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
        duration: 5000,
        time: '4 giờ trước',
        caption: 'Cây xanh trong nhà 🌱',
        viewers: 654,
      },
    ],
  },
];

// ==================== MAIN COMPONENT ====================
export default function StoryViewerScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ userId?: string; index?: string }>();
  
  // Find initial user index
  const initialUserIndex = params.userId 
    ? STORIES_DATA.findIndex(s => s.userId === params.userId)
    : parseInt(params.index || '0', 10);
  
  const [currentUserIndex, setCurrentUserIndex] = useState(Math.max(0, initialUserIndex));
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const progressAnims = useRef<Animated.Value[]>([]).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  const currentUser = STORIES_DATA[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const totalStories = currentUser?.stories.length || 0;
  
  // Initialize progress animations
  useEffect(() => {
    if (currentUser) {
      while (progressAnims.length < currentUser.stories.length) {
        progressAnims.push(new Animated.Value(0));
      }
    }
  }, [currentUser, progressAnims]);
  
  // Reset progress when story changes
  useEffect(() => {
    if (!currentUser) return;
    
    // Reset all progress bars
    progressAnims.forEach((anim, index) => {
      if (index < currentStoryIndex) {
        anim.setValue(1);
      } else if (index > currentStoryIndex) {
        anim.setValue(0);
      }
    });
    
    // Animate current progress
    if (!isPaused && progressAnims[currentStoryIndex]) {
      progressAnims[currentStoryIndex].setValue(0);
      Animated.timing(progressAnims[currentStoryIndex], {
        toValue: 1,
        duration: currentStory?.duration || 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          goToNextStory();
        }
      });
    }
    
    return () => {
      if (progressAnims[currentStoryIndex]) {
        progressAnims[currentStoryIndex].stopAnimation();
      }
    };
  }, [currentStoryIndex, currentUserIndex, isPaused]);
  
  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
      setIsPaused(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      setIsPaused(false);
    });
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  
  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < STORIES_DATA.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      router.back();
    }
  }, [currentStoryIndex, currentUserIndex, totalStories]);
  
  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      const prevUserStories = STORIES_DATA[currentUserIndex - 1].stories.length;
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(prevUserStories - 1);
    }
  }, [currentStoryIndex, currentUserIndex]);
  
  const handleTap = (e: any) => {
    const x = e.nativeEvent.locationX;
    if (x < SCREEN_WIDTH / 3) {
      goToPrevStory();
    } else if (x > (SCREEN_WIDTH * 2) / 3) {
      goToNextStory();
    }
  };
  
  const handleLongPressIn = () => {
    setIsPaused(true);
  };
  
  const handleLongPressOut = () => {
    if (!isKeyboardVisible) {
      setIsPaused(false);
    }
  };
  
  // Pan responder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          opacity.setValue(1 - gestureState.dy / 400);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
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
          ]).start(() => router.back());
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;
  
  const handleReply = () => {
    if (replyText.trim()) {
      console.log('Reply to story:', replyText);
      setReplyText('');
      Keyboard.dismiss();
    }
  };
  
  const handleReaction = (emoji: string) => {
    console.log('Reaction:', emoji);
    setShowReactions(false);
  };
  
  if (!currentUser || !currentStory) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Không tìm thấy story</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          opacity,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Story Image */}
      <TouchableWithoutFeedback
        onPress={handleTap}
        onLongPress={handleLongPressIn}
        onPressOut={handleLongPressOut}
        delayLongPress={200}
      >
        <View style={styles.storyContainer}>
          <Image
            source={{ uri: currentStory.url }}
            style={styles.storyImage}
            resizeMode="cover"
          />
          
          {/* Gradient overlays */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.topGradient}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.bottomGradient}
          />
        </View>
      </TouchableWithoutFeedback>
      
      {/* Progress bars */}
      <View style={[styles.progressContainer, { top: insets.top + 8 }]}>
        {currentUser.stories.map((_, index) => (
          <View key={index} style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnims[index]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }) || '0%',
                },
              ]}
            />
          </View>
        ))}
      </View>
      
      {/* Header */}
      <View style={[styles.header, { top: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => router.push(`/profile/${currentUser.userId}` as any)}
        >
          <Image source={{ uri: currentUser.userAvatar }} style={styles.avatar} />
          <View style={styles.userTextInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{currentUser.userName}</Text>
              {currentUser.verified && (
                <Ionicons name="checkmark-circle" size={14} color="#0D9488" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.storyTime}>{currentStory.time}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Caption */}
      {currentStory.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{currentStory.caption}</Text>
        </View>
      )}
      
      {/* Link button */}
      {currentStory.hasLink && (
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push(currentStory.linkUrl as any)}
        >
          <Ionicons name="chevron-up" size={20} color="#fff" />
          <Text style={styles.linkButtonText}>{currentStory.linkText}</Text>
        </TouchableOpacity>
      )}
      
      {/* Viewers count */}
      <View style={[styles.viewersContainer, { bottom: isKeyboardVisible ? 80 : insets.bottom + 80 }]}>
        <Ionicons name="eye-outline" size={16} color="rgba(255,255,255,0.8)" />
        <Text style={styles.viewersText}>{currentStory.viewers?.toLocaleString()}</Text>
      </View>
      
      {/* Reply input */}
      <View style={[styles.replyContainer, { bottom: isKeyboardVisible ? 10 : insets.bottom + 16 }]}>
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Trả lời ${currentUser.userName}...`}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={replyText}
            onChangeText={setReplyText}
            onFocus={() => setIsPaused(true)}
            multiline
          />
          {replyText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleReply}>
              <Ionicons name="send" size={20} color="#0095f6" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.reactButton}
              onPress={() => setShowReactions(!showReactions)}
            >
              <Ionicons name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => console.log('Share story')}
        >
          <Ionicons name="paper-plane-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Quick reactions */}
      {showReactions && (
        <View style={[styles.reactionsContainer, { bottom: insets.bottom + 80 }]}>
          {['❤️', '😍', '😮', '😂', '😢', '👏', '🔥', '👍'].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionButton}
              onPress={() => handleReaction(emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Paused indicator */}
      {isPaused && !isKeyboardVisible && (
        <View style={styles.pausedOverlay}>
          <Ionicons name="pause" size={60} color="rgba(255,255,255,0.5)" />
        </View>
      )}
    </Animated.View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  
  // Story
  storyContainer: {
    flex: 1,
  },
  storyImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  
  // Progress
  progressContainer: {
    position: 'absolute',
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
  
  // Header
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userTextInfo: {},
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  storyTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Caption
  captionContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 200,
    zIndex: 10,
  },
  caption: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  
  // Link button
  linkButton: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Viewers
  viewersContainer: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  viewersText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Reply
  replyContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 10,
  },
  replyInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendButton: {
    padding: 4,
  },
  reactButton: {
    padding: 4,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Reactions
  reactionsContainer: {
    position: 'absolute',
    left: 16,
    right: 80,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 30,
    padding: 8,
    justifyContent: 'space-around',
    zIndex: 20,
  },
  reactionButton: {
    padding: 8,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  
  // Paused
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 5,
  },
});
