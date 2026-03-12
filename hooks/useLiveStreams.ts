/**
 * useLiveStreams Hook
 * Fetches and manages livestreams
 * Updated: 22/12/2025
 */

import {
    getCurrentLiveStreams,
    getLiveStreams,
    LiveStream,
} from '@/services/liveStream';
import { useCallback, useEffect, useState } from 'react';

// Helper function
function formatViewerCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

interface LiveStreamWithDisplay extends LiveStream {
  viewerCountDisplay: string;
  isLive: boolean;
}

interface UseLiveStreamsReturn {
  streams: LiveStreamWithDisplay[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  liveCount: number;
}

interface UseLiveStreamsOptions {
  status?: 'live' | 'ended' | 'all';
  liveOnly?: boolean;
  autoRefreshInterval?: number; // in ms, 0 to disable
}

export function useLiveStreams(options?: UseLiveStreamsOptions): UseLiveStreamsReturn {
  const [streams, setStreams] = useState<LiveStreamWithDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreams = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let data: LiveStream[];
      
      if (options?.liveOnly) {
        data = await getCurrentLiveStreams();
      } else {
        const response = await getLiveStreams({ status: options?.status });
        data = response.streams;
      }
      
      // Add display info to each stream
      const streamsWithDisplay: LiveStreamWithDisplay[] = data.map(stream => ({
        ...stream,
        viewerCountDisplay: formatViewerCount(stream.viewerCount),
        isLive: stream.status === 'live',
      }));
      
      // Sort: Live first, then by viewer count
      streamsWithDisplay.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return b.viewerCount - a.viewerCount;
      });
      
      setStreams(streamsWithDisplay);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch livestreams';
      setError(message);
      console.error('Failed to fetch livestreams:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [options?.status, options?.liveOnly]);

  useEffect(() => {
    fetchStreams(false);
  }, [fetchStreams]);

  // Auto refresh interval (useful for live viewer counts)
  useEffect(() => {
    const interval = options?.autoRefreshInterval;
    if (!interval || interval <= 0) return;

    const timer = setInterval(() => {
      fetchStreams(true);
    }, interval);

    return () => clearInterval(timer);
  }, [options?.autoRefreshInterval, fetchStreams]);

  const refresh = useCallback(async () => {
    await fetchStreams(true);
  }, [fetchStreams]);

  const liveCount = streams.filter(s => s.isLive).length;

  return {
    streams,
    loading,
    refreshing,
    error,
    refresh,
    liveCount,
  };
}
