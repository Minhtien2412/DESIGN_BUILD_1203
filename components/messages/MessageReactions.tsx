/**
 * Message Reactions Component
 * Shows and handles emoji reactions on messages
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface Reaction {
  emoji: string;
  count: number;
  users: number[]; // User IDs who reacted
  hasReacted: boolean; // Current user has reacted
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  onUnreact: (emoji: string) => void;
  isFromMe: boolean;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏'];

export function MessageReactions({
  reactions,
  onReact,
  onUnreact,
  isFromMe,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  /**
   * Handle reaction tap
   */
  const handleReactionTap = (emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onUnreact(emoji);
    } else {
      onReact(emoji);
    }
  };

  /**
   * Handle new reaction from picker
   */
  const handlePickerReaction = (emoji: string) => {
    onReact(emoji);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Existing reactions */}
      {reactions.length > 0 && (
        <View style={[styles.reactionsList, isFromMe && styles.reactionsListFromMe]}>
          {reactions.map((reaction, index) => (
            <Pressable
              key={index}
              onPress={() => handleReactionTap(reaction.emoji, reaction.hasReacted)}
              style={({ pressed }) => [
                styles.reactionBubble,
                {
                  backgroundColor: reaction.hasReacted
                    ? '#0D9488'
                    : backgroundColor,
                  borderColor: reaction.hasReacted
                    ? '#0D9488'
                    : borderColor,
                },
                pressed && styles.reactionPressed,
              ]}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              {reaction.count > 1 && (
                <Text
                  style={[
                    styles.reactionCount,
                    {
                      color: reaction.hasReacted ? '#fff' : textColor,
                    },
                  ]}
                >
                  {reaction.count}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Add reaction button */}
      <Pressable
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [
          styles.addButton,
          { borderColor },
          pressed && styles.addButtonPressed,
        ]}
      >
        <Ionicons name="add" size={16} color={textColor} />
      </Pressable>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor, borderColor },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.pickerTitle, { color: textColor }]}>
              Chọn biểu cảm
            </Text>
            <View style={styles.emojiGrid}>
              {QUICK_REACTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => handlePickerReaction(emoji)}
                  style={({ pressed }) => [
                    styles.emojiButton,
                    pressed && styles.emojiButtonPressed,
                  ]}
                >
                  <Text style={styles.emojiLarge}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  reactionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  reactionsListFromMe: {
    justifyContent: 'flex-end',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  reactionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    width: '85%',
    maxWidth: 320,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  emojiButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  emojiButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    transform: [{ scale: 0.9 }],
  },
  emojiLarge: {
    fontSize: 32,
  },
});

/**
 * Helper function to aggregate reactions
 * Converts raw reaction data into grouped format
 */
export function aggregateReactions(
  reactionsData: { emoji: string; userId: number }[],
  currentUserId: number
): Reaction[] {
  const grouped = new Map<string, Reaction>();

  reactionsData.forEach(({ emoji, userId }) => {
    if (!grouped.has(emoji)) {
      grouped.set(emoji, {
        emoji,
        count: 0,
        users: [],
        hasReacted: false,
      });
    }

    const reaction = grouped.get(emoji)!;
    reaction.count++;
    reaction.users.push(userId);
    if (userId === currentUserId) {
      reaction.hasReacted = true;
    }
  });

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
}
