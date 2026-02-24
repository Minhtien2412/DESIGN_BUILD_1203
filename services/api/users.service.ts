/**
 * Users API Service
 * Connects to real backend database for user profiles, sellers, and authentication
 * Fallback to mock data when API unavailable
 */

import { apiFetch } from "../api";

const BASE_PATH = "/users";

// ==================== TYPES ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role:
    | "CLIENT"
    | "ENGINEER"
    | "ADMIN"
    | "SELLER"
    | "CONTRACTOR"
    | "ARCHITECT"
    | "DESIGNER"
    | "WORKER";
  verified?: boolean;

  // Profile info
  bio?: string;
  company?: string;
  position?: string;
  address?: string;

  // Stats
  rating?: number; // 0-5
  reviewCount?: number;
  projectsCount?: number;
  yearsExperience?: number;

  // Social
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;

  // Status
  online?: boolean;
  lastSeen?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  // Extended profile data
  skills?: string[];
  certifications?: string[];
  portfolio?: string[];
  languages?: string[];

  // Business info (for sellers/contractors)
  businessName?: string;
  businessType?: "individual" | "company";
  taxId?: string;
  licenseNumber?: string;
  website?: string;

  // Verification
  identityVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  verified?: boolean;
  search?: string;
  sortBy?: "name" | "rating" | "projects" | "newest";
  sortOrder?: "asc" | "desc";
}

// ==================== API FUNCTIONS ====================

/**
 * Get user profile by ID from database
 */
export async function getUserById(userId: string): Promise<UserProfile> {
  try {
    console.log("[UsersService] Fetching user:", userId);

    const user = await apiFetch<UserProfile>(`${BASE_PATH}/${userId}`, {
      method: "GET",
    });

    console.log("[UsersService] ✅ User loaded from database:", user.name);
    return user;
  } catch (error) {
    console.warn("[UsersService] ⚠️ API failed, using mock data:", error);

    // Fallback to mock data
    return getMockUser(userId);
  }
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    console.log("[UsersService] Fetching current user");

    const user = await apiFetch<UserProfile>(`${BASE_PATH}/me`, {
      method: "GET",
    });

    console.log("[UsersService] ✅ Current user loaded:", user.name);
    return user;
  } catch (error) {
    console.warn("[UsersService] ⚠️ API failed, using mock data");

    // Fallback to mock data
    return getMockUser("current");
  }
}

/**
 * Get list of users with filters
 */
export async function getUsers(
  params: UserQueryParams = {},
): Promise<UsersListResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.role) queryParams.append("role", params.role);
    if (params.verified !== undefined)
      queryParams.append("verified", params.verified.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

    console.log("[UsersService] Fetching users list");

    const response = await apiFetch<UsersListResponse>(url, {
      method: "GET",
    });

    console.log(
      "[UsersService] ✅ Users loaded from database:",
      response.users.length,
    );
    return response;
  } catch (error) {
    console.warn("[UsersService] ⚠️ API failed, using mock data");

    // Fallback to mock data
    return getMockUsersList(params);
  }
}

/**
 * Search users by name, email, or company
 */
