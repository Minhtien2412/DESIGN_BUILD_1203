/**
 * User Search Service - Facebook Style
 * =====================================
 *
 * Tìm kiếm người dùng theo nhiều tiêu chí:
 * - Số điện thoại (với prefix quốc gia)
 * - Email
 * - Tên đầy đủ hoặc nickname
 * - Username
 *
 * Features:
 * - Fuzzy search cho tên
 * - Phone number normalization
 * - Search history
 * - Friend suggestions
 *
 * @author ThietKeResort Team
 * @created 2026-01-24
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";

// ==================== TYPES ====================

export type SearchType = "all" | "phone" | "email" | "name" | "username";

export interface UserSearchResult {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  avatar?: string;

  // Relationship
  isFriend?: boolean;
  isFollowing?: boolean;
  mutualFriends?: number;

  // Status
  online?: boolean;
  lastSeen?: string;
  verified?: boolean;

  // Role
  role?: string;
  company?: string;

  // Match info
  matchType?: SearchType;
  matchScore?: number;
}

export interface SearchSuggestion {
  type: "recent" | "friend" | "popular";
  user: UserSearchResult;
  reason?: string;
}

export interface SearchHistoryItem {
  query: string;
  type: SearchType;
  timestamp: string;
  result?: UserSearchResult;
}

export interface SearchResponse {
  users: UserSearchResult[];
  total: number;
  hasMore: boolean;
  suggestions?: UserSearchResult[];
}

// ==================== CONSTANTS ====================

const STORAGE_KEY = "user_search_history";
const MAX_HISTORY = 20;
const MIN_QUERY_LENGTH = 2;

// Vietnam phone prefixes
const VN_PREFIXES = ["84", "0"];
const VN_CARRIERS = ["03", "05", "07", "08", "09"];

// ==================== PHONE UTILITIES ====================

/**
 * Normalize phone number to standard format
 * Handles: +84, 84, 0, various formats
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, "");

  // Remove leading 84 or 0
  if (normalized.startsWith("84") && normalized.length > 9) {
    normalized = normalized.substring(2);
  }
  if (normalized.startsWith("0")) {
    normalized = normalized.substring(1);
  }

  // Add leading 0 back for local format
  return "0" + normalized;
}

/**
 * Check if string looks like a phone number
 */
export function isPhoneNumber(query: string): boolean {
  const cleaned = query.replace(/\D/g, "");

  // Must be at least 9 digits
  if (cleaned.length < 9) return false;

  // Check Vietnam mobile prefixes
  const prefix = cleaned.startsWith("84")
    ? cleaned.substring(2, 4)
    : cleaned.startsWith("0")
      ? cleaned.substring(0, 2)
      : cleaned.substring(0, 2);

  return VN_CARRIERS.some(
    (c) => prefix.startsWith(c.substring(1)) || prefix === c,
  );
}

/**
 * Check if string looks like an email
 */
export function isEmail(query: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(query);
}

/**
 * Detect search type from query
 */
export function detectSearchType(query: string): SearchType {
  if (isPhoneNumber(query)) return "phone";
  if (isEmail(query)) return "email";
  if (query.startsWith("@")) return "username";
  return "name";
}

// ==================== SEARCH FUNCTIONS ====================

/**
 * Search users by multiple criteria - Facebook style
 */
export async function searchUsers(
  query: string,
  options: {
    type?: SearchType;
    limit?: number;
    page?: number;
    includeNonFriends?: boolean;
  } = {},
): Promise<SearchResponse> {
  const {
    type = "all",
    limit = 20,
    page = 1,
    includeNonFriends = true,
  } = options;

  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return { users: [], total: 0, hasMore: false };
  }

  const searchType = type === "all" ? detectSearchType(query) : type;

  try {
    // Prepare search params
    const params = new URLSearchParams();
    params.append("q", query.trim());
    params.append("type", searchType);
    params.append("limit", limit.toString());
    params.append("page", page.toString());

    if (searchType === "phone") {
      params.append("phone", normalizePhoneNumber(query));
    }

    if (!includeNonFriends) {
      params.append("friendsOnly", "true");
    }

    console.log("[UserSearch] Searching:", { query, type: searchType });

    const response = await apiFetch<SearchResponse>(
      `/users/search?${params.toString()}`,
    );

    // Add match type info
    response.users = response.users.map((user) => ({
      ...user,
      matchType: searchType,
    }));

    console.log("[UserSearch] ✅ Found:", response.users.length, "users");
    return response;
  } catch (error) {
    console.warn("[UserSearch] API failed, using mock search:", error);
    return mockSearch(query, searchType, limit);
  }
}

