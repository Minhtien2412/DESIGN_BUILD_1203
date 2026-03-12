/**
 * Meeting Minutes Hooks
 * State management for construction meeting management
 */

import * as meetingService from '@/services/meeting-minutes';
import type {
    ActionItem,
    Decision,
    MeetingAnalytics,
    MeetingMinutes,
    MeetingSeries,
    MeetingStatus,
    MeetingSummary,
    MeetingTemplate,
    MeetingType,
    MinutesStatus,
} from '@/types/meeting-minutes';
import { useEffect, useState } from 'react';

// Use Meeting Minutes
export const useMeetingMinutes = (params?: {
  projectId?: string;
  meetingType?: MeetingType;
  meetingStatus?: MeetingStatus;
  minutesStatus?: MinutesStatus;
  startDate?: string;
  endDate?: string;
  chairpersonId?: string;
  search?: string;
}) => {
  const [meetings, setMeetings] = useState<MeetingMinutes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getMeetingMinutes(params);
      setMeetings(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [
    params?.projectId,
    params?.meetingType,
    params?.meetingStatus,
    params?.minutesStatus,
    params?.startDate,
    params?.endDate,
    params?.chairpersonId,
    params?.search,
  ]);

  const createMeeting = async (data: Partial<MeetingMinutes>) => {
    const newMeeting = await meetingService.createMeetingMinute(data);
    setMeetings(prev => [newMeeting, ...prev]);
    return newMeeting;
  };

  const updateMeeting = async (id: string, data: Partial<MeetingMinutes>) => {
    const updated = await meetingService.updateMeetingMinute(id, data);
    setMeetings(prev => prev.map(m => (m.id === id ? updated : m)));
    return updated;
  };

  const deleteMeeting = async (id: string) => {
    await meetingService.deleteMeetingMinute(id);
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const startMeeting = async (id: string) => {
    const started = await meetingService.startMeeting(id);
    setMeetings(prev => prev.map(m => (m.id === id ? started : m)));
    return started;
  };

  const endMeeting = async (id: string) => {
    const ended = await meetingService.endMeeting(id);
    setMeetings(prev => prev.map(m => (m.id === id ? ended : m)));
    return ended;
  };

  const cancelMeeting = async (id: string, reason: string) => {
    const cancelled = await meetingService.cancelMeeting(id, reason);
    setMeetings(prev => prev.map(m => (m.id === id ? cancelled : m)));
    return cancelled;
  };

  const submitForReview = async (id: string) => {
    const submitted = await meetingService.submitForReview(id);
    setMeetings(prev => prev.map(m => (m.id === id ? submitted : m)));
    return submitted;
  };

  const approveMinutes = async (id: string, comments?: string) => {
    const approved = await meetingService.approveMinutes(id, comments);
    setMeetings(prev => prev.map(m => (m.id === id ? approved : m)));
    return approved;
  };

  const distributeMinutes = async (id: string) => {
    const distributed = await meetingService.distributeMinutes(id);
    setMeetings(prev => prev.map(m => (m.id === id ? distributed : m)));
    return distributed;
  };

  const addAttendee = async (meetingId: string, attendee: any) => {
    const updated = await meetingService.addAttendee(meetingId, attendee);
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const markAttendance = async (meetingId: string, attendances: any[]) => {
    const updated = await meetingService.markAttendance(meetingId, attendances);
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const addAgendaItem = async (meetingId: string, item: any) => {
    const updated = await meetingService.addAgendaItem(meetingId, item);
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const addDiscussion = async (meetingId: string, discussion: any) => {
    const updated = await meetingService.addDiscussion(meetingId, discussion);
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const addDecision = async (meetingId: string, decision: any) => {
    const updated = await meetingService.addDecision(meetingId, decision);
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const addActionItem = async (meetingId: string, actionItem: any) => {
    const updated = await meetingService.addActionItem(meetingId, actionItem);
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const updateActionItemProgress = async (
    meetingId: string,
    actionItemId: string,
    progress: number,
    status: string,
    comments?: string
  ) => {
    const updated = await meetingService.updateActionItemProgress(
      meetingId,
      actionItemId,
      progress,
      status,
      comments
    );
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const completeActionItem = async (
    meetingId: string,
    actionItemId: string,
    verifiedBy?: string
  ) => {
    const updated = await meetingService.completeActionItem(meetingId, actionItemId, verifiedBy);
    setMeetings(prev => prev.map(m => (m.id === meetingId ? updated : m)));
    return updated;
  };

  const refresh = fetchMeetings;

  return {
    meetings,
    loading,
    error,
    refresh,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    startMeeting,
    endMeeting,
    cancelMeeting,
    submitForReview,
    approveMinutes,
    distributeMinutes,
    addAttendee,
    markAttendance,
    addAgendaItem,
    addDiscussion,
    addDecision,
    addActionItem,
    updateActionItemProgress,
    completeActionItem,
  };
};

// Use Single Meeting
export const useMeetingMinute = (id: string) => {
  const [meeting, setMeeting] = useState<MeetingMinutes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getMeetingMinute(id);
        setMeeting(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMeeting();
    }
  }, [id]);

  return { meeting, loading, error };
};

// Use Meeting Templates
export const useMeetingTemplates = (meetingType?: MeetingType) => {
  const [templates, setTemplates] = useState<MeetingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getMeetingTemplates(meetingType);
        setTemplates(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [meetingType]);

  return { templates, loading, error };
};

// Use Meeting Series
export const useMeetingSeries = (projectId?: string) => {
  const [series, setSeries] = useState<MeetingSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getMeetingSeries(projectId);
        setSeries(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [projectId]);

  return { series, loading, error };
};

// Use All Action Items
export const useActionItems = (params?: {
  projectId?: string;
  assignedToId?: string;
  status?: string;
  priority?: string;
  overdue?: boolean;
}) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActionItems = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getAllActionItems(params);
        setActionItems(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchActionItems();
  }, [params?.projectId, params?.assignedToId, params?.status, params?.priority, params?.overdue]);

  return { actionItems, loading, error };
};

// Use All Decisions
export const useDecisions = (params?: {
  projectId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getAllDecisions(params);
        setDecisions(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, [params?.projectId, params?.type, params?.startDate, params?.endDate]);

  return { decisions, loading, error };
};

// Use Upcoming Meetings
export const useUpcomingMeetings = (projectId?: string, days?: number) => {
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingMinutes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getUpcomingMeetings(projectId, days);
        setUpcomingMeetings(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [projectId, days]);

  return { upcomingMeetings, loading, error };
};

// Use Meeting Summary
export const useMeetingSummary = (projectId: string, startDate?: string, endDate?: string) => {
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getMeetingSummary(projectId, startDate, endDate);
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

// Use Meeting Analytics
export const useMeetingAnalytics = (projectId: string, period: string) => {
  const [analytics, setAnalytics] = useState<MeetingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await meetingService.getMeetingAnalytics(projectId, period);
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
