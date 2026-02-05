/**
 * Shop Settings - Shopee/TikTok Style
 * Cài đặt thông tin cửa hàng
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";

// Types
interface ShopInfo {
  id: number;
  name: string;
  logo: string;
  banner: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  isVerified: boolean;
  isActive: boolean;
  autoReply: boolean;
  autoReplyMessage: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    zalo?: string;
  };
  policies: {
    returnPolicy: string;
    shippingPolicy: string;
  };
}

export default function ShopSettingsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ShopInfo>>({});

  // Fetch shop info
  const fetchShopInfo = useCallback(async () => {
    try {
      // In production: const response = await apiFetch('/seller/shop');

      // Mock data
      setShop({
        id: 1,
        name: "Thiết Kế Kiến Trúc Pro",
        logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200",
        banner:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        description:
          "Chuyên thiết kế kiến trúc, nội thất và thi công xây dựng với hơn 10 năm kinh nghiệm. Cam kết chất lượng và uy tín.",
        phone: "0901234567",
        email: "contact@kientrucpro.vn",
        address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
        category: "Thiết kế & Xây dựng",
        isVerified: true,
        isActive: true,
        autoReply: true,
        autoReplyMessage:
          "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
        workingHours: {
          start: "08:00",
          end: "18:00",
          days: ["T2", "T3", "T4", "T5", "T6", "T7"],
        },
        socialLinks: {
          facebook: "https://facebook.com/kientrucpro",
          instagram: "https://instagram.com/kientrucpro",
          zalo: "0901234567",
        },
        policies: {
          returnPolicy:
            "Hỗ trợ chỉnh sửa miễn phí trong 7 ngày kể từ khi giao bản thiết kế.",
          shippingPolicy:
            "Giao file thiết kế qua email hoặc drive trong 24-48 giờ.",
        },
      });
    } catch (error) {
      console.error("[ShopSettings] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchShopInfo();
  }, [fetchShopInfo]);

  useEffect(() => {
    if (shop && editMode) {
      setFormData(shop);
    }
  }, [shop, editMode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShopInfo();
  };

  // Pick image
  const handlePickImage = async (type: "logo" | "banner") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "logo" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        [type]: result.assets[0].uri,
      }));
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      // In production: await apiFetch('/seller/shop', { method: 'PUT', body: formData });

      // Update local state
      setShop((prev) => (prev ? { ...prev, ...formData } : null));
      setEditMode(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin cửa hàng!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  // Toggle settings
  const handleToggle = async (
    key: "isActive" | "autoReply",
    value: boolean,
  ) => {
    try {
      // In production: await apiFetch('/seller/shop/settings', { method: 'PATCH', body: { [key]: value } });
      setShop((prev) => (prev ? { ...prev, [key]: value } : null));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật cài đặt");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="storefront-outline" size={64} color="#D1D5DB" />
        <Text style={styles.errorText}>Không tìm thấy thông tin cửa hàng</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B35"]}
          />
        }
      >
        {/* Shop Header */}
        <View style={styles.headerSection}>
          <Pressable
            onPress={() => editMode && handlePickImage("banner")}
            style={styles.bannerContainer}
          >
            <Image
              source={{
                uri: editMode ? formData.banner || shop.banner : shop.banner,
              }}
              style={styles.banner}
            />
            {editMode && (
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => editMode && handlePickImage("logo")}
            style={styles.logoContainer}
          >
            <Image
              source={{
                uri: editMode ? formData.logo || shop.logo : shop.logo,
              }}
              style={styles.logo}
            />
            {editMode && (
              <View style={styles.logoEditBadge}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            )}
            {shop.isVerified && !editMode && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
            )}
          </Pressable>
        </View>

        {/* Edit Toggle */}
        <View style={styles.editToggleRow}>
          <Pressable
            style={[
              styles.editToggleBtn,
              editMode && styles.editToggleBtnActive,
            ]}
            onPress={() => {
              if (editMode) {
                setFormData({});
              }
              setEditMode(!editMode);
            }}
          >
            <Ionicons
              name={editMode ? "close" : "create-outline"}
              size={20}
              color={editMode ? "#FFFFFF" : "#FF6B35"}
            />
            <Text
              style={[
                styles.editToggleText,
                editMode && styles.editToggleTextActive,
              ]}
            >
              {editMode ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
            </Text>
          </Pressable>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tên cửa hàng</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.name || shop.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Nhập tên cửa hàng"
              />
            ) : (
              <Text style={styles.value}>{shop.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mô tả</Text>
            {editMode ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description || shop.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="Mô tả về cửa hàng của bạn"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.value}>{shop.description}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Danh mục</Text>
            <Text style={styles.value}>{shop.category}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.phone || shop.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
                placeholder="0901234567"
              />
            ) : (
              <Text style={styles.value}>{shop.phone}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.email || shop.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                placeholder="email@example.com"
              />
            ) : (
              <Text style={styles.value}>{shop.email}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            {editMode ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address || shop.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, address: text }))
                }
                placeholder="Nhập địa chỉ"
                multiline
              />
            ) : (
              <Text style={styles.value}>{shop.address}</Text>
            )}
          </View>
        </View>

        {/* Shop Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái cửa hàng</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Mở cửa hàng</Text>
              <Text style={styles.toggleHint}>
                Khi tắt, khách hàng không thể mua hàng
              </Text>
            </View>
            <Switch
              value={shop.isActive}
              onValueChange={(value) => handleToggle("isActive", value)}
              trackColor={{ false: "#D1D5DB", true: "#FFB088" }}
              thumbColor={shop.isActive ? "#FF6B35" : "#9CA3AF"}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Tự động trả lời</Text>
              <Text style={styles.toggleHint}>
                Gửi tin nhắn tự động khi có khách liên hệ
              </Text>
            </View>
            <Switch
              value={shop.autoReply}
              onValueChange={(value) => handleToggle("autoReply", value)}
              trackColor={{ false: "#D1D5DB", true: "#FFB088" }}
              thumbColor={shop.autoReply ? "#FF6B35" : "#9CA3AF"}
            />
          </View>

          {shop.autoReply && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tin nhắn tự động</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={shop.autoReplyMessage}
                onChangeText={(text) =>
                  setShop((prev) =>
                    prev ? { ...prev, autoReplyMessage: text } : null,
                  )
                }
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên kết mạng xã hội</Text>

          {[
            {
              key: "facebook",
              icon: "logo-facebook",
              color: "#1877F2",
              label: "Facebook",
            },
            {
              key: "instagram",
              icon: "logo-instagram",
              color: "#E4405F",
              label: "Instagram",
            },
            {
              key: "tiktok",
              icon: "logo-tiktok",
              color: "#000000",
              label: "TikTok",
            },
            {
              key: "zalo",
              icon: "chatbubble-ellipses",
              color: "#0068FF",
              label: "Zalo",
            },
          ].map((social) => (
            <Pressable key={social.key} style={styles.socialRow}>
              <View
                style={[
                  styles.socialIcon,
                  { backgroundColor: `${social.color}15` },
                ]}
              >
                <Ionicons
                  name={social.icon as any}
                  size={20}
                  color={social.color}
                />
              </View>
              <View style={styles.socialInfo}>
                <Text style={styles.socialLabel}>{social.label}</Text>
                <Text style={styles.socialValue} numberOfLines={1}>
                  {shop.socialLinks[
                    social.key as keyof typeof shop.socialLinks
                  ] || "Chưa liên kết"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>

        {/* Policies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chính sách cửa hàng</Text>

          <Pressable style={styles.policyRow}>
            <Ionicons name="refresh-outline" size={20} color="#6B7280" />
            <View style={styles.policyInfo}>
              <Text style={styles.policyLabel}>Chính sách đổi trả</Text>
              <Text style={styles.policyValue} numberOfLines={2}>
                {shop.policies.returnPolicy}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable style={styles.policyRow}>
            <Ionicons name="cube-outline" size={20} color="#6B7280" />
            <View style={styles.policyInfo}>
              <Text style={styles.policyLabel}>Chính sách giao hàng</Text>
              <Text style={styles.policyValue} numberOfLines={2}>
                {shop.policies.shippingPolicy}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Save Button */}
        {editMode && (
          <View style={styles.saveSection}>
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
  headerSection: {
    marginBottom: 16,
  },
  bannerContainer: {
    height: 150,
    position: "relative",
  },
  banner: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    bottom: -40,
    left: 20,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
  },
  logoEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  editToggleRow: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  editToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  editToggleBtnActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  editToggleText: {
    fontSize: 13,
    color: "#FF6B35",
    marginLeft: 6,
    fontWeight: "500",
  },
  editToggleTextActive: {
    color: "#FFFFFF",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  value: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  toggleHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  socialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  socialLabel: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  socialValue: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  policyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  policyLabel: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  policyValue: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
  saveSection: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
