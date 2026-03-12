/**
 * Chat Input Bar Component
 * ========================
 *
 * Input bar với đầy đủ tính năng:
 * - Text input với multiline
 * - Attachment picker (image, file, camera)
 * - Voice recorder
 * - Emoji picker
 * - Send button
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import {
    Animated,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

import Colors from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

// ============================================
// TYPES
// ============================================

export interface ChatInputBarProps {
  /** Callback khi gửi tin nhắn */
  onSend: (message: string) => void;
  /** Callback khi bắt đầu typing */
  onTypingStart?: () => void;
  /** Callback khi dừng typing */
  onTypingStop?: () => void;
  /** Callback mở attachment picker */
  onAttachmentPress?: () => void;
  /** Callback mở camera */
  onCameraPress?: () => void;
  /** Callback mở voice recorder */
  onVoicePress?: () => void;
  /** Callback mở emoji picker */
  onEmojiPress?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Max length */
  maxLength?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Reply to message */
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  /** Cancel reply */
  onCancelReply?: () => void;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ChatInputBar({
  onSend,
  onTypingStart,
  onTypingStop,
  onAttachmentPress,
  onCameraPress,
  onVoicePress,
  onEmojiPress,
  placeholder = "Nhập tin nhắn...",
  maxLength = 2000,
  disabled = false,
  replyTo,
  onCancelReply,
  style,
}: ChatInputBarProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  // State
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);

  // Refs
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // Computed
  const hasText = text.trim().length > 0;
  const showSendButton = hasText;

  // Handle text change
  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);

      // Typing indicator
      if (value.length > 0) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        onTypingStart?.();

        typingTimeoutRef.current = setTimeout(() => {
          onTypingStop?.();
        }, 2000);
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        onTypingStop?.();
      }
    },
    [onTypingStart, onTypingStop],
  );

  // Handle send
  const handleSend = useCallback(() => {
    if (!hasText || disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSend(text.trim());
    setText("");
    setInputHeight(40);
    onTypingStop?.();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [hasText, disabled, text, onSend, onTypingStop, sendButtonScale]);

  // Handle content size change
  const handleContentSizeChange = useCallback(
    (event: { nativeEvent: { contentSize: { height: number } } }) => {
      const { height } = event.nativeEvent.contentSize;
      const newHeight = Math.min(Math.max(40, height), 120);
      setInputHeight(newHeight);
    },
    [],
  );

  // Focus input
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Reply Preview */}
      {replyTo && (
        <View style={styles.replyPreview}>
          <View style={styles.replyContent}>
            <Ionicons
              name="arrow-undo"
              size={14}
              color={Colors.light.primary}
            />
            <View style={styles.replyText}>
              <Text style={styles.replySender}>{replyTo.senderName}</Text>
              <Text style={styles.replyMessage} numberOfLines={1}>
                {replyTo.content}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onCancelReply}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close"
              size={18}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        {/* Left Actions */}
        <View style={styles.leftActions}>
          {!isFocused && !hasText && (
            <>
              {onAttachmentPress && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onAttachmentPress}
                  disabled={disabled}
                >
                  <Ionicons
                    name="add-circle"
                    size={26}
                    color={
                      disabled
                        ? Colors.light.textSecondary
                        : Colors.light.primary
                    }
                  />
                </TouchableOpacity>
              )}

              {onCameraPress && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onCameraPress}
                  disabled={disabled}
                >
                  <Ionicons
                    name="camera"
                    size={24}
                    color={
                      disabled
                        ? Colors.light.textSecondary
                        : Colors.light.primary
                    }
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {(isFocused || hasText) && onAttachmentPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAttachmentPress}
              disabled={disabled}
            >
              <Ionicons
                name="add-circle"
                size={26}
                color={
                  disabled ? Colors.light.textSecondary : Colors.light.primary
                }
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Text Input */}
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              { color: textColor, height: inputHeight },
            ]}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.textSecondary}
            value={text}
            onChangeText={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onContentSizeChange={handleContentSizeChange}
            multiline
            maxLength={maxLength}
            editable={!disabled}
            returnKeyType="default"
            blurOnSubmit={false}
          />

          {/* Emoji Button inside input */}
          {onEmojiPress && (
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={onEmojiPress}
              disabled={disabled}
            >
              <Ionicons
                name="happy"
                size={22}
                color={Colors.light.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {showSendButton ? (
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  disabled && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={disabled}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={disabled ? Colors.light.textSecondary : "#FFFFFF"}
                />
              </TouchableOpacity>
            </Animated.View>
          ) : onVoicePress ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onVoicePress}
              disabled={disabled}
            >
              <Ionicons
                name="mic"
                size={24}
                color={
                  disabled ? Colors.light.textSecondary : Colors.light.primary
                }
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  // Reply Preview
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  replyContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  replyText: {
    marginLeft: 8,
    flex: 1,
  },
  replySender: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  replyMessage: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },

  // Input Row
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 6,
  },

  // Input Container
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.light.surfaceMuted,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    minHeight: 40,
  },
  inputContainerFocused: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    maxHeight: 120,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
    alignSelf: "flex-end",
    marginBottom: Platform.OS === "ios" ? 6 : 4,
  },

  // Send Button
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.textSecondary,
  },
});

// Missing Text import fix
import { Text } from "react-native";

export default ChatInputBar;
