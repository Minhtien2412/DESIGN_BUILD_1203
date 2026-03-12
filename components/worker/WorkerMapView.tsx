/**
 * WorkerMapView Component
 * Grab-style map showing workers as markers with distance/ETA
 * Uses react-native-maps with web-safe fallback
 */

import type { WorkerWithLocation } from "@/services/worker-location.service";
import {
    fitToCoordinates,
    formatDistance,
    formatTravelTime,
    haversineDistance,
    type LatLng,
} from "@/utils/geo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef } from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// Props
// ============================================================================

interface WorkerMapViewProps {
  /** User's current location */
  userLocation: LatLng;
  /** Nearby workers to show as markers */
  workers: WorkerWithLocation[];
  /** Currently selected worker */
  selectedWorker?: WorkerWithLocation | null;
  /** Callback when a worker marker is tapped */
  onWorkerSelect?: (worker: WorkerWithLocation) => void;
  /** Map height */
  height?: number;
  /** Show radius circle */
  showRadius?: boolean;
  /** Radius in km */
  radiusKm?: number;
  /** Route polyline points (for tracking) */
  routePoints?: LatLng[];
  /** Worker moving location (for tracking) */
  workerMovingLocation?: LatLng | null;
  /** Show user location marker */
  showUserMarker?: boolean;
  /** Interactive map */
  interactive?: boolean;
  /** Label for origin/start marker */
  originLabel?: string;
  /** Label for destination marker */
  destinationLabel?: string;
  /** Vehicle icon name (MaterialCommunityIcons) */
  vehicleIcon?: string;
  /** Vehicle marker color */
  vehicleColor?: string;
}

// ============================================================================
// Component
// ============================================================================

