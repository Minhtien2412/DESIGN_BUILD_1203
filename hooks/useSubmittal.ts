/**
 * Submittal Management Hooks
 */

import * as submittalService from '@/services/submittal';
import type {
    CreateSubmittalParams,
    GetSubmittalsParams,
    ReviewSubmittalParams,
    Submittal,
    SubmittalAnalytics,
    SubmittalLog,
    SubmittalSchedule,
    SubmittalTemplate,
    UpdateSubmittalParams,
} from '@/types/submittal';
import { useEffect, useState } from 'react';

// Submittals Hook
export const useSubmittals = (params?: GetSubmittalsParams) => {
  const [submittals, setSubmittals] = useState<Submittal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmittals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submittalService.getSubmittals(params);
      setSubmittals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submittals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittals();
  }, [JSON.stringify(params)]);

  const createSubmittal = async (data: CreateSubmittalParams) => {
    try {
      const newSubmittal = await submittalService.createSubmittal(data);
      setSubmittals(prev => [newSubmittal, ...prev]);
      return newSubmittal;
    } catch (err) {
      throw err;
    }
  };

  const updateSubmittal = async (data: UpdateSubmittalParams) => {
    try {
      const updated = await submittalService.updateSubmittal(data);
      setSubmittals(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteSubmittal = async (id: string) => {
    try {
      await submittalService.deleteSubmittal(id);
      setSubmittals(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const submitSubmittal = async (id: string, notes?: string) => {
    try {
      const updated = await submittalService.submitSubmittal(id, { notes });
      setSubmittals(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const reviewSubmittal = async (data: ReviewSubmittalParams) => {
    try {
      const updated = await submittalService.reviewSubmittal(data);
      setSubmittals(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const approveSubmittal = async (id: string, comments?: string) => {
    try {
      const updated = await submittalService.approveSubmittal(id, comments);
      setSubmittals(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const rejectSubmittal = async (id: string, reason: string) => {
    try {
      const updated = await submittalService.rejectSubmittal(id, reason);
      setSubmittals(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const requestRevision = async (
    id: string,
    data: {
      comments: string;
      specificChanges: string[];
      resubmitByDate?: string;
    }
  ) => {
    try {
      const updated = await submittalService.requestRevision(id, data);
      setSubmittals(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const withdrawSubmittal = async (id: string, reason: string) => {
    try {
      const updated = await submittalService.withdrawSubmittal(id, reason);
      setSubmittals(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    submittals,
    loading,
    error,
    refresh: fetchSubmittals,
    createSubmittal,
    updateSubmittal,
    deleteSubmittal,
    submitSubmittal,
    reviewSubmittal,
    approveSubmittal,
    rejectSubmittal,
    requestRevision,
    withdrawSubmittal,
  };
};

// Single Submittal Hook
export const useSubmittal = (id: string) => {
  const [submittal, setSubmittal] = useState<Submittal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmittal = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await submittalService.getSubmittal(id);
        setSubmittal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch submittal');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmittal();
    }
  }, [id]);

  return { submittal, loading, error };
};

// Submittal Templates Hook
export const useSubmittalTemplates = (type?: string) => {
  const [templates, setTemplates] = useState<SubmittalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await submittalService.getSubmittalTemplates(type);
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [type]);

  return { templates, loading, error };
};

// Submittal Schedule Hook
export const useSubmittalSchedule = (projectId: string) => {
  const [schedule, setSchedule] = useState<SubmittalSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submittalService.getSubmittalSchedule(projectId);
      setSchedule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSchedule();
    }
  }, [projectId]);

  const updateSchedule = async (
    submittalNumber: string,
    data: {
      plannedSubmitDate?: string;
      requiredDate?: string;
    }
  ) => {
    try {
      const updated = await submittalService.updateSchedule(projectId, submittalNumber, data);
      setSchedule(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    schedule,
    loading,
    error,
    refresh: fetchSchedule,
    updateSchedule,
  };
};

// Submittal Logs Hook
export const useSubmittalLogs = (submittalId: string) => {
  const [logs, setLogs] = useState<SubmittalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await submittalService.getSubmittalLogs(submittalId);
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    if (submittalId) {
      fetchLogs();
    }
  }, [submittalId]);

  return { logs, loading, error };
};

// Submittal Analytics Hook
export const useSubmittalAnalytics = (
  projectId?: string,
  fromDate?: string,
  toDate?: string
) => {
  const [analytics, setAnalytics] = useState<SubmittalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await submittalService.getSubmittalAnalytics(projectId, fromDate, toDate);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId, fromDate, toDate]);

  return { analytics, loading, error };
};
