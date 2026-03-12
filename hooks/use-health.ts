import { useQuery } from '@/hooks/use-query';

interface HealthResponse { status?: string; env?: string; version?: string; timestamp?: string; [k: string]: any }

export interface AggregatedHealthState {
  loading: boolean;
  app?: HealthResponse;
  notifications?: HealthResponse;
  error?: string;
  healthy: boolean;
  refresh(): Promise<void>;
}

/**
 * Aggregates /health and /notifications/health endpoints.
 * - Uses useQuery with independent caching; returns composite health.
 * - healthy true when primary app health is OK (status === 'OK') and notifications (if fetched) not explicitly failing.
 */
export function useHealthAggregate(ttlMs = 20000): AggregatedHealthState {
  const appQ = useQuery<HealthResponse>('/health', { ttlMs, retry: 1, retryFactor: 2 });
  // Remove notifications health since server doesn't have this endpoint, returns Swagger HTML
  // const notifQ = useQuery<HealthResponse>('/notifications/health', { ttlMs, retry: 1, retryFactor: 2 });

  const healthy = (appQ.data?.status === 'OK'); // && (!notifQ.error);

  const refresh = async () => {
    await appQ.reload(true); // Promise.all([appQ.reload(true), notifQ.reload(true)]);
  };

  return {
    loading: appQ.loading, // || notifQ.loading,
    app: appQ.data,
    notifications: undefined, // notifQ.data,
    error: appQ.error, // || notifQ.error,
    healthy,
    refresh,
  };
}
