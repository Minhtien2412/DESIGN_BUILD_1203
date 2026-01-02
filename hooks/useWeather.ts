/**
 * Weather Hooks
 * Custom hooks for weather data management with optimistic updates
 */

import {
    acknowledgeAlert,
    cancelWorkStoppage,
    checkWorkSafety,
    completeWorkStoppage,
    createWorkStoppage,
    deleteWorkStoppage,
    dismissAlert,
    getCurrentWeather,
    getWeatherAlert,
    getWeatherAlerts,
    getWeatherForecast,
    getWeatherHistory,
    getWeatherStats,
    getWorkRecommendations,
    getWorkStoppage,
    getWorkStoppages,
    refreshWeather,
    updateWorkStoppage,
} from '@/services/weather';
import type {
    CreateStoppageParams,
    GetStoppagesParams,
    GetWeatherAlertsParams,
    GetWeatherForecastParams,
    GetWeatherHistoryParams,
    GetWeatherStatsParams,
    GetWorkRecommendationsParams,
    UpdateStoppageParams,
    WeatherAlert,
    WeatherForecast,
    WeatherHistory,
    WeatherStats,
    WorkRecommendation,
    WorkStoppage
} from '@/types/weather';
import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// WEATHER FORECAST HOOKS
// ============================================================================

/**
 * Hook to get weather forecast for a project
 */
export function useWeatherForecast(params: GetWeatherForecastParams) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchForecast = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherForecast(params);
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather forecast');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.days, params.includeHourly, params.includeAlerts]);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await refreshWeather(params.projectId);
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh weather');
    } finally {
      setRefreshing(false);
    }
  }, [params.projectId]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecast,
    loading,
    error,
    refreshing,
    refresh,
    refetch: fetchForecast,
  };
}

/**
 * Hook to get current weather only
 */
export function useCurrentWeather(projectId: string) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentWeather(projectId);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current weather');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { weather, loading, error, refetch: fetchWeather };
}

// ============================================================================
// WEATHER ALERTS HOOKS
// ============================================================================

/**
 * Hook to get weather alerts for a project
 */
export function useWeatherAlerts(params: GetWeatherAlertsParams) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherAlerts(params);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather alerts');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.activeOnly, params.unacknowledgedOnly]);

  const acknowledge = useCallback(
    async (alertId: string, acknowledgedBy: string, notes?: string) => {
      try {
        const updated = await acknowledgeAlert({ alertId, acknowledgedBy, notes });
        setAlerts((prev) =>
          prev.map((alert) => (alert.id === alertId ? updated : alert))
        );
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const dismiss = useCallback(async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    acknowledge,
    dismiss,
    refetch: fetchAlerts,
  };
}

/**
 * Hook to get a specific weather alert
 */
export function useWeatherAlert(alertId: string | null) {
  const [alert, setAlert] = useState<WeatherAlert | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alertId) {
      setAlert(null);
      return;
    }

    const fetchAlert = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWeatherAlert(alertId);
        setAlert(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alert');
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [alertId]);

  return { alert, loading, error };
}

// ============================================================================
// WORK STOPPAGE HOOKS
// ============================================================================

/**
 * Hook to get work stoppages for a project
 */
export function useWorkStoppages(params: GetStoppagesParams) {
  const [stoppages, setStoppages] = useState<WorkStoppage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoppages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkStoppages(params);
      setStoppages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch work stoppages');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.status, params.startDate, params.endDate]);

  const create = useCallback(
    async (stoppageParams: CreateStoppageParams) => {
      try {
        const newStoppage = await createWorkStoppage(stoppageParams);
        setStoppages((prev) => [newStoppage, ...prev]);
        return newStoppage;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const update = useCallback(
    async (stoppageId: string, updateParams: UpdateStoppageParams) => {
      try {
        const updated = await updateWorkStoppage(stoppageId, updateParams);
        setStoppages((prev) =>
          prev.map((stoppage) => (stoppage.id === stoppageId ? updated : stoppage))
        );
        return updated;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const complete = useCallback(async (stoppageId: string, endTime: Date) => {
    try {
      const completed = await completeWorkStoppage(stoppageId, endTime);
      setStoppages((prev) =>
        prev.map((stoppage) => (stoppage.id === stoppageId ? completed : stoppage))
      );
      return completed;
    } catch (err) {
      throw err;
    }
  }, []);

  const cancel = useCallback(async (stoppageId: string, reason?: string) => {
    try {
      const cancelled = await cancelWorkStoppage(stoppageId, reason);
      setStoppages((prev) =>
        prev.map((stoppage) => (stoppage.id === stoppageId ? cancelled : stoppage))
      );
      return cancelled;
    } catch (err) {
      throw err;
    }
  }, []);

  const remove = useCallback(async (stoppageId: string) => {
    try {
      await deleteWorkStoppage(stoppageId);
      setStoppages((prev) => prev.filter((stoppage) => stoppage.id !== stoppageId));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchStoppages();
  }, [fetchStoppages]);

  return {
    stoppages,
    loading,
    error,
    create,
    update,
    complete,
    cancel,
    remove,
    refetch: fetchStoppages,
  };
}

/**
 * Hook to get a specific work stoppage
 */
export function useWorkStoppage(stoppageId: string | null) {
  const [stoppage, setStoppage] = useState<WorkStoppage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stoppageId) {
      setStoppage(null);
      return;
    }

    const fetchStoppage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkStoppage(stoppageId);
        setStoppage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stoppage');
      } finally {
        setLoading(false);
      }
    };

    fetchStoppage();
  }, [stoppageId]);

  return { stoppage, loading, error };
}

// ============================================================================
// WEATHER HISTORY & STATISTICS HOOKS
// ============================================================================

/**
 * Hook to get weather history for a project
 */
export function useWeatherHistory(params: GetWeatherHistoryParams) {
  const [history, setHistory] = useState<WeatherHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherHistory(params);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather history');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.startDate, params.endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}

/**
 * Hook to get weather statistics for a project
 */
export function useWeatherStats(params: GetWeatherStatsParams) {
  const [stats, setStats] = useState<WeatherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherStats(params);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather stats');
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.startDate, params.endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// ============================================================================
// WORK RECOMMENDATIONS HOOKS
// ============================================================================

/**
 * Hook to get work recommendations based on weather
 */
export function useWorkRecommendations(params: GetWorkRecommendationsParams) {
  const [recommendations, setRecommendations] = useState<WorkRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkRecommendations(params);
      setRecommendations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch work recommendations'
      );
    } finally {
      setLoading(false);
    }
  }, [params.projectId, params.activityType, params.days]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, loading, error, refetch: fetchRecommendations };
}

/**
 * Hook to check work safety for specific activities
 */
export function useWorkSafety(projectId: string) {
  const [checking, setChecking] = useState(false);

  const checkSafety = useCallback(
    async (activityTypes: string[]) => {
      try {
        setChecking(true);
        const results = await checkWorkSafety(projectId, activityTypes);
        return results;
      } catch (err) {
        throw err;
      } finally {
        setChecking(false);
      }
    },
    [projectId]
  );

  return { checkSafety, checking };
}
