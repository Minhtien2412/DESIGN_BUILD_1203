/**
 * Centralized mock / fallback data for the booking module.
 *
 * Screens import from here instead of defining inline constants.
 * These are used exclusively as API-failure fallbacks — real data
 * comes from BookingContext / apiFetch.
 */

import type { BookingService, NearbyWorker } from "@/types/booking";

// ============================================================================
// Booking services  (fallback for GET /services/categories)
// Consumer: app/booking/search-service.tsx
// ============================================================================

export const BOOKING_SERVICES: BookingService[] = [
  // --- Bảo trì ---
  {
    id: "sua-may-giat",
    name: "Sửa máy giặt",
    category: "Bảo trì",
    icon: "water-outline",
    description: "Sửa chữa, bảo trì máy giặt các loại",
    priceRange: "200K - 500K",
    estimatedTime: "1-2 giờ",
  },
  {
    id: "sua-tu-lanh",
    name: "Sửa tủ lạnh",
    category: "Bảo trì",
    icon: "snow-outline",
    description: "Sửa chữa tủ lạnh, tủ đông",
    priceRange: "300K - 800K",
    estimatedTime: "1-3 giờ",
  },
  {
    id: "thong-tac-cong",
    name: "Thông tắc cống",
    category: "Bảo trì",
    icon: "construct-outline",
    description: "Thông tắc cống, đường ống",
    priceRange: "200K - 1M",
    estimatedTime: "1-2 giờ",
  },
  {
    id: "sua-dien",
    name: "Sửa điện",
    category: "Bảo trì",
    icon: "flash-outline",
    description: "Sửa chữa hệ thống điện dân dụng",
    priceRange: "150K - 500K",
    estimatedTime: "30p-2 giờ",
  },
  {
    id: "cap-nuoc",
    name: "Sửa cấp nước",
    category: "Bảo trì",
    icon: "water-outline",
    description: "Sửa ống nước, van, bồn nước",
    priceRange: "200K - 600K",
    estimatedTime: "1-2 giờ",
  },
  {
    id: "mang-wifi",
    name: "Sửa mạng/wifi",
    category: "Bảo trì",
    icon: "wifi-outline",
    description: "Cài đặt, sửa chữa mạng internet",
    priceRange: "100K - 300K",
    estimatedTime: "30p-1 giờ",
  },
  {
    id: "sua-may-lanh",
    name: "Sửa máy lạnh",
    category: "Bảo trì",
    icon: "thermometer-outline",
    description: "Vệ sinh, sửa chữa máy lạnh",
    priceRange: "200K - 800K",
    estimatedTime: "1-2 giờ",
  },
  // --- Xây dựng ---
  {
    id: "tho-xay",
    name: "Thợ xây",
    category: "Xây dựng",
    icon: "home-outline",
    description: "Xây tường, trát xi măng",
    priceRange: "400K - 600K/ngày",
    estimatedTime: "Theo ngày",
  },
  // --- Hoàn thiện ---
  {
    id: "tho-son",
    name: "Thợ sơn",
    category: "Hoàn thiện",
    icon: "color-palette-outline",
    description: "Sơn tường, sơn nhà",
    priceRange: "300K - 500K/ngày",
    estimatedTime: "Theo ngày",
  },
  {
    id: "tho-dien-nuoc",
    name: "Thợ điện nước",
    category: "Xây dựng",
    icon: "flash-outline",
    description: "Lắp đặt điện nước công trình",
    priceRange: "400K - 700K/ngày",
    estimatedTime: "Theo ngày",
  },
  {
    id: "tho-lat-gach",
    name: "Thợ lát gạch",
    category: "Hoàn thiện",
    icon: "grid-outline",
    description: "Lát gạch nền, ốp tường",
    priceRange: "350K - 600K/ngày",
    estimatedTime: "Theo ngày",
  },
  {
    id: "tho-thach-cao",
    name: "Thợ thạch cao",
    category: "Hoàn thiện",
    icon: "layers-outline",
    description: "Trần thạch cao, vách ngăn",
    priceRange: "400K - 700K/ngày",
    estimatedTime: "Theo ngày",
  },
  // --- Thiết kế ---
  {
    id: "kien-truc-su",
    name: "Kiến trúc sư",
    category: "Thiết kế",
    icon: "pencil-outline",
    description: "Thiết kế kiến trúc nhà ở",
    priceRange: "300K/m²",
    estimatedTime: "7-14 ngày",
  },
  {
    id: "noi-that",
    name: "Thiết kế nội thất",
    category: "Thiết kế",
    icon: "bed-outline",
    description: "Thiết kế nội thất toàn bộ",
    priceRange: "200K/m²",
    estimatedTime: "7-14 ngày",
  },
];

