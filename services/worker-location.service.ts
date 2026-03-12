/**
 * Worker Location Service
 * Handles finding nearby workers, tracking worker movement,
 * and location-based booking features (Grab/Vua Thợ-style)
 */

import { get, post } from "@/services/api";
import type { Worker, WorkerStatus, WorkerType } from "@/services/workers.api";
import { addJitter, haversineDistance, type LatLng } from "@/utils/geo";

// ============================================================================
// Types
// ============================================================================

export interface WorkerWithLocation extends Omit<Worker, "location"> {
  location: string;
  latitude: number;
  longitude: number;
  distance?: number; // km from customer
  estimatedArrival?: number; // minutes
}

export interface NearbyWorkerQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number; // default 10
  workerType?: string;
  category?: string;
  limit?: number;
  minRating?: number;
  available?: boolean;
}

export interface WorkerLocationUpdate {
  workerId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number; // km/h
  timestamp: number;
}

export interface BookingTrackingInfo {
  bookingId: string;
  workerId: string;
  workerName: string;
  workerAvatar?: string;
  workerPhone?: string;
  workerLocation: LatLng;
  customerLocation: LatLng;
  status: TrackingStatus;
  estimatedArrival: number; // minutes
  distanceRemaining: number; // km
  routePoints?: LatLng[]; // polyline path
  startedAt: string;
}

export type TrackingStatus =
  | "searching" // Finding worker
  | "accepted" // Worker accepted, heading to customer
  | "arriving" // Worker is near (<500m)
  | "arrived" // Worker at customer location
  | "in_progress" // Working
  | "completed" // Done
  | "cancelled";

// ============================================================================
// Price Range Types (Vua Thợ-style)
// ============================================================================

export interface PriceRange {
  workerType: string;
  workerTypeLabel: string;
  icon: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  workerCount: number;
  priceRangeText: string;
}

export interface WorkProcessStep {
  step: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  tips: string[];
}

export interface WorkProcessGuide {
  title: string;
  subtitle: string;
  steps: WorkProcessStep[];
  priceGuide: {
    title: string;
    description: string;
    factors: Array<{ factor: string; description: string }>;
  };
  guarantees: Array<{ title: string; description: string; icon: string }>;
}

// ============================================================================
// API calls
// ============================================================================

/**
 * Search for nearby workers with location
 */
