/**
 * Booking Flow Types
 * Shared types for the Grab-like worker booking flow
 */

export interface BookingService {
  id: string;
  name: string;
  category: string;
  icon: string; // Ionicons name
  description: string;
  priceRange: string;
  estimatedTime: string;
}

export interface WorkerLocation {
  latitude: number;
  longitude: number;
}

export interface NearbyWorker {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  distance: string; // e.g. "1.2 km"
  estimatedArrival: string; // e.g. "15 phút"
  pricePerHour: number;
  verified: boolean;
  online: boolean;
  location: WorkerLocation;
  skills: string[];
  yearsExperience: number;
}

export interface BookingAddress {
  fullAddress: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  note?: string;
}

export type PaymentMethod = "momo" | "vnpay" | "bank_transfer";

export interface BookingConfirmation {
  serviceId: string;
  serviceName: string;
  workerId: string;
  workerName: string;
  address: BookingAddress;
  scheduledDate: string;
  scheduledTime: string;
  estimatedPrice: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type BookingStatus =
  | "searching" // Đang tìm thợ
  | "matched" // Đã tìm thấy thợ
  | "confirmed" // Thợ xác nhận
  | "on_the_way" // Thợ đang đến
  | "arrived" // Thợ đã đến
  | "in_progress" // Đang thực hiện
  | "completed" // Hoàn thành
  | "cancelled"; // Đã hủy

export interface BookingStep {
  id: number;
  status: BookingStatus;
  label: string;
  description: string;
  time?: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface ActiveBooking {
  id: string;
  service: BookingService;
  worker: NearbyWorker;
  address: BookingAddress;
  status: BookingStatus;
  steps: BookingStep[];
  estimatedPrice: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  scheduledDate: string;
  scheduledTime: string;
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS
// ═══════════════════════════════════════════════════════════════════

export const BOOKING_SERVICES: BookingService[] = [
  // Sửa chữa
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
  // Xây dựng
  {
    id: "tho-xay",
    name: "Thợ xây",
    category: "Xây dựng",
    icon: "home-outline",
    description: "Xây tường, trát xi măng",
    priceRange: "400K - 600K/ngày",
    estimatedTime: "Theo ngày",
  },
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
  // Thiết kế
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

export function generateMockWorkers(
  serviceId: string,
  count = 8,
): NearbyWorker[] {
  const names = [
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
  const specialties: Record<string, string> = {
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

  return Array.from({ length: count }, (_, i) => ({
    id: `w-${serviceId}-${i}`,
    name: names[i % names.length],
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(names[i % names.length])}&background=0D9488&color=fff&size=128`,
    specialty: specialties[serviceId] || "Thợ đa năng",
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
    skills: [specialties[serviceId] || "Đa năng", "Kinh nghiệm", "Uy tín"],
    yearsExperience: Math.floor(2 + Math.random() * 15),
  })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}
