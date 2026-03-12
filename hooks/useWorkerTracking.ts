/**
 * useWorkerTracking Hook
 * Real-time worker position tracking for active bookings
 * Connects to WebSocket for live updates, with polling fallback
 */

import {
    getBookingTracking,
    getWorkerLiveLocation,
    type BookingTrackingInfo,
    type TrackingStatus,
    type WorkerLocationUpdate,
} from "@/services/worker-location.service";
import { haversineDistance, type LatLng } from "@/utils/geo";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWorkerTrackingOptions {
  /** Polling interval in ms (fallback when WS unavailable). Default 5000 */
  pollInterval?: number;
  /** Auto-start tracking? Default true */
  autoStart?: boolean;
}

interface UseWorkerTrackingResult {
  /** Worker's current position */
  workerPosition: LatLng | null;
  /** Current tracking status */
  status: TrackingStatus;
  /** ETA in minutes */
  eta: number;
  /** Distance remaining in km */
  distanceRemaining: number;
  /** Worker heading (degrees) */
  heading: number;
  /** Worker speed (km/h) */
  speed: number;
  /** Route polyline points */
  routePoints: LatLng[];
  /** Full tracking info from API */
  trackingInfo: BookingTrackingInfo | null;
  /** Is currently connected/tracking */
  isTracking: boolean;
  /** Start tracking */
  startTracking: () => void;
  /** Stop tracking */
  stopTracking: () => void;
  /** Update status manually */
  setStatus: (status: TrackingStatus) => void;
}

export function useWorkerTracking(
  bookingId: string | undefined,
  workerId: string | undefined,
  customerLocation: LatLng | null,
  options: UseWorkerTrackingOptions = {},
): UseWorkerTrackingResult {
  const { pollInterval = 5000, autoStart = true } = options;

  const [workerPosition, setWorkerPosition] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<TrackingStatus>("searching");
  const [eta, setEta] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);
  const [trackingInfo, setTrackingInfo] = useState<BookingTrackingInfo | null>(
    null,
  );
  const [isTracking, setIsTracking] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ============================================================================
  // Process location update
  // ============================================================================

  const processLocationUpdate = useCallback(
    (update: WorkerLocationUpdate) => {
      const pos: LatLng = {
        latitude: update.latitude,
        longitude: update.longitude,
      };
      setWorkerPosition(pos);
      setHeading(update.heading || 0);
      setSpeed(update.speed || 0);

      if (customerLocation) {
        const dist = haversineDistance(pos, customerLocation);
        setDistanceRemaining(dist);
        setEta(
          Math.max(0, Math.ceil((dist / Math.max(update.speed || 25, 5)) * 60)),
        );

        // Auto-detect status based on distance
        if (dist < 0.05) {
          setStatus((prev) => {
            if (prev === "accepted" || prev === "arriving") return "arrived";
            return prev;
          });
        } else if (dist < 0.5) {
          setStatus((prev) => {
            if (prev === "accepted") return "arriving";
            return prev;
          });
        }
      }
    },
    [customerLocation],
  );

  // ============================================================================
  // Polling fallback
  // ============================================================================

  const pollWorkerLocation = useCallback(async () => {
    if (!workerId) return;

    try {
      // Try worker location endpoint
      const locUpdate = await getWorkerLiveLocation(workerId);
      if (locUpdate) {
        processLocationUpdate(locUpdate);
        return;
      }

      // Try booking tracking endpoint
      if (bookingId) {
        const info = await getBookingTracking(bookingId);
        if (info) {
          setTrackingInfo(info);
          setWorkerPosition(info.workerLocation);
          setStatus(info.status);
          setEta(info.estimatedArrival);
          setDistanceRemaining(info.distanceRemaining);
          if (info.routePoints) setRoutePoints(info.routePoints);
        }
      }
    } catch {
      // Silently fail — will retry next interval
    }
  }, [workerId, bookingId, processLocationUpdate]);

  // ============================================================================
  // Start/Stop
  // ============================================================================

  const startTracking = useCallback(() => {
    if (isTracking) return;
    setIsTracking(true);

    // Start polling
    pollWorkerLocation();
    pollRef.current = setInterval(pollWorkerLocation, pollInterval);
  }, [isTracking, pollWorkerLocation, pollInterval]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // ============================================================================
  // Auto-start
  // ============================================================================

  useEffect(() => {
    if (autoStart && workerId && customerLocation) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [autoStart, workerId, customerLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop tracking when completed or cancelled
  useEffect(() => {
    if (status === "completed" || status === "cancelled") {
      stopTracking();
    }
  }, [status, stopTracking]);

  return {
    workerPosition,
    status,
    eta,
    distanceRemaining,
    heading,
    speed,
    routePoints,
    trackingInfo,
    isTracking,
    startTracking,
    stopTracking,
    setStatus,
  };
}
