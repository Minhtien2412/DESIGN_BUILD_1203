/**
 * useRatings Hook
 *
 * React hook for managing star ratings.
 * Features:
 * - Submit/update ratings
 * - Load rating summary
 * - Load rating list with pagination
 *
 * Usage:
 * ```tsx
 * const { summary, submitRating, isLoading } = useRatings('product', productId);
 *
 * <StarRating
 *   value={summary?.userRating?.stars || 0}
 *   onChange={(stars) => submitRating({ stars, review: 'Great!' })}
 * />
 * <Text>Average: {summary?.averageRating || 0}/5</Text>
 * ```
 *
 * @author AI Assistant
 * @date 27/01/2026
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Rating,
    RatingSummary,
    RatingsListOptions,
    deleteRating as apiDeleteRating,
    submitRating as apiSubmitRating,
    formatRating,
    getRatingColor,
    getRatingSummary,
    getRatings,
    getStarDisplay,
    markRatingHelpful,
} from "../services/ratings.service";

interface UseRatingsOptions {
  /** Auto-fetch summary on mount */
  autoFetch?: boolean;
}

interface UseRatingsReturn {
  /** Current rating summary */
  summary: RatingSummary | null;
  /** All ratings list */
  ratings: Rating[];
  /** Total ratings count */
  totalRatings: number;
  /** Loading state */
  isLoading: boolean;
  /** Submitting state */
  isSubmitting: boolean;
  /** Error message if any */
  error: string | null;
  /** Submit or update rating */
  submitRating: (input: {
    stars: number;
    review?: string;
    title?: string;
    images?: string[];
  }) => Promise<boolean>;
  /** Delete user's rating */
  deleteRating: () => Promise<boolean>;
  /** Load ratings list */
  loadRatings: (options?: RatingsListOptions) => Promise<void>;
  /** Load more ratings (pagination) */
  loadMoreRatings: () => Promise<void>;
  /** Mark a rating as helpful */
  markHelpful: (ratingId: number) => Promise<void>;
  /** Refresh summary from server */
  refresh: () => Promise<void>;
  /** Get star display string */
  getStarDisplay: (stars: number) => string;
  /** Get color based on rating */
  getRatingColor: (stars: number) => string;
  /** Format rating as string */
  formatRating: (rating: number, showMax?: boolean) => string;
}

export function useRatings(
  contentType: string,
  contentId: number,
  options: UseRatingsOptions = {},
): UseRatingsReturn {
  const { autoFetch = true } = options;

  const { user } = useAuth();
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listOptions, setListOptions] = useState<RatingsListOptions>({
    limit: 20,
    offset: 0,
    sortBy: "newest",
  });

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    if (!contentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getRatingSummary(contentType, contentId);
      if (result) {
        setSummary(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ratings");
    } finally {
      setIsLoading(false);
    }
  }, [contentType, contentId]);

  // Submit rating
  const submitRating = useCallback(
    async (input: {
      stars: number;
      review?: string;
      title?: string;
      images?: string[];
    }): Promise<boolean> => {
      if (!user) {
        setError("Please login to rate");
        return false;
      }

      if (input.stars < 1 || input.stars > 5) {
        setError("Rating must be between 1 and 5 stars");
        return false;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await apiSubmitRating({
          contentType,
          contentId,
          ...input,
        });

        if (result.success && result.summary) {
          setSummary(result.summary);
          return true;
        } else {
          setError(result.error || "Failed to submit rating");
          return false;
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit rating",
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, contentType, contentId],
  );

  // Delete rating
  const deleteRating = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError("Please login");
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await apiDeleteRating(contentType, contentId);

      if (result.success && result.summary) {
        setSummary(result.summary);
        return true;
      } else {
        setError(result.error || "Failed to delete rating");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete rating");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, contentType, contentId]);

  // Load ratings list
  const loadRatings = useCallback(
    async (options?: RatingsListOptions) => {
      if (!contentId) return;

      const newOptions = { ...listOptions, ...options, offset: 0 };
      setListOptions(newOptions);
      setIsLoading(true);
      setError(null);

      try {
        const result = await getRatings(contentType, contentId, newOptions);
        if (result) {
          setRatings(result.ratings);
          setTotalRatings(result.total);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ratings");
      } finally {
        setIsLoading(false);
      }
    },
    [contentType, contentId, listOptions],
  );

  // Load more ratings
  const loadMoreRatings = useCallback(async () => {
    if (!contentId || isLoading) return;
    if (ratings.length >= totalRatings) return;

    const newOffset = ratings.length;
    const newOptions = { ...listOptions, offset: newOffset };

    setIsLoading(true);

    try {
      const result = await getRatings(contentType, contentId, newOptions);
      if (result) {
        setRatings((prev) => [...prev, ...result.ratings]);
        setListOptions(newOptions);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more ratings",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    contentType,
    contentId,
    isLoading,
    ratings.length,
    totalRatings,
    listOptions,
  ]);

  // Mark rating as helpful
  const markHelpful = useCallback(async (ratingId: number) => {
    try {
      const result = await markRatingHelpful(ratingId);
      if (result.success) {
        // Update local state
        setRatings((prev) =>
          prev.map((r) =>
            r.id === ratingId
              ? { ...r, helpful: result.helpful || r.helpful + 1 }
              : r,
          ),
        );
      }
    } catch (err) {
      console.error("[useRatings] Mark helpful failed:", err);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && contentId) {
      fetchSummary();
    }
  }, [autoFetch, contentId, fetchSummary]);

  return {
    summary,
    ratings,
    totalRatings,
    isLoading,
    isSubmitting,
    error,
    submitRating,
    deleteRating,
    loadRatings,
    loadMoreRatings,
    markHelpful,
    refresh: fetchSummary,
    getStarDisplay,
    getRatingColor,
    formatRating,
  };
}

export default useRatings;
