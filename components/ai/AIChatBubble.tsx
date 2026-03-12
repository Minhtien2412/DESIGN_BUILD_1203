/**
 * AI Chat Bubble Component
 * Displays individual chat message with role-based styling
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import type { AIChatMessage } from '@/types/ai';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AIChatBubbleProps {
  message: AIChatMessage;
}

export function AIChatBubble({ message }: AIChatBubbleProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      {/* AI Avatar */}
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
          <Text style={[styles.avatarText, { color: tintColor }]}>AI</Text>
        </View>
      )}

      {/* Message Bubble */}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: tintColor }
            : { backgroundColor: '#f0f0f0' },
          isUser && styles.userBubble,
        ]}
      >
        {/* Images if present */}
        {message.imageUrls && message.imageUrls.length > 0 && (
          <View style={styles.imagesContainer}>
            {message.imageUrls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        {/* Message Text */}
        <Text
          style={[
            styles.text,
            { color: isUser ? '#fff' : textColor },
          ]}
        >
          {message.content}
        </Text>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            { color: isUser ? '#ffffff80' : '#00000060' },
          ]}
        >
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>

      {/* User Avatar Placeholder */}
      {isUser && <View style={styles.spacer} />}
    </View>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 minute
  if (diff < 60000) {
    return 'Vừa xong';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} phút trước`;
  }

  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }

  // Full date
  return date.toLocaleDateString('vi-VN');
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  spacer: {
    width: 32,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  systemText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
