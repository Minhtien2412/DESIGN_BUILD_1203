import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  route?: string;
  badge?: string;
  color: string;
}

export default function ProfileMenuScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, "primary");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");

  const accountMenu: MenuItem[] = [
    {
      icon: "person-outline",
      title: "Thông tin cá nhân",
      description: "Quản lý thông tin và hồ sơ",
      route: "/profile/info",
      color: "#3B82F6",
    },
    {
      icon: "create-outline",
      title: "Chỉnh sửa nhanh",
      description: "Cập nhật tên, điện thoại, avatar",
      route: "/profile/edit",
      color: "#0891B2",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Bảo mật",
      description: "Mật khẩu và xác thực",
      route: "/profile/security",
      color: "#0066CC",
    },
    {
      icon: "card-outline",
      title: "Phương thức thanh toán",
      description: "Quản lý thẻ và ví điện tử",
      route: "/profile/payment-methods",
      color: "#0066CC",
    },
    {
      icon: "notifications-outline",
      title: "Thông báo",
      description: "Cài đặt nhận thông báo",
      route: "/profile/notifications",
      badge: "3",
      color: "#000000",
    },
  ];

  const activityMenu: MenuItem[] = [
    {
      icon: "cube-outline",
      title: "Sản phẩm của tôi",
      description: "Quản lý sản phẩm đã đăng",
      route: "/profile/my-products",
      color: "#0066CC",
    },
    {
      icon: "heart-outline",
      title: "Yêu thích",
      description: "Sản phẩm và dịch vụ đã lưu",
      route: "/profile/favorites",
      color: "#666666",
    },
    {
      icon: "time-outline",
      title: "Lịch sử",
      description: "Hoạt động gần đây",
      route: "/profile/history",
      color: "#666666",
    },
    {
      icon: "receipt-outline",
      title: "Đơn hàng",
      description: "Theo dõi đơn hàng của bạn",
      route: "/profile/orders",
      color: "#14B8A6",
    },
  ];

  const settingsMenu: MenuItem[] = [
    {
      icon: "settings-outline",
      title: "Cài đặt chung",
      description: "Ngôn ngữ, giao diện, dữ liệu",
      route: "/profile/settings",
      color: "#6B7280",
    },
    {
      icon: "pulse-outline",
      title: "Trạng thái hệ thống",
      description: "Kiểm tra trạng thái các API",
      route: "/(tabs)/api-status",
      color: "#10B981",
    },
    {
      icon: "sparkles-outline",
      title: "Trợ lý AI",
      description: "Hỗ trợ chỉnh sửa app với AI",
      route: "/(tabs)/ai-assistant",
      color: "#8B5CF6",
    },
    {
      icon: "shield-outline",
      title: "Quyền truy cập",
      description: "Camera, vị trí, thông báo",
      route: "/profile/permissions",
      color: "#0066CC",
    },
    {
      icon: "lock-closed-outline",
      title: "Bảo mật & Riêng tư",
      description: "Kiểm soát dữ liệu cá nhân",
      route: "/profile/privacy",
      color: "#0066CC",
    },
  ];

  const supportMenu: MenuItem[] = [
    {
      icon: "help-circle-outline",
      title: "Trợ giúp",
      description: "FAQ và hỗ trợ khách hàng",
      route: "/profile/help",
      color: "#3B82F6",
    },
    {
      icon: "document-text-outline",
      title: "Điều khoản dịch vụ",
      description: "Quy định và chính sách",
      route: "/profile/terms",
      color: "#6B7280",
    },
    {
      icon: "information-circle-outline",
      title: "Về chúng tôi",
      description: "Thông tin ứng dụng",
      route: "/profile/about",
      color: "#666666",
    },
  ];

  const renderSection = (title: string, items: MenuItem[]) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textMuted }]}>{title}</Text>
      <View style={styles.menuList}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuCard,
              { backgroundColor: surface, borderColor: border },
            ]}
            onPress={() => item.route && router.push(item.route as Href)}
          >
            <View
              style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}
            >
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={[styles.menuTitle, { color: text }]}>
                  {item.title}
                </Text>
                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: "#000000" }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.menuDescription, { color: textMuted }]}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Cài đặt & Tiện ích",
          headerBackTitle: "Quay lại",
        }}
      />

      <View style={[styles.container, { backgroundColor: background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderSection("Tài khoản", accountMenu)}
          {renderSection("Hoạt động", activityMenu)}
          {renderSection("Cài đặt", settingsMenu)}
          {renderSection("Hỗ trợ", supportMenu)}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuList: {
    gap: 12,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuDescription: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
