/**
 * User Profile Context
 * Manages profile state with role-based theming
 */

import {
    convertPoints,
    getPointHistory,
    getPointsBalance,
    getProfileById,
    getProfileBySlug,
    getUserRatings,
    submitRating,
    updateUserProfile,
    uploadCoverImage,
    uploadProfileAvatar,
} from "@/services/userProfile.service";
import type {
    PointsBalance,
    PointTransaction,
    Rating,
    RatingSummary,
    RoleTheme,
    UpdateProfileRequest,
    UserProfileFull,
} from "@/types/profile";
import { ROLE_THEMES } from "@/types/profile";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

// ============================================================================
// Context Types
// ============================================================================

interface ProfileContextState {
  // Current viewed profile
  profile: UserProfileFull | null;
  loading: boolean;
  error: string | null;

  // Rating state
  ratings: Rating[];
  ratingSummary: RatingSummary | null;
  ratingsLoading: boolean;

  // Points state
  points: PointsBalance | null;
  pointHistory: PointTransaction[];
  pointsLoading: boolean;

  // Theme based on role
  theme: RoleTheme;
}

interface ProfileContextActions {
  // Profile actions
  loadProfileBySlug: (slug: string) => Promise<void>;
  loadProfileById: (id: string) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  uploadAvatar: (uri: string) => Promise<boolean>;
  uploadCover: (uri: string) => Promise<boolean>;
  clearProfile: () => void;

  // Rating actions
  loadRatings: (params?: { page?: number; sortBy?: string }) => Promise<void>;
  addRating: (data: {
    score: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    images?: string[];
  }) => Promise<boolean>;

  // Points actions
  loadPoints: () => Promise<void>;
  loadPointHistory: (params?: {
    type?: string;
    page?: number;
  }) => Promise<void>;
  convertPointsToWallet: (amount: number) => Promise<boolean>;

  // Utility
  refreshProfile: () => Promise<void>;
}

type ProfileContextType = ProfileContextState & ProfileContextActions;

// ============================================================================
// Default Values
// ============================================================================

const defaultTheme: RoleTheme = ROLE_THEMES.customer;

const initialState: ProfileContextState = {
  profile: null,
  loading: false,
  error: null,
  ratings: [],
  ratingSummary: null,
  ratingsLoading: false,
  points: null,
  pointHistory: [],
  pointsLoading: false,
  theme: defaultTheme,
};