// ============================================================================
// Mock worker generator  (fallback for GET /workers)
// Consumer: app/booking/worker-list.tsx
// ============================================================================

const WORKER_NAMES = [
  "Nguyễn Văn An",
  "Trần Minh Đức",
  "Lê Hoàng Nam",
  "Phạm Quốc Huy",
  "Đỗ Thanh Sơn",
  "Võ Minh Tuấn",
  "Bùi Đức Thành",
  "Hoàng Văn Phúc",
  "Ngô Quang Hải",
  "Dương Văn Long",
];

const SPECIALTY_MAP: Record<string, string> = {
  "sua-may-giat": "Sửa máy giặt",
  "sua-tu-lanh": "Sửa tủ lạnh",
  "thong-tac-cong": "Thông tắc cống",
  "sua-dien": "Thợ điện",
  "cap-nuoc": "Thợ nước",
  "mang-wifi": "Thợ mạng",
  "sua-may-lanh": "Sửa máy lạnh",
  "tho-xay": "Thợ xây",
  "tho-son": "Thợ sơn",
  "tho-dien-nuoc": "Thợ điện nước",
  "tho-lat-gach": "Thợ lát gạch",
  "tho-thach-cao": "Thợ thạch cao",
  "kien-truc-su": "Kiến trúc sư",
  "noi-that": "Thiết kế nội thất",
};

