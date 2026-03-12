/**
 * Worker Route Tracking Screen - Google Maps-style real-time route tracking
 * Shopee/Grab-style: shows worker/driver actual movement on map with route
 *
 * Features:
 * - Real-time animated worker movement along route path
 * - Google Maps-style route visualization (street names, distance markers)
 * - Speed/heading indicator
 * - ETA with live countdown
 * - Turn-by-turn mini directions
 * - Driver/worker info card with vehicle details
 * - Share live location link
 * - Call/Chat/Emergency actions
 * - Status timeline (đang đến → gần nơi → đã đến)
 * - Pull-down for detail panel
 */

import WorkerMapView from "@/components/worker/WorkerMapView";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
    createMockWorkerMovement,
    type TrackingStatus,
} from "@/services/worker-location.service";
import { getStatusIndex, TRACKING_STEPS } from "@/types/booking-status";
import {
    bearing,
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
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// Colors
// ============================================================================
const C = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  accent: "#14B8A6",
  orange: "#FF6B00",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  blue: "#3B82F6",
  text: "#1A1A1A",
  textSec: "#666",
  textMuted: "#999",
  bg: "#F5F5F5",
  white: "#FFFFFF",
  border: "#E0E0E0",
};

// ============================================================================
// Vehicle Types
// ============================================================================
type VehicleType =
  | "motorbike"
  | "car"
  | "truck"
  | "concrete_mixer"
  | "crane"
  | "van";

interface VehicleInfo {
  type: VehicleType;
  label: string;
  icon: string;
  iconLib: "ionicons" | "material";
  plate: string;
  color: string;
  avgSpeedKmh: number;
}

const VEHICLE_MAP: Record<VehicleType, Omit<VehicleInfo, "plate">> = {
  motorbike: {
    type: "motorbike",
    label: "Xe máy",
    icon: "motorbike",
    iconLib: "material",
    color: "#3B82F6",
    avgSpeedKmh: 25,
  },
  car: {
    type: "car",
    label: "Ô tô",
    icon: "car",
    iconLib: "ionicons",
    color: "#8B5CF6",
    avgSpeedKmh: 30,
  },
  truck: {
    type: "truck",
    label: "Xe tải",
    icon: "truck",
    iconLib: "material",
    color: "#F59E0B",
    avgSpeedKmh: 20,
  },
  concrete_mixer: {
    type: "concrete_mixer",
    label: "Xe bê tông",
    icon: "truck-delivery",
    iconLib: "material",
    color: "#EF4444",
    avgSpeedKmh: 15,
  },
  crane: {
    type: "crane",
    label: "Xe cẩu",
    icon: "crane",
    iconLib: "material",
    color: "#F97316",
    avgSpeedKmh: 12,
  },
  van: {
    type: "van",
    label: "Xe van",
    icon: "van-utility",
    iconLib: "material",
    color: "#6366F1",
    avgSpeedKmh: 25,
  },
};

// ============================================================================
// Route checkpoint mock
// ============================================================================
interface RouteCheckpoint {
  location: LatLng;
  streetName: string;
  distanceFromStart: number; // km
  instruction?: string;
}

function generateRouteCheckpoints(
  from: LatLng,
  to: LatLng,
  count: number = 8,
): RouteCheckpoint[] {
  const streets = [
    "Nguyễn Văn Linh",
    "Trần Hưng Đạo",
    "Lê Lợi",
    "Nguyễn Huệ",
    "Phạm Ngũ Lão",
    "Hai Bà Trưng",
    "Lý Tự Trọng",
    "Điện Biên Phủ",
    "Võ Văn Tần",
    "Nguyễn Thị Minh Khai",
  ];
  const instructions = [
    "Đi thẳng",
    "Rẽ phải",
    "Rẽ trái",
    "Đi theo đường chính",
    "Qua ngã tư",
    "Vòng xuyến",
    "Đi thẳng",
    "Đến nơi bên phải",
  ];
  const totalDist = haversineDistance(from, to);
  const checkpoints: RouteCheckpoint[] = [];
  for (let i = 0; i <= count; i++) {
    const frac = i / count;
    checkpoints.push({
      location: interpolateLatLng(from, to, frac),
      streetName: streets[i % streets.length],
      distanceFromStart: totalDist * frac,
      instruction: instructions[i % instructions.length],
    });
  }
  return checkpoints;
}

