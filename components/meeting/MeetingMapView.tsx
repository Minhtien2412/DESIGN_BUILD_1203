import { Coordinates, Meeting, Participant } from "@/types/meeting";
import { fitToCoordinates, type LatLng } from "@/utils/geo";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * MeetingMapView Component
 * Grab-style map with participant tracking for meeting navigation.
 *
 * - Native (iOS/Android): uses react-native-maps with real MapView + Markers
 * - Web: rich fallback with positioned participant markers on a grid
 *
 * Follows the same dynamic-import pattern as WorkerMapView.
 */

interface MeetingMapViewProps {
  meeting: Meeting;
  userLocation?: Coordinates | null;
  focusedParticipant?: Participant | null;
  showAllRoutes?: boolean;
  height?: number;
  onParticipantPress?: (participant: Participant) => void;
}

// Map Coordinates → LatLng helper
const toLatLng = (c: Coordinates): LatLng => ({
  latitude: c.lat,
  longitude: c.lng,
});

const STATUS_COLORS: Record<string, string> = {
  "en-route": "#0D9488",
  arrived: "#10B981",
  late: "#EF4444",
  waiting: "#F59E0B",
};

export function MeetingMapView({
  meeting,
  userLocation,
  focusedParticipant,
  showAllRoutes = true,
  height = 300,
  onParticipantPress,
}: MeetingMapViewProps) {
  const destination: LatLng = useMemo(
    () => toLatLng(meeting.location.coordinates),
    [meeting.location.coordinates],
  );

  const movingParticipants = useMemo(
    () =>
      meeting.participants.filter(
        (p) => p.currentLocation && p.status !== "arrived",
      ),
    [meeting.participants],
  );

  const arrivedCount = meeting.participants.filter(
    (p) => p.status === "arrived",
  ).length;

  // Native map region that fits all markers
  const region = useMemo(() => {
    const pts: LatLng[] = [destination];
    if (userLocation) pts.push(toLatLng(userLocation));
    movingParticipants.forEach((p) => {
      if (p.currentLocation) pts.push(toLatLng(p.currentLocation));
    });
    return fitToCoordinates(pts, 0.4);
  }, [destination, userLocation, movingParticipants]);

  // ===========================================================================
  // WEB FALLBACK RENDERER
  // ===========================================================================
  if (Platform.OS === "web") {
    // Compute % positions for participants on a grid
    const all: LatLng[] = [destination];
    if (userLocation) all.push(toLatLng(userLocation));
    movingParticipants.forEach((p) => {
      if (p.currentLocation) all.push(toLatLng(p.currentLocation));
    });
    const minLat = Math.min(...all.map((p) => p.latitude));
    const maxLat = Math.max(...all.map((p) => p.latitude));
    const minLng = Math.min(...all.map((p) => p.longitude));
    const maxLng = Math.max(...all.map((p) => p.longitude));
    const latR = Math.max(maxLat - minLat, 0.005);
    const lngR = Math.max(maxLng - minLng, 0.005);
    const PAD = 12;
    const toPos = (pt: LatLng) => ({
      top: PAD + (1 - (pt.latitude - minLat) / latR) * (100 - PAD * 2),
      left: PAD + ((pt.longitude - minLng) / lngR) * (100 - PAD * 2),
    });

    const destPos = toPos(destination);

    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.webMap}>
          {/* Grid bg */}
          <View style={StyleSheet.absoluteFill}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={`h${i}`}
                style={[
                  styles.gridLine,
                  { top: `${(i + 1) * 10}%`, width: "100%", height: 1 },
                ]}
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={`v${i}`}
                style={[
                  styles.gridLine,
                  { left: `${(i + 1) * 10}%`, height: "100%", width: 1 },
                ]}
              />
            ))}
          </View>

          {/* Destination marker */}
          <View
            style={[
              styles.absCenter,
              { top: `${destPos.top}%`, left: `${destPos.left}%` },
            ]}
          >
            <View style={styles.destPin}>
              <Ionicons name="flag" size={16} color="#fff" />
            </View>
            <View style={styles.destLabel}>
              <Text style={styles.pinLabelText} numberOfLines={1}>
                {meeting.location.name}
              </Text>
            </View>
          </View>

          {/* Moving participant markers */}
          {movingParticipants.map((p) => {
            if (!p.currentLocation) return null;
            const pos = toPos(toLatLng(p.currentLocation));
            const color = STATUS_COLORS[p.status] || "#0D9488";
            const isFocused =
              !focusedParticipant || focusedParticipant.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.7}
                onPress={() => onParticipantPress?.(p)}
                style={[
                  styles.absCenter,
                  {
                    top: `${pos.top}%`,
                    left: `${pos.left}%`,
                    opacity: isFocused ? 1 : 0.4,
                    zIndex: isFocused ? 20 : 10,
                  },
                ]}
              >
                <View
                  style={[styles.participantPin, { backgroundColor: color }]}
                >
                  <Ionicons name="car" size={16} color="#fff" />
                </View>
                <Text style={styles.participantLabel} numberOfLines={1}>
                  {p.name.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* User location */}
          {userLocation && (
            <View
              style={[
                styles.absCenter,
                {
                  top: `${toPos(toLatLng(userLocation)).top}%`,
                  left: `${toPos(toLatLng(userLocation)).left}%`,
                },
              ]}
            >
              <View style={styles.userDotOuter}>
                <View style={styles.userDotInner} />
              </View>
              <Text style={styles.pinLabelSmall}>Bạn</Text>
            </View>
          )}

          {/* Address overlay */}
          <View style={styles.addressOverlay}>
            <Ionicons name="location" size={14} color="#EF4444" />
            <Text style={styles.addressText} numberOfLines={1}>
              {meeting.location.address}
            </Text>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
              />
              <Text style={styles.legendText}>Điểm hẹn</Text>
            </View>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: "#0D9488" }]}
              />
              <Text style={styles.legendText}>
                Đang đến ({movingParticipants.length})
              </Text>
            </View>
            {arrivedCount > 0 && (
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#10B981" }]}
                />
                <Text style={styles.legendText}>Đã đến ({arrivedCount})</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ===========================================================================
  // NATIVE MAP RENDERER (react-native-maps)
  // ===========================================================================
  let MapView: any;
  let Marker: any;
  let Circle: any;
  try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    Circle = maps.Circle;
  } catch {
    // Fallback if maps not installed
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.webMap}>
          <Text style={styles.fallbackText}>
            Cần cài react-native-maps để hiển thị bản đồ
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        region={region}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* Destination marker */}
        <Marker
          coordinate={destination}
          title={meeting.location.name}
          description={meeting.location.address}
        >
          <View style={styles.destPin}>
            <Ionicons name="flag" size={16} color="#fff" />
          </View>
        </Marker>

        {/* Participant markers */}
        {movingParticipants.map((p) => {
          if (!p.currentLocation) return null;
          const coord = toLatLng(p.currentLocation);
          const color = STATUS_COLORS[p.status] || "#0D9488";
          const isActive =
            !focusedParticipant || focusedParticipant.id === p.id;
          return (
            <Marker
              key={p.id}
              coordinate={coord}
              title={p.name}
              description={p.eta ? `ETA: ${p.eta}` : undefined}
              opacity={isActive ? 1 : 0.4}
              onPress={() => onParticipantPress?.(p)}
            >
              <View style={[styles.participantPin, { backgroundColor: color }]}>
                <Ionicons name="car" size={16} color="#fff" />
              </View>
            </Marker>
          );
        })}

        {/* Accuracy circle around destination */}
        <Circle
          center={destination}
          radius={200}
          fillColor="rgba(239, 68, 68, 0.08)"
          strokeColor="rgba(239, 68, 68, 0.25)"
          strokeWidth={1}
        />
      </MapView>

      {/* Participant count badge */}
      <View style={styles.nativeBadge}>
        <Ionicons name="people" size={14} color="#6366F1" />
        <Text style={styles.nativeBadgeText}>
          {arrivedCount}/{meeting.participants.length} đã đến
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  // Web map
  webMap: { flex: 1, backgroundColor: "#E5E7EB", position: "relative" },
  gridLine: { position: "absolute", backgroundColor: "#D1D5DB" },
  absCenter: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -16 }, { translateY: -20 }],
    zIndex: 10,
  },
  destPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  destLabel: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    maxWidth: 120,
    elevation: 2,
  },
  pinLabelText: { fontSize: 11, fontWeight: "600", color: "#1F2937" },
  pinLabelSmall: {
    fontSize: 10,
    fontWeight: "500",
    color: "#10B981",
    marginTop: 2,
  },
  participantPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  participantLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0D9488",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
    overflow: "hidden",
  },
  userDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(16,185,129,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  addressOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  addressText: { flex: 1, fontSize: 12, color: "#374151", fontWeight: "500" },
  legend: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    gap: 4,
    elevation: 2,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, color: "#6B7280" },
  fallbackText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
    fontSize: 13,
  },
  // Native overlay
  nativeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 3,
  },
  nativeBadgeText: { fontSize: 12, fontWeight: "600", color: "#6366F1" },
});
