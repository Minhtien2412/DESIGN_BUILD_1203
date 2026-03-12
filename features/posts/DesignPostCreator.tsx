/**
 * Design Post Creator
 * Tạo bài đăng mẫu với ảnh nội thất/ngoại thất đẹp từ thư viện
 * Created: 19/01/2026
 */

import DesignImagePicker, {
    type SelectedImage,
} from "@/components/DesignImagePicker";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==================== POST TEMPLATES ====================

interface PostTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  hashtags: string[];
  defaultImages: string[];
}

const POST_TEMPLATES: PostTemplate[] = [
  {
    id: "living_modern",
    title: "Phòng khách hiện đại",
    category: "living",
    content:
      "🏠 Thiết kế phòng khách hiện đại với gam màu trung tính sang trọng.\n\n✨ Điểm nhấn:\n• Sofa góc L thoải mái\n• Bàn trà gỗ tự nhiên\n• Đèn trang trí ấm áp\n\n📐 Diện tích: 35m²\n💰 Chi phí tham khảo: 150-200 triệu",
    hashtags: ["thietkephongkhach", "noithat", "hienđại", "design"],
    defaultImages: [],
  },
  {
    id: "bedroom_minimal",
    title: "Phòng ngủ tối giản",
    category: "bedroom",
    content:
      "🛏️ Phòng ngủ phong cách minimalist - nơi nghỉ ngơi lý tưởng.\n\n✨ Thiết kế:\n• Giường bệt kiểu Nhật\n• Tủ âm tường tiết kiệm diện tích\n• Ánh sáng tự nhiên tối đa\n\n📐 Diện tích: 20m²\n💰 Chi phí: 80-120 triệu",
    hashtags: ["phongngu", "minimalist", "thietkenoithat", "bedroom"],
    defaultImages: [],
  },
  {
    id: "villa_exterior",
    title: "Biệt thự ngoại thất",
    category: "villa",
    content:
      "🏡 Biệt thự hiện đại với kiến trúc ấn tượng.\n\n✨ Đặc điểm:\n• Mặt tiền kính sang trọng\n• Hồ bơi vô cực\n• Sân vườn xanh mát\n\n📐 Diện tích đất: 500m²\n📐 Diện tích xây: 350m²\n💰 Giá tham khảo: 8-12 tỷ",
    hashtags: ["bietthu", "villa", "kientruc", "nhaodep"],
    defaultImages: [],
  },
  {
    id: "kitchen_modern",
    title: "Phòng bếp sang trọng",
    category: "kitchen",
    content:
      "🍳 Phòng bếp đảo sang trọng phong cách châu Âu.\n\n✨ Trang bị:\n• Bếp từ Bosch cao cấp\n• Máy hút mùi âm tủ\n• Tủ bếp Acrylic bóng gương\n\n📐 Diện tích: 25m²\n💰 Chi phí tủ bếp: 200-300 triệu",
    hashtags: ["tubep", "kitchen", "noithatcaocap", "thietke"],
    defaultImages: [],
  },
  {
    id: "garden_landscape",
    title: "Sân vườn xanh mát",
    category: "garden",
    content:
      "🌿 Thiết kế sân vườn tiểu cảnh tự nhiên.\n\n✨ Bao gồm:\n• Hồ cá Koi mini\n• Đường dạo lát đá tự nhiên\n• Cây xanh bốn mùa\n• Đèn vườn LED\n\n📐 Diện tích: 100m²\n💰 Chi phí: 150-250 triệu",
    hashtags: ["sanvuon", "landscaping", "tieucảnh", "garden"],
    defaultImages: [],
  },
];

// ==================== MAIN COMPONENT ====================