// ============================================================================
// Context Creation
// ============================================================================

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface ProfileProviderProps {
  children: React.ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [state, setState] = useState<ProfileContextState>(initialState);

  // Update theme when profile role changes
  useEffect(() => {
    if (state.profile?.role) {
      const newTheme = ROLE_THEMES[state.profile.role] || defaultTheme;
      setState((prev) => ({ ...prev, theme: newTheme }));
    }
  }, [state.profile?.role]);

  // ============================================================================
  // Profile Actions
  // ============================================================================

  const loadProfileBySlug = useCallback(async (slug: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getProfileBySlug(slug);
      if (response.success) {
        setState((prev) => ({
          ...prev,
          profile: response.data,
          loading: false,
          theme: ROLE_THEMES[response.data.role] || defaultTheme,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || "Không thể tải hồ sơ",
        }));
      }
    } catch (error) {
      console.error("[ProfileContext] Error loading profile:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Đã xảy ra lỗi khi tải hồ sơ",
      }));
    }
  }, []);

  const loadProfileById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getProfileById(id);
      if (response.success) {
        setState((prev) => ({
          ...prev,
          profile: response.data,
          loading: false,
          theme: ROLE_THEMES[response.data.role] || defaultTheme,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || "Không thể tải hồ sơ",
        }));
      }
    } catch (error) {
      console.error("[ProfileContext] Error loading profile:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Đã xảy ra lỗi khi tải hồ sơ",
      }));
    }
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<boolean> => {
      try {
        const response = await updateUserProfile(data);
        if (response.success) {
          setState((prev) => ({
            ...prev,
            profile: response.data,
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error("[ProfileContext] Error updating profile:", error);
        return false;
      }
    },
    []
  );

  const uploadAvatar = useCallback(async (uri: string): Promise<boolean> => {
    try {
      const response = await uploadProfileAvatar(uri);
      if (response.success && response.avatarUrl) {
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? { ...prev.profile, avatar: response.avatarUrl }
            : null,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("[ProfileContext] Error uploading avatar:", error);
      return false;
    }
  }, []);

  const uploadCover = useCallback(async (uri: string): Promise<boolean> => {
    try {
      const response = await uploadCoverImage(uri);
      if (response.success && response.coverUrl) {
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? { ...prev.profile, coverImage: response.coverUrl }
            : null,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("[ProfileContext] Error uploading cover:", error);
      return false;
    }
  }, []);

  const clearProfile = useCallback(() => {
    setState(initialState);
  }, []);

  // ============================================================================
  // Rating Actions
  // ============================================================================

  const loadRatings = useCallback(
    async (params?: { page?: number; sortBy?: string }) => {
      if (!state.profile?.id) return;

      setState((prev) => ({ ...prev, ratingsLoading: true }));
      try {
        const response = await getUserRatings({
          userId: state.profile.id,
          page: params?.page || 1,
          sortBy: (params?.sortBy as any) || "newest",
        });

        if (response.success) {
          setState((prev) => ({
            ...prev,
            ratings:
              params?.page && params.page > 1
                ? [...prev.ratings, ...response.data]
                : response.data,
            ratingSummary: response.summary,
            ratingsLoading: false,
          }));
        }
      } catch (error) {
        console.error("[ProfileContext] Error loading ratings:", error);
        setState((prev) => ({ ...prev, ratingsLoading: false }));
      }
    },
    [state.profile?.id]
  );

  const addRating = useCallback(
    async (data: {
      score: 1 | 2 | 3 | 4 | 5;
      comment?: string;
      images?: string[];
    }): Promise<boolean> => {
      if (!state.profile?.id) return false;

      try {
        const response = await submitRating({
          targetUserId: state.profile.id,
          ...data,
        });

        if (response.success && response.rating) {
          setState((prev) => ({
            ...prev,
            ratings: [response.rating!, ...prev.ratings],
          }));
          // Refresh ratings summary
          loadRatings();
          return true;
        }
        return false;
      } catch (error) {
        console.error("[ProfileContext] Error adding rating:", error);
        return false;
      }
    },
    [state.profile?.id, loadRatings]
  );

  // ============================================================================
  // Points Actions
  // ============================================================================

  const loadPoints = useCallback(async () => {
    if (!state.profile?.id) return;

    setState((prev) => ({ ...prev, pointsLoading: true }));
    try {
      const response = await getPointsBalance(state.profile.id);
      if (response.success) {
        setState((prev) => ({
          ...prev,
          points: response.data,
          pointsLoading: false,
        }));
      }
    } catch (error) {
      console.error("[ProfileContext] Error loading points:", error);
      setState((prev) => ({ ...prev, pointsLoading: false }));
    }
  }, [state.profile?.id]);

  const loadPointHistory = useCallback(
    async (params?: { type?: string; page?: number }) => {
      if (!state.profile?.id) return;

      setState((prev) => ({ ...prev, pointsLoading: true }));
      try {
        const response = await getPointHistory({
          userId: state.profile.id,
          type: params?.type as any,
          page: params?.page || 1,
        });

        if (response.success) {
          setState((prev) => ({
            ...prev,
            pointHistory:
              params?.page && params.page > 1
                ? [...prev.pointHistory, ...response.data]
                : response.data,
            pointsLoading: false,
          }));
        }
      } catch (error) {
        console.error("[ProfileContext] Error loading point history:", error);
        setState((prev) => ({ ...prev, pointsLoading: false }));
      }
    },
    [state.profile?.id]
  );

  const convertPointsToWallet = useCallback(
    async (amount: number): Promise<boolean> => {
      try {
        const response = await convertPoints({
          fromType: "reward",
          toType: "wallet",
          amount,
        });

        if (response.success) {
          setState((prev) => ({
            ...prev,
            points: response.newBalance,
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error("[ProfileContext] Error converting points:", error);
        return false;
      }
    },
    []
  );

  // ============================================================================
  // Utility Actions
  // ============================================================================

  const refreshProfile = useCallback(async () => {
    if (state.profile?.slug) {
      await loadProfileBySlug(state.profile.slug);
      await loadRatings();
      await loadPoints();
    }
  }, [state.profile?.slug, loadProfileBySlug, loadRatings, loadPoints]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = useMemo<ProfileContextType>(
    () => ({
      ...state,
      loadProfileBySlug,
      loadProfileById,
      updateProfile,
      uploadAvatar,
      uploadCover,
      clearProfile,
      loadRatings,
      addRating,
      loadPoints,
      loadPointHistory,
      convertPointsToWallet,
      refreshProfile,
    }),
    [
      state,
      loadProfileBySlug,
      loadProfileById,
      updateProfile,
      uploadAvatar,
      uploadCover,
      clearProfile,
      loadRatings,
      addRating,
      loadPoints,
      loadPointHistory,
      convertPointsToWallet,
      refreshProfile,
    ]
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}

// Alias for convenience
export const useProfile = useProfileContext;

export default ProfileContext;
