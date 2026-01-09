/**
 * Calculators
 * Domain-specific calculation utilities
 */

import { ProjectPayment, ProjectTask } from '../types';

/**
 * Calculate project completion percentage
 */
export const calculateProjectCompletion = (tasks: ProjectTask[]): number => {
  if (tasks.length === 0) return 0;
  
  const totalWeight = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 1), 0);
  const completedWeight = tasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + (task.estimatedDuration || 1), 0);
  
  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
};

/**
 * Calculate task completion based on submissions
 */
export const calculateTaskCompletion = (task: ProjectTask): number => {
  if (task.status === 'completed') return 100;
  if (task.status === 'pending') return 0;
  
  const latestSubmission = task.submissions
    ?.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
  
  return latestSubmission?.completionPercentage || 0;
};

/**
 * Calculate budget utilization percentage
 */
export const calculateBudgetUtilization = (
  totalBudget: number,
  totalSpent: number
): number => {
  return totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
};

/**
 * Calculate payment completion rate
 */
export const calculatePaymentCompletion = (payments: ProjectPayment[]): number => {
  if (payments.length === 0) return 0;
  
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  return totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;
};

/**
 * Calculate schedule performance index (SPI)
 */
export const calculateSPI = (
  actualProgress: number,
  plannedProgress: number
): number => {
  return plannedProgress > 0 ? actualProgress / plannedProgress : 0;
};

/**
 * Calculate cost performance index (CPI)
 */
export const calculateCPI = (
  budgetedCost: number,
  actualCost: number
): number => {
  return actualCost > 0 ? budgetedCost / actualCost : 0;
};

/**
 * Calculate estimated completion date
 */
export const calculateEstimatedCompletion = (
  startDate: string,
  tasks: ProjectTask[]
): Date => {
  const start = new Date(startDate);
  const totalDuration = tasks.reduce((sum, task) => {
    return sum + (task.estimatedDuration || 0);
  }, 0);
  
  // Add working days (assuming 5-day work week)
  const workingDaysToAdd = totalDuration;
  let currentDate = new Date(start);
  let addedDays = 0;
  
  while (addedDays < workingDaysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return currentDate;
};

/**
 * Calculate task priority score for sorting
 */
export const calculateTaskPriorityScore = (task: ProjectTask): number => {
  const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
  const statusWeights = { 
    overdue: 5, 
    delayed: 4, 
    'in-progress': 3, 
    review: 2, 
    pending: 1, 
    completed: 0 
  };
  
  const priorityScore = priorityWeights[task.priority] || 1;
  const statusScore = statusWeights[task.status as keyof typeof statusWeights] || 1;
  
  // Factor in due date urgency
  let urgencyScore = 1;
  if (task.endDate) {
    const daysUntilDue = Math.ceil(
      (new Date(task.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDue < 0) urgencyScore = 5; // Overdue
    else if (daysUntilDue <= 1) urgencyScore = 4; // Due soon
    else if (daysUntilDue <= 3) urgencyScore = 3;
    else if (daysUntilDue <= 7) urgencyScore = 2;
  }
  
  return priorityScore * 3 + statusScore * 2 + urgencyScore;
};

/**
 * Calculate payment priority score
 */
export const calculatePaymentPriorityScore = (payment: ProjectPayment): number => {
  const statusWeights = {
    overdue: 5,
    pending: 4,
    processing: 3,
    scheduled: 2,
    completed: 0,
    cancelled: 0,
  };
  
  const statusScore = statusWeights[payment.status] || 1;
  
  // Factor in due date urgency
  let urgencyScore = 1;
  const daysUntilDue = Math.ceil(
    (new Date(payment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDue < 0) urgencyScore = 5; // Overdue
  else if (daysUntilDue <= 1) urgencyScore = 4; // Due soon
  else if (daysUntilDue <= 3) urgencyScore = 3;
  else if (daysUntilDue <= 7) urgencyScore = 2;
  
  // Factor in amount (larger amounts get higher priority)
  const amountScore = payment.amount > 100000000 ? 3 : payment.amount > 50000000 ? 2 : 1; // VND amounts
  
  return statusScore * 3 + urgencyScore * 2 + amountScore;
};

/**
 * Calculate variance between planned and actual
 */
export const calculateVariance = (planned: number, actual: number): {
  absolute: number;
  percentage: number;
  type: 'positive' | 'negative' | 'neutral';
} => {
  const absolute = actual - planned;
  const percentage = planned > 0 ? (absolute / planned) * 100 : 0;
  
  let type: 'positive' | 'negative' | 'neutral';
  if (Math.abs(percentage) < 5) type = 'neutral'; // Within 5% tolerance
  else if (percentage > 0) type = 'negative'; // Over budget/schedule
  else type = 'positive'; // Under budget/ahead of schedule
  
  return { absolute, percentage, type };
};

/**
 * Calculate resource utilization
 */
export const calculateResourceUtilization = (
  allocatedHours: number,
  actualHours: number
): number => {
  return allocatedHours > 0 ? (actualHours / allocatedHours) * 100 : 0;
};

/**
 * Calculate quality score from submissions
 */
export const calculateQualityScore = (tasks: ProjectTask[]): number => {
  const submissionsWithScores = tasks
    .flatMap(task => task.submissions)
    .filter(submission => submission.qualityScore !== undefined && submission.qualityScore > 0);
  
  if (submissionsWithScores.length === 0) return 0;
  
  const totalScore = submissionsWithScores.reduce((sum, submission) => sum + (submission.qualityScore || 0), 0);
  return totalScore / submissionsWithScores.length;
};

/**
 * Calculate milestone progress
 */
export const calculateMilestoneProgress = (
  milestoneTasks: ProjectTask[]
): number => {
  if (milestoneTasks.length === 0) return 0;
  
  const totalProgress = milestoneTasks.reduce((sum, task) => {
    return sum + calculateTaskCompletion(task);
  }, 0);
  
  return totalProgress / milestoneTasks.length;
};
