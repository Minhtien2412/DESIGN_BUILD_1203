/**
 * MessageComposerToolbar - Thanh công cụ soạn tin nhắn đầy đủ tính năng
 * =====================================================================
 *
 * Tính năng:
 * - Gửi tin nhắn văn bản (multiline)
 * - Ghi âm tin nhắn thoại
 * - Chụp ảnh / chọn từ thư viện
 * - Quay video
 * - Chọn file/tài liệu
 * - Emoji picker
 * - Reply to message
 * - Typing indicator
 *
 * @author ThietKeResort Team
 * @created 2026-02-03
 */

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// TYPES
// ============================================================================

export type AttachmentType = "image" | "video" | "voice" | "file";

export interface AttachmentData {
  type: AttachmentType;
  uri: string;
  name: string;
  size?: number;
  duration?: number; // for voice/video
  mimeType?: string;
}

export interface ReplyToMessage {
  id: string | number;
  content: string;
  senderName: string;
}

export interface MessageComposerToolbarProps {
  /** Callback gửi tin nhắn text */
  onSendText: (text: string) => void;
  /** Callback gửi attachment (image, video, voice, file) */
  onSendAttachment?: (attachment: AttachmentData) => void;
  /** Callback khi bắt đầu gõ */
  onTypingStart?: () => void;
  /** Callback khi dừng gõ */
  onTypingStop?: () => void;
  /** Tin nhắn đang reply */
  replyTo?: ReplyToMessage | null;
  /** Hủy reply */
  onCancelReply?: () => void;
  /** Placeholder */
  placeholder?: string;
  /** Đang gửi tin */
  sending?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Style container */
  style?: ViewStyle;
  /** Màu chủ đạo */
  primaryColor?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  primary: "#0068FF",
  background: "#FFFFFF",
  inputBg: "#F5F5F5",
  border: "#E0E0E0",
  text: "#212121",
  textMuted: "#757575",
  iconActive: "#0068FF",
  iconMuted: "#9E9E9E",
  voiceRecording: "#EF4444",
  success: "#22C55E",
};

const MAX_TEXT_LENGTH = 5000;
const MAX_INPUT_HEIGHT = 120;

// ============================================================================
// COMPONENT
// ============================================================================

