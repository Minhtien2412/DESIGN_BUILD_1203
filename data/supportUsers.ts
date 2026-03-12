/**
 * Support Users Data
 * ==================
 *
 * Các user hỗ trợ khách hàng luôn hiển thị online:
 * - CSKH Design Build
 * - Hỗ Trợ KH Design Build
 * - Tư Vấn Thiết Kế
 * - Hỗ Trợ Kỹ Thuật
 *
 * Khi user gửi tin nhắn, admin sẽ vào check và trả lời.
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

// ============================================
// TYPES
// ============================================

export interface SupportUser {
  id: string;
  numericId: number;
  name: string;
  displayName: string;
  avatar: string;
  role: "support" | "sales" | "technical" | "consultant";
  department: string;
  isAlwaysOnline: boolean;
  welcomeMessage: string;
  responseTime: string;
  skills: string[];
  workingHours?: string;
  email?: string;
  phone?: string;
  priority: number; // Lower = higher priority in list
}

export interface SupportTeam {
  id: string;
  name: string;
  description: string;
  members: SupportUser[];
  isActive: boolean;
}

// ============================================
// SUPPORT USERS DATA
// ============================================

export const SUPPORT_USERS: SupportUser[] = [
  {
    id: "support-cskh-main",
    numericId: 100001,
    name: "cskh_design_build",
    displayName: "CSKH Design Build",
    avatar:
      "https://ui-avatars.com/api/?name=CSKH&background=007AFF&color=fff&size=128&bold=true",
    role: "support",
    department: "Chăm sóc khách hàng",
    isAlwaysOnline: true,
    welcomeMessage:
      "Xin chào! Tôi là CSKH Design Build. Tôi có thể giúp gì cho bạn hôm nay?",
    responseTime: "Thường trả lời trong 5-10 phút",
    skills: ["Tư vấn chung", "Hỗ trợ đơn hàng", "Giải đáp thắc mắc"],
    workingHours: "8:00 - 22:00 (Thứ 2 - CN)",
    email: "cskh@designbuild.vn",
    phone: "1900-xxxx-xx",
    priority: 1,
  },
  {
    id: "support-hotro-kh",
    numericId: 100002,
    name: "hotro_kh_design_build",
    displayName: "Hỗ Trợ KH Design Build",
    avatar:
      "https://ui-avatars.com/api/?name=HT&background=34C759&color=fff&size=128&bold=true",
    role: "support",
    department: "Hỗ trợ khách hàng",
    isAlwaysOnline: true,
    welcomeMessage:
      "Chào bạn! Đội ngũ Hỗ Trợ KH Design Build sẵn sàng giúp đỡ bạn.",
    responseTime: "Thường trả lời trong 10-15 phút",
    skills: ["Hỗ trợ kỹ thuật", "Hướng dẫn sử dụng", "Xử lý sự cố"],
    workingHours: "8:00 - 21:00 (Thứ 2 - Thứ 7)",
    email: "hotro@designbuild.vn",
    priority: 2,
  },
  {
    id: "support-tuvan-thietke",
    numericId: 100003,
    name: "tuvan_thietke",
    displayName: "Tư Vấn Thiết Kế",
    avatar:
      "https://ui-avatars.com/api/?name=TV&background=FF9500&color=fff&size=128&bold=true",
    role: "consultant",
    department: "Tư vấn thiết kế",
    isAlwaysOnline: true,
    welcomeMessage:
      "Xin chào! Tôi là chuyên viên Tư Vấn Thiết Kế. Bạn cần tư vấn về thiết kế gì?",
    responseTime: "Thường trả lời trong 15-30 phút",
    skills: [
      "Thiết kế nội thất",
      "Thiết kế kiến trúc",
      "Phong thủy",
      "Báo giá",
    ],
    workingHours: "9:00 - 18:00 (Thứ 2 - Thứ 6)",
    email: "tuvan@designbuild.vn",
    priority: 3,
  },
  {
    id: "support-kythuat",
    numericId: 100004,
    name: "hotro_kythuat",
    displayName: "Hỗ Trợ Kỹ Thuật",
    avatar:
      "https://ui-avatars.com/api/?name=KT&background=5856D6&color=fff&size=128&bold=true",
    role: "technical",
    department: "Kỹ thuật",
    isAlwaysOnline: true,
    welcomeMessage:
      "Chào bạn! Đội ngũ Kỹ Thuật sẵn sàng hỗ trợ các vấn đề technical.",
    responseTime: "Thường trả lời trong 20-30 phút",
    skills: ["Hỗ trợ app", "Lỗi kỹ thuật", "Tích hợp hệ thống", "API support"],
    workingHours: "8:30 - 17:30 (Thứ 2 - Thứ 6)",
    email: "kythuat@designbuild.vn",
    priority: 4,
  },
  {
    id: "support-sales",
    numericId: 100005,
    name: "sales_design_build",
    displayName: "Kinh Doanh Design Build",
    avatar:
      "https://ui-avatars.com/api/?name=KD&background=FF3B30&color=fff&size=128&bold=true",
    role: "sales",
    department: "Kinh doanh",
    isAlwaysOnline: true,
    welcomeMessage:
      "Xin chào! Tôi là đại diện Kinh Doanh. Tôi có thể tư vấn giá và các gói dịch vụ cho bạn.",
    responseTime: "Thường trả lời trong 5-10 phút",
    skills: ["Báo giá", "Tư vấn gói dịch vụ", "Khuyến mãi", "Đặt hàng"],
    workingHours: "8:00 - 20:00 (Thứ 2 - CN)",
    email: "sales@designbuild.vn",
    phone: "1900-xxxx-xx",
    priority: 5,
  },
];

// ============================================
// SUPPORT TEAMS
// ============================================

export const SUPPORT_TEAMS: SupportTeam[] = [
  {
    id: "team-cskh",
    name: "Đội CSKH",
    description: "Chăm sóc và hỗ trợ khách hàng chung",
    members: SUPPORT_USERS.filter((u) => u.role === "support"),
    isActive: true,
  },
  {
    id: "team-tuvan",
    name: "Đội Tư Vấn",
    description: "Tư vấn thiết kế và giải pháp",
    members: SUPPORT_USERS.filter(
      (u) => u.role === "consultant" || u.role === "sales",
    ),
    isActive: true,
  },
  {
    id: "team-kythuat",
    name: "Đội Kỹ Thuật",
    description: "Hỗ trợ kỹ thuật và technical",
    members: SUPPORT_USERS.filter((u) => u.role === "technical"),
    isActive: true,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all support users sorted by priority
 */
