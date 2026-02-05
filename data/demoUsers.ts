/**
 * Demo Users Data
 * =================
 *
 * Danh sách người dùng demo với thông tin thực tế
 * Dùng để hiển thị trong danh bạ, tin nhắn, cuộc gọi
 *
 * @author DESIGN BUILD Team
 * @created 2026-02-03
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  title?: string;
  isOnline: boolean;
  lastSeen?: string;
  isFavorite?: boolean;
  isVerified?: boolean;
}

export type UserRole =
  | "ADMIN"
  | "ARCHITECT"
  | "ENGINEER"
  | "DESIGNER"
  | "PROJECT_MANAGER"
  | "CLIENT"
  | "CONTRACTOR"
  | "SUPPORT";

export interface OnlineStatus {
  userId: number;
  isOnline: boolean;
  lastSeen: string;
  currentActivity?: "available" | "busy" | "in-call" | "away";
}

// ============================================================================
// DEMO USERS - Realistic Vietnamese Names
// ============================================================================

export const DEMO_USERS: DemoUser[] = [
  // ====== ADMIN & MANAGEMENT ======
  {
    id: 1,
    name: "Nguyễn Thanh Hùng",
    email: "hung.nguyen@designbuild.vn",
    phone: "0901234567",
    avatar: "https://i.pravatar.cc/150?u=hung",
    role: "ADMIN",
    department: "Ban Giám đốc",
    title: "Giám đốc điều hành",
    isOnline: true,
    isVerified: true,
    isFavorite: true,
  },
  {
    id: 2,
    name: "Trần Thị Mai",
    email: "mai.tran@designbuild.vn",
    phone: "0902345678",
    avatar: "https://i.pravatar.cc/150?u=mai",
    role: "ADMIN",
    department: "Ban Giám đốc",
    title: "Phó Giám đốc",
    isOnline: true,
    isVerified: true,
  },

  // ====== ARCHITECTS ======
  {
    id: 10,
    name: "Lê Văn Minh",
    email: "minh.le@designbuild.vn",
    phone: "0903456789",
    avatar: "https://i.pravatar.cc/150?u=minh",
    role: "ARCHITECT",
    department: "Phòng Thiết kế",
    title: "Kiến trúc sư trưởng",
    isOnline: true,
    isVerified: true,
    isFavorite: true,
  },
  {
    id: 11,
    name: "Phạm Thị Lan",
    email: "lan.pham@designbuild.vn",
    phone: "0904567890",
    avatar: "https://i.pravatar.cc/150?u=lan",
    role: "ARCHITECT",
    department: "Phòng Thiết kế",
    title: "Kiến trúc sư",
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 12,
    name: "Hoàng Anh Tuấn",
    email: "tuan.hoang@designbuild.vn",
    phone: "0905678901",
    avatar: "https://i.pravatar.cc/150?u=tuan",
    role: "ARCHITECT",
    department: "Phòng Thiết kế",
    title: "Kiến trúc sư",
    isOnline: true,
  },

  // ====== ENGINEERS ======
  {
    id: 20,
    name: "Võ Đình Nam",
    email: "nam.vo@designbuild.vn",
    phone: "0906789012",
    avatar: "https://i.pravatar.cc/150?u=nam",
    role: "ENGINEER",
    department: "Phòng Kỹ thuật",
    title: "Kỹ sư kết cấu",
    isOnline: true,
    isFavorite: true,
  },
  {
    id: 21,
    name: "Nguyễn Thị Hồng",
    email: "hong.nguyen@designbuild.vn",
    phone: "0907890123",
    avatar: "https://i.pravatar.cc/150?u=hong",
    role: "ENGINEER",
    department: "Phòng Kỹ thuật",
    title: "Kỹ sư M&E",
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 22,
    name: "Đặng Quốc Bảo",
    email: "bao.dang@designbuild.vn",
    phone: "0908901234",
    avatar: "https://i.pravatar.cc/150?u=bao",
    role: "ENGINEER",
    department: "Phòng Kỹ thuật",
    title: "Kỹ sư điện",
    isOnline: true,
  },

  // ====== DESIGNERS ======
  {
    id: 30,
    name: "Bùi Thị Kim",
    email: "kim.bui@designbuild.vn",
    phone: "0909012345",
    avatar: "https://i.pravatar.cc/150?u=kim",
    role: "DESIGNER",
    department: "Phòng Nội thất",
    title: "Nhà thiết kế nội thất trưởng",
    isOnline: true,
    isVerified: true,
  },
  {
    id: 31,
    name: "Lý Minh Châu",
    email: "chau.ly@designbuild.vn",
    phone: "0910123456",
    avatar: "https://i.pravatar.cc/150?u=chau",
    role: "DESIGNER",
    department: "Phòng Nội thất",
    title: "Nhà thiết kế nội thất",
    isOnline: false,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },

  // ====== PROJECT MANAGERS ======
  {
    id: 40,
    name: "Trương Văn Đức",
    email: "duc.truong@designbuild.vn",
    phone: "0911234567",
    avatar: "https://i.pravatar.cc/150?u=duc",
    role: "PROJECT_MANAGER",
    department: "Phòng Dự án",
    title: "Trưởng phòng Dự án",
    isOnline: true,
    isVerified: true,
    isFavorite: true,
  },
  {
    id: 41,
    name: "Nguyễn Thị Hạnh",
    email: "hanh.nguyen@designbuild.vn",
    phone: "0912345678",
    avatar: "https://i.pravatar.cc/150?u=hanh",
    role: "PROJECT_MANAGER",
    department: "Phòng Dự án",
    title: "Quản lý dự án",
    isOnline: true,
  },

  // ====== CLIENTS ======
  {
    id: 100,
    name: "Lê Quang Vinh",
    email: "vinh.le@gmail.com",
    phone: "0913456789",
    avatar: "https://i.pravatar.cc/150?u=vinh",
    role: "CLIENT",
    title: "Chủ đầu tư - Dự án Villa Đà Lạt",
    isOnline: true,
  },
  {
    id: 101,
    name: "Trần Minh Hoàng",
    email: "hoang.tran@company.vn",
    phone: "0914567890",
    avatar: "https://i.pravatar.cc/150?u=hoang",
    role: "CLIENT",
    title: "Chủ đầu tư - Dự án Biệt thự Phú Quốc",
    isOnline: false,
    lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 102,
    name: "Phạm Thị Yến",
    email: "yen.pham@gmail.com",
    phone: "0915678901",
    avatar: "https://i.pravatar.cc/150?u=yen",
    role: "CLIENT",
    title: "Khách hàng - Thiết kế nội thất",
    isOnline: true,
  },
  {
    id: 103,
    name: "Nguyễn Văn Tài",
    email: "tai.nguyen@company.com",
    phone: "0916789012",
    avatar: "https://i.pravatar.cc/150?u=tai",
    role: "CLIENT",
    title: "Khách hàng tiềm năng",
    isOnline: false,
    lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ====== CONTRACTORS ======
  {
    id: 200,
    name: "Công ty XD Thành Công",
    email: "thanhcong.xd@gmail.com",
    phone: "0917890123",
    avatar: "https://i.pravatar.cc/150?u=thanhcong",
    role: "CONTRACTOR",
    title: "Nhà thầu xây dựng",
    isOnline: true,
    isVerified: true,
  },
  {
    id: 201,
    name: "Công ty Nội thất Hoàng Gia",
    email: "hoanggia.nt@gmail.com",
    phone: "0918901234",
    avatar: "https://i.pravatar.cc/150?u=hoanggia",
    role: "CONTRACTOR",
    title: "Nhà thầu nội thất",
    isOnline: false,
    lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },

  // ====== CUSTOMER SUPPORT ======
  {
    id: 900,
    name: "Hỗ trợ Kỹ thuật",
    email: "support@designbuild.vn",
    phone: "1900-1234",
    avatar: "https://i.pravatar.cc/150?u=support",
    role: "SUPPORT",
    department: "CSKH",
    title: "Hỗ trợ kỹ thuật 24/7",
    isOnline: true,
    isVerified: true,
  },
  {
    id: 901,
    name: "Tư vấn Thiết kế",
    email: "tuvan@designbuild.vn",
    phone: "1900-5678",
    avatar: "https://i.pravatar.cc/150?u=tuvan",
    role: "SUPPORT",
    department: "CSKH",
    title: "Tư vấn thiết kế",
    isOnline: true,
    isVerified: true,
  },
  {
    id: 902,
    name: "Chăm sóc Khách hàng",
    email: "cskh@designbuild.vn",
    phone: "1900-9012",
    avatar: "https://i.pravatar.cc/150?u=cskh",
    role: "SUPPORT",
    department: "CSKH",
    title: "CSKH Tổng đài",
    isOnline: true,
    isVerified: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Lấy user theo ID
 */