export function generateMockWorkers(
  serviceId: string,
  count = 8,
): NearbyWorker[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `w-${serviceId}-${i}`,
    name: WORKER_NAMES[i % WORKER_NAMES.length],
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(WORKER_NAMES[i % WORKER_NAMES.length])}&background=0D9488&color=fff&size=128`,
    specialty: SPECIALTY_MAP[serviceId] || "Thợ đa năng",
    rating: +(4 + Math.random() * 0.9).toFixed(1),
    reviewCount: Math.floor(50 + Math.random() * 200),
    completedJobs: Math.floor(80 + Math.random() * 500),
    distance: (0.5 + Math.random() * 5).toFixed(1) + " km",
    estimatedArrival: Math.floor(10 + Math.random() * 30) + " phút",
    pricePerHour: Math.floor(15 + Math.random() * 35) * 10000,
    verified: Math.random() > 0.3,
    online: Math.random() > 0.2,
    location: {
      latitude: 10.762622 + (Math.random() - 0.5) * 0.05,
      longitude: 106.660172 + (Math.random() - 0.5) * 0.05,
    },
    skills: [SPECIALTY_MAP[serviceId] || "Đa năng", "Kinh nghiệm", "Uy tín"],
    yearsExperience: Math.floor(2 + Math.random() * 15),
  })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

// ============================================================================
// Fallback reviews  (fallback for GET /workers/:id/reviews)
// Consumer: app/booking/worker-detail.tsx
// ============================================================================

export interface FallbackReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  time: string;
}

export const FALLBACK_REVIEWS: FallbackReviewItem[] = [
  {
    id: "r1",
    name: "Anh Minh",
    rating: 5,
    comment: "Thợ làm rất nhanh, sạch sẽ, giá cả hợp lý. Sẽ book lại!",
    time: "2 ngày trước",
  },
  {
    id: "r2",
    name: "Chị Lan",
    rating: 5,
    comment: "Tận tâm, đúng giờ, tay nghề cao. Rất hài lòng!",
    time: "1 tuần trước",
  },
  {
    id: "r3",
    name: "Anh Hùng",
    rating: 4,
    comment: "Làm tốt, đến đúng hẹn. Giá hơi cao hơn dự kiến.",
    time: "2 tuần trước",
  },
];

// ============================================================================
// Mock active trackings  (fallback for BookingContext.activeBookings)
// Consumer: app/service-booking/active-trackings.tsx
// ============================================================================

interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MockActiveTracking {
  id: string;
  bookingId: string;
  workerName: string;
  workerAvatar?: string;
  workerPhone: string;
  vehicleType: string;
  vehiclePlate: string;
  status: string;
  eta: number;
  distanceRemaining: number;
  progress: number;
  category: string;
  totalPrice: number;
  customerAddress: string;
  workerLocation: LatLng;
  customerLocation: LatLng;
  startedAt: string;
}

export const MOCK_TRACKINGS: MockActiveTracking[] = [
  {
    id: "1",
    bookingId: "BK-2026-0301",
    workerName: "Nguyễn Văn An",
    workerAvatar: "",
    workerPhone: "0901234567",
    vehicleType: "motorbike",
    vehiclePlate: "59A-123.45",
    status: "arriving",
    eta: 12,
    distanceRemaining: 2.5,
    progress: 65,
    category: "Thợ điện",
    totalPrice: 350000,
    customerAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
    workerLocation: { latitude: 10.78, longitude: 106.703 },
    customerLocation: { latitude: 10.777, longitude: 106.701 },
    startedAt: "14:30",
  },
  {
    id: "2",
    bookingId: "BK-2026-0302",
    workerName: "Trần Bê Tông",
    workerAvatar: "",
    workerPhone: "0912345678",
    vehicleType: "concrete_mixer",
    vehiclePlate: "51D-789.01",
    status: "accepted",
    eta: 28,
    distanceRemaining: 7.2,
    progress: 30,
    category: "Đổ bê tông sàn",
    totalPrice: 5500000,
    customerAddress: "456 Điện Biên Phủ, Q.3, TP.HCM",
    workerLocation: { latitude: 10.79, longitude: 106.72 },
    customerLocation: { latitude: 10.779, longitude: 106.69 },
    startedAt: "13:45",
  },
  {
    id: "3",
    bookingId: "BK-2026-0303",
    workerName: "Lê Cẩu Đại",
    workerAvatar: "",
    workerPhone: "0923456789",
    vehicleType: "crane",
    vehiclePlate: "51D-456.78",
    status: "arriving",
    eta: 18,
    distanceRemaining: 3.8,
    progress: 52,
    category: "Cẩu vật liệu lên tầng 3",
    totalPrice: 3200000,
    customerAddress: "789 Lý Tự Trọng, Q.1, TP.HCM",
    workerLocation: { latitude: 10.774, longitude: 106.698 },
    customerLocation: { latitude: 10.77, longitude: 106.694 },
    startedAt: "14:00",
  },
  {
    id: "4",
    bookingId: "BK-2026-0304",
    workerName: "Phạm Văn Tải",
    workerAvatar: "",
    workerPhone: "0934567890",
    vehicleType: "truck",
    vehiclePlate: "61C-234.56",
    status: "accepted",
    eta: 35,
    distanceRemaining: 12.0,
    progress: 15,
    category: "Chuyển vật liệu xây dựng",
    totalPrice: 2800000,
    customerAddress: "321 Võ Văn Tần, Q.3, TP.HCM",
    workerLocation: { latitude: 10.8, longitude: 106.73 },
    customerLocation: { latitude: 10.775, longitude: 106.688 },
    startedAt: "13:15",
  },
];
