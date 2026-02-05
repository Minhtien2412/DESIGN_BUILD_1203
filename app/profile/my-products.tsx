import { ProductModerationModal } from "@/components/products";
import { ProductDashboardCard } from "@/components/products/ProductDashboardCard";
import { ThemedText } from "@/components/themed-text";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/data/products";
import { useThemeColor } from "@/hooks/use-theme-color";
import { productService } from "@/services/api/product.service";
import {
    ProductStatus,
    type Product as ApiProduct,
} from "@/services/api/types";
import { usePermissions } from "@/utils/permissions";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

/**
 * My Products - Seller Product Management
 * User can view and manage their own products
 * Admin can moderate all products
 */
export default function MyProductsScreen() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    | "all"
    | "pending"
    | "approved"
    | "rejected"
    | "bestseller"
    | "new"
    | "lowStock"
  >("all");

  // API state - Initialize with empty array to prevent undefined
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moderation modal state
  const [moderationModal, setModerationModal] = useState<{
    visible: boolean;
    product: Product | null;
  }>({ visible: false, product: null });

  // Fetch user's products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[MyProducts] 📦 Fetching user products...");

      // Fetch all products (backend will filter by user automatically)
      const response = await productService.getProducts();
      setApiProducts(Array.isArray(response.data) ? response.data : []);
      console.log(
        `[MyProducts] ✅ Loaded ${response.data?.length || 0} products`,
      );
    } catch (err) {
      console.error("[MyProducts] ❌ Error loading products:", err);
      setError("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");
  const accent = useThemeColor({}, "accent");
  const textMuted = useThemeColor({}, "textMuted");
  const text = useThemeColor({}, "text");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const warning = useThemeColor({}, "warning");
  const danger = useThemeColor({}, "danger");

  // Convert API products to display format
  const convertApiProductToDisplay = (apiProduct: ApiProduct): Product => ({
    id: String(apiProduct.id),
    name: apiProduct.name,
    price: apiProduct.price,
    image: apiProduct.images?.[0] || "",
    category: apiProduct.category.toLowerCase(),
    description: apiProduct.description || "",
    stock: apiProduct.stock,
    sold: 0, // TODO: Get from analytics
    rating: 0, // TODO: Get from reviews
    status:
      apiProduct.status === ProductStatus.APPROVED
        ? "APPROVED"
        : apiProduct.status === ProductStatus.PENDING
          ? "PENDING"
          : "REJECTED",
    createdBy: apiProduct.seller?.id ? String(apiProduct.seller.id) : undefined,
    isBestseller: apiProduct.isBestseller,
    isNew: apiProduct.isNew,
  });

  // Filter products - show only user's products (or all if admin)
  // Ensure apiProducts is always an array before mapping
  const myProducts = Array.isArray(apiProducts)
    ? apiProducts.map(convertApiProductToDisplay)
    : [];

  // Calculate stats for user's products
  const stats = {
    total: myProducts.length,
    pending: myProducts.filter((p) => p.status === "PENDING").length,
    approved: myProducts.filter((p) => p.status === "APPROVED" || !p.status)
      .length,
    rejected: myProducts.filter((p) => p.status === "REJECTED").length,
    bestseller: myProducts.filter((p) => p.isBestseller).length,
    new: myProducts.filter((p) => p.isNew).length,
    lowStock: myProducts.filter((p) => p.stock && p.stock < 10 && p.stock > 0)
      .length,
    totalRevenue: myProducts.reduce(
      (sum, p) => sum + (p.sold || 0) * p.price,
      0,
    ),
  };

  // Apply search and filter
  const filteredProducts = myProducts.filter((product) => {
    // Search filter
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Status/Category filter
    let matchesFilter = true;
    if (selectedFilter === "pending") {
      matchesFilter = product.status === "PENDING";
    } else if (selectedFilter === "approved") {
      matchesFilter = product.status === "APPROVED" || !product.status;
    } else if (selectedFilter === "rejected") {
      matchesFilter = product.status === "REJECTED";
    } else if (selectedFilter === "bestseller") {
      matchesFilter = product.isBestseller === true;
    } else if (selectedFilter === "new") {
      matchesFilter = product.isNew === true;
    } else if (selectedFilter === "lowStock") {
      matchesFilter =
        !!product.stock && product.stock < 10 && product.stock > 0;
    }

    return matchesSearch && matchesFilter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleEdit = (product: Product) => {
    router.push({
      pathname: "/profile/products/edit",
      params: { id: product.id, name: product.name },
    } as Href);
  };

  const handleDelete = async (productId: string) => {
    const product = myProducts.find((p) => p.id === productId);
    if (!product) return;

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await productService.deleteProduct(Number(productId));
              // Remove from local state
              setApiProducts((prev) =>
                prev.filter((p) => String(p.id) !== productId),
              );
              Alert.alert("Thành công", "Đã xóa sản phẩm");
            } catch (err) {
              console.error("Error deleting product:", err);
              Alert.alert("Lỗi", "Không thể xóa sản phẩm. Vui lòng thử lại.");
            }
          },
        },
      ],
    );
  };

  const handleViewDetails = (productId: string) => {
    router.push(`/product/${productId}` as Href);
  };

  const handleModerate = (product: Product) => {
    setModerationModal({ visible: true, product });
  };

  const handleApprove = async (productId: string) => {
    try {
      await productService.updateProduct(Number(productId), {
        status: ProductStatus.APPROVED,
      });
      // Update local state
      setApiProducts((prev) =>
        prev.map((p) =>
          String(p.id) === productId
            ? { ...p, status: ProductStatus.APPROVED }
            : p,
        ),
      );
      Alert.alert(
        "Đã duyệt",
        "Sản phẩm đã được duyệt và sẽ hiển thị công khai.",
        [
          {
            text: "OK",
            onPress: () =>
              setModerationModal({ visible: false, product: null }),
          },
        ],
      );
    } catch (err) {
      console.error("Error approving product:", err);
      Alert.alert("Lỗi", "Không thể duyệt sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleReject = async (productId: string, reason: string) => {
    try {
      await productService.updateProduct(Number(productId), {
        status: ProductStatus.REJECTED,
        rejectionReason: reason,
      });
      // Update local state
      setApiProducts((prev) =>
        prev.map((p) =>
          String(p.id) === productId
            ? { ...p, status: ProductStatus.REJECTED }
            : p,
        ),
      );
      Alert.alert(
        "Đã từ chối",
        "Sản phẩm đã bị từ chối. Người đăng sẽ nhận được thông báo.",
        [
          {
            text: "OK",
            onPress: () =>
              setModerationModal({ visible: false, product: null }),
          },
        ],
      );
    } catch (err) {
      console.error("Error rejecting product:", err);
      Alert.alert("Lỗi", "Không thể từ chối sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleAddProduct = () => {
    router.push("/profile/products/create" as Href);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isAdmin ? "Quản lý sản phẩm" : "Sản phẩm của tôi",
          headerShown: true,
        }}
      />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Container>
          {/* Stats Overview */}
          <View
            style={[
              styles.statsCard,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Thống kê sản phẩm
            </ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: primary }]}>
                  {stats.total}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: textMuted }]}>
                  Tổng SP
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: warning }]}>
                  {stats.pending}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: textMuted }]}>
                  Chờ duyệt
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: success }]}>
                  {stats.approved}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: textMuted }]}>
                  Đã duyệt
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: danger }]}>
                  {stats.rejected}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: textMuted }]}>
                  Từ chối
                </ThemedText>
              </View>
            </View>
            {stats.totalRevenue > 0 && (
              <View style={[styles.revenueRow, { marginTop: 16 }]}>
                <ThemedText style={{ color: textMuted }}>
                  Tổng doanh thu:
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: success }}>
                  {stats.totalRevenue.toLocaleString("vi-VN")} ₫
                </ThemedText>
              </View>
            )}
          </View>

          {/* Search & Filters */}
          <View style={{ marginTop: 16 }}>
            {/* Search Bar */}
            <View
              style={[
                styles.searchBar,
                { backgroundColor: surface, borderColor: border },
              ]}
            >
              <Ionicons name="search" size={20} color={textMuted} />
              <TextInput
                style={[styles.searchInput, { color: text }]}
                placeholder="Tìm kiếm sản phẩm..."
                placeholderTextColor={textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={textMuted} />
                </Pressable>
              )}
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === "all" && { backgroundColor: accent },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter("all")}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === "all" && { color: "#fff" },
                  ]}
                >
                  Tất cả ({stats.total})
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === "pending" && { backgroundColor: warning },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter("pending")}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={selectedFilter === "pending" ? "#fff" : warning}
                />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === "pending" && { color: "#fff" },
                  ]}
                >
                  Chờ duyệt ({stats.pending})
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === "approved" && { backgroundColor: success },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter("approved")}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={selectedFilter === "approved" ? "#fff" : success}
                />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === "approved" && { color: "#fff" },
                  ]}
                >
                  Đã duyệt ({stats.approved})
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  selectedFilter === "rejected" && { backgroundColor: danger },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedFilter("rejected")}
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={selectedFilter === "rejected" ? "#fff" : danger}
                />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === "rejected" && { color: "#fff" },
                  ]}
                >
                  Từ chối ({stats.rejected})
                </ThemedText>
              </Pressable>

              {stats.bestseller > 0 && (
                <Pressable
                  style={[
                    styles.filterChip,
                    selectedFilter === "bestseller" && {
                      backgroundColor: accent,
                    },
                    { borderColor: border },
                  ]}
                  onPress={() => setSelectedFilter("bestseller")}
                >
                  <Ionicons
                    name="trophy"
                    size={16}
                    color={selectedFilter === "bestseller" ? "#fff" : accent}
                  />
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      selectedFilter === "bestseller" && { color: "#fff" },
                    ]}
                  >
                    Bán chạy
                  </ThemedText>
                </Pressable>
              )}

              {stats.lowStock > 0 && (
                <Pressable
                  style={[
                    styles.filterChip,
                    selectedFilter === "lowStock" && {
                      backgroundColor: warning,
                    },
                    { borderColor: border },
                  ]}
                  onPress={() => setSelectedFilter("lowStock")}
                >
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={selectedFilter === "lowStock" ? "#fff" : warning}
                  />
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      selectedFilter === "lowStock" && { color: "#fff" },
                    ]}
                  >
                    Sắp hết ({stats.lowStock})
                  </ThemedText>
                </Pressable>
              )}
            </ScrollView>
          </View>

          {/* Product List Header */}
          <View style={styles.listHeader}>
            <View>
              <ThemedText
                type="title"
                style={{ fontSize: 16, marginBottom: 4 }}
              >
                {filteredProducts.length} sản phẩm
              </ThemedText>
              {selectedFilter !== "all" && (
                <ThemedText style={{ fontSize: 13, color: textMuted }}>
                  {selectedFilter === "pending"
                    ? "Đang chờ admin duyệt"
                    : selectedFilter === "approved"
                      ? "Đang hiển thị công khai"
                      : selectedFilter === "rejected"
                        ? "Đã bị từ chối - Xem lý do"
                        : selectedFilter === "bestseller"
                          ? "Sản phẩm bán chạy"
                          : selectedFilter === "lowStock"
                            ? "Cần nhập thêm hàng"
                            : ""}
                </ThemedText>
              )}
            </View>
            <Pressable
              style={[styles.addButton, { backgroundColor: accent }]}
              onPress={handleAddProduct}
            >
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <ThemedText
                style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
              >
                Thêm mới
              </ThemedText>
            </Pressable>
          </View>

          {/* Product List */}
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={textMuted} />
              <ThemedText
                style={{ color: textMuted, marginTop: 16, fontSize: 16 }}
              >
                {searchQuery
                  ? "Không tìm thấy sản phẩm"
                  : selectedFilter === "pending"
                    ? "Chưa có sản phẩm chờ duyệt"
                    : selectedFilter === "rejected"
                      ? "Chưa có sản phẩm bị từ chối"
                      : "Bạn chưa có sản phẩm nào"}
              </ThemedText>
              {!searchQuery && myProducts.length === 0 && (
                <Pressable
                  style={[
                    styles.addButton,
                    { backgroundColor: accent, marginTop: 24 },
                  ]}
                  onPress={handleAddProduct}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <ThemedText
                    style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}
                  >
                    Tạo sản phẩm đầu tiên
                  </ThemedText>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ marginTop: 16 }}>
              {filteredProducts.map((product) => (
                <ProductDashboardCard
                  key={product.id}
                  product={product}
                  showMetrics={true}
                  currentUserId={user?.id ? String(user.id) : undefined}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                  onModerate={handleModerate}
                />
              ))}
            </View>
          )}

          {/* Help Text */}
          {!isAdmin && myProducts.length > 0 && (
            <View
              style={[
                styles.helpCard,
                { backgroundColor: surface, borderColor: border },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={accent}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText type="defaultSemiBold" style={{ marginBottom: 4 }}>
                  Quy trình duyệt sản phẩm
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 13, color: textMuted, lineHeight: 18 }}
                >
                  Sản phẩm của bạn sẽ được admin xem xét và duyệt trong vòng
                  24-48 giờ. Bạn sẽ nhận được thông báo khi sản phẩm được duyệt
                  hoặc từ chối.
                </ThemedText>
              </View>
            </View>
          )}
        </Container>
      </ScrollView>

      {/* Moderation Modal (Admin only) */}
      {isAdmin && (
        <ProductModerationModal
          visible={moderationModal.visible}
          product={moderationModal.product}
          onClose={() => setModerationModal({ visible: false, product: null })}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  revenueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
  },
  helpCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    marginBottom: 16,
  },
});
