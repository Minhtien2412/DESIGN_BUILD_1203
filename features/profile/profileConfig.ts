/**
 * Role-Based Profile Configuration
 *
 * Central config that drives all role-specific rendering:
 * - greeting text
 * - stat cards
 * - quick actions
 * - completion checklist items
 * - settings sections
 * - verification display
 */

import type { User } from "@/context/AuthContext";
import type { AppRole } from "@/context/RoleContext";
import type { UserProfileFull } from "@/types/profile";
import type {
    CompletionItem,
    CompletionState,
    EffectiveRole,
    GreetingData,
    QuickAction,
    RoleProfileConfig,
    SettingsSection,
    StatCardItem,
    TimeOfDay,
    VerificationState,
} from "./types";

// ═══════════════════════════════════════════════════════════════
// ROLE CONFIG MAP
// ═══════════════════════════════════════════════════════════════

export const ROLE_CONFIGS: Record<EffectiveRole, RoleProfileConfig> = {
  customer: {
    role: "customer",
    label: "Khách hàng",
    icon: "person-outline",
    gradient: ["#020617", "#0B1220", "#111827"],
    accentColor: "#60A5FA",
    badgeColor: "#93C5FD",
    badgeBgColor: "rgba(30,64,175,0.35)",
    requiresCompletion: false,
    minCompletionPercent: 0,
  },
  worker: {
    role: "worker",
    label: "Thợ",
    icon: "construct-outline",
    gradient: ["#1A0A00", "#2D1400", "#3D1F00"],
    accentColor: "#FB923C",
    badgeColor: "#FDBA74",
    badgeBgColor: "rgba(154,52,18,0.40)",
    requiresCompletion: true,
    minCompletionPercent: 70,
  },
  architect: {
    role: "architect",
    label: "Kiến trúc sư",
    icon: "easel-outline",
    gradient: ["#1A002E", "#2D0050", "#3D0068"],
    accentColor: "#C084FC",
    badgeColor: "#D8B4FE",
    badgeBgColor: "rgba(107,33,168,0.40)",
    requiresCompletion: true,
    minCompletionPercent: 60,
  },
  engineer: {
    role: "engineer",
    label: "Kỹ sư",
    icon: "build-outline",
    gradient: ["#001A2E", "#002D50", "#003D68"],
    accentColor: "#38BDF8",
    badgeColor: "#7DD3FC",
    badgeBgColor: "rgba(7,89,133,0.40)",
    requiresCompletion: true,
    minCompletionPercent: 60,
  },
  supervisor: {
    role: "supervisor",
    label: "Giám sát",
    icon: "shield-checkmark-outline",
    gradient: ["#001A1A", "#002D2D", "#003D3D"],
    accentColor: "#2DD4BF",
    badgeColor: "#5EEAD4",
    badgeBgColor: "rgba(17,94,89,0.40)",
    requiresCompletion: true,
    minCompletionPercent: 60,
  },
  admin: {
    role: "admin",
    label: "Quản trị viên",
    icon: "shield-outline",
    gradient: ["#1A0000", "#2D0000", "#3D0505"],
    accentColor: "#F87171",
    badgeColor: "#FCA5A5",
    badgeBgColor: "rgba(153,27,27,0.40)",
    requiresCompletion: false,
    minCompletionPercent: 0,
  },
};

// ═══════════════════════════════════════════════════════════════
// ROLE RESOLUTION — unify multiple role sources
// ═══════════════════════════════════════════════════════════════

/**
 * Determine the effective profile role from all available sources.
 * Priority: auth user fields > RoleContext > default customer
 */
