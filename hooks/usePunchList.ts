/**
 * Punch List Hooks
 * State management for construction punch list management
 */

import * as punchListService from '@/services/punch-list';
import type {
    PunchItemCategory,
    PunchItemPriority,
    PunchItemStatus,
    PunchList,
    PunchListAnalytics,
    PunchListItem,
    PunchListStatus,
    PunchListSummary,
    PunchListTemplate,
} from '@/types/punch-list';
import { useEffect, useState } from 'react';

// Use Punch Lists
export const usePunchLists = (params?: {
  projectId?: string;
  status?: PunchListStatus;
  listType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  const [punchLists, setPunchLists] = useState<PunchList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPunchLists = async () => {
    try {
      setLoading(true);
      const data = await punchListService.getPunchLists(params);
      setPunchLists(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPunchLists();
  }, [
    params?.projectId,
    params?.status,
    params?.listType,
    params?.startDate,
    params?.endDate,
    params?.search,
  ]);

  const createPunchList = async (data: Partial<PunchList>) => {
    const newList = await punchListService.createPunchList(data);
    setPunchLists(prev => [newList, ...prev]);
    return newList;
  };

  const updatePunchList = async (id: string, data: Partial<PunchList>) => {
    const updated = await punchListService.updatePunchList(id, data);
    setPunchLists(prev => prev.map(pl => (pl.id === id ? updated : pl)));
    return updated;
  };

  const deletePunchList = async (id: string) => {
    await punchListService.deletePunchList(id);
    setPunchLists(prev => prev.filter(pl => pl.id !== id));
  };

  const submitPunchList = async (id: string, notes?: string) => {
    const submitted = await punchListService.submitPunchList(id, notes);
    setPunchLists(prev => prev.map(pl => (pl.id === id ? submitted : pl)));
    return submitted;
  };

  const approvePunchList = async (id: string, comments?: string) => {
    const approved = await punchListService.approvePunchList(id, comments);
    setPunchLists(prev => prev.map(pl => (pl.id === id ? approved : pl)));
    return approved;
  };

  const closePunchList = async (id: string, comments?: string) => {
    const closed = await punchListService.closePunchList(id, comments);
    setPunchLists(prev => prev.map(pl => (pl.id === id ? closed : pl)));
    return closed;
  };

  const addPunchItem = async (punchListId: string, data: Partial<PunchListItem>) => {
    const updated = await punchListService.addPunchItem(punchListId, data);
    setPunchLists(prev => prev.map(pl => (pl.id === punchListId ? updated : pl)));
    return updated;
  };

  const updatePunchItem = async (punchListId: string, itemId: string, data: Partial<PunchListItem>) => {
    const updated = await punchListService.updatePunchItem(punchListId, itemId, data);
    setPunchLists(prev => prev.map(pl => (pl.id === punchListId ? updated : pl)));
    return updated;
  };

  const deletePunchItem = async (punchListId: string, itemId: string) => {
    const updated = await punchListService.deletePunchItem(punchListId, itemId);
    setPunchLists(prev => prev.map(pl => (pl.id === punchListId ? updated : pl)));
    return updated;
  };

  const markItemReadyForReview = async (punchListId: string, itemId: string, comments?: string) => {
    const updated = await punchListService.markItemReadyForReview(punchListId, itemId, comments);
    setPunchLists(prev => prev.map(pl => (pl.id === punchListId ? updated : pl)));
    return updated;
  };

  const verifyPunchItem = async (punchListId: string, itemId: string, data: any) => {
    const updated = await punchListService.verifyPunchItem(punchListId, itemId, data);
    setPunchLists(prev => prev.map(pl => (pl.id === punchListId ? updated : pl)));
    return updated;
  };

  const rejectPunchItem = async (punchListId: string, itemId: string, reason: string) => {
    const updated = await punchListService.rejectPunchItem(punchListId, itemId, reason);
    setPunchLists(prev => prev.map(pl => (pl.id === punchListId ? updated : pl)));
    return updated;
  };

  const closePunchItem = async (punchListId: string, itemId: string, comments?: string) => {
    const updated = await punchListService.closePunchItem(punchListId, itemId, comments);
    setPunchLists(prev => prev.map(pl => (pl.id === punchListId ? updated : pl)));
    return updated;
  };

  const refresh = fetchPunchLists;

  return {
    punchLists,
    loading,
    error,
    refresh,
    createPunchList,
    updatePunchList,
    deletePunchList,
    submitPunchList,
    approvePunchList,
    closePunchList,
    addPunchItem,
    updatePunchItem,
    deletePunchItem,
    markItemReadyForReview,
    verifyPunchItem,
    rejectPunchItem,
    closePunchItem,
  };
};

// Use Single Punch List
export const usePunchList = (id: string) => {
  const [punchList, setPunchList] = useState<PunchList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPunchList = async () => {
      try {
        setLoading(true);
        const data = await punchListService.getPunchList(id);
        setPunchList(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPunchList();
    }
  }, [id]);

  return { punchList, loading, error };
};

// Use Punch Items
export const usePunchItems = (punchListId: string, params?: {
  status?: PunchItemStatus;
  priority?: PunchItemPriority;
  category?: PunchItemCategory;
  responsibleParty?: string;
  assignedTo?: string;
  overdue?: boolean;
}) => {
  const [items, setItems] = useState<PunchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await punchListService.getPunchItems(punchListId, params);
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (punchListId) {
      fetchItems();
    }
  }, [
    punchListId,
    params?.status,
    params?.priority,
    params?.category,
    params?.responsibleParty,
    params?.assignedTo,
    params?.overdue,
  ]);

  return { items, loading, error };
};

// Use All Punch Items
export const useAllPunchItems = (params?: {
  projectId?: string;
  status?: PunchItemStatus;
  priority?: PunchItemPriority;
  category?: PunchItemCategory;
  assignedTo?: string;
  overdue?: boolean;
}) => {
  const [items, setItems] = useState<PunchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await punchListService.getAllPunchItems(params);
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [
    params?.projectId,
    params?.status,
    params?.priority,
    params?.category,
    params?.assignedTo,
    params?.overdue,
  ]);

  return { items, loading, error };
};

// Use Punch List Templates
export const usePunchListTemplates = (category?: PunchItemCategory) => {
  const [templates, setTemplates] = useState<PunchListTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await punchListService.getPunchListTemplates(category);
        setTemplates(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [category]);

  return { templates, loading, error };
};

// Use Punch List Summary
export const usePunchListSummary = (projectId: string, startDate?: string, endDate?: string) => {
  const [summary, setSummary] = useState<PunchListSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await punchListService.getPunchListSummary(projectId, startDate, endDate);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchSummary();
    }
  }, [projectId, startDate, endDate]);

  return { summary, loading, error };
};

// Use Punch List Analytics
export const usePunchListAnalytics = (projectId: string, period: string) => {
  const [analytics, setAnalytics] = useState<PunchListAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await punchListService.getPunchListAnalytics(projectId, period);
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
