/**
 * Enhanced Message Bubble Component - Zalo-style
 * Features: Reactions, Reply, Forward, Read receipts, Typing indicator
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Reaction emojis like Zalo
const REACTIONS = ['❤️', '😆', '😮', '😢', '😡', '👍'];

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio' | 'location';
  url: string;
  name?: string;
  size?: number;
  duration?: number; // For audio/video
  thumbnail?: string;
  latitude?: number;
  longitude?: number;
}

export interface ReplyMessage {
  id: string;
  text: string;
  senderName: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  reacted: boolean; // Current user reacted
}

export interface MessageBubbleEnhancedProps {
  id: string;
  text: string;
  mine?: boolean;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  senderName?: string;
  senderAvatar?: string;
  attachments?: MessageAttachment[];
  replyTo?: ReplyMessage;
  reactions?: MessageReaction[];
  isForwarded?: boolean;
  showSender?: boolean; // For group chats
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onLongPress?: (messageId: string) => void;
  onImagePress?: (attachment: MessageAttachment) => void;
}

export default function MessageBubbleEnhanced({
  id,
  text,
  mine = false,
  timestamp,
  status = 'sent',
  senderName,
  senderAvatar,
  attachments = [],
  replyTo,
  reactions = [],
  isForwarded = false,
  showSender = false,
  onReply,
  onForward,
  onReact,
  onLongPress,
  onImagePress,
}: MessageBubbleEnhancedProps) {
  const [showReactions, setShowReactions] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;

  const primary = useThemeColor({}, 'primary');
  const text_color = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surface = useThemeColor({}, 'surface');
  const background = useThemeColor({}, 'background');

  // Format timestamp
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color={textMuted} />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color={textMuted} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color={textMuted} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color="#3B82F6" />;
      case 'failed':
        return <Ionicons name="alert-circle" size={12} color="#EF4444" />;
      default:
        return null;
    }
  };

  // Handle long press - show reaction picker
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReactions(true);
    
    Animated.spring(reactionAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    onLongPress?.(id);
  };

  // Handle reaction select
  const handleReaction = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReact?.(id, emoji);
    
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setShowReactions(false);
    Animated.timing(reactionAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  // Render attachments
  const renderAttachments = () => {
    if (attachments.length === 0) return null;

    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment, index) => {
          switch (attachment.type) {
            case 'image':
              return (
                <Pressable
                  key={attachment.id}
                  onPress={() => onImagePress?.(attachment)}
                  style={styles.imageAttachment}
                >
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                </Pressable>
              );
            case 'video':
              return (
                <Pressable
                  key={attachment.id}
                  onPress={() => onImagePress?.(attachment)}
                  style={styles.videoAttachment}
                >
                  <Image
                    source={{ uri: attachment.thumbnail || attachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={32} color="#fff" />
                  </View>
                  {attachment.duration && (
                    <Text style={styles.videoDuration}>
                      {Math.floor(attachment.duration / 60)}:{String(attachment.duration % 60).padStart(2, '0')}
                    </Text>
                  )}
                </Pressable>
              );
            case 'file':
              return (
                <View key={attachment.id} style={[styles.fileAttachment, { backgroundColor: surface }]}>
                  <Ionicons name="document" size={24} color={primary} />
                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: text_color }]} numberOfLines={1}>
                      {attachment.name || 'File'}
                    </Text>
                    {attachment.size && (
                      <Text style={[styles.fileSize, { color: textMuted }]}>
                        {(attachment.size / 1024).toFixed(1)} KB
                      </Text>
                    )}
                  </View>
                  <Ionicons name="download-outline" size={20} color={primary} />
                </View>
              );
            case 'audio':
              return (
                <View key={attachment.id} style={[styles.audioAttachment, { backgroundColor: surface }]}>
                  <Pressable style={styles.audioPlayBtn}>
                    <Ionicons name="play" size={20} color="#fff" />
                  </Pressable>
                  <View style={styles.audioWaveform}>
                    {[...Array(20)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveBar,
                          { height: Math.random() * 20 + 5, backgroundColor: primary },
                        ]}
                      />
                    ))}
                  </View>
                  {attachment.duration && (
                    <Text style={[styles.audioDuration, { color: textMuted }]}>
                      {Math.floor(attachment.duration / 60)}:{String(attachment.duration % 60).padStart(2, '0')}
                    </Text>
                  )}
                </View>
              );
            case 'location':
              return (
                <View key={attachment.id} style={styles.locationAttachment}>
                  <View style={styles.locationMap}>
                    <Ionicons name="location" size={32} color="#EF4444" />
                  </View>
                  <Text style={[styles.locationText, { color: text_color }]}>
                    📍 Vị trí được chia sẻ
                  </Text>
                </View>
              );
            default:
              return null;
          }
        })}
      </View>
    );
  };

  // Render reactions
  const renderReactions = () => {
    if (reactions.length === 0) return null;

    return (
      <View style={[styles.reactionsContainer, mine && styles.reactionsContainerMine]}>
        {reactions.map((reaction, index) => (
          <Pressable
            key={index}
            style={[
              styles.reactionBadge,
              reaction.reacted && styles.reactionBadgeActive,
            ]}
            onPress={() => onReact?.(id, reaction.emoji)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, mine && styles.containerMine]}>
      {/* Avatar for others */}
      {!mine && showSender && (
        <View style={styles.avatarContainer}>
          {senderAvatar ? (
            <Image source={{ uri: senderAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: primary + '20' }]}>
              <Text style={[styles.avatarText, { color: primary }]}>
                {senderName?.charAt(0) || '?'}
              </Text>
            </View>
          )}
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }], maxWidth: '80%' }}>
        {/* Sender name (group chat) */}
        {!mine && showSender && senderName && (
          <Text style={[styles.senderName, { color: primary }]}>{senderName}</Text>
        )}

        {/* Forwarded indicator */}
        {isForwarded && (
          <View style={styles.forwardedBadge}>
            <Ionicons name="arrow-redo" size={12} color={textMuted} />
            <Text style={[styles.forwardedText, { color: textMuted }]}>Đã chuyển tiếp</Text>
          </View>
        )}

        {/* Reply preview */}
        {replyTo && (
          <View style={[styles.replyPreview, { backgroundColor: mine ? 'rgba(255,255,255,0.2)' : surface }]}>
            <View style={[styles.replyBar, { backgroundColor: primary }]} />
            <View style={styles.replyContent}>
              <Text style={[styles.replySender, { color: primary }]}>{replyTo.senderName}</Text>
              <Text style={[styles.replyText, { color: mine ? '#fff' : textMuted }]} numberOfLines={1}>
                {replyTo.text}
              </Text>
            </View>
          </View>
        )}

        {/* Message bubble */}
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={300}
          style={[
            styles.bubble,
            mine ? [styles.bubbleMine, { backgroundColor: primary }] : [styles.bubbleOther, { backgroundColor: surface }],
          ]}
        >
          {/* Attachments */}
          {renderAttachments()}

          {/* Text content */}
          {text && (
            <Text style={[styles.messageText, { color: mine ? '#fff' : text_color }]}>
              {text}
            </Text>
          )}

          {/* Time & Status */}
          <View style={styles.metaRow}>
            <Text style={[styles.timeText, { color: mine ? 'rgba(255,255,255,0.7)' : textMuted }]}>
              {formatTime(timestamp)}
            </Text>
            {mine && getStatusIcon()}
          </View>
        </Pressable>

        {/* Reactions */}
        {renderReactions()}

        {/* Reaction Picker */}
        {showReactions && (
          <Animated.View
            style={[
              styles.reactionPicker,
              {
                opacity: reactionAnim,
                transform: [
                  { scale: reactionAnim },
                  { translateY: reactionAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}
          >
            {REACTIONS.map((emoji, index) => (
              <Pressable
                key={index}
                style={styles.reactionOption}
                onPress={() => handleReaction(emoji)}
              >
                <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* Quick actions (Reply/Forward) */}
      {!showReactions && (
        <View style={[styles.quickActions, mine && styles.quickActionsMine]}>
          <Pressable style={styles.quickActionBtn} onPress={() => onReply?.(id)}>
            <Ionicons name="arrow-undo" size={16} color={textMuted} />
          </Pressable>
          <Pressable style={styles.quickActionBtn} onPress={() => onForward?.(id)}>
            <Ionicons name="arrow-redo" size={16} color={textMuted} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// Typing Indicator Component
export function TypingIndicator({ users }: { users: string[] }) {
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animateDots = () => {
      Animated.stagger(150, [
        Animated.sequence([
          Animated.timing(dotAnim1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotAnim1, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotAnim2, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotAnim3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animateDots());
    };

    animateDots();
  }, []);

  if (users.length === 0) return null;

  const displayText = users.length === 1
    ? `${users[0]} đang nhập...`
    : users.length === 2
    ? `${users[0]} và ${users[1]} đang nhập...`
    : `${users[0]} và ${users.length - 1} người khác đang nhập...`;

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingDots}>
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dotAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dotAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dotAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]} />
      </View>
      <Text style={styles.typingText}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  containerMine: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 4,
  },
  forwardedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    marginLeft: 4,
  },
  forwardedText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  replyPreview: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  replyBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replySender: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 12,
    marginTop: 2,
  },
  bubble: {
    borderRadius: 16,
    padding: 10,
    minWidth: 60,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
  },
  attachmentsContainer: {
    marginBottom: 8,
    gap: 8,
  },
  imageAttachment: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.45,
    borderRadius: 12,
  },
  videoAttachment: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  audioAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    gap: 12,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 30,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  audioDuration: {
    fontSize: 12,
  },
  locationAttachment: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  locationMap: {
    width: SCREEN_WIDTH * 0.5,
    height: 100,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    padding: 8,
    fontSize: 13,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionsContainerMine: {
    justifyContent: 'flex-end',
    marginRight: 4,
    marginLeft: 0,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reactionBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  reactionPicker: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  reactionOption: {
    padding: 6,
  },
  reactionOptionEmoji: {
    fontSize: 24,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    opacity: 0.6,
  },
  quickActionsMine: {
    marginLeft: 0,
    marginRight: 4,
  },
  quickActionBtn: {
    padding: 4,
  },
  // Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  typingText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