export default function DesignPostCreator() {
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(
    null
  );
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageCategory, setImageCategory] = useState("living");

  // Apply template
  const handleApplyTemplate = (template: PostTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(template);
    setPostTitle(template.title);
    setPostContent(template.content);
    setHashtags(template.hashtags);
    setImageCategory(template.category);
  };

  // Add hashtag
  const handleAddHashtag = () => {
    const tag = newHashtag.trim().replace("#", "").toLowerCase();
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setNewHashtag("");
    }
  };

  // Remove hashtag
  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  // Handle image selection
  const handleSelectImages = (images: SelectedImage[]) => {
    setSelectedImages(images);
  };

  // Open image picker for specific category
  const handleOpenImagePicker = (category?: string) => {
    if (category) {
      setImageCategory(category);
    }
    setShowImagePicker(true);
  };

  // Remove selected image
  const handleRemoveImage = (imageId: string) => {
    setSelectedImages(selectedImages.filter((img) => img.id !== imageId));
  };

  // Reorder images
  const handleMoveImage = (fromIndex: number, direction: "left" | "right") => {
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= selectedImages.length) return;

    const newImages = [...selectedImages];
    [newImages[fromIndex], newImages[toIndex]] = [
      newImages[toIndex],
      newImages[fromIndex],
    ];
    setSelectedImages(newImages);
  };

  // Preview/Publish post
  const handlePublish = () => {
    if (!postTitle.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!postContent.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập nội dung bài viết");
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert("Thiếu ảnh", "Vui lòng chọn ít nhất 1 ảnh cho bài viết");
      return;
    }

    // Prepare post data
    const postData = {
      title: postTitle,
      content: postContent,
      hashtags: hashtags,
      images: selectedImages,
      createdAt: new Date().toISOString(),
    };

    console.log("Post data:", postData);
    Alert.alert(
      "Đăng bài thành công! 🎉",
      `Bài viết "${postTitle}" với ${selectedImages.length} ảnh đã được tạo.`,
      [
        { text: "Tạo bài mới", onPress: () => resetForm() },
        { text: "Về trang chủ", onPress: () => router.back() },
      ]
    );
  };

  // Reset form
  const resetForm = () => {
    setSelectedTemplate(null);
    setPostTitle("");
    setPostContent("");
    setHashtags([]);
    setSelectedImages([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={MODERN_COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo bài đăng mẫu</Text>
        <TouchableOpacity
          style={[
            styles.publishButton,
            (!postTitle || !postContent || selectedImages.length === 0) &&
              styles.publishButtonDisabled,
          ]}
          onPress={handlePublish}
          disabled={!postTitle || !postContent || selectedImages.length === 0}
        >
          <Text style={styles.publishText}>Đăng</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Templates Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Mẫu bài viết</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templatesScroll}
            >
              {POST_TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    selectedTemplate?.id === template.id &&
                      styles.templateCardActive,
                  ]}
                  onPress={() => handleApplyTemplate(template)}
                >
                  <Ionicons
                    name={
                      template.category === "living"
                        ? "home"
                        : template.category === "bedroom"
                          ? "bed"
                          : template.category === "villa"
                            ? "business"
                            : template.category === "kitchen"
                              ? "restaurant"
                              : "leaf"
                    }
                    size={24}
                    color={
                      selectedTemplate?.id === template.id
                        ? "#fff"
                        : MODERN_COLORS.primary
                    }
                  />
                  <Text
                    style={[
                      styles.templateTitle,
                      selectedTemplate?.id === template.id &&
                        styles.templateTitleActive,
                    ]}
                  >
                    {template.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Images Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🖼️ Ảnh bài viết</Text>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => handleOpenImagePicker()}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </TouchableOpacity>
            </View>

            {selectedImages.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesScroll}
              >
                {selectedImages.map((image, index) => (
                  <View key={image.id} style={styles.imagePreview}>
                    <Image
                      source={{ uri: image.thumbnail }}
                      style={[
                        styles.previewImage,
                        { backgroundColor: image.avgColor },
                      ]}
                    />
                    {/* Image number */}
                    <View style={styles.imageNumber}>
                      <Text style={styles.imageNumberText}>{index + 1}</Text>
                    </View>
                    {/* Remove button */}
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(image.id)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                    {/* Reorder buttons */}
                    <View style={styles.reorderButtons}>
                      {index > 0 && (
                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleMoveImage(index, "left")}
                        >
                          <Ionicons
                            name="chevron-back"
                            size={14}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      )}
                      {index < selectedImages.length - 1 && (
                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleMoveImage(index, "right")}
                        >
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    {/* Photographer credit */}
                    <View style={styles.imageCredit}>
                      <Text style={styles.imageCreditText}>
                        📷 {image.photographer}
                      </Text>
                    </View>
                  </View>
                ))}
                {/* Add more button */}
                <TouchableOpacity
                  style={styles.addMoreImages}
                  onPress={() => handleOpenImagePicker()}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={32}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.addMoreText}>Thêm ảnh</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <TouchableOpacity
                style={styles.emptyImages}
                onPress={() => handleOpenImagePicker()}
              >
                <Ionicons
                  name="images-outline"
                  size={48}
                  color={MODERN_COLORS.textSecondary}
                />
                <Text style={styles.emptyImagesText}>
                  Chọn ảnh từ thư viện thiết kế
                </Text>
                <Text style={styles.emptyImagesSubtext}>
                  Ảnh nội thất & ngoại thất đẹp miễn phí
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✏️ Tiêu đề</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Nhập tiêu đề bài viết..."
              placeholderTextColor={MODERN_COLORS.textSecondary}
              value={postTitle}
              onChangeText={setPostTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{postTitle.length}/100</Text>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Nội dung</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Nhập nội dung bài viết..."
              placeholderTextColor={MODERN_COLORS.textSecondary}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{postContent.length}/2000</Text>
          </View>

          {/* Hashtags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>#️⃣ Hashtags</Text>
            <View style={styles.hashtagsContainer}>
              {hashtags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.hashtagChip}
                  onPress={() => handleRemoveHashtag(tag)}
                >
                  <Text style={styles.hashtagText}>#{tag}</Text>
                  <Ionicons
                    name="close"
                    size={14}
                    color={MODERN_COLORS.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.addHashtagRow}>
              <TextInput
                style={styles.hashtagInput}
                placeholder="Thêm hashtag..."
                placeholderTextColor={MODERN_COLORS.textSecondary}
                value={newHashtag}
                onChangeText={setNewHashtag}
                onSubmitEditing={handleAddHashtag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addHashtagBtn}
                onPress={handleAddHashtag}
                disabled={!newHashtag.trim()}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Category Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Tìm ảnh theo danh mục</Text>
            <View style={styles.quickCategories}>
              {[
                { id: "living", label: "Phòng khách", icon: "home" },
                { id: "bedroom", label: "Phòng ngủ", icon: "bed" },
                { id: "kitchen", label: "Phòng bếp", icon: "restaurant" },
                { id: "villa", label: "Biệt thự", icon: "business" },
                { id: "garden", label: "Sân vườn", icon: "leaf" },
                { id: "pool", label: "Hồ bơi", icon: "water" },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.quickCategoryBtn}
                  onPress={() => handleOpenImagePicker(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.quickCategoryText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <DesignImagePicker
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectImages={handleSelectImages}
        maxSelection={10}
        initialCategory={imageCategory}
        title="Chọn ảnh thiết kế"
      />
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    textAlign: "center",
  },
  publishButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
  },
  publishButtonDisabled: {
    opacity: 0.4,
  },
  publishText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },
  templatesScroll: {
    gap: MODERN_SPACING.sm,
  },
  templateCard: {
    width: 100,
    paddingVertical: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    gap: MODERN_SPACING.xs,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  templateCardActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  templateTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
    textAlign: "center",
  },
  templateTitleActive: {
    color: "#fff",
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: 4,
  },
  addImageText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  imagesScroll: {
    gap: MODERN_SPACING.sm,
  },
  imagePreview: {
    width: 140,
    height: 105,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageNumber: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  imageNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  reorderButtons: {
    position: "absolute",
    bottom: 24,
    left: 6,
    flexDirection: "row",
    gap: 4,
  },
  reorderBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageCredit: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCreditText: {
    fontSize: 9,
    color: "#fff",
  },
  addMoreImages: {
    width: 100,
    height: 105,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: MODERN_COLORS.primary + "50",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addMoreText: {
    fontSize: 11,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },
  emptyImages: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xl,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: MODERN_COLORS.border,
  },
  emptyImagesText: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
    marginTop: MODERN_SPACING.sm,
  },
  emptyImagesSubtext: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
  },
  titleInput: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    fontSize: 15,
    color: MODERN_COLORS.textPrimary,
  },
  charCount: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  contentInput: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    fontSize: 15,
    color: MODERN_COLORS.textPrimary,
    minHeight: 150,
  },
  hashtagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
    marginBottom: MODERN_SPACING.sm,
  },
  hashtagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary + "15",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  hashtagText: {
    fontSize: 13,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },
  addHashtagRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  hashtagInput: {
    flex: 1,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    fontSize: 14,
    color: MODERN_COLORS.textPrimary,
  },
  addHashtagBtn: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  quickCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: 6,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  quickCategoryText: {
    fontSize: 13,
    color: MODERN_COLORS.textPrimary,
    fontWeight: "500",
  },
});
