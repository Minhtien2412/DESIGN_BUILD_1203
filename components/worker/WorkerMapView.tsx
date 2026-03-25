/**
 * WorkerMapView Component
 * Google Maps native view for nearby worker discovery
 * - User marker with radar pulse
 * - Search radius circle
 * - Worker avatar markers + rating badge
 * - Single tap: select worker and show name
 * - Double tap: open worker profile
 * Uses react-native-maps with Google provider
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
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  /** Callback when a worker marker is tapped once */
  onWorkerSelect?: (worker: WorkerWithLocation) => void;
  /** Callback when a worker marker is double tapped / callout tapped */
  onWorkerOpenProfile?: (worker: WorkerWithLocation) => void;
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
  onWorkerOpenProfile,
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
  const lastTapRef = useRef<{ workerId: string | null; ts: number }>({
    workerId: null,
    ts: 0,
  });

  // Radar pulse animation
  const radarScale1 = useRef(new Animated.Value(0.5)).current;
  const radarOpacity1 = useRef(new Animated.Value(0.28)).current;
  const radarScale2 = useRef(new Animated.Value(0.8)).current;
  const radarOpacity2 = useRef(new Animated.Value(0.18)).current;

  useEffect(() => {
    const startLoop = (
      scale: Animated.Value,
      opacity: Animated.Value,
      delay: number,
    ) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 2.8,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: delay === 0 ? 0.28 : 0.18,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

    const loop1 = startLoop(radarScale1, radarOpacity1, 0);
    const loop2 = startLoop(radarScale2, radarOpacity2, 700);

    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [radarOpacity1, radarOpacity2, radarScale1, radarScale2]);

  const visibleWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const distanceKm =
        typeof worker.distance === "number"
          ? worker.distance
          : haversineDistance(userLocation, {
              latitude: worker.latitude,
              longitude: worker.longitude,
            });

      return distanceKm <= radiusKm;
    });
  }, [workers, userLocation, radiusKm]);

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
      visibleWorkers.slice(0, 8).forEach((w) => {
        points.push({
          latitude: w.latitude,
          longitude: w.longitude,
        });
      });
    }

    return fitToCoordinates(points, 0.4);
  }, [userLocation, visibleWorkers, selectedWorker, workerMovingLocation]);

  const handleWorkerMarkerPress = useCallback(
    (worker: WorkerWithLocation) => {
      const now = Date.now();
      const isDoubleTap =
        lastTapRef.current.workerId === worker.id &&
        now - lastTapRef.current.ts < 320;

      lastTapRef.current = { workerId: worker.id, ts: now };

      if (isDoubleTap) {
        onWorkerOpenProfile?.(worker);
        return;
      }

      onWorkerSelect?.(worker);
    },
    [onWorkerOpenProfile, onWorkerSelect],
  );

  const isTrackingMode =
    !!workerMovingLocation && !!routePoints && routePoints.length > 1;

  // Native-only Google Maps (web handled by WorkerMapView.web.tsx)
  let MapView: any;
  let Marker: any;
  let Circle: any;
  let Polyline: any;
  let Callout: any;
  let PROVIDER_GOOGLE: any;

  try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    Circle = maps.Circle;
    Polyline = maps.Polyline;
    Callout = maps.Callout;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
    console.log( "maps", JSON.stringify(maps, null, 2));
  } catch (error) {
    console.error("[WorkerMapView] react-native-maps load failed:", error);
    return (
      <View style={[s.mapContainer, { height }]}>
        <View style={s.fallbackContainer}>
          <Text style={s.fallbackText}>
            Google Maps chỉ khả dụng trên build native
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.mapContainer, { height }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={s.map}
        initialRegion={region}
        region={region}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton
        showsCompass
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {console.log( "region", JSON.stringify(region, null, 2))}
        {/* User location marker + radar */}
        {showUserMarker && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            zIndex={999}
          >
            <View style={s.userMarkerWrap}>
              <Animated.View
                pointerEvents="none"
                style={[
                  s.radarRing,
                  {
                    opacity: radarOpacity1,
                    transform: [{ scale: radarScale1 }],
                  },
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  s.radarRingSecondary,
                  {
                    opacity: radarOpacity2,
                    transform: [{ scale: radarScale2 }],
                  },
                ]}
              />
              <View style={s.userMarkerNative}>
                <View style={s.userDotOuter}>
                  <View style={s.userDotInner} />
                </View>
              </View>
            </View>
          </Marker>
        )}
        {console.log( "visibleWorkers", JSON.stringify(visibleWorkers, null, 2))}

        {/* Worker markers within radius */}
        {visibleWorkers.map((worker) => {
          const isSelected = selectedWorker?.id === worker.id;
          const distanceKm =
            typeof worker.distance === "number"
              ? worker.distance
              : haversineDistance(userLocation, {
                  latitude: worker.latitude,
                  longitude: worker.longitude,
                });

          return (
            <Marker
              key={worker.id}
              coordinate={{
                latitude: worker.latitude,
                longitude: worker.longitude,
              }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => handleWorkerMarkerPress(worker)}
              tracksViewChanges={false}
            >
              <View style={s.workerMarkerWrap}>
                {isSelected && (
                  <View style={s.workerNameBubble}>
                    <Text style={s.workerNameBubbleText} numberOfLines={1}>
                      {worker.name}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    s.workerAvatarMarker,
                    isSelected && s.workerAvatarMarkerSelected,
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        worker.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          worker.name,
                        )}&background=FF6B00&color=fff`,
                    }}
                    style={s.workerAvatarImage}
                  />

                  <View style={s.workerRatingBadge}>
                    <Ionicons name="star" size={10} color="#FFC107" />
                    <Text style={s.workerRatingText}>
                      {Number(worker.rating || 0).toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>

              {isSelected && (
                <Callout tooltip onPress={() => onWorkerOpenProfile?.(worker)}>
                  <View style={s.calloutCard}>
                    <Text style={s.calloutTitle} numberOfLines={1}>
                      {worker.name}
                    </Text>
                    <Text style={s.calloutSub}>
                      ⭐ {Number(worker.rating || 0).toFixed(1)} •{" "}
                      {formatDistance(distanceKm)}
                    </Text>
                    {!!worker.estimatedArrival && (
                      <Text style={s.calloutSub}>
                        {formatTravelTime(worker.estimatedArrival)}
                      </Text>
                    )}
                    <Text style={s.calloutHint}>Chạm để mở hồ sơ thợ</Text>
                  </View>
                </Callout>
              )}
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

        {/* Search radius */}
        {showRadius && (
          <>
            <Circle
              center={userLocation}
              radius={radiusKm * 1000}
              strokeColor="rgba(25, 118, 210, 0.35)"
              fillColor="rgba(25, 118, 210, 0.08)"
              strokeWidth={2}
            />
            <Circle
              center={userLocation}
              radius={120}
              strokeColor="rgba(25, 118, 210, 0.20)"
              fillColor="rgba(25, 118, 210, 0.12)"
              strokeWidth={1}
            />
          </>
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
  webMapImage: {
    ...StyleSheet.absoluteFillObject,
  },

  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 24,
  },
  fallbackText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  webRadiusRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 220,
    height: 220,
    borderRadius: 999,
    transform: [{ translateX: -110 }, { translateY: -110 }],
    borderWidth: 2,
    borderColor: "rgba(25,118,210,0.35)",
    backgroundColor: "rgba(25,118,210,0.08)",
  },
  webUserMarkerWrap: {
    position: "absolute",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    zIndex: 99,
  },
  webWorkerMarkerWrap: {
    position: "absolute",
    transform: [{ translateX: -27 }, { translateY: -54 }],
    zIndex: 50,
    alignItems: "center",
  },

  userMarkerWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRing: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(25,118,210,0.22)",
  },
  radarRingSecondary: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(25,118,210,0.14)",
  },
  userMarkerNative: {
    alignItems: "center",
    justifyContent: "center",
  },
  userDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(33, 150, 243, 0.22)",
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

  workerMarkerWrap: {
    alignItems: "center",
  },
  workerAvatarMarker: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 6,
  },
  workerAvatarMarkerSelected: {
    transform: [{ scale: 1.08 }],
    borderColor: "#FF6B00",
  },
  workerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
  },
  workerRatingBadge: {
    position: "absolute",
    bottom: -6,
    right: -8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
    gap: 2,
  },
  workerRatingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#333",
  },
  workerNameBubble: {
    marginBottom: 8,
    maxWidth: 140,
    backgroundColor: "#1F2937",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  workerNameBubbleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  calloutCard: {
    minWidth: 160,
    maxWidth: 220,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  calloutSub: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 2,
  },
  calloutHint: {
    marginTop: 4,
    fontSize: 11,
    color: "#FF6B00",
    fontWeight: "600",
  },

  movingWorkerMarker: {
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