export function getSupportUsers(): SupportUser[] {
  return [...SUPPORT_USERS].sort((a, b) => a.priority - b.priority);
}

/**
 * Get support users that are always online
 */
export function getOnlineSupportUsers(): SupportUser[] {
  return getSupportUsers().filter((u) => u.isAlwaysOnline);
}

/**
 * Get support user by ID
 */
export function getSupportUserById(id: string): SupportUser | undefined {
  return SUPPORT_USERS.find((u) => u.id === id);
}

/**
 * Get support user by numeric ID (for database compatibility)
 */
export function getSupportUserByNumericId(
  numericId: number,
): SupportUser | undefined {
  return SUPPORT_USERS.find((u) => u.numericId === numericId);
}

/**
 * Get support users by role
 */
export function getSupportUsersByRole(
  role: SupportUser["role"],
): SupportUser[] {
  return SUPPORT_USERS.filter((u) => u.role === role);
}

/**
 * Get support team by ID
 */
export function getSupportTeam(teamId: string): SupportTeam | undefined {
  return SUPPORT_TEAMS.find((t) => t.id === teamId);
}

/**
 * Check if a user ID belongs to a support user
 */
export function isSupportUser(userId: string | number): boolean {
  if (typeof userId === "string") {
    return SUPPORT_USERS.some((u) => u.id === userId);
  }
  return SUPPORT_USERS.some((u) => u.numericId === userId);
}

/**
 * Get default welcome message for a support user
 */
export function getWelcomeMessage(supportUserId: string): string {
  const user = getSupportUserById(supportUserId);
  return user?.welcomeMessage || "Xin chào! Tôi có thể giúp gì cho bạn?";
}

/**
 * Format support user for chat list display
 */
export function formatSupportUserForChat(user: SupportUser) {
  return {
    id: user.id,
    numericId: user.numericId,
    name: user.displayName,
    avatar: user.avatar,
    status: "online" as const,
    isSupport: true,
    department: user.department,
    responseTime: user.responseTime,
    lastSeen: new Date().toISOString(), // Always "now" since they're always online
  };
}

/**
 * Get all support users formatted for chat list
 */
export function getSupportUsersForChatList() {
  return getOnlineSupportUsers().map(formatSupportUserForChat);
}

// ============================================
// CONVERSATION STARTERS
// ============================================

export interface QuickQuestion {
  id: string;
  text: string;
  targetRole: "consultant" | "sales" | "technical" | "support";
}

export const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: "q1",
    text: "Tôi muốn tư vấn thiết kế",
    targetRole: "consultant" as const,
  },
  {
    id: "q2",
    text: "Tôi cần báo giá dự án",
    targetRole: "sales" as const,
  },
  {
    id: "q3",
    text: "Tôi gặp vấn đề với app",
    targetRole: "technical" as const,
  },
  {
    id: "q4",
    text: "Tôi cần hỗ trợ đơn hàng",
    targetRole: "support" as const,
  },
  {
    id: "q5",
    text: "Tôi muốn liên hệ kinh doanh",
    targetRole: "sales" as const,
  },
];

/**
 * Get recommended support user for a quick question
 */
export function getRecommendedSupportForQuestion(
  questionId: string,
): SupportUser | undefined {
  const question = QUICK_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return getSupportUsers()[0];

  const users = getSupportUsersByRole(question.targetRole);
  return users[0] || getSupportUsers()[0];
}
