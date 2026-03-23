/**
 * AI Architect - Tổng quan
 * Dashboard chính cho AI Kiến trúc sư
 */

import { Container } from "@/components/ui/container";
import {
    ARCHITECTURE_STYLES,
    geminiArchitectService,
    QUICK_ACTIONS,
    SystemStatus,
} from "@/services/geminiArchitectService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AIArchitectOverviewScreen() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = async () => {
    try {
      const result = await geminiArchitectService.checkStatus();
      setStatus(result);
    } catch (error) {
      console.error("Status check error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    checkStatus();
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  const features = [
    {
      id: "architecture",
      title: "Sơ Đồ Hệ Thống",
      description: "Tạo sơ đồ kiến trúc từ mô tả text",
      icon: "git-network",
      color: "#14B8A6",
      route: "/ai-architect/architecture",
    },
    {
      id: "implementation",
      title: "Sinh Code PHP",
      description: "Code generator cho Perfex CRM",
      icon: "code-slash",
      color: "#8e44ad",
      route: "/ai-architect/implementation",
    },
    {
      id: "visualizer",
      title: "Thư Viện Phong Cách",
      description: "8 phong cách kiến trúc với AI",
      icon: "color-palette",
      color: "#e74c3c",
      route: "/ai-architect/visualizer",
    },
    {
      id: "consultant",
      title: "Tư Vấn AI",
      description: "Chat với AI Kiến trúc sư",
      icon: "chatbubbles",
      color: "#27ae60",
      route: "/ai-architect/consultant",
    },
    {
      id: "design",
      title: "AI Design Generator",
      description: "Tạo thiết kế AI tùy chỉnh",
      icon: "sparkles",
      color: "#f59e0b",
      route: "/ai-architect/design",
    },
    {
      id: "templates",
      title: "Project Templates",
      description: "6+ mẫu dự án có sẵn",
      icon: "layers",
      color: "#06b6d4",
      route: "/ai-architect/templates",
    },
    {
      id: "export",
      title: "Export Center",
      description: "Xuất PDF, code, hình ảnh",
      icon: "download",
      color: "#ef4444",
      route: "/ai-architect/export",
    },
  ];

  return (
    <Container>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={["#14B8A6", "#8e44ad"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🏛️</Text>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>AI Kiến Trúc Sư</Text>
              <Text style={styles.headerSubtitle}>Powered by OpenClaw AI</Text>
            </View>
          </View>

          {/* Status Indicators */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: status?.gemini ? "#4ade80" : "#ef4444" },
                ]}
              />
              <Text style={styles.statusText}>Gemini AI</Text>
            </View>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: status?.perfexApi ? "#4ade80" : "#ef4444",
                  },
                ]}
              />
              <Text style={styles.statusText}>Perfex CRM</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Thao Tác Nhanh</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsScroll}
          >
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={() => {
                  if (action.id === "new-diagram") {
                    navigateTo("/ai-architect/architecture");
                  } else if (action.id === "generate-code") {
                    navigateTo("/ai-architect/implementation");
                  } else if (action.id === "design-consult") {
                    navigateTo("/ai-architect/consultant");
                  }
                }}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Tính Năng Chính</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => navigateTo(feature.route)}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color },
                  ]}
                >
                  <Ionicons name={feature.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Architecture Styles Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏠 Phong Cách Kiến Trúc</Text>
            <TouchableOpacity
              onPress={() => navigateTo("/ai-architect/visualizer")}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stylesScroll}
          >
            {ARCHITECTURE_STYLES.slice(0, 4).map((style) => (
              <TouchableOpacity
                key={style.id}
                style={styles.styleCard}
                onPress={() => navigateTo("/ai-architect/visualizer")}
              >
                <Image
                  source={{ uri: style.image }}
                  style={styles.styleImage}
                />
                <View style={styles.styleOverlay}>
                  <Text style={styles.styleName}>{style.nameVi}</Text>
                  <Text style={styles.styleNameEn}>{style.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Thống Kê</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Phong cách</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Tính năng</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Templates</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    fontSize: 48,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  seeAllText: {
    color: "#14B8A6",
    fontSize: 14,
  },
  quickActionsScroll: {
    marginHorizontal: -4,
  },
  quickAction: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    width: "48%",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    color: "#94a3b8",
    fontSize: 12,
  },
  stylesScroll: {
    marginHorizontal: -4,
  },
  styleCard: {
    width: 160,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  styleImage: {
    width: "100%",
    height: "100%",
  },
  styleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  styleName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  styleNameEn: {
    color: "#94a3b8",
    fontSize: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    color: "#14B8A6",
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
});
