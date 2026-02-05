/**
 * PostComposer Component
 * Create new posts with text, images, privacy settings
 *
 * @author AI Assistant
 * @date 23/12/2025
 */

import { useAuth } from "@/context/AuthContext";
import { useSocial } from "@/context/SocialContext";
import { FEELINGS, PostPrivacy, PRIVACY_OPTIONS } from "@/types/social";
import {
    errorNotification,
    lightImpact,
    successNotification,
} from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { memo, useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PostComposerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function PostComposerComponent({
  visible,
  onClose,
  onSuccess,
}: PostComposerProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createPost, state } = useSocial();

  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PostPrivacy>("friends");
  const [feeling, setFeeling] = useState<string | null>(null);
  const [showPrivacyPicker, setShowPrivacyPicker] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);

  const canPost = content.trim().length > 0 || images.length > 0;
  const isPosting = state.isPosting;

  // Reset state
  const resetState = useCallback(() => {
    setContent("");
    setImages([]);
    setPrivacy("friends");
    setFeeling(null);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (content.trim() || images.length > 0) {
      Alert.alert("Hủy bài viết?", "Bài viết chưa được đăng sẽ bị xóa.", [
        { text: "Tiếp tục chỉnh sửa", style: "cancel" },
        {
          text: "Hủy bài viết",
          style: "destructive",
          onPress: () => {
            resetState();
            onClose();
          },
        },
      ]);
    } else {
      onClose();
    }
  }, [content, images, resetState, onClose]);

  // Pick images
  const handlePickImages = useCallback(async () => {
    lightImpact();

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép truy cập thư viện ảnh",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 10));
    }
  }, [images.length]);

  // Take photo
  const handleTakePhoto = useCallback(async () => {
    lightImpact();

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần quyền truy cập", "Vui lòng cho phép truy cập camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 10));
    }
  }, []);

  // Remove image
  const handleRemoveImage = useCallback((index: number) => {
    lightImpact();
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Submit post
  const handleSubmit = useCallback(async () => {
    if (!canPost || isPosting) return;

    try {
      await createPost(content.trim(), images, privacy);
      successNotification();
      resetState();
      onClose();
      onSuccess?.();
    } catch (error) {
      errorNotification();
      Alert.alert("Lỗi", "Không thể đăng bài. Vui lòng thử lại.");
    }
  }, [
    canPost,
    isPosting,
    content,
    images,
    privacy,
    createPost,
    resetState,
    onClose,
    onSuccess,
  ]);

  // Get privacy label
  const getPrivacyLabel = () => {
    return PRIVACY_OPTIONS.find((p) => p.value === privacy)?.label || "Bạn bè";
  };

  // Get privacy icon
  const getPrivacyIcon = () => {
    return (
      PRIVACY_OPTIONS.find((p) => p.value === privacy)?.icon || "people-outline"
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={28} color="#050505" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Tạo bài viết</Text>

          <TouchableOpacity
            style={[styles.postButton, !canPost && styles.postButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canPost || isPosting}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.postButtonText,
                  !canPost && styles.postButtonTextDisabled,
                ]}
              >
                Đăng
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* User Info & Privacy */}
        <View style={styles.userSection}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://ui-avatars.com/api/?name=User&size=40&background=FF6B35&color=fff",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Người dùng"}</Text>
            <TouchableOpacity
              style={styles.privacyButton}
              onPress={() => setShowPrivacyPicker(true)}
            >
              <Ionicons
                name={getPrivacyIcon() as any}
                size={12}
                color="#65676B"
              />
              <Text style={styles.privacyText}>{getPrivacyLabel()}</Text>
              <Ionicons name="caret-down" size={12} color="#65676B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Input */}
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.textInput}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor="#65676B"
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />

          {/* Feeling */}
          {feeling && (
            <View style={styles.feelingContainer}>
              <Text style={styles.feelingText}>Đang cảm thấy {feeling}</Text>
              <TouchableOpacity onPress={() => setFeeling(null)}>
                <Ionicons name="close-circle" size={20} color="#65676B" />
              </TouchableOpacity>
            </View>
          )}

          {/* Images Preview */}
          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              {images.map((uri, index) => (
                <View key={uri} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={[styles.bottomActions, { paddingBottom: insets.bottom + 8 }]}
        >
          <Text style={styles.addToPostText}>Thêm vào bài viết</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickImages}
            >
              <Ionicons name="images" size={24} color="#45BD62" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={24} color="#1877F2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFeelingPicker(true)}
            >
              <Ionicons name="happy" size={24} color="#F7B928" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="location" size={24} color="#F5533D" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="person-add" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Picker Modal */}
        <Modal
          visible={showPrivacyPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPrivacyPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPrivacyPicker(false)}
          >
            <View
              style={[
                styles.pickerContainer,
                { paddingBottom: insets.bottom + 16 },
              ]}
            >
              <Text style={styles.pickerTitle}>
                Ai có thể xem bài viết này?
              </Text>
              {PRIVACY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickerItem,
                    privacy === option.value && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setPrivacy(option.value);
                    setShowPrivacyPicker(false);
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color="#050505"
                  />
                  <Text style={styles.pickerItemText}>{option.label}</Text>
                  {privacy === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#1877F2"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Feeling Picker Modal */}
        <Modal
          visible={showFeelingPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFeelingPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFeelingPicker(false)}
          >
            <View
              style={[
                styles.pickerContainer,
                { paddingBottom: insets.bottom + 16 },
              ]}
            >
              <Text style={styles.pickerTitle}>Bạn đang cảm thấy thế nào?</Text>
              <ScrollView style={styles.feelingsList}>
                {FEELINGS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.pickerItem,
                      feeling === f && styles.pickerItemActive,
                    ]}
                    onPress={() => {
                      setFeeling(f);
                      setShowFeelingPicker(false);
                    }}
                  >
                    <Text style={styles.feelingEmoji}>{f.split(" ")[0]}</Text>
                    <Text style={styles.pickerItemText}>
                      {f.split(" ").slice(1).join(" ")}
                    </Text>
                    {feeling === f && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#1877F2"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#050505",
  },
  postButton: {
    backgroundColor: "#1877F2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  postButtonDisabled: {
    backgroundColor: "#E4E6EB",
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  postButtonTextDisabled: {
    color: "#BCC0C4",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#050505",
  },
  privacyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4E6EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    gap: 4,
  },
  privacyText: {
    fontSize: 12,
    color: "#050505",
  },
  scrollView: {
    flex: 1,
  },
  textInput: {
    fontSize: 20,
    color: "#050505",
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  feelingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F0F2F5",
    marginHorizontal: 12,
    borderRadius: 8,
  },
  feelingText: {
    fontSize: 14,
    color: "#65676B",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 8,
  },
  imageWrapper: {
    position: "relative",
    width: "31%",
    aspectRatio: 1,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  bottomActions: {
    borderTopWidth: 1,
    borderTopColor: "#E4E6EB",
    padding: 12,
  },
  addToPostText: {
    fontSize: 14,
    color: "#65676B",
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#050505",
    textAlign: "center",
    marginBottom: 16,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  pickerItemActive: {
    backgroundColor: "#E7F3FF",
  },
  pickerItemText: {
    flex: 1,
    fontSize: 16,
    color: "#050505",
  },
  feelingsList: {
    maxHeight: 300,
  },
  feelingEmoji: {
    fontSize: 24,
  },
});

export const PostComposer = memo(PostComposerComponent);
export default PostComposer;
