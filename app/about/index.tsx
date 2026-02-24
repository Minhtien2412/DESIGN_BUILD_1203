import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AboutScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");

  const features = [
    {
      icon: "home-outline",
      title: "Thiết kế nội thất",
      desc: "AI hỗ trợ thiết kế",
    },
    {
      icon: "construct-outline",
      title: "Quản lý dự án",
      desc: "Theo dõi tiến độ xây dựng",
    },
    { icon: "people-outline", title: "Kết nối thợ", desc: "Tìm thợ uy tín" },
    {
      icon: "cart-outline",
      title: "Mua sắm vật liệu",
      desc: "Giá tốt nhất thị trường",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Về chúng tôi", headerShown: true }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo & App Info */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: "#0D9488" }]}>
            <Ionicons name="home" size={48} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: textColor }]}>
            App Design & Build
          </Text>
          <Text style={[styles.version, { color: "#666" }]}>
            Phiên bản 1.0.0
          </Text>
          <Text style={[styles.tagline, { color: "#666" }]}>
            Nền tảng toàn diện cho thiết kế và xây dựng
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Tính năng nổi bật
          </Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View
                style={[styles.featureIcon, { backgroundColor: "#14B8A620" }]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color="#14B8A6"
                />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: textColor }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDesc, { color: "#666" }]}>
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Company Info */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Thông tin công ty
          </Text>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#666" />
            <Text style={[styles.infoText, { color: textColor }]}>
              Công ty TNHH DESIGN BUILD
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={[styles.infoText, { color: textColor }]}>
              TP. Hồ Chí Minh, Việt Nam
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={[styles.infoText, { color: textColor }]}>
              contact@baotienweb.cloud
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={20} color="#666" />
            <Text style={[styles.infoText, { color: textColor }]}>
              https://baotienweb.cloud
            </Text>
          </View>
        </View>

        {/* Social Links */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Kết nối với chúng tôi
          </Text>
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: "#1877F2" }]}
            >
              <Ionicons name="logo-facebook" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: "#E4405F" }]}
            >
              <Ionicons name="logo-instagram" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: "#0A66C2" }]}
            >
              <Ionicons name="logo-linkedin" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: "#1DA1F2" }]}
            >
              <Ionicons name="logo-twitter" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2025 App Design & Build. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  header: { alignItems: "center", paddingVertical: 32 },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  version: { fontSize: 14, marginBottom: 8 },
  tagline: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  featureDesc: { fontSize: 13 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { marginLeft: 12, fontSize: 14 },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  copyright: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    paddingVertical: 24,
  },
});
