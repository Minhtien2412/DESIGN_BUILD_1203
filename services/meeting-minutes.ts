/**
 * Meeting Minutes Service
 * API integration for construction meeting management
 */

import type {
    ActionItem,
    Decision,
    MeetingAnalytics,
    MeetingMinutes,
    MeetingMinutesExportOptions,
    MeetingSeries,
    MeetingStatus,
    MeetingSummary,
    MeetingTemplate,
    MeetingType,
    MinutesStatus,
} from '@/types/meeting-minutes';
import { apiFetch } from './api';

// Meeting Minutes
export const getMeetingMinutes = async (params?: {
  projectId?: string;
  meetingType?: MeetingType;
  meetingStatus?: MeetingStatus;
  minutesStatus?: MinutesStatus;
  startDate?: string;
  endDate?: string;
  chairpersonId?: string;
  search?: string;
}): Promise<MeetingMinutes[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.meetingType) queryParams.append('meetingType', params.meetingType);
  if (params?.meetingStatus) queryParams.append('meetingStatus', params.meetingStatus);
  if (params?.minutesStatus) queryParams.append('minutesStatus', params.minutesStatus);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.chairpersonId) queryParams.append('chairpersonId', params.chairpersonId);
  if (params?.search) queryParams.append('search', params.search);

  return apiFetch<MeetingMinutes[]>(`/meeting-minutes?${queryParams.toString()}`);
};

export const getMeetingMinute = async (id: string): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}`);
};

export const createMeetingMinute = async (
  data: Partial<MeetingMinutes>
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>('/meeting-minutes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMeetingMinute = async (
  id: string,
  data: Partial<MeetingMinutes>
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteMeetingMinute = async (id: string): Promise<void> => {
  return apiFetch<void>(`/meeting-minutes/${id}`, {
    method: 'DELETE',
  });
};

// Meeting workflow
export const startMeeting = async (id: string): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/start`, {
    method: 'POST',
  });
};

export const endMeeting = async (id: string): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/end`, {
    method: 'POST',
  });
};

export const cancelMeeting = async (id: string, reason: string): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const postponeMeeting = async (
  id: string,
  newDate: string,
  newTime: string,
  reason?: string
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/postpone`, {
    method: 'POST',
    body: JSON.stringify({ newDate, newTime, reason }),
  });
};

// Minutes workflow
export const submitForReview = async (id: string): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/submit`, {
    method: 'POST',
  });
};

export const reviewMinutes = async (
  id: string,
  data: {
    approved: boolean;
    comments?: string;
  }
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveMinutes = async (id: string, comments?: string): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const distributeMinutes = async (id: string): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${id}/distribute`, {
    method: 'POST',
  });
};

// Attendees
export const addAttendee = async (minutesId: string, attendee: any): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/attendees`, {
    method: 'POST',
    body: JSON.stringify(attendee),
  });
};

export const updateAttendeeStatus = async (
  minutesId: string,
  attendeeId: string,
  status: string
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/attendees/${attendeeId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const markAttendance = async (
  minutesId: string,
  attendances: { participantId: string; status: string; arrivalTime?: string }[]
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/attendance`, {
    method: 'POST',
    body: JSON.stringify({ attendances }),
  });
};

// Agenda items
export const addAgendaItem = async (minutesId: string, item: any): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/agenda`, {
    method: 'POST',
    body: JSON.stringify(item),
  });
};

export const updateAgendaItem = async (
  minutesId: string,
  itemId: string,
  data: any
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/agenda/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteAgendaItem = async (
  minutesId: string,
  itemId: string
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/agenda/${itemId}`, {
    method: 'DELETE',
  });
};

// Discussions
export const addDiscussion = async (
  minutesId: string,
  discussion: any
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/discussions`, {
    method: 'POST',
    body: JSON.stringify(discussion),
  });
};

export const updateDiscussion = async (
  minutesId: string,
  discussionId: string,
  data: any
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/discussions/${discussionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Decisions
export const addDecision = async (minutesId: string, decision: any): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/decisions`, {
    method: 'POST',
    body: JSON.stringify(decision),
  });
};

