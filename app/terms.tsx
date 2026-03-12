/**
 * Terms and Privacy Policy Screen
 * @route /terms
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
};

type TabType = "terms" | "privacy";

const TERMS_CONTENT = [
  {
    title: "1. Giới thiệu",
    content: `Chào mừng bạn đến với ứng dụng ThietKeResort. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây. Vui lòng đọc kỹ trước khi sử dụng.`,
  },
  {
    title: "2. Tài khoản người dùng",
    content: `- Bạn phải từ 18 tuổi trở lên để tạo tài khoản
- Thông tin đăng ký phải chính xác và đầy đủ
- Bạn có trách nhiệm bảo mật thông tin tài khoản
- Không được chia sẻ tài khoản cho người khác`,
  },
  {
    title: "3. Sử dụng dịch vụ",
    content: `- Không sử dụng dịch vụ cho mục đích bất hợp pháp
- Không làm gián đoạn hoạt động của hệ thống
- Không đăng tải nội dung vi phạm pháp luật
- Tôn trọng quyền sở hữu trí tuệ`,
  },
  {
    title: "4. Thanh toán và đơn hàng",
    content: `- Giá sản phẩm có thể thay đổi mà không cần thông báo trước
- Đơn hàng chỉ được xác nhận khi thanh toán thành công
- Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong một số trường hợp`,
  },
  {
    title: "5. Chính sách đổi trả",
    content: `- Sản phẩm được đổi trả trong vòng 7 ngày
- Sản phẩm phải còn nguyên tem, nhãn mác
- Không áp dụng cho sản phẩm đã qua sử dụng
- Chi phí vận chuyển do khách hàng chịu`,
  },
  {
    title: "6. Giới hạn trách nhiệm",
    content: `Chúng tôi không chịu trách nhiệm về:
- Thiệt hại gián tiếp từ việc sử dụng dịch vụ
- Gián đoạn dịch vụ do lỗi kỹ thuật
- Nội dung do người dùng đăng tải`,
  },
];

const PRIVACY_CONTENT = [
  {
    title: "1. Thu thập thông tin",
    content: `Chúng tôi thu thập các thông tin sau:
- Thông tin cá nhân: họ tên, email, số điện thoại, địa chỉ
- Thông tin thiết bị: loại thiết bị, hệ điều hành, IP
- Thông tin sử dụng: lịch sử mua hàng, tương tác trong app`,
  },
  {
    title: "2. Mục đích sử dụng",
    content: `- Xử lý đơn hàng và giao hàng
- Cung cấp hỗ trợ khách hàng
- Cải thiện sản phẩm và dịch vụ
- Gửi thông báo khuyến mãi (có thể tắt)`,
  },
  {
    title: "3. Chia sẻ thông tin",
    content: `Chúng tôi KHÔNG bán thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ với:
- Đối tác vận chuyển để giao hàng
- Đối tác thanh toán để xử lý giao dịch
- Cơ quan pháp luật khi được yêu cầu`,
  },
  {
    title: "4. Bảo mật dữ liệu",
    content: `- Sử dụng mã hóa SSL/TLS cho mọi giao dịch
- Không lưu trữ thông tin thẻ tín dụng
- Kiểm tra bảo mật định kỳ
- Hạn chế quyền truy cập dữ liệu`,
  },
  {
    title: "5. Quyền của bạn",
    content: `Bạn có quyền:
- Truy cập và xem thông tin cá nhân
- Chỉnh sửa hoặc cập nhật thông tin
- Yêu cầu xóa tài khoản và dữ liệu
- Từ chối nhận email marketing`,
  },
  {
    title: "6. Cookie và tracking",
    content: `- Chúng tôi sử dụng cookie để cải thiện trải nghiệm
- Bạn có thể tắt cookie trong cài đặt trình duyệt
- Một số tính năng có thể không hoạt động nếu tắt cookie`,
  },
  {
    title: "7. Liên hệ",
    content: `Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ:
- Email: privacy@thietkesort.com
- Hotline: 1900-xxxx
- Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM`,
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("terms");

  const content = activeTab === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Điều khoản & Chính sách</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "terms" && styles.tabActive]}
          onPress={() => setActiveTab("terms")}
        >
          <Ionicons
            name="document-text"
            size={18}
            color={
              activeTab === "terms" ? COLORS.primary : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "terms" && styles.tabTextActive,
            ]}
          >
            Điều khoản
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "privacy" && styles.tabActive]}
          onPress={() => setActiveTab("privacy")}
        >
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={
              activeTab === "privacy" ? COLORS.primary : COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "privacy" && styles.tabTextActive,
            ]}
          >
            Quyền riêng tư
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Ionicons name="time" size={16} color={COLORS.textSecondary} />
          <Text style={styles.updateText}>Cập nhật lần cuối: 15/01/2026</Text>
        </View>

        {/* Content */}
        {content.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bằng việc sử dụng ứng dụng, bạn đồng ý với các điều khoản và chính
            sách trên.
          </Text>
          <View style={styles.footerButtons}>
            <Pressable
              style={styles.footerButton}
              onPress={() => router.push("/customer-support")}
            >
              <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
              <Text style={styles.footerButtonText}>Liên hệ hỗ trợ</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
  },
  tabActive: {
    backgroundColor: COLORS.primary + "15",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: { padding: 20 },
  updateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  updateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: COLORS.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  footerButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.primary,
  },
});
