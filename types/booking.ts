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
// Re-exports from centralized mock file (backward compat)
// ═══════════════════════════════════════════════════════════════════
export {
    BOOKING_SERVICES,
    generateMockWorkers
} from "@/__mocks__/booking-mocks";

