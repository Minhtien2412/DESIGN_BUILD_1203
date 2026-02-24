/**
 * Legal Services Hub - Tư vấn pháp lý
 * Central hub for all legal documentation and services
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LegalItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: string;
}

const LEGAL_DOCUMENTS: LegalItem[] = [
  {
    id: "1",
    title: "Điều khoản sử dụng",
    description: "Quy định sử dụng ứng dụng và dịch vụ",
    icon: "document-text-outline",
    route: "/legal/terms-of-service",
  },
  {
    id: "2",
    title: "Chính sách bảo mật",
    description: "Cách chúng tôi thu thập và bảo vệ dữ liệu",
    icon: "shield-checkmark-outline",
    route: "/legal/privacy-policy",
  },
  {
    id: "3",
    title: "Điều khoản dịch vụ",
    description: "Quy định chi tiết về các dịch vụ",
    icon: "reader-outline",
    route: "/legal/terms",
  },
  {
    id: "4",
    title: "FAQ - Câu hỏi thường gặp",
    description: "Giải đáp thắc mắc phổ biến",
    icon: "help-circle-outline",
    route: "/legal/faq",
  },
  {
    id: "5",
    title: "Về chúng tôi",
    description: "Giới thiệu công ty và đội ngũ",
    icon: "information-circle-outline",
    route: "/legal/about-us",
  },
];

const LEGAL_SERVICES: LegalItem[] = [
  {
    id: "s1",
    title: "Tư vấn hợp đồng xây dựng",
    description: "Soạn thảo, rà soát hợp đồng xây dựng",
    icon: "create-outline",
    route: "/contracts/index",
    badge: "HOT",
  },
  {
    id: "s2",
    title: "Tư vấn giấy phép xây dựng",
    description: "Hỗ trợ thủ tục xin phép xây dựng",
    icon: "newspaper-outline",
    route: "/legal/about-us",
    badge: "NEW",
  },
  {
    id: "s3",
    title: "Giải quyết tranh chấp",
    description: "Hỗ trợ giải quyết tranh chấp xây dựng",
    icon: "people-outline",
    route: "/legal/faq",
  },
  {
    id: "s4",
    title: "Bảo hiểm công trình",
    description: "Tư vấn bảo hiểm cho dự án xây dựng",
    icon: "shield-outline",
    route: "/warranty/index",
  },
];

export default function LegalIndexScreen() {
  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tư vấn pháp lý",
          headerStyle: { backgroundColor: MODERN_COLORS.primary },
          headerTintColor: "#fff",
        }}
      />
      <StatusBar
        barStyle="light-content"
        backgroundColor={MODERN_COLORS.primary}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Banner */}
          <View style={styles.headerBanner}>
            <View style={styles.bannerContent}>
              <Ionicons name="shield-checkmark" size={48} color="#fff" />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Trung tâm pháp lý</Text>
                <Text style={styles.bannerSubtitle}>
                  Hỗ trợ pháp lý 24/7 cho dự án xây dựng
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.hotlineButton}>
              <Ionicons
                name="call-outline"
                size={18}
                color={MODERN_COLORS.primary}
              />
              <Text style={styles.hotlineText}>Hotline: 1900-xxxx</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Documents Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Tài liệu pháp lý</Text>
            <View style={styles.documentsList}>
              {LEGAL_DOCUMENTS.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.documentCard}
                  onPress={() => navigateTo(doc.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.documentIcon}>
                    <Ionicons
                      name={doc.icon}
                      size={24}
                      color={MODERN_COLORS.primary}
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{doc.title}</Text>
                    <Text style={styles.documentDesc}>{doc.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Legal Services Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚖️ Dịch vụ tư vấn</Text>
            <View style={styles.servicesGrid}>
              {LEGAL_SERVICES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => navigateTo(service.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceIconBg}>
                      <Ionicons
                        name={service.icon}
                        size={24}
                        color={MODERN_COLORS.primary}
                      />
                    </View>
                    {service.badge && (
                      <View
                        style={[
                          styles.badge,
                          service.badge === "HOT"
                            ? styles.badgeHot
                            : styles.badgeNew,
                        ]}
                      >
                        <Text style={styles.badgeText}>{service.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Support */}
          <View style={styles.section}>
            <View style={styles.supportCard}>
              <View style={styles.supportLeft}>
                <Ionicons
                  name="headset-outline"
                  size={32}
                  color={MODERN_COLORS.primary}
                />
                <View style={styles.supportInfo}>
                  <Text style={styles.supportTitle}>Cần hỗ trợ pháp lý?</Text>
                  <Text style={styles.supportDesc}>
                    Đội ngũ luật sư sẵn sàng tư vấn 24/7
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Liên hệ</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerBanner: {
    backgroundColor: MODERN_COLORS.primary,
    padding: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.xl,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  hotlineButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 10,
    borderRadius: MODERN_RADIUS.full,
    alignSelf: "flex-start",
    marginTop: MODERN_SPACING.md,
    gap: 8,
  },
  hotlineText: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 8,
    padding: MODERN_SPACING.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: MODERN_SPACING.md,
  },
  documentsList: {
    gap: 8,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: `${MODERN_COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: MODERN_SPACING.sm,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  documentDesc: {
    fontSize: 13,
    color: "#666",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: MODERN_SPACING.sm,
  },
  serviceIconBg: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: `${MODERN_COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeHot: {
    backgroundColor: "#FF6B6B",
  },
  badgeNew: {
    backgroundColor: "#0D9488",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${MODERN_COLORS.primary}10`,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: `${MODERN_COLORS.primary}30`,
  },
  supportLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: MODERN_SPACING.sm,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  supportDesc: {
    fontSize: 12,
    color: "#666",
  },
  contactButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 10,
    borderRadius: MODERN_RADIUS.full,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