export const updateDecision = async (
  minutesId: string,
  decisionId: string,
  data: any
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/decisions/${decisionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Action items
export const addActionItem = async (
  minutesId: string,
  actionItem: any
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/action-items`, {
    method: 'POST',
    body: JSON.stringify(actionItem),
  });
};

export const updateActionItem = async (
  minutesId: string,
  actionItemId: string,
  data: any
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-minutes/${minutesId}/action-items/${actionItemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const updateActionItemProgress = async (
  minutesId: string,
  actionItemId: string,
  progress: number,
  status: string,
  comments?: string
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(
    `/meeting-minutes/${minutesId}/action-items/${actionItemId}/progress`,
    {
      method: 'POST',
      body: JSON.stringify({ progress, status, comments }),
    }
  );
};

export const completeActionItem = async (
  minutesId: string,
  actionItemId: string,
  verifiedBy?: string
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(
    `/meeting-minutes/${minutesId}/action-items/${actionItemId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({ verifiedBy }),
    }
  );
};

// Attachments
export const uploadAttachment = async (
  minutesId: string,
  attachment: FormData
): Promise<{ url: string; attachmentId: string }> => {
  return apiFetch<{ url: string; attachmentId: string }>(
    `/meeting-minutes/${minutesId}/attachments`,
    {
      method: 'POST',
      body: attachment,
      headers: {},
    }
  );
};

export const deleteAttachment = async (
  minutesId: string,
  attachmentId: string
): Promise<void> => {
  return apiFetch<void>(`/meeting-minutes/${minutesId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
};

// Photos
export const uploadPhoto = async (
  minutesId: string,
  photo: FormData
): Promise<{ url: string; thumbnailUrl?: string; photoId: string }> => {
  return apiFetch<{ url: string; thumbnailUrl?: string; photoId: string }>(
    `/meeting-minutes/${minutesId}/photos`,
    {
      method: 'POST',
      body: photo,
      headers: {},
    }
  );
};

// Templates
export const getMeetingTemplates = async (
  meetingType?: MeetingType
): Promise<MeetingTemplate[]> => {
  const params = meetingType ? `?meetingType=${meetingType}` : '';
  return apiFetch<MeetingTemplate[]>(`/meeting-templates${params}`);
};

export const getMeetingTemplate = async (id: string): Promise<MeetingTemplate> => {
  return apiFetch<MeetingTemplate>(`/meeting-templates/${id}`);
};

export const createFromTemplate = async (
  templateId: string,
  data: {
    projectId: string;
    scheduledDate: string;
    scheduledTime: string;
    location: string;
  }
): Promise<MeetingMinutes> => {
  return apiFetch<MeetingMinutes>(`/meeting-templates/${templateId}/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Meeting Series
export const getMeetingSeries = async (projectId?: string): Promise<MeetingSeries[]> => {
  const params = projectId ? `?projectId=${projectId}` : '';
  return apiFetch<MeetingSeries[]>(`/meeting-series${params}`);
};

export const createMeetingSeries = async (data: Partial<MeetingSeries>): Promise<MeetingSeries> => {
  return apiFetch<MeetingSeries>('/meeting-series', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMeetingSeries = async (
  id: string,
  data: Partial<MeetingSeries>
): Promise<MeetingSeries> => {
  return apiFetch<MeetingSeries>(`/meeting-series/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Action items across meetings
export const getAllActionItems = async (params?: {
  projectId?: string;
  assignedToId?: string;
  status?: string;
  priority?: string;
  overdue?: boolean;
}): Promise<ActionItem[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.assignedToId) queryParams.append('assignedToId', params.assignedToId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.overdue !== undefined) queryParams.append('overdue', String(params.overdue));

  return apiFetch<ActionItem[]>(`/action-items?${queryParams.toString()}`);
};

export const getActionItemsByMeeting = async (meetingId: string): Promise<ActionItem[]> => {
  return apiFetch<ActionItem[]>(`/meeting-minutes/${meetingId}/action-items`);
};

// Decisions across meetings
export const getAllDecisions = async (params?: {
  projectId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Decision[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  return apiFetch<Decision[]>(`/decisions?${queryParams.toString()}`);
};

// Summary & Analytics
export const getMeetingSummary = async (
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<MeetingSummary> => {
  const params = new URLSearchParams({ projectId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return apiFetch<MeetingSummary>(`/meeting-minutes/summary?${params.toString()}`);
};

export const getMeetingAnalytics = async (
  projectId: string,
  period: string
): Promise<MeetingAnalytics> => {
  return apiFetch<MeetingAnalytics>(
    `/meeting-minutes/analytics?projectId=${projectId}&period=${period}`
  );
};

// Upcoming meetings
export const getUpcomingMeetings = async (
  projectId?: string,
  days?: number
): Promise<MeetingMinutes[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (days) params.append('days', String(days));

  return apiFetch<MeetingMinutes[]>(`/meeting-minutes/upcoming?${params.toString()}`);
};

// Reports
export const exportMeetingMinutes = async (
  id: string,
  options: MeetingMinutesExportOptions
): Promise<Blob> => {
  return apiFetch<Blob>(`/meeting-minutes/${id}/export`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

export const exportActionItemsReport = async (
  projectId: string,
  startDate: string,
  endDate: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch<Blob>(
    `/action-items/export?projectId=${projectId}&startDate=${startDate}&endDate=${endDate}&format=${format}`
  );
};

export const exportDecisionsRegister = async (
  projectId: string,
  startDate: string,
  endDate: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch<Blob>(
    `/decisions/export?projectId=${projectId}&startDate=${startDate}&endDate=${endDate}&format=${format}`
  );
};

export const exportMeetingRegister = async (
  projectId: string,
  year: number,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch<Blob>(
    `/meeting-minutes/export-register?projectId=${projectId}&year=${year}&format=${format}`
  );
};
