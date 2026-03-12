/**
 * Vehicle Tracking Screen - Theo dõi phương tiện chuyên dụng
 * Specialized tracking for construction vehicles: concrete mixers, cranes, trucks
 *
 * Shopee-style with Google Maps lộ trình visualization
 * Focused on heavy vehicles with additional info:
 * - Vehicle weight/capacity
 * - Load status (đã chở / trống)
 * - Route restrictions (cầu, đường cấm)
 * - Real-time speed + traffic info
 * - Multiple stops support (e.g., concrete mixer → batch plant → site)
 */

import WorkerMapView from "@/components/worker/WorkerMapView";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
    createMockWorkerMovement,
    type TrackingStatus,
} from "@/services/worker-location.service";
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
};

// ============================================================================
// Vehicle type configurations
// ============================================================================
type VehicleType =
  | "concrete_mixer"
  | "crane"
  | "truck"
  | "van"
  | "motorbike"
  | "car";

interface VehicleSpec {
  type: VehicleType;
  label: string;
  icon: string;
  color: string;
  capacity: string;
  weightLimit: string;
  avgSpeed: number;
  fuelType: string;
}

const VEHICLE_SPECS: Record<string, VehicleSpec> = {
  concrete_mixer: {
    type: "concrete_mixer",
    label: "Xe bê tông",
    icon: "truck-delivery",
    color: "#EF4444",
    capacity: "6-8 m³",
    weightLimit: "25 tấn",
    avgSpeed: 15,
    fuelType: "Diesel",
  },
  crane: {
    type: "crane",
    label: "Xe cẩu",
    icon: "crane",
    color: "#F97316",
    capacity: "10-25 tấn",
    weightLimit: "30 tấn",
    avgSpeed: 12,
    fuelType: "Diesel",
  },
  truck: {
    type: "truck",
    label: "Xe tải",
    icon: "truck",
    color: "#F59E0B",
    capacity: "5-15 tấn",
    weightLimit: "20 tấn",
    avgSpeed: 20,
    fuelType: "Diesel",
  },
  van: {
    type: "van",
    label: "Xe van",
    icon: "van-utility",
    color: "#6366F1",
    capacity: "1-2 tấn",
    weightLimit: "3.5 tấn",
    avgSpeed: 25,
    fuelType: "Xăng",
  },
  motorbike: {
    type: "motorbike",
    label: "Xe máy",
    icon: "motorbike",
    color: "#3B82F6",
    capacity: "50 kg",
    weightLimit: "150 kg",
    avgSpeed: 25,
    fuelType: "Xăng",
  },
  car: {
    type: "car",
    label: "Ô tô",
    icon: "car",
    color: "#8B5CF6",
    capacity: "500 kg",
    weightLimit: "2 tấn",
    avgSpeed: 30,
    fuelType: "Xăng",
  },
};

// ============================================================================
// Route stops
// ============================================================================
interface RouteStop {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  type: "origin" | "stop" | "destination";
  status: "completed" | "current" | "upcoming";
  arrivalTime?: string;
  note?: string;
}