export function WorkerMapView({
  userLocation,
  workers,
  selectedWorker,
  onWorkerSelect,
  height = SCREEN_HEIGHT * 0.45,
  showRadius = false,
  radiusKm = 10,
  routePoints,
  workerMovingLocation,
  showUserMarker = true,
  interactive = true,
  originLabel = "Điểm đi",
  destinationLabel = "Điểm đến",
  vehicleIcon = "motorbike",
  vehicleColor = "#4CAF50",
}: WorkerMapViewProps) {
  const mapRef = useRef<any>(null);

  // Calculate map region to show all markers
  const region = useMemo(() => {
    const points: LatLng[] = [userLocation];

    if (workerMovingLocation) {
      points.push(workerMovingLocation);
    } else if (selectedWorker) {
      points.push({
        latitude: selectedWorker.latitude,
        longitude: selectedWorker.longitude,
      });
    } else {
      // Show nearest 5 workers
      workers.slice(0, 5).forEach((w) => {
        points.push({ latitude: w.latitude, longitude: w.longitude });
      });
    }

    return fitToCoordinates(points, 0.4);
  }, [userLocation, workers, selectedWorker, workerMovingLocation]);

  const handleWorkerPress = useCallback(
    (worker: WorkerWithLocation) => {
      onWorkerSelect?.(worker);
    },
    [onWorkerSelect],
  );

  // Detect tracking mode
  const isTrackingMode =
    !!workerMovingLocation && !!routePoints && routePoints.length > 1;

  // ============================================================================
  // WEB TRACKING RENDERER (Shopee-style real-time tracking)
  // ============================================================================
  if (Platform.OS === "web" && isTrackingMode) {
    const allPts = [...routePoints!, userLocation, workerMovingLocation!];
    const minLat = Math.min(...allPts.map((p) => p.latitude));
    const maxLat = Math.max(...allPts.map((p) => p.latitude));
    const minLng = Math.min(...allPts.map((p) => p.longitude));
    const maxLng = Math.max(...allPts.map((p) => p.longitude));
    const latRange = Math.max(maxLat - minLat, 0.005);
    const lngRange = Math.max(maxLng - minLng, 0.005);
    const PAD = 12;
    const toPos = (pt: LatLng) => ({
      top: PAD + (1 - (pt.latitude - minLat) / latRange) * (100 - PAD * 2),
      left: PAD + ((pt.longitude - minLng) / lngRange) * (100 - PAD * 2),
    });

    const originPt = routePoints![0];
    const destPt = userLocation;
    const workerPos = toPos(workerMovingLocation!);
    const originPos = toPos(originPt);
    const destPos = toPos(destPt);
    const distKm = haversineDistance(workerMovingLocation!, destPt);

    return (
      <View style={[s.mapContainer, { height }]}>
        <View style={s.trackingWebBg}>
          {/* Street grid */}
          <View style={s.webGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={`th${i}`}
                style={[
                  s.webGridLine,
                  { top: `${(i + 1) * 8}%`, width: "100%", height: 1 },
                ]}
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={`tv${i}`}
                style={[
                  s.webGridLine,
                  { left: `${(i + 1) * 8}%`, height: "100%", width: 1 },
                ]}
              />
            ))}
          </View>

          {/* Route path (dotted line) */}
          {routePoints!
            .filter((_, i) => i % 2 === 0)
            .map((pt, idx) => {
              const pos = toPos(pt);
              return (
                <View
                  key={`rd${idx}`}
                  style={{
                    position: "absolute",
                    top: `${pos.top}%`,
                    left: `${pos.left}%`,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#FF6B00",
                    opacity: 0.5,
                    transform: [{ translateX: -3 }, { translateY: -3 }],
                  }}
                />
              );
            })}

          {/* Origin marker */}
          <View
            style={{
              position: "absolute",
              top: `${originPos.top}%`,
              left: `${originPos.left}%`,
              alignItems: "center",
              transform: [{ translateX: -18 }, { translateY: -42 }],
              zIndex: 20,
            }}
          >
            <View style={s.originPin}>
              <Ionicons name="location" size={16} color="#fff" />
            </View>
            <View style={s.originPinLabel}>
              <Text style={s.pinLabelText}>{originLabel}</Text>
            </View>
          </View>

          {/* Destination marker */}
          <View
            style={{
              position: "absolute",
              top: `${destPos.top}%`,
              left: `${destPos.left}%`,
              alignItems: "center",
              transform: [{ translateX: -18 }, { translateY: -42 }],
              zIndex: 20,
            }}
          >
            <View style={s.destPin}>
              <Ionicons name="flag" size={16} color="#fff" />
            </View>
            <View style={s.destPinLabel}>
              <Text style={s.pinLabelText}>{destinationLabel}</Text>
            </View>
          </View>

          {/* Vehicle marker */}
          <View
            style={{
              position: "absolute",
              top: `${workerPos.top}%`,
              left: `${workerPos.left}%`,
              transform: [{ translateX: -22 }, { translateY: -22 }],
              zIndex: 30,
            }}
          >
            <View style={[s.vehicleWebPin, { backgroundColor: vehicleColor }]}>
              <MaterialCommunityIcons
                name={vehicleIcon as any}
                size={24}
                color="#fff"
              />
            </View>
          </View>

          {/* Distance info */}
          <View style={s.trackingDistBadge}>
            <Ionicons name="navigate" size={14} color="#0D9488" />
            <Text style={s.trackingDistText}>Còn {formatDistance(distKm)}</Text>
          </View>
        </View>
      </View>
    );
  }

  // ============================================================================
  // WEB FALLBACK RENDERER (static map view)
  // ============================================================================
  if (Platform.OS === "web") {
    return (
      <View style={[s.mapContainer, { height }]}>
        <View style={s.webMapFallback}>
          {/* Grid background */}
          <View style={s.webGrid}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={`h${i}`}
                style={[
                  s.webGridLine,
                  { top: `${(i + 1) * 5}%`, width: "100%", height: 1 },
                ]}
              />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={`v${i}`}
                style={[
                  s.webGridLine,
                  { left: `${(i + 1) * 5}%`, height: "100%", width: 1 },
                ]}
              />
            ))}
          </View>

          {/* User marker (center) */}
          {showUserMarker && (
            <View style={[s.webMarker, s.webUserMarker]}>
              <View style={s.userDotOuter}>
                <View style={s.userDotInner} />
              </View>
              <Text style={s.webMarkerLabel}>Bạn</Text>
            </View>
          )}

          {/* Worker markers (spread around center) */}
          {workers.slice(0, 8).map((worker, idx) => {
            const isSelected = selectedWorker?.id === worker.id;
            // Position relative to center using angle
            const angle = (idx / Math.min(workers.length, 8)) * 2 * Math.PI;
            const radius = 25 + (idx % 3) * 10;
            const left = 50 + radius * Math.cos(angle);
            const top = 50 + radius * Math.sin(angle);

            return (
              <TouchableOpacity
                key={worker.id}
                style={[
                  s.webWorkerMarker,
                  {
                    left: `${Math.max(10, Math.min(90, left))}%`,
                    top: `${Math.max(10, Math.min(90, top))}%`,
                  },
                  isSelected && s.webWorkerMarkerSelected,
                ]}
                onPress={() => handleWorkerPress(worker)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="account-hard-hat"
                  size={isSelected ? 22 : 18}
                  color={isSelected ? "#fff" : "#FF6B00"}
                />
                {isSelected && (
                  <Text style={s.webWorkerName} numberOfLines={1}>
                    {worker.name.split(" ").pop()}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Info overlay */}
          <View style={s.webMapInfo}>
            <Ionicons name="location" size={14} color="#FF6B00" />
            <Text style={s.webMapInfoText}>{workers.length} thợ gần bạn</Text>
          </View>
        </View>
      </View>
    );
  }

  // ============================================================================
  // NATIVE MAP RENDERER (react-native-maps)
  // ============================================================================
  // Import dynamically so web build doesn't break
  let MapView: any;
  let Marker: any;
  let Circle: any;
  let Polyline: any;
  try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    Circle = maps.Circle;
    Polyline = maps.Polyline;
  } catch {
    // Maps not available — use same web fallback
    return (
      <View style={[s.mapContainer, { height }]}>
        <View style={s.webMapFallback}>
          <Text style={s.fallbackText}>Bản đồ chỉ khả dụng trên thiết bị</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.mapContainer, { height }]}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={region}
        region={region}
        showsUserLocation={showUserMarker}
        showsMyLocationButton={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* User location marker */}
        {showUserMarker && (
          <Marker
            coordinate={userLocation}
            title="Vị trí của bạn"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={s.userMarkerNative}>
              <View style={s.userDotOuter}>
                <View style={s.userDotInner} />
              </View>
            </View>
          </Marker>
        )}

        {/* Worker markers */}
        {workers.map((worker) => {
          const isSelected = selectedWorker?.id === worker.id;
          return (
            <Marker
              key={worker.id}
              coordinate={{
                latitude: worker.latitude,
                longitude: worker.longitude,
              }}
              title={worker.name}
              description={`${formatDistance(worker.distance || 0)} • ${formatTravelTime(worker.estimatedArrival || 0)}`}
              onPress={() => handleWorkerPress(worker)}
            >
              <View
                style={[
                  s.workerMarkerNative,
                  isSelected && s.workerMarkerSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-hard-hat"
                  size={isSelected ? 24 : 20}
                  color="#fff"
                />
                {isSelected && (
                  <View style={s.workerCallout}>
                    <Text style={s.workerCalloutName} numberOfLines={1}>
                      {worker.name}
                    </Text>
                    <Text style={s.workerCalloutDist}>
                      {formatDistance(worker.distance || 0)}
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          );
        })}

        {/* Moving worker (tracking) */}
        {workerMovingLocation && (
          <Marker coordinate={workerMovingLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View
              style={[s.movingWorkerMarker, { backgroundColor: vehicleColor }]}
            >
              <MaterialCommunityIcons
                name={vehicleIcon as any}
                size={28}
                color="#fff"
              />
            </View>
          </Marker>
        )}

        {/* Route polyline */}
        {routePoints && routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints}
            strokeColor="#FF6B00"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {/* Origin / Destination labels for tracking */}
        {isTrackingMode && routePoints && routePoints.length > 1 && (
          <>
            <Marker coordinate={routePoints[0]} anchor={{ x: 0.5, y: 1 }}>
              <View style={s.nativeOriginPin}>
                <Ionicons name="location" size={14} color="#fff" />
                <Text style={s.nativePinText}>{originLabel}</Text>
              </View>
            </Marker>
            <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 1 }}>
              <View style={s.nativeDestPin}>
                <Ionicons name="flag" size={14} color="#fff" />
                <Text style={s.nativePinText}>{destinationLabel}</Text>
              </View>
            </Marker>
          </>
        )}

        {/* Search radius circle */}
        {showRadius && (
          <Circle
            center={userLocation}
            radius={radiusKm * 1000}
            strokeColor="rgba(255, 107, 0, 0.3)"
            fillColor="rgba(255, 107, 0, 0.05)"
            strokeWidth={1}
          />
        )}
      </MapView>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const s = StyleSheet.create({
  mapContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E8F4E8",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Web fallback
  webMapFallback: {
    flex: 1,
    backgroundColor: "#E8F0E8",
    position: "relative",
    overflow: "hidden",
  },
  webGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  webGridLine: {
    position: "absolute",
    backgroundColor: "rgba(180,200,180,0.4)",
  },
  webMarker: {
    position: "absolute",
    alignItems: "center",
  },
  webUserMarker: {
    left: "48%",
    top: "46%",
    zIndex: 10,
  },
  webMarkerLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1976D2",
    marginTop: 2,
  },
  webWorkerMarker: {
    position: "absolute",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    backgroundColor: "#FFF3E0",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF6B00",
    zIndex: 5,
  },
  webWorkerMarkerSelected: {
    backgroundColor: "#FF6B00",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "#E65100",
    zIndex: 8,
  },
  webWorkerName: {
    position: "absolute",
    bottom: -14,
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#FF6B00",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  webMapInfo: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  webMapInfoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  fallbackText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 14,
  },

  // Native markers
  userMarkerNative: {
    alignItems: "center",
    justifyContent: "center",
  },
  userDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(33, 150, 243, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1976D2",
    borderWidth: 2,
    borderColor: "#fff",
  },
  workerMarkerNative: {
    backgroundColor: "#FF6B00",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  workerMarkerSelected: {
    backgroundColor: "#E65100",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
  },
  workerCallout: {
    position: "absolute",
    top: -30,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: "row",
    gap: 4,
    minWidth: 80,
  },
  workerCalloutName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
    maxWidth: 60,
  },
  workerCalloutDist: {
    fontSize: 10,
    color: "#FF6B00",
    fontWeight: "600",
  },
  movingWorkerMarker: {
    backgroundColor: "#4CAF50",
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  // Tracking web styles
  trackingWebBg: {
    flex: 1,
    backgroundColor: "#D4EDDA",
    position: "relative",
    overflow: "hidden",
  },
  originPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
  },
  originPinLabel: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  destPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
  },
  destPinLabel: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  pinLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  vehicleWebPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 8,
  },
  trackingDistBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    elevation: 3,
  },
  trackingDistText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D9488",
  },
  // Native tracking markers
  nativeOriginPin: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
  },
  nativeDestPin: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 5,
  },
  nativePinText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
});

export default WorkerMapView;
