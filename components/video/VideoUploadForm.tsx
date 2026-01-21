/**
 * VideoUploadForm - Caption and settings form
 * VIDEO-006: User Upload Video - Caption + hashtag input
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";

export interface VideoUploadFormData {
  caption: string;
  hashtags: string[];
  visibility: "public" | "followers" | "private";
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
}

export interface VideoUploadFormProps {
  initialData?: Partial<VideoUploadFormData>;
  onSubmit?: (data: VideoUploadFormData) => void;
  onChange?: (data: VideoUploadFormData) => void;
  style?: ViewStyle;
  isLoading?: boolean;
}

const MAX_CAPTION_LENGTH = 2200;
const SUGGESTED_HASHTAGS = [
  "viral",
  "fyp",
  "foryou",
  "trending",
  "xaydung",
  "noithat",
  "kientruc",
  "thietke",
  "nhacua",
  "decor",
  "homestyle",
  "vietnam",
];

export function VideoUploadForm({
  initialData,
  onSubmit,
  onChange,
  style,
  isLoading = false,
}: VideoUploadFormProps): React.ReactElement {
  const [caption, setCaption] = useState(initialData?.caption || "");
  const [hashtags, setHashtags] = useState<string[]>(
    initialData?.hashtags || []
  );
  const [hashtagInput, setHashtagInput] = useState("");
  const [visibility, setVisibility] = useState<
    "public" | "followers" | "private"
  >(initialData?.visibility || "public");
  const [allowComments, setAllowComments] = useState(
    initialData?.allowComments ?? true
  );
  const [allowDuet, setAllowDuet] = useState(initialData?.allowDuet ?? true);
  const [allowStitch, setAllowStitch] = useState(
    initialData?.allowStitch ?? true
  );

  // Notify changes
  const notifyChange = useCallback(
    (updates: Partial<VideoUploadFormData>) => {
      const data: VideoUploadFormData = {
        caption,
        hashtags,
        visibility,
        allowComments,
        allowDuet,
        allowStitch,
        ...updates,
      };
      onChange?.(data);
    },
    [
      caption,
      hashtags,
      visibility,
      allowComments,
      allowDuet,
      allowStitch,
      onChange,
    ]
  );

  // Caption handlers
  const handleCaptionChange = (text: string) => {
    if (text.length <= MAX_CAPTION_LENGTH) {
      setCaption(text);
      notifyChange({ caption: text });
    }
  };

  // Hashtag handlers
  const addHashtag = (tag: string) => {
    const cleaned = tag.replace(/^#/, "").toLowerCase().trim();
    if (cleaned && !hashtags.includes(cleaned) && hashtags.length < 30) {
      const newTags = [...hashtags, cleaned];
      setHashtags(newTags);
      notifyChange({ hashtags: newTags });
    }
    setHashtagInput("");
  };

  const removeHashtag = (tag: string) => {
    const newTags = hashtags.filter((t) => t !== tag);
    setHashtags(newTags);
    notifyChange({ hashtags: newTags });
  };

  const handleHashtagSubmit = () => {
    if (hashtagInput.trim()) {
      addHashtag(hashtagInput);
    }
  };

  // Visibility handlers
  const handleVisibilityChange = (v: "public" | "followers" | "private") => {
    setVisibility(v);
    notifyChange({ visibility: v });
  };

  // Submit handler
  const handleSubmit = () => {
    onSubmit?.({
      caption,
      hashtags,
      visibility,
      allowComments,
      allowDuet,
      allowStitch,
    });
  };

  const visibilityOptions: {
    value: "public" | "followers" | "private";
    label: string;
    icon: string;
  }[] = [
    { value: "public", label: "Công khai", icon: "globe-outline" },
    { value: "followers", label: "Người theo dõi", icon: "people-outline" },
    { value: "private", label: "Riêng tư", icon: "lock-closed-outline" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, style]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Caption Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Viết mô tả cho video của bạn..."
            placeholderTextColor="#666"
            value={caption}
            onChangeText={handleCaptionChange}
            multiline
            maxLength={MAX_CAPTION_LENGTH}
          />
          <Text style={styles.charCount}>
            {caption.length}/{MAX_CAPTION_LENGTH}
          </Text>
        </View>

        {/* Hashtag Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hashtag</Text>
          <View style={styles.hashtagInputContainer}>
            <Text style={styles.hashPrefix}>#</Text>
            <TextInput
              style={styles.hashtagInput}
              placeholder="Thêm hashtag..."
              placeholderTextColor="#666"
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={handleHashtagSubmit}
              returnKeyType="done"
              autoCapitalize="none"
            />
            <Pressable onPress={handleHashtagSubmit} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="#FF6B35" />
            </Pressable>
          </View>

          {/* Current hashtags */}
          {hashtags.length > 0 && (
            <View style={styles.hashtagList}>
              {hashtags.map((tag) => (
                <Pressable
                  key={tag}
                  style={styles.hashtagChip}
                  onPress={() => removeHashtag(tag)}
                >
                  <Text style={styles.hashtagText}>#{tag}</Text>
                  <Ionicons name="close-circle" size={16} color="#999" />
                </Pressable>
              ))}
            </View>
          )}

          {/* Suggested hashtags */}
          <Text style={styles.suggestedTitle}>Gợi ý</Text>
          <View style={styles.hashtagList}>
            {SUGGESTED_HASHTAGS.filter((t) => !hashtags.includes(t)).map(
              (tag) => (
                <Pressable
                  key={tag}
                  style={styles.suggestedChip}
                  onPress={() => addHashtag(tag)}
                >
                  <Text style={styles.suggestedText}>#{tag}</Text>
                  <Ionicons name="add" size={14} color="#FF6B35" />
                </Pressable>
              )
            )}
          </View>
        </View>

        {/* Visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ai có thể xem video này</Text>
          <View style={styles.visibilityOptions}>
            {visibilityOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.visibilityOption,
                  visibility === option.value && styles.visibilitySelected,
                ]}
                onPress={() => handleVisibilityChange(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={visibility === option.value ? "#FF6B35" : "#999"}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    visibility === option.value &&
                      styles.visibilityTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble-outline" size={20} color="#999" />
              <Text style={styles.settingLabel}>Cho phép bình luận</Text>
            </View>
            <Switch
              value={allowComments}
              onValueChange={(v) => {
                setAllowComments(v);
                notifyChange({ allowComments: v });
              }}
              trackColor={{ false: "#333", true: "#FF6B35" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="people-outline" size={20} color="#999" />
              <Text style={styles.settingLabel}>Cho phép Duet</Text>
            </View>
            <Switch
              value={allowDuet}
              onValueChange={(v) => {
                setAllowDuet(v);
                notifyChange({ allowDuet: v });
              }}
              trackColor={{ false: "#333", true: "#FF6B35" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="cut-outline" size={20} color="#999" />
              <Text style={styles.settingLabel}>Cho phép Stitch</Text>
            </View>
            <Switch
              value={allowStitch}
              onValueChange={(v) => {
                setAllowStitch(v);
                notifyChange({ allowStitch: v });
              }}
              trackColor={{ false: "#333", true: "#FF6B35" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.submitText}>Đang đăng...</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#FFF" />
              <Text style={styles.submitText}>Đăng video</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 12,
  },
  captionInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    marginTop: 8,
    textAlign: "right",
    fontSize: 12,
    color: "#666",
  },
  hashtagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  hashPrefix: {
    fontSize: 18,
    color: "#FF6B35",
    fontWeight: "600",
  },
  hashtagInput: {
    flex: 1,
    padding: 12,
    color: "#FFF",
    fontSize: 16,
  },
  addButton: {
    padding: 4,
  },
  hashtagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  hashtagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  hashtagText: {
    color: "#FF6B35",
    fontSize: 14,
  },
  suggestedTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    color: "#666",
  },
  suggestedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  suggestedText: {
    color: "#999",
    fontSize: 14,
  },
  visibilityOptions: {
    flexDirection: "row",
    gap: 12,
  },
  visibilityOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  visibilitySelected: {
    borderColor: "#FF6B35",
  },
  visibilityText: {
    color: "#999",
    fontSize: 12,
  },
  visibilityTextSelected: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B35",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default VideoUploadForm;
