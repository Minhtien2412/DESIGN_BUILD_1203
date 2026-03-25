/**
 * useStaffDetail — Hook for fetching a single staff member detail
 */

import { useCallback, useEffect, useState } from 'react';
import { getStaffDetail } from '@/services/staffService';
import type { StaffActivityEntry, StaffMemberFull, StaffReportRef } from '@/types/staff';

export function useStaffDetail(staffId: number | null) {
  const [staff, setStaff] = useState<StaffMemberFull | null>(null);
  const [activityLog, setActivityLog] = useState<StaffActivityEntry[]>([]);
  const [reports, setReports] = useState<StaffReportRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getStaffDetail(staffId);
      setStaff(data.staff);
      setActivityLog(data.activity_log ?? []);
      setReports(data.reports ?? []);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Không thể tải thông tin nhân sự';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    if (staffId) {
      fetchDetail();
    }
  }, [staffId, fetchDetail]);

  return {
    staff,
    activityLog,
    reports,
    loading,
    error,
    refresh: fetchDetail,
  };
}
