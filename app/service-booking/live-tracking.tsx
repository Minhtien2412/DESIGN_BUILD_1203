/**
 * Live Tracking Screen - Grab-style real-time worker tracking
 * Shows worker moving toward customer on map with:
 * - Animated worker position
 * - ETA countdown
 * - Status timeline (đang đến → đã đến → đang làm → hoàn thành)
 * - Call/Chat/Cancel actions
 * - Route polyline
 */

import WorkerMapView from "@/components/worker/WorkerMapView";
import {
    createMockWorkerMovement,
    type TrackingStatus,
} from "@/services/worker-location.service";
import {
    getStatusIndex,
    TRACKING_STEPS
} from "@/types/booking-status";
import {
    formatDistance,
    formatTravelTime,
    haversineDistance,
    interpolateLatLng,
    type LatLng,
} from "@/utils/geo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Status Steps — imported from @/types/booking-status
// (TRACKING_STEPS, STATUS_ORDER, getStatusIndex)
// ============================================================================

// ============================================================================
// Screen
// ============================================================================

export default function LiveTrackingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId: string;
    workerId: string;
    workerName: string;
    workerAvatar: string;
    workerPhone: string;
    workerLat: string;
    workerLng: string;
    customerLat: string;
    customerLng: string;
    customerAddress: string;
    category: string;
    totalPrice: string;
  }>();

  // State
  const [trackingStatus, setTrackingStatus] =
    useState<TrackingStatus>("searching");
  const [workerPosition, setWorkerPosition] = useState<LatLng | null>(null);
  const [eta, setEta] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const movementRef = useRef<ReturnType<
    typeof createMockWorkerMovement
  > | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse locations
  const customerLocation: LatLng = useMemo(
    () => ({
      latitude: parseFloat(params.customerLat || "10.7769"),
      longitude: parseFloat(params.customerLng || "106.7009"),
    }),
    [params.customerLat, params.customerLng],
  );

  const workerStartLocation: LatLng = useMemo(
    () => ({
      latitude: parseFloat(params.workerLat || "10.7800"),
      longitude: parseFloat(params.workerLng || "106.7100"),
    }),
    [params.workerLat, params.workerLng],
  );

  const totalPrice = parseInt(params.totalPrice || "0", 10);
  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // ============================================================================
  // Pulse animation for searching state
  // ============================================================================

  useEffect(() => {
    if (trackingStatus === "searching") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    return undefined;
  }, [trackingStatus, pulseAnim]);

  // ============================================================================
  // Simulated tracking flow
  // ============================================================================

  useEffect(() => {
    // Phase 1: Searching (3 seconds)
    const searchTimer = setTimeout(() => {
      setTrackingStatus("accepted");
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Phase 2: Worker starts moving
      movementRef.current = createMockWorkerMovement(
        workerStartLocation,
        customerLocation,
        40,
      );

      // Initial position
      const initial = movementRef.current();
      setWorkerPosition({
        latitude: initial.latitude,
        longitude: initial.longitude,
      });

      const initialDist = haversineDistance(
        workerStartLocation,
        customerLocation,
      );
      setDistanceRemaining(initialDist);
      setEta(Math.ceil((initialDist / 25) * 60));

      // Build route
      const points: LatLng[] = [];
      for (let i = 0; i <= 20; i++) {
        points.push(
          interpolateLatLng(workerStartLocation, customerLocation, i / 20),
        );
      }
      setRoutePoints(points);

      // Start movement updates
      timerRef.current = setInterval(() => {
        if (!movementRef.current) return;
        const update = movementRef.current();
        const pos: LatLng = {
          latitude: update.latitude,
          longitude: update.longitude,
        };
        setWorkerPosition(pos);

        const dist = haversineDistance(pos, customerLocation);
        setDistanceRemaining(dist);
        setEta(Math.max(0, Math.ceil((dist / 25) * 60)));

        // Auto-advance status
        if (dist < 0.5) {
          setTrackingStatus((prev) =>
            prev === "accepted" || prev === "arriving" ? "arriving" : prev,
          );
        }
        if (dist < 0.05) {
          setTrackingStatus("arrived");
          if (timerRef.current) clearInterval(timerRef.current);
          if (Platform.OS !== "web")
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Auto progress to in_progress after 5s
          statusTimerRef.current = setTimeout(() => {
            setTrackingStatus("in_progress");
          }, 5000);
        }
      }, 2000);
    }, 3000);

    return () => {
      clearTimeout(searchTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, [workerStartLocation, customerLocation]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCall = useCallback(() => {
    if (params.workerPhone) {
      Linking.openURL(`tel:${params.workerPhone}`);
    }
  }, [params.workerPhone]);

  const handleChat = useCallback(() => {
    router.push(`/messages/${params.workerId}` as any);
  }, [params.workerId]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      "Huỷ đặt thợ",
      "Bạn có chắc muốn huỷ? Thợ đang trên đường đến.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Huỷ đặt thợ",
          style: "destructive",
          onPress: () => {
            setTrackingStatus("cancelled");
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeout(() => router.back(), 1500);
          },
        },
      ],
    );
  }, []);

  const handleComplete = useCallback(() => {
    setTrackingStatus("completed");
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      router.replace({
        pathname: "/service-booking/write-review",
        params: {
          bookingId: params.bookingId || "",
          workerId: params.workerId || "",
          workerName: params.workerName || "",
          workerAvatar: params.workerAvatar || "",
        },
      } as any);
    }, 2000);
  }, [params]);

  const handleSupport = useCallback(() => {
    router.push("/customer-support" as any);
  }, []);

  const currentStepIndex = getStatusIndex(trackingStatus);

  // ============================================================================
  // Status Messages
  // ============================================================================

  const statusMessage = useMemo(() => {
    switch (trackingStatus) {
      case "searching":
        return "Đang tìm thợ phù hợp...";
      case "accepted":
        return `${params.workerName || "Thợ"} đang trên đường đến`;
      case "arriving":
        return `${params.workerName || "Thợ"} sắp đến nơi`;
      case "arrived":
        return `${params.workerName || "Thợ"} đã đến!`;
      case "in_progress":
        return "Thợ đang làm việc";
      case "completed":
        return "Công việc hoàn thành!";
      case "cancelled":
        return "Đã huỷ đặt thợ";
      default:
        return "";
    }
  }, [trackingStatus, params.workerName]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ─── HEADER ─── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Theo dõi thợ</Text>
          <Text style={s.bookingCode}>#{params.bookingId || "---"}</Text>
        </View>
        <TouchableOpacity style={s.supportBtn} onPress={handleSupport}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* ─── MAP ─── */}
      <View style={s.mapContainer}>
        <WorkerMapView
          userLocation={customerLocation}
          workers={[]}
          workerMovingLocation={
            trackingStatus !== "searching" ? workerPosition : null
          }
          routePoints={routePoints.length > 0 ? routePoints : undefined}
          height={SCREEN_WIDTH * 0.85}
          showUserMarker
          interactive
        />

        {/* Searching overlay */}
        {trackingStatus === "searching" && (
          <View style={s.searchingOverlay}>
            <Animated.View
              style={[s.searchPulse, { transform: [{ scale: pulseAnim }] }]}
            >
              <MaterialCommunityIcons
                name="account-search"
                size={40}
                color="#FF6B00"
              />
            </Animated.View>
            <Text style={s.searchingText}>Đang tìm thợ gần bạn...</Text>
          </View>
        )}

        {/* ETA Badge */}
        {eta > 0 &&
          trackingStatus !== "searching" &&
          trackingStatus !== "arrived" &&
          trackingStatus !== "in_progress" &&
          trackingStatus !== "completed" && (
            <View style={s.etaFloating}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={s.etaFloatingText}>{formatTravelTime(eta)}</Text>
              <Text style={s.etaFloatingDist}>
                ({formatDistance(distanceRemaining)})
              </Text>
            </View>
          )}
      </View>

      {/* ─── STATUS CARD ─── */}
      <View style={[s.bottomSheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={s.sheetHandle} />

        {/* Status message */}
        <View style={s.statusRow}>
          <View
            style={[
              s.statusDot,
              trackingStatus === "completed" && s.statusDotCompleted,
              trackingStatus === "cancelled" && s.statusDotCancelled,
            ]}
          />
          <Text style={s.statusMessage}>{statusMessage}</Text>
        </View>

        {/* Status timeline */}
        <View style={s.timeline}>
          {TRACKING_STEPS.map((step, idx) => {
            const stepIdx = getStatusIndex(step.status);
            const isActive = currentStepIndex >= stepIdx;
            const isCurrent = trackingStatus === step.status;

            return (
              <View key={step.status} style={s.timelineItem}>
                <View
                  style={[
                    s.timelineCircle,
                    isActive && s.timelineCircleActive,
                    isCurrent && s.timelineCircleCurrent,
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={14}
                    color={isActive ? "#fff" : "#ccc"}
                  />
                </View>
                <Text
                  style={[
                    s.timelineLabel,
                    isActive && s.timelineLabelActive,
                    isCurrent && s.timelineLabelCurrent,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
                {idx < TRACKING_STEPS.length - 1 && (
                  <View
                    style={[s.timelineLine, isActive && s.timelineLineActive]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Worker info row */}
        {trackingStatus !== "searching" && trackingStatus !== "cancelled" && (
          <View style={s.workerInfoRow}>
            <Image
              source={{
                uri:
                  params.workerAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(params.workerName || "T")}&background=FF6B00&color=fff`,
              }}
              style={s.workerAvatar}
            />
            <View style={s.workerDetails}>
              <Text style={s.workerName}>{params.workerName || "Thợ"}</Text>
              {eta > 0 &&
                trackingStatus !== "arrived" &&
                trackingStatus !== "in_progress" && (
                  <Text style={s.workerETA}>
                    ~{formatTravelTime(eta)} •{" "}
                    {formatDistance(distanceRemaining)}
                  </Text>
                )}
              {trackingStatus === "arrived" && (
                <Text style={s.arrivedText}>Đã đến nơi!</Text>
              )}
              {trackingStatus === "in_progress" && (
                <Text style={s.workingText}>Đang làm việc...</Text>
              )}
            </View>

            {/* Action buttons */}
            <View style={s.actionBtns}>
              <TouchableOpacity style={s.actionBtn} onPress={handleChat}>
                <Ionicons name="chatbubble-outline" size={20} color="#FF6B00" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, s.callBtn]}
                onPress={handleCall}
              >
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Price */}
        {totalPrice > 0 && (
          <View style={s.priceBar}>
            <Text style={s.priceBarLabel}>Tổng dự kiến</Text>
            <Text style={s.priceBarValue}>{formatPrice(totalPrice)}</Text>
          </View>
        )}

        {/* Bottom actions */}
        <View style={s.bottomActions}>
          {trackingStatus === "in_progress" && (
            <TouchableOpacity
              style={s.completeBtn}
              onPress={handleComplete}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#4CAF50", "#66BB6A"]}
                style={s.completeBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={s.completeBtnText}>Xác nhận hoàn thành</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {trackingStatus === "completed" && (
            <View style={s.completedBanner}>
              <Ionicons
                name="checkmark-done-circle"
                size={28}
                color="#4CAF50"
              />
              <Text style={s.completedText}>Công việc hoàn thành!</Text>
              <Text style={s.completedSubText}>
                Đang chuyển đến đánh giá...
              </Text>
            </View>
          )}

          {(trackingStatus === "accepted" || trackingStatus === "arriving") && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
              <Text style={s.cancelBtnText}>Huỷ đặt thợ</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  bookingCode: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  supportBtn: { padding: 4 },

  // Map
  mapContainer: {
    position: "relative",
  },

  // Searching overlay
  searchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  searchPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,107,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B00",
  },

  // ETA floating
  etaFloating: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  etaFloatingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  etaFloatingDist: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },

  // Bottom sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 12,
  },

  // Status
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B00",
  },
  statusDotCompleted: {
    backgroundColor: "#4CAF50",
  },
  statusDotCancelled: {
    backgroundColor: "#F44336",
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },

  // Timeline
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timelineItem: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  timelineCircleActive: {
    backgroundColor: "#FF6B00",
  },
  timelineCircleCurrent: {
    backgroundColor: "#E65100",
    borderWidth: 2,
    borderColor: "#FFE0B2",
  },
  timelineLabel: {
    fontSize: 9,
    color: "#ccc",
    fontWeight: "500",
    textAlign: "center",
  },
  timelineLabelActive: {
    color: "#FF6B00",
  },
  timelineLabelCurrent: {
    color: "#E65100",
    fontWeight: "700",
  },
  timelineLine: {
    position: "absolute",
    top: 14,
    right: -32,
    width: 24,
    height: 2,
    backgroundColor: "#E0E0E0",
  },
  timelineLineActive: {
    backgroundColor: "#FF6B00",
  },

  // Worker info
  workerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  workerDetails: { flex: 1 },
  workerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  workerETA: {
    fontSize: 13,
    color: "#FF6B00",
    fontWeight: "600",
    marginTop: 2,
  },
  arrivedText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "700",
    marginTop: 2,
  },
  workingText: {
    fontSize: 13,
    color: "#2196F3",
    fontWeight: "600",
    marginTop: 2,
  },
  actionBtns: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
  },
  callBtn: {
    backgroundColor: "#4CAF50",
  },

  // Price
  priceBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  priceBarLabel: {
    fontSize: 13,
    color: "#666",
  },
  priceBarValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF6B00",
  },

  // Bottom actions
  bottomActions: {
    marginTop: 8,
  },
  completeBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  completeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  completedBanner: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  completedText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4CAF50",
  },
  completedSubText: {
    fontSize: 12,
    color: "#999",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
  },
});
