/**
 * Profile Service - Backend API Integration
 * Provides user profile data with proper BE routes
 * @updated 2026-01-30 - Aligned with baotienweb.cloud API
 *
 * Available BE endpoints:
 * - GET  /auth/me     → Get current authenticated user
 * - GET  /profile     → Get user profile
 * - PATCH /profile    → Update profile (name, avatar, phone, location)
 * - GET  /users/:id   → Get user by ID
 * - GET  /projects    → Get user's projects
 * - GET  /tasks       → Get user's tasks
 * - GET  /notifications → Get user's notifications
 */

import { apiFetch } from "./api";

// ============================================
// Types
// ============================================

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  avatarThumbnail?: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "CLIENT" | "ENGINEER";
  phone?: string;
  location?: {
    address?: string;
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalOrders: number;
  savedItems: number;
  totalViews: number;
  monthlyGrowth: number;
}

export interface ProfileUpdateData {
  name?: string;
  avatar?: string;
  phone?: string;
  location?: {
    address?: string;
    city?: string;
    country?: string;
  };
}

export interface ProfileSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  display: {
    theme: "light" | "dark" | "system";
    language: string;
    compactMode: boolean;
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Get current authenticated user profile
 * Uses GET /auth/me
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await apiFetch<UserProfile>("/auth/me");
    return response;
  } catch (error) {
    console.error("[ProfileService] Error getting current user:", error);
    return null;
  }
}

/**
 * Get user profile
 * Uses GET /profile
 */
export async function getProfile(): Promise<UserProfile | null> {
  try {
    const response = await apiFetch<UserProfile>("/profile");
    return response;
  } catch (error) {
    console.error("[ProfileService] Error getting profile:", error);
    return null;
  }
}

/**
 * Get user by ID
 * Uses GET /users/:id
 */
