/**
 * Edit Address Screen
 * Chỉnh sửa địa chỉ nhận hàng
 *
 * @updated 2026-02-03
 */

import { Container } from "@/components/ui/container";
import ModernButton from "@/components/ui/modern-button";
import {
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY
} from "@/constants/modern-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import AddressService from "@/services/addressService";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// Types
// ============================================================================

interface AddressFormData {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  type: "home" | "office" | "other";
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  district?: string;
  city?: string;
}

// ============================================================================
// Constants
// ============================================================================

const ADDRESS_TYPES = [
  { key: "home" as const, label: "Nhà riêng", icon: "home" as const },
  { key: "office" as const, label: "Văn phòng", icon: "business" as const },
  { key: "other" as const, label: "Khác", icon: "location" as const },
];

// ============================================================================
// Component
// ============================================================================

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const primary = useThemeColor({}, "primary");
  const border = useThemeColor({}, "border");
  const surface = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
    type: "home",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load address
  useEffect(() => {
    loadAddress();
  }, [id]);

  const loadAddress = async () => {
    if (!id) {
      Alert.alert("Lỗi", "Không tìm thấy địa chỉ");
      router.back();
      return;
    }

    try {
      setLoading(true);
      const result = await AddressService.getAddresses();
      if (result.ok && result.data?.addresses) {
        const address = result.data.addresses.find((a) => a.id === id);
        if (address) {
          setFormData({
            name: address.name || "",
            phone: address.phone || "",
            address: address.address || "",
            ward: "",
            district: address.district || "",
            city: address.city || "",
            isDefault: address.isDefault || false,
            type: (address.type as any) || "home",
          });
        } else {
          throw new Error("Address not found");
        }
      } else {
        // Use mock data
        const mockAddress = AddressService.MOCK_ADDRESSES.find(
          (a) => a.id === id,
        );
        if (mockAddress) {
          setFormData({
            name: mockAddress.name || "",
            phone: mockAddress.phone || "",
            address: mockAddress.address || "",
            ward: "",
            district: mockAddress.district || "",
            city: mockAddress.city || "",
            isDefault: mockAddress.isDefault || false,
            type: (mockAddress.type as any) || "home",
          });
        }
      }
    } catch (error) {
      console.error("Error loading address:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Update form field
  const updateField = useCallback(
    (field: keyof AddressFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên người nhận";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!formData.district.trim()) {
      newErrors.district = "Vui lòng nhập quận/huyện";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Vui lòng nhập tỉnh/thành phố";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save address
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await AddressService.updateAddress(id!, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        isDefault: formData.isDefault,
        type: formData.type,
      });

      Alert.alert("Thành công", "Đã cập nhật địa chỉ", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("Lỗi", "Không thể cập nhật địa chỉ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Delete address
  const handleDelete = () => {
    Alert.alert("Xóa địa chỉ", "Bạn có chắc chắn muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await AddressService.deleteAddress(id!);
            Alert.alert("Thành công", "Đã xóa địa chỉ", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error) {
            console.error("Error deleting address:", error);
            Alert.alert("Lỗi", "Không thể xóa địa chỉ");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <Stack.Screen
          options={{ title: "Chỉnh sửa địa chỉ", headerShown: true }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={[styles.loadingText, { color: textMuted }]}>
            Đang tải...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chỉnh sửa địa chỉ",
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} disabled={deleting}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          ),
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
            {/* Contact Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Thông tin liên hệ
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Họ và tên *
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
                  placeholder="Nhập họ và tên người nhận"
                  placeholderTextColor={textMuted}
                  value={formData.name}
                  onChangeText={(v) => updateField("name", v)}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Số điện thoại *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      borderColor: errors.phone ? "#EF4444" : border,
                      color: textColor,
                    },
                  ]}
                  placeholder="0xxx xxx xxx"
                  placeholderTextColor={textMuted}
                  value={formData.phone}
                  onChangeText={(v) => updateField("phone", v)}
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>
            </View>

            {/* Address */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Địa chỉ
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Địa chỉ *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      borderColor: errors.address ? "#EF4444" : border,
                      color: textColor,
                    },
                  ]}
                  placeholder="Số nhà, tên đường"
                  placeholderTextColor={textMuted}
                  value={formData.address}
                  onChangeText={(v) => updateField("address", v)}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Quận/Huyện *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: surface,
                        borderColor: errors.district ? "#EF4444" : border,
                        color: textColor,
                      },
                    ]}
                    placeholder="Quận/Huyện"
                    placeholderTextColor={textMuted}
                    value={formData.district}
                    onChangeText={(v) => updateField("district", v)}
                  />
                  {errors.district && (
                    <Text style={styles.errorText}>{errors.district}</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Tỉnh/Thành *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: surface,
                        borderColor: errors.city ? "#EF4444" : border,
                        color: textColor,
                      },
                    ]}
                    placeholder="Tỉnh/Thành"
                    placeholderTextColor={textMuted}
                    value={formData.city}
                    onChangeText={(v) => updateField("city", v)}
                  />
                  {errors.city && (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Address Type */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Loại địa chỉ
              </Text>

              <View style={styles.typeContainer}>
                {ADDRESS_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeButton,
                      {
                        borderColor:
                          formData.type === type.key ? primary : border,
                      },
                      formData.type === type.key && {
                        backgroundColor: primary + "10",
                      },
                    ]}
                    onPress={() => updateField("type", type.key)}
                  >
                    <Ionicons
                      name={type.icon}
                      size={20}
                      color={formData.type === type.key ? primary : textMuted}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        {
                          color:
                            formData.type === type.key ? primary : textColor,
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Default Address */}
            <View style={[styles.section, styles.switchSection]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: textColor }]}>
                  Đặt làm địa chỉ mặc định
                </Text>
                <Text style={[styles.switchHint, { color: textMuted }]}>
                  Địa chỉ này sẽ được chọn tự động khi đặt hàng
                </Text>
              </View>
              <Switch
                value={formData.isDefault}
                onValueChange={(v) => updateField("isDefault", v)}
                trackColor={{ false: border, true: primary + "60" }}
                thumbColor={formData.isDefault ? primary : "#f4f3f4"}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <ModernButton
                onPress={handleSave}
                loading={saving}
                disabled={saving || deleting}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </ModernButton>
              <ModernButton
                onPress={() => router.back()}
                variant="outline"
                disabled={saving || deleting}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: MODERN_SPACING.md,
    fontSize: 14,
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
    marginBottom: MODERN_SPACING.md,
  },
  inputGroup: {
    marginTop: MODERN_SPACING.sm,
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
  errorText: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#EF4444",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
    gap: MODERN_SPACING.xs,
  },
  typeLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
  },
  switchSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchInfo: {
    flex: 1,
    marginRight: MODERN_SPACING.md,
  },
  switchLabel: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.md,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
  },
  switchHint: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.sm,
    color: "#666",
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: MODERN_SPACING.xl,
    gap: MODERN_SPACING.md,
  },
});
