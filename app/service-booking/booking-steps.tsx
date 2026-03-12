/**
 * Booking Steps - Grab-style 3-step worker booking wizard
 *
 * Step 1: Choose service category + set your location
 * Step 2: Search & see workers on map, select one
 * Step 3: Confirm booking details, schedule, payment
 *
 * Uses existing WorkerMapView, useNearbyWorkers, useUserLocation
 */

import WorkerMapView from "@/components/worker/WorkerMapView";
import {
    PAYMENT_METHODS,
    RADIUS_OPTIONS,
    SERVICE_CATEGORIES,
    type ServiceCategory,
} from "@/data/service-categories";
import { useNearbyWorkers } from "@/hooks/useNearbyWorkers";
import { useUserLocation } from "@/hooks/useUserLocation";
import type {
    PriceRange,
    WorkerWithLocation,
} from "@/services/worker-location.service";
import {
    getPriceRanges,
    requestWorkerBooking,
} from "@/services/worker-location.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");

// ============================================================================
// Colors
// ============================================================================
const C = {
  primary: "#0D9488",
  primaryLight: "#F0FDFA",
  primaryDark: "#0F766E",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  blue: "#3B82F6",
  orange: "#F97316",
  purple: "#8B5CF6",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  bg: "#F8FAFB",
  white: "#FFFFFF",
  border: "#E5E7EB",
};

// ============================================================================
// Service categories — imported from @/data/service-categories
// ============================================================================

// RADIUS_OPTIONS & PAYMENT_METHODS also imported from shared data