// ============================================================================
// Screen
// ============================================================================

export default function WorkerRouteTrackingScreen() {
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
    vehicleType: string;
    vehiclePlate: string;
    vehicleLabel: string;
  }>();

  // Real-time GPS for user location
  const {
    location: gpsLocation,
    address: gpsAddress,
    loading: gpsLoading,
  } = useUserLocation({ watch: true, highAccuracy: true });
  const gpsRef = useRef<LatLng | null>(null);

  // State
  const [trackingStatus, setTrackingStatus] =
    useState<TrackingStatus>("accepted");
  const [workerPosition, setWorkerPosition] = useState<LatLng | null>(null);
  const [eta, setEta] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [routeCheckpoints, setRouteCheckpoints] = useState<RouteCheckpoint[]>(
    [],
  );
  const [currentCheckpointIdx, setCurrentCheckpointIdx] = useState(0);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [movementProgress, setMovementProgress] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const panelAnim = useRef(new Animated.Value(0)).current;
  const speedIndicatorAnim = useRef(new Animated.Value(0)).current;
  const movementRef = useRef<ReturnType<
    typeof createMockWorkerMovement
  > | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPosRef = useRef<LatLng | null>(null);

  // Keep GPS ref in sync for use inside intervals
  useEffect(() => {
    gpsRef.current = gpsLocation;
  }, [gpsLocation]);

  // Parse params
  const customerLocation: LatLng = useMemo(
    () => ({
      latitude: parseFloat(params.customerLat || "10.7769"),
      longitude: parseFloat(params.customerLng || "106.7009"),
    }),
    [params.customerLat, params.customerLng],
  );

  const workerStartLocation: LatLng = useMemo(
    () => ({
      latitude: parseFloat(params.workerLat || "10.7850"),
      longitude: parseFloat(params.workerLng || "106.7150"),
    }),
    [params.workerLat, params.workerLng],
  );

  // Live customer location (real GPS with fallback to params)
  const liveCustomerLocation: LatLng = useMemo(
    () => gpsLocation || customerLocation,
    [gpsLocation, customerLocation],
  );

  const vehicleType = (params.vehicleType as VehicleType) || "motorbike";
  const vehicleConfig = VEHICLE_MAP[vehicleType] || VEHICLE_MAP.motorbike;
  const vehiclePlate = params.vehiclePlate || "59A-123.45";
  const totalPrice = parseInt(params.totalPrice || "0", 10);
  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // ============================================================================
  // Initialize route & movement
  // ============================================================================
  useEffect(() => {
    // Build detailed route
    const totalSteps = 60;
    const points: LatLng[] = [];
    for (let i = 0; i <= totalSteps; i++) {
      // Add slight curve/variation for realism
      const frac = i / totalSteps;
      const base = interpolateLatLng(
        workerStartLocation,
        customerLocation,
        frac,
      );
      const wobble = Math.sin(frac * Math.PI) * 0.001; // slight curve
      points.push({
        latitude: base.latitude + wobble * Math.cos(frac * 4),
        longitude: base.longitude + wobble * Math.sin(frac * 4),
      });
    }
    setRoutePoints(points);

    // Generate checkpoints
    const checkpoints = generateRouteCheckpoints(
      workerStartLocation,
      customerLocation,
    );
    setRouteCheckpoints(checkpoints);

    // Start worker movement
    movementRef.current = createMockWorkerMovement(
      workerStartLocation,
      customerLocation,
      totalSteps,
    );

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
    setEta(Math.ceil((initialDist / vehicleConfig.avgSpeedKmh) * 60));

    // Movement updates every 1.5s for smoother animation
    timerRef.current = setInterval(() => {
      if (!movementRef.current) return;
      const update = movementRef.current();
      const pos: LatLng = {
        latitude: update.latitude,
        longitude: update.longitude,
      };
      setWorkerPosition(pos);

      // Calculate heading from previous position
      if (prevPosRef.current) {
        const headingDeg = bearing(prevPosRef.current, pos);
        setCurrentHeading(headingDeg);
        const dist = haversineDistance(prevPosRef.current, pos);
        setCurrentSpeed(Math.round(((dist * 1000) / 1.5) * 3.6)); // km/h approx
      }
      prevPosRef.current = pos;

      const dist = haversineDistance(pos, gpsRef.current || customerLocation);
      const totalDist = haversineDistance(
        workerStartLocation,
        customerLocation,
      );
      setDistanceRemaining(dist);
      setEta(Math.max(0, Math.ceil((dist / vehicleConfig.avgSpeedKmh) * 60)));
      setMovementProgress(
        Math.min(100, Math.round((1 - dist / totalDist) * 100)),
      );

      // Update checkpoint
      const cpIdx = checkpoints.findIndex(
        (cp) => haversineDistance(pos, cp.location) < 0.1,
      );
      if (cpIdx >= 0 && cpIdx > 0) {
        setCurrentCheckpointIdx(cpIdx);
      }

      // Speed animation
      Animated.timing(speedIndicatorAnim, {
        toValue: Math.min(1, dist > 0.05 ? 1 : 0),
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-advance status
      if (dist < 0.5 && dist > 0.05) {
        setTrackingStatus((prev) => (prev === "accepted" ? "arriving" : prev));
      }
      if (dist < 0.05) {
        setTrackingStatus("arrived");
        if (timerRef.current) clearInterval(timerRef.current);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }, 1500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workerStartLocation, customerLocation, vehicleConfig.avgSpeedKmh]);

  // ============================================================================
  // Pulse animation for ETA badge
  // ============================================================================
  useEffect(() => {
    if (trackingStatus === "arriving") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
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
  // Panel toggle animation
  // ============================================================================
  const toggleDetailPanel = useCallback(() => {
    const toValue = showDetailPanel ? 0 : 1;
    Animated.spring(panelAnim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setShowDetailPanel(!showDetailPanel);
  }, [showDetailPanel, panelAnim]);

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

  const handleShareLocation = useCallback(async () => {
    try {
      await Share.share({
        message: `📍 Theo dõi lộ trình giao hàng\n\nThợ: ${params.workerName}\nMã đơn: #${params.bookingId}\nETA: ~${formatTravelTime(eta)}\nTrạng thái: ${trackingStatus === "arriving" ? "Đang trên đường" : "Đang đến"}\n\nXem trực tiếp trên ứng dụng`,
        title: "Chia sẻ lộ trình",
      });
    } catch {
      // User cancelled
    }
  }, [params.workerName, params.bookingId, eta, trackingStatus]);

  const handleEmergency = useCallback(() => {
    Alert.alert("🚨 Hỗ trợ khẩn cấp", "Bạn cần hỗ trợ gì?", [
      { text: "Gọi hỗ trợ", onPress: () => Linking.openURL("tel:1900xxxx") },
      {
        text: "Báo cáo sự cố",
        onPress: () => router.push("/customer-support" as any),
      },
      { text: "Đóng", style: "cancel" },
    ]);
  }, []);

  const handleCancel = useCallback(() => {
    Alert.alert("Huỷ theo dõi", "Bạn có chắc muốn huỷ đặt thợ/giao hàng?", [
      { text: "Không", style: "cancel" },
      {
        text: "Xác nhận huỷ",
        style: "destructive",
        onPress: () => {
          setTrackingStatus("cancelled");
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => router.back(), 1500);
        },
      },
    ]);
  }, []);

  const currentStepIndex = getStatusIndex(trackingStatus);

  // Compass direction from heading
  const headingLabel = useMemo(() => {
    const dirs = ["B", "ĐB", "Đ", "ĐN", "N", "TN", "T", "TB"];
    return dirs[Math.round(currentHeading / 45) % 8];
  }, [currentHeading]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ─── TOP HEADER ─── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Theo dõi lộ trình</Text>
          <View style={s.headerSubRow}>
            <View
              style={[
                s.vehicleBadge,
                { backgroundColor: vehicleConfig.color + "20" },
              ]}
            >
              {vehicleConfig.iconLib === "material" ? (
                <MaterialCommunityIcons
                  name={vehicleConfig.icon as any}
                  size={12}
                  color={vehicleConfig.color}
                />
              ) : (
                <Ionicons
                  name={vehicleConfig.icon as any}
                  size={12}
                  color={vehicleConfig.color}
                />
              )}
              <Text
                style={[s.vehicleBadgeText, { color: vehicleConfig.color }]}
              >
                {vehicleConfig.label}
              </Text>
            </View>
            <Text style={s.bookingCode}>#{params.bookingId || "---"}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.shareBtn} onPress={handleShareLocation}>
          <Ionicons name="share-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      {/* ─── GPS Status ─── */}
      {(gpsLoading || gpsAddress) && (
        <View style={s.gpsBar}>
          <Ionicons
            name={gpsLoading ? "navigate-circle-outline" : "navigate-circle"}
            size={14}
            color={gpsLoading ? "#999" : "#10B981"}
          />
          <Text style={s.gpsBarText} numberOfLines={1}>
            {gpsLoading ? "Đang lấy vị trí GPS..." : gpsAddress}
          </Text>
          {!gpsLoading && (
            <View style={s.gpsLiveBadge}>
              <Text style={s.gpsLiveText}>LIVE</Text>
            </View>
          )}
        </View>
      )}

      {/* ─── MAP SECTION ─── */}
      <View style={s.mapContainer}>
        <WorkerMapView
          userLocation={liveCustomerLocation}
          workers={[]}
          workerMovingLocation={workerPosition}
          routePoints={routePoints.length > 0 ? routePoints : undefined}
          height={SCREEN_HEIGHT * 0.48}
          showUserMarker
          interactive
          originLabel="Điểm lấy hàng"
          destinationLabel="Giao hàng"
          vehicleIcon={vehicleConfig.icon}
          vehicleColor={vehicleConfig.color}
        />

        {/* Live ETA Badge (top-left) */}
        {eta > 0 &&
          trackingStatus !== "arrived" &&
          trackingStatus !== "completed" && (
            <Animated.View
              style={[
                s.etaFloating,
                {
                  transform: [
                    { scale: trackingStatus === "arriving" ? pulseAnim : 1 },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.75)"]}
                style={s.etaFloatingInner}
              >
                <Ionicons name="time-outline" size={16} color="#4ADE80" />
                <Text style={s.etaFloatingTime}>{formatTravelTime(eta)}</Text>
                <View style={s.etaFloatingSep} />
                <Text style={s.etaFloatingDist}>
                  {formatDistance(distanceRemaining)}
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

        {/* Arrived Badge */}
        {trackingStatus === "arrived" && (
          <View style={s.arrivedFloating}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={s.arrivedFloatingText}>Đã đến nơi!</Text>
          </View>
        )}

        {/* Speed + direction badge (top-right) */}
        {currentSpeed > 0 && trackingStatus !== "arrived" && (
          <View style={s.speedBadge}>
            <Text style={s.speedValue}>{currentSpeed}</Text>
            <Text style={s.speedUnit}>km/h</Text>
            <View style={s.speedDirRow}>
              <Ionicons name="compass-outline" size={10} color="#0D9488" />
              <Text style={s.speedDir}>{headingLabel}</Text>
            </View>
          </View>
        )}

        {/* Progress bar overlay (bottom of map) */}
        <View style={s.progressOverlay}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${movementProgress}%` }]} />
          </View>
          <Text style={s.progressText}>{movementProgress}% lộ trình</Text>
        </View>
      </View>

      {/* ─── BOTTOM INFO SHEET ─── */}
      <ScrollView
        style={[s.bottomSheet, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.sheetHandle} />

        {/* ─── Current Street / Direction ─── */}
        {routeCheckpoints.length > 0 && trackingStatus !== "arrived" && (
          <View style={s.directionCard}>
            <View style={s.directionIconBox}>
              <Ionicons
                name={
                  currentCheckpointIdx < routeCheckpoints.length - 1
                    ? "navigate"
                    : "flag"
                }
                size={20}
                color="#fff"
              />
            </View>
            <View style={s.directionInfo}>
              <Text style={s.directionStreet}>
                {routeCheckpoints[
                  Math.min(
                    currentCheckpointIdx + 1,
                    routeCheckpoints.length - 1,
                  )
                ]?.streetName || ""}
              </Text>
              <Text style={s.directionInstruction}>
                {routeCheckpoints[
                  Math.min(
                    currentCheckpointIdx + 1,
                    routeCheckpoints.length - 1,
                  )
                ]?.instruction || "Đi thẳng"}
              </Text>
            </View>
            <View style={s.directionDistBox}>
              <Text style={s.directionDist}>
                {formatDistance(distanceRemaining)}
              </Text>
            </View>
          </View>
        )}

        {/* ─── Status Timeline ─── */}
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
                    size={12}
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

        {/* ─── Driver / Worker Info Card ─── */}
        <View style={s.driverCard}>
          <View style={s.driverTopRow}>
            <Image
              source={{
                uri:
                  params.workerAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(params.workerName || "T")}&background=0D9488&color=fff`,
              }}
              style={s.driverAvatar}
            />
            <View style={s.driverInfo}>
              <Text style={s.driverName}>{params.workerName || "Tài xế"}</Text>
              <View style={s.driverVehicleRow}>
                {vehicleConfig.iconLib === "material" ? (
                  <MaterialCommunityIcons
                    name={vehicleConfig.icon as any}
                    size={14}
                    color={vehicleConfig.color}
                  />
                ) : (
                  <Ionicons
                    name={vehicleConfig.icon as any}
                    size={14}
                    color={vehicleConfig.color}
                  />
                )}
                <Text style={s.driverVehicleText}>{vehicleConfig.label}</Text>
                <View style={s.plateBadge}>
                  <Text style={s.plateText}>{vehiclePlate}</Text>
                </View>
              </View>
              {eta > 0 && trackingStatus !== "arrived" && (
                <Text style={s.driverETA}>
                  ~{formatTravelTime(eta)} • {formatDistance(distanceRemaining)}
                </Text>
              )}
              {trackingStatus === "arrived" && (
                <Text style={s.driverArrived}>✅ Đã đến nơi!</Text>
              )}
            </View>
          </View>

          {/* Action buttons */}
          <View style={s.driverActions}>
            <TouchableOpacity style={s.driverActionBtn} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={18} color={C.primary} />
              <Text style={s.driverActionLabel}>Nhắn tin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.driverActionBtn, s.callActionBtn]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={[s.driverActionLabel, { color: "#fff" }]}>
                Gọi điện
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.driverActionBtn}
              onPress={handleShareLocation}
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={C.primary}
              />
              <Text style={s.driverActionLabel}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Route details (expandable) ─── */}
        <TouchableOpacity
          style={s.routeToggle}
          onPress={toggleDetailPanel}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={18} color={C.primary} />
          <Text style={s.routeToggleText}>
            Chi tiết lộ trình ({routeCheckpoints.length} điểm)
          </Text>
          <Ionicons
            name={showDetailPanel ? "chevron-up" : "chevron-down"}
            size={18}
            color="#999"
          />
        </TouchableOpacity>

        {showDetailPanel && (
          <View style={s.routeDetailPanel}>
            {routeCheckpoints.map((cp, idx) => {
              const isPassed = idx <= currentCheckpointIdx;
              const isCurrent = idx === currentCheckpointIdx + 1;
              return (
                <View key={idx} style={s.routeStep}>
                  <View style={s.routeStepDotCol}>
                    <View
                      style={[
                        s.routeStepDot,
                        isPassed && s.routeStepDotPassed,
                        isCurrent && s.routeStepDotCurrent,
                        idx === 0 && s.routeStepDotStart,
                        idx === routeCheckpoints.length - 1 &&
                          s.routeStepDotEnd,
                      ]}
                    >
                      {idx === 0 && (
                        <Ionicons name="location" size={10} color="#fff" />
                      )}
                      {idx === routeCheckpoints.length - 1 && (
                        <Ionicons name="flag" size={10} color="#fff" />
                      )}
                    </View>
                    {idx < routeCheckpoints.length - 1 && (
                      <View
                        style={[
                          s.routeStepLine,
                          isPassed && s.routeStepLinePassed,
                        ]}
                      />
                    )}
                  </View>
                  <View style={s.routeStepInfo}>
                    <Text
                      style={[
                        s.routeStepStreet,
                        isPassed && s.routeStepStreetPassed,
                      ]}
                    >
                      {cp.streetName}
                    </Text>
                    <Text style={s.routeStepInstruction}>{cp.instruction}</Text>
                    <Text style={s.routeStepDist}>
                      {formatDistance(cp.distanceFromStart)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ─── Delivery / Service Info ─── */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.infoIconBox}>
              <Ionicons name="location" size={16} color={C.success} />
            </View>
            <View style={s.infoTextCol}>
              <Text style={s.infoLabel}>Điểm đến</Text>
              <Text style={s.infoValue}>
                {gpsAddress || params.customerAddress || "Địa chỉ khách hàng"}
              </Text>
            </View>
          </View>
          {params.category && (
            <View
              style={[
                s.infoRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: "#F0F0F0",
                  paddingTop: 10,
                },
              ]}
            >
              <View style={s.infoIconBox}>
                <Ionicons name="construct" size={16} color={C.warning} />
              </View>
              <View style={s.infoTextCol}>
                <Text style={s.infoLabel}>Dịch vụ</Text>
                <Text style={s.infoValue}>{params.category}</Text>
              </View>
            </View>
          )}
          {totalPrice > 0 && (
            <View
              style={[
                s.infoRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: "#F0F0F0",
                  paddingTop: 10,
                },
              ]}
            >
              <View style={s.infoIconBox}>
                <Ionicons name="wallet-outline" size={16} color={C.orange} />
              </View>
              <View style={s.infoTextCol}>
                <Text style={s.infoLabel}>Tổng dự kiến</Text>
                <Text
                  style={[s.infoValue, { color: C.orange, fontWeight: "800" }]}
                >
                  {formatPrice(totalPrice)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ─── Bottom actions ─── */}
        <View style={s.bottomActions}>
          <TouchableOpacity style={s.emergencyBtn} onPress={handleEmergency}>
            <Ionicons name="warning-outline" size={18} color={C.error} />
            <Text style={s.emergencyBtnText}>Hỗ trợ khẩn cấp</Text>
          </TouchableOpacity>

          {(trackingStatus === "accepted" || trackingStatus === "arriving") && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
              <Text style={s.cancelBtnText}>Huỷ đơn</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  vehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  vehicleBadgeText: { fontSize: 10, fontWeight: "600" },
  bookingCode: { fontSize: 11, color: C.textMuted },
  shareBtn: { padding: 6 },

  // Map
  mapContainer: { position: "relative" },

  // ETA floating badge
  etaFloating: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  etaFloatingInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  etaFloatingTime: { fontSize: 15, fontWeight: "800", color: "#4ADE80" },
  etaFloatingSep: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  etaFloatingDist: { fontSize: 12, color: "rgba(255,255,255,0.8)" },

  // Arrived floating
  arrivedFloating: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  arrivedFloatingText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Speed badge
  speedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  speedValue: { fontSize: 18, fontWeight: "800", color: C.text },
  speedUnit: { fontSize: 9, color: C.textMuted, fontWeight: "600" },
  speedDirRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  speedDir: { fontSize: 9, color: C.primary, fontWeight: "700" },

  // Progress overlay
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 2,
  },
  progressText: { fontSize: 11, fontWeight: "600", color: C.primary },

  // Bottom sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -12,
    paddingHorizontal: 16,
    paddingTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 10,
  },

  // Direction card
  directionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  directionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  directionInfo: { flex: 1 },
  directionStreet: { fontSize: 14, fontWeight: "700", color: C.text },
  directionInstruction: { fontSize: 12, color: C.textSec, marginTop: 1 },
  directionDistBox: { paddingHorizontal: 8 },
  directionDist: { fontSize: 13, fontWeight: "700", color: C.primary },

  // Timeline
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  timelineItem: { alignItems: "center", flex: 1, position: "relative" },
  timelineCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  timelineCircleActive: { backgroundColor: C.primary },
  timelineCircleCurrent: {
    backgroundColor: C.primaryDark,
    borderWidth: 2,
    borderColor: "#B2DFDB",
  },
  timelineLabel: {
    fontSize: 8,
    color: "#ccc",
    fontWeight: "500",
    textAlign: "center",
  },
  timelineLabelActive: { color: C.primary },
  timelineLabelCurrent: { color: C.primaryDark, fontWeight: "700" },
  timelineLine: {
    position: "absolute",
    top: 13,
    right: -28,
    width: 20,
    height: 2,
    backgroundColor: "#E0E0E0",
  },
  timelineLineActive: { backgroundColor: C.primary },

  // Driver card
  driverCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  driverTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: "700", color: C.text },
  driverVehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  driverVehicleText: { fontSize: 12, color: C.textSec },
  plateBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  plateText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.5,
  },
  driverETA: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  driverArrived: {
    fontSize: 13,
    color: C.success,
    fontWeight: "700",
    marginTop: 2,
  },
  driverActions: {
    flexDirection: "row",
    gap: 8,
  },
  driverActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    gap: 6,
  },
  callActionBtn: { backgroundColor: C.success },
  driverActionLabel: { fontSize: 12, fontWeight: "600", color: C.primary },

  // Route toggle / detail
  routeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFB",
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  routeToggleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.primary,
  },
  routeDetailPanel: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  routeStep: { flexDirection: "row", marginBottom: 0 },
  routeStepDotCol: { alignItems: "center", width: 24 },
  routeStepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  routeStepDotPassed: { backgroundColor: C.primary },
  routeStepDotCurrent: {
    backgroundColor: C.orange,
    borderWidth: 2,
    borderColor: "#FFE0B2",
  },
  routeStepDotStart: { backgroundColor: C.blue },
  routeStepDotEnd: { backgroundColor: C.success },
  routeStepLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E0E0E0",
    minHeight: 20,
  },
  routeStepLinePassed: { backgroundColor: C.primary },
  routeStepInfo: { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  routeStepStreet: { fontSize: 13, fontWeight: "600", color: C.text },
  routeStepStreetPassed: { color: C.textMuted },
  routeStepInstruction: { fontSize: 11, color: C.textSec, marginTop: 1 },
  routeStepDist: { fontSize: 10, color: C.textMuted, marginTop: 2 },

  // Info card
  infoCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextCol: { flex: 1 },
  infoLabel: { fontSize: 11, color: C.textMuted },
  infoValue: { fontSize: 13, fontWeight: "600", color: C.text, marginTop: 1 },

  // Bottom actions
  bottomActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  emergencyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    gap: 6,
  },
  emergencyBtnText: { fontSize: 13, fontWeight: "600", color: C.error },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  cancelBtnText: { fontSize: 13, fontWeight: "600", color: C.error },

  // GPS bar
  gpsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#F0FFF4",
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2E9",
    gap: 6,
  },
  gpsBarText: {
    flex: 1,
    fontSize: 12,
    color: "#333",
  },
  gpsLiveBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gpsLiveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
});
