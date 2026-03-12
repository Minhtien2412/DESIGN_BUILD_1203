import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ActionItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const QUICK_ACTIONS: ActionItem[] = [
  {
    id: "payment-history",
    title: "Lịch sử giao dịch",
    icon: "time-outline",
    route: "/profile/payment-history",
  },
  {
    id: "activity-history",
    title: "Lịch sử hoạt động",
    icon: "list-outline",
    route: "/profile/history",
  },
  {
    id: "favorites",
    title: "Thợ yêu thích",
    icon: "heart-outline",
    route: "/profile/favorites",
  },
  {
    id: "payment-methods",
    title: "Phương thức thanh toán",
    icon: "card-outline",
    route: "/profile/payment-methods",
  },
  {
    id: "notification-settings",
    title: "Cài đặt thông báo",
    icon: "notifications-outline",
    route: "/notification-settings",
  },
];

export default function ProfileTabScreen() {
  const { user, signOut } = useAuth();

  const userName = user?.name || user?.email?.split("@")[0] || "Khách hàng";
  const userPhone = user?.phone || "Chưa cập nhật số điện thoại";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <LinearGradient
      colors={["#020617", "#0B1220", "#111827"]}
      style={styles.bg}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.header}>Tài khoản</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{userName}</Text>
              <Text style={styles.phone}>{userPhone}</Text>
              <Text style={styles.badge}>Tài khoản khách hàng</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Thanh toán & QR</Text>
            <View style={styles.row2}>
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push("/utilities/my-qr-code" as any)}
              >
                <Ionicons name="qr-code-outline" size={20} color="#60A5FA" />
                <Text style={styles.actionButtonText}>Mã QR của tôi</Text>
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push("/profile/payment" as any)}
              >
                <Ionicons name="wallet-outline" size={20} color="#22D3EE" />
                <Text style={styles.actionButtonText}>Thanh toán</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tiện ích tài khoản</Text>
            <View style={styles.quickList}>
              {QUICK_ACTIONS.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.listItem}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.listIconWrap}>
                    <Ionicons name={item.icon} size={18} color="#C4B5FD" />
                  </View>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.referralCard}>
            <Text style={styles.referralTitle}>
              Giới thiệu bạn bè nhận ưu đãi
            </Text>
            <Text style={styles.referralDesc}>
              Chia sẻ mã giới thiệu để nhận điểm thưởng cho mỗi đơn dịch vụ
              thành công.
            </Text>
            <Pressable style={styles.referralBtn}>
              <Text style={styles.referralBtnText}>Mời bạn ngay</Text>
            </Pressable>
          </View>

          <Pressable style={styles.logoutBtn} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={18} color="#FCA5A5" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 130,
    gap: 14,
  },
  header: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "rgba(15,23,42,0.75)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.25)",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },
  avatarText: {
    color: "#EFF6FF",
    fontWeight: "800",
    fontSize: 20,
  },
  name: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "700",
  },
  phone: {
    color: "#94A3B8",
    marginTop: 2,
    fontSize: 13,
  },
  badge: {
    marginTop: 6,
    alignSelf: "flex-start",
    color: "#93C5FD",
    backgroundColor: "rgba(30,64,175,0.35)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.35)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "rgba(15,23,42,0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: "#E2E8F0",
    fontWeight: "700",
    fontSize: 16,
  },
  row2: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "rgba(30,41,59,0.9)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  quickList: {
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "rgba(30,41,59,0.75)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  listIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,70,229,0.25)",
  },
  listTitle: {
    flex: 1,
    color: "#E2E8F0",
    fontWeight: "600",
    fontSize: 13,
  },
  referralCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.35)",
    backgroundColor: "rgba(6,182,212,0.14)",
    padding: 14,
    gap: 8,
  },
  referralTitle: {
    color: "#E0F2FE",
    fontWeight: "700",
    fontSize: 15,
  },
  referralDesc: {
    color: "#BAE6FD",
    lineHeight: 18,
    fontSize: 12,
  },
  referralBtn: {
    marginTop: 2,
    alignSelf: "flex-start",
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  referralBtnText: {
    color: "#F0F9FF",
    fontWeight: "700",
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "rgba(127,29,29,0.25)",
    borderWidth: 1,
    borderColor: "rgba(252,165,165,0.35)",
    paddingVertical: 12,
  },
  logoutText: {
    color: "#FCA5A5",
    fontWeight: "700",
    fontSize: 13,
  },
});