/**
 * Search by phone number specifically
 */
export async function searchByPhone(
  phone: string,
): Promise<UserSearchResult | null> {
  const normalized = normalizePhoneNumber(phone);

  try {
    const response = await searchUsers(normalized, { type: "phone", limit: 1 });
    return response.users[0] || null;
  } catch {
    return null;
  }
}

/**
 * Search by email specifically
 */
export async function searchByEmail(
  email: string,
): Promise<UserSearchResult | null> {
  try {
    const response = await searchUsers(email, { type: "email", limit: 1 });
    return response.users[0] || null;
  } catch {
    return null;
  }
}

/**
 * Get friend suggestions based on mutual friends
 */
export async function getFriendSuggestions(
  limit = 10,
): Promise<SearchSuggestion[]> {
  try {
    const response = await apiFetch<{ suggestions: SearchSuggestion[] }>(
      `/users/suggestions?limit=${limit}`,
    );
    return response.suggestions;
  } catch {
    return MOCK_SUGGESTIONS.slice(0, limit);
  }
}

/**
 * Get people you may know (like Facebook)
 */
export async function getPeopleYouMayKnow(
  limit = 20,
): Promise<UserSearchResult[]> {
  try {
    const response = await apiFetch<{ users: UserSearchResult[] }>(
      `/users/people-you-may-know?limit=${limit}`,
    );
    return response.users;
  } catch {
    return MOCK_USERS.slice(0, limit);
  }
}

// ==================== SEARCH HISTORY ====================

/**
 * Save search to history
 */
export async function saveSearchHistory(
  query: string,
  type: SearchType,
  result?: UserSearchResult,
): Promise<void> {
  try {
    const history = await getSearchHistory();

    // Remove duplicate if exists
    const filtered = history.filter(
      (h) =>
        !(h.query.toLowerCase() === query.toLowerCase() && h.type === type),
    );

    // Add new entry at beginning
    const newEntry: SearchHistoryItem = {
      query,
      type,
      timestamp: new Date().toISOString(),
      result,
    };

    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("[UserSearch] Failed to save history:", error);
  }
}

/**
 * Get search history
 */
export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Clear search history
 */
export async function clearSearchHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn("[UserSearch] Failed to clear history");
  }
}

/**
 * Remove single item from history
 */
export async function removeFromHistory(query: string): Promise<void> {
  try {
    const history = await getSearchHistory();
    const updated = history.filter((h) => h.query !== query);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    console.warn("[UserSearch] Failed to remove from history");
  }
}

// ==================== MOCK DATA ====================

