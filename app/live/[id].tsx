/**
 * Live Stream Watch Screen
 * Watch live construction project broadcasts
 */

import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLiveStream } from '@/hooks/useLiveStream';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function LiveStreamWatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const {
    stream,
    comments,
    viewerCount,
    isLoading,
    isJoined,
    error,
    joinStream,
    leaveStream,
    postComment,
    sendReaction,
  } = useLiveStream({
    streamId: id,
    autoJoin: true,
    onNewComment: () => {
      // Auto scroll to bottom on new comment
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onStreamEnd: () => {
      Alert.alert('Live Ended', 'This live stream has ended.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    return () => {
      // Leave stream when unmounting
      if (isJoined) {
        leaveStream();
      }
    };
  }, [isJoined]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      await postComment(commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Failed to send comment:', error);
    }
  };

  const handleReaction = async (type: 'like' | 'love' | 'wow' | 'clap') => {
    try {
      await sendReaction(type);
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={[styles.loadingText, { color: textColor }]}>Loading stream...</Text>
      </View>
    );
  }

  if (error || !stream) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={[styles.errorText, { color: textColor }]}>{error || 'Stream not found'}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Video Player Placeholder */}
      <View style={styles.videoContainer}>
        <Text style={styles.videoPlaceholder}>📹 Live Stream Video Player</Text>
        <Text style={styles.videoSubtext}>
          URL: {stream.playbackUrl}
        </Text>
        
        {/* Live Badge */}
        <View style={styles.liveBadgeTop}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* Viewer Count */}
        <View style={styles.viewerBadge}>
          <Ionicons name="eye" size={16} color="#fff" />
          <Text style={styles.viewerText}>{viewerCount}</Text>
        </View>

        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* Stream Info Overlay */}
      <View style={styles.overlayTop}>
        <Text style={styles.streamTitle} numberOfLines={2}>
          {stream.title}
        </Text>
        <Text style={styles.hostName}>{stream.hostName}</Text>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Text style={styles.commentUser}>{item.userName}:</Text>
              <Text style={styles.commentText}>{item.message}</Text>
            </View>
          )}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Reactions Bar */}
      <View style={styles.reactionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            style={styles.reactionButton}
            onPress={() => handleReaction('like')}
          >
            <Text style={styles.reactionEmoji}>👍</Text>
          </Pressable>
          <Pressable
            style={styles.reactionButton}
            onPress={() => handleReaction('love')}
          >
            <Text style={styles.reactionEmoji}>❤️</Text>
          </Pressable>
          <Pressable
            style={styles.reactionButton}
            onPress={() => handleReaction('wow')}
          >
            <Text style={styles.reactionEmoji}>😮</Text>
          </Pressable>
          <Pressable
            style={styles.reactionButton}
            onPress={() => handleReaction('clap')}
          >
            <Text style={styles.reactionEmoji}>👏</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Comment Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            placeholderTextColor="#999"
            multiline
            maxLength={200}
          />
          <Pressable
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Ionicons name="send" size={20} color={commentText.trim() ? '#EF4444' : '#999'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholder: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  videoSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  },
  liveBadgeTop: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewerBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  viewerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 80,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    right: 16,
  },
  streamTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  hostName: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  commentsSection: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    maxHeight: 200,
  },
  commentsContent: {
    gap: 8,
  },
  commentItem: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
  },
  commentUser: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  commentText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
  },
  reactionsBar: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
  },
  reactionButton: {
    marginRight: 12,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
