/**
 * Find Nearby Workers Screen - Tìm thợ xung quanh (Vua Thợ-style)
 * Entry point → leads to worker-map and booking-steps
 *
 * Features:
 * - Service category grid with REAL price ranges (min/max from DB)
 * - "Tìm thợ gần tôi" CTA → opens worker-map
 * - Quick actions bar
 * - Complete work process guide (quy trình làm việc)
 * - Price guide section
 * - Guarantees section
 */

import { SERVICE_CATEGORIES } from "@/data/service-categories";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useI18n } from "@/services/i18nService";
import type {
    PriceRange,
    WorkProcessGuide,
} from "@/services/worker-location.service";
import {
    getPriceRanges,
    getWorkProcess,
} from "@/services/worker-location.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

// ============================================================================
// Colors
// ============================================================================
const C = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  success: "#10B981",
  warning: "#F59E0B",
  blue: "#3B82F6",
  orange: "#F97316",
  purple: "#8B5CF6",
  pink: "#EC4899",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  bg: "#F8FAFB",
  white: "#FFFFFF",
  border: "#E5E7EB",
};

// ============================================================================
// Categories — imported from @/data/service-categories
// ============================================================================

const HERO_STAT_KEYS = [
  { labelKey: "workers.onlineWorkers", value: "500+", icon: "people" },
  { labelKey: "workers.avgRating", value: "4.8★", icon: "star" },
  { labelKey: "workers.coverage", value: "HCM", icon: "location" },
];

const GUARANTEE_COLORS = ["#0D9488", "#F59E0B", "#8B5CF6", "#EF4444"];

const DEFAULT_STEP_KEYS = [
  {
    step: 1,
    titleKey: "workers.step1",
    descKey: "workers.step1Desc",
    icon: "search",
    color: "#3B82F6",
    tips: [],
  },
  {
    step: 2,
    titleKey: "workers.step2",
    descKey: "workers.step2Desc",
    icon: "pricetags",
    color: "#F59E0B",
    tips: [],
  },
  {
    step: 3,
    titleKey: "workers.step3",
    descKey: "workers.step3Desc",
    icon: "map",
    color: "#0D9488",
    tips: [],
  },
  {
    step: 4,
    titleKey: "workers.step4",
    descKey: "workers.step4Desc",
    icon: "calendar",
    color: "#8B5CF6",
    tips: [],
  },
  {
    step: 5,
    titleKey: "workers.step5",
    descKey: "workers.step5Desc",
    icon: "checkmark-circle",
    color: "#10B981",
    tips: [],
  },
];

const DEFAULT_GUARANTEE_KEYS = [
  {
    titleKey: "workers.verifiedWorker",
    descKey: "workers.verifiedWorkerDesc",
    icon: "shield-checkmark",
  },
  {
    titleKey: "workers.transparentPrice",
    descKey: "workers.transparentPriceDesc",
    icon: "pricetags",
  },
  {
    titleKey: "workers.warrantyTitle",
    descKey: "workers.warrantyDesc",
    icon: "ribbon",
  },
  {
    titleKey: "workers.support247",
    descKey: "workers.support247Desc",
    icon: "headset",
  },
];

/**
 * Format VND price
 */
