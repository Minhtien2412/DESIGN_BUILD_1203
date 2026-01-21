/**
 * MessageReactions - Emoji reaction component for chat messages
 *
 * Features:
 * - Quick reaction picker (long press or tap)
 * - Display existing reactions with counts
 * - Add/remove reactions
 * - Animated reactions
 * - WebSocket integration for real-time updates
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
  hasReacted: boolean; // Current user has reacted
}

export interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  isOwnMessage?: boolean;
  style?: ViewStyle;
}

export interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  position?: { x: number; y: number };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];
export const ALL_REACTIONS = [
  "👍",
  "👎",
  "❤️",
  "🔥",
  "🎉",
  "😂",
  "😮",
  "😢",
  "😡",
  "👏",
  "🙏",
  "💪",
  "✨",
  "💯",
  "🤔",
  "👀",
  "🎊",
  "💕",
];

const COLORS = {
  background: "#ffffff",
  surface: "#f3f4f6",
  text: "#1f2937",
  textSecondary: "#6b7280",
  accent: "#3b82f6",
  accentLight: "#dbeafe",
  border: "#e5e7eb",
  shadow: "rgba(0, 0, 0, 0.15)",
  overlay: "rgba(0, 0, 0, 0.3)",
};

// ============================================================================
// REACTION PICKER COMPONENT
// ============================================================================

export function ReactionPicker({
  visible,
  onClose,
  onSelectReaction,
  position,
}: ReactionPickerProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelectReaction(emoji);
      onClose();
    },
    [onSelectReaction, onClose]
  );

  if (!visible) return null;

  // Calculate picker position
  let pickerStyle: ViewStyle = {};
  if (position) {
    const pickerWidth = QUICK_REACTIONS.length * 44 + 16;
    let left = position.x - pickerWidth / 2;

    // Keep within screen bounds
    if (left < 10) left = 10;
    if (left + pickerWidth > SCREEN_WIDTH - 10) {
      left = SCREEN_WIDTH - pickerWidth - 10;
    }

    pickerStyle = {
      position: "absolute",
      top: position.y - 60,
      left,
    };
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.pickerOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.pickerContainer,
                pickerStyle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Quick reactions row */}
              <View style={styles.quickReactionsRow}>
                {QUICK_REACTIONS.map((emoji, index) => (
                  <ReactionButton
                    key={emoji}
                    emoji={emoji}
                    onPress={() => handleSelect(emoji)}
                    delay={index * 30}
                  />
                ))}
              </View>

              {/* More reactions button */}
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => {
                  // Could open full emoji picker
                  onClose();
                }}
              >
                <Ionicons name="add" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ============================================================================
// REACTION BUTTON (animated)
// ============================================================================

interface ReactionButtonProps {
  emoji: string;
  onPress: () => void;
  delay?: number;
}

function ReactionButton({ emoji, onPress, delay = 0 }: ReactionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 150,
      friction: 8,
      delay,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, delay]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 1.3,
      tension: 200,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[styles.reactionButton, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.reactionEmoji}>{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================================================
// REACTION BADGE (display existing reactions)
// ============================================================================

interface ReactionBadgeProps {
  emoji: string;
  count: number;
  hasReacted: boolean;
  onPress: () => void;
}

function ReactionBadge({
  emoji,
  count,
  hasReacted,
  onPress,
}: ReactionBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.reactionBadge,
          hasReacted && styles.reactionBadgeActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.badgeEmoji}>{emoji}</Text>
        {count > 1 && (
          <Text
            style={[styles.badgeCount, hasReacted && styles.badgeCountActive]}
          >
            {count}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  isOwnMessage = false,
  style,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<
    { x: number; y: number } | undefined
  >();
  const containerRef = useRef<View>(null);

  const handleShowPicker = useCallback((event?: any) => {
    if (event && containerRef.current) {
      containerRef.current.measureInWindow((x, y, width, _height) => {
        setPickerPosition({ x: x + width / 2, y });
      });
    }
    setShowPicker(true);
  }, []);

  const handleSelectReaction = useCallback(
    (emoji: string) => {
      // Check if already reacted with this emoji
      const existingReaction = reactions.find((r) => r.emoji === emoji);
      if (existingReaction?.hasReacted) {
        onRemoveReaction(messageId, emoji);
      } else {
        onAddReaction(messageId, emoji);
      }
    },
    [messageId, reactions, onAddReaction, onRemoveReaction]
  );

  const handleBadgePress = useCallback(
    (emoji: string, hasReacted: boolean) => {
      if (hasReacted) {
        onRemoveReaction(messageId, emoji);
      } else {
        onAddReaction(messageId, emoji);
      }
    },
    [messageId, onAddReaction, onRemoveReaction]
  );

  // Sort reactions by count
  const sortedReactions = [...reactions].sort((a, b) => b.count - a.count);

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        isOwnMessage ? styles.containerRight : styles.containerLeft,
        style,
      ]}
    >
      {/* Existing reactions */}
      {sortedReactions.length > 0 && (
        <View style={styles.reactionsRow}>
          {sortedReactions.map((reaction) => (
            <ReactionBadge
              key={reaction.emoji}
              emoji={reaction.emoji}
              count={reaction.count}
              hasReacted={reaction.hasReacted}
              onPress={() =>
                handleBadgePress(reaction.emoji, reaction.hasReacted)
              }
            />
          ))}
        </View>
      )}

      {/* Add reaction button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleShowPicker}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="happy-outline" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Reaction picker modal */}
      <ReactionPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectReaction={handleSelectReaction}
        position={pickerPosition}
      />
    </View>
  );
}

// ============================================================================
// INLINE REACTION TRIGGER (for message bubbles)
// ============================================================================

interface InlineReactionTriggerProps {
  onLongPress: () => void;
  children: React.ReactNode;
}

export function InlineReactionTrigger({
  onLongPress,
  children,
}: InlineReactionTriggerProps) {
  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      delayLongPress={300}
      activeOpacity={0.95}
    >
      {children}
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  containerLeft: {
    justifyContent: "flex-start",
  },
  containerRight: {
    justifyContent: "flex-end",
  },

  // Reactions row
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },

  // Reaction badge
  reactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reactionBadgeActive: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 2,
    fontWeight: "600",
  },
  badgeCountActive: {
    color: COLORS.accent,
  },

  // Add button
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Picker overlay
  pickerOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },

  // Picker container
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: "center",
    marginTop: "40%",
  },

  // Quick reactions row
  quickReactionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Reaction button
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reactionEmoji: {
    fontSize: 24,
  },

  // More button
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});

export default MessageReactions;