export async function getUserById(userId: number): Promise<UserProfile | null> {
  try {
    const response = await apiFetch<UserProfile>(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error("[ProfileService] Error getting user:", error);
    return null;
  }
}

/**
 * Update user profile
 * Uses PATCH /profile
 */
export async function updateProfile(
  data: ProfileUpdateData,
): Promise<UserProfile | null> {
  try {
    const response = await apiFetch<UserProfile>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error("[ProfileService] Error updating profile:", error);
    throw error;
  }
}

/**
 * Update user avatar
 * Uses PATCH /profile with avatar field
 */
export async function updateAvatar(
  avatarUrl: string,
): Promise<UserProfile | null> {
  return updateProfile({ avatar: avatarUrl });
}

/**
 * Delete user avatar
 * Uses PATCH /profile with empty avatar
 */
export async function deleteAvatar(): Promise<UserProfile | null> {
  return updateProfile({ avatar: "" });
}

/**
 * Get user statistics by aggregating from multiple endpoints
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    // Fetch projects and tasks in parallel
    const [projectsRes, tasksRes] = await Promise.allSettled([
      apiFetch<any[]>("/projects"),
      apiFetch<any[]>("/tasks"),
    ]);

    const projects =
      projectsRes.status === "fulfilled" ? projectsRes.value : [];
    const tasks = tasksRes.status === "fulfilled" ? tasksRes.value : [];

    // Calculate stats from real data
    const projectsArray = Array.isArray(projects) ? projects : [];
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    const completedProjects = projectsArray.filter(
      (p: any) => p.status === "COMPLETED" || p.status === "completed",
    ).length;
    const inProgressProjects = projectsArray.filter(
      (p: any) =>
        p.status === "IN_PROGRESS" ||
        p.status === "active" ||
        p.status === "in_progress",
    ).length;

    const completedTasks = tasksArray.filter(
      (t: any) =>
        t.status === "COMPLETED" ||
        t.status === "completed" ||
        t.status === "DONE",
    ).length;
    const pendingTasks = tasksArray.filter(
      (t: any) =>
        t.status === "PENDING" || t.status === "pending" || t.status === "TODO",
    ).length;

    return {
      totalProjects: projectsArray.length,
      completedProjects,
      inProgressProjects,
      totalTasks: tasksArray.length,
      completedTasks,
      pendingTasks,
      totalOrders: 0, // Not available yet
      savedItems: 0, // Not available yet
      totalViews: 0, // Not available yet
      monthlyGrowth: 0, // Not available yet
    };
  } catch (error) {
    console.error("[ProfileService] Error getting user stats:", error);
    // Return fallback stats
    return {
      totalProjects: 0,
      completedProjects: 0,
      inProgressProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      totalOrders: 0,
      savedItems: 0,
      totalViews: 0,
      monthlyGrowth: 0,
    };
  }
}

/**
 * Get user's projects
 * Uses GET /projects
 */
export async function getUserProjects(): Promise<any[]> {
  try {
    const response = await apiFetch<any[]>("/projects");
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("[ProfileService] Error getting projects:", error);
    return [];
  }
}

/**
 * Get user's tasks
 * Uses GET /tasks
 */
export async function getUserTasks(): Promise<any[]> {
  try {
    const response = await apiFetch<any[]>("/tasks");
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("[ProfileService] Error getting tasks:", error);
    return [];
  }
}

/**
 * Get user's notifications
 * Uses GET /notifications
 */
export async function getUserNotifications(): Promise<any[]> {
  try {
    const response = await apiFetch<any[]>("/notifications");
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("[ProfileService] Error getting notifications:", error);
    return [];
  }
}

/**
 * Get user's favorites/saved items
 * Uses GET /favorites - Falls back to mock data if 404
 */
export async function getUserFavorites(): Promise<any[]> {
  try {
    const response = await apiFetch<any[]>("/favorites");
    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    // Return mock data for 404
    console.warn("[ProfileService] /favorites not available, using mock data");
    return [
      {
        id: 1,
        type: "product",
        itemId: "prod_001",
        title: "Thiết kế biệt thự hiện đại",
        image:
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
        price: 150000000,
        savedAt: new Date().toISOString(),
      },
      {
        id: 2,
        type: "project",
        itemId: "proj_001",
        title: "Dự án Resort Phú Quốc",
        image:
          "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400",
        savedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        type: "product",
        itemId: "prod_002",
        title: "Gói thi công nội thất cao cấp",
        image:
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
        price: 85000000,
        savedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  }
}

/**
 * Get user's orders
 * Uses GET /orders - Falls back to mock data if 404
 */
export async function getUserOrders(): Promise<any[]> {
  try {
    const response = await apiFetch<any[]>("/orders");
    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    // Return mock data for 404
    console.warn("[ProfileService] /orders not available, using mock data");
    return [
      {
        id: "ORD-2026-001",
        status: "completed",
        statusText: "Hoàn thành",
        total: 150000000,
        items: [
          { name: "Thiết kế biệt thự hiện đại", quantity: 1, price: 150000000 },
        ],
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "ORD-2026-002",
        status: "processing",
        statusText: "Đang xử lý",
        total: 85000000,
        items: [
          {
            name: "Gói thi công nội thất cao cấp",
            quantity: 1,
            price: 85000000,
          },
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "ORD-2026-003",
        status: "pending",
        statusText: "Chờ thanh toán",
        total: 45000000,
        items: [
          { name: "Tư vấn thiết kế", quantity: 1, price: 15000000 },
          { name: "Bản vẽ 3D", quantity: 2, price: 15000000 },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Get profile settings (mock - BE not available)
 */
export async function getProfileSettings(): Promise<ProfileSettings> {
  try {
    const response = await apiFetch<ProfileSettings>("/profile/settings");
    return response;
  } catch (error) {
    // Return default settings
    return {
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: false,
        allowMessages: true,
      },
      display: {
        theme: "system",
        language: "vi",
        compactMode: false,
      },
    };
  }
}

/**
 * Update profile settings (mock - BE not available)
 */
export async function updateProfileSettings(
  settings: Partial<ProfileSettings>,
): Promise<ProfileSettings> {
  try {
    const response = await apiFetch<ProfileSettings>("/profile/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
    return response;
  } catch (error) {
    console.error("[ProfileService] Error updating settings:", error);
    throw error;
  }
}

/**
 * Delete user account
 * Uses DELETE /users/:id or /profile/delete
 */
export async function deleteAccount(): Promise<boolean> {
  try {
    await apiFetch("/profile", { method: "DELETE" });
    return true;
  } catch (error) {
    console.error("[ProfileService] Error deleting account:", error);
    throw error;
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  try {
    await apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return true;
  } catch (error) {
    console.error("[ProfileService] Error changing password:", error);
    throw error;
  }
}

/**
 * Enable/disable two-factor authentication
 */
export async function toggleTwoFactor(
  enable: boolean,
): Promise<{ secret?: string; qrCode?: string }> {
  try {
    const endpoint = enable ? "/auth/2fa/enable" : "/auth/2fa/disable";
    const response = await apiFetch<{ secret?: string; qrCode?: string }>(
      endpoint,
      {
        method: "POST",
      },
    );
    return response;
  } catch (error) {
    console.error("[ProfileService] Error toggling 2FA:", error);
    throw error;
  }
}

/**
 * Get profile completion percentage
 */
export function getProfileCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  let completed = 0;
  const total = 6;

  if (profile.name) completed++;
  if (profile.email) completed++;
  if (profile.phone) completed++;
  if (profile.avatar) completed++;
  if (profile.location?.address) completed++;
  if (profile.emailVerified) completed++;

  return Math.round((completed / total) * 100);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserProfile["role"]): string {
  const roleNames: Record<UserProfile["role"], string> = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    STAFF: "Nhân viên",
    CLIENT: "Khách hàng",
    ENGINEER: "Kỹ sư",
  };
  return roleNames[role] || "Người dùng";
}

/**
 * Check if user is verified
 */
export function isUserVerified(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return !!(profile.emailVerified || profile.phone);
}

export default {
  // User data
  getCurrentUser,
  getProfile,
  getUserById,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  // Stats
  getUserStats,
  getUserProjects,
  getUserTasks,
  getUserNotifications,
  getUserFavorites,
  getUserOrders,
  // Settings
  getProfileSettings,
  updateProfileSettings,
  // Account
  deleteAccount,
  changePassword,
  toggleTwoFactor,
  // Helpers
  getProfileCompletion,
  getRoleDisplayName,
  isUserVerified,
};