export function resolveEffectiveRole(
  user: User | null,
  appRole: AppRole | null,
): EffectiveRole {
  // Admin check
  if (
    user?.admin === 1 ||
    user?.role === "admin" ||
    user?.userType === "admin"
  ) {
    return "admin";
  }

  // Check userType (marketplace role)
  if (user?.userType === "architect" || user?.userType === "designer") {
    return "architect";
  }

  // Check specific worker sub-types from global_roles or role field
  const roleStr = user?.role?.toLowerCase() ?? "";
  const globalRoles = user?.global_roles?.map((r) => r.toLowerCase()) ?? [];

  if (
    roleStr.includes("engineer") ||
    roleStr.includes("ky_su") ||
    globalRoles.includes("engineer")
  ) {
    return "engineer";
  }
  if (
    roleStr.includes("supervisor") ||
    roleStr.includes("giam_sat") ||
    globalRoles.includes("supervisor")
  ) {
    return "supervisor";
  }
  if (roleStr.includes("architect") || globalRoles.includes("architect")) {
    return "architect";
  }

  // AppRole from RoleContext (khach/tho)
  if (appRole === "tho") {
    return "worker";
  }

  // Contractor maps to worker in our profile system
  if (user?.userType === "contractor" || user?.userType === "company") {
    return "worker";
  }

  return "customer";
}

// ═══════════════════════════════════════════════════════════════
// GREETING
// ═══════════════════════════════════════════════════════════════

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const TIME_GREETINGS: Record<TimeOfDay, string> = {
  morning: "Chào buổi sáng",
  afternoon: "Chào buổi chiều",
  evening: "Chào buổi tối",
};

const ROLE_SUBTITLES: Record<EffectiveRole, string> = {
  customer: "Hôm nay bạn cần tìm thợ gì?",
  worker: "Hôm nay bạn sẵn sàng nhận bao nhiêu việc?",
  architect: "Có yêu cầu tư vấn mới đang chờ bạn",
  engineer: "Bạn có hạng mục cần xác nhận",
  supervisor: "Có công trình cần kiểm tra tiến độ",
  admin: "Hệ thống đang hoạt động bình thường",
};

export function buildGreeting(
  user: User | null,
  effectiveRole: EffectiveRole,
): GreetingData {
  const config = ROLE_CONFIGS[effectiveRole];
  const time = getTimeOfDay();
  const displayName = user?.name || user?.email?.split("@")[0] || "Bạn";

  return {
    timeGreeting: TIME_GREETINGS[time],
    userName: displayName,
    roleSubtitle: ROLE_SUBTITLES[effectiveRole],
    roleBadge: config.label,
    roleBadgeColor: config.badgeColor,
    roleBadgeIcon: config.icon as string,
  };
}

// ═══════════════════════════════════════════════════════════════
// STAT CARDS per role
// ═══════════════════════════════════════════════════════════════

