/**
 * Profile Types - Comprehensive user profile system
 * Supports role-based themes, ratings, points, wallet
 */

// ============================================================================
// User Roles (determines profile theme)
// ============================================================================

export type UserRole =
  | "customer" // Khách hàng
  | "worker" // Thợ/Nhân công
  | "contractor" // Nhà thầu
  | "supplier" // Nhà cung cấp
  | "designer" // Kiến trúc sư/Thiết kế
  | "consultant" // Tư vấn
  | "admin" // Quản trị viên
  | "seller"; // Người bán hàng

export type WorkerSpecialty =
  | "electrician" // Thợ điện
  | "plumber" // Thợ ống nước
  | "carpenter" // Thợ mộc
  | "painter" // Thợ sơn
  | "tiler" // Thợ lát gạch
  | "mason" // Thợ xây
  | "welder" // Thợ hàn
  | "hvac" // Thợ điều hòa
  | "interior" // Nội thất
  | "exterior" // Hoàn thiện ngoại thất
  | "general"; // Nhân công phổ thông

// ============================================================================
// Rating System (Shopee-style 5-star)
// ============================================================================

export interface Rating {
  id: string;
  userId: string; // ID người đánh giá
  targetUserId: string; // ID người được đánh giá
  orderId?: string; // Liên kết với đơn hàng/công việc
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  images?: string[];
  tags?: RatingTag[]; // Quick tags like "Nhanh", "Chất lượng"
  reply?: string; // Phản hồi từ người được đánh giá
  isVerified: boolean; // Đánh giá từ đơn đã hoàn thành
  createdAt: string;
  updatedAt: string;
}

export interface RatingTag {
  id: string;
  label: string;
  icon?: string;
  positive: boolean; // true = tag tích cực
}

export interface RatingSummary {
  averageScore: number; // 0-5 (e.g., 4.9)
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  positivePercent: number; // % đánh giá tích cực (4-5 sao)
  topTags: RatingTag[];
}

// ============================================================================
// Points System
// ============================================================================

export interface PointsBalance {
  rewardPoints: number; // Điểm thưởng (tích lũy từ hoạt động)
  creditPoints: number; // Điểm tín dụng (uy tín)
  walletBalance: number; // Số dư ví (VND)
  bonusPoints: number; // Điểm bonus (khuyến mãi)
  totalConverted: number; // Tổng đã quy đổi thành tiền
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: "earn" | "spend" | "convert" | "expire" | "bonus" | "refund";
  pointType: "reward" | "credit" | "wallet" | "bonus";
  amount: number; // Số điểm (+ hoặc -)
  balance: number; // Số dư sau giao dịch
  description: string;
  orderId?: string;
  referenceId?: string;
  createdAt: string;
  expiresAt?: string; // Ngày hết hạn (nếu có)
}

// Conversion rates
export const POINTS_CONVERSION = {
  rewardToWallet: 100, // 100 reward points = 1,000 VND
  creditBonus: 0.1, // 10% bonus khi credit cao
  walletUnit: 1000, // 1 điểm wallet = 1,000 VND
  minConvert: 1000, // Tối thiểu 1000 reward points để quy đổi
};

// ============================================================================
// Profile Statistics
// ============================================================================

export interface ProfileStats {
  // Công việc
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  successRate: number; // Tỷ lệ hoàn thành (%)

  // Đánh giá
  rating: RatingSummary;

  // Thời gian
  responseTime: number; // Phút trung bình phản hồi
  lastActive: string; // ISO date
  memberSince: string; // ISO date

  // Badges/Achievements
  badges: ProfileBadge[];
  level: UserLevel;
}

export interface ProfileBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  earnedAt: string;
}

export interface UserLevel {
  current: number; // Level hiện tại (1-100)
  name: string; // Tên level (VIP, Diamond, ...)
  progress: number; // % đến level tiếp theo
  nextLevel?: string;
}

// ============================================================================
// Availability Status
// ============================================================================

export type AvailabilityStatus =
  | "available" // Sẵn sàng
  | "busy" // Đang bận
  | "offline" // Không hoạt động
  | "away"; // Vắng mặt

export interface Availability {
  status: AvailabilityStatus;
  message?: string; // "Có mặt sau 30 phút"
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    distance?: number; // km từ user hiện tại
  };
  workingHours?: {
    start: string; // "08:00"
    end: string; // "17:00"
    days: number[]; // [1,2,3,4,5] = Mon-Fri
  };
}

// ============================================================================
// Full User Profile
// ============================================================================

