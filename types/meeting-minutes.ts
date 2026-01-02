/**
 * Meeting Minutes Types
 * Construction project meeting management system
 */

// Enums
export enum MeetingType {
  KICKOFF = 'KICKOFF',
  PROGRESS_REVIEW = 'PROGRESS_REVIEW',
  COORDINATION = 'COORDINATION',
  SAFETY = 'SAFETY',
  DESIGN_REVIEW = 'DESIGN_REVIEW',
  TECHNICAL = 'TECHNICAL',
  CLIENT = 'CLIENT',
  CONTRACTOR = 'CONTRACTOR',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  EMERGENCY = 'EMERGENCY',
  CLOSEOUT = 'CLOSEOUT',
  OTHER = 'OTHER',
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
}

export enum MinutesStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  DISTRIBUTED = 'DISTRIBUTED',
}

export enum AttendeeRole {
  CHAIR = 'CHAIR',
  SECRETARY = 'SECRETARY',
  ATTENDEE = 'ATTENDEE',
  GUEST = 'GUEST',
  PRESENTER = 'PRESENTER',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
  LATE = 'LATE',
}

export enum ActionItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ActionItemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum DecisionType {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEFERRED = 'DEFERRED',
  CONDITIONAL = 'CONDITIONAL',
  FOR_INFORMATION = 'FOR_INFORMATION',
}

// Main Meeting Minutes
export interface MeetingMinutes {
  id: string;
  meetingId: string;
  minutesNumber: string;
  
  // Meeting details
  meetingType: MeetingType;
  title: string;
  projectId: string;
  projectName: string;
  
  // Scheduling
  scheduledDate: string;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration?: number; // minutes
  location: string;
  venue?: string;
  isVirtual: boolean;
  virtualMeetingLink?: string;
  
  // Status
  meetingStatus: MeetingStatus;
  minutesStatus: MinutesStatus;
  
  // Attendees
  chairperson: Participant;
  secretary: Participant;
  attendees: Attendee[];
  totalInvited: number;
  totalPresent: number;
  totalAbsent: number;
  
  // Meeting content
  agenda: AgendaItem[];
  objectives?: string[];
  
  discussions: Discussion[];
  decisions: Decision[];
  actionItems: ActionItem[];
  
  // Follow-up from previous meeting
  previousMeetingId?: string;
  previousActionItems?: ActionItemReview[];
  
  // Documentation
  attachments: MeetingAttachment[];
  photos?: MeetingPhoto[];
  presentations?: Presentation[];
  
  // Summary & notes
  executiveSummary?: string;
  keyPoints?: string[];
  nextMeetingDate?: string;
  nextMeetingAgenda?: string;
  generalNotes?: string;
  
  // Distribution
  distributionList: DistributionRecipient[];
  distributedDate?: string;
  distributedBy?: {
    id: string;
    name: string;
  };
  
  // Approval workflow
  reviewers?: Reviewer[];
  approvedBy?: {
    id: string;
    name: string;
    role: string;
  };
  approvedDate?: string;
  
  // Metadata
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
  revisionHistory?: Revision[];
}

// Participant
export interface Participant {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
}

// Attendee
export interface Attendee {
  participant: Participant;
  role: AttendeeRole;
  attendanceStatus: AttendanceStatus;
  arrivalTime?: string;
  departureTime?: string;
  remarks?: string;
}

// Agenda Item
export interface AgendaItem {
  id: string;
  itemNumber: string;
  title: string;
  description?: string;
  presenter?: string;
  allocatedTime?: number; // minutes
  actualTime?: number;
  attachments?: string[];
  relatedDocuments?: string[];
  status: 'PENDING' | 'DISCUSSED' | 'DEFERRED' | 'COMPLETED';
}

// Discussion
export interface Discussion {
  id: string;
  agendaItemId?: string;
  topic: string;
  summary: string;
  keyPoints: string[];
  participants?: string[];
  timestamp?: string;
  concerns?: string[];
  recommendations?: string[];
  relatedDocuments?: string[];
}

// Decision
export interface Decision {
  id: string;
  agendaItemId?: string;
  discussionId?: string;
  decisionNumber: string;
  title: string;
  description: string;
  type: DecisionType;
  madeBy: string;
  rationale?: string;
  conditions?: string[];
  effectiveDate?: string;
  expiryDate?: string;
  relatedActions?: string[]; // action item IDs
  relatedDocuments?: string[];
  votingResults?: {
    inFavor: number;
    against: number;
    abstained: number;
    totalVotes: number;
  };
}

// Action Item
export interface ActionItem {
  id: string;
  itemNumber: string;
  agendaItemId?: string;
  discussionId?: string;
  decisionId?: string;
  
  description: string;
  details?: string;
  
  assignedTo: {
    id: string;
    name: string;
    company: string;
  };
  assignedBy: string;
  