function formatVnd(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}tr`;
  return `${(price / 1000).toFixed(0)}k`;
}

// ============================================================================
// SCREEN
// ============================================================================
export default function FindWorkersScreen() {
  const insets = useSafeAreaInsets();
  const { address, loading: locationLoading } = useUserLocation();
  const { t } = useI18n();
  const [navigating, setNavigating] = useState(false);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [workProcess, setWorkProcess] = useState<WorkProcessGuide | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [showWorkProcess, setShowWorkProcess] = useState(false);

  // Load price ranges and work process on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [prices, process] = await Promise.all([
          getPriceRanges(),
          getWorkProcess(),
        ]);
        if (mounted) {
          setPriceRanges(prices);
          setWorkProcess(process);
        }
      } catch {
        // Fallback handled in service
      } finally {
        if (mounted) setLoadingPrices(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper: get price range for a workerType
  const getPriceForType = useCallback(
    (workerType: string): string => {
      const range = priceRanges.find((p) => p.workerType === workerType);
      if (!range) return "";
      return range.priceRangeText;
    },
    [priceRanges],
  );

  const handleFindNearby = useCallback(() => {
    setNavigating(true);
    router.push("/service-booking/worker-map" as any);
    setTimeout(() => setNavigating(false), 1000);
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    router.push(
      ("/service-booking/booking-steps?category=" + categoryId) as any,
    );
  }, []);

  const handleOpenBookingFlow = useCallback(() => {
    router.push("/service-booking/booking-steps" as any);
  }, []);

  const handleServiceHome = useCallback(() => {
    router.push("/service-booking" as any);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── HERO HEADER ─── */}
        <LinearGradient
          colors={["#0D9488", "#0F766E", "#115E59"]}
          style={styles.hero}
        >
          <View style={styles.heroTopBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>{t("workers.findWorkers")}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color="#5EEAD4" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLoading
                ? t("workers.locating")
                : address || t("workers.defaultCity")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.changeLink}>{t("workers.change")}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroHeadline}>
            {t("workers.heroTitle")}
            {"\n"}
            <Text style={{ fontWeight: "400", fontSize: 16, opacity: 0.85 }}>
              {t("workers.heroSubtitle")}
            </Text>
          </Text>

          <TouchableOpacity
            style={styles.heroCta}
            onPress={handleFindNearby}
            disabled={navigating}
            activeOpacity={0.85}
          >
            {navigating ? (
              <ActivityIndicator color={C.primary} size="small" />
            ) : (
              <>
                <Ionicons name="map" size={22} color={C.primary} />
                <Text style={styles.heroCtaText}>{t("workers.findOnMap")}</Text>
                <Ionicons name="arrow-forward" size={18} color={C.primary} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.statsRow}>
            {HERO_STAT_KEYS.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Ionicons name={s.icon as any} size={16} color="#5EEAD4" />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{t(s.labelKey)}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ─── QUICK ACTIONS ─── */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleOpenBookingFlow}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="flash" size={24} color={C.orange} />
            </View>
            <Text style={styles.quickLabel}>{t("workers.quickBook")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleFindNearby}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="navigate" size={24} color={C.success} />
            </View>
            <Text style={styles.quickLabel}>{t("workers.scanMap")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleServiceHome}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="grid" size={24} color={C.blue} />
            </View>
            <Text style={styles.quickLabel}>{t("workers.allServices")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/service-booking/schedule" as any)}
          >
            <View style={[styles.quickIcon, { backgroundColor: "#FDF2F8" }]}>
              <Ionicons name="calendar" size={24} color={C.pink} />
            </View>
            <Text style={styles.quickLabel}>{t("workers.appointment")}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── LIVE TRACKING BANNER ─── */}
        <TouchableOpacity
          style={styles.trackingBanner}
          onPress={() =>
            router.push("/service-booking/active-trackings" as any)
          }
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#0D9488", "#14B8A6"]}
            style={styles.trackingBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.trackingBannerIcon}>
              <Ionicons name="navigate" size={22} color="#fff" />
            </View>
            <View style={styles.trackingBannerInfo}>
              <Text style={styles.trackingBannerTitle}>
                {t("workers.liveTracking")}
              </Text>
              <Text style={styles.trackingBannerSub}>
                {t("workers.liveTrackingSub")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* ─── SERVICE CATEGORIES WITH PRICE RANGES ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("workers.serviceCategories")}
            </Text>
            <TouchableOpacity onPress={handleServiceHome}>
              <Text style={styles.seeAll}>{t("workers.viewAll")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceNote}>
            <Ionicons name="information-circle" size={16} color={C.primary} />
            <Text style={styles.priceNoteText}>{t("workers.priceNote")}</Text>
          </View>

          {loadingPrices ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={styles.loadingText}>
                {t("workers.loadingPrices")}
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {SERVICE_CATEGORIES.map((cat) => {
                const priceText = getPriceForType(cat.workerType);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(cat.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.categoryIconWrap,
                        { backgroundColor: cat.color + "18" },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={28}
                        color={cat.color}
                      />
                    </View>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Text style={styles.categoryDesc}>{cat.desc}</Text>
                    {priceText ? (
                      <View style={styles.priceTag}>
                        <Ionicons
                          name="pricetags-outline"
                          size={10}
                          color={C.primary}
                        />
                        <Text style={styles.priceTagText}>
                          {priceText}
                          {t("workers.perDay")}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ─── PRICE RANGE TABLE ─── */}
        {priceRanges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("workers.priceTable")}</Text>
            <Text style={styles.sectionSubtitle}>
              {t("workers.priceTableSub")}
            </Text>
            <View style={styles.priceTable}>
              <View style={styles.priceTableHeader}>
                <Text
                  style={[
                    styles.priceTableCell,
                    styles.priceTableHeaderText,
                    { flex: 2 },
                  ]}
                >
                  {t("workers.workerType")}
                </Text>
                <Text
                  style={[styles.priceTableCell, styles.priceTableHeaderText]}
                >
                  {t("workers.lowest")}
                </Text>
                <Text
                  style={[styles.priceTableCell, styles.priceTableHeaderText]}
                >
                  {t("workers.highest")}
                </Text>
                <Text
                  style={[styles.priceTableCell, styles.priceTableHeaderText]}
                >
                  {t("workers.workerCount")}
                </Text>
              </View>
              {priceRanges.map((pr, idx) => (
                <View
                  key={pr.workerType}
                  style={[
                    styles.priceTableRow,
                    idx % 2 === 0 && styles.priceTableRowAlt,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceTableCell,
                      { flex: 2, fontWeight: "600" },
                    ]}
                  >
                    {pr.workerTypeLabel}
                  </Text>
                  <Text style={[styles.priceTableCell, { color: C.success }]}>
                    {formatVnd(pr.minPrice)}
                  </Text>
                  <Text style={[styles.priceTableCell, { color: C.orange }]}>
                    {formatVnd(pr.maxPrice)}
                  </Text>
                  <Text
                    style={[
                      styles.priceTableCell,
                      { color: C.blue, fontWeight: "600" },
                    ]}
                  >
                    {pr.workerCount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── HOW IT WORKS (QUY TRÌNH) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("workers.bookingProcess")}
            </Text>
            <TouchableOpacity
              onPress={() => setShowWorkProcess(!showWorkProcess)}
            >
              <Text style={styles.seeAll}>
                {showWorkProcess ? t("workers.collapse") : t("workers.details")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepsContainer}>
            {(workProcess?.steps || DEFAULT_STEP_KEYS).map(
              (s: any, i: number) => (
                <View key={i}>
                  <TouchableOpacity
                    style={styles.stepRow}
                    activeOpacity={0.7}
                    onPress={() => setShowWorkProcess(!showWorkProcess)}
                  >
                    <View style={styles.stepNumberWrap}>
                      <LinearGradient
                        colors={[s.color, s.color + "CC"]}
                        style={styles.stepNumber}
                      >
                        <Text style={styles.stepNumberText}>
                          {s.step || i + 1}
                        </Text>
                      </LinearGradient>
                      {i <
                        (workProcess?.steps || DEFAULT_STEP_KEYS).length -
                          1 && (
                        <View
                          style={[
                            styles.stepConnector,
                            { backgroundColor: s.color + "40" },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <View style={styles.stepTitleRow}>
                        <Ionicons
                          name={s.icon as any}
                          size={18}
                          color={s.color}
                        />
                        <Text style={styles.stepTitle}>
                          {s.titleKey ? t(s.titleKey) : s.title}
                        </Text>
                      </View>
                      <Text style={styles.stepDesc}>
                        {s.descKey ? t(s.descKey) : s.description}
                      </Text>
                      {showWorkProcess && s.tips && s.tips.length > 0 && (
                        <View style={styles.tipsContainer}>
                          {s.tips.map((tip: string, ti: number) => (
                            <View key={ti} style={styles.tipRow}>
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={C.success}
                              />
                              <Text style={styles.tipText}>{tip}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ),
            )}
          </View>
        </View>

        {/* ─── PRICE GUIDE ─── */}
        {(workProcess?.priceGuide || showWorkProcess) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("workers.priceCalcTitle")}
            </Text>
            <View style={styles.priceGuideCard}>
              <Text style={styles.priceGuideDesc}>
                {workProcess?.priceGuide?.description ||
                  t("workers.priceCalcDefault")}
              </Text>
              {(workProcess?.priceGuide?.factors || []).map((f, i) => (
                <View key={i} style={styles.factorRow}>
                  <View style={styles.factorBullet} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.factorTitle}>{f.factor}</Text>
                    <Text style={styles.factorDesc}>{f.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── GUARANTEES ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("workers.serviceGuarantee")}
          </Text>
          <View style={styles.guaranteesGrid}>
            {(workProcess?.guarantees || DEFAULT_GUARANTEE_KEYS).map(
              (g: any, i: number) => (
                <View key={i} style={styles.guaranteeCard}>
                  <View
                    style={[
                      styles.guaranteeIcon,
                      {
                        backgroundColor:
                          GUARANTEE_COLORS[i % GUARANTEE_COLORS.length] + "18",
                      },
                    ]}
                  >
                    <Ionicons
                      name={g.icon as any}
                      size={24}
                      color={GUARANTEE_COLORS[i % GUARANTEE_COLORS.length]}
                    />
                  </View>
                  <Text style={styles.guaranteeTitle}>
                    {g.titleKey ? t(g.titleKey) : g.title}
                  </Text>
                  <Text style={styles.guaranteeDesc}>
                    {g.descKey ? t(g.descKey) : g.description}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>

        {/* ─── BOTTOM CTA ─── */}
        <TouchableOpacity
          style={styles.bottomCta}
          onPress={handleOpenBookingFlow}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#0D9488", "#0F766E"]}
            style={styles.bottomCtaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons
              name="account-hard-hat"
              size={28}
              color="#fff"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.bottomCtaTitle}>
                {t("workers.startBooking")}
              </Text>
              <Text style={styles.bottomCtaSubtitle}>
                {t("workers.startBookingSub")}
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 32 },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.9)" },
  changeLink: { fontSize: 13, fontWeight: "600", color: "#5EEAD4" },
  heroHeadline: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    lineHeight: 34,
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  heroCtaText: { fontSize: 17, fontWeight: "700", color: C.primary },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)" },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -16,
    marginBottom: 24,
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  quickAction: { alignItems: "center", gap: 8, flex: 1 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.text,
    textAlign: "center",
    lineHeight: 14,
  },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  sectionSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 12,
    marginTop: -8,
  },
  seeAll: { fontSize: 14, fontWeight: "600", color: C.primary },

  // Price Note
  priceNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.primary + "10",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  priceNoteText: { flex: 1, fontSize: 12, color: C.primary, fontWeight: "500" },

  // Loading
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: { fontSize: 14, color: C.textSecondary },

  // Categories Grid
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryCard: {
    width: (SW - 64) / 3,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
  },
  categoryDesc: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: "center",
    marginTop: 2,
  },

  // Price tag on category card
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.primary + "12",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
  },
  priceTagText: { fontSize: 9, fontWeight: "700", color: C.primary },

  // Price Table
  priceTable: {
    backgroundColor: C.white,
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  priceTableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  priceTableHeaderText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  priceTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  priceTableRowAlt: { backgroundColor: "#F9FAFB" },
  priceTableCell: { flex: 1, fontSize: 12, color: C.text },

  // Steps / Work Process
  stepsContainer: {
    marginTop: 12,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  stepRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 4,
  },
  stepNumberWrap: { alignItems: "center", width: 36 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  stepConnector: { width: 2, flex: 1, marginVertical: 4 },
  stepContent: { flex: 1, paddingBottom: 16 },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  stepTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  stepDesc: { fontSize: 13, color: C.textSecondary, lineHeight: 18 },

  // Tips
  tipsContainer: {
    marginTop: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  tipText: { flex: 1, fontSize: 12, color: C.textSecondary, lineHeight: 16 },

  // Price Guide
  priceGuideCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  priceGuideDesc: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  factorRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  factorBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
    marginTop: 6,
  },
  factorTitle: { fontSize: 13, fontWeight: "700", color: C.text },
  factorDesc: { fontSize: 12, color: C.textSecondary, marginTop: 1 },

  // Guarantees
  guaranteesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  guaranteeCard: {
    width: (SW - 52) / 2,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  guaranteeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginBottom: 2,
  },
  guaranteeDesc: { fontSize: 11, color: C.textSecondary },

  // Bottom CTA
  bottomCta: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  bottomCtaGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  bottomCtaTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  bottomCtaSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // Tracking banner
  trackingBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  trackingBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackingBannerInfo: { flex: 1 },
  trackingBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  trackingBannerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});
