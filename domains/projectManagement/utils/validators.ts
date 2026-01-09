/**
 * Validators
 * Domain-specific validation utilities
 */

import { ProjectPayment, ProjectTask, TaskSubmission } from '../types';

/**
 * Validate task data
 */
export const validateTask = (task: Partial<ProjectTask>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Required fields
  if (!task.name || task.name.trim().length < 3) {
    errors.push('Task name must be at least 3 characters long');
  }

  if (!task.description || task.description.trim().length < 10) {
    errors.push('Task description must be at least 10 characters long');
  }

  if (!task.category) {
    errors.push('Task category is required');
  }

  if (!task.priority) {
    errors.push('Task priority is required');
  }

  if (!task.estimatedDuration || task.estimatedDuration <= 0) {
    errors.push('Estimated duration must be greater than 0');
  }

  if (!task.estimatedCost || task.estimatedCost <= 0) {
    errors.push('Estimated cost must be greater than 0');
  }

  // Date validation
  if (task.startDate && task.endDate) {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }
  }

  // Assignee validation
  if (!task.assignedTo || !task.assignedTo.id || !task.assignedTo.name) {
    errors.push('Task must be assigned to a valid person/company');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate task submission
 */
export const validateTaskSubmission = (submission: Partial<TaskSubmission>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!submission.description || submission.description.trim().length < 10) {
    errors.push('Submission description must be at least 10 characters long');
  }

  if (submission.completionPercentage === undefined || 
      submission.completionPercentage < 0 || 
      submission.completionPercentage > 100) {
    errors.push('Completion percentage must be between 0 and 100');
  }

  if (!submission.evidencePhotos || submission.evidencePhotos.length === 0) {
    errors.push('At least one evidence photo is required');
  }

  if (submission.evidencePhotos && submission.evidencePhotos.length > 10) {
    errors.push('Maximum 10 evidence photos allowed');
  }

  if (submission.evidenceDocuments && submission.evidenceDocuments.length > 5) {
    errors.push('Maximum 5 evidence documents allowed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate payment data
 */
export const validatePayment = (payment: Partial<ProjectPayment>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!payment.amount || payment.amount <= 0) {
    errors.push('Payment amount must be greater than 0');
  }

  if (!payment.category) {
    errors.push('Payment category is required');
  }

  if (!payment.type) {
    errors.push('Payment type is required');
  }

  if (!payment.dueDate) {
    errors.push('Due date is required');
  } else {
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    
    if (dueDate < today) {
      errors.push('Due date cannot be in the past');
    }
  }

  if (!payment.paymentMethod) {
    errors.push('Payment method is required');
  }

  // Trigger conditions validation
  if (payment.triggerType === 'task-completion' && 
      (!payment.triggerConditions?.requiredTasks || payment.triggerConditions.requiredTasks.length === 0)) {
    errors.push('Required tasks must be specified for task-completion trigger');
  }

  if (payment.triggerType === 'milestone' && !payment.triggerConditions?.requiredMilestone) {
    errors.push('Required milestone must be specified for milestone trigger');
  }

  if (payment.triggerType === 'time-based' && !payment.triggerConditions?.requiredDate) {
    errors.push('Required date must be specified for time-based trigger');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+84|84|0)([3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate file type for uploads
 */
export const validateFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

/**
 * Validate file size
 */
export const validateFileSize = (sizeInBytes: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

/**
 * Validate percentage value
 */
export const validatePercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};

/**
 * Validate currency amount
 */
export const validateCurrencyAmount = (amount: number, currency: 'VND' | 'USD'): boolean => {
  if (amount <= 0) return false;
  
  // VND should be whole numbers
  if (currency === 'VND') {
    return Number.isInteger(amount);
  }
  
  // USD can have up to 2 decimal places
  return Number((amount).toFixed(2)) === amount;
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate: string, endDate: string): {
  isValid: boolean;
  error?: string;
} => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  if (end <= start) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  return { isValid: true };
};
