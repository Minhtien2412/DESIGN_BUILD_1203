/**
 * Submittal Management Service
 */

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
import { apiFetch } from './api';

// Submittals
export const getSubmittals = async (params?: GetSubmittalsParams): Promise<Submittal[]> => {
  const queryParams = new URLSearchParams();
  if (params?.projectId) queryParams.append('projectId', params.projectId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.specSection) queryParams.append('specSection', params.specSection);
  if (params?.submitterId) queryParams.append('submitterId', params.submitterId);
  if (params?.reviewerId) queryParams.append('reviewerId', params.reviewerId);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  if (params?.isOverdue !== undefined) queryParams.append('isOverdue', String(params.isOverdue));
  
  const query = queryParams.toString();
  return apiFetch(`/submittals${query ? `?${query}` : ''}`);
};

export const getSubmittal = async (id: string): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}`);
};


export const createSubmittal = async (data: CreateSubmittalParams): Promise<Submittal> => {
  return apiFetch('/submittals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateSubmittal = async (data: UpdateSubmittalParams): Promise<Submittal> => {
  return apiFetch(`/submittals/${data.id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteSubmittal = async (id: string): Promise<void> => {
  return apiFetch(`/submittals/${id}`, { method: 'DELETE' });
};

export const submitSubmittal = async (
  id: string,
  data: {
    notes?: string;
  }
): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const reviewSubmittal = async (data: ReviewSubmittalParams): Promise<Submittal> => {
  return apiFetch(`/submittals/${data.id}/review`, {
    method: 'POST',
    body: JSON.stringify({
      actionCode: data.actionCode,
      comments: data.comments,
      requiresResubmission: data.requiresResubmission,
      notifySubmitter: data.notifySubmitter,
    }),
  });
};

export const approveSubmittal = async (id: string, comments?: string): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comments }),
  });
};

export const rejectSubmittal = async (id: string, reason: string): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const requestRevision = async (
  id: string,
  data: {
    comments: string;
    specificChanges: string[];
    resubmitByDate?: string;
  }
): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}/request-revision`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const createRevision = async (
  submittalId: string,
  data: {
    revisionNumber: string;
    changes: string;
    notes?: string;
  }
): Promise<Submittal> => {
  return apiFetch(`/submittals/${submittalId}/revisions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const withdrawSubmittal = async (id: string, reason: string): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const assignReviewer = async (
  id: string,
  data: {
    userId: string;
    role: string;
    order: number;
    reviewDays: number;
  }
): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}/reviewers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const removeReviewer = async (id: string, reviewerId: string): Promise<Submittal> => {
  return apiFetch(`/submittals/${id}/reviewers/${reviewerId}`, {
    method: 'DELETE',
  });
};

export const sendReminder = async (id: string, reviewerId: string): Promise<void> => {
  return apiFetch(`/submittals/${id}/reviewers/${reviewerId}/remind`, {
    method: 'POST',
  });
};

// Documents
export const uploadSubmittalDocument = async (
  submittalId: string,
  file: FormData
): Promise<{ url: string; thumbnailUrl?: string; documentId: string }> => {
  return apiFetch(`/submittals/${submittalId}/documents`, {
    method: 'POST',
    body: file,
    headers: {
      // Don't set Content-Type, let browser set it with boundary
    },
  });
};

export const deleteSubmittalDocument = async (
  submittalId: string,
  documentId: string
): Promise<void> => {
  return apiFetch(`/submittals/${submittalId}/documents/${documentId}`, {
    method: 'DELETE',
  });
};

export const uploadMarkup = async (
  submittalId: string,
  reviewerId: string,
  file: FormData
): Promise<{ url: string }> => {
  return apiFetch(`/submittals/${submittalId}/reviewers/${reviewerId}/markup`, {
    method: 'POST',
    body: file,
  });
};

// Templates
export const getSubmittalTemplates = async (type?: string): Promise<SubmittalTemplate[]> => {
  const params = type ? `?type=${type}` : '';
  return apiFetch(`/submittal-templates${params}`);
};

export const getSubmittalTemplate = async (id: string): Promise<SubmittalTemplate> => {
  return apiFetch(`/submittal-templates/${id}`);
};

export const createFromTemplate = async (
  templateId: string,
  data: {
    projectId: string;
    title: string;
    requiredDate: string;
    customization?: any;
  }
): Promise<Submittal> => {
  return apiFetch(`/submittal-templates/${templateId}/create-submittal`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Schedule
export const getSubmittalSchedule = async (projectId: string): Promise<SubmittalSchedule> => {
  return apiFetch(`/projects/${projectId}/submittal-schedule`);
};

export const updateSchedule = async (
  projectId: string,
  submittalNumber: string,
  data: {
    plannedSubmitDate?: string;
    requiredDate?: string;
  }
): Promise<SubmittalSchedule> => {
  return apiFetch(`/projects/${projectId}/submittal-schedule/${submittalNumber}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Logs
export const getSubmittalLogs = async (submittalId: string): Promise<SubmittalLog[]> => {
  return apiFetch(`/submittals/${submittalId}/logs`);
};

export const getProjectSubmittalLogs = async (
  projectId: string,
  fromDate?: string,
  toDate?: string
): Promise<SubmittalLog[]> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString();
  return apiFetch(`/projects/${projectId}/submittal-logs${query ? `?${query}` : ''}`);
};

// Analytics
export const getSubmittalAnalytics = async (
  projectId?: string,
  fromDate?: string,
  toDate?: string
): Promise<SubmittalAnalytics> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString();
  return apiFetch(`/submittal-analytics${query ? `?${query}` : ''}`);
};

export const getReviewPerformance = async (
  projectId?: string,
  reviewerId?: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  reviewer: {
    id: string;
    name: string;
    role: string;
  };
  totalReviews: number;
  completedReviews: number;
  pendingReviews: number;
  overdueReviews: number;
  averageReviewDays: number;
  onTimeRate: number;
  byActionCode: {
    code: string;
    count: number;
  }[];
}> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (reviewerId) params.append('reviewerId', reviewerId);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString();
  return apiFetch(`/submittal-analytics/review-performance${query ? `?${query}` : ''}`);
};

export const getSubmitterPerformance = async (
  projectId?: string,
  submitterId?: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  submitter: {
    id: string;
    name: string;
    company: string;
  };
  totalSubmittals: number;
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: number;
  resubmissionRate: number;
  averageReviewDays: number;
  onTimeSubmissionRate: number;
}> => {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (submitterId) params.append('submitterId', submitterId);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const query = params.toString();
  return apiFetch(`/submittal-analytics/submitter-performance${query ? `?${query}` : ''}`);
};

// Reports
export const exportSubmittalRegister = async (
  projectId: string,
  format: 'PDF' | 'EXCEL' | 'CSV'
): Promise<Blob> => {
  return apiFetch(`/projects/${projectId}/submittal-register/export?format=${format}`, {
    responseType: 'blob',
  });
};

export const exportSubmittalLog = async (
  submittalId: string,
  format: 'PDF' | 'EXCEL'
): Promise<Blob> => {
  return apiFetch(`/submittals/${submittalId}/log/export?format=${format}`, {
    responseType: 'blob',
  });
};

export const exportSubmittalPackage = async (
  submittalId: string,
  includeMarkups: boolean = true
): Promise<Blob> => {
  return apiFetch(
    `/submittals/${submittalId}/package/export?includeMarkups=${includeMarkups}`,
    {
      responseType: 'blob',
    }
  );
};
