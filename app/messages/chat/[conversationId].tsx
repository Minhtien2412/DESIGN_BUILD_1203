/**
 * Zalo-style Chat Screen
 * Màn hình chat chi tiết kiểu Zalo
 * Tích hợp voice messages, reactions, call history
 * + Badge sync với UnifiedBadgeContext
 * 
 * @author AI Assistant
 * @date 03/01/2026
 */

import Avatar from '@/components/ui/avatar';
import { useUnifiedBadge } from '@/context/UnifiedBadgeContext';
import { UnifiedMessage, useUnifiedMessaging } from '@/hooks/crm/useUnifiedMessaging';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75;

// ==================== THEME ====================

const COLORS = {
  primary: '#0068FF',
  background: '#F0F2F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E5E5',
  bubbleSent: '#0068FF',
  bubbleReceived: '#FFFFFF',
  textSent: '#FFFFFF',
  textReceived: '#1A1A1A',
  online: '#0066CC',
  reaction: '#FEF3C7',
  missed: '#000000',
  call: '#0066CC',
};

// ==================== MESSAGE BUBBLE ====================

interface MessageBubbleProps {
  message: UnifiedMessage;
  isFromMe: boolean;
  showAvatar: boolean;
  showTime: boolean;
  onLongPress: () => void;
  onReaction: (emoji: string) => void;
}