export interface UserProfileFull {
  // Basic Info
  id: string;
  slug: string; // URL slug unique
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  coverImage?: string; // Ảnh bìa
  bio?: string;

  // Role & Specialty
  role: UserRole;
  specialty?: WorkerSpecialty[];
  title?: string; // "Thợ điện", "Nhà thầu xây dựng"
  yearsExperience?: number;
  certifications?: string[];

  // Verification
  isVerified: boolean; // Đã xác minh
  isTopRated: boolean; // Top đánh giá
  isPremium: boolean; // Tài khoản premium

  // Points & Wallet
  points: PointsBalance;

  // Stats
  stats: ProfileStats;

  // Availability
  availability: Availability;

  // Pricing (for workers/contractors)
  pricing?: {
    hourlyRate?: number; // VND/giờ
    dailyRate?: number; // VND/ngày
    minOrder?: number; // Đơn tối thiểu
    currency: "VND";
  };

  // Portfolio
  portfolioImages?: string[];
  portfolioVideos?: string[];

  // Contact
  zaloId?: string;
  facebookId?: string;
  website?: string;

  // Settings
  isActive: boolean;
  profileVisibility: "public" | "private" | "contacts";

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Role-based Theme Colors
// ============================================================================

export interface RoleTheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: [string, string];
  badgeColor: string;
  statusColor: string;
}

export const ROLE_THEMES: Record<UserRole, RoleTheme> = {
  customer: {
    primary: "#0066CC",
    secondary: "#E6F2FF",
    accent: "#0080FF",
    gradient: ["#0066CC", "#0080FF"],
    badgeColor: "#0066CC",
    statusColor: "#4CAF50",
  },
  worker: {
    primary: "#FF6B35",
    secondary: "#FFF3E0",
    accent: "#FF8A50",
    gradient: ["#FF6B35", "#FF8A50"],
    badgeColor: "#FFB800",
    statusColor: "#4CAF50",
  },
  contractor: {
    primary: "#1E3A5F",
    secondary: "#E8EEF4",
    accent: "#2E5A8F",
    gradient: ["#1E3A5F", "#2E5A8F"],
    badgeColor: "#1E3A5F",
    statusColor: "#4CAF50",
  },
  supplier: {
    primary: "#2E7D32",
    secondary: "#E8F5E9",
    accent: "#4CAF50",
    gradient: ["#2E7D32", "#4CAF50"],
    badgeColor: "#2E7D32",
    statusColor: "#4CAF50",
  },
  designer: {
    primary: "#7B1FA2",
    secondary: "#F3E5F5",
    accent: "#9C27B0",
    gradient: ["#7B1FA2", "#9C27B0"],
    badgeColor: "#7B1FA2",
    statusColor: "#4CAF50",
  },
  consultant: {
    primary: "#00838F",
    secondary: "#E0F7FA",
    accent: "#00ACC1",
    gradient: ["#00838F", "#00ACC1"],
    badgeColor: "#00838F",
    statusColor: "#4CAF50",
  },
  admin: {
    primary: "#C62828",
    secondary: "#FFEBEE",
    accent: "#E53935",
    gradient: ["#C62828", "#E53935"],
    badgeColor: "#C62828",
    statusColor: "#4CAF50",
  },
  seller: {
    primary: "#E65100",
    secondary: "#FFF3E0",
    accent: "#FF9800",
    gradient: ["#E65100", "#FF9800"],
    badgeColor: "#E65100",
    statusColor: "#4CAF50",
  },
};

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetProfileBySlugRequest {
  slug: string;
}

export interface GetProfileResponse {
  success: boolean;
  data: UserProfileFull;
  message?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  title?: string;
  specialty?: WorkerSpecialty[];
  pricing?: UserProfileFull["pricing"];
  availability?: Partial<Availability>;
  profileVisibility?: UserProfileFull["profileVisibility"];
}

export interface SubmitRatingRequest {
  targetUserId: string;
  orderId?: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  images?: string[];
  tags?: string[];
}

export interface ConvertPointsRequest {
  fromType: "reward" | "bonus";
  toType: "wallet";
  amount: number;
}

export interface GetRatingsRequest {
  userId: string;
  page?: number;
  limit?: number;
  minScore?: number;
  sortBy?: "newest" | "oldest" | "highest" | "lowest";
}

export interface GetPointHistoryRequest {
  userId: string;
  type?: PointTransaction["type"];
  pointType?: PointTransaction["pointType"];
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}
