/**
 * ReactionBar Component
 *
 * Thanh reaction emoji cho bài viết/video.
 * Hiển thị các emoji reactions với animation và optimistic update.
 *
 * Usage:
 * ```tsx
 * <ReactionBar
 *   contentType="video"
 *   contentId={video.id}
 *   showCount
 *   size="medium"
 * />
 * ```
 *
 * @author AI Assistant
 * @date 27/01/2026
 */

import { memo, useCallback, useState } from "react";
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useReactions } from "../../hooks/useReactions";
import { useThemeColor } from "../../hooks/useThemeColor";
import {
    REACTION_EMOJIS,
    REACTION_LABELS,
    ReactionType,
} from "../../services/reactions.service";

interface ReactionBarProps {
  contentType: string;
  contentId: number;
  /** Show reaction counts */
  showCount?: boolean;
  /** Show all reaction options or just toggle button */
  compact?: boolean;
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Custom style */
  style?: object;
  /** Callback when reaction changes */
  onReactionChange?: (type: ReactionType | null) => void;
}

const REACTION_TYPES: ReactionType[] = [
  "like",
  "love",
  "haha",
  "wow",
  "sad",
  "angry",
];

const SIZE_CONFIG = {
  small: { emoji: 18, text: 10, padding: 4, gap: 4 },
  medium: { emoji: 24, text: 12, padding: 8, gap: 8 },
  large: { emoji: 32, text: 14, padding: 12, gap: 12 },
};

function ReactionBarComponent({
  contentType,
  contentId,
  showCount = true,
  compact = false,
  size = "medium",
  style,
  onReactionChange,
}: ReactionBarProps) {
  const { summary, toggleReaction, isLoading, hasReacted, getEmoji } =
    useReactions(contentType, contentId);

  const [showPicker, setShowPicker] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const colors = useThemeColor();
  const sizeConfig = SIZE_CONFIG[size];

  const handleReaction = useCallback(
    async (type: ReactionType) => {
      // Animate
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      await toggleReaction(type);
      setShowPicker(false);
      onReactionChange?.(hasReacted(type) ? null : type);
    },
    [toggleReaction, scaleAnim, hasReacted, onReactionChange],
  );

  const handleLongPress = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleQuickReaction = useCallback(() => {
    // Quick tap = toggle like
    handleReaction("like");
  }, [handleReaction]);

  // Compact mode - just a button that shows picker on long press
  if (compact) {
    const userReaction = summary?.userReaction;
    const displayEmoji = userReaction ? getEmoji(userReaction) : "👍";
    const totalCount = summary?.counts.total || 0;

    return (
      <View style={[styles.container, style]}>
        <Pressable
          onPress={handleQuickReaction}
          onLongPress={handleLongPress}
          delayLongPress={300}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.compactButton,
            {
              backgroundColor: userReaction
                ? colors.primary + "20"
                : colors.card,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.emoji,
              { fontSize: sizeConfig.emoji, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {displayEmoji}
          </Animated.Text>
          {showCount && totalCount > 0 && (
            <Text
              style={[
                styles.count,
                { fontSize: sizeConfig.text, color: colors.text },
              ]}
            >
              {formatCount(totalCount)}
            </Text>
          )}
        </Pressable>

        {/* Reaction Picker Modal */}
        <ReactionPickerModal
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handleReaction}
          userReaction={userReaction}
          sizeConfig={sizeConfig}
        />
      </View>
    );
  }

  // Full mode - show top reactions
  const topReactions = summary?.topReactions || ["like"];
  const displayReactions =
    topReactions.length > 0 ? topReactions : (["like"] as ReactionType[]);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.reactionsRow, { gap: sizeConfig.gap }]}>
        {displayReactions.map((type) => {
          const count = summary?.counts[type] || 0;
          const isActive = hasReacted(type);

          return (
            <TouchableOpacity
              key={type}
              onPress={() => handleReaction(type)}
              onLongPress={handleLongPress}
              delayLongPress={300}
              disabled={isLoading}
              style={[
                styles.reactionButton,
                {
                  backgroundColor: isActive
                    ? colors.primary + "20"
                    : colors.card,
                  paddingHorizontal: sizeConfig.padding,
                  paddingVertical: sizeConfig.padding / 2,
                },
              ]}
            >
              <Animated.Text
                style={[
                  styles.emoji,
                  {
                    fontSize: sizeConfig.emoji,
                    transform: [{ scale: isActive ? scaleAnim : 1 }],
                  },
                ]}
              >
                {getEmoji(type)}
              </Animated.Text>
              {showCount && count > 0 && (
                <Text
                  style={[
                    styles.count,
                    {
                      fontSize: sizeConfig.text,
                      color: isActive ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  {formatCount(count)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* More button to show all reactions */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={[
            styles.moreButton,
            {
              backgroundColor: colors.card,
              paddingHorizontal: sizeConfig.padding,
              paddingVertical: sizeConfig.padding / 2,
            },
          ]}
        >
          <Text style={{ fontSize: sizeConfig.emoji - 4 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Picker Modal */}
      <ReactionPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleReaction}
        userReaction={summary?.userReaction}
        sizeConfig={sizeConfig}
      />
    </View>
  );
}

// ==================== PICKER MODAL ====================

interface ReactionPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: ReactionType) => void;
  userReaction?: ReactionType | null;
  sizeConfig: { emoji: number; text: number; padding: number; gap: number };
}

function ReactionPickerModal({
  visible,
  onClose,
  onSelect,
  userReaction,
  sizeConfig,
}: ReactionPickerModalProps) {
  const colors = useThemeColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[
            styles.pickerContainer,
            { backgroundColor: colors.card, gap: sizeConfig.gap },
          ]}
        >
          {REACTION_TYPES.map((type) => {
            const isActive = userReaction === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => onSelect(type)}
                style={[
                  styles.pickerItem,
                  {
                    backgroundColor: isActive
                      ? colors.primary + "20"
                      : "transparent",
                  },
                ]}
              >
                <Text style={{ fontSize: sizeConfig.emoji + 8 }}>
                  {REACTION_EMOJIS[type]}
                </Text>
                <Text
                  style={[
                    styles.pickerLabel,
                    {
                      fontSize: sizeConfig.text - 2,
                      color: isActive ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  {REACTION_LABELS[type]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

// ==================== HELPERS ====================

function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    gap: 4,
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  moreButton: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    textAlign: "center",
  },
  count: {
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pickerItem: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
  },
  pickerLabel: {
    marginTop: 4,
    fontWeight: "500",
  },
});

export const ReactionBar = memo(ReactionBarComponent);
export default ReactionBar;
