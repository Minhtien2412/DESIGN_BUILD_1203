/**
 * Seller Products Management - Shopee/TikTok Style
 * Quản lý sản phẩm của người bán
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";

// Types
interface SellerProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  soldCount: number;
  viewCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT" | "OUT_OF_STOCK";
  images: { url: string }[];
  category: string;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

type TabType = "all" | "active" | "pending" | "rejected" | "outOfStock";

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "all", label: "Tất cả", icon: "grid-outline" },
  { key: "active", label: "Đang bán", icon: "checkmark-circle-outline" },
  { key: "pending", label: "Chờ duyệt", icon: "time-outline" },
  { key: "rejected", label: "Từ chối", icon: "close-circle-outline" },
  { key: "outOfStock", label: "Hết hàng", icon: "alert-circle-outline" },
];

export default function SellerProductsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    outOfStock: 0,
  });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiFetch<{
        data: SellerProduct[];
        meta: { total: number };
      }>("/products/my-products");

      if (response?.data) {
        setProducts(response.data);

        // Calculate stats
        const active = response.data.filter(
          (p) => p.status === "APPROVED" && p.stock > 0,
        ).length;
        const pending = response.data.filter(
          (p) => p.status === "PENDING",
        ).length;
        const rejected = response.data.filter(
          (p) => p.status === "REJECTED",
        ).length;
        const outOfStock = response.data.filter(
          (p) => p.stock === 0 || p.status === "OUT_OF_STOCK",
        ).length;

        setStats({
          total: response.data.length,
          active,
          pending,
          rejected,
          outOfStock,
        });
      }
    } catch (error) {
      console.error("[SellerProducts] Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Filter products by tab and search
  const filteredProducts = products.filter((product) => {
    // Tab filter
    let tabMatch = true;
    switch (activeTab) {
      case "active":
        tabMatch = product.status === "APPROVED" && product.stock > 0;
        break;
      case "pending":
        tabMatch = product.status === "PENDING";
        break;
      case "rejected":
        tabMatch = product.status === "REJECTED";
        break;
      case "outOfStock":
        tabMatch = product.stock === 0 || product.status === "OUT_OF_STOCK";
        break;
    }

    // Search filter
    const searchMatch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  // Delete product
  const handleDelete = (product: SellerProduct) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/products/${product.id}`, { method: "DELETE" });
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
              Alert.alert("Thành công", "Đã xóa sản phẩm");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa sản phẩm");
            }
          },
        },
      ],
    );
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Status badge
  const getStatusBadge = (status: SellerProduct["status"], stock: number) => {
    if (stock === 0) {
      return { color: "#EF4444", bg: "#FEE2E2", text: "Hết hàng" };
    }
    switch (status) {
      case "APPROVED":
        return { color: "#10B981", bg: "#D1FAE5", text: "Đang bán" };
      case "PENDING":
        return { color: "#F59E0B", bg: "#FEF3C7", text: "Chờ duyệt" };
      case "REJECTED":
        return { color: "#EF4444", bg: "#FEE2E2", text: "Từ chối" };
      case "DRAFT":
        return { color: "#6B7280", bg: "#F3F4F6", text: "Nháp" };
      default:
        return { color: "#6B7280", bg: "#F3F4F6", text: status };
    }
  };

  // Render product item
  const renderProduct = ({ item }: { item: SellerProduct }) => {
    const statusBadge = getStatusBadge(item.status, item.stock);
    const imageUrl =
      item.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=100&q=80";

    return (
      <Pressable
        style={styles.productCard}
        onPress={() =>
          router.push(`/seller/edit-product?id=${item.id}` as Href)
        }
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice)}
              </Text>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>Kho: {item.stock}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cart-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>Đã bán: {item.soldCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{item.viewCount}</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}
            >
              <Text style={[styles.statusText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() =>
                  router.push(`/seller/edit-product?id=${item.id}` as Href)
                }
              >
                <Ionicons name="create-outline" size={18} color="#3B82F6" />
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header Stats */}
      <LinearGradient
        colors={["#FF6B35", "#FF8C5A"]}
        style={styles.headerGradient}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tất cả</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Đang bán</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.outOfStock}</Text>
            <Text style={styles.statLabel}>Hết hàng</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.tab, activeTab === item.key && styles.activeTab]}
              onPress={() => setActiveTab(item.key)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={activeTab === item.key ? "#FF6B35" : "#6B7280"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.key && styles.activeTabText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B35"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery ? "Không tìm thấy sản phẩm" : "Chưa có sản phẩm nào"}
            </Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/seller/add-product" as Href)}
            >
              <Text style={styles.addButtonText}>Thêm sản phẩm đầu tiên</Text>
            </Pressable>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/seller/add-product" as Href)}
      >
        <LinearGradient
          colors={["#FF6B35", "#FF8C5A"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
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
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#1F2937",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  activeTab: {
    backgroundColor: "#FFF5F2",
  },
  tabText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
  },
  activeTabText: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    borderRadius: 28,
    elevation: 4,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
