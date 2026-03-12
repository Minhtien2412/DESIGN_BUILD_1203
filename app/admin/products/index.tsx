/**
 * Admin Product Management Screen
 * Quản lý sản phẩm cho tất cả categories
 *
 * Updated with:
 * - Error handling với FeatureComingSoon và ApiErrorDisplay
 * - useApiCall hook cho state management
 * - Graceful degradation khi backend chưa sẵn sàng
 */

import { ProductPostsDashboardMode } from "@/components/products/ProductPostsDashboardMode";
import { ApiErrorDisplay } from "@/components/ui/ApiErrorDisplay";
import { FeatureComingSoon } from "@/components/ui/FeatureComingSoon";
import { SafeScrollView } from "@/components/ui/safe-area";
import { useApiCall } from "@/hooks/use-api-call";
import { productService } from "@/services/api/product.service";
import { Product, ProductStatus } from "@/services/api/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const CATEGORIES = [
  { id: "kitchen-equipment", name: "Thiết bị bếp" },
  { id: "sanitary-ware", name: "Thiết bị vệ sinh" },
  { id: "electronics", name: "Điện" },
  { id: "plumbing", name: "Nước" },
  { id: "fire-safety", name: "PCCC" },
  { id: "dining-table", name: "Bàn ăn" },
  { id: "study-table", name: "Bàn học" },
  { id: "sofa", name: "Sofa" },
];

export default function AdminProductsScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"dashboard" | "list">("dashboard");

  // Use new useApiCall hook for better state management
  const {
    data: productsData,
    loading,
    error,
    execute,
  } = useApiCall(productService.getProducts, {
    onSuccess: (response) => {
      console.log(`[AdminProducts] Loaded ${response.data.length} products`);
    },
    onError: (error) => {
      console.error("[AdminProducts] Error loading products:", error);
    },
  });

  const products = productsData?.data || [];

  const pendingProducts = products.filter(
    (p) => p.status === ProductStatus.PENDING,
  );

  const loadProducts = useCallback(() => {
    execute({
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      search: search || undefined,
      limit: 100,
    });
  }, [selectedCategory, search, execute]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (product: Product) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa "${product.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await productService.deleteProduct(product.id);
            Alert.alert("Thành công", "Đã xóa sản phẩm");
            loadProducts();
          } catch (error) {
            console.error("[AdminProducts] Delete error:", error);
            Alert.alert("Lỗi", "Không thể xóa sản phẩm");
          }
        },
      },
    ]);
  };

  const handleUpdateStatus = async (
    product: Product,
    status: "APPROVED" | "REJECTED",
  ) => {
    try {
      await productService.updateStatus(product.id, { status });
      Alert.alert(
        "Thành công",
        `Đã ${status === "APPROVED" ? "duyệt" : "từ chối"} sản phẩm`,
      );
      loadProducts();
    } catch (error) {
      console.error("[AdminProducts] Status update error:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image
        source={{
          uri:
            item.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=80&q=80",
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString("vi-VN")} đ
        </Text>

        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              item.status === ProductStatus.APPROVED && styles.statusApproved,
              item.status === ProductStatus.PENDING && styles.statusPending,
              item.status === ProductStatus.REJECTED && styles.statusRejected,
            ]}
          >
            {item.status === ProductStatus.APPROVED
              ? "Đã duyệt"
              : item.status === ProductStatus.PENDING
                ? "Chờ duyệt"
                : "Từ chối"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/admin/products/edit/${item.id}` as any)}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
        </TouchableOpacity>

        {item.status === ProductStatus.PENDING && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#0D9488" }]}
              onPress={() => handleUpdateStatus(item, "APPROVED")}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#000000" }]}
              onPress={() => handleUpdateStatus(item, "REJECTED")}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show error UI if backend endpoint not available
  if (error && error.message.includes("404")) {
    return (
      <FeatureComingSoon
        feature="Quản lý Sản phẩm"
        description="Tính năng quản lý sản phẩm đang được hoàn thiện. Bạn có thể tạo và quản lý sản phẩm xây dựng, vật liệu, thiết bị..."
        estimatedDate="Tháng 12, 2025"
        onBack={() => router.back()}
      />
    );
  }

  // Show other errors
  if (error) {
    return (
      <ApiErrorDisplay
        error={error}
        endpoint="/products"
        onRetry={loadProducts}
        onBack={() => router.back()}
      />
    );
  }

  // Loading state
  if (loading && !productsData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <SafeScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý sản phẩm</Text>
        <TouchableOpacity onPress={() => router.push("/admin/products/create")}>
          <Ionicons name="add-circle" size={28} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Mode Switch */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeBtn,
            viewMode === "dashboard" && styles.modeBtnActive,
          ]}
          onPress={() => setViewMode("dashboard")}
        >
          <Ionicons
            name="grid-outline"
            size={18}
            color={viewMode === "dashboard" ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.modeText,
              viewMode === "dashboard" && styles.modeTextActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, viewMode === "list" && styles.modeBtnActive]}
          onPress={() => setViewMode("list")}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={viewMode === "list" ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.modeText,
              viewMode === "list" && styles.modeTextActive,
            ]}
          >
            Danh sách
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "dashboard" && (
        <>
          <ProductPostsDashboardMode products={products} />

          {/* Quick Pending Moderation */}
          <View style={styles.quickSection}>
            <View style={styles.quickHeader}>
              <Text style={styles.quickTitle}>
                Chờ duyệt ({pendingProducts.length})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setViewMode("list");
                  setSelectedCategory("all");
                  setSearch("");
                }}
              >
                <Text style={styles.quickLink}>Xem danh sách →</Text>
              </TouchableOpacity>
            </View>

            {pendingProducts.length > 0 ? (
              <View style={styles.quickList}>
                {pendingProducts.slice(0, 6).map((p) => (
                  <View key={p.id.toString()}>
                    {renderProduct({ item: p })}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.quickEmpty}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={36}
                  color="#0D9488"
                />
                <Text style={styles.quickEmptyText}>
                  Không có sản phẩm chờ duyệt
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {viewMode === "list" && (
        <>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <Text style={styles.filterLabel}>Danh mục:</Text>
            <View style={styles.categoryList}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === "all" && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory("all")}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === "all" && styles.categoryChipTextActive,
                  ]}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              Tổng: <Text style={styles.statsNumber}>{products.length}</Text>{" "}
              sản phẩm
            </Text>
            <Text style={styles.statsText}>
              Chờ duyệt:{" "}
              <Text style={styles.statsNumber}>{pendingProducts.length}</Text>
            </Text>
          </View>

          {/* Product List */}
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="cube-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
              </View>
            }
          />
        </>
      )}
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  modeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modeBtnActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  modeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  modeTextActive: {
    color: "#fff",
  },
  quickSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  quickHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
  },
  quickLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D9488",
  },
  quickList: {
    paddingHorizontal: 16,
  },
  quickEmpty: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickEmptyText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  categoryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryChipActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  categoryChipText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
  },
  statsNumber: {
    fontWeight: "700",
    color: "#0D9488",
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D9488",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusApproved: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusRejected: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  actions: {
    flexDirection: "column",
    gap: 8,
    justifyContent: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#000000",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});
