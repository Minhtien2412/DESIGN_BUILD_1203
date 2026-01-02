/**
 * ChatBubble Component
 * Reusable message bubble with various types (text, image, video, file)
 */

import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatBubbleProps {
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'audio';
  mediaUrl?: string | null;
  sentAt: string;
  isFromMe: boolean;
  isRead?: boolean;
  readAt?: string | null;
  isLastInGroup?: boolean;
  showTime?: boolean;
  onMediaPress?: () => void;
}

export default function ChatBubble({
  content,
  type,
  mediaUrl,
  sentAt,
  isFromMe,
  isRead,
  readAt,
  isLastInGroup = true,
  showTime = true,
  onMediaPress,
}: ChatBubbleProps) {
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <TouchableOpacity 
            onPress={onMediaPress}
            activeOpacity={0.9}
          >
            {mediaUrl && (
              <Image 
                source={{ uri: mediaUrl }} 
                style={styles.messageImage}
                resizeMode="cover"
              />
            )}
            {content && (
              <Text style={[
                styles.messageText,
                isFromMe ? styles.messageTextRight : styles.messageTextLeft,
                { marginTop: 6 }
              ]}>
                {content}
              </Text>
            )}
          </TouchableOpacity>
        );

      case 'video':
        return (
          <TouchableOpacity 
            onPress={onMediaPress}
            activeOpacity={0.9}
            style={styles.videoContainer}
          >
            {mediaUrl && (
              <>
                <Image 
                  source={{ uri: mediaUrl }} 
                  style={styles.messageImage}
                  resizeMode="cover"
                />
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                </View>
              </>
            )}
            {content && (
              <Text style={[
                styles.messageText,
                isFromMe ? styles.messageTextRight : styles.messageTextLeft,
                { marginTop: 6 }
              ]}>
                {content}
              </Text>
            )}
          </TouchableOpacity>
        );

      case 'file':
        return (
          <TouchableOpacity 
            onPress={onMediaPress}
            activeOpacity={0.7}
            style={styles.fileContainer}
          >
            <View style={styles.fileIconContainer}>
              <Ionicons 
                name="document-attach" 
                size={24} 
                color={isFromMe ? '#fff' : '#22c55e'} 
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[
                styles.fileName,
                isFromMe ? styles.messageTextRight : styles.messageTextLeft,
              ]} numberOfLines={1}>
                {content || 'File đính kèm'}
              </Text>
              <Text style={[
                styles.fileSize,
                isFromMe ? { color: 'rgba(255,255,255,0.7)' } : { color: '#999' }
              ]}>
                Nhấn để tải xuống
              </Text>
            </View>
          </TouchableOpacity>
        );

      case 'audio':
        return (
          <TouchableOpacity 
            onPress={onMediaPress}
            activeOpacity={0.7}
            style={styles.audioContainer}
          >
            <View style={styles.audioButton}>
              <Ionicons 
                name="play" 
                size={20} 
                color={isFromMe ? '#22c55e' : '#fff'} 
              />
            </View>
            <View style={styles.audioWaveform}>
              {[...Array(20)].map((_, i) => (
                <View 
                  key={i}
                  style={[
                    styles.waveBar,
                    { 
                      height: Math.random() * 20 + 10,
                      backgroundColor: isFromMe 
                        ? 'rgba(255,255,255,0.5)' 
                        : 'rgba(0,0,0,0.2)'
                    }
                  ]} 
                />
              ))}
            </View>
            <Text style={[
              styles.audioDuration,
              isFromMe ? styles.messageTextRight : styles.messageTextLeft,
            ]}>
              0:15
            </Text>
          </TouchableOpacity>
        );

      case 'text':
      default:
        return (
          <Text style={[
            styles.messageText,
            isFromMe ? styles.messageTextRight : styles.messageTextLeft
          ]}>
            {content}
          </Text>
        );
    }
  };

  return (
    <View style={[
      styles.messageBubble,
      isFromMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
      !isLastInGroup && (isFromMe ? styles.bubbleGroupRight : styles.bubbleGroupLeft),
      type !== 'text' && styles.mediaBubble,
    ]}>
      {renderContent()}

      {/* Time and read status */}
      {showTime && isLastInGroup && (
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            isFromMe ? styles.messageTimeRight : styles.messageTimeLeft
          ]}>
            {formatTime(sentAt)}
          </Text>
          {isFromMe && (
            <Ionicons 
              name={isRead ? "checkmark-done" : "checkmark"} 
              size={12} 
              color={isRead ? "#3b82f6" : type === 'text' ? "#fff" : "#999"}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleLeft: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#22c55e',
    borderBottomRightRadius: 4,
  },
  bubbleGroupLeft: {
    borderBottomLeftRadius: 18,
  },
  bubbleGroupRight: {
    borderBottomRightRadius: 18,
  },
  mediaBubble: {
    padding: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: '#111',
  },
  messageTextRight: {
    color: '#fff',
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 200,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 200,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 12,
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  audioDuration: {
    fontSize: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeLeft: {
    color: '#999',
  },
  messageTimeRight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
