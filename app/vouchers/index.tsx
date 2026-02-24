/**
 * Vouchers Screen - Full featured with VoucherService + Context
 * Integrates with the voucher system for claiming, applying, and managing vouchers
 */
import { MODERN_COLORS } from "@/constants/modern-theme";
import { useVoucher } from "@/context/voucher-context";
import {
    formatCurrency,
    formatVoucherDiscount,
    getTimeRemaining,
    isVoucherValid,
    Voucher,
    VOUCHER_CATEGORY_CONFIG,
    VoucherCategory,
} from "@/services/voucherService";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const tabs = ["Tất cả", "Còn hiệu lực", "Đã dùng", "Hết hạn"] as const;
type TabKey = (typeof tabs)[number];

export default function VouchersScreen() {
  const router = useRouter();
  const {
    myVouchers,
    publicVouchers,
    loading,
    fetchVouchers,
    claimVoucher,
    applyVoucherByCode,
    appliedVoucher,
  } = useVoucher();

  const [activeTab, setActiveTab] = useState<TabKey>("Tất cả");
  const [voucherCode, setVoucherCode] = useState("");
  const [addingCode, setAddingCode] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    VoucherCategory | "all"
  >("all");

  // All vouchers (my claimed + public unclaimed)
  const allVouchers = useMemo(() => {
    const combined = [...myVouchers, ...publicVouchers];
    // Deduplicate by id
    const seen = new Set<string>();
    return combined.filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }, [myVouchers, publicVouchers]);

  const filteredVouchers = useMemo(() => {
    let list = allVouchers;

    // Tab filter
    if (activeTab === "Còn hiệu lực") {
      list = list.filter((v) => isVoucherValid(v) && v.isClaimed);
    } else if (activeTab === "Đã dùng") {
      list = list.filter((v) => v.isUsed);
    } else if (activeTab === "Hết hạn") {
      list = list.filter((v) => v.isExpired);
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((v) => v.category === selectedCategory);
    }

    return list;
  }, [allVouchers, activeTab, selectedCategory]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVouchers();
    setRefreshing(false);
  }, [fetchVouchers]);

  const handleAddVoucher = useCallback(async () => {
    if (!voucherCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã voucher");
      return;
    }
    setAddingCode(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Try to apply or at least validate
    const success = applyVoucherByCode(voucherCode, 0);
    if (success) {
      setVoucherCode("");
    }
    setAddingCode(false);
  }, [voucherCode, applyVoucherByCode]);

  const handleClaim = useCallback(
    async (voucher: Voucher) => {
      setClaimingId(voucher.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const success = await claimVoucher(voucher);
      if (success) {
        Alert.alert("Thành công! 🎉", `Đã lưu voucher ${voucher.code}`);
      }
      setClaimingId(null);
    },
    [claimVoucher],
  );

  const handleCopyCode = useCallback(async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Đã sao chép", `Mã ${code} đã được sao chép`);
  }, []);

  const handleUseVoucher = useCallback(
    (voucher: Voucher) => {
      router.push("/cart");
    },
    [router],
  );

  const renderVoucherCard = (voucher: Voucher) => {
    const catConfig = VOUCHER_CATEGORY_CONFIG[voucher.category];
    const isDisabled = voucher.isUsed || voucher.isExpired;
    const canClaim = !voucher.isClaimed && !isDisabled;
    const canUse = voucher.isClaimed && isVoucherValid(voucher);
    const timeInfo = getTimeRemaining(voucher.expiresAt);
    const isClaiming = claimingId === voucher.id;
    const isApplied = appliedVoucher?.voucher.id === voucher.id;

    return (
      <View
        key={voucher.id}
        style={[
          styles.voucherCard,
          isDisabled && styles.voucherDisabled,
          isApplied && styles.voucherApplied,
        ]}
      >
        {/* Left colored strip */}
        <View
          style={[
            styles.voucherLeft,
            { backgroundColor: isDisabled ? "#94A3B8" : catConfig.color },
          ]}
        >
          <View style={styles.discountCircle}>
            <Ionicons
              name={catConfig.icon as any}
              size={18}
              color={isDisabled ? "#94A3B8" : catConfig.color}
            />
            <Text
              style={[
                styles.discountText,
                { color: isDisabled ? "#94A3B8" : catConfig.color },
              ]}
            >
              {formatVoucherDiscount(voucher)}
            </Text>
          </View>
          {!isDisabled && voucher.usageLimit && (
            <View style={styles.usageBar}>
              <View
                style={[
                  styles.usageProgress,
                  {
                    width: `${Math.min(((voucher.usageCount || 0) / voucher.usageLimit) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Sawtooth divider */}
        <View style={styles.voucherDivider}>
          <View style={[styles.dividerDot, { backgroundColor: "#F1F5F9" }]} />
          <View style={styles.dividerLine} />
          <View style={[styles.dividerDot, { backgroundColor: "#F1F5F9" }]} />
        </View>

        {/* Right content */}
        <View style={styles.voucherRight}>
          <View style={styles.voucherHeader}>
            <View style={{ flex: 1, gap: 2 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: catConfig.bgColor },
                  ]}
                >
                  <Text
                    style={[styles.categoryText, { color: catConfig.color }]}
                  >
                    {catConfig.label}
                  </Text>
                </View>
                {isApplied && (
                  <View style={styles.appliedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={12}
                      color="#0D9488"
                    />
                    <Text style={styles.appliedText}>Đang dùng</Text>
                  </View>
                )}
              </View>
              <Text style={styles.voucherTitle} numberOfLines={1}>
                {voucher.title}
              </Text>
            </View>
          </View>

          {voucher.description && (
            <Text style={styles.voucherDesc} numberOfLines={1}>
              {voucher.description}
            </Text>
          )}

          <View style={styles.voucherMeta}>
            <Text style={styles.metaText}>
              Đơn tối thiểu: {formatCurrency(voucher.minOrder)}
            </Text>
            {voucher.maxDiscount && (
              <Text style={styles.metaText}>
                Giảm tối đa: {formatCurrency(voucher.maxDiscount)}
              </Text>
            )}
          </View>

          <View style={styles.voucherFooter}>
            <View style={{ flex: 1 }}>
              {voucher.isUsed ? (
                <Text style={[styles.expiryText, { color: "#94A3B8" }]}>
                  Đã sử dụng
                </Text>
              ) : voucher.isExpired ? (
                <Text style={[styles.expiryText, { color: "#EF4444" }]}>
                  Đã hết hạn
                </Text>
              ) : timeInfo.isUrgent ? (
                <Text style={[styles.expiryText, { color: "#F59E0B" }]}>
                  ⏰ Còn {timeInfo.hours}h {timeInfo.minutes}p
                </Text>
              ) : (
                <Text style={styles.expiryText}>Còn {timeInfo.days} ngày</Text>
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyCode(voucher.code)}
              >
                <Ionicons name="copy-outline" size={14} color="#64748B" />
              </TouchableOpacity>

              {canClaim && (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: catConfig.color },
                  ]}
                  onPress={() => handleClaim(voucher)}
                  disabled={isClaiming}
                >
                  {isClaiming ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionBtnText}>Lưu</Text>
                  )}
                </TouchableOpacity>
              )}

              {canUse && (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: MODERN_COLORS.primary },
                  ]}
                  onPress={() => handleUseVoucher(voucher)}
                >
                  <Text style={styles.actionBtnText}>Dùng ngay</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Voucher của tôi", headerShown: true }} />

      {/* Add Voucher Code */}
      <View style={styles.addSection}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã voucher..."
            placeholderTextColor="#94A3B8"
            value={voucherCode}
            onChangeText={setVoucherCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.addBtn, !voucherCode.trim() && { opacity: 0.5 }]}
            onPress={handleAddVoucher}
            disabled={addingCode || !voucherCode.trim()}
          >
            {addingCode ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addBtnText}>Thêm</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => router.push("/profile/vouchers")}
        >
          <Ionicons
            name="pricetags-outline"
            size={16}
            color={MODERN_COLORS.primary}
          />
          <Text style={styles.browseText}>Khám phá thêm voucher</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={MODERN_COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <TouchableOpacity
          style={[
            styles.catChip,
            selectedCategory === "all" && styles.catChipActive,
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text
            style={[
              styles.catChipText,
              selectedCategory === "all" && styles.catChipTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        {(
          Object.entries(VOUCHER_CATEGORY_CONFIG) as [
            VoucherCategory,
            (typeof VOUCHER_CATEGORY_CONFIG)[VoucherCategory],
          ][]
        ).map(([key, config]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.catChip,
              selectedCategory === key && { backgroundColor: config.color },
            ]}
            onPress={() => setSelectedCategory(key)}
          >
            <Ionicons
              name={config.icon as any}
              size={14}
              color={selectedCategory === key ? "#fff" : config.color}
            />
            <Text
              style={[
                styles.catChipText,
                selectedCategory === key && { color: "#fff" },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Voucher List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={MODERN_COLORS.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải voucher...</Text>
          </View>
        ) : filteredVouchers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không có voucher</Text>
            <Text style={styles.emptySubtitle}>
              Hãy khám phá thêm voucher mới!
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/profile/vouchers")}
            >
              <Text style={styles.emptyBtnText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredVouchers.map(renderVoucherCard)
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  addSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  addBtn: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 14,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  browseText: { color: MODERN_COLORS.primary, fontWeight: "500", fontSize: 13 },
  categoryScroll: { backgroundColor: "#fff", paddingVertical: 10 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  catChipActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  catChipText: { fontSize: 12, fontWeight: "500", color: "#64748B" },
  catChipTextActive: { color: "#fff" },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: MODERN_COLORS.primary },
  tabText: { color: "#94A3B8", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: MODERN_COLORS.primary, fontWeight: "700" },
  listContainer: { flex: 1, padding: 16 },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  voucherDisabled: { opacity: 0.55 },
  voucherApplied: { borderWidth: 1.5, borderColor: MODERN_COLORS.primary },
  voucherLeft: {
    width: 85,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
  discountCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  discountText: { fontWeight: "800", fontSize: 11, textAlign: "center" },
  usageBar: {
    width: "80%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  usageProgress: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  voucherDivider: {
    width: 18,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  dividerDot: { width: 18, height: 18, borderRadius: 9 },
  dividerLine: {
    flex: 1,
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  voucherRight: { flex: 1, padding: 12, gap: 4 },
  voucherHeader: { flexDirection: "row", alignItems: "flex-start" },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  categoryText: { fontSize: 10, fontWeight: "600" },
  appliedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
  },
  appliedText: { fontSize: 10, fontWeight: "600", color: "#0D9488" },
  voucherTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  voucherDesc: { fontSize: 12, color: "#64748B" },
  voucherMeta: { flexDirection: "row", gap: 12 },
  metaText: { fontSize: 11, color: "#94A3B8" },
  voucherFooter: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  expiryText: { fontSize: 11, color: "#94A3B8" },
  actionRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  copyBtn: { padding: 6, backgroundColor: "#F1F5F9", borderRadius: 6 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  actionBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  loading: { alignItems: "center", paddingVertical: 60, gap: 12 },
  loadingText: { color: "#94A3B8", fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#64748B" },
  emptySubtitle: { fontSize: 13, color: "#94A3B8" },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