export async function getNearbyWorkers(
  query: NearbyWorkerQuery,
): Promise<WorkerWithLocation[]> {
  try {
    const res = await get("/workers/nearby", {
      lat: query.latitude,
      lng: query.longitude,
      radius: query.radiusKm || 10,
      workerType: query.workerType,
      available: query.available !== false,
      minRating: query.minRating,
      limit: query.limit || 20,
    });
    if (res?.data && Array.isArray(res.data)) {
      // Map real API response to WorkerWithLocation
      return res.data.map((w: any) => ({
        id: String(w.id),
        name: w.name,
        phone: w.phone,
        workerType: w.workerType as WorkerType,
        location: w.location || w.district || "",
        district: w.district,
        latitude: w.latitude,
        longitude: w.longitude,
        distance: w.distanceKm || 0,
        estimatedArrival: parseArrivalMinutes(w.estimatedArrival),
        experience: w.experience || 0,
        skills: w.skills || [],
        hasEquipment: true,
        dailyRate: w.dailyRate || 0,
        avatar:
          w.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=0D9488&color=fff&size=100`,
        bio: w.bio || "",
        rating: w.rating || 0,
        reviewCount: w.reviewCount || 0,
        completedJobs: w.completedJobs || 0,
        status: w.verified
          ? ("APPROVED" as WorkerStatus)
          : ("PENDING" as WorkerStatus),
        verified: w.verified || false,
        featured: false,
        availability: w.availability || "available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  } catch {
    // API not available yet — return mock data
  }
  return generateMockNearbyWorkers(query);
}

/**
 * Parse estimated arrival string from API to minutes
 */
function parseArrivalMinutes(arrival: string | number | undefined): number {
  if (typeof arrival === "number") return arrival;
  if (!arrival) return 15;
  if (arrival.includes("5 phút") || arrival.includes("< 5")) return 5;
  if (arrival.includes("5-15")) return 10;
  if (arrival.includes("15-30")) return 20;
  if (arrival.includes("30-60")) return 45;
  const match = arrival.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 30;
}

/**
 * Get real-time location of a worker (for tracking)
 */
export async function getWorkerLiveLocation(
  workerId: string,
): Promise<WorkerLocationUpdate | null> {
  try {
    const res = await get(`/workers/${workerId}/location`);
    if (res?.data) return res.data;
  } catch {
    // Mock: simulate worker movement
  }
  return null;
}

/**
 * Request a worker for a service
 */
export async function requestWorkerBooking(data: {
  workerId: string;
  serviceCategory: string;
  customerLatitude: number;
  customerLongitude: number;
  customerAddress: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedPrice?: number;
  notes?: string;
  paymentMethod?: string;
  distanceKm?: number;
}): Promise<{ bookingId: string; status: string }> {
  try {
    const res = await post("/bookings/worker-request", {
      workerId: parseInt(data.workerId, 10),
      serviceCategory: data.serviceCategory,
      customerLatitude: data.customerLatitude,
      customerLongitude: data.customerLongitude,
      customerAddress: data.customerAddress,
      scheduledDate: data.scheduledDate || new Date().toISOString(),
      scheduledTime: data.scheduledTime,
      estimatedPrice: data.estimatedPrice || 0,
      notes: data.notes,
      paymentMethod: data.paymentMethod || "cash",
      distanceKm: data.distanceKm,
    });
    if (res?.data) {
      return {
        bookingId: String(res.data.id),
        status: res.data.status || "PENDING",
      };
    }
  } catch {
    // Fallback mock
  }
  return {
    bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
    status: "searching",
  };
}

/**
 * Update booking tracking status
 */
export async function getBookingTracking(
  bookingId: string,
): Promise<BookingTrackingInfo | null> {
  try {
    const res = await get(`/bookings/worker-request/${bookingId}/tracking`);
    if (res?.data) {
      const d = res.data;
      return {
        bookingId: String(d.bookingId),
        workerId: String(d.worker?.id || ""),
        workerName: d.worker?.name || "",
        workerAvatar: d.worker?.avatar,
        workerPhone: d.worker?.phone,
        workerLocation: {
          latitude: d.worker?.currentLatitude || 0,
          longitude: d.worker?.currentLongitude || 0,
        },
        customerLocation: {
          latitude: d.customer?.latitude || 0,
          longitude: d.customer?.longitude || 0,
        },
        status: (d.status || "searching").toLowerCase() as TrackingStatus,
        estimatedArrival: 15,
        distanceRemaining: 0,
        startedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Mock — return null
  }
  return null;
}

// ============================================================================
// PRICE RANGE & WORK PROCESS APIs (Vua Thợ-style)
// ============================================================================

/**
 * Get price ranges (min/max) per worker type from real data
 */
export async function getPriceRanges(
  workerType?: string,
): Promise<PriceRange[]> {
  try {
    const params: any = {};
    if (workerType) params.workerType = workerType;
    const res = await get("/workers/prices", params);
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }
  } catch {
    // API not available — return fallback
  }
  return FALLBACK_PRICE_RANGES;
}

/**
 * Get work process guide
 */
export async function getWorkProcess(): Promise<WorkProcessGuide | null> {
  try {
    const res = await get("/workers/guide");
    if (res?.data) {
      return res.data;
    }
  } catch {
    // API not available — return null
  }
  return null;
}

/**
 * Fallback price ranges when API is unavailable
 */
const FALLBACK_PRICE_RANGES: PriceRange[] = [
  {
    workerType: "THO_DIEN",
    workerTypeLabel: "Thợ điện",
    icon: "zap",
    minPrice: 300000,
    maxPrice: 800000,
    avgPrice: 500000,
    workerCount: 5,
    priceRangeText: "300k - 800k",
  },
  {
    workerType: "THO_NUOC",
    workerTypeLabel: "Thợ nước",
    icon: "droplet",
    minPrice: 300000,
    maxPrice: 700000,
    avgPrice: 450000,
    workerCount: 4,
    priceRangeText: "300k - 700k",
  },
  {
    workerType: "THO_SON",
    workerTypeLabel: "Thợ sơn",
    icon: "brush",
    minPrice: 350000,
    maxPrice: 750000,
    avgPrice: 500000,
    workerCount: 3,
    priceRangeText: "350k - 750k",
  },
  {
    workerType: "THO_MOC",
    workerTypeLabel: "Thợ mộc",
    icon: "tool",
    minPrice: 400000,
    maxPrice: 900000,
    avgPrice: 600000,
    workerCount: 3,
    priceRangeText: "400k - 900k",
  },
  {
    workerType: "THO_XAY",
    workerTypeLabel: "Thợ xây",
    icon: "building",
    minPrice: 350000,
    maxPrice: 800000,
    avgPrice: 550000,
    workerCount: 4,
    priceRangeText: "350k - 800k",
  },
  {
    workerType: "THO_HAN",
    workerTypeLabel: "Thợ hàn",
    icon: "flame",
    minPrice: 400000,
    maxPrice: 850000,
    avgPrice: 600000,
    workerCount: 3,
    priceRangeText: "400k - 850k",
  },
  {
    workerType: "THO_SAT",
    workerTypeLabel: "Thợ sắt",
    icon: "link",
    minPrice: 350000,
    maxPrice: 800000,
    avgPrice: 550000,
    workerCount: 2,
    priceRangeText: "350k - 800k",
  },
  {
    workerType: "THO_NHOM_KINH",
    workerTypeLabel: "Thợ nhôm kính",
    icon: "maximize",
    minPrice: 400000,
    maxPrice: 900000,
    avgPrice: 600000,
    workerCount: 2,
    priceRangeText: "400k - 900k",
  },
  {
    workerType: "THO_CAMERA",
    workerTypeLabel: "Thợ camera",
    icon: "camera",
    minPrice: 350000,
    maxPrice: 800000,
    avgPrice: 550000,
    workerCount: 2,
    priceRangeText: "350k - 800k",
  },
  {
    workerType: "THO_THACH_CAO",
    workerTypeLabel: "Thợ thạch cao",
    icon: "square",
    minPrice: 350000,
    maxPrice: 750000,
    avgPrice: 500000,
    workerCount: 2,
    priceRangeText: "350k - 750k",
  },
];

// ============================================================================
// MOCK DATA (fallback when API not available)
// ============================================================================

const MOCK_WORKER_NAMES = [
  "Nguyễn Văn An",
  "Trần Minh Tuấn",
  "Lê Thanh Hùng",
  "Phạm Quốc Bảo",
  "Võ Đức Thành",
  "Hoàng Minh Đức",
  "Đặng Văn Phong",
  "Bùi Thanh Tùng",
  "Ngô Quang Hải",
  "Đỗ Anh Khoa",
  "Trương Minh Long",
  "Lý Văn Thắng",
  "Huỳnh Tấn Phát",
  "Mai Đức Trí",
  "Phan Văn Nam",
];

const WORKER_TYPE_MAP: Record<string, string> = {
  "ac-cleaning": "THO_DIEN",
  "ac-repair": "THO_DIEN",
  electrical: "THO_DIEN",
  plumbing: "THO_NUOC",
  painting: "THO_SON",
  cleaning: "THO_XAY",
  locksmith: "THO_MOC",
  appliance: "THO_DIEN",
  carpentry: "THO_MOC",
  welding: "THO_HAN",
};

function generateMockNearbyWorkers(
  query: NearbyWorkerQuery,
): WorkerWithLocation[] {
  const center: LatLng = {
    latitude: query.latitude,
    longitude: query.longitude,
  };
  const count = Math.min(query.limit || 15, 15);
  const radiusKm = query.radiusKm || 10;

  return Array.from({ length: count }, (_, i) => {
    // Spread workers across the radius
    const jittered = addJitter(center, radiusKm * 800);
    const dist = haversineDistance(center, jittered);
    const arrival = Math.ceil((dist / 25) * 60);

    return {
      id: `worker-mock-${i + 1}`,
      name: MOCK_WORKER_NAMES[i % MOCK_WORKER_NAMES.length],
      phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
      workerType: (WORKER_TYPE_MAP[query.category || ""] ||
        "THO_XAY") as WorkerType,
      location: `Quận ${Math.floor(1 + Math.random() * 12)}`,
      district: `Quận ${Math.floor(1 + Math.random() * 12)}`,
      latitude: jittered.latitude,
      longitude: jittered.longitude,
      distance: Math.round(dist * 10) / 10,
      estimatedArrival: Math.max(5, arrival),
      experience: Math.floor(2 + Math.random() * 15),
      skills: ["Chuyên nghiệp", "Đúng giờ"],
      hasEquipment: Math.random() > 0.3,
      dailyRate: Math.floor(300 + Math.random() * 500) * 1000,
      avatar: `https://i.pravatar.cc/150?img=${10 + i}`,
      bio: "Thợ chuyên nghiệp, nhiều năm kinh nghiệm",
      rating: Math.round((4 + Math.random()) * 10) / 10,
      reviewCount: Math.floor(10 + Math.random() * 200),
      completedJobs: Math.floor(50 + Math.random() * 500),
      status: "APPROVED" as WorkerStatus,
      verified: Math.random() > 0.2,
      featured: Math.random() > 0.7,
      availability: "available" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * Simulate worker movement toward customer (for demo/mock tracking)
 * Returns a function that generates next position on each call
 */
export function createMockWorkerMovement(
  workerStart: LatLng,
  customerLocation: LatLng,
  totalSteps: number = 60,
): () => WorkerLocationUpdate {
  let step = 0;
  const workerId = "mock-worker";

  return () => {
    step = Math.min(step + 1, totalSteps);
    const fraction = step / totalSteps;

    // Add slight randomness to path (simulate real roads)
    const jitter = 0.0002 * (Math.random() - 0.5);
    const lat =
      workerStart.latitude +
      (customerLocation.latitude - workerStart.latitude) * fraction +
      jitter;
    const lng =
      workerStart.longitude +
      (customerLocation.longitude - workerStart.longitude) * fraction +
      jitter;

    return {
      workerId,
      latitude: lat,
      longitude: lng,
      heading: 0,
      speed: fraction < 1 ? 20 + Math.random() * 15 : 0,
      timestamp: Date.now(),
    };
  };
}