// ============================================================================
// SCREEN
// ============================================================================
export default function BookingStepsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();

  // Steps: 1=Choose Service, 2=Find Workers on Map, 3=Confirm
  const [step, setStep] = useState(params.category ? 2 : 1);
  const [selectedCategory, setSelectedCategory] = useState(
    SERVICE_CATEGORIES.find((c) => c.id === params.category) || null,
  );

  // Location
  const { location, address, loading: locationLoading } = useUserLocation();
  const [customerAddress, setCustomerAddress] = useState("");

  // Map / Workers
  const [radius, setRadius] = useState(10);
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);
  const selectedWorkerType = selectedCategory?.workerType;

  const {
    workers,
    loading: workersLoading,
    selectedWorker,
    totalFound,
    searchRadius,
    search,
    selectWorker,
    setRadius: setSearchRadius,
    refresh,
  } = useNearbyWorkers(location, {
    workerType: selectedWorkerType,
    radiusKm: radius,
    autoSearch: step === 2,
  });

  // Step 3 — Booking
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  // Price ranges (Vua Thợ-style)
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCustomerAddress(address || "");
  }, [address]);

  // Load price ranges on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prices = await getPriceRanges();
        if (mounted) setPriceRanges(prices);
      } catch {
        /* fallback handled in service */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Helper: get price range for a workerType
  const getPriceForType = useCallback(
    (workerType: string): PriceRange | undefined => {
      return priceRanges.find((p) => p.workerType === workerType);
    },
    [priceRanges],
  );

  // When category param is set, auto-advance to step 2
  useEffect(() => {
    if (params.category && selectedCategory && location) {
      setStep(2);
    }
  }, [params.category, selectedCategory, location]);

  const animateStep = useCallback(
    (to: number) => {
      Animated.timing(slideAnim, {
        toValue: to === 1 ? 0 : to === 2 ? -SW : -SW * 2,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setStep(to);
    },
    [slideAnim],
  );

  // ─── Step 1 → 2
  const handleCategorySelect = useCallback(
    (cat: ServiceCategory) => {
      setSelectedCategory(cat);
      animateStep(2);
      // Trigger search with new worker type
      if (location) {
        search(location);
      }
    },
    [animateStep, location, search],
  );

  // ─── Step 2 → 3
  const handleWorkerConfirm = useCallback(
    (worker: WorkerWithLocation) => {
      selectWorker(worker);
      animateStep(3);
    },
    [animateStep, selectWorker],
  );

  // ─── Step 3 → Book!
  const handleConfirmBooking = useCallback(async () => {
    if (!selectedWorker || !location) return;

    setBooking(true);
    try {
      const result = await requestWorkerBooking({
        workerId: selectedWorker.id,
        serviceCategory: selectedCategory?.id || "general",
        customerLatitude: location.latitude,
        customerLongitude: location.longitude,
        customerAddress: customerAddress || address || "Hồ Chí Minh",
        scheduledDate: scheduledDate.toISOString(),
        scheduledTime,
        estimatedPrice: selectedWorker.dailyRate || 500000,
        notes: notes || undefined,
        paymentMethod,
        distanceKm: selectedWorker.distance,
      });

      // Navigate to live tracking
      router.replace({
        pathname: "/service-booking/live-tracking",
        params: {
          bookingId: result.bookingId,
          workerId: selectedWorker.id,
          workerName: selectedWorker.name,
          workerAvatar: selectedWorker.avatar || "",
          workerPhone: selectedWorker.phone || "",
          customerLat: String(location.latitude),
          customerLng: String(location.longitude),
          workerLat: String(selectedWorker.latitude),
          workerLng: String(selectedWorker.longitude),
        },
      } as any);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt thợ. Vui lòng thử lại.");
    } finally {
      setBooking(false);
    }
  }, [
    selectedWorker,
    location,
    selectedCategory,
    customerAddress,
    address,
    scheduledDate,
    scheduledTime,
    notes,
    paymentMethod,
  ]);

  const handleRadiusChange = useCallback(
    (km: number) => {
      setRadius(km);
      setSearchRadius(km);
      setShowRadiusSelector(false);
    },
    [setSearchRadius],
  );

  // Sort workers by distance
  const sortedWorkers = useMemo(
    () => [...workers].sort((a, b) => (a.distance || 0) - (b.distance || 0)),
    [workers],
  );

  // ============================================================================
  // STEP 1: Choose Service
  // ============================================================================
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDotLine} />
          <View style={styles.stepDot} />
          <View style={styles.stepDotLine} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.stepLabel}>Bước 1/3</Text>
      </View>

      <Text style={styles.stepTitle}>Bạn cần dịch vụ gì?</Text>
      <Text style={styles.stepSubtitle}>Chọn loại thợ để bắt đầu tìm kiếm</Text>

      {/* Location */}
      <View style={styles.locationCard}>
        <Ionicons name="location" size={20} color={C.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.locationCardLabel}>Vị trí của bạn</Text>
          <Text style={styles.locationCardText} numberOfLines={1}>
            {locationLoading
              ? "Đang xác định..."
              : customerAddress || "Hồ Chí Minh"}
          </Text>
        </View>
        {locationLoading && (
          <ActivityIndicator size="small" color={C.primary} />
        )}
      </View>

      {/* Categories grid */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.priceRangeNote}>
          <Ionicons name="pricetags" size={14} color={C.primary} />
          <Text style={styles.priceRangeNoteText}>
            Khoảng giá: Thấp nhất → Cao nhất (theo báo giá thực tế của thợ)
          </Text>
        </View>
        <View style={styles.categoriesGrid}>
          {SERVICE_CATEGORIES.map((cat) => {
            const priceInfo = getPriceForType(cat.workerType);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  selectedCategory?.id === cat.id &&
                    styles.categoryCardSelected,
                ]}
                onPress={() => handleCategorySelect(cat)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIcon,
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
                {priceInfo ? (
                  <Text style={styles.categoryPriceRange}>
                    {priceInfo.priceRangeText}/ngày
                  </Text>
                ) : (
                  <Text style={styles.categoryPriceRange}>Liên hệ</Text>
                )}
                {priceInfo && priceInfo.workerCount > 0 && (
                  <Text style={styles.categoryWorkerCount}>
                    {priceInfo.workerCount} thợ
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  // ============================================================================
  // STEP 2: Find Workers on Map
  // ============================================================================
  const renderWorkerCard = useCallback(
    ({ item }: { item: WorkerWithLocation }) => {
      const isSelected = selectedWorker?.id === item.id;
      return (
        <TouchableOpacity
          style={[styles.workerCard, isSelected && styles.workerCardSelected]}
          onPress={() => selectWorker(item)}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri:
                item.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0D9488&color=fff&size=100`,
            }}
            style={styles.workerAvatar}
          />
          <View style={styles.workerInfo}>
            <View style={styles.workerNameRow}>
              <Text style={styles.workerName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.verified && (
                <Ionicons name="checkmark-circle" size={16} color={C.primary} />
              )}
            </View>
            <View style={styles.workerMeta}>
              <Ionicons name="star" size={12} color={C.warning} />
              <Text style={styles.workerRating}>{item.rating?.toFixed(1)}</Text>
              <Text style={styles.workerMetaDot}>•</Text>
              <Ionicons name="navigate-outline" size={12} color={C.textMuted} />
              <Text style={styles.workerDistance}>
                {item.distance ? `${item.distance.toFixed(1)} km` : "N/A"}
              </Text>
              <Text style={styles.workerMetaDot}>•</Text>
              <Text style={styles.workerETA}>
                {item.estimatedArrival ? `~${item.estimatedArrival} phút` : ""}
              </Text>
            </View>
            <Text style={styles.workerPrice}>
              {item.dailyRate
                ? `${(item.dailyRate / 1000).toFixed(0)}k/ngày`
                : "Liên hệ"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
            onPress={() =>
              isSelected ? handleWorkerConfirm(item) : selectWorker(item)
            }
          >
            <Text
              style={[
                styles.selectBtnText,
                isSelected && styles.selectBtnTextActive,
              ]}
            >
              {isSelected ? "Đặt thợ" : "Chọn"}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [selectedWorker, selectWorker, handleWorkerConfirm],
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <TouchableOpacity
          onPress={() => animateStep(1)}
          style={styles.backStepBtn}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepDotLine, styles.stepDotLineDone]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDotLine} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.stepLabel}>Bước 2/3</Text>
      </View>

      <View style={styles.step2Header}>
        <View>
          <Text style={styles.stepTitle}>Tìm thợ gần bạn</Text>
          <Text style={styles.stepSubtitle}>
            {selectedCategory?.label || "Tất cả"} • {totalFound} thợ trong{" "}
            {searchRadius}km
          </Text>
        </View>

        {/* Radius selector */}
        <TouchableOpacity
          style={styles.radiusBtn}
          onPress={() => setShowRadiusSelector(!showRadiusSelector)}
        >
          <Ionicons name="resize-outline" size={16} color={C.primary} />
          <Text style={styles.radiusBtnText}>{searchRadius}km</Text>
        </TouchableOpacity>
      </View>

      {showRadiusSelector && (
        <View style={styles.radiusOptions}>
          {RADIUS_OPTIONS.map((km) => (
            <TouchableOpacity
              key={km}
              style={[
                styles.radiusOption,
                searchRadius === km && styles.radiusOptionActive,
              ]}
              onPress={() => handleRadiusChange(km)}
            >
              <Text
                style={[
                  styles.radiusOptionText,
                  searchRadius === km && styles.radiusOptionTextActive,
                ]}
              >
                {km}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        {location ? (
          <WorkerMapView
            userLocation={location}
            workers={sortedWorkers}
            selectedWorker={selectedWorker}
            onWorkerSelect={selectWorker}
            height={SH * 0.35}
            showRadius
            radiusKm={searchRadius}
          />
        ) : (
          <View style={[styles.mapPlaceholder, { height: SH * 0.35 }]}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.mapPlaceholderText}>
              Đang xác định vị trí...
            </Text>
          </View>
        )}

        {/* Scanning overlay */}
        {workersLoading && (
          <View style={styles.scanningOverlay}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.scanningText}>Đang quét thợ gần bạn...</Text>
          </View>
        )}
      </View>

      {/* Worker list */}
      <View style={styles.workerListContainer}>
        <View style={styles.workerListHeader}>
          <Text style={styles.workerListTitle}>
            {sortedWorkers.length} thợ gần bạn
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={20} color={C.primary} />
          </TouchableOpacity>
        </View>

        {sortedWorkers.length > 0 ? (
          <FlatList
            data={sortedWorkers}
            keyExtractor={(item) => item.id}
            renderItem={renderWorkerCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : !workersLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={C.textMuted} />
            <Text style={styles.emptyText}>
              Không tìm thấy thợ trong khu vực
            </Text>
            <Text style={styles.emptyHint}>Thử tăng bán kính tìm kiếm</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  // ============================================================================
  // STEP 3: Confirm Booking
  // ============================================================================
  const renderStep3 = () => {
    if (!selectedWorker) return null;
    const estimatedPrice = selectedWorker.dailyRate || 500000;
    const serviceFee = Math.round(estimatedPrice * 0.1);
    const total = estimatedPrice + serviceFee;

    return (
      <KeyboardAvoidingView
        style={styles.stepContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.stepHeader}>
          <TouchableOpacity
            onPress={() => animateStep(2)}
            style={styles.backStepBtn}
          >
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepDotLine, styles.stepDotLineDone]} />
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={[styles.stepDotLine, styles.stepDotLineDone]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>
          <Text style={styles.stepLabel}>Bước 3/3</Text>
        </View>

        <Text style={styles.stepTitle}>Xác nhận đặt thợ</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Worker info card */}
          <View style={styles.confirmWorkerCard}>
            <Image
              source={{
                uri:
                  selectedWorker.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedWorker.name)}&background=0D9488&color=fff`,
              }}
              style={styles.confirmAvatar}
            />
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={styles.confirmName}>{selectedWorker.name}</Text>
                {selectedWorker.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={C.primary}
                  />
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Ionicons name="star" size={14} color={C.warning} />
                <Text style={styles.confirmMeta}>
                  {selectedWorker.rating?.toFixed(1)}
                </Text>
                <Text style={styles.confirmMeta}>•</Text>
                <Text style={styles.confirmMeta}>
                  {selectedWorker.distance?.toFixed(1)} km
                </Text>
                <Text style={styles.confirmMeta}>•</Text>
                <Text style={styles.confirmMeta}>
                  {selectedWorker.experience} năm KN
                </Text>
              </View>
            </View>
          </View>

          {/* Map preview */}
          {location && (
            <View style={styles.miniMapWrap}>
              <WorkerMapView
                userLocation={location}
                workers={[selectedWorker]}
                selectedWorker={selectedWorker}
                onWorkerSelect={() => {}}
                height={150}
              />
            </View>
          )}

          {/* Address */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Địa chỉ</Text>
            <View style={styles.addressInput}>
              <Ionicons name="location" size={18} color={C.primary} />
              <TextInput
                style={styles.addressText}
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="Nhập địa chỉ của bạn"
                placeholderTextColor={C.textMuted}
              />
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Thời gian</Text>
            <View style={styles.scheduleRow}>
              <TouchableOpacity style={styles.scheduleBtn}>
                <Ionicons name="calendar-outline" size={18} color={C.primary} />
                <Text style={styles.scheduleBtnText}>
                  {scheduledDate.toLocaleDateString("vi-VN")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.scheduleBtn}>
                <Ionicons name="time-outline" size={18} color={C.primary} />
                <Text style={styles.scheduleBtnText}>{scheduledTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Ghi chú (tùy chọn)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Mô tả công việc cần thực hiện..."
              placeholderTextColor={C.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Payment method */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Thanh toán</Text>
            <View style={styles.paymentRow}>
              {PAYMENT_METHODS.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  style={[
                    styles.paymentOption,
                    paymentMethod === pm.id && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod(pm.id)}
                >
                  <Ionicons
                    name={pm.icon as any}
                    size={20}
                    color={paymentMethod === pm.id ? C.primary : C.textMuted}
                  />
                  <Text
                    style={[
                      styles.paymentOptionText,
                      paymentMethod === pm.id && styles.paymentOptionTextActive,
                    ]}
                  >
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price breakdown */}
          <View style={styles.priceCard}>
            {/* Price range context */}
            {selectedCategory &&
              (() => {
                const priceInfo = getPriceForType(selectedCategory.workerType);
                if (priceInfo) {
                  return (
                    <View style={styles.priceRangeInfo}>
                      <Ionicons name="pricetags" size={14} color={C.warning} />
                      <Text style={styles.priceRangeInfoText}>
                        Khoảng giá {selectedCategory.label}:{" "}
                        {priceInfo.priceRangeText}/ngày
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá dịch vụ</Text>
              <Text style={styles.priceValue}>
                {estimatedPrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí dịch vụ (10%)</Text>
              <Text style={styles.priceValue}>
                {serviceFee.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Tổng cộng</Text>
              <Text style={styles.priceTotalValue}>
                {total.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bottomTotal}>
              {total.toLocaleString("vi-VN")}đ
            </Text>
            <Text style={styles.bottomTotalHint}>Tổng thanh toán</Text>
          </View>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmBooking}
            disabled={booking}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#0D9488", "#0F766E"]}
              style={styles.confirmBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {booking ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="account-hard-hat"
                    size={22}
                    color="#fff"
                  />
                  <Text style={styles.confirmBtnText}>Đặt thợ ngay</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar with close */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {step === 1 ? "Đặt thợ" : step === 2 ? "Tìm thợ" : "Xác nhận"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  topBarTitle: { fontSize: 17, fontWeight: "700", color: C.text },

  // Step container
  stepContainer: { flex: 1, paddingHorizontal: 20 },

  // Step header / indicators
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  backStepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.border + "80",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.border,
  },
  stepDotActive: {
    backgroundColor: C.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotDone: { backgroundColor: C.success },
  stepDotLine: { width: 40, height: 2, backgroundColor: C.border },
  stepDotLineDone: { backgroundColor: C.success },
  stepLabel: { fontSize: 12, fontWeight: "600", color: C.textMuted },

  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },
  stepSubtitle: { fontSize: 14, color: C.textSecondary, marginBottom: 16 },

  // Step 1 — Location card
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  locationCardLabel: { fontSize: 11, color: C.textMuted, fontWeight: "600" },
  locationCardText: { fontSize: 14, color: C.text, fontWeight: "500" },

  // Step 1 — Categories
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 20,
  },
  categoryCard: {
    width: (SW - 64) / 3,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
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
  categoryCardSelected: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  categoryIcon: {
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

  // Step 2 — Header
  step2Header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  radiusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  radiusBtnText: { fontSize: 13, fontWeight: "600", color: C.primary },
  radiusOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  radiusOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  radiusOptionActive: { backgroundColor: C.primary, borderColor: C.primary },
  radiusOptionText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  radiusOptionTextActive: { color: "#fff" },

  // Step 2 — Map
  mapContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  mapPlaceholder: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholderText: { fontSize: 14, color: C.textSecondary, marginTop: 12 },
  scanningOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scanningText: { fontSize: 13, color: "#fff", fontWeight: "500" },

  // Step 2 — Worker list
  workerListContainer: { flex: 1 },
  workerListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workerListTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  workerCardSelected: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  workerAvatar: { width: 48, height: 48, borderRadius: 24 },
  workerInfo: { flex: 1 },
  workerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  workerName: { fontSize: 14, fontWeight: "700", color: C.text, flex: 1 },
  workerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  workerRating: { fontSize: 12, fontWeight: "600", color: C.text },
  workerMetaDot: { fontSize: 10, color: C.textMuted },
  workerDistance: { fontSize: 12, color: C.textSecondary },
  workerETA: { fontSize: 12, color: C.success, fontWeight: "500" },
  workerPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
    marginTop: 4,
  },
  selectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  selectBtnActive: { backgroundColor: C.primary },
  selectBtnText: { fontSize: 13, fontWeight: "700", color: C.primary },
  selectBtnTextActive: { color: "#fff" },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: C.textSecondary,
    marginTop: 12,
  },
  emptyHint: { fontSize: 13, color: C.textMuted, marginTop: 4 },

  // Step 3 — Confirm
  confirmWorkerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  confirmAvatar: { width: 56, height: 56, borderRadius: 28 },
  confirmName: { fontSize: 16, fontWeight: "700", color: C.text },
  confirmMeta: { fontSize: 13, color: C.textSecondary },

  miniMapWrap: { borderRadius: 14, overflow: "hidden", marginBottom: 16 },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  addressInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  addressText: { flex: 1, fontSize: 14, color: C.text },

  scheduleRow: { flexDirection: "row", gap: 12 },
  scheduleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  scheduleBtnText: { fontSize: 14, color: C.text, fontWeight: "500" },

  notesInput: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 14,
    color: C.text,
    minHeight: 80,
    textAlignVertical: "top",
  },

  paymentRow: { flexDirection: "row", gap: 10 },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  paymentOptionActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  paymentOptionText: { fontSize: 13, fontWeight: "600", color: C.textMuted },
  paymentOptionTextActive: { color: C.primary },

  priceCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
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
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 14, color: C.textSecondary },
  priceValue: { fontSize: 14, fontWeight: "600", color: C.text },
  priceDivider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  priceTotalLabel: { fontSize: 16, fontWeight: "700", color: C.text },
  priceTotalValue: { fontSize: 18, fontWeight: "800", color: C.primary },

  // Bottom bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  bottomTotal: { fontSize: 18, fontWeight: "800", color: C.primary },
  bottomTotalHint: { fontSize: 11, color: C.textMuted },
  confirmBtn: { borderRadius: 14, overflow: "hidden" },
  confirmBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  confirmBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Price range note (Step 1)
  priceRangeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  priceRangeNoteText: {
    flex: 1,
    fontSize: 11,
    color: "#0D9488",
    fontWeight: "500",
  },

  // Category price range
  categoryPriceRange: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0D9488",
    marginTop: 4,
    textAlign: "center",
  },
  categoryWorkerCount: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 1,
    textAlign: "center",
  },

  // Price range info (Step 3)
  priceRangeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  priceRangeInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
});