// ============================================================================
// Screen
// ============================================================================
export default function VehicleTrackingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId: string;
    driverName: string;
    driverAvatar: string;
    driverPhone: string;
    vehicleType: string;
    vehiclePlate: string;
    driverLat: string;
    driverLng: string;
    destLat: string;
    destLng: string;
    destAddress: string;
    category: string;
    totalPrice: string;
    loadStatus: string; // "loaded" | "empty"
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
  const [vehiclePosition, setVehiclePosition] = useState<LatLng | null>(null);
  const [eta, setEta] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedStopIdx, setSelectedStopIdx] = useState(1); // current stop

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
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
  const destLocation: LatLng = useMemo(
    () => ({
      latitude: parseFloat(params.destLat || "10.7769"),
      longitude: parseFloat(params.destLng || "106.7009"),
    }),
    [params.destLat, params.destLng],
  );

  const driverStart: LatLng = useMemo(
    () => ({
      latitude: parseFloat(params.driverLat || "10.790"),
      longitude: parseFloat(params.driverLng || "106.720"),
    }),
    [params.driverLat, params.driverLng],
  );

  // Live destination location (real GPS with fallback to params)
  const liveDestLocation: LatLng = useMemo(
    () => gpsLocation || destLocation,
    [gpsLocation, destLocation],
  );

  const vType = (params.vehicleType as VehicleType) || "concrete_mixer";
  const vSpec = VEHICLE_SPECS[vType] || VEHICLE_SPECS.concrete_mixer;
  const vehiclePlate = params.vehiclePlate || "51D-789.01";
  const loadStatus = params.loadStatus || "loaded";
  const totalPrice = parseInt(params.totalPrice || "0", 10);
  const formatPrice = (p: number) => p.toLocaleString("vi-VN") + "đ";

  // Route stops (mock multi-stop for concrete mixer / crane)
  const routeStops: RouteStop[] = useMemo(() => {
    const midpoint: LatLng = interpolateLatLng(driverStart, destLocation, 0.45);
    return [
      {
        id: "1",
        name:
          vType === "concrete_mixer" ? "Trạm trộn bê tông" : "Điểm xuất phát",
        address: "KCN Tân Bình, TP.HCM",
        location: driverStart,
        type: "origin" as const,
        status: "completed" as const,
        arrivalTime: "14:00",
      },
      {
        id: "2",
        name:
          vType === "concrete_mixer" ? "Trạm kiểm tra" : "Điểm trung chuyển",
        address: "Ngã tư Hàng Xanh, Q. Bình Thạnh",
        location: midpoint,
        type: "stop" as const,
        status: "current" as const,
        arrivalTime: "14:25",
        note:
          vType === "concrete_mixer"
            ? "Kiểm tra nhiệt độ bê tông"
            : "Chuyển tải",
      },
      {
        id: "3",
        name: "Công trình đích",
        address: params.destAddress || "123 Nguyễn Huệ, Q.1, TP.HCM",
        location: destLocation,
        type: "destination" as const,
        status: "upcoming" as const,
        note:
          vType === "concrete_mixer" ? "Đổ bê tông sàn tầng 3" : "Giao hàng",
      },
    ];
  }, [driverStart, destLocation, vType, params.destAddress]);

  // ============================================================================
  // Movement simulation
  // ============================================================================
  useEffect(() => {
    const totalSteps = 50;
    const points: LatLng[] = [];
    for (let i = 0; i <= totalSteps; i++) {
      const frac = i / totalSteps;
      const base = interpolateLatLng(driverStart, destLocation, frac);
      const wobble = Math.sin(frac * Math.PI) * 0.0008;
      points.push({
        latitude: base.latitude + wobble,
        longitude: base.longitude + wobble * Math.cos(frac * 3),
      });
    }
    setRoutePoints(points);

    movementRef.current = createMockWorkerMovement(
      driverStart,
      destLocation,
      totalSteps,
    );
    const initial = movementRef.current();
    setVehiclePosition({
      latitude: initial.latitude,
      longitude: initial.longitude,
    });

    const initialDist = haversineDistance(driverStart, destLocation);
    setDistanceRemaining(initialDist);
    setEta(Math.ceil((initialDist / vSpec.avgSpeed) * 60));

    timerRef.current = setInterval(() => {
      if (!movementRef.current) return;
      const update = movementRef.current();
      const pos: LatLng = {
        latitude: update.latitude,
        longitude: update.longitude,
      };
      setVehiclePosition(pos);

      if (prevPosRef.current) {
        const headingDeg = bearing(prevPosRef.current, pos);
        setCurrentHeading(headingDeg);
        const d = haversineDistance(prevPosRef.current, pos);
        setCurrentSpeed(Math.round(((d * 1000) / 2) * 3.6));
      }
      prevPosRef.current = pos;

      const dist = haversineDistance(pos, gpsRef.current || destLocation);
      const totalDist = haversineDistance(driverStart, destLocation);
      setDistanceRemaining(dist);
      setEta(Math.max(0, Math.ceil((dist / vSpec.avgSpeed) * 60)));
      setProgress(Math.min(100, Math.round((1 - dist / totalDist) * 100)));

      if (dist < 0.5)
        setTrackingStatus((prev) => (prev === "accepted" ? "arriving" : prev));
      if (dist < 0.05) {
        setTrackingStatus("arrived");
        if (timerRef.current) clearInterval(timerRef.current);
        if (Platform.OS !== "web")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [driverStart, destLocation, vSpec.avgSpeed]);

  // Pulse for arriving
  useEffect(() => {
    if (trackingStatus === "arriving") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
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
  // Handlers
  // ============================================================================
  const handleCall = useCallback(() => {
    if (params.driverPhone) Linking.openURL(`tel:${params.driverPhone}`);
  }, [params.driverPhone]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `🚛 Theo dõi ${vSpec.label}\n\nTài xế: ${params.driverName}\nBiển số: ${vehiclePlate}\nMã đơn: #${params.bookingId}\nETA: ~${formatTravelTime(eta)}\nTrạng thái: ${loadStatus === "loaded" ? "Đã chở hàng" : "Xe trống"}\n\nXem trực tiếp trên ứng dụng`,
      });
    } catch {
      /* cancelled */
    }
  }, [
    params.driverName,
    params.bookingId,
    eta,
    vehiclePlate,
    vSpec.label,
    loadStatus,
  ]);

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

      {/* ─── HEADER ─── */}
      <View style={[s.header, { borderBottomColor: vSpec.color + "30" }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerTitleRow}>
            <MaterialCommunityIcons
              name={vSpec.icon as any}
              size={20}
              color={vSpec.color}
            />
            <Text style={s.headerTitle}>Theo dõi {vSpec.label}</Text>
          </View>
          <View style={s.headerSubRow}>
            <View
              style={[
                s.loadBadge,
                {
                  backgroundColor:
                    loadStatus === "loaded"
                      ? C.success + "20"
                      : C.warning + "20",
                },
              ]}
            >
              <Ionicons
                name={loadStatus === "loaded" ? "cube" : "cube-outline"}
                size={10}
                color={loadStatus === "loaded" ? C.success : C.warning}
              />
              <Text
                style={[
                  s.loadBadgeText,
                  { color: loadStatus === "loaded" ? C.success : C.warning },
                ]}
              >
                {loadStatus === "loaded" ? "Đã chở hàng" : "Xe trống"}
              </Text>
            </View>
            <Text style={s.bookingCode}>#{params.bookingId || "---"}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
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

      {/* ─── MAP ─── */}
      <View style={s.mapSection}>
        <WorkerMapView
          userLocation={liveDestLocation}
          workers={[]}
          workerMovingLocation={vehiclePosition}
          routePoints={routePoints.length > 0 ? routePoints : undefined}
          height={SCREEN_HEIGHT * 0.38}
          showUserMarker
          interactive
          originLabel={
            vType === "concrete_mixer" ? "Trạm trộn" : "Điểm xuất phát"
          }
          destinationLabel="Công trình"
          vehicleIcon={vSpec.icon}
          vehicleColor={vSpec.color}
        />

        {/* ETA + Speed overlay (top-left) */}
        {eta > 0 && trackingStatus !== "arrived" && (
          <Animated.View
            style={[
              s.mapOverlayLeft,
              {
                transform: [
                  { scale: trackingStatus === "arriving" ? pulseAnim : 1 },
                ],
              },
            ]}
          >
            <View style={s.mapEtaBox}>
              <Ionicons name="time-outline" size={14} color="#4ADE80" />
              <Text style={s.mapEtaText}>{formatTravelTime(eta)}</Text>
            </View>
            <View style={s.mapDistBox}>
              <Text style={s.mapDistText}>
                {formatDistance(distanceRemaining)}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Vehicle speed (top-right) */}
        {currentSpeed > 0 && trackingStatus !== "arrived" && (
          <View
            style={[s.mapOverlayRight, { borderColor: vSpec.color + "40" }]}
          >
            <MaterialCommunityIcons
              name={vSpec.icon as any}
              size={16}
              color={vSpec.color}
            />
            <Text style={s.speedValue}>{currentSpeed}</Text>
            <Text style={s.speedUnit}>km/h</Text>
          </View>
        )}

        {/* Arrived state */}
        {trackingStatus === "arrived" && (
          <View style={s.arrivedOverlay}>
            <Ionicons name="checkmark-circle" size={28} color="#fff" />
            <Text style={s.arrivedText}>{vSpec.label} đã đến!</Text>
          </View>
        )}

        {/* Progress bar */}
        <View style={s.progressBar}>
          <View style={s.progressTrack}>
            <LinearGradient
              colors={[vSpec.color, vSpec.color + "80"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={[s.progressPct, { color: vSpec.color }]}>
            {progress}%
          </Text>
        </View>
      </View>

      {/* ─── BOTTOM DETAIL ─── */}
      <ScrollView style={s.detailSheet} showsVerticalScrollIndicator={false}>
        <View style={s.sheetHandle} />

        {/* ─── Vehicle spec card ─── */}
        <View style={[s.specCard, { borderLeftColor: vSpec.color }]}>
          <View style={s.specRow}>
            <View style={s.specItem}>
              <MaterialCommunityIcons
                name="weight"
                size={16}
                color={C.textSec}
              />
              <Text style={s.specLabel}>Tải trọng</Text>
              <Text style={s.specValue}>{vSpec.weightLimit}</Text>
            </View>
            <View style={s.specItem}>
              <MaterialCommunityIcons
                name="package-variant"
                size={16}
                color={C.textSec}
              />
              <Text style={s.specLabel}>Dung tích</Text>
              <Text style={s.specValue}>{vSpec.capacity}</Text>
            </View>
            <View style={s.specItem}>
              <MaterialCommunityIcons
                name="speedometer"
                size={16}
                color={C.textSec}
              />
              <Text style={s.specLabel}>Tốc độ TB</Text>
              <Text style={s.specValue}>{vSpec.avgSpeed} km/h</Text>
            </View>
            <View style={s.specItem}>
              <MaterialCommunityIcons
                name="gas-station"
                size={16}
                color={C.textSec}
              />
              <Text style={s.specLabel}>Nhiên liệu</Text>
              <Text style={s.specValue}>{vSpec.fuelType}</Text>
            </View>
          </View>
        </View>

        {/* ─── Route Stops ─── */}
        <View style={s.stopsCard}>
          <Text style={s.stopsTitle}>
            Lộ trình ({routeStops.length} điểm dừng)
          </Text>
          {routeStops.map((stop, idx) => (
            <View key={stop.id} style={s.stopRow}>
              <View style={s.stopDotCol}>
                <View
                  style={[
                    s.stopDot,
                    stop.status === "completed" && s.stopDotCompleted,
                    stop.status === "current" && [
                      s.stopDotCurrent,
                      { borderColor: vSpec.color },
                    ],
                    stop.type === "origin" && { backgroundColor: C.blue },
                    stop.type === "destination" && {
                      backgroundColor: C.success,
                    },
                  ]}
                >
                  {stop.type === "origin" && (
                    <MaterialCommunityIcons
                      name="factory"
                      size={10}
                      color="#fff"
                    />
                  )}
                  {stop.type === "destination" && (
                    <Ionicons name="flag" size={10} color="#fff" />
                  )}
                  {stop.type === "stop" && stop.status === "current" && (
                    <MaterialCommunityIcons
                      name={vSpec.icon as any}
                      size={10}
                      color={vSpec.color}
                    />
                  )}
                </View>
                {idx < routeStops.length - 1 && (
                  <View
                    style={[
                      s.stopLine,
                      stop.status === "completed" && s.stopLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={s.stopInfo}>
                <Text
                  style={[
                    s.stopName,
                    stop.status === "completed" && s.stopNameCompleted,
                  ]}
                >
                  {stop.name}
                </Text>
                <Text style={s.stopAddress}>{stop.address}</Text>
                {stop.arrivalTime && (
                  <Text style={s.stopTime}>
                    {stop.status === "completed" ? "Đã qua" : "Dự kiến"}:{" "}
                    {stop.arrivalTime}
                  </Text>
                )}
                {stop.note && (
                  <View style={s.stopNoteBox}>
                    <Ionicons
                      name="information-circle-outline"
                      size={12}
                      color={C.warning}
                    />
                    <Text style={s.stopNoteText}>{stop.note}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ─── Driver card ─── */}
        <View style={s.driverCard}>
          <View style={s.driverRow}>
            <Image
              source={{
                uri:
                  params.driverAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(params.driverName || "TX")}&background=0D9488&color=fff`,
              }}
              style={s.driverAvatar}
            />
            <View style={s.driverInfo}>
              <Text style={s.driverName}>{params.driverName || "Tài xế"}</Text>
              <View style={s.driverPlateRow}>
                <MaterialCommunityIcons
                  name={vSpec.icon as any}
                  size={14}
                  color={vSpec.color}
                />
                <Text style={s.driverPlate}>{vehiclePlate}</Text>
              </View>
            </View>
            <View style={s.driverBtns}>
              <TouchableOpacity
                style={s.chatBtn}
                onPress={() =>
                  router.push(`/messages/${params.bookingId}` as any)
                }
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={C.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={s.callBtn} onPress={handleCall}>
                <Ionicons name="call" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── Info summary ─── */}
        {(params.category || totalPrice > 0) && (
          <View style={s.summaryCard}>
            {params.category && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Dịch vụ</Text>
                <Text style={s.summaryValue}>{params.category}</Text>
              </View>
            )}
            {totalPrice > 0 && (
              <View
                style={[
                  s.summaryRow,
                  {
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                    paddingTop: 8,
                  },
                ]}
              >
                <Text style={s.summaryLabel}>Tổng chi phí</Text>
                <Text
                  style={[
                    s.summaryValue,
                    { color: C.orange, fontWeight: "800" },
                  ]}
                >
                  {formatPrice(totalPrice)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── Emergency ─── */}
        <View style={s.bottomActions}>
          <TouchableOpacity
            style={s.emergencyBtn}
            onPress={() =>
              Alert.alert("Hỗ trợ", "Gọi hỗ trợ khẩn cấp?", [
                {
                  text: "Gọi ngay",
                  onPress: () => Linking.openURL("tel:1900xxxx"),
                },
                { text: "Đóng", style: "cancel" },
              ])
            }
          >
            <Ionicons name="warning-outline" size={16} color={C.error} />
            <Text style={s.emergencyText}>Hỗ trợ khẩn cấp</Text>
          </TouchableOpacity>
          {(trackingStatus === "accepted" || trackingStatus === "arriving") && (
            <TouchableOpacity
              style={s.cancelTrackBtn}
              onPress={() =>
                Alert.alert("Huỷ", "Huỷ theo dõi?", [
                  { text: "Không", style: "cancel" },
                  {
                    text: "Huỷ",
                    style: "destructive",
                    onPress: () => {
                      setTrackingStatus("cancelled");
                      if (timerRef.current) clearInterval(timerRef.current);
                      setTimeout(() => router.back(), 1500);
                    },
                  },
                ])
              }
            >
              <Text style={s.cancelTrackText}>Huỷ đơn</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: insets.bottom + 30 }} />
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
    borderBottomWidth: 2,
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerCenter: { flex: 1 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  loadBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  loadBadgeText: { fontSize: 10, fontWeight: "600" },
  bookingCode: { fontSize: 11, color: C.textMuted },
  shareBtn: { padding: 6 },

  // Map
  mapSection: { position: "relative" },
  mapOverlayLeft: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  mapEtaBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  mapEtaText: { fontSize: 14, fontWeight: "800", color: "#4ADE80" },
  mapDistBox: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.2)",
  },
  mapDistText: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  mapOverlayRight: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  speedValue: { fontSize: 16, fontWeight: "800", color: C.text },
  speedUnit: { fontSize: 8, color: C.textMuted, fontWeight: "600" },
  arrivedOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  arrivedText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Progress
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressPct: { fontSize: 12, fontWeight: "700", minWidth: 32 },

  // Detail sheet
  detailSheet: {
    flex: 1,
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 12,
  },

  // Spec card
  specCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  specRow: { flexDirection: "row", justifyContent: "space-between" },
  specItem: { alignItems: "center", flex: 1, gap: 3 },
  specLabel: { fontSize: 10, color: C.textMuted },
  specValue: { fontSize: 12, fontWeight: "700", color: C.text },

  // Stops
  stopsCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  stopsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  stopRow: { flexDirection: "row", marginBottom: 0 },
  stopDotCol: { alignItems: "center", width: 24 },
  stopDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  stopDotCompleted: { backgroundColor: C.primary },
  stopDotCurrent: { backgroundColor: "#fff", borderWidth: 3 },
  stopLine: { width: 2, flex: 1, backgroundColor: "#E0E0E0", minHeight: 24 },
  stopLineCompleted: { backgroundColor: C.primary },
  stopInfo: { flex: 1, paddingLeft: 10, paddingBottom: 14 },
  stopName: { fontSize: 13, fontWeight: "700", color: C.text },
  stopNameCompleted: { color: C.textMuted },
  stopAddress: { fontSize: 11, color: C.textSec, marginTop: 1 },
  stopTime: { fontSize: 10, color: C.primary, fontWeight: "600", marginTop: 3 },
  stopNoteBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 4,
  },
  stopNoteText: { fontSize: 10, color: C.warning, fontWeight: "500" },

  // Driver card
  driverCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  driverRow: { flexDirection: "row", alignItems: "center" },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: "700", color: C.text },
  driverPlateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  driverPlate: { fontSize: 12, fontWeight: "600", color: C.textSec },
  driverBtns: { flexDirection: "row", gap: 8 },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.success,
    alignItems: "center",
    justifyContent: "center",
  },

  // Summary
  summaryCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 13, color: C.textSec },
  summaryValue: { fontSize: 13, fontWeight: "600", color: C.text },

  // Bottom actions
  bottomActions: { flexDirection: "row", gap: 10, marginTop: 4 },
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
  emergencyText: { fontSize: 13, fontWeight: "600", color: C.error },
  cancelTrackBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  cancelTrackText: { fontSize: 13, fontWeight: "600", color: C.error },

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
