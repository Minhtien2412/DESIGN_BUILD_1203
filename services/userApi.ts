/**
 * User API Service
 *
 * Production Backend: https://baotienweb.cloud/api/v1
 * Endpoints: User management (5 endpoints) + Profile operations
 *
 * Created: Nov 24, 2025
 * Updated: Dec 22, 2025 - Added avatar upload support per BACKEND_API_SPECS
 * Status: ✅ Production Ready
 */

import type {
    CreateUserData,
    UpdateUserData,
    User,
    UserFilters,
    UserListResponse,
} from "@/types/core";
import { del, get, post, put } from "./apiClient";

// Re-export profile API functions for convenience
export {
    deleteAvatar,
    getAvatarUrl,
    getProfile,
    isValidDateOfBirth,
    isValidVietnamesePhone,
    updateProfile,
    uploadAvatar
} from "./profileApi";

// ============================================================================
// TYPES & INTERFACES (Re-exported from core)
// ============================================================================

export type {
    CreateUserData,
    UpdateUserData,
    User,
    UserFilters,
    UserListResponse
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get List of Users (Admin only)
 *
 * Endpoint: GET /users
 * Access: Admin only
 *
 * @param {UserFilters} filters - Filter and pagination options
 * @returns {Promise<UserListResponse>} List of users with pagination
 * @throws {ApiError} If request fails
 *
 * @example
 * const users = await getUsers({ role: 'engineer', limit: 10 });
 * console.log(`Found ${users.total} engineers`);
 */
export async function getUsers(
  filters?: UserFilters,
): Promise<UserListResponse> {
  console.log("[UserAPI] 👥 Fetching users list...", filters || {});

  try {
    // Build query string
    const params = new URLSearchParams();
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined)
      params.append("isActive", String(filters.isActive));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";

    console.log("[UserAPI] 📡 Request:", endpoint);

    const data = await get<UserListResponse>(endpoint);

    console.log("[UserAPI] ✅ Users fetched successfully:", {
      total: data.total,
      count: data.users.length,
      page: data.page,
      hasMore: data.hasMore,
    });

    return data;
  } catch (error) {
    console.error("[UserAPI] ❌ Failed to fetch users:", error);
    throw error;
  }
}

/**
 * Get User by ID
 *
 * Endpoint: GET /users/{id}
 * Access: All authenticated users (own profile) or Admin
 *
 * @param {number} id - User ID
 * @returns {Promise<User>} User details
 * @throws {ApiError} If request fails
 *
 * @example
 * const user = await getUser(123);
 * console.log(`User: ${user.name} (${user.email})`);
 */
export async function getUser(id: number): Promise<User> {
  console.log(`[UserAPI] 🔍 Fetching user by ID: ${id}`);

  try {
    const data = await get<User>(`/users/${id}`);

    console.log("[UserAPI] ✅ User fetched successfully:", {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    });

    return data;
  } catch (error) {
    console.error(`[UserAPI] ❌ Failed to fetch user ${id}:`, error);
    throw error;
  }
}

/**
 * Create New User (Admin only)
 *
 * Endpoint: POST /users
 * Access: Admin only
 *
 * @param {CreateUserData} userData - User data
 * @returns {Promise<User>} Created user
 * @throws {ApiError} If request fails
 *
 * @example
 * const newUser = await createUser({
 *   email: 'engineer@example.com',
 *   password: 'SecurePass123',
 *   name: 'John Doe',
 *   role: 'engineer',
 * });
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  console.log("[UserAPI] ➕ Creating new user...", {
    email: userData.email,
    role: userData.role,
  });

  try {
    const data = await post<User>("/users", userData);

    console.log("[UserAPI] ✅ User created successfully:", {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    });

    return data;
  } catch (error) {
    console.error("[UserAPI] ❌ Failed to create user:", error);
    throw error;
  }
}

/**
 * Update User Profile
 *
 * Endpoint: PUT /users/{id}
 * Access: Own profile or Admin
 *
 * @param {number} id - User ID
 * @param {UpdateUserData} updates - Fields to update
 * @returns {Promise<User>} Updated user
 * @throws {ApiError} If request fails
 *
 * @example
 * const updated = await updateUser(123, {
 *   name: 'Jane Doe',
 *   phone: '+84901234567',
 * });
 */
export async function updateUser(
  id: number,
  updates: UpdateUserData,
): Promise<User> {
  console.log(`[UserAPI] ✏️ Updating user ${id}...`, Object.keys(updates));

  try {
    const data = await put<User>(`/users/${id}`, updates);

    console.log("[UserAPI] ✅ User updated successfully:", {
      id: data.id,
      updatedFields: Object.keys(updates),
    });

    return data;
  } catch (error) {
    console.error(`[UserAPI] ❌ Failed to update user ${id}:`, error);
    throw error;
  }
}

/**
 * Delete User (Admin only)
 *
 * Endpoint: DELETE /users/{id}
 * Access: Admin only
 *
 * @param {number} id - User ID to delete
 * @returns {Promise<void>}
 * @throws {ApiError} If request fails
 *
 * @example
 * await deleteUser(123);
 * console.log('User deleted');
 */
export async function deleteUser(id: number): Promise<void> {
  console.log(`[UserAPI] 🗑️ Deleting user ${id}...`);

  try {
    await del(`/users/${id}`);

    console.log(`[UserAPI] ✅ User ${id} deleted successfully`);
  } catch (error) {
    console.error(`[UserAPI] ❌ Failed to delete user ${id}:`, error);
    throw error;
  }
}

/**
 * Change Password
 *
 * Endpoint: POST /users/change-password (per API docs)
 *
 * @param {number} _userId - User ID (kept for backwards compatibility but not used in endpoint)
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export async function changePassword(
  _userId: number,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  console.log("[UserAPI] 🔒 Changing password...");

  try {
    // API endpoint: POST /users/change-password (no userId in path)
    await post("/users/change-password", {
      currentPassword: oldPassword, // Field name per API docs
      newPassword,
    });

    console.log("[UserAPI] ✅ Password changed successfully");
  } catch (error) {
    console.error("[UserAPI] ❌ Failed to change password:", error);
    throw error;
  }
}