function MessageBubble({ 
  message, 
  isFromMe, 
  showAvatar, 
  showTime,
  onLongPress,
  onReaction,
}: MessageBubbleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Delivery status icon
  const renderDeliveryStatus = () => {
    if (!isFromMe) return null;

    const iconName = {
      sending: 'time-outline',
      sent: 'checkmark',
      delivered: 'checkmark-done',
      read: 'checkmark-done',
      failed: 'close-circle',
    }[message.deliveryStatus] || 'checkmark';

    const iconColor = message.deliveryStatus === 'read' 
      ? COLORS.primary 
      : message.deliveryStatus === 'failed'
      ? COLORS.missed
      : isFromMe ? 'rgba(255,255,255,0.7)' : COLORS.textTertiary;

    return (
      <Ionicons 
        name={iconName as any} 
        size={14} 
        color={iconColor}
        style={styles.deliveryIcon}
      />
    );
  };

  // Render message content based on type
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: message.mediaUrl || message.thumbnail }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            {message.content && (
              <Text style={[styles.imageCaption, isFromMe && styles.textSent]}>
                {message.content}
              </Text>
            )}
          </View>
        );

      case 'voice':
        return (
          <View style={styles.voiceContainer}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={20} color={isFromMe ? COLORS.textSent : COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.waveform}>
              {/* Simplified waveform visualization */}
              {[...Array(20)].map((_, i) => (
                <View 
                  key={i}
                  style={[
                    styles.waveformBar,
                    { 
                      height: Math.random() * 20 + 5,
                      backgroundColor: isFromMe ? 'rgba(255,255,255,0.5)' : COLORS.primary,
                    },
                  ]} 
                />
              ))}
            </View>
            <Text style={[styles.voiceDuration, isFromMe && styles.textSent]}>
              {formatDuration(message.audioDuration || 0)}
            </Text>
          </View>
        );

      case 'file':
        return (
          <View style={styles.fileContainer}>
            <View style={[styles.fileIcon, !isFromMe && { backgroundColor: COLORS.primary }]}>
              <Ionicons 
                name="document-outline" 
                size={24} 
                color={isFromMe ? COLORS.primary : '#FFFFFF'} 
              />
            </View>
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, isFromMe && styles.textSent]} numberOfLines={1}>
                {message.fileName || 'File'}
              </Text>
              <Text style={[styles.fileSize, isFromMe && { color: 'rgba(255,255,255,0.7)' }]}>
                {formatFileSize(message.fileSize || 0)}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons 
                name="download-outline" 
                size={22} 
                color={isFromMe ? '#FFFFFF' : COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
        );

      case 'call':
      case 'video_call':
        const isMissed = message.callStatus === 'missed';
        const isVideo = message.callType === 'video';
        const iconName = isVideo ? 'videocam' : 'call';
        
        return (
          <View style={styles.callContainer}>
            <View style={[
              styles.callIcon, 
              { backgroundColor: isMissed ? COLORS.missed : COLORS.call }
            ]}>
              <Ionicons name={iconName} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.callInfo}>
              <Text style={[styles.callText, isFromMe && styles.textSent]}>
                {isVideo ? 'Cuộc gọi video' : 'Cuộc gọi thoại'}
              </Text>
              <Text style={[styles.callStatus, isFromMe && { color: 'rgba(255,255,255,0.7)' }]}>
                {isMissed 
                  ? 'Cuộc gọi nhỡ' 
                  : `${formatDuration(message.callDuration || 0)}`
                }
              </Text>
            </View>
            {!isMissed && (
              <TouchableOpacity style={styles.callbackButton}>
                <Ionicons 
                  name={iconName} 
                  size={20} 
                  color={isFromMe ? '#FFFFFF' : COLORS.primary} 
                />
              </TouchableOpacity>
            )}
          </View>
        );

      default:
        return (
          <Text style={[styles.messageText, isFromMe && styles.textSent]}>
            {message.content}
          </Text>
        );
    }
  };

  // Reply preview
  const renderReplyTo = () => {
    if (!message.replyTo) return null;
    return (
      <View style={[
        styles.replyContainer,
        isFromMe ? styles.replyContainerSent : styles.replyContainerReceived,
      ]}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={styles.replyName} numberOfLines={1}>
            {message.replyTo.senderName}
          </Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {message.replyTo.content}
          </Text>
        </View>
      </View>
    );
  };

  // Reactions
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    // Group reactions by emoji
    const grouped = message.reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <View style={[
        styles.reactionsContainer,
        isFromMe && styles.reactionsContainerRight,
      ]}>
        {Object.entries(grouped).map(([emoji, count]) => (
          <TouchableOpacity 
            key={emoji} 
            style={styles.reactionBubble}
            onPress={() => onReaction(emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.messageRow, isFromMe && styles.messageRowRight]}>
      {/* Avatar (for received messages) */}
      {!isFromMe && (
        <View style={styles.avatarContainer}>
          {showAvatar ? (
            <Avatar
              avatar={message.sender.avatar || null}
              userId={String(message.senderId)}
              name={message.sender.name}
              pixelSize={32}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}

      <View style={[styles.bubbleWrapper, isFromMe && styles.bubbleWrapperRight]}>
        {/* Reply preview */}
        {renderReplyTo()}

        {/* Message Bubble */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            style={[
              styles.bubble,
              isFromMe ? styles.bubbleSent : styles.bubbleReceived,
              message.type === 'image' && styles.imageBubble,
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={onLongPress}
          >
            {renderContent()}
          </Pressable>
        </Animated.View>

        {/* Time and Status */}
        {showTime && (
          <View style={[styles.timeRow, isFromMe && styles.timeRowRight]}>
            <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
            {renderDeliveryStatus()}
          </View>
        )}

        {/* Reactions */}
        {renderReactions()}
      </View>
    </View>
  );
}

// ==================== TYPING INDICATOR ====================

function TypingIndicator({ name }: { name: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              { opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
            ]}
          />
        ))}
      </View>
      <Text style={styles.typingText}>{name} đang nhập...</Text>
    </View>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ZaloChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<UnifiedMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Unified Badge Context - Zalo style
  const { markMessageAsRead: markBadgeRead } = useUnifiedBadge();

  const {
    currentConversation,
    messages,
    loadingMessages,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    sending,
    typingUsers,
    setTyping,
    markAsRead,
    startCall,
    addReaction,
    deleteMessage,
  } = useUnifiedMessaging();

  // Load messages on mount
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Mark as read - Sync với cả hook và badge context (Zalo-style)
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      // Mark read trong messaging hook
      markAsRead(conversationId);
      // Clear badge thông báo cho conversation này
      markBadgeRead(conversationId);
    }
  }, [conversationId, messages.length, markAsRead, markBadgeRead]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !conversationId || sending) return;

    const content = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    
    if (replyTo) setReplyTo(null);

    try {
      await sendMessage({
        conversationId,
        content,
        replyToId: replyTo?.id,
      });
      scrollToBottom();
    } catch (error) {
      setInputText(content);
    }
  }, [inputText, conversationId, sending, replyTo, sendMessage, scrollToBottom]);

  // Typing indicator
  useEffect(() => {
    if (!conversationId) return;
    
    const isTyping = inputText.length > 0;
    setTyping(conversationId, isTyping);
    
    return () => setTyping(conversationId, false);
  }, [inputText, conversationId, setTyping]);

  // Voice call
  const handleVoiceCall = useCallback(() => {
    if (currentConversation?.participants[0]?.id) {
      startCall(currentConversation.participants[0].id, 'audio');
    }
  }, [currentConversation, startCall]);

  // Video call
  const handleVideoCall = useCallback(() => {
    if (currentConversation?.participants[0]?.id) {
      startCall(currentConversation.participants[0].id, 'video');
    }
  }, [currentConversation, startCall]);

  // Long press on message - Show action menu
  const handleMessageLongPress = useCallback((message: UnifiedMessage) => {
    setSelectedMessage(message);
    
    if (Platform.OS === 'ios') {
      const options = ['Trả lời', 'Sao chép', 'Chia sẻ', 'Chọn nhiều', 'Xóa', 'Hủy'];
      const destructiveButtonIndex = 4;
      const cancelButtonIndex = 5;
      
      // Add call back option for call messages
      if (message.type === 'call' || message.type === 'video_call') {
        options.splice(1, 0, 'Gọi lại');
      }
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
          title: 'Tin nhắn',
        },
        (buttonIndex) => {
          handleActionSelect(buttonIndex, message, options);
        }
      );
    } else {
      setShowActionMenu(true);
    }
  }, []);

  // Handle action selection
  const handleActionSelect = useCallback(async (index: number, message: UnifiedMessage, options: string[]) => {
    const action = options[index];
    
    switch (action) {
      case 'Trả lời':
        setReplyTo(message);
        break;
      case 'Sao chép':
        if (message.content) {
          await Clipboard.setStringAsync(message.content);
          Alert.alert('Đã sao chép', 'Nội dung đã được sao chép vào clipboard');
        }
        break;
      case 'Chia sẻ':
        handleShareMessage(message);
        break;
      case 'Gọi lại':
        handleCallBack(message);
        break;
      case 'Chọn nhiều':
        setIsMultiSelectMode(true);
        setSelectedMessages(new Set([message.id]));
        break;
      case 'Xóa':
        Alert.alert(
          'Xóa tin nhắn',
          'Bạn có chắc muốn xóa tin nhắn này?',
          [
            { text: 'Hủy', style: 'cancel' },
            { 
              text: 'Xóa', 
              style: 'destructive',
              onPress: () => deleteMessage(message.id),
            },
          ]
        );
        break;
    }
    setSelectedMessage(null);
    setShowActionMenu(false);
  }, [deleteMessage]);

  // Share message
  const handleShareMessage = useCallback(async (message: UnifiedMessage) => {
    try {
      if (message.type === 'image' && message.mediaUrl) {
        // Share image
        if (await Sharing.isAvailableAsync()) {
          // For images, we'd need to download first
          Alert.alert('Chia sẻ', 'Đang chia sẻ hình ảnh...');
        }
      } else if (message.type === 'file' && message.mediaUrl) {
        // Share file
        Alert.alert('Chia sẻ', `Đang chia sẻ file: ${message.fileName}`);
      } else {
        // Share text
        if (await Sharing.isAvailableAsync()) {
          Alert.alert('Chia sẻ', message.content);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, []);

  // Call back from call message
  const handleCallBack = useCallback((message: UnifiedMessage) => {
    if (message.type === 'call' || message.type === 'video_call') {
      const otherUserId = message.senderId !== currentConversation?.participants[0]?.id 
        ? currentConversation?.participants[0]?.id 
        : message.senderId;
      
      if (otherUserId) {
        startCall(otherUserId, message.callType || 'audio');
      }
    }
  }, [currentConversation, startCall]);

  // Open media (image/file)
  const handleOpenMedia = useCallback((message: UnifiedMessage) => {
    if (message.type === 'image' && message.mediaUrl) {
      // Open image viewer - use Alert for demo since route doesn't exist
      Alert.alert('Xem ảnh', 'Đang mở hình ảnh...\n' + message.mediaUrl);
    } else if (message.type === 'file' && message.mediaUrl) {
      // Open file
      Linking.openURL(message.mediaUrl);
    }
  }, []);

  // Delete multiple messages
  const handleDeleteSelected = useCallback(() => {
    Alert.alert(
      'Xóa tin nhắn',
      `Bạn có chắc muốn xóa ${selectedMessages.size} tin nhắn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedMessages) {
              await deleteMessage(id);
            }
            setSelectedMessages(new Set());
            setIsMultiSelectMode(false);
          },
        },
      ]
    );
  }, [selectedMessages, deleteMessage]);

  // Toggle message selection
  const toggleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  // Reaction
  const handleReaction = useCallback((messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  }, [addReaction]);

  // Render message
  const renderMessage = useCallback(({ item, index }: { item: UnifiedMessage; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    const isFromMe = item.senderId !== currentConversation?.participants[0]?.id;
    
    const showAvatar = !prevMessage || prevMessage.senderId !== item.senderId;
    const showTime = !nextMessage || 
      nextMessage.senderId !== item.senderId ||
      new Date(nextMessage.createdAt).getTime() - new Date(item.createdAt).getTime() > 60000;

    const isSelected = selectedMessages.has(item.id);

    if (isMultiSelectMode) {
      return (
        <Pressable 
          style={[styles.selectableRow, isSelected && styles.selectedRow]}
          onPress={() => toggleMessageSelection(item.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <View style={{ flex: 1 }}>
            <MessageBubble
              message={item}
              isFromMe={isFromMe}
              showAvatar={showAvatar}
              showTime={showTime}
              onLongPress={() => {}}
              onReaction={() => {}}
            />
          </View>
        </Pressable>
      );
    }

    return (
      <MessageBubble
        message={item}
        isFromMe={isFromMe}
        showAvatar={showAvatar}
        showTime={showTime}
        onLongPress={() => handleMessageLongPress(item)}
        onReaction={(emoji) => handleReaction(item.id, emoji)}
      />
    );
  }, [messages, currentConversation, handleMessageLongPress, handleReaction]);

  // Loading state
  if (loadingMessages && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const otherUser = currentConversation?.participants[0];

  // Android action menu options
  const actionMenuOptions = selectedMessage ? [
    { label: 'Trả lời', icon: 'arrow-undo-outline' as const, action: 'reply' },
    ...(selectedMessage.type === 'call' || selectedMessage.type === 'video_call' 
      ? [{ label: 'Gọi lại', icon: 'call-outline' as const, action: 'callback' }] 
      : []),
    { label: 'Sao chép', icon: 'copy-outline' as const, action: 'copy' },
    { label: 'Chia sẻ', icon: 'share-outline' as const, action: 'share' },
    { label: 'Chọn nhiều', icon: 'checkbox-outline' as const, action: 'multiselect' },
    { label: 'Xóa', icon: 'trash-outline' as const, action: 'delete', destructive: true },
  ] : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Multi-select Header */}
      {isMultiSelectMode ? (
        <View style={styles.multiSelectHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setIsMultiSelectMode(false);
              setSelectedMessages(new Set());
            }}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.multiSelectTitle}>
            Đã chọn {selectedMessages.size} tin nhắn
          </Text>
          <View style={styles.multiSelectActions}>
            <TouchableOpacity 
              style={styles.multiSelectBtn}
              onPress={() => {
                // Share all selected
                Alert.alert('Chia sẻ', `Chia sẻ ${selectedMessages.size} tin nhắn`);
              }}
            >
              <Ionicons name="share-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.multiSelectBtn}
              onPress={handleDeleteSelected}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.missed} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Normal Header */
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerInfo} onPress={() => {}}>
            <Avatar
              avatar={otherUser?.avatar || null}
              userId={String(otherUser?.id || '')}
              name={otherUser?.name || 'User'}
              pixelSize={40}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerName} numberOfLines={1}>
                {otherUser?.name || currentConversation?.name || 'Chat'}
              </Text>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: otherUser?.onlineStatus === 'online' ? COLORS.online : COLORS.textTertiary }
                ]} />
                <Text style={styles.statusText}>
                  {otherUser?.onlineStatus === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleVoiceCall}>
              <Ionicons name="call-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
              <Ionicons name="videocam-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={hasMoreMessages ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreMessages}>
              <Text style={styles.loadMoreText}>Tải tin nhắn cũ hơn</Text>
            </TouchableOpacity>
          ) : null}
          inverted={false}
        />

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator name={typingUsers[0].name} />
        )}

        {/* Reply preview */}
        {replyTo && (
          <View style={styles.replyPreview}>
            <View style={styles.replyPreviewContent}>
              <Text style={styles.replyPreviewName}>
                Trả lời {replyTo.sender.name}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyTo.content}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 8 }]}>
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="happy-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={COLORS.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
            />
          </View>

          {inputText.trim() ? (
            <TouchableOpacity 
              style={[styles.sendButton, sending && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="mic-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="image-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Android Action Menu Modal */}
      {Platform.OS === 'android' && (
        <Modal
          visible={showActionMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActionMenu(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowActionMenu(false)}
          >
            <View style={styles.actionMenuContainer}>
              <Text style={styles.actionMenuTitle}>Tin nhắn</Text>
              {actionMenuOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.action}
                  style={[
                    styles.actionMenuItem,
                    option.destructive && styles.actionMenuItemDestructive,
                  ]}
                  onPress={() => {
                    if (selectedMessage) {
                      const optionLabels = actionMenuOptions.map(o => o.label);
                      optionLabels.push('Hủy');
                      handleActionSelect(index, selectedMessage, optionLabels);
                    }
                  }}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={22} 
                    color={option.destructive ? COLORS.missed : COLORS.text} 
                  />
                  <Text style={[
                    styles.actionMenuText,
                    option.destructive && styles.actionMenuTextDestructive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.actionMenuCancel}
                onPress={() => setShowActionMenu(false)}
              >
                <Text style={styles.actionMenuCancelText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 12,
    paddingBottom: 80,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadMoreText: {
    fontSize: 14,
    color: COLORS.primary,
  },

  // Message Row
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  messageRowRight: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatarPlaceholder: {
    width: 32,
  },

  // Bubble
  bubbleWrapper: {
    maxWidth: MAX_BUBBLE_WIDTH,
  },
  bubbleWrapperRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
  },
  bubbleSent: {
    backgroundColor: COLORS.bubbleSent,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: COLORS.bubbleReceived,
    borderBottomLeftRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  imageBubble: {
    padding: 4,
    overflow: 'hidden',
  },

  // Text
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textReceived,
  },
  textSent: {
    color: COLORS.textSent,
  },

  // Time
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  timeRowRight: {
    justifyContent: 'flex-end',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  deliveryIcon: {
    marginLeft: 4,
  },

  // Image
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  imageCaption: {
    fontSize: 14,
    color: COLORS.textReceived,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Voice
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    marginRight: 8,
  },
  waveformBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    color: COLORS.textReceived,
  },

  // File
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textReceived,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Call
  callContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
  },
  callIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textReceived,
  },
  callStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  callbackButton: {
    padding: 8,
  },

  // Reply
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  replyContainerSent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  replyContainerReceived: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  replyBar: {
    width: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Reactions
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reactionsContainerRight: {
    justifyContent: 'flex-end',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.reaction,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },

  // Typing
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  // Reply Preview
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  replyPreviewContent: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 8,
    marginRight: 12,
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  replyPreviewText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 8,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Multi-select
  multiSelectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  multiSelectTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  multiSelectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  multiSelectBtn: {
    padding: 8,
  },
  selectableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  selectedRow: {
    backgroundColor: 'rgba(0, 104, 255, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  // Action Menu Modal (Android)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionMenuContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  actionMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  actionMenuItemDestructive: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionMenuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  actionMenuTextDestructive: {
    color: COLORS.missed,
  },
  actionMenuCancel: {
    marginTop: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionMenuCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
});