const MOCK_USERS: UserSearchResult[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    username: "nguyenvanan",
    email: "an.nguyen@email.com",
    phone: "0901234567",
    avatar: "https://i.pravatar.cc/150?img=1",
    isFriend: true,
    online: true,
    verified: true,
    role: "Kỹ sư",
    company: "Công ty ABC",
    mutualFriends: 15,
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    username: "tranthibinh",
    email: "binh.tran@email.com",
    phone: "0912345678",
    avatar: "https://i.pravatar.cc/150?img=2",
    isFriend: false,
    online: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    role: "Kiến trúc sư",
    mutualFriends: 8,
  },
  {
    id: "3",
    name: "Lê Văn Cường",
    username: "levancuong",
    email: "cuong.le@email.com",
    phone: "0923456789",
    avatar: "https://i.pravatar.cc/150?img=3",
    isFriend: true,
    online: true,
    verified: true,
    role: "Quản lý dự án",
    company: "Công ty XYZ",
    mutualFriends: 23,
  },
  {
    id: "4",
    name: "Phạm Thị Dung",
    username: "phamthidung",
    email: "dung.pham@email.com",
    phone: "0934567890",
    avatar: "https://i.pravatar.cc/150?img=4",
    isFriend: false,
    online: false,
    lastSeen: new Date(Date.now() - 86400000).toISOString(),
    role: "Designer",
    mutualFriends: 5,
  },
  {
    id: "5",
    name: "Hoàng Văn Em",
    username: "hoangvanem",
    email: "em.hoang@email.com",
    phone: "0945678901",
    avatar: "https://i.pravatar.cc/150?img=5",
    isFriend: true,
    online: false,
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    role: "Kỹ thuật viên",
    mutualFriends: 12,
  },
  {
    id: "6",
    name: "Vũ Thị Phương",
    username: "vuthiphuong",
    email: "phuong.vu@email.com",
    phone: "0956789012",
    avatar: "https://i.pravatar.cc/150?img=6",
    isFriend: false,
    online: true,
    role: "Khách hàng",
    mutualFriends: 3,
  },
  {
    id: "7",
    name: "Đặng Văn Giang",
    username: "dangvangiang",
    email: "giang.dang@email.com",
    phone: "0967890123",
    avatar: "https://i.pravatar.cc/150?img=7",
    isFriend: false,
    online: false,
    lastSeen: new Date(Date.now() - 172800000).toISOString(),
    role: "Nhà thầu",
    company: "Xây dựng DEF",
    mutualFriends: 7,
  },
  {
    id: "8",
    name: "Mai Thị Hoa",
    username: "maithihoa",
    email: "hoa.mai@email.com",
    phone: "0978901234",
    avatar: "https://i.pravatar.cc/150?img=8",
    isFriend: true,
    online: true,
    verified: true,
    role: "Giám đốc",
    company: "Công ty GHI",
    mutualFriends: 45,
  },
];

const MOCK_SUGGESTIONS: SearchSuggestion[] = [
  {
    type: "friend",
    user: MOCK_USERS[1],
    reason: "8 bạn chung",
  },
  {
    type: "friend",
    user: MOCK_USERS[3],
    reason: "5 bạn chung",
  },
  {
    type: "popular",
    user: MOCK_USERS[7],
    reason: "Người có ảnh hưởng",
  },
];

/**
 * Mock search function for offline/fallback
 */
function mockSearch(
  query: string,
  type: SearchType,
  limit: number,
): SearchResponse {
  const q = query.toLowerCase().trim();

  let filtered = MOCK_USERS.filter((user) => {
    switch (type) {
      case "phone":
        const normalizedQuery = normalizePhoneNumber(q);
        const normalizedPhone = user.phone
          ? normalizePhoneNumber(user.phone)
          : "";
        return normalizedPhone.includes(normalizedQuery.replace(/^0/, ""));

      case "email":
        return user.email.toLowerCase().includes(q);

      case "username":
        const username = q.startsWith("@") ? q.substring(1) : q;
        return user.username?.toLowerCase().includes(username);

      case "name":
      default:
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.phone?.includes(q.replace(/\D/g, "")) ||
          user.username?.toLowerCase().includes(q)
        );
    }
  });

  // Sort by match score (friends first, then by mutual friends)
  filtered.sort((a, b) => {
    if (a.isFriend && !b.isFriend) return -1;
    if (!a.isFriend && b.isFriend) return 1;
    return (b.mutualFriends || 0) - (a.mutualFriends || 0);
  });

  // Add match score
  filtered = filtered.map((user, index) => ({
    ...user,
    matchType: type,
    matchScore: 100 - index * 10,
  }));

  return {
    users: filtered.slice(0, limit),
    total: filtered.length,
    hasMore: filtered.length > limit,
    suggestions: MOCK_USERS.filter((u) => !filtered.includes(u)).slice(0, 3),
  };
}

// ==================== EXPORTS ====================

export { MOCK_SUGGESTIONS, MOCK_USERS };

