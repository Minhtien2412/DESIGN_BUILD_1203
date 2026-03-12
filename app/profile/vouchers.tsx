/**
 * Kho Voucher - Shopee-style Voucher Collection Screen
 * Full-featured voucher management with categories, countdown, claim/apply
 * Updated: 09/02/2026
 */

import {
    MODERN_COLORS,
    MODERN_SHADOWS
} from "@/constants/modern-theme";
import { useVoucher } from "@/context/voucher-context";
import {
    formatCurrency,
    formatVoucherDiscount,
    getTimeRemaining,
    isVoucherValid,
    Voucher,
    VOUCHER_CATEGORY_CONFIG,
    VoucherCategory
} from "@/services/voucherService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

type TabKey = "available" | "claimed" | "used" | "expired";

const TABS: { key: TabKey; label: string }[] = [
  { key: "available", label: "Khám phá" },
  { key: "claimed", label: "Của tôi" },
  { key: "used", label: "Đã dùng" },
  { key: "expired", label: "Hết hạn" },
];

export default function VouchersScreen() {
  const {
    myVouchers,
    publicVouchers,
    loading,
    dataSource,
    fetchVouchers,
    claimVoucher,
    applyVoucher,
  } = useVoucher();

  const [selectedTab, setSelectedTab] = useState<TabKey>("available");
  const [selectedCategory, setSelectedCategory] = useState<
    VoucherCategory | "all"
  >("all");
  const [searchCode, setSearchCode] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVouchers();
    setRefreshing(false);
  }, [fetchVouchers]);

  // Filter vouchers based on tab and category
  const filteredVouchers = useMemo(() => {
    let list: Voucher[] = [];

    switch (selectedTab) {
      case "available":
        list = publicVouchers.filter((v) => !v.isClaimed && isVoucherValid(v));
        break;
      case "claimed":
        list = myVouchers.filter(
          (v) => v.isClaimed && !v.isUsed && !v.isExpired && isVoucherValid(v),
        );
        break;
      case "used":
        list = myVouchers.filter((v) => v.isUsed);
        break;
      case "expired":
        list = myVouchers.filter(
          (v) => v.isExpired || (!v.isUsed && !isVoucherValid(v)),
        );
        break;
    }

    if (selectedCategory !== "all") {
      list = list.filter((v) => v.category === selectedCategory);
    }

    if (searchCode.trim()) {
      const search = searchCode.toUpperCase().trim();
      list = list.filter(
        (v) =>
          v.code.toUpperCase().includes(search) ||
          v.title.toUpperCase().includes(search),
      );
    }

    return list;
  }, [selectedTab, selectedCategory, searchCode, myVouchers, publicVouchers]);

  const tabCounts = useMemo(
    () => ({
      available: publicVouchers.filter((v) => !v.isClaimed && isVoucherValid(v))
        .length,
      claimed: myVouchers.filter(
        (v) => v.isClaimed && !v.isUsed && !v.isExpired && isVoucherValid(v),
      ).length,
      used: myVouchers.filter((v) => v.isUsed).length,
      expired: myVouchers.filter(
        (v) => v.isExpired || (!v.isUsed && !isVoucherValid(v)),
      ).length,
    }),
    [myVouchers, publicVouchers],
  );

  const handleClaim = async (voucher: Voucher) => {
    setClaimingId(voucher.id);
    const success = await claimVoucher(voucher);
    setClaimingId(null);
    if (success) {
      Alert.alert(
        "Lưu thành công!",
        `Mã ${voucher.code} đã được lưu vào Kho Voucher của bạn.`,
      );
    }
  };

  const handleApply = (voucher: Voucher) => {
    Alert.alert(
      "Áp dụng voucher",
      `Sử dụng mã ${voucher.code} cho đơn hàng?\n${formatVoucherDiscount(voucher)}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đi đến giỏ hàng",
          onPress: () => router.push("/cart"),
        },
      ],
    );
  };

  const handleCopyCode = (code: string) => {
    if (Platform.OS !== "web") {
      Clipboard.setString(code);
    }
    Alert.alert("Đã sao chép!", `Mã ${code} đã được sao chép`);
  };

  // ==================== RENDER COMPONENTS ====================

  const renderHeader = () => (
    <LinearGradient
      colors={[MODERN_COLORS.primary, "#0F766E"]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="ticket" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Kho Voucher</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {tabCounts.claimed} voucher khả dụng
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập mã voucher..."
          placeholderTextColor="#94A3B8"
          value={searchCode}
          onChangeText={setSearchCode}
          autoCapitalize="characters"
        />
        {searchCode.length > 0 && (
          <TouchableOpacity onPress={() => setSearchCode("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TABS.map((tab) => {
          const count = tabCounts[tab.key];
          const isActive = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[styles.tabBadge, isActive && styles.activeTabBadge]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      isActive && styles.activeTabBadgeText,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderCategories = () => {
    const categories: {
      key: VoucherCategory | "all";
      label: string;
      icon: string;
    }[] = [
      { key: "all", label: "Tất cả", icon: "apps" },
      ...Object.entries(VOUCHER_CATEGORY_CONFIG).map(([key, config]) => ({
        key: key as VoucherCategory,
        label: config.label,
        icon: config.icon,
      })),
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const catConfig =
            cat.key !== "all" ? VOUCHER_CATEGORY_CONFIG[cat.key] : null;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                isActive && {
                  backgroundColor: catConfig?.color || MODERN_COLORS.primary,
                },
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={isActive ? "#fff" : catConfig?.color || "#64748B"}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && { color: "#fff" },
                  !isActive && catConfig && { color: catConfig.color },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderVoucherCard = (voucher: Voucher) => {
    const catConfig = VOUCHER_CATEGORY_CONFIG[voucher.category];
    const timeRemaining = getTimeRemaining(voucher);
    const isDisabled =
      voucher.isUsed || voucher.isExpired || !isVoucherValid(voucher);
    const isClaiming = claimingId === voucher.id;
    const canClaim = !voucher.isClaimed && !isDisabled;
    const canUse = voucher.isClaimed && !isDisabled;

    // Usage progress
    const usageProgress =
      voucher.usageLimit && voucher.usageCount
        ? voucher.usageCount / voucher.usageLimit
        : 0;
    const usageText =
      voucher.usageLimit && voucher.usageCount
        ? `Đã dùng ${Math.round(usageProgress * 100)}%`
        : null;

    return (
      <View
        key={voucher.id}
        style={[styles.voucherCard, isDisabled && styles.voucherCardDisabled]}
      >
        {/* Left colored strip */}
        <View
          style={[styles.voucherStrip, { backgroundColor: catConfig.color }]}
        >
          <View style={styles.voucherStripContent}>
            <Ionicons name={catConfig.icon as any} size={22} color="#fff" />
            <Text style={styles.voucherStripLabel}>{catConfig.label}</Text>
          </View>
          {/* Sawtooth edge */}
          <View style={styles.sawtoothContainer}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.sawtoothCircle} />
            ))}
          </View>
        </View>

        {/* Right content */}
        <View style={styles.voucherBody}>
          {/* Title row */}
          <View style={styles.voucherTitleRow}>
            <Text
              style={[styles.voucherTitle, isDisabled && styles.textDisabled]}
              numberOfLines={1}
            >
              {voucher.title}
            </Text>
            {timeRemaining.isUrgent && !isDisabled && (
              <View style={styles.urgentBadge}>
                <Ionicons name="time" size={10} color="#fff" />
                <Text style={styles.urgentText}>Sắp hết</Text>
              </View>
            )}
          </View>

          {/* Discount display */}
          <Text
            style={[
              styles.voucherDiscountText,
              { color: catConfig.color },
              isDisabled && styles.textDisabled,
            ]}
          >
            {formatVoucherDiscount(voucher)}
            {voucher.maxDiscount
              ? ` (tối đa ${formatCurrency(voucher.maxDiscount)})`
              : ""}
          </Text>

          {/* Description */}
          {voucher.description && (
            <Text
              style={[styles.voucherDesc, isDisabled && styles.textDisabled]}
              numberOfLines={2}
            >
              {voucher.description}
            </Text>
          )}

          {/* Min order + Expiry */}
          <View style={styles.voucherMeta}>
            <Text style={styles.voucherMetaText}>
              Đơn tối thiểu {formatCurrency(voucher.minOrder)}
            </Text>
            <Text style={styles.voucherMetaText}>
              HSD: {new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          {/* Usage bar */}
          {usageText && !isDisabled && (
            <View style={styles.usageBarContainer}>
              <View style={styles.usageBarBg}>
                <View
                  style={[
                    styles.usageBarFill,
                    {
                      width: `${Math.min(usageProgress * 100, 100)}%`,
                      backgroundColor: catConfig.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.usageText, { color: catConfig.color }]}>
                {usageText}
              </Text>
            </View>
          )}

          {/* Actions row */}
          <View style={styles.voucherActions}>
            {/* Code + Copy */}
            <TouchableOpacity
              style={styles.codeBox}
              onPress={() => handleCopyCode(voucher.code)}
              disabled={isDisabled}
            >
              <Text
                style={[styles.codeText, isDisabled && styles.textDisabled]}
              >
                {voucher.code}
              </Text>
              <Ionicons
                name="copy-outline"
                size={14}
                color={isDisabled ? "#CBD5E1" : MODERN_COLORS.primary}
              />
            </TouchableOpacity>

            {/* Action button */}
            {canClaim && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: catConfig.color },
                ]}
                onPress={() => handleClaim(voucher)}
                disabled={isClaiming}
              >
                {isClaiming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            )}

            {canUse && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: MODERN_COLORS.primary },
                ]}
                onPress={() => handleApply(voucher)}
              >
                <Text style={styles.actionButtonText}>Dùng ngay</Text>
              </TouchableOpacity>
            )}

            {voucher.isUsed && (
              <View style={styles.usedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#94A3B8" />
                <Text style={styles.usedText}>Đã dùng</Text>
              </View>
            )}

            {voucher.isExpired && (
              <View style={styles.expiredBadge}>
                <Ionicons name="close-circle" size={14} color="#EF4444" />
                <Text style={styles.expiredText}>Hết hạn</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderFlashSaleBanner = () => {
    const flashVouchers = [...myVouchers, ...publicVouchers].filter(
      (v) => v.category === "flash_sale" && isVoucherValid(v),
    );
    if (flashVouchers.length === 0) return null;

    return (
      <LinearGradient
        colors={["#EC4899", "#F43F5E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.flashBanner}
      >
        <View style={styles.flashBannerContent}>
          <Ionicons name="flash" size={20} color="#fff" />
          <Text style={styles.flashBannerTitle}>FLASH SALE</Text>
          <Text style={styles.flashBannerCount}>
            {flashVouchers.length} voucher đang có
          </Text>
        </View>
        <TouchableOpacity
          style={styles.flashBannerButton}
          onPress={() => {
            setSelectedCategory("flash_sale");
            setSelectedTab("available");
          }}
        >
          <Text style={styles.flashBannerButtonText}>Xem ngay</Text>
          <Ionicons name="arrow-forward" size={14} color="#EC4899" />
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="ticket-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>
        {selectedTab === "available"
          ? "Không có voucher mới"
          : selectedTab === "claimed"
            ? "Chưa lưu voucher nào"
            : selectedTab === "used"
              ? "Chưa sử dụng voucher nào"
              : "Không có voucher hết hạn"}
      </Text>
      <Text style={styles.emptySubtitle}>
        Khám phá các ưu đãi mới từ cửa hàng!
      </Text>
      {selectedTab !== "available" && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => setSelectedTab("available")}
        >
          <Text style={styles.emptyButtonText}>Khám phá voucher</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ==================== MAIN RENDER ====================

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header with gradient + search */}
      {renderHeader()}

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Data source indicator */}
      {dataSource === "mock" && (
        <View style={styles.mockBanner}>
          <Ionicons name="information-circle" size={14} color="#92400E" />
          <Text style={styles.mockBannerText}>
            Dữ liệu mẫu - API đang cập nhật
          </Text>
        </View>
      )}

      {/* Tabs */}
      {renderTabs()}

      {/* Categories filter */}
      {renderCategories()}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MODERN_COLORS.primary}
          />
        }
      >
        {/* Flash sale banner */}
        {selectedTab === "available" &&
          selectedCategory === "all" &&
          renderFlashSaleBanner()}

        {/* Loading */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải voucher...</Text>
          </View>
        )}

        {/* Voucher list */}
        {!loading &&
          filteredVouchers.length > 0 &&
          filteredVouchers.map(renderVoucherCard)}

        {/* Empty state */}
        {!loading && filteredVouchers.length === 0 && renderEmptyState()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    marginBottom: 12,
    marginLeft: 36,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 44,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    padding: 0,
  },
  mockBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 6,
    gap: 6,
  },
  mockBannerText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "500",
  },
  tabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: MODERN_COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94A3B8",
  },
  activeTabText: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
  tabBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: "center",
  },
  activeTabBadge: {
    backgroundColor: MODERN_COLORS.primary,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748B",
  },
  activeTabBadgeText: {
    color: "#fff",
  },
  categoriesContainer: {
    backgroundColor: "#fff",
    paddingBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: "row",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },

  // Flash sale banner
  flashBanner: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  flashBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flashBannerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  flashBannerCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  flashBannerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  flashBannerButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EC4899",
  },

  // Voucher card
  voucherCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  voucherCardDisabled: {
    opacity: 0.55,
  },
  voucherStrip: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    position: "relative",
  },
  voucherStripContent: {
    alignItems: "center",
    gap: 6,
  },
  voucherStripLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  sawtoothContainer: {
    position: "absolute",
    right: -5,
    top: 0,
    bottom: 0,
    width: 10,
    justifyContent: "space-evenly",
  },
  sawtoothCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F8FAFC",
  },
  voucherBody: {
    flex: 1,
    padding: 12,
    paddingLeft: 10,
  },
  voucherTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  voucherTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  textDisabled: {
    color: "#94A3B8",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  urgentText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },
  voucherDiscountText: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  voucherDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 6,
  },
  voucherMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  voucherMetaText: {
    fontSize: 10,
    color: "#94A3B8",
  },
  usageBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  usageBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  usageBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  usageText: {
    fontSize: 10,
    fontWeight: "600",
  },
  voucherActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 11,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  usedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  usedText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  expiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  expiredText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "500",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
