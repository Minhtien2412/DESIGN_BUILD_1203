/**
 * Job Progress Manager
 * =====================
 *
 * Quản lý "thông báo chờ" (Pending / In-progress):
 * - Client tạo pending khi bấm → server trả jobId → WS đẩy progress → update → done/fail
 * - Hiển thị overlay / spinner / progress bar tại màn hình đang thao tác
 *
 * WS events handled:
 *   job.progress  → update stage + progress %
 *   job.done      → mark completed + show success
 *   job.failed    → mark failed + show error
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

import type {
    JobDoneEvent,
    JobEvent,
    JobFailedEvent,
    JobProgressEvent,
    PendingJob,
} from "./types";

// ============================================================================
// EVENT TYPES
// ============================================================================

type JobManagerEvent =
  | { type: "job_created"; job: PendingJob }
  | { type: "job_updated"; job: PendingJob }
  | { type: "job_completed"; job: PendingJob }
  | { type: "job_failed"; job: PendingJob }
  | { type: "job_removed"; jobId: string };

type JobManagerListener = (event: JobManagerEvent) => void;

// ============================================================================
// JOB PROGRESS MANAGER
// ============================================================================

class JobProgressManager {
  private jobs: Map<string, PendingJob> = new Map();
  private listeners: Set<JobManagerListener> = new Set();

  // Track auto-remove timers so destroy() can clean them up
  private autoRemoveTimers: Map<string, ReturnType<typeof setTimeout>> =
    new Map();

  // Guard against unbounded job accumulation
  private static readonly MAX_JOBS = 30;

  // ==========================================================================
  // SUBSCRIPTION
  // ==========================================================================

  subscribe(listener: JobManagerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: JobManagerEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("[JobProgressManager] Listener error:", error);
      }
    }
  }

  // ========================================================================
  // AUTO-REMOVE TIMER HELPERS
  // ========================================================================

  private scheduleAutoRemove(jobId: string, delayMs: number): void {
    // Clear any previous timer for the same job
    this.clearAutoRemoveTimer(jobId);
    const timer = setTimeout(() => {
      this.autoRemoveTimers.delete(jobId);
      this.removeJob(jobId);
    }, delayMs);
    this.autoRemoveTimers.set(jobId, timer);
  }

  private clearAutoRemoveTimer(jobId: string): void {
    const existing = this.autoRemoveTimers.get(jobId);
    if (existing) {
      clearTimeout(existing);
      this.autoRemoveTimers.delete(jobId);
    }
  }

  private clearAllTimers(): void {
    for (const timer of this.autoRemoveTimers.values()) {
      clearTimeout(timer);
    }
    this.autoRemoveTimers.clear();
  }

  // ========================================================================
  // EVICTION (when too many jobs accumulate)
  // ========================================================================

  private evictOldestCompleted(): void {
    if (this.jobs.size < JobProgressManager.MAX_JOBS) return;

    // Remove oldest completed/failed/cancelled jobs first
    const sorted = Array.from(this.jobs.entries()).sort(
      ([, a], [, b]) => a.createdAt - b.createdAt,
    );
    for (const [id, job] of sorted) {
      if (this.jobs.size < JobProgressManager.MAX_JOBS) break;
      if (
        job.status === "completed" ||
        job.status === "failed" ||
        job.status === "cancelled"
      ) {
        this.clearAutoRemoveTimer(id);
        this.jobs.delete(id);
      }
    }
  }

  // ==========================================================================
  // CREATE PENDING JOB (client side, before API call)
  // ==========================================================================

  /**
   * Tạo pending job khi user bấm nút.
   * Client gọi hàm này ngay lập tức, sau đó gọi API.
   * Khi API trả jobId, gọi `updateJobId()` để map.
   */
  createPendingJob(params: {
    jobId?: string;
    label: string;
    resultRoute?: string;
  }): PendingJob {
    const jobId =
      params.jobId ||
      `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const job: PendingJob = {
      jobId,
      label: params.label,
      stage: "queued",
      status: "pending",
      progress: 0,
      message: params.label,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      resultRoute: params.resultRoute,
    };

    this.evictOldestCompleted();
    this.jobs.set(jobId, job);
    this.emit({ type: "job_created", job });

    console.log(
      "[JobProgressManager] Created pending job:",
      jobId,
      "-",
      params.label,
    );
    return job;
  }

  /**
   * Khi server trả jobId thật (thay thế local id)
   */
  updateJobId(localJobId: string, serverJobId: string): void {
    const job = this.jobs.get(localJobId);
    if (job) {
      this.jobs.delete(localJobId);
      job.jobId = serverJobId;
      this.jobs.set(serverJobId, job);
      console.log(
        "[JobProgressManager] Mapped job ID:",
        localJobId,
        "→",
        serverJobId,
      );
    }
  }

  // ==========================================================================
  // HANDLE WS EVENTS
  // ==========================================================================

  /**
   * Main handler: route WS event to correct handler
   */
  handleEvent(event: JobEvent): void {
    switch (event.type) {
      case "job.progress":
        this.handleProgress(event);
        break;
      case "job.done":
        this.handleDone(event);
        break;
      case "job.failed":
        this.handleFailed(event);
        break;
    }
  }

  private handleProgress(event: JobProgressEvent): void {
    let job = this.jobs.get(event.jobId);

    if (!job) {
      // Server sent progress for a job we didn't create locally
      // (e.g. started from admin dashboard)
      job = {
        jobId: event.jobId,
        label: event.message,
        stage: event.stage,
        status: "in_progress",
        progress: event.progress,
        message: event.message,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.jobs.set(event.jobId, job);
      this.emit({ type: "job_created", job });
      return;
    }

    job.stage = event.stage;
    job.status = "in_progress";
    job.progress = event.progress;
    job.message = event.message;
    job.updatedAt = Date.now();

    this.emit({ type: "job_updated", job });
  }

  private handleDone(event: JobDoneEvent): void {
    let job = this.jobs.get(event.jobId);

    if (!job) {
      // Create a completed job entry
      job = {
        jobId: event.jobId,
        label: event.message || "Hoàn thành",
        stage: "finalizing",
        status: "completed",
        progress: 100,
        message: event.message || "Hoàn thành",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        result: event.result,
      };
      this.jobs.set(event.jobId, job);
    } else {
      job.status = "completed";
      job.progress = 100;
      job.message = event.message || "Hoàn thành";
      job.result = event.result;
      job.updatedAt = Date.now();
    }

    this.emit({ type: "job_completed", job });

    // Auto-remove after 5s (tracked timer)
    this.scheduleAutoRemove(event.jobId, 5000);
  }

  private handleFailed(event: JobFailedEvent): void {
    let job = this.jobs.get(event.jobId);

    if (!job) {
      job = {
        jobId: event.jobId,
        label: event.message || "Thất bại",
        stage: "processing",
        status: "failed",
        progress: 0,
        message: event.message || "Thất bại",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        error: event.error,
      };
      this.jobs.set(event.jobId, job);
    } else {
      job.status = "failed";
      job.message = event.message || "Thất bại";
      job.error = event.error;
      job.updatedAt = Date.now();
    }

    this.emit({ type: "job_failed", job });

    // Auto-remove after 10s (tracked timer)
    this.scheduleAutoRemove(event.jobId, 10000);
  }

  // ==========================================================================
  // STATE ACCESS
  // ==========================================================================

  getJob(jobId: string): PendingJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): PendingJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }

  getActiveJobs(): PendingJob[] {
    return this.getAllJobs().filter(
      (j) => j.status === "pending" || j.status === "in_progress",
    );
  }

  hasActiveJobs(): boolean {
    return this.getActiveJobs().length > 0;
  }

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  removeJob(jobId: string): void {
    this.clearAutoRemoveTimer(jobId);
    if (this.jobs.has(jobId)) {
      this.jobs.delete(jobId);
      this.emit({ type: "job_removed", jobId });
    }
  }

  cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "cancelled";
      job.message = "Đã hủy";
      job.updatedAt = Date.now();
      this.emit({ type: "job_failed", job });

      this.scheduleAutoRemove(jobId, 3000);
    }
  }

  clearAll(): void {
    this.clearAllTimers();
    const jobIds = Array.from(this.jobs.keys());
    this.jobs.clear();
    jobIds.forEach((jobId) => {
      this.emit({ type: "job_removed", jobId });
    });
  }

  destroy(): void {
    this.clearAllTimers();
    this.jobs.clear();
    this.listeners.clear();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const jobProgressManager = new JobProgressManager();
export default jobProgressManager;
