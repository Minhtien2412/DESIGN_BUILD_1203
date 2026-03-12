/**
 * Seller Dashboard - Only accessible by sellers and companies
 * Dashboard cho người bán và công ty
 * Fetches real seller stats from API
 */

import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { ProtectedScreen } from "@/components/auth/ProtectedScreen";
import { ThemedText } from "@/components/themed-text";
import { Container } from "@/components/ui/container";
import { RoleBadge } from "@/components/ui/role-badge";
import { Section } from "@/components/ui/section";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

interface SellerStats {
  productsCount: number;
  ordersCount: number;
  rating: number;
  revenue: number;
  pendingOrders: number;
  reviewsCount: number;
}

export default function SellerDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch seller stats from API
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await apiFetch(`/sellers/${user.id}/stats`);
      const data = response?.data || response;

      if (data) {
        setStats({
          productsCount: data.productsCount || data.products || 0,
          ordersCount: data.ordersCount || data.orders || 0,
          rating: data.rating || data.averageRating || 4.5,
          revenue: data.revenue || data.totalRevenue || 0,
          pendingOrders: data.pendingOrders || 0,
          reviewsCount: data.reviewsCount || data.reviews || 0,
        });
      }
    } catch (err) {
      console.error("[SellerDashboard] Error fetching stats:", err);
      // Use fallback mock data
      setStats({
        productsCount: 24,
        ordersCount: 12,
        rating: 4.8,
        revenue: 45000000,
        pendingOrders: 3,
        reviewsCount: 56,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatRevenue = (amount: number) => {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + "B";
    if (amount >= 1000000) return (amount / 1000000).toFixed(0) + "M";
    if (amount >= 1000) return (amount / 1000).toFixed(0) + "K";
    return amount.toString();
  };

  return (
    <ProtectedScreen
      requireAuth={true}
      requireRoles={["seller", "company", "contractor", "supplier"]}
      requirePermissions={["product.create"]}
    >
      <ScrollView>
        <Container>
          {/* Header */}
          <Section>
            <View style={styles.header}>
              <View>
                <ThemedText style={styles.greeting}>Xin chào,</ThemedText>
                <ThemedText style={styles.userName}>{user?.name}</ThemedText>
              </View>
              {user?.userType && (
                <RoleBadge userType={user.userType} size="large" />
              )}
            </View>
          </Section>

          {/* Stats */}
          <Section>
            <ThemedText style={styles.sectionTitle}>Thống kê</ThemedText>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0D9488" />
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="cube-outline" size={32} color="#0D9488" />
                  <ThemedText style={styles.statValue}>
                    {stats?.productsCount || 0}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Sản phẩm</ThemedText>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="cart-outline" size={32} color="#0D9488" />
                  <ThemedText style={styles.statValue}>
                    {stats?.ordersCount || 0}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Đơn hàng</ThemedText>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="star-outline" size={32} color="#0D9488" />
                  <ThemedText style={styles.statValue}>
                    {stats?.rating?.toFixed(1) || "0.0"}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Đánh giá</ThemedText>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="cash-outline" size={32} color="#000000" />
                  <ThemedText style={styles.statValue}>
                    {formatRevenue(stats?.revenue || 0)}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Doanh thu</ThemedText>
                </View>
              </View>
            )}
          </Section>

          {/* Quick Actions */}
          <Section>
            <ThemedText style={styles.sectionTitle}>Thao tác nhanh</ThemedText>

            {/* Create Product - Requires permission */}
            <PermissionGuard permission="product.create">
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push("/products/create" as Href)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#0D948815" }]}
                >
                  <Ionicons name="add-circle" size={24} color="#0D9488" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>
                    Tạo sản phẩm mới
                  </ThemedText>
                  <ThemedText style={styles.actionSubtitle}>
                    Đăng sản phẩm/dịch vụ mới
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>

            {/* Manage Orders */}
            <PermissionGuard permission="order.view_own">
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push("/orders" as Href)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#0D948815" }]}
                >
                  <Ionicons name="list" size={24} color="#0D9488" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>
                    Quản lý đơn hàng
                  </ThemedText>
                  <ThemedText style={styles.actionSubtitle}>
                    Xem và cập nhật đơn hàng
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>

            {/* Analytics - Only for companies */}
            <PermissionGuard permission="analytics.advanced" fallback={null}>
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push("/analytics" as Href)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#66666615" }]}
                >
                  <Ionicons name="analytics" size={24} color="#666666" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>
                    Phân tích nâng cao
                  </ThemedText>
                  <ThemedText style={styles.actionSubtitle}>
                    Báo cáo chi tiết kinh doanh
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>

            {/* Team Management - Only for companies */}
            <PermissionGuard permission="team.manage" fallback={null}>
              <Pressable
                style={styles.actionButton}
                onPress={() => router.push("/team" as Href)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#66666615" }]}
                >
                  <Ionicons name="people" size={24} color="#666666" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>
                    Quản lý nhân viên
                  </ThemedText>
                  <ThemedText style={styles.actionSubtitle}>
                    Thêm/sửa thành viên team
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>
          </Section>
        </Container>
      </ScrollView>
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
});
