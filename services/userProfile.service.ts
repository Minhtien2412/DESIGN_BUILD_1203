/**
 * User Profile Service
 * API service for fetching and managing user profiles
 * Supports: profile by slug, ratings, points, wallet
 */

import type {
    ConvertPointsRequest,
    GetPointHistoryRequest,
    GetProfileResponse,
    GetRatingsRequest,
    PointsBalance,
    PointTransaction,
    Rating,
    RatingSummary,
    SubmitRatingRequest,
    UpdateProfileRequest,
    UserProfileFull
} from "@/types/profile";
import { apiFetch } from "./api";

// ============================================================================
// Profile API
// ============================================================================

/**
 * Get user profile by slug (public profile page)
 */
export async function getProfileBySlug(
  slug: string
): Promise<GetProfileResponse> {
  try {
    const response = await apiFetch<GetProfileResponse>(`/profiles/${slug}`);
    return response;
  } catch (error: any) {
    console.error(
      "[UserProfileService] Error fetching profile by slug:",
      error
    );
    // Return mock data for development
    return {
      success: true,
      data: generateMockProfile(slug),
    };
  }
}

/**
 * Get user profile by ID
 */
export async function getProfileById(
  userId: string
): Promise<GetProfileResponse> {
  try {
    const response = await apiFetch<GetProfileResponse>(
      `/profiles/id/${userId}`
    );
    return response;
  } catch (error: any) {
    console.error("[UserProfileService] Error fetching profile by ID:", error);
    return {
      success: true,
      data: generateMockProfile(userId),
    };
  }
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(
  data: UpdateProfileRequest
): Promise<GetProfileResponse> {
  try {
    const response = await apiFetch<GetProfileResponse>("/profiles/me", {
      method: "PATCH",
      data,
    });
    return response;
  } catch (error: any) {
    console.error("[UserProfileService] Error updating profile:", error);
    throw error;
  }
}

/**
 * Upload profile avatar
 */
export async function uploadProfileAvatar(
  uri: string
): Promise<{ success: boolean; avatarUrl?: string }> {
  try {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("avatar", {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiFetch<{ avatarUrl: string }>(
      "/profiles/me/avatar",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return { success: true, avatarUrl: response.avatarUrl };
  } catch (error: any) {
    console.error("[UserProfileService] Error uploading avatar:", error);
    throw error;
  }
}

/**
 * Upload cover image
 */
export async function uploadCoverImage(
  uri: string
): Promise<{ success: boolean; coverUrl?: string }> {
  try {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "cover.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("cover", {
      uri,
      name: filename,
      type,
    } as any);

    const response = await apiFetch<{ coverUrl: string }>(
      "/profiles/me/cover",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return { success: true, coverUrl: response.coverUrl };
  } catch (error: any) {
    console.error("[UserProfileService] Error uploading cover:", error);
    throw error;
  }
}

// ============================================================================
// Rating API
// ============================================================================

/**
 * Get ratings for a user
 */
export async function getUserRatings(params: GetRatingsRequest): Promise<{
  success: boolean;
  data: Rating[];
  summary: RatingSummary;
  pagination: { page: number; limit: number; total: number };
}> {
  try {
    const queryParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 10),
      ...(params.minScore && { minScore: String(params.minScore) }),
      ...(params.sortBy && { sortBy: params.sortBy }),
    });

    const response = await apiFetch(
      `/profiles/${params.userId}/ratings?${queryParams}`
    );
    return response as any;
  } catch (error: any) {
    console.error("[UserProfileService] Error fetching ratings:", error);
    // Return mock ratings
    return {
      success: true,
      data: generateMockRatings(params.userId),
      summary: generateMockRatingSummary(),
      pagination: { page: 1, limit: 10, total: 127 },
    };
  }
}

/**
 * Submit a rating for a user
 */
