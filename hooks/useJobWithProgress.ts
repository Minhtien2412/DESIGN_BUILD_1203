/**
 * useJobWithProgress Hook
 * ========================
 *
 * Wraps an API call with automatic pending job tracking.
 * Usage:
 *
 *   const { execute, job, isRunning } = useJobWithProgress({
 *     label: 'Đang tạo booking…',
 *     resultRoute: '/bookings',
 *   });
 *
 *   const handleSubmit = async () => {
 *     const result = await execute(async (jobId) => {
 *       const res = await post('/api/v1/bookings', { ...data });
 *       return res;
 *     });
 *   };
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

import { usePendingJobs } from "@/context/NotificationControllerContext";
import type { PendingJob } from "@/services/notification-system";
import { useCallback, useRef, useState } from "react";

interface UseJobWithProgressOptions {
  /** Label hiện trên overlay, e.g. "Đang tạo booking…" */
  label: string;
  /** Route navigate khi done */
  resultRoute?: string;
  /** Auto-map jobId from server response (field name) */
  jobIdField?: string;
}

interface UseJobWithProgressReturn<T> {
  /** Execute the API call with job tracking */
  execute: (fn: (localJobId: string) => Promise<T>) => Promise<T | undefined>;
  /** Current job state */
  job: PendingJob | null;
  /** Is the job running */
  isRunning: boolean;
  /** Cancel the job */
  cancel: () => void;
}

export function useJobWithProgress<T = any>(
  options: UseJobWithProgressOptions,
): UseJobWithProgressReturn<T> {
  const { createPendingJob, cancelJob, mapJobId } = usePendingJobs();
  const [job, setJob] = useState<PendingJob | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const jobRef = useRef<PendingJob | null>(null);

  const execute = useCallback(
    async (fn: (localJobId: string) => Promise<T>): Promise<T | undefined> => {
      // Create pending job immediately
      const pendingJob = createPendingJob({
        label: options.label,
        resultRoute: options.resultRoute,
      });
      jobRef.current = pendingJob;
      setJob(pendingJob);
      setIsRunning(true);

      try {
        const result = await fn(pendingJob.jobId);

        // Auto-map server jobId if configured
        if (options.jobIdField && result && typeof result === "object") {
          const serverJobId = (result as any)[options.jobIdField];
          if (serverJobId && typeof serverJobId === "string") {
            mapJobId(pendingJob.jobId, serverJobId);
          }
        }

        return result;
      } catch (error) {
        // Job will be marked as failed by WS event or timeout
        console.error("[useJobWithProgress] Error:", error);
        throw error;
      } finally {
        setIsRunning(false);
      }
    },
    [
      createPendingJob,
      mapJobId,
      options.label,
      options.resultRoute,
      options.jobIdField,
    ],
  );

  const cancel = useCallback(() => {
    if (jobRef.current) {
      cancelJob(jobRef.current.jobId);
      setJob(null);
      setIsRunning(false);
    }
  }, [cancelJob]);

  return {
    execute,
    job,
    isRunning,
    cancel,
  };
}