export async function searchUsers(
  keyword: string,
  limit: number = 10,
): Promise<User[]> {
  try {
    console.log("[UsersService] Searching users:", keyword);

    const response = await apiFetch<{ users: User[] }>(
      `${BASE_PATH}/search?q=${encodeURIComponent(keyword)}&limit=${limit}`,
      { method: "GET" },
    );

    console.log("[UsersService] ✅ Search results:", response.users.length);
    return response.users;
  } catch (error) {
    console.warn("[UsersService] ⚠️ API failed, using mock data");

    // Fallback to mock data
    const mockUsers = MOCK_USERS_DB.filter(
      (u) =>
        u.name.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email.toLowerCase().includes(keyword.toLowerCase()) ||
        u.company?.toLowerCase().includes(keyword.toLowerCase()),
    );

    return mockUsers.slice(0, limit);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  try {
    console.log("[UsersService] Updating user:", userId);

    const user = await apiFetch<UserProfile>(`${BASE_PATH}/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    console.log("[UsersService] ✅ User updated:", user.name);
    return user;
  } catch (error) {
    console.error("[UsersService] ❌ Failed to update user:", error);
    throw error;
  }
}

/**
 * Get user's connections (friends/followers)
 */
export async function getUserConnections(userId: string): Promise<User[]> {
  try {
    console.log("[UsersService] Fetching connections for:", userId);

    const response = await apiFetch<{ users: User[] }>(
      `${BASE_PATH}/${userId}/connections`,
      {
        method: "GET",
      },
    );

    console.log("[UsersService] ✅ Connections loaded:", response.users.length);
    return response.users;
  } catch (error) {
    console.warn("[UsersService] ⚠️ API failed, using mock data");

    // Return random mock users as connections
    return MOCK_USERS_DB.slice(0, 5);
  }
}

/**
 * Follow/unfollow user
 */
export async function toggleFollowUser(
  userId: string,
  follow: boolean,
): Promise<void> {
  try {
    console.log("[UsersService] Toggle follow:", userId, follow);

    await apiFetch<void>(
      `${BASE_PATH}/${userId}/${follow ? "follow" : "unfollow"}`,
      {
        method: "POST",
      },
    );

    console.log("[UsersService] ✅ Follow toggled successfully");
  } catch (error) {
    console.error("[UsersService] ❌ Failed to toggle follow:", error);
    throw error;
  }
}

// ==================== MOCK DATA FALLBACK ====================

const MOCK_USERS_DB: UserProfile[] = [
  {
    id: "1",
    email: "nguyenvana@email.com",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    role: "ENGINEER",
    verified: true,
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Kỹ sư trưởng chuyên về thiết kế và thi công biệt thự cao cấp",
    company: "Công ty Xây dựng ABC",
    position: "Kỹ sư trưởng",
    rating: 4.8,
    reviewCount: 127,
    projectsCount: 25,
    yearsExperience: 10,
    followersCount: 1250,
    followingCount: 340,
    friendsCount: 89,
    online: true,
    skills: ["Thiết kế kiến trúc", "Quản lý dự án", "AutoCAD", "Revit"],
    certifications: ["Kỹ sư xây dựng hạng 1", "PMP"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "2",
    email: "tranthib@company.vn",
    name: "Trần Thị B",
    phone: "0987654321",
    role: "CONTRACTOR",
    verified: true,
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "Nhà thầu uy tín với 15 năm kinh nghiệm",
    company: "Công ty TNHH Xây dựng XYZ",
    businessType: "company",
    position: "Giám đốc",
    rating: 4.9,
    reviewCount: 203,
    projectsCount: 78,
    yearsExperience: 15,
    followersCount: 2100,
    followingCount: 450,
    friendsCount: 156,
    online: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    skills: ["Thi công xây dựng", "Quản lý nhân sự", "Giám sát công trình"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "3",
    email: "phamvanc@design.vn",
    name: "Phạm Văn C",
    phone: "0912345678",
    role: "ENGINEER",
    verified: true,
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Chuyên gia thiết kế nội thất hiện đại",
    company: "Studio Design C",
    position: "Kiến trúc sư",
    rating: 4.7,
    reviewCount: 89,
    projectsCount: 42,
    yearsExperience: 8,
    followersCount: 890,
    followingCount: 210,
    friendsCount: 67,
    online: true,
    skills: ["Thiết kế nội thất", "3D Max", "SketchUp", "Photoshop"],
    certifications: ["Kiến trúc sư hạng 2"],
    identityVerified: true,
    emailVerified: true,
  },
  {
    id: "ai-assistant",
    email: "ai@baotienweb.cloud",
    name: "AI Trợ lý Xây dựng",
    role: "ADMIN",
    verified: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ai",
    bio: "Trợ lý AI thông minh, hỗ trợ 24/7 về tư vấn xây dựng, báo giá và quản lý dự án",
    company: "BaoTienWeb Platform",
    position: "AI Assistant",
    online: true,
    skills: [
      "Tư vấn xây dựng",
      "Báo giá tự động",
      "Theo dõi tiến độ",
      "Phân tích dữ liệu",
    ],
  },
  {
    id: "customer-service",
    email: "support@baotienweb.cloud",
    name: "Nhân viên CSKH",
    phone: "1900 6789",
    role: "ADMIN",
    verified: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
    bio: "Đội ngũ chăm sóc khách hàng chuyên nghiệp, giải đáp mọi thắc mắc",
    company: "BaoTienWeb Support",
    position: "Customer Service",
    online: true,
  },
  // ======= Community Authors (mapped to community feed) =======
  {
    id: "author-tuan",
    email: "tuan.thau@email.com",
    name: "Anh Tuấn - Thầu XD",
    phone: "0909111222",
    role: "CONTRACTOR",
    verified: true,
    avatar: "https://ui-avatars.com/api/?name=AT&background=0D9488&color=fff",
    bio: "Nhà thầu xây dựng uy tín, chuyên biệt thự cao cấp & resort. 12 năm kinh nghiệm, đã thi công 200+ công trình.",
    company: "Công ty TNHH Xây dựng Tuấn Phát",
    position: "Giám đốc",
    rating: 4.8,
    reviewCount: 156,
    projectsCount: 45,
    yearsExperience: 12,
    followersCount: 3200,
    followingCount: 280,
    friendsCount: 120,
    online: true,
    skills: [
      "Thi công biệt thự",
      "Quản lý dự án",
      "Giám sát công trình",
      "Xây dựng resort",
    ],
    certifications: ["Chứng chỉ nhà thầu hạng 2", "ISO 9001"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "author-minh",
    email: "minhduc.kts@design.vn",
    name: "KTS Minh Đức",
    phone: "0903222333",
    role: "ARCHITECT",
    verified: true,
    avatar: "https://ui-avatars.com/api/?name=MD&background=8B5CF6&color=fff",
    bio: "Kiến trúc sư sáng tạo, chuyên thiết kế villa & resort phong cách Scandinavian, Wabi-sabi. Đã thiết kế 100+ công trình.",
    company: "MD Design Studio",
    position: "Kiến trúc sư trưởng",
    rating: 4.9,
    reviewCount: 210,
    projectsCount: 85,
    yearsExperience: 15,
    followersCount: 5600,
    followingCount: 340,
    friendsCount: 95,
    online: true,
    skills: [
      "Thiết kế kiến trúc",
      "AutoCAD",
      "SketchUp",
      "Revit",
      "3D Visualization",
    ],
    certifications: ["Kiến trúc sư hạng 1", "LEED Certified"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
    website: "https://mddesign.vn",
  },
  {
    id: "author-binh",
    email: "binh.vlxd@gmail.com",
    name: "Thầu Bình - VLXD",
    phone: "0907333444",
    role: "SELLER",
    verified: false,
    avatar: "https://ui-avatars.com/api/?name=TB&background=EF4444&color=fff",
    bio: "Đại lý vật liệu xây dựng chính hãng: Thép Hòa Phát, Xi măng Hà Tiên, Gạch Đồng Tâm. Giao hàng tận công trình.",
    company: "Đại lý VLXD Bình Phát",
    businessType: "company",
    position: "Chủ đại lý",
    rating: 4.5,
    reviewCount: 89,
    projectsCount: 0,
    yearsExperience: 8,
    followersCount: 1800,
    followingCount: 450,
    friendsCount: 200,
    online: false,
    lastSeen: new Date(Date.now() - 1800000).toISOString(),
    skills: ["Cung cấp VLXD", "Tư vấn vật liệu", "Báo giá nhanh"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "author-hoa",
    email: "hoa.noithat@outlook.com",
    name: "Chị Hoa - Nội thất",
    phone: "0908444555",
    role: "DESIGNER",
    verified: true,
    avatar: "https://ui-avatars.com/api/?name=CH&background=F59E0B&color=fff",
    bio: "Thiết kế nội thất cao cấp, phong cách hiện đại & tối giản. Chuyên tư vấn hoàn thiện nội thất biệt thự, căn hộ.",
    company: "Hoa Interior Design",
    position: "Giám đốc sáng tạo",
    rating: 4.7,
    reviewCount: 134,
    projectsCount: 60,
    yearsExperience: 10,
    followersCount: 4100,
    followingCount: 520,
    friendsCount: 78,
    online: true,
    skills: [
      "Nội thất cao cấp",
      "3D Max",
      "Photoshop",
      "SketchUp",
      "Feng Shui",
    ],
    certifications: ["Interior Designer Certificate"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "author-dung",
    email: "dung.ksxd@email.com",
    name: "Eng. Dũng KSXD",
    phone: "0906555666",
    role: "ENGINEER",
    verified: true,
    avatar: "https://ui-avatars.com/api/?name=ED&background=3B82F6&color=fff",
    bio: "Kỹ sư xây dựng chuyên giám sát kết cấu, nền móng. Kiểm định công trình theo tiêu chuẩn TCVN.",
    company: "Công ty TNHH Kỹ thuật Dũng Phát",
    position: "Kỹ sư trưởng",
    rating: 4.6,
    reviewCount: 98,
    projectsCount: 35,
    yearsExperience: 9,
    followersCount: 2400,
    followingCount: 310,
    friendsCount: 88,
    online: true,
    skills: ["Giám sát kết cấu", "Kiểm định công trình", "AutoCAD", "SAP2000"],
    certifications: ["Kỹ sư xây dựng hạng 1", "Giám sát trưởng"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "author-phuquoc",
    email: "tho.phuquoc@gmail.com",
    name: "Đội thợ Phú Quốc",
    phone: "0905666777",
    role: "WORKER",
    verified: false,
    avatar: "https://ui-avatars.com/api/?name=PQ&background=10B981&color=fff",
    bio: "Đội thi công chuyên nghiệp tại Phú Quốc. Xây dựng resort, homestay, nhà phố. Đội ngũ 20+ thợ lành nghề.",
    company: "Đội XD Phú Quốc",
    position: "Đốc công",
    rating: 4.4,
    reviewCount: 45,
    projectsCount: 18,
    yearsExperience: 7,
    followersCount: 890,
    followingCount: 150,
    friendsCount: 60,
    online: false,
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    skills: ["Xây dựng resort", "Thi công homestay", "Hoàn thiện"],
    identityVerified: false,
    emailVerified: true,
  },
  {
    id: "author-antoan",
    email: "antoan.ld@safety.vn",
    name: "An toàn LĐ Việt",
    phone: "0904777888",
    role: "ENGINEER",
    verified: true,
    avatar: "https://ui-avatars.com/api/?name=AV&background=DC2626&color=fff",
    bio: "Chuyên gia an toàn lao động, giám sát ATLĐ công trình xây dựng. Đào tạo an toàn cho hơn 500 công nhân.",
    company: "Công ty An Toàn LĐ Việt",
    position: "Giám sát trưởng ATLĐ",
    rating: 4.8,
    reviewCount: 67,
    projectsCount: 28,
    yearsExperience: 11,
    followersCount: 3100,
    followingCount: 200,
    friendsCount: 45,
    online: true,
    skills: [
      "Giám sát ATLĐ",
      "Đào tạo an toàn",
      "Kiểm tra PPE",
      "Đánh giá rủi ro",
    ],
    certifications: ["Chứng chỉ ATLĐ nhóm 1", "ISO 45001"],
    identityVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "author-sonha",
    email: "sonha@paint.vn",
    name: "Sơn Hà Paint",
    phone: "0903888999",
    role: "SELLER",
    verified: false,
    avatar: "https://ui-avatars.com/api/?name=SH&background=6366F1&color=fff",
    bio: "Nhà phân phối sơn chính hãng: Dulux, Jotun, Nippon Paint. Tư vấn chọn sơn miễn phí, giao hàng toàn quốc.",
    company: "Sơn Hà Paint Co.",
    businessType: "company",
    position: "Quản lý kinh doanh",
    rating: 4.3,
    reviewCount: 72,
    followersCount: 1500,
    followingCount: 380,
    friendsCount: 95,
    online: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    skills: ["Tư vấn sơn", "Phối màu", "Sơn ngoại thất", "Sơn nội thất"],
    identityVerified: true,
    emailVerified: true,
  },
];

/**
 * Get mock user for fallback
 */
function getMockUser(userId: string): UserProfile {
  const user = MOCK_USERS_DB.find((u) => u.id === userId);

  if (user) return user;

  // Generate random mock user if not found
  return {
    id: userId,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    role: "CLIENT",
    avatar: `https://i.pravatar.cc/150?img=${parseInt(userId) % 70}`,
    rating: 4.0 + Math.random(),
    reviewCount: Math.floor(Math.random() * 50),
    projectsCount: Math.floor(Math.random() * 10),
    online: Math.random() > 0.5,
    verified: Math.random() > 0.3,
  };
}

/**
 * Get mock users list for fallback
 */
function getMockUsersList(params: UserQueryParams): UsersListResponse {
  let filtered = [...MOCK_USERS_DB];

  // Apply filters
  if (params.role) {
    filtered = filtered.filter((u) => u.role === params.role);
  }

  if (params.verified !== undefined) {
    filtered = filtered.filter((u) => u.verified === params.verified);
  }

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.company?.toLowerCase().includes(search),
    );
  }

  // Apply sorting
  if (params.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (params.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rating":
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case "projects":
          comparison = (b.projectsCount || 0) - (a.projectsCount || 0);
          break;
      }

      return params.sortOrder === "desc" ? -comparison : comparison;
    });
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total: filtered.length,
    page,
    limit,
    hasMore: endIndex < filtered.length,
  };
}

// ==================== EXPORTS ====================

export { MOCK_USERS_DB };
