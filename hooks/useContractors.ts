/**
 * useContractors Hook
 * Custom hook for fetching and managing contractors data
 */

import { useCallback, useEffect, useState } from 'react';
import { Contractor, contractorsApi, ContractorSearchFilters } from '../services/contractors.api';

export const useContractors = (initialFilters: ContractorSearchFilters = {}) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ContractorSearchFilters>(initialFilters);

  const fetchContractors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contractorsApi.search({ ...filters, page });
      setContractors(response.contractors);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching contractors:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const updateFilters = useCallback((newFilters: Partial<ContractorSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return {
    contractors,
    loading,
    error,
    total,
    page,
    filters,
    updateFilters,
    loadMore,
    refetch: fetchContractors,
  };
};

/**
 * useContractor Hook
 * Fetch single contractor by ID
 */
export const useContractor = (contractorId: string | null) => {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContractor = useCallback(async () => {
    if (!contractorId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await contractorsApi.getById(contractorId);
      setContractor(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching contractor:', err);
    } finally {
      setLoading(false);
    }
  }, [contractorId]);

  useEffect(() => {
    fetchContractor();
  }, [fetchContractor]);

  return {
    contractor,
    loading,
    error,
    refetch: fetchContractor,
  };
};

/**
 * useContractorReviews Hook
 * Fetch contractor reviews with pagination
 */
export const useContractorReviews = (contractorId: string | null) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReviews = useCallback(async () => {
    if (!contractorId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await contractorsApi.getReviews(contractorId, page);
      setReviews(prev => page === 1 ? response.reviews : [...prev, ...response.reviews]);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [contractorId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return {
    reviews,
    loading,
    error,
    total,
    page,
    loadMore,
    refetch: fetchReviews,
  };
};