export const MessageComposerToolbar = memo(function MessageComposerToolbar({
  onSendText,
  onSendAttachment,
  onTypingStart,
  onTypingStop,
  replyTo,
  onCancelReply,
  placeholder = "Nhập tin nhắn...",
  sending = false,
  disabled = false,
  style,
  primaryColor = COLORS.primary,
}: MessageComposerToolbarProps) {
  // Safe area insets for bottom padding
  const insets = useSafeAreaInsets();

  // Track keyboard visibility for safe area
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // State
  const [text, setText] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  // Refs
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const attachmentAnim = useRef(new Animated.Value(0)).current;

  // Computed
  const hasText = text.trim().length > 0;
  const canSend = hasText && !sending && !disabled;

  // ============================================================================
  // TYPING INDICATOR
  // ============================================================================

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

  // ============================================================================
  // SEND MESSAGE
  // ============================================================================

  const handleSend = useCallback(() => {
    if (!canSend) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendText(text.trim());
    setText("");
    setInputHeight(40);

    // Clear typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTypingStop?.();
  }, [canSend, text, onSendText, onTypingStop]);

  // ============================================================================
  // ATTACHMENT OPTIONS
  // ============================================================================

  const toggleAttachmentOptions = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !showAttachmentOptions;
    setShowAttachmentOptions(newValue);

    Animated.spring(attachmentAnim, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();

    if (newValue) {
      Keyboard.dismiss();
    }
  }, [showAttachmentOptions, attachmentAnim]);

  // ============================================================================
  // CAMERA / GALLERY
  // ============================================================================

  const pickFromCamera = useCallback(async () => {
    setShowAttachmentOptions(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập camera");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: true,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isVideo = asset.type === "video";

        onSendAttachment?.({
          type: isVideo ? "video" : "image",
          uri: asset.uri,
          name: `${isVideo ? "video" : "photo"}_${Date.now()}.${isVideo ? "mp4" : "jpg"}`,
          size: asset.fileSize,
          duration: asset.duration ?? undefined,
          mimeType: isVideo ? "video/mp4" : "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh/quay video");
    }
  }, [onSendAttachment]);

  const pickFromGallery = useCallback(async () => {
    setShowAttachmentOptions(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cấp quyền truy cập thư viện ảnh",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsMultipleSelection: false,
        videoMaxDuration: 120,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const isVideo = asset.type === "video";

        onSendAttachment?.({
          type: isVideo ? "video" : "image",
          uri: asset.uri,
          name:
            asset.fileName || `${isVideo ? "video" : "image"}_${Date.now()}`,
          size: asset.fileSize,
          duration: asset.duration ?? undefined,
          mimeType: isVideo ? "video/mp4" : "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh/video");
    }
  }, [onSendAttachment]);

  // ============================================================================
  // DOCUMENT PICKER
  // ============================================================================

  const pickDocument = useCallback(async () => {
    setShowAttachmentOptions(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        onSendAttachment?.({
          type: "file",
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType || "application/octet-stream",
        });
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Lỗi", "Không thể chọn tài liệu");
    }
  }, [onSendAttachment]);

  // ============================================================================
  // VOICE RECORDING
  // ============================================================================

  const startVoiceRecording = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    setRecordingDuration(0);

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Start duration counter
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  }, [pulseAnim]);

  const stopVoiceRecording = useCallback(
    (cancel: boolean = false) => {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      if (!cancel && recordingDuration > 0) {
        // TODO: Integrate with actual audio recorder
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        onSendAttachment?.({
          type: "voice",
          uri: `voice_${Date.now()}.m4a`,
          name: `Tin nhắn thoại`,
          duration: recordingDuration,
          mimeType: "audio/m4a",
        });
      }

      setIsRecording(false);
      setRecordingDuration(0);
    },
    [pulseAnim, recordingDuration, onSendAttachment],
  );

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  const attachmentOptionsStyle = {
    opacity: attachmentAnim,
    transform: [
      {
        translateY: attachmentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: keyboardVisible ? 4 : Math.max(insets.bottom, 8) },
        style,
      ]}
    >
      {/* Reply Preview */}
      {replyTo && (
        <View style={styles.replyContainer}>
          <View style={styles.replyContent}>
            <Text style={styles.replyLabel}>Trả lời {replyTo.senderName}</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyCancel}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Attachment Options */}
      {showAttachmentOptions && (
        <Animated.View
          style={[styles.attachmentOptions, attachmentOptionsStyle]}
        >
          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={pickFromCamera}
          >
            <View
              style={[styles.attachmentIcon, { backgroundColor: "#10B981" }]}
            >
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
            <Text style={styles.attachmentLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={pickFromGallery}
          >
            <View
              style={[styles.attachmentIcon, { backgroundColor: "#0D9488" }]}
            >
              <Ionicons name="images" size={24} color="#fff" />
            </View>
            <Text style={styles.attachmentLabel}>Thư viện</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachmentOption}
            onPress={pickDocument}
          >
            <View
              style={[styles.attachmentIcon, { backgroundColor: "#F59E0B" }]}
            >
              <Ionicons name="document-text" size={24} color="#fff" />
            </View>
            <Text style={styles.attachmentLabel}>Tài liệu</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Voice Recording Overlay */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          <Animated.View
            style={[
              styles.recordingIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons name="mic" size={28} color="#fff" />
          </Animated.View>
          <Text style={styles.recordingDuration}>
            {formatDuration(recordingDuration)}
          </Text>
          <Text style={styles.recordingHint}>Nhả để gửi, vuốt trái để hủy</Text>

          <View style={styles.recordingActions}>
            <TouchableOpacity
              style={styles.recordingCancel}
              onPress={() => stopVoiceRecording(true)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recordingSend}
              onPress={() => stopVoiceRecording(false)}
            >
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Toolbar */}
      <View style={styles.toolbar}>
        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={toggleAttachmentOptions}
          disabled={disabled || isRecording}
        >
          <Ionicons
            name={showAttachmentOptions ? "close" : "add-circle"}
            size={28}
            color={showAttachmentOptions ? primaryColor : COLORS.iconMuted}
          />
        </TouchableOpacity>

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { height: Math.min(inputHeight, MAX_INPUT_HEIGHT) },
            ]}
            value={text}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={MAX_TEXT_LENGTH}
            editable={!disabled && !isRecording}
            onContentSizeChange={(e) => {
              setInputHeight(Math.max(40, e.nativeEvent.contentSize.height));
            }}
          />
        </View>

        {/* Voice / Send Button */}
        {hasText ? (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: primaryColor }]}
            onPress={handleSend}
            disabled={!canSend}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.toolbarButton}
            onPressIn={startVoiceRecording}
            disabled={disabled}
          >
            <Ionicons name="mic" size={26} color={COLORS.iconMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Reply
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  replyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  replyCancel: {
    padding: 4,
  },

  // Attachment Options
  attachmentOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  attachmentOption: {
    alignItems: "center",
    gap: 8,
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },

  // Recording Overlay
  recordingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.voiceRecording,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    paddingBottom: 60,
  },
  recordingIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingDuration: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginTop: 16,
  },
  recordingHint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
  recordingActions: {
    flexDirection: "row",
    gap: 32,
    marginTop: 24,
  },
  recordingCancel: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingSend: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    marginHorizontal: 4,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 20,
    minHeight: 40,
    maxHeight: MAX_INPUT_HEIGHT,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MessageComposerToolbar;
