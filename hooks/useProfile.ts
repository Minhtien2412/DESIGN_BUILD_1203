import { ApiError, apiFetch } from '@/services/api';
import { getToken } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role?: string;
  createdAt?: string;
  stats?: {
    projects?: number;
    bookings?: number;
    reviews?: number;
  };
}

interface UseProfileReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        // Silent: no token is normal for unauthenticated users
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await apiFetch('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(data.user || data);
    } catch (err) {
      // Silent handling for auth errors (401/403) - user is simply not logged in
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          // Don't log or set error - just clear user state
          setUser(null);
          setError(null);
        } else {
          setError(err.data?.message || err.message || 'Failed to load profile');
          console.error('[useProfile] API Error:', err.status, err.data);
        }
      } else {
        setError('Unknown error occurred');
        console.error('[useProfile] Error:', err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      const token = await getToken();
      if (!token) {
        setError('No authentication token');
        return false;
      }

      const response = await apiFetch('/auth/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      setUser(response.user || response);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.message || err.message || 'Failed to update profile');
      } else {
        setError('Unknown error occurred');
      }
      return false;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    user,
    loading,
    error,
    refresh: fetchProfile,
    updateProfile
  };
}
