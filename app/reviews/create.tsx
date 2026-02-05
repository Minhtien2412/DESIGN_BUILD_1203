/**
 * Create Review Screen - Shopee Style
 * Tạo đánh giá mới cho sản phẩm/đơn hàng
 *
 * @created 2026-02-04
 *
 * Features:
 * - Star rating selector
 * - Text review input
 * - Multiple image upload
 * - Anonymous option
 * - Submit validation
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Shopee Colors
const SHOPEE_COLORS = {
  primary: "#EE4D2D",
  primaryLight: "#FF6633",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#000000",
  textSecondary: "#757575",
  textTertiary: "#BDBDBD",
  border: "#E0E0E0",
  divider: "#EEEEEE",
  star: "#FFCE3D",
  starInactive: "#E0E0E0",
  success: "#00BFA5",
  error: "#EF4444",
};

const RATING_LABELS: { [key: number]: string } = {
  1: "Rất không hài lòng",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Cực kỳ hài lòng",
};

const MAX_IMAGES = 5;
const MAX_COMMENT_LENGTH = 500;

interface ProductToReview {
  id: string;
  name: string;
  image: string;
  variant?: string;
  orderId?: string;
}

// Mock product data
const MOCK_PRODUCT: ProductToReview = {
  id: "1",
  name: "Xi măng PCB40 Holcim",
  image: "https://picsum.photos/200/200?random=product1",
  variant: "50kg/bao",
  orderId: "#DH240201001",
};

export default function CreateReviewScreen() {
  const { productId, orderId } = useLocalSearchParams<{
    productId?: string;
    orderId?: string;
  }>();
  const insets = useSafeAreaInsets();

  const [product] = useState<ProductToReview>(MOCK_PRODUCT);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating > 0;

  const handleRatingPress = (star: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(star);
  };

  const handlePickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(
        "Giới hạn",
        `Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh`,
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Vui lòng cho phép truy cập thư viện ảnh trong cài đặt",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    }
  };

  const handleTakePhoto = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(
        "Giới hạn",
        `Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh`,
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Quyền truy cập",
        "Vui lòng cho phép truy cập camera trong cài đặt",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, MAX_IMAGES));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      Alert.alert("Vui lòng chọn số sao đánh giá");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Call API to submit review
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Đánh giá thành công", "Cảm ơn bạn đã đánh giá sản phẩm!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, images, isAnonymous, canSubmit]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={SHOPEE_COLORS.primary}
      />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Product Info */}
          <View style={styles.productSection}>
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              {product.variant && (
                <Text style={styles.productVariant}>
                  Phân loại: {product.variant}
                </Text>
              )}
              {product.orderId && (
                <Text style={styles.orderNumber}>
                  Đơn hàng: {product.orderId}
                </Text>
              )}
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Chất lượng sản phẩm</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingPress(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color={
                      star <= rating
                        ? SHOPEE_COLORS.star
                        : SHOPEE_COLORS.starInactive
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
            )}
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Nhận xét của bạn</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                placeholderTextColor={SHOPEE_COLORS.textTertiary}
                multiline
                maxLength={MAX_COMMENT_LENGTH}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {comment.length}/{MAX_COMMENT_LENGTH}
              </Text>
            </View>
          </View>

          {/* Images Section */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>
              Thêm hình ảnh/video ({images.length}/{MAX_IMAGES})
            </Text>
            <View style={styles.imagesGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={22}
                      color={SHOPEE_COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < MAX_IMAGES && (
                <>
                  <TouchableOpacity
                    style={styles.addImageBtn}
                    onPress={handlePickImages}
                  >
                    <Ionicons
                      name="images-outline"
                      size={28}
                      color={SHOPEE_COLORS.textSecondary}
                    />
                    <Text style={styles.addImageText}>Thư viện</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addImageBtn}
                    onPress={handleTakePhoto}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={28}
                      color={SHOPEE_COLORS.textSecondary}
                    />
                    <Text style={styles.addImageText}>Chụp ảnh</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Anonymous Option */}
          <View style={styles.anonymousSection}>
            <View style={styles.anonymousInfo}>
              <MaterialCommunityIcons
                name="incognito"
                size={24}
                color={SHOPEE_COLORS.textSecondary}
              />
              <View style={styles.anonymousText}>
                <Text style={styles.anonymousTitle}>Đánh giá ẩn danh</Text>
                <Text style={styles.anonymousDesc}>
                  Tên của bạn sẽ hiển thị là "Người dùng Shopee"
                </Text>
              </View>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{
                false: SHOPEE_COLORS.border,
                true: SHOPEE_COLORS.primaryLight,
              }}
              thumbColor={isAnonymous ? SHOPEE_COLORS.primary : "#fff"}
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Mẹo viết đánh giá hay</Text>
            <Text style={styles.tipsText}>
              • Chia sẻ trải nghiệm thực tế khi sử dụng sản phẩm
            </Text>
            <Text style={styles.tipsText}>
              • Thêm hình ảnh để người khác dễ hình dung
            </Text>
            <Text style={styles.tipsText}>
              • Nhận xét về chất lượng, đóng gói, giao hàng
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SHOPEE_COLORS.background },

  // Header
  header: {
    backgroundColor: SHOPEE_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },

  // Content
  content: { flex: 1 },

  // Product Section
  productSection: {
    flexDirection: "row",
    backgroundColor: SHOPEE_COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 4,
    backgroundColor: SHOPEE_COLORS.background,
  },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: SHOPEE_COLORS.text,
    lineHeight: 20,
  },
  productVariant: {
    fontSize: 12,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 4,
  },
  orderNumber: {
    fontSize: 12,
    color: SHOPEE_COLORS.textTertiary,
    marginTop: 2,
  },

  // Rating Section
  ratingSection: {
    backgroundColor: SHOPEE_COLORS.surface,
    padding: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: SHOPEE_COLORS.text,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  starsContainer: { flexDirection: "row", gap: 12 },
  starButton: { padding: 4 },
  ratingLabel: {
    fontSize: 14,
    color: SHOPEE_COLORS.primary,
    fontWeight: "500",
    marginTop: 12,
  },

  // Comment Section
  commentSection: {
    backgroundColor: SHOPEE_COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  textInputContainer: { position: "relative" },
  textInput: {
    backgroundColor: SHOPEE_COLORS.background,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    fontSize: 14,
    color: SHOPEE_COLORS.text,
    lineHeight: 20,
  },
  charCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: SHOPEE_COLORS.textTertiary,
  },

  // Images Section
  imagesSection: {
    backgroundColor: SHOPEE_COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  imagesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  imageItem: { position: "relative" },
  uploadedImage: { width: 80, height: 80, borderRadius: 8 },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 11,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: SHOPEE_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 11,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 4,
  },

  // Anonymous Section
  anonymousSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: SHOPEE_COLORS.surface,
    padding: 16,
    marginBottom: 8,
  },
  anonymousInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  anonymousText: { marginLeft: 12, flex: 1 },
  anonymousTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: SHOPEE_COLORS.text,
  },
  anonymousDesc: {
    fontSize: 12,
    color: SHOPEE_COLORS.textSecondary,
    marginTop: 2,
  },

  // Tips Section
  tipsSection: {
    backgroundColor: "#FFF8E1",
    padding: 16,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: SHOPEE_COLORS.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: SHOPEE_COLORS.textSecondary,
    lineHeight: 20,
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: SHOPEE_COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SHOPEE_COLORS.divider,
  },
  submitBtn: {
    backgroundColor: SHOPEE_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  submitBtnDisabled: { backgroundColor: SHOPEE_COLORS.textTertiary },
  submitBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