  priority: ActionItemPriority;
  status: ActionItemStatus;
  
  dueDate: string;
  startDate?: string;
  completedDate?: string;
  
  progress: number; // percentage
  
  dependencies?: string[]; // other action item IDs
  relatedDocuments?: string[];
  
  updates?: ActionUpdate[];
  
  verifiedBy?: string;
  verificationDate?: string;
  
  remarks?: string;
}

// Action Update
export interface ActionUpdate {
  id: string;
  date: string;
  progress: number;
  status: ActionItemStatus;
  comments: string;
  updatedBy: string;
  attachments?: string[];
}

// Action Item Review (from previous meeting)
export interface ActionItemReview {
  originalActionItem: ActionItem;
  currentStatus: ActionItemStatus;
  statusUpdate: string;
  discussionNotes?: string;
  carryForward: boolean;
  newDueDate?: string;
}

// Meeting Attachment
export interface MeetingAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  category: 'AGENDA' | 'PRESENTATION' | 'REPORT' | 'DRAWING' | 'PHOTO' | 'OTHER';
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

// Meeting Photo
export interface MeetingPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption: string;
  takenBy: string;
  takenAt: string;
}

// Presentation
export interface Presentation {
  id: string;
  title: string;
  presenter: string;
  duration?: number;
  fileUrl?: string;
  summary?: string;
  keySlides?: string[];
}

// Distribution Recipient
export interface DistributionRecipient {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  deliveryMethod: 'EMAIL' | 'PORTAL' | 'HAND_DELIVERY';
  receivedDate?: string;
  acknowledged: boolean;
  acknowledgedDate?: string;
}

// Reviewer
export interface Reviewer {
  id: string;
  name: string;
  role: string;
  reviewStatus: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  reviewDate?: string;
  comments?: string;
}

// Revision
export interface Revision {
  version: number;
  date: string;
  revisedBy: string;
  changes: string;
  reason: string;
}

// Meeting Template
export interface MeetingTemplate {
  id: string;
  name: string;
  meetingType: MeetingType;
  defaultAgenda: AgendaItem[];
  defaultAttendees: Participant[];
  defaultDuration: number;
  defaultLocation: string;
  sections: {
    objectives: boolean;
    previousActionItems: boolean;
    discussions: boolean;
    decisions: boolean;
    actionItems: boolean;
    nextMeeting: boolean;
  };
  customFields?: CustomField[];
}

// Custom Field
export interface CustomField {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN';
  options?: string[];
  required: boolean;
  defaultValue?: any;
}

// Meeting Series
export interface MeetingSeries {
  id: string;
  name: string;
  meetingType: MeetingType;
  projectId: string;
  recurrence: {
    frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number; // 1-31
    time: string;
  };
  startDate: string;
  endDate?: string;
  location: string;
  defaultAttendees: Participant[];
  defaultAgenda?: string;
  isActive: boolean;
  meetings: string[]; // meeting IDs
}

// Meeting Summary
export interface MeetingSummary {
  projectId: string;
  dateRange: {
    start: string;
    end: string;
  };
  
  totalMeetings: number;
  meetingsByType: Record<MeetingType, number>;
  meetingsByStatus: Record<MeetingStatus, number>;
  
  totalActionItems: number;
  completedActionItems: number;
  overdueActionItems: number;
  actionItemCompletionRate: number;
  
  totalDecisions: number;
  decisionsByType: Record<DecisionType, number>;
  
  averageAttendanceRate: number;
  totalParticipants: number;
  
  upcomingMeetings: number;
  pendingMinutes: number;
}

// Meeting Analytics
export interface MeetingAnalytics {
  projectId: string;
  period: string;
  
  summary: MeetingSummary;
  
  meetingTrend: {
    month: string;
    count: number;
    totalDuration: number;
    averageAttendees: number;
  }[];
  
  actionItemTrend: {
    month: string;
    created: number;
    completed: number;
    overdue: number;
  }[];
  
  attendanceAnalysis: {
    participant: string;
    company: string;
    meetingsInvited: number;
    meetingsAttended: number;
    attendanceRate: number;
  }[];
  
  actionItemPerformance: {
    assignee: string;
    company: string;
    totalAssigned: number;
    completed: number;
    overdue: number;
    averageCompletionDays: number;
    completionRate: number;
  }[];
  
  meetingEfficiency: {
    meetingType: MeetingType;
    averageDuration: number;
    actionItemsPerMeeting: number;
    decisionsPerMeeting: number;
  }[];
  
  topIssues: {
    topic: string;
    frequency: number;
    openActions: number;
  }[];
}

// Export types
export interface MeetingMinutesExportOptions {
  format: 'PDF' | 'WORD' | 'EXCEL';
  includeAttachments: boolean;
  includePhotos: boolean;
  sections?: string[];
  template?: string;
}
