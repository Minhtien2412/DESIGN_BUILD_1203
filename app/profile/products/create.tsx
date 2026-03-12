/**
 * Create Product Screen
 * Tạo sản phẩm mới với đầy đủ thông tin
 *
 * @updated 2026-02-03
 *
 * Features:
 * - Form nhập thông tin sản phẩm
 * - Upload nhiều hình ảnh
 * - Chọn danh mục
 * - Nhập giá, số lượng
 * - Preview trước khi đăng
 */

import { Container } from "@/components/ui/container";
import ModernButton from "@/components/ui/modern-button";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY,
} from "@/constants/modern-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { productService } from "@/services/api/product.service";
import { ProductCategory, ProductStatus } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// ============================================================================
// Types
// ============================================================================

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  brand: string;
  sku: string;
  unit: string;
  specifications: string;
  warranty: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  images?: string;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES = [
  { value: "cement", label: "Xi măng" },
  { value: "brick", label: "Gạch" },
  { value: "steel", label: "Thép" },
  { value: "sand", label: "Cát" },
  { value: "paint", label: "Sơn" },
  { value: "plumbing", label: "Thiết bị vệ sinh" },
  { value: "electrical", label: "Điện" },
  { value: "furniture", label: "Nội thất" },
  { value: "tools", label: "Dụng cụ" },
  { value: "other", label: "Khác" },
];

const UNITS = ["cái", "bộ", "bao", "m2", "m3", "kg", "tấn", "hộp", "thùng"];

// ============================================================================
// Component
// ============================================================================

