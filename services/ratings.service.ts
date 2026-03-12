/**
 * Ratings Service (Frontend)
 *
 * Service cho đánh giá sao (1-5):
 * - ⭐⭐⭐⭐⭐
 *
 * Hỗ trợ:
 * - Create/Update rating
 * - Get rating summary
 * - Get all ratings for content
 * - Batch get for product listing optimization
 * - Mark rating as helpful
 *
 * @author AI Assistant
 * @date 27/01/2026
 */

import { apiFetch } from "./api";

// ==================== TYPES ====================

export interface Rating {
  id: number;
  userId: number;
  contentType: string;
  contentId: number;
  stars: number;
  review: string | null;
  title: string | null;
  images: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  distribution: RatingDistribution;
  userRating: Rating | null;
}

export interface CreateRatingInput {
  contentType: string;
  contentId: number;
  stars: number; // 1-5
  review?: string;
  title?: string;
  images?: string[];
  verified?: boolean;
}

export interface RatingsListOptions {
  stars?: number;
  withReview?: boolean;
  sortBy?: "newest" | "oldest" | "helpful" | "highest" | "lowest";
  limit?: number;
  offset?: number;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get star display string
 */
export function getStarDisplay(stars: number): string {
  return "⭐".repeat(Math.min(5, Math.max(1, Math.round(stars))));
}

/**
 * Get rating color based on stars
 */
export function getRatingColor(stars: number): string {
  if (stars >= 4.5) return "#22c55e"; // green
  if (stars >= 4) return "#84cc16"; // lime
  if (stars >= 3) return "#eab308"; // yellow
  if (stars >= 2) return "#f97316"; // orange
  return "#ef4444"; // red
}

/**
 * Format rating as "4.5/5.0"
 */
export function formatRating(rating: number, showMax = true): string {
  const formatted = rating.toFixed(1);
  return showMax ? `${formatted}/5.0` : formatted;
}

// ==================== API FUNCTIONS ====================

/**
 * Create or update rating
 */
export async function submitRating(input: CreateRatingInput): Promise<{
  success: boolean;
  action?: "created" | "updated";
  rating?: Rating;
  summary?: RatingSummary;
  error?: string;
}> {
  try {
    // Validate stars
    if (input.stars < 1 || input.stars > 5) {
      return {
        success: false,
        error: "Stars must be between 1 and 5",
      };
    }

    const response = await apiFetch<{
      success: boolean;
      action: "created" | "updated";
      rating: Rating;
      summary: RatingSummary;
    }>("/ratings", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return response;
  } catch (error) {
    console.error("[RatingsService] Submit rating failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete rating
 */
export async function deleteRating(
  contentType: string,
  contentId: number,
): Promise<{
  success: boolean;
  deleted?: boolean;
  summary?: RatingSummary;
  error?: string;
}> {
  try {
    const response = await apiFetch<{
      success: boolean;
      deleted: boolean;
      summary: RatingSummary;
    }>(`/ratings/${contentType}/${contentId}`, {
      method: "DELETE",
    });

    return response;
  } catch (error) {
    console.error("[RatingsService] Delete rating failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get rating summary for content
 */
export async function getRatingSummary(
  contentType: string,
  contentId: number,
): Promise<RatingSummary | null> {
  try {
    const response = await apiFetch<{
      success: boolean;
      averageRating: number;
      totalRatings: number;
      distribution: RatingDistribution;
      userRating: Rating | null;
    }>(`/ratings/${contentType}/${contentId}`);

    if (response.success) {
      return {
        averageRating: response.averageRating,
        totalRatings: response.totalRatings,
        distribution: response.distribution,
        userRating: response.userRating,
      };
    }
    return null;
  } catch (error) {
    console.error("[RatingsService] Get summary failed:", error);
    return null;
  }
}

/**
 * Get all ratings for content
 */
export async function getRatings(
  contentType: string,
  contentId: number,
  options: RatingsListOptions = {},
): Promise<{ ratings: Rating[]; total: number } | null> {
  try {
    const params = new URLSearchParams();

    if (options.stars) params.append("stars", options.stars.toString());
    if (options.withReview) params.append("withReview", "true");
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const url = `/ratings/${contentType}/${contentId}/list${queryString ? `?${queryString}` : ""}`;

    const response = await apiFetch<{
      success: boolean;
      ratings: Rating[];
      total: number;
    }>(url);

    if (response.success) {
      return {
        ratings: response.ratings,
        total: response.total,
      };
    }
    return null;
  } catch (error) {
    console.error("[RatingsService] Get ratings failed:", error);
    return null;
  }
}

/**
 * Mark rating as helpful
 */
export async function markRatingHelpful(
  ratingId: number,
): Promise<{ success: boolean; helpful?: number; error?: string }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      helpful: number;
    }>(`/ratings/${ratingId}/helpful`, {
      method: "POST",
    });

    return response;
  } catch (error) {
    console.error("[RatingsService] Mark helpful failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch get rating summaries for multiple contents
 */
export async function batchGetRatingSummaries(
  contentType: string,
  contentIds: number[],
): Promise<Record<number, RatingSummary> | null> {
  try {
    const response = await apiFetch<{
      success: boolean;
      summaries: Record<number, RatingSummary>;
    }>("/ratings/batch", {
      method: "POST",
      body: JSON.stringify({
        contentType,
        contentIds,
      }),
    });

    if (response.success) {
      return response.summaries;
    }
    return null;
  } catch (error) {
    console.error("[RatingsService] Batch get failed:", error);
    return null;
  }
}

/**
 * Get current user's ratings
 */
export async function getMyRatings(
  contentType?: string,
  limit = 50,
  offset = 0,
): Promise<Rating[] | null> {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    if (contentType) params.append("contentType", contentType);

    const response = await apiFetch<{
      success: boolean;
      ratings: Rating[];
    }>(`/ratings/me?${params.toString()}`);

    if (response.success) {
      return response.ratings;
    }
    return null;
  } catch (error) {
    console.error("[RatingsService] Get my ratings failed:", error);
    return null;
  }
}

// ==================== CONVENIENCE EXPORTS ====================

export default {
  submitRating,
  deleteRating,
  getRatingSummary,
  getRatings,
  markRatingHelpful,
  batchGetRatingSummaries,
  getMyRatings,
  // Helpers
  getStarDisplay,
  getRatingColor,
  formatRating,
};