export async function submitRating(
  data: SubmitRatingRequest
): Promise<{ success: boolean; rating?: Rating }> {
  try {
    const response = await apiFetch<{ rating: Rating }>("/ratings", {
      method: "POST",
      data,
    });
    return { success: true, rating: response.rating };
  } catch (error: any) {
    console.error("[UserProfileService] Error submitting rating:", error);
    throw error;
  }
}

/**
 * Reply to a rating (for the rated user)
 */
export async function replyToRating(
  ratingId: string,
  reply: string
): Promise<{ success: boolean }> {
  try {
    await apiFetch(`/ratings/${ratingId}/reply`, {
      method: "POST",
      data: { reply },
    });
    return { success: true };
  } catch (error: any) {
    console.error("[UserProfileService] Error replying to rating:", error);
    throw error;
  }
}

// ============================================================================
// Points & Wallet API
// ============================================================================

/**
 * Get user's points balance
 */
export async function getPointsBalance(
  userId?: string
): Promise<{ success: boolean; data: PointsBalance }> {
  try {
    const endpoint = userId
      ? `/profiles/${userId}/points`
      : "/profiles/me/points";
    const response = await apiFetch<{ data: PointsBalance }>(endpoint);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("[UserProfileService] Error fetching points:", error);
    // Return mock points
    return {
      success: true,
      data: {
        rewardPoints: 15000,
        creditPoints: 850,
        walletBalance: 500000,
        bonusPoints: 2500,
        totalConverted: 1500000,
      },
    };
  }
}

/**
 * Get points transaction history
 */
export async function getPointHistory(params: GetPointHistoryRequest): Promise<{
  success: boolean;
  data: PointTransaction[];
  pagination: { page: number; limit: number; total: number };
}> {
  try {
    const queryParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 20),
      ...(params.type && { type: params.type }),
      ...(params.pointType && { pointType: params.pointType }),
      ...(params.dateFrom && { dateFrom: params.dateFrom }),
      ...(params.dateTo && { dateTo: params.dateTo }),
    });

    const response = await apiFetch(
      `/profiles/${params.userId}/points/history?${queryParams}`
    );
    return response as any;
  } catch (error: any) {
    console.error("[UserProfileService] Error fetching point history:", error);
    return {
      success: true,
      data: generateMockPointHistory(params.userId),
      pagination: { page: 1, limit: 20, total: 50 },
    };
  }
}

/**
 * Convert points to wallet balance
 */
export async function convertPoints(data: ConvertPointsRequest): Promise<{
  success: boolean;
  convertedAmount: number;
  newBalance: PointsBalance;
}> {
  try {
    const response = await apiFetch<{
      convertedAmount: number;
      newBalance: PointsBalance;
    }>("/profiles/me/points/convert", {
      method: "POST",
      data,
    });
    return { success: true, ...response };
  } catch (error: any) {
    console.error("[UserProfileService] Error converting points:", error);
    throw error;
  }
}

// ============================================================================
// Mock Data Generators (for development)
// ============================================================================