export function getUserById(userId: number): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === userId);
}

/**
 * Lấy danh sách users theo role
 */
export function getUsersByRole(role: UserRole): DemoUser[] {
  return DEMO_USERS.filter((u) => u.role === role);
}

/**
 * Lấy users online
 */
export function getOnlineUsers(): DemoUser[] {
  return DEMO_USERS.filter((u) => u.isOnline);
}

/**
 * Lấy users yêu thích
 */
export function getFavoriteUsers(): DemoUser[] {
  return DEMO_USERS.filter((u) => u.isFavorite);
}

/**
 * Tìm kiếm users
 */
export function searchUsers(query: string): DemoUser[] {
  const lowerQuery = query.toLowerCase();
  return DEMO_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery) ||
      u.phone.includes(query) ||
      u.title?.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Lấy display name cho role
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: "Quản trị viên",
    ARCHITECT: "Kiến trúc sư",
    ENGINEER: "Kỹ sư",
    DESIGNER: "Nhà thiết kế",
    PROJECT_MANAGER: "Quản lý dự án",
    CLIENT: "Khách hàng",
    CONTRACTOR: "Nhà thầu",
    SUPPORT: "Hỗ trợ",
  };
  return roleNames[role];
}

/**
 * Format last seen time
 */
export function formatLastSeen(lastSeen: string | undefined): string {
  if (!lastSeen) return "Không xác định";

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Vừa online";
  if (diffMins < 60) return `${diffMins} phút trước`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

/**
 * Nhóm users theo chữ cái đầu
 */
export function groupUsersByFirstLetter(
  users: DemoUser[],
): { title: string; data: DemoUser[] }[] {
  const grouped: Record<string, DemoUser[]> = {};

  users.forEach((user) => {
    const firstLetter = user.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(user);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([title, data]) => ({ title, data }));
}

// ============================================================================
// ONLINE STATUS SIMULATION
// ============================================================================

// Simulated online statuses (would come from WebSocket in production)
const onlineStatuses = new Map<number, OnlineStatus>();

// Initialize online statuses
DEMO_USERS.forEach((user) => {
  onlineStatuses.set(user.id, {
    userId: user.id,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen || new Date().toISOString(),
    currentActivity: user.isOnline ? "available" : undefined,
  });
});

/**
 * Get online status for a user
 */
export function getOnlineStatus(userId: number): OnlineStatus | undefined {
  return onlineStatuses.get(userId);
}

/**
 * Update online status (simulated)
 */
export function updateOnlineStatus(
  userId: number,
  isOnline: boolean,
  activity?: OnlineStatus["currentActivity"],
): void {
  const existing = onlineStatuses.get(userId);
  if (existing) {
    existing.isOnline = isOnline;
    existing.lastSeen = new Date().toISOString();
    existing.currentActivity = activity;
  }
}

/**
 * Check if user can receive calls
 */
export function canReceiveCalls(userId: number): {
  canCall: boolean;
  reason?: string;
} {
  const status = onlineStatuses.get(userId);

  if (!status || !status.isOnline) {
    return { canCall: false, reason: "Người dùng đang offline" };
  }

  if (status.currentActivity === "in-call") {
    return { canCall: false, reason: "Người dùng đang trong cuộc gọi khác" };
  }

  if (status.currentActivity === "busy") {
    return { canCall: false, reason: "Người dùng đang bận" };
  }

  return { canCall: true };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  users: DEMO_USERS,
  getUserById,
  getUsersByRole,
  getOnlineUsers,
  getFavoriteUsers,
  searchUsers,
  getRoleDisplayName,
  formatLastSeen,
  groupUsersByFirstLetter,
  getOnlineStatus,
  updateOnlineStatus,
  canReceiveCalls,
};
