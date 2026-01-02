/**
 * Warranty Hooks
 * State management for warranty and claims
 */

import * as warrantyService from '@/services/warranty';
import type {
    ClaimPriority,
    ClaimStatus,
    WarrantyAnalytics,
    WarrantyClaim,
    WarrantyItem,
    WarrantyRegister,
    WarrantyStatus,
    WarrantySummary,
    WarrantyType,
} from '@/types/warranty';
import { useEffect, useState } from 'react';

// Use Warranty Items
export const useWarrantyItems = (params?: {
  projectId?: string;
  status?: WarrantyStatus;
  warrantyType?: WarrantyType;
  search?: string;
  expiringWithinDays?: number;
}) => {
  const [warranties, setWarranties] = useState<WarrantyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const data = await warrantyService.getWarrantyItems(params);
      setWarranties(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, [
    params?.projectId,
    params?.status,
    params?.warrantyType,
    params?.search,
    params?.expiringWithinDays,
  ]);

  const createWarranty = async (data: Partial<WarrantyItem>) => {
    const newWarranty = await warrantyService.createWarrantyItem(data);
    setWarranties(prev => [newWarranty, ...prev]);
    return newWarranty;
  };

  const updateWarranty = async (id: string, data: Partial<WarrantyItem>) => {
    const updated = await warrantyService.updateWarrantyItem(id, data);
    setWarranties(prev => prev.map(w => (w.id === id ? updated : w)));
    return updated;
  };

  const deleteWarranty = async (id: string) => {
    await warrantyService.deleteWarrantyItem(id);
    setWarranties(prev => prev.filter(w => w.id !== id));
  };

  const refresh = fetchWarranties;

  return {
    warranties,
    loading,
    error,
    refresh,
    createWarranty,
    updateWarranty,
    deleteWarranty,
  };
};

// Use Single Warranty Item
export const useWarrantyItem = (id: string) => {
  const [warranty, setWarranty] = useState<WarrantyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWarranty = async () => {
      try {
        setLoading(true);
        const data = await warrantyService.getWarrantyItem(id);
        setWarranty(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWarranty();
    }
  }, [id]);

  return { warranty, loading, error };
};

// Use Warranty Claims
export const useWarrantyClaims = (params?: {
  warrantyId?: string;
  projectId?: string;
  status?: ClaimStatus;
  priority?: ClaimPriority;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await warrantyService.getWarrantyClaims(params);
      setClaims(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [
    params?.warrantyId,
    params?.projectId,
    params?.status,
    params?.priority,
    params?.startDate,
    params?.endDate,
    params?.search,
  ]);

  const createClaim = async (data: Partial<WarrantyClaim>) => {
    const newClaim = await warrantyService.createWarrantyClaim(data);
    setClaims(prev => [newClaim, ...prev]);
    return newClaim;
  };

  const updateClaim = async (id: string, data: Partial<WarrantyClaim>) => {
    const updated = await warrantyService.updateWarrantyClaim(id, data);
    setClaims(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteClaim = async (id: string) => {
    await warrantyService.deleteWarrantyClaim(id);
    setClaims(prev => prev.filter(c => c.id !== id));
  };

  const submitClaim = async (id: string) => {
    const submitted = await warrantyService.submitClaim(id);
    setClaims(prev => prev.map(c => (c.id === id ? submitted : c)));
    return submitted;
  };

  const approveClaim = async (id: string, approvedAmount?: number, comments?: string) => {
    const approved = await warrantyService.approveClaim(id, approvedAmount, comments);
    setClaims(prev => prev.map(c => (c.id === id ? approved : c)));
    return approved;
  };

  const rejectClaim = async (id: string, reason: string, details?: string) => {
    const rejected = await warrantyService.rejectClaim(id, reason, details);
    setClaims(prev => prev.map(c => (c.id === id ? rejected : c)));
    return rejected;
  };

  const completeClaim = async (id: string, resolution: any) => {
    const completed = await warrantyService.completeClaim(id, resolution);
    setClaims(prev => prev.map(c => (c.id === id ? completed : c)));
    return completed;
  };

  const refresh = fetchClaims;

  return {
    claims,
    loading,
    error,
    refresh,
    createClaim,
    updateClaim,
    deleteClaim,
    submitClaim,
    approveClaim,
    rejectClaim,
    completeClaim,
  };
};

// Use Single Warranty Claim
export const useWarrantyClaim = (id: string) => {
  const [claim, setClaim] = useState<WarrantyClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        setLoading(true);
        const data = await warrantyService.getWarrantyClaim(id);
        setClaim(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClaim();
    }
  }, [id]);

  return { claim, loading, error };
};

// Use Warranty Register
export const useWarrantyRegister = (projectId: string) => {
  const [register, setRegister] = useState<WarrantyRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRegister = async () => {
      try {
        setLoading(true);
        const data = await warrantyService.getWarrantyRegister(projectId);
        setRegister(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchRegister();
    }
  }, [projectId]);

  return { register, loading, error };
};

// Use Warranty Summary
export const useWarrantySummary = (
  projectId?: string,
  startDate?: string,
  endDate?: string
) => {
  const [summary, setSummary] = useState<WarrantySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await warrantyService.getWarrantySummary(projectId, startDate, endDate);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [projectId, startDate, endDate]);

  return { summary, loading, error };
};

// Use Warranty Analytics
export const useWarrantyAnalytics = (projectId: string, period: string) => {
  const [analytics, setAnalytics] = useState<WarrantyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await warrantyService.getWarrantyAnalytics(projectId, period);
        setAnalytics(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && period) {
      fetchAnalytics();
    }
  }, [projectId, period]);

  return { analytics, loading, error };
};
