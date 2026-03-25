/**
 * useDepartments — Hook for fetching departments list
 */

import { getDepartments } from "@/services/staffService";
import type { Department } from "@/types/staff";
import { useCallback, useEffect, useState } from "react";

export function useDepartments(autoFetch = true) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Không thể tải phòng ban");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchDepartments();
  }, [autoFetch, fetchDepartments]);

  return { departments, loading, error, refresh: fetchDepartments };
}
