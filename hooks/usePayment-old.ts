// @ts-nocheck
import { AuthStore } from '@/services/authStore';
import { paymentClient, type Payment, type PaymentConfirmInput, type PaymentCreateInput, type PaymentListQuery } from '@/services/tk-api';
import React, { useCallback, useState } from 'react';

interface UsePaymentCreateResult {
  createPayment: (input: PaymentCreateInput) => Promise<void>;
  payment: Payment | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for creating payments with auth token
 */
export function usePaymentCreate(): UsePaymentCreateResult {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (input: PaymentCreateInput) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await AuthStore.getAccessToken();
      const result = await paymentClient.createPayment(input, accessToken);
      setPayment(result.payment);
    } catch (err: any) {
      setError(err?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPayment(null);
    setError(null);
    setLoading(false);
  }, []);

  return { createPayment, payment, loading, error, reset };
}

interface UsePaymentResult {
  payment: Payment | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  confirmPayment: (input?: PaymentConfirmInput) => Promise<void>;
  confirming: boolean;
}

/**
 * Hook for getting a single payment by ID with auth token
 */
export function usePayment(id: string): UsePaymentResult {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const fetchPayment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const accessToken = await AuthStore.getAccessToken();
      const result = await paymentClient.getPayment(id, accessToken);
      setPayment(result.payment);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch payment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const confirmPayment = useCallback(async (input: PaymentConfirmInput = { status: 'paid' }) => {
    if (!id) return;
    setConfirming(true);
    setError(null);
    try {
      const accessToken = await AuthStore.getAccessToken();
      const result = await paymentClient.confirmPayment(id, input, accessToken);
      setPayment(result.payment);
    } catch (err: any) {
      setError(err?.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  return { payment, loading, error, refetch: fetchPayment, confirmPayment, confirming };
}

interface UsePaymentListResult {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  total: number;
}

/**
 * Hook for listing payments with pagination and auth token
 */
export function usePaymentList(query: PaymentListQuery = {}): UsePaymentListResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPayments = useCallback(async (page: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await AuthStore.getAccessToken();
      const result = await paymentClient.listPayments(
        { ...query, page, page_size: query.page_size || 20 },
        accessToken
      );
      
      if (append) {
        setPayments(prev => [...prev, ...result.payments]);
      } else {
        setPayments(result.payments);
      }
      
      setTotal(result.total);
      setHasMore(page < result.total_pages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchPayments(currentPage + 1, true);
  }, [hasMore, loading, currentPage, fetchPayments]);

  const refetch = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchPayments(1, false);
  }, [fetchPayments]);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, refetch, loadMore, hasMore, total };
}

interface UseHealthCheckResult {
  healthCheck: () => Promise<void>;
  isHealthy: boolean;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

/**
 * Hook for health check (no auth required)
 */
export function useHealthCheck(): UseHealthCheckResult {
  const [isHealthy, setIsHealthy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const healthCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await paymentClient.healthCheck();
      setIsHealthy(true);
      setLastChecked(new Date());
    } catch (err: any) {
      setIsHealthy(false);
      setError(err?.message || 'Health check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { healthCheck, isHealthy, loading, error, lastChecked };
}

// Legacy hook for videos (keeping for compatibility)
interface UseVideosResult {
  videos: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVideos(limit: number = 20): UseVideosResult {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentClient.getVideos(limit);
      setVideos(result?.videos || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, refetch: fetchVideos };
}

/**
 * Hook for fetching and confirming a specific payment
 */
export function usePayment(id: string | null): UsePaymentResult {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await paymentClient.getPayment(id);
      setPayment(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch payment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const confirmPayment = useCallback(async (input: PaymentConfirmInput = { status: 'paid' }) => {
    if (!id) return;
    
    setConfirming(true);
    setError(null);
    try {
      const result = await paymentClient.confirmPayment(id, input);
      setPayment(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  }, [id]);

  // Auto-fetch when id changes
  React.useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return { payment, loading, error, refetch, confirmPayment, confirming };
}

interface UseHealthCheckResult {
  healthCheck: () => Promise<void>;
  isHealthy: boolean | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for API health checking
 */
export function useHealthCheck(): UseHealthCheckResult {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const healthCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await paymentClient.healthCheck();
      setIsHealthy(true);
    } catch (err: any) {
      setIsHealthy(false);
      setError(err?.message || 'Health check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { healthCheck, isHealthy, loading, error };
}

interface UseVideosResult {
  videos: any[] | null;
  loading: boolean;
  error: string | null;
  refetch: (limit?: number) => Promise<void>;
}

/**
 * Hook for fetching videos from API
 */
export function useVideos(initialLimit: number = 20): UseVideosResult {
  const [videos, setVideos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (limit: number = initialLimit) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentClient.getVideos(limit);
      setVideos(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  // Auto-fetch on mount
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return { videos, loading, error, refetch };
}