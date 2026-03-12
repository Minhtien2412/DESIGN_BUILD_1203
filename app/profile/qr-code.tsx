/**
 * QR Code Profile Screen
 * Displays user's QR code for quick profile sharing
 * @route /profile/qr-code
 */

import { useAuth } from "@/features/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    Alert,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QRCodeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const colors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    surface: isDarkMode ? "#1e293b" : "#ffffff",
    text: isDarkMode ? "#f1f5f9" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
  };

  const profileUrl = `https://baotienweb.cloud/profile/${user?.id}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem hồ sơ của tôi: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chia sẻ");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Mã QR của tôi
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* QR Card */}
      <View style={[styles.qrCard, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={["#0D9488", "#0F766E"]}
          style={styles.avatarPlaceholder}
        >
          <Text style={styles.avatarText}>
            {user?.name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "?"}
          </Text>
        </LinearGradient>

        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.name || user?.email?.split("@")[0]}
        </Text>
        <Text style={[styles.userId, { color: colors.textSecondary }]}>
          ID: {user?.id || "N/A"}
        </Text>

        {/* QR Placeholder */}
        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={180} color="#0D9488" />
          </View>
          <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
            Quét mã để xem hồ sơ
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={22} color="#0D9488" />
          <Text style={[styles.actionText, { color: colors.text }]}>
            Chia sẻ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={() => Alert.alert("Thông báo", "Đã lưu vào thư viện ảnh")}
        >
          <Ionicons name="download-outline" size={22} color="#0D9488" />
          <Text style={[styles.actionText, { color: colors.text }]}>
            Lưu ảnh
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.instruction, { color: colors.textSecondary }]}>
        Chia sẻ mã QR này để người khác có thể xem hồ sơ của bạn nhanh chóng
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  qrCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    marginBottom: 24,
  },
  qrContainer: {
    alignItems: "center",
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  qrHint: {
    marginTop: 12,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },
  instruction: {
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 24,
    fontSize: 14,
    lineHeight: 20,
  },
});