export function getStatCards(
  role: EffectiveRole,
  profile: UserProfileFull | null,
): StatCardItem[] {
  const stats = profile?.stats;
  const points = profile?.points;

  switch (role) {
    case "customer":
      return [
        {
          id: "points",
          label: "Điểm thưởng",
          value: points?.rewardPoints ?? 0,
          icon: "star",
          color: "#FBBF24",
        },
        {
          id: "orders",
          label: "Đơn đã đặt",
          value: stats?.totalJobs ?? 0,
          icon: "receipt-outline",
          color: "#60A5FA",
        },
        {
          id: "favorites",
          label: "Thợ yêu thích",
          value: 0, // Will be filled by FavoritesContext
          icon: "heart",
          color: "#F87171",
        },
        {
          id: "vouchers",
          label: "Voucher",
          value: 0, // Will be filled if voucher system exists
          icon: "ticket-outline",
          color: "#34D399",
        },
      ];

    case "worker":
      return [
        {
          id: "completed",
          label: "Việc hoàn thành",
          value: stats?.completedJobs ?? 0,
          icon: "checkmark-circle",
          color: "#34D399",
        },
        {
          id: "rating",
          label: "Đánh giá",
          value: stats?.rating?.averageScore?.toFixed(1) ?? "0",
          icon: "star",
          color: "#FBBF24",
          suffix: "⭐",
        },
        {
          id: "experience",
          label: "Kinh nghiệm",
          value: profile?.yearsExperience ?? 0,
          icon: "time-outline",
          color: "#A78BFA",
          suffix: " năm",
        },
        {
          id: "income",
          label: "Thu nhập tháng",
          value: points?.walletBalance ?? 0,
          icon: "wallet-outline",
          color: "#FB923C",
          suffix: "đ",
        },
        {
          id: "acceptance",
          label: "Tỉ lệ nhận việc",
          value: stats?.successRate ?? 0,
          icon: "trending-up-outline",
          color: "#38BDF8",
          suffix: "%",
        },
        {
          id: "completion",
          label: "Hồ sơ hoàn thiện",
          value: 0, // Computed by completion checklist
          icon: "document-text-outline",
          color: "#C084FC",
          suffix: "%",
        },
      ];

    case "architect":
    case "engineer":
    case "supervisor":
      return [
        {
          id: "projects",
          label: "Dự án tham gia",
          value: stats?.totalJobs ?? 0,
          icon: "business-outline",
          color: "#C084FC",
        },
        {
          id: "completed",
          label: "Đã hoàn thành",
          value: stats?.completedJobs ?? 0,
          icon: "checkmark-circle",
          color: "#34D399",
        },
        {
          id: "rating",
          label: "Đánh giá",
          value: stats?.rating?.averageScore?.toFixed(1) ?? "0",
          icon: "star",
          color: "#FBBF24",
          suffix: "⭐",
        },
        {
          id: "response",
          label: "Tỉ lệ phản hồi",
          value: stats?.successRate ?? 0,
          icon: "chatbubble-outline",
          color: "#38BDF8",
          suffix: "%",
        },
        {
          id: "experience",
          label: "Kinh nghiệm",
          value: profile?.yearsExperience ?? 0,
          icon: "time-outline",
          color: "#A78BFA",
          suffix: " năm",
        },
        {
          id: "completion",
          label: "Hồ sơ hoàn thiện",
          value: 0,
          icon: "document-text-outline",
          color: "#FB923C",
          suffix: "%",
        },
      ];

    case "admin":
      return [
        {
          id: "users",
          label: "Người dùng",
          value: 0,
          icon: "people-outline",
          color: "#F87171",
        },
        {
          id: "workers",
          label: "Thợ đăng ký",
          value: 0,
          icon: "construct-outline",
          color: "#FB923C",
        },
        {
          id: "orders",
          label: "Đơn hàng",
          value: stats?.totalJobs ?? 0,
          icon: "receipt-outline",
          color: "#60A5FA",
        },
        {
          id: "revenue",
          label: "Doanh thu",
          value: 0,
          icon: "trending-up-outline",
          color: "#34D399",
          suffix: "đ",
        },
      ];

    default:
      return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// QUICK ACTIONS per role
// ═══════════════════════════════════════════════════════════════

export function getQuickActions(role: EffectiveRole): QuickAction[] {
  switch (role) {
    case "customer":
      return [
        {
          id: "qr",
          title: "Mã QR",
          icon: "qr-code-outline",
          color: "#60A5FA",
          route: "/utilities/my-qr-code",
        },
        {
          id: "wallet",
          title: "Ví",
          icon: "wallet-outline",
          color: "#22D3EE",
          route: "/profile/rewards",
        },
        {
          id: "orders",
          title: "Đơn hàng",
          icon: "receipt-outline",
          color: "#A78BFA",
          route: "/profile/orders",
        },
        {
          id: "vouchers",
          title: "Voucher",
          icon: "ticket-outline",
          color: "#34D399",
          route: "/profile/vouchers",
        },
      ];

    case "worker":
      return [
        {
          id: "wallet",
          title: "Ví tiền",
          icon: "wallet-outline",
          color: "#FB923C",
          route: "/profile/rewards",
        },
        {
          id: "jobs",
          title: "Việc của tôi",
          icon: "briefcase-outline",
          color: "#34D399",
          route: "/profile/orders",
        },
        {
          id: "portfolio",
          title: "Công trình",
          icon: "images-outline",
          color: "#A78BFA",
          route: "/profile/portfolio/portfolio",
        },
        {
          id: "schedule",
          title: "Lịch làm việc",
          icon: "calendar-outline",
          color: "#38BDF8",
          route: "/profile/orders",
        },
      ];

    case "architect":
    case "engineer":
    case "supervisor":
      return [
        {
          id: "projects",
          title: "Dự án",
          icon: "business-outline",
          color: "#C084FC",
          route: "/profile/orders",
        },
        {
          id: "portfolio",
          title: "Hồ sơ năng lực",
          icon: "document-text-outline",
          color: "#38BDF8",
          route: "/profile/portfolio/portfolio",
        },
        {
          id: "schedule",
          title: "Lịch hẹn",
          icon: "calendar-outline",
          color: "#34D399",
          route: "/profile/orders",
        },
        {
          id: "wallet",
          title: "Ví tiền",
          icon: "wallet-outline",
          color: "#FB923C",
          route: "/profile/rewards",
        },
      ];

    case "admin":
      return [
        {
          id: "users",
          title: "Quản lý users",
          icon: "people-outline",
          color: "#F87171",
          route: "/profile/account-management",
        },
        {
          id: "settings",
          title: "Cài đặt hệ thống",
          icon: "settings-outline",
          color: "#60A5FA",
          route: "/admin/settings",
        },
        {
          id: "reports",
          title: "Báo cáo",
          icon: "stats-chart-outline",
          color: "#34D399",
          route: "/admin/settings",
        },
        {
          id: "logs",
          title: "Nhật ký",
          icon: "document-text-outline",
          color: "#A78BFA",
          route: "/admin/settings",
        },
      ];

    default:
      return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// WORKER COMPLETION CHECKLIST
// ═══════════════════════════════════════════════════════════════

export function buildCompletionState(
  role: EffectiveRole,
  user: User | null,
  profile: UserProfileFull | null,
): CompletionState {
  if (!ROLE_CONFIGS[role].requiresCompletion) {
    return {
      percentage: 100,
      total: 0,
      completed: 0,
      requiredRemaining: 0,
      items: [],
      isBlocked: false,
    };
  }

  const items: CompletionItem[] = [];

  if (role === "worker") {
    items.push(
      {
        id: "avatar",
        label: "Ảnh đại diện",
        description: "Tải ảnh chân dung rõ mặt",
        icon: "camera-outline",
        completed: !!(user?.avatar || profile?.avatar),
        required: true,
        route: "/profile/info",
      },
      {
        id: "name",
        label: "Họ và tên",
        description: "Nhập tên đầy đủ",
        icon: "person-outline",
        completed: !!(user?.name && user.name.trim().length > 2),
        required: true,
        route: "/profile/info",
      },
      {
        id: "phone",
        label: "Số điện thoại",
        description: "Xác minh số điện thoại",
        icon: "call-outline",
        completed: !!user?.phone,
        required: true,
        route: "/profile/verify-phone",
      },
      {
        id: "specialization",
        label: "Loại thợ / Chuyên môn",
        description: "Chọn loại thợ chính",
        icon: "construct-outline",
        completed: (profile?.specialty?.length ?? 0) > 0,
        required: true,
        route: "/profile/info",
      },
      {
        id: "experience",
        label: "Năm kinh nghiệm",
        description: "Nhập số năm làm nghề",
        icon: "time-outline",
        completed: (profile?.yearsExperience ?? 0) > 0,
        required: true,
        route: "/profile/info",
      },
      {
        id: "service_area",
        label: "Khu vực làm việc",
        description: "Chọn khu vực nhận việc",
        icon: "location-outline",
        completed: !!profile?.availability?.location?.address,
        required: true,
        route: "/profile/info",
      },
      {
        id: "identity",
        label: "Xác minh CCCD",
        description: "Tải ảnh CCCD/CMND",
        icon: "id-card-outline",
        completed: !!profile?.isVerified,
        required: true,
        route: "/profile/personal-verification",
      },
      {
        id: "certificates",
        label: "Chứng chỉ hành nghề",
        description: "Bằng cấp, chứng chỉ kỹ thuật",
        icon: "ribbon-outline",
        completed: (profile?.certifications?.length ?? 0) > 0,
        required: false,
        route: "/profile/personal-verification",
      },
      {
        id: "portfolio",
        label: "Ảnh công trình",
        description: "Tải ảnh các công trình đã làm",
        icon: "images-outline",
        completed: (profile?.portfolioImages?.length ?? 0) > 0,
        required: false,
        route: "/profile/portfolio/portfolio",
      },
      {
        id: "pricing",
        label: "Thông tin giá",
        description: "Đơn giá ngày công hoặc giờ công",
        icon: "pricetag-outline",
        completed: !!(
          profile?.pricing?.dailyRate || profile?.pricing?.hourlyRate
        ),
        required: false,
        route: "/profile/info",
      },
      {
        id: "availability",
        label: "Trạng thái sẵn sàng",
        description: "Cập nhật trạng thái nhận việc",
        icon: "radio-button-on-outline",
        completed: profile?.availability?.status === "available",
        required: false,
        route: "/profile/info",
      },
    );
  }

  // Common professional fields for architect/engineer/supervisor
  if (role === "architect" || role === "engineer" || role === "supervisor") {
    items.push(
      {
        id: "avatar",
        label: "Ảnh đại diện",
        description: "Tải ảnh chuyên nghiệp",
        icon: "camera-outline",
        completed: !!(user?.avatar || profile?.avatar),
        required: true,
        route: "/profile/info",
      },
      {
        id: "name",
        label: "Họ và tên",
        description: "Nhập tên đầy đủ",
        icon: "person-outline",
        completed: !!(user?.name && user.name.trim().length > 2),
        required: true,
        route: "/profile/info",
      },
      {
        id: "phone",
        label: "Số điện thoại",
        description: "Xác minh số điện thoại",
        icon: "call-outline",
        completed: !!user?.phone,
        required: true,
        route: "/profile/verify-phone",
      },
      {
        id: "specialization",
        label: "Chuyên ngành",
        description: "Lĩnh vực chuyên môn chính",
        icon: "school-outline",
        completed: (profile?.specialty?.length ?? 0) > 0,
        required: true,
        route: "/profile/info",
      },
      {
        id: "experience",
        label: "Kinh nghiệm",
        description: "Số năm kinh nghiệm",
        icon: "time-outline",
        completed: (profile?.yearsExperience ?? 0) > 0,
        required: true,
        route: "/profile/info",
      },
      {
        id: "certificates",
        label: "Bằng cấp / Chứng chỉ",
        description: "Tải bằng tốt nghiệp, chứng chỉ hành nghề",
        icon: "ribbon-outline",
        completed: (profile?.certifications?.length ?? 0) > 0,
        required: true,
        route: "/profile/personal-verification",
      },
      {
        id: "identity",
        label: "Xác minh CCCD",
        description: "Tải ảnh CCCD/CMND",
        icon: "id-card-outline",
        completed: !!profile?.isVerified,
        required: true,
        route: "/profile/personal-verification",
      },
      {
        id: "portfolio",
        label: "Hồ sơ năng lực",
        description: "Các dự án đã tham gia",
        icon: "briefcase-outline",
        completed: (profile?.portfolioImages?.length ?? 0) > 0,
        required: false,
        route: "/profile/portfolio/portfolio",
      },
    );
  }

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;
  const requiredRemaining = items.filter(
    (i) => i.required && !i.completed,
  ).length;
  const minPct = ROLE_CONFIGS[role].minCompletionPercent;

  return {
    percentage,
    total,
    completed,
    requiredRemaining,
    items,
    isBlocked: requiredRemaining > 0 || percentage < minPct,
    blockedMessage:
      requiredRemaining > 0
        ? `Còn thiếu ${requiredRemaining} mục bắt buộc để được duyệt nhận việc`
        : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION
// ═══════════════════════════════════════════════════════════════

export function getVerificationState(
  user: User | null,
  profile: UserProfileFull | null,
): VerificationState {
  const phoneVerified = !!user?.phone;
  const emailVerified = !!user?.email;
  const idVerified = !!profile?.isVerified;
  const certificatesVerified = (profile?.certifications?.length ?? 0) > 0;

  let level: VerificationState["level"] = "none";
  if (idVerified && certificatesVerified) level = "full";
  else if (idVerified || phoneVerified) level = "basic";
  else if (emailVerified) level = "pending";

  const badges: Record<
    VerificationState["level"],
    { text: string; color: string }
  > = {
    none: { text: "Chưa xác minh", color: "#94A3B8" },
    pending: { text: "Đang xác minh", color: "#FBBF24" },
    basic: { text: "Đã xác minh cơ bản", color: "#38BDF8" },
    full: { text: "Đã xác minh đầy đủ", color: "#34D399" },
  };

  return {
    level,
    phoneVerified,
    emailVerified,
    idVerified,
    certificatesVerified,
    badgeText: badges[level].text,
    badgeColor: badges[level].color,
  };
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS SECTIONS (role-aware)
// ═══════════════════════════════════════════════════════════════

export function getSettingsSections(role: EffectiveRole): SettingsSection[] {
  const sections: SettingsSection[] = [];

  // — Account section (all roles)
  sections.push({
    title: "Tài khoản",
    items: [
      {
        id: "edit-profile",
        title: "Chỉnh sửa hồ sơ",
        icon: "person-outline",
        iconColor: "#60A5FA",
        route: "/profile/info",
      },
      {
        id: "security",
        title: "Bảo mật",
        icon: "lock-closed-outline",
        iconColor: "#A78BFA",
        route: "/profile/security",
      },
      {
        id: "verification",
        title: "Xác minh danh tính",
        icon: "shield-checkmark-outline",
        iconColor: "#34D399",
        route: "/profile/personal-verification",
      },
      {
        id: "addresses",
        title: "Địa chỉ đã lưu",
        icon: "location-outline",
        iconColor: "#FB923C",
        route: "/profile/addresses",
      },
    ],
  });

  // — Worker-specific settings
  if (
    role === "worker" ||
    role === "architect" ||
    role === "engineer" ||
    role === "supervisor"
  ) {
    sections.push({
      title: "Công việc",
      items: [
        {
          id: "availability",
          title: "Trạng thái nhận việc",
          icon: "radio-button-on-outline",
          iconColor: "#34D399",
          showSwitch: true,
          visibleRoles: ["worker", "architect", "engineer", "supervisor"],
        },
        {
          id: "service-area",
          title: "Khu vực nhận việc",
          icon: "map-outline",
          iconColor: "#38BDF8",
          route: "/profile/info",
          visibleRoles: ["worker"],
        },
        {
          id: "pricing",
          title: "Đơn giá nhận việc",
          icon: "pricetag-outline",
          iconColor: "#FB923C",
          route: "/profile/info",
          visibleRoles: ["worker"],
        },
        {
          id: "portfolio",
          title: "Hồ sơ năng lực",
          icon: "briefcase-outline",
          iconColor: "#C084FC",
          route: "/profile/portfolio/portfolio",
        },
        {
          id: "certificates",
          title: "Xác minh giấy tờ",
          icon: "ribbon-outline",
          iconColor: "#FBBF24",
          route: "/profile/personal-verification",
        },
      ],
    });
  }

  // — Preferences (all roles)
  sections.push({
    title: "Tùy chọn",
    items: [
      {
        id: "notifications",
        title: "Thông báo",
        icon: "notifications-outline",
        iconColor: "#F87171",
        route: "/notification-settings",
      },
      {
        id: "language",
        title: "Ngôn ngữ",
        icon: "globe-outline",
        iconColor: "#60A5FA",
        route: "/profile/language",
      },
      {
        id: "privacy",
        title: "Quyền riêng tư",
        icon: "eye-off-outline",
        iconColor: "#A78BFA",
        route: "/profile/settings",
      },
    ],
  });

  // — Admin extras
  if (role === "admin") {
    sections.push({
      title: "Quản trị",
      items: [
        {
          id: "user-mgmt",
          title: "Quản lý người dùng",
          icon: "people-outline",
          iconColor: "#F87171",
          route: "/profile/account-management",
        },
        {
          id: "system",
          title: "Cài đặt hệ thống",
          icon: "server-outline",
          iconColor: "#38BDF8",
          route: "/admin/settings",
        },
        {
          id: "crm",
          title: "CRM Settings",
          icon: "grid-outline",
          iconColor: "#34D399",
          route: "/crm/settings",
        },
      ],
    });
  }

  // — Support & About (all roles)
  sections.push({
    title: "Hỗ trợ",
    items: [
      {
        id: "support",
        title: "Trung tâm hỗ trợ",
        icon: "help-circle-outline",
        iconColor: "#22D3EE",
        route: "/customer-support",
      },
      {
        id: "referral",
        title: "Giới thiệu bạn bè",
        icon: "gift-outline",
        iconColor: "#FB923C",
        route: "/profile/rewards",
      },
      {
        id: "about",
        title: "Về ứng dụng",
        icon: "information-circle-outline",
        iconColor: "#94A3B8",
        route: "/profile/settings",
      },
    ],
  });

  return sections;
}