export default function CreateProductScreen() {
  const primary = useThemeColor({}, "primary");
  const border = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    sku: "",
    unit: "cái",
    specifications: "",
    warranty: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  // Update form field
  const updateField = useCallback(
    (field: keyof ProductFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user types
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  // Pick images
  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Quyền truy cập",
        "Cần quyền truy cập thư viện ảnh để tải lên hình ảnh",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    }
  };

  // Take photo
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Cần quyền truy cập camera để chụp ảnh");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    } else if (formData.name.length < 10) {
      newErrors.name = "Tên sản phẩm tối thiểu 10 ký tự";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Vui lòng nhập giá hợp lệ";
    }

    if (!formData.category) {
      newErrors.category = "Vui lòng chọn danh mục";
    }

    if (images.length === 0) {
      newErrors.images = "Vui lòng thêm ít nhất 1 hình ảnh";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Thông tin chưa đầy đủ",
        "Vui lòng kiểm tra lại các trường bắt buộc",
      );
      return;
    }

    setLoading(true);
    try {
      // Upload images first (TODO: implement image upload)
      // For now, use placeholder URLs
      const imageUrls =
        images.length > 0 ? images : ["https://picsum.photos/400/400?random=1"];

      // Create product
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        stock: formData.stock ? Number(formData.stock) : 0,
        category: formData.category as ProductCategory,
        images: imageUrls,
        brand: formData.brand.trim() || undefined,
        sku: formData.sku.trim() || undefined,
        unit: formData.unit || "cái",
        specifications: formData.specifications.trim() || undefined,
        warranty: formData.warranty.trim() || undefined,
        status: ProductStatus.PENDING, // Pending approval
      };

      console.log("[CreateProduct] Submitting:", productData);
      await productService.createProduct(productData);

      Alert.alert(
        "Thành công",
        "Sản phẩm đã được tạo và đang chờ duyệt. Bạn sẽ nhận thông báo khi sản phẩm được duyệt.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("[CreateProduct] Error:", error);
      Alert.alert("Lỗi", "Không thể tạo sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = () => {
    const cat = CATEGORIES.find((c) => c.value === formData.category);
    return cat?.label || "Chọn danh mục";
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tạo sản phẩm mới",
          headerShown: true,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            {/* Images Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Hình ảnh sản phẩm *
              </Text>
              <Text style={[styles.sectionHint, { color: textMuted }]}>
                Tối đa 5 hình. Hình đầu tiên sẽ là ảnh đại diện.
              </Text>

              <View style={styles.imagesContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.productImage} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.mainBadge}>
                        <Text style={styles.mainBadgeText}>Chính</Text>
                      </View>
                    )}
                  </View>
                ))}

                {images.length < 5 && (
                  <View style={styles.addImageButtons}>
                    <TouchableOpacity
                      style={[styles.addImageBtn, { borderColor: border }]}
                      onPress={pickImages}
                    >
                      <Ionicons
                        name="images-outline"
                        size={28}
                        color={primary}
                      />
                      <Text style={[styles.addImageText, { color: textMuted }]}>
                        Thư viện
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.addImageBtn, { borderColor: border }]}
                      onPress={takePhoto}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={28}
                        color={primary}
                      />
                      <Text style={[styles.addImageText, { color: textMuted }]}>
                        Chụp ảnh
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {errors.images && (
                <Text style={styles.errorText}>{errors.images}</Text>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Thông tin cơ bản
              </Text>

              {/* Product Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Tên sản phẩm *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      borderColor: errors.name ? "#EF4444" : border,
                      color: textColor,
                    },
                  ]}
                  placeholder="VD: Xi măng PCB40 Holcim - Bao 50kg"
                  placeholderTextColor={textMuted}
                  value={formData.name}
                  onChangeText={(v) => updateField("name", v)}
                  maxLength={200}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
                <Text style={[styles.charCount, { color: textMuted }]}>
                  {formData.name.length}/200
                </Text>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Danh mục *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectInput,
                    {
                      backgroundColor: surface,
                      borderColor: errors.category ? "#EF4444" : border,
                    },
                  ]}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      { color: formData.category ? textColor : textMuted },
                    ]}
                  >
                    {getCategoryLabel()}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={textMuted} />
                </TouchableOpacity>
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}

                {showCategoryPicker && (
                  <View
                    style={[
                      styles.pickerOptions,
                      { backgroundColor: surface, borderColor: border },
                    ]}
                  >
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.value}
                        style={[
                          styles.pickerOption,
                          formData.category === cat.value && {
                            backgroundColor: primary + "20",
                          },
                        ]}
                        onPress={() => {
                          updateField("category", cat.value);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            {
                              color:
                                formData.category === cat.value
                                  ? primary
                                  : textColor,
                            },
                          ]}
                        >
                          {cat.label}
                        </Text>
                        {formData.category === cat.value && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Mô tả sản phẩm
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: surface,
                      borderColor: border,
                      color: textColor,
                    },
                  ]}
                  placeholder="Mô tả chi tiết về sản phẩm, công dụng, đặc điểm nổi bật..."
                  placeholderTextColor={textMuted}
                  value={formData.description}
                  onChangeText={(v) => updateField("description", v)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <Text style={[styles.charCount, { color: textMuted }]}>
                  {formData.description.length}/2000
                </Text>
              </View>
            </View>

            {/* Price & Stock */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Giá & Kho hàng
              </Text>

              <View style={styles.row}>
                {/* Price */}
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Giá bán *
                  </Text>
                  <View
                    style={[
                      styles.priceInput,
                      {
                        backgroundColor: surface,
                        borderColor: errors.price ? "#EF4444" : border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.priceValue, { color: textColor }]}
                      placeholder="0"
                      placeholderTextColor={textMuted}
                      value={formData.price}
                      onChangeText={(v) =>
                        updateField("price", v.replace(/[^0-9]/g, ""))
                      }
                      keyboardType="numeric"
                    />
                    <Text style={[styles.currency, { color: textMuted }]}>
                      ₫
                    </Text>
                  </View>
                  {errors.price && (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  )}
                </View>

                {/* Stock */}
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Số lượng
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: surface,
                        borderColor: border,
                        color: textColor,
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={textMuted}
                    value={formData.stock}
                    onChangeText={(v) =>
                      updateField("stock", v.replace(/[^0-9]/g, ""))
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Unit */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Đơn vị</Text>
                <TouchableOpacity
                  style={[
                    styles.selectInput,
                    { backgroundColor: surface, borderColor: border },
                  ]}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                >
                  <Text style={[styles.selectText, { color: textColor }]}>
                    {formData.unit}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={textMuted} />
                </TouchableOpacity>

                {showUnitPicker && (
                  <View
                    style={[
                      styles.pickerOptions,
                      styles.unitPicker,
                      { backgroundColor: surface, borderColor: border },
                    ]}
                  >
                    {UNITS.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.pickerOption,
                          styles.unitOption,
                          formData.unit === unit && {
                            backgroundColor: primary + "20",
                          },
                        ]}
                        onPress={() => {
                          updateField("unit", unit);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            {
                              color:
                                formData.unit === unit ? primary : textColor,
                            },
                          ]}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Thông tin bổ sung
              </Text>

              {/* Brand */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Thương hiệu
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      borderColor: border,
                      color: textColor,
                    },
                  ]}
                  placeholder="VD: Holcim, Viglacera, Dulux..."
                  placeholderTextColor={textMuted}
                  value={formData.brand}
                  onChangeText={(v) => updateField("brand", v)}
                />
              </View>

              {/* SKU */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Mã SKU</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      borderColor: border,
                      color: textColor,
                    },
                  ]}
                  placeholder="Mã sản phẩm của bạn"
                  placeholderTextColor={textMuted}
                  value={formData.sku}
                  onChangeText={(v) => updateField("sku", v)}
                />
              </View>

              {/* Specifications */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Thông số kỹ thuật
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: surface,
                      borderColor: border,
                      color: textColor,
                    },
                  ]}
                  placeholder="Kích thước, trọng lượng, chất liệu..."
                  placeholderTextColor={textMuted}
                  value={formData.specifications}
                  onChangeText={(v) => updateField("specifications", v)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Warranty */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Bảo hành
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      borderColor: border,
                      color: textColor,
                    },
                  ]}
                  placeholder="VD: 12 tháng, 24 tháng..."
                  placeholderTextColor={textMuted}
                  value={formData.warranty}
                  onChangeText={(v) => updateField("warranty", v)}
                />
              </View>
            </View>

            {/* Notice */}
            <View
              style={[
                styles.noticeCard,
                { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" },
              ]}
            >
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={[styles.noticeText, { color: "#92400E" }]}>
                Sản phẩm sẽ được kiểm duyệt trước khi hiển thị công khai. Thời
                gian duyệt: 24-48 giờ làm việc.
              </Text>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <ModernButton
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? "Đang tạo..." : "Đăng sản phẩm"}
              </ModernButton>
              <ModernButton
                onPress={() => router.back()}
                variant="outline"
                style={styles.cancelButton}
                disabled={loading}
              >
                Hủy
              </ModernButton>
            </View>

            <View style={{ height: 40 }} />
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  section: {
    backgroundColor: "#fff",
    padding: MODERN_SPACING.lg,
    marginTop: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
  },
  sectionTitle: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
    marginBottom: MODERN_SPACING.xs,
  },
  sectionHint: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#666",
    marginBottom: MODERN_SPACING.md,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  imageWrapper: {
    position: "relative",
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: "#F0F0F0",
  },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  addImageButtons: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: MODERN_RADIUS.sm,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addImageText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#666",
  },
  inputGroup: {
    marginTop: MODERN_SPACING.md,
  },
  label: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    marginBottom: MODERN_SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm + 2,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: MODERN_SPACING.sm + 2,
  },
  charCount: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm + 4,
  },
  selectText: {
    fontSize: 15,
  },
  pickerOptions: {
    marginTop: MODERN_SPACING.xs,
    borderWidth: 1,
    borderRadius: MODERN_RADIUS.md,
    maxHeight: 200,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm + 2,
  },
  pickerOptionText: {
    fontSize: 15,
  },
  unitPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxHeight: undefined,
  },
  unitOption: {
    flex: 0,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    margin: 4,
    borderRadius: MODERN_RADIUS.sm,
  },
  row: {
    flexDirection: "row",
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
  },
  priceValue: {
    flex: 1,
    fontSize: 15,
    paddingVertical: MODERN_SPACING.sm + 2,
  },
  currency: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: MODERN_SPACING.xs,
  },
  errorText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#EF4444",
    marginTop: 4,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
    marginTop: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: MODERN_SPACING.xl,
    gap: MODERN_SPACING.md,
  },
  submitButton: {
    paddingVertical: MODERN_SPACING.md,
  },
  cancelButton: {
    paddingVertical: MODERN_SPACING.md,
  },
});
