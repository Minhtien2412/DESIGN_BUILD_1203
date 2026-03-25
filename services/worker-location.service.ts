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
 * Convert a BOOKING_SERVICES serviceId to a WorkerType string.
 * Used by scan-workers to send the correct workerType filter to the real API.
 */
export function serviceIdToWorkerType(serviceId: string): string | undefined {
  return WORKER_TYPE_MAP[serviceId];
}

/**
 * Get human-readable specialty label for a serviceId.
 */
export function serviceIdToLabel(serviceId: string): string {
  return (SERVICE_META_MAP[serviceId] ?? DEFAULT_SERVICE_META).label;
}

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

// Maps both Vietnamese serviceId (from BOOKING_SERVICES) and legacy English keys
// to a WorkerType string used for filtering and display.
const WORKER_TYPE_MAP: Record<string, string> = {
  // ── Vietnamese service IDs (from types/booking.ts BOOKING_SERVICES) ──
  "sua-may-giat": "THO_DIEN",      // Sửa máy giặt
  "sua-tu-lanh": "THO_DIEN",       // Sửa tủ lạnh
  "thong-tac-cong": "THO_NUOC",    // Thông tắc cống
  "sua-dien": "THO_DIEN",          // Sửa điện
  "cap-nuoc": "THO_NUOC",          // Sửa cấp nước
  "mang-wifi": "THO_DIEN",         // Sửa mạng/wifi
  "sua-may-lanh": "THO_DIEN",      // Sửa máy lạnh
  "tho-xay": "THO_XAY",            // Thợ xây
  "tho-son": "THO_SON",            // Thợ sơn
  "tho-dien-nuoc": "THO_DIEN",     // Thợ điện nước
  "tho-lat-gach": "THO_XAY",       // Thợ lát gạch
  "tho-thach-cao": "THO_XAY",      // Thợ thạch cao
  "kien-truc-su": "THO_XAY",       // Kiến trúc sư
  "noi-that": "THO_MOC",           // Thiết kế nội thất
  // ── Legacy English keys ──
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

// Per-service display metadata used in mock worker profiles
interface ServiceMeta {
  label: string;         // Human-readable specialty shown in profile
  skills: string[];      // Skills tags
  bio: string;           // Short bio sentence
  priceMin: number;      // Min daily rate (VND)
  priceMax: number;      // Max daily rate (VND)
}

const SERVICE_META_MAP: Record<string, ServiceMeta> = {
  "sua-may-giat": {
    label: "Sửa máy giặt",
    skills: ["Sửa máy giặt", "Điện lạnh", "Bảo trì thiết bị"],
    bio: "Chuyên sửa chữa, bảo dưỡng máy giặt các hãng: Samsung, LG, Electrolux...",
    priceMin: 200000, priceMax: 500000,
  },
  "sua-tu-lanh": {
    label: "Sửa tủ lạnh",
    skills: ["Sửa tủ lạnh", "Điện lạnh", "Nạp gas"],
    bio: "Chuyên sửa tủ lạnh, tủ đông, nạp gas, thay linh kiện chính hãng.",
    priceMin: 300000, priceMax: 800000,
  },
  "thong-tac-cong": {
    label: "Thông tắc cống",
    skills: ["Thông tắc cống", "Thợ nước", "Đường ống"],
    bio: "Chuyên thông tắc cống, bồn cầu, đường ống thoát nước nhanh chóng.",
    priceMin: 200000, priceMax: 1000000,
  },
  "sua-dien": {
    label: "Thợ điện",
    skills: ["Sửa điện", "Điện dân dụng", "Lắp đặt"],
    bio: "Chuyên sửa chữa hệ thống điện dân dụng, lắp đặt điện an toàn.",
    priceMin: 150000, priceMax: 500000,
  },
  "cap-nuoc": {
    label: "Thợ nước",
    skills: ["Sửa ống nước", "Van nước", "Bồn nước"],
    bio: "Chuyên sửa ống nước, van, lavabo, bồn nước các loại.",
    priceMin: 200000, priceMax: 600000,
  },
  "mang-wifi": {
    label: "Thợ mạng & wifi",
    skills: ["Cài đặt wifi", "Mạng LAN", "Modem router"],
    bio: "Chuyên cài đặt, sửa chữa mạng wifi, kéo dây mạng, cấu hình router.",
    priceMin: 100000, priceMax: 300000,
  },
  "sua-may-lanh": {
    label: "Sửa máy lạnh",
    skills: ["Sửa máy lạnh", "Vệ sinh máy lạnh", "Nạp gas"],
    bio: "Chuyên vệ sinh, sửa chữa, nạp gas máy lạnh tất cả các hãng.",
    priceMin: 200000, priceMax: 800000,
  },
  "tho-xay": {
    label: "Thợ xây",
    skills: ["Xây tường", "Trát xi măng", "Đổ bê tông"],
    bio: "Thợ xây có kinh nghiệm, nhận xây mới, sửa chữa công trình dân dụng.",
    priceMin: 400000, priceMax: 600000,
  },
  "tho-son": {
    label: "Thợ sơn",
    skills: ["Sơn tường", "Sơn nhà", "Sơn nước"],
    bio: "Chuyên sơn nhà, sơn tường, sơn dầu nội ngoại thất, kỹ thuật cao.",
    priceMin: 300000, priceMax: 500000,
  },
  "tho-dien-nuoc": {
    label: "Thợ điện nước",
    skills: ["Lắp điện nước", "Đi dây điện", "Ống nước"],
    bio: "Thợ điện nước công trình, lắp đặt hệ thống điện và cấp thoát nước.",
    priceMin: 400000, priceMax: 700000,
  },
  "tho-lat-gach": {
    label: "Thợ lát gạch",
    skills: ["Lát gạch nền", "Ốp tường", "Gạch ceramic"],
    bio: "Chuyên lát gạch nền, ốp tường nhà vệ sinh, phòng bếp cẩn thận, đẹp.",
    priceMin: 350000, priceMax: 600000,
  },
  "tho-thach-cao": {
    label: "Thợ thạch cao",
    skills: ["Trần thạch cao", "Vách ngăn", "Khung xương"],
    bio: "Chuyên làm trần thạch cao, vách ngăn thạch cao mọi kiểu dáng.",
    priceMin: 400000, priceMax: 700000,
  },
  "kien-truc-su": {
    label: "Kiến trúc sư",
    skills: ["Thiết kế kiến trúc", "Bản vẽ", "AutoCAD"],
    bio: "Kiến trúc sư có kinh nghiệm thiết kế nhà ở, thương mại, nội thất.",
    priceMin: 500000, priceMax: 1500000,
  },
  "noi-that": {
    label: "Thiết kế nội thất",
    skills: ["Thiết kế nội thất", "3D phối cảnh", "Thi công nội thất"],
    bio: "Chuyên thiết kế & thi công nội thất nhà ở, căn hộ, văn phòng.",
    priceMin: 400000, priceMax: 1200000,
  },
};

const DEFAULT_SERVICE_META: ServiceMeta = {
  label: "Thợ đa năng",
  skills: ["Đa năng", "Chuyên nghiệp", "Đúng giờ"],
  bio: "Thợ chuyên nghiệp, nhiều năm kinh nghiệm, uy tín.",
  priceMin: 300000, priceMax: 700000,
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
  const category = query.category || "";
  const meta = SERVICE_META_MAP[category] ?? DEFAULT_SERVICE_META;
  const workerType = (WORKER_TYPE_MAP[category] || "THO_XAY") as WorkerType;

  return Array.from({ length: count }, (_, i) => {
    const jittered = addJitter(center, radiusKm * 800);
    const dist = haversineDistance(center, jittered);
    const arrival = Math.ceil((dist / 25) * 60);
    const exp = Math.floor(2 + Math.random() * 15);
    const rate =
      Math.floor(
        meta.priceMin / 1000 +
          (Math.random() * (meta.priceMax - meta.priceMin)) / 1000,
      ) * 1000;

    return {
      id: `worker-mock-${category}-${i + 1}`,
      name: MOCK_WORKER_NAMES[i % MOCK_WORKER_NAMES.length],
      phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
      workerType,
      location: `Quận ${Math.floor(1 + Math.random() * 12)}`,
      district: `Quận ${Math.floor(1 + Math.random() * 12)}`,
      latitude: jittered.latitude,
      longitude: jittered.longitude,
      distance: Math.round(dist * 10) / 10,
      estimatedArrival: Math.max(5, arrival),
      experience: exp,
      skills: [...meta.skills, exp >= 5 ? "Nhiều kinh nghiệm" : "Nhiệt tình"],
      hasEquipment: Math.random() > 0.3,
      dailyRate: rate,
      avatar: `https://i.pravatar.cc/150?img=${10 + i}`,
      bio: meta.bio,
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