function generateMockProfile(slugOrId: string): UserProfileFull {
  const roles: UserProfileFull["role"][] = [
    "worker",
    "contractor",
    "supplier",
    "designer",
    "consultant",
    "seller",
  ];
  const randomRole = roles[Math.floor(Math.random() * roles.length)];

  const specialties: UserProfileFull["specialty"] = [
    "electrician",
    "plumber",
    "carpenter",
    "painter",
  ];

  return {
    id: slugOrId.includes("-") ? slugOrId.replace(/-/g, "") : slugOrId,
    slug: slugOrId.includes("-") ? slugOrId : `user-${slugOrId}`,
    email: `user_${slugOrId}@example.com`,
    phone: "0909123456",
    name: "Nguyễn Văn An",
    avatar:
      "https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff&size=128",
    coverImage:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    bio: "Thợ điện chuyên nghiệp với 8 năm kinh nghiệm. Chuyên lắp đặt điện dân dụng, công nghiệp. Cam kết an toàn, chất lượng.",

    role: "worker",
    specialty: ["electrician"],
    title: "Thợ điện",
    yearsExperience: 8,
    certifications: ["Chứng chỉ thợ điện hạng 3", "An toàn lao động"],

    isVerified: true,
    isTopRated: true,
    isPremium: false,

    points: {
      rewardPoints: 15000,
      creditPoints: 850,
      walletBalance: 500000,
      bonusPoints: 2500,
      totalConverted: 1500000,
    },

    stats: {
      totalJobs: 342,
      completedJobs: 335,
      cancelledJobs: 3,
      successRate: 98,
      rating: generateMockRatingSummary(),
      responseTime: 5,
      lastActive: new Date().toISOString(),
      memberSince: "2018-03-15T00:00:00Z",
      badges: [
        {
          id: "1",
          name: "Top",
          icon: "trophy",
          color: "#FFB800",
          description: "Top đánh giá",
          earnedAt: "2024-01-01",
        },
        {
          id: "2",
          name: "Nhanh",
          icon: "flash",
          color: "#4CAF50",
          description: "Phản hồi nhanh",
          earnedAt: "2024-02-01",
        },
      ],
      level: {
        current: 45,
        name: "Gold",
        progress: 75,
        nextLevel: "Platinum",
      },
    },

    availability: {
      status: "available",
      message: "Có thể nhận việc ngay",
      location: {
        latitude: 10.7769,
        longitude: 106.7009,
        address: "Quận 1, TP.HCM",
        distance: 2.3,
      },
      workingHours: {
        start: "08:00",
        end: "17:00",
        days: [1, 2, 3, 4, 5, 6],
      },
    },

    pricing: {
      hourlyRate: 200000,
      dailyRate: 1200000,
      minOrder: 200000,
      currency: "VND",
    },

    portfolioImages: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400",
    ],

    isActive: true,
    profileVisibility: "public",

    createdAt: "2018-03-15T00:00:00Z",
    updatedAt: new Date().toISOString(),
  };
}

function generateMockRatingSummary(): RatingSummary {
  return {
    averageScore: 4.9,
    totalReviews: 127,
    distribution: {
      1: 0,
      2: 1,
      3: 3,
      4: 15,
      5: 108,
    },
    positivePercent: 97,
    topTags: [
      { id: "1", label: "Chuyên nghiệp", icon: "star", positive: true },
      { id: "2", label: "Đúng giờ", icon: "time", positive: true },
      { id: "3", label: "Sạch sẽ", icon: "sparkles", positive: true },
    ],
  };
}

function generateMockRatings(userId: string): Rating[] {
  return [
    {
      id: "1",
      userId: "user1",
      targetUserId: userId,
      orderId: "order1",
      score: 5,
      comment: "Thợ làm việc rất chuyên nghiệp, đúng giờ. Sẽ tiếp tục thuê.",
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200",
      ],
      tags: [{ id: "1", label: "Chuyên nghiệp", positive: true }],
      isVerified: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      userId: "user2",
      targetUserId: userId,
      orderId: "order2",
      score: 5,
      comment: "Tay nghề cao, giá cả hợp lý.",
      isVerified: true,
      createdAt: "2024-01-10T14:00:00Z",
      updatedAt: "2024-01-10T14:00:00Z",
    },
  ];
}

function generateMockPointHistory(userId: string): PointTransaction[] {
  return [
    {
      id: "1",
      userId,
      type: "earn",
      pointType: "reward",
      amount: 500,
      balance: 15000,
      description: "Hoàn thành đơn hàng #12345",
      orderId: "12345",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      userId,
      type: "earn",
      pointType: "credit",
      amount: 10,
      balance: 850,
      description: "Đánh giá 5 sao từ khách hàng",
      createdAt: "2024-01-14T15:00:00Z",
    },
    {
      id: "3",
      userId,
      type: "convert",
      pointType: "wallet",
      amount: 100000,
      balance: 500000,
      description: "Quy đổi 10,000 điểm thưởng",
      createdAt: "2024-01-10T09:00:00Z",
    },
  ];
}

export {
    generateMockPointHistory, generateMockProfile, generateMockRatings, generateMockRatingSummary
};

