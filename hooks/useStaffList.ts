/**
 * useStaffList — Hook for fetching paginated/filtered staff list
 */

import { useCallback, useEffect, useState } from 'react';
import { getStaffList } from '@/services/staffService';
import type {
  StaffFilters,
  StaffListResponse,
  StaffMemberFull,
  StaffSortField,
  SortDirection,
} from '@/types/staff';

interface UseStaffOptions {
  page?: number;
  limit?: number;
  filters?: StaffFilters;
  sortBy?: StaffSortField;
  sortDir?: SortDirection;
  autoFetch?: boolean;
}

export function useStaffList(options: UseStaffOptions = {}) {
  const {
    page = 1,
    limit = 20,
    filters = {},
    sortBy = 'full_name',
    sortDir = 'asc',
    autoFetch = true,
  } = options;

  const [staff, setStaff] = useState<StaffMemberFull[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(
    async (currentPage = page, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data: StaffListResponse = await getStaffList({
          page: currentPage,
          limit,
          filters,
          sort_by: sortBy,
          sort_dir: sortDir,
        });

        setStaff(data.staff);
        setPagination(data.pagination);
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || 'Không thể tải danh sách nhân sự';
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, JSON.stringify(filters), sortBy, sortDir],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchStaff();
    }
  }, [autoFetch, fetchStaff]);

  const refresh = useCallback(() => fetchStaff(1, true), [fetchStaff]);
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.total_pages && !loading) {
      fetchStaff(pagination.page + 1);
    }
  }, [pagination, loading, fetchStaff]);

  return {
    staff,
    pagination,
    loading,
    refreshing,
    error,
    refresh,
    loadMore,
    fetchStaff,
  };
}
