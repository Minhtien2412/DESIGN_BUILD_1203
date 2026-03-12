/**
 * Perfex CRM - Customers Screen
 * ==============================
 *
 * Màn hình quản lý khách hàng từ Perfex CRM
 * Updated: January 7, 2026 - Using new API hooks
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCustomers } from "@/hooks/usePerfexAPI";
import type { Customer } from "@/types/perfex";

function CustomersContent() {
  const { customers, stats, loading, error, refresh, search } = useCustomers();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Handle search with debounce
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim().length > 2) {
        // Debounce search - call API after user stops typing
        const timeoutId = setTimeout(() => {
          search(query);
        }, 500);
        return () => clearTimeout(timeoutId);
      } else if (query.trim() === "") {
        refresh(); // Reset to full list
      }
    },
    [search, refresh],
  );

  // Filtered customers (local filter for quick response)
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;

    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.company?.toLowerCase().includes(q) ||
        c.phonenumber?.includes(q) ||
        c.city?.toLowerCase().includes(q),
    );
  }, [customers, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Handle call
  const handleCall = (phone: string) => {
    if (!phone) return;
    const url = `tel:${phone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi");
      }
    });
  };

  const renderCustomer = ({ item }: { item: Customer }) => {
    return (
      <TouchableOpacity style={styles.customerCard} activeOpacity={0.7}>
        <View style={styles.customerHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.company?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            {item.active === "1" && <View style={styles.activeIndicator} />}
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.company}
            </Text>
            <Text style={styles.customerCity}>
              {item.city || "Chưa có địa chỉ"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => item.phonenumber && handleCall(item.phonenumber)}
          >
            <Ionicons name="call" size={18} color="#0D9488" />
          </TouchableOpacity>
        </View>

        <View style={styles.customerDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.phonenumber || "N/A"}</Text>
          </View>

          {item.website && (
            <View style={styles.detailRow}>
              <Ionicons name="globe-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.website}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address?.replace(/<br \/>/g, ", ") || "Chưa có địa chỉ"}
            </Text>
          </View>
        </View>

        <View style={styles.customerFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.projectBadge}>
              <Ionicons name="folder" size={12} color="#0D9488" />
              <Text style={styles.projectCount}>Khách hàng</Text>
            </View>
          </View>
          <Text style={styles.dateCreated}>ID: {item.userid}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading on initial fetch
  if (loading && customers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Đang tải khách hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khách hàng</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#10B981" }]}>
            {stats.active}
          </Text>
          <Text style={styles.statLabel}>Đang hoạt động</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#6B7280" }]}>
            {stats.total - stats.active}
          </Text>
          <Text style={styles.statLabel}>Không hoạt động</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.userid}
        renderItem={renderCustomer}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Không tìm thấy khách hàng"
                : "Chưa có khách hàng nào"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Main export - no longer needs Provider wrapper
export default CustomersContent;

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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0D9488",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  refreshButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0D9488",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    marginBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  customerCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0D9488",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  customerCity: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  customerDetails: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
  },
  customerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerLeft: {
    flexDirection: "row",
    gap: 8,
  },
  projectBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F0FDFA",
    borderRadius: 6,
  },
  projectCount: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "500",
  },
  dateCreated: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 12,
  },
});
