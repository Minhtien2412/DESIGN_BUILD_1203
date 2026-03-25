/**
 * useTeams — Hook for fetching teams, optionally filtered by department
 */

import { getTeams } from "@/services/staffService";
import type { Team } from "@/types/staff";
import { useCallback, useEffect, useState } from "react";

export function useTeams(departmentId?: number, autoFetch = true) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeams(departmentId);
      setTeams(data);
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Không thể tải danh sách team",
      );
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    if (autoFetch) fetchTeams();
  }, [autoFetch, fetchTeams]);

  return { teams, loading, error, refresh: fetchTeams };
}
