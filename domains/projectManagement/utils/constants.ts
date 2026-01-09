/**
 * Constants
 * Domain-specific constants và configuration
 */

// Task priorities with weights
export const TASK_PRIORITIES = {
  critical: { weight: 4, color: '#1A1A1A', label: 'Critical' },
  high: { weight: 3, color: '#0066CC', label: 'High' },
  medium: { weight: 2, color: '#0A6847', label: 'Medium' },
  low: { weight: 1, color: '#10B981', label: 'Low' },
} as const;

// Task statuses with colors
export const TASK_STATUSES = {
  pending: { color: '#999999', label: 'Pending' },
  'in-progress': { color: '#0066CC', label: 'In Progress' },
  review: { color: '#0A6847', label: 'Under Review' },
  completed: { color: '#0066CC', label: 'Completed' },
  delayed: { color: '#1A1A1A', label: 'Delayed' },
  cancelled: { color: '#757575', label: 'Cancelled' },
} as const;

// Payment statuses with colors
export const PAYMENT_STATUSES = {
  scheduled: { color: '#999999', label: 'Scheduled' },
  pending: { color: '#0066CC', label: 'Pending' },
  processing: { color: '#0A6847', label: 'Processing' },
  completed: { color: '#0066CC', label: 'Completed' },
  overdue: { color: '#1A1A1A', label: 'Overdue' },
  cancelled: { color: '#757575', label: 'Cancelled' },
} as const;

// Task categories
export const TASK_CATEGORIES = {
  foundation: { label: 'Foundation', icon: '🏗️', color: '#1A1A1A' },
  structure: { label: 'Structure', icon: '🏢', color: '#1A1A1A' },
  roofing: { label: 'Roofing', icon: '🏠', color: '#666666' },
  walls: { label: 'Walls', icon: '🧱', color: '#0A6847' },
  electrical: { label: 'Electrical', icon: '⚡', color: '#10B981' },
  plumbing: { label: 'Plumbing', icon: '🚿', color: '#0A6847' },
  finishing: { label: 'Finishing', icon: '🎨', color: '#0A6847' },
  landscaping: { label: 'Landscaping', icon: '🌿', color: '#10B981' },
} as const;

// Payment categories
export const PAYMENT_CATEGORIES = {
  initial: { label: 'Initial Payment', percentage: 20, color: '#0A6847' },
  foundation: { label: 'Foundation', percentage: 25, color: '#1A1A1A' },
  structure: { label: 'Structure', percentage: 25, color: '#1A1A1A' },
  finishing: { label: 'Finishing', percentage: 20, color: '#0A6847' },
  final: { label: 'Final Payment', percentage: 5, color: '#10B981' },
  retention: { label: 'Retention', percentage: 5, color: '#0A6847' },
} as const;

// User roles with permissions
export const USER_ROLES = {
  admin: {
    label: 'Administrator',
    permissions: ['all'],
    color: '#1A1A1A',
  },
  manager: {
    label: 'Project Manager',
    permissions: ['view_all', 'edit_tasks', 'approve_payments', 'manage_team'],
    color: '#0A6847',
  },
  supervisor: {
    label: 'Supervisor',
    permissions: ['view_assigned', 'review_submissions', 'request_payments'],
    color: '#0A6847',
  },
  contractor: {
    label: 'Contractor',
    permissions: ['view_assigned', 'submit_progress', 'view_payments'],
    color: '#10B981',
  },
  worker: {
    label: 'Worker',
    permissions: ['view_assigned', 'submit_progress'],
    color: '#0A6847',
  },
} as const;

// File upload constraints
export const FILE_UPLOAD_LIMITS = {
  maxPhotoSize: 10 * 1024 * 1024, // 10MB
  maxDocumentSize: 25 * 1024 * 1024, // 25MB
  maxPhotosPerSubmission: 10,
  maxDocumentsPerSubmission: 5,
  allowedPhotoTypes: ['jpg', 'jpeg', 'png', 'webp'],
  allowedDocumentTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  schedulePerformance: {
    excellent: 1.1, // 110% or better
    good: 1.0,      // 100%
    average: 0.9,   // 90%
    poor: 0.8,      // Below 80%
  },
  costPerformance: {
    excellent: 1.1, // Under budget
    good: 1.0,      // On budget
    average: 0.9,   // 10% over
    poor: 0.8,      // 20% over or worse
  },
  qualityScore: {
    excellent: 9,   // 9-10
    good: 7,        // 7-8.9
    average: 5,     // 5-6.9
    poor: 3,        // Below 5
  },
} as const;

// Default pagination and limits
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultSortBy: 'updatedAt',
  defaultSortOrder: 'desc',
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  dashboard: 5 * 60 * 1000,     // 5 minutes
  tasks: 3 * 60 * 1000,        // 3 minutes
  payments: 3 * 60 * 1000,     // 3 minutes
  analytics: 10 * 60 * 1000,   // 10 minutes
  static: 30 * 60 * 1000,      // 30 minutes
} as const;

// API timeouts
export const API_TIMEOUTS = {
  default: 10000,    // 10 seconds
  upload: 60000,     // 60 seconds
  analytics: 30000,  // 30 seconds
} as const;

// Validation rules
export const VALIDATION_RULES = {
  taskName: { minLength: 3, maxLength: 100 },
  taskDescription: { minLength: 10, maxLength: 1000 },
  paymentDescription: { minLength: 10, maxLength: 500 },
  submissionDescription: { minLength: 10, maxLength: 1000 },
  currency: {
    VND: { min: 1000, max: 1000000000000 }, // 1K to 1T VND
    USD: { min: 1, max: 1000000 }, // $1 to $1M USD
  },
} as const;

// Date formats
export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  displayWithTime: 'dd/MM/yyyy HH:mm',
  api: 'yyyy-MM-dd',
  apiWithTime: 'yyyy-MM-ddTHH:mm:ss.sssZ',
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1200,
} as const;
