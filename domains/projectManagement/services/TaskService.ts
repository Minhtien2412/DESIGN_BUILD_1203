/**
 * Task Service
 * Domain-specific business logic cho task management
 */

import { projectProgressService } from '../../../services/projectProgressService';
import { ProjectTask, TaskSubmission } from '../../../types/projectProgress';

export class TaskService {
  /**
   * Get tasks with advanced filtering and sorting
   */
  static async getFilteredTasks(
    projectId: string,
    filters: {
      status?: ProjectTask['status'][];
      category?: ProjectTask['category'][];
      priority?: ProjectTask['priority'][];
      assignedTo?: string;
      overdue?: boolean;
    } = {}
  ) {
    try {
      const response = await projectProgressService.getProjectTasks(projectId, filters);
      
      if (response.success && response.data) {
        let tasks = response.data;

        // Apply additional filtering
        if (filters.overdue) {
          tasks = tasks.filter(task => 
            task.endDate && new Date(task.endDate) < new Date() && task.status !== 'completed'
          );
        }

        // Sort by priority and due date
        tasks.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority];
          const bPriority = priorityOrder[b.priority];
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority; // Higher priority first
          }
          
          // If same priority, sort by due date
          if (a.endDate && b.endDate) {
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          }
          
          return 0;
        });

        return { success: true, data: tasks };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load tasks',
      };
    }
  }

  /**
   * Calculate task completion percentage
   */
  static calculateTaskCompletion(task: ProjectTask): number {
    if (task.status === 'completed') return 100;
    if (task.status === 'pending') return 0;

    // Get latest submission completion percentage
    const latestSubmission = task.submissions
      ?.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

    return latestSubmission?.completionPercentage || 0;
  }

  /**
   * Check if task is overdue
   */
  static isTaskOverdue(task: ProjectTask): boolean {
    if (task.status === 'completed') return false;
    if (!task.endDate) return false;
    
    return new Date(task.endDate) < new Date();
  }

  /**
   * Get task risk level
   */
  static getTaskRiskLevel(task: ProjectTask): 'low' | 'medium' | 'high' | 'critical' {
    const isOverdue = this.isTaskOverdue(task);
    const completion = this.calculateTaskCompletion(task);
    const daysUntilDue = task.endDate 
      ? Math.ceil((new Date(task.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    if (isOverdue || (daysUntilDue <= 1 && completion < 90)) {
      return 'critical';
    }
    
    if (daysUntilDue <= 3 && completion < 75) {
      return 'high';
    }
    
    if (daysUntilDue <= 7 && completion < 50) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Get task progress summary
   */
  static getTaskProgressSummary(tasks: ProjectTask[]) {
    const summary = {
      total: tasks.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      overdue: 0,
      atRisk: 0,
      averageCompletion: 0,
    };

    let totalCompletion = 0;

    tasks.forEach(task => {
      const completion = this.calculateTaskCompletion(task);
      totalCompletion += completion;

      switch (task.status) {
        case 'completed':
          summary.completed++;
          break;
        case 'in-progress':
        case 'review':
          summary.inProgress++;
          break;
        case 'pending':
          summary.pending++;
          break;
      }

      if (this.isTaskOverdue(task)) {
        summary.overdue++;
      }

      const riskLevel = this.getTaskRiskLevel(task);
      if (riskLevel === 'high' || riskLevel === 'critical') {
        summary.atRisk++;
      }
    });

    summary.averageCompletion = summary.total > 0 ? totalCompletion / summary.total : 0;

    return summary;
  }

  /**
   * Validate task submission
   */
  static validateTaskSubmission(submission: Partial<TaskSubmission>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!submission.description || submission.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (submission.completionPercentage === undefined || 
        submission.completionPercentage < 0 || 
        submission.completionPercentage > 100) {
      errors.push('Completion percentage must be between 0 and 100');
    }

    if (!submission.evidencePhotos || submission.evidencePhotos.length === 0) {
      errors.push('At least one evidence photo is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate task recommendations
   */
  static generateTaskRecommendations(task: ProjectTask) {
    const recommendations = [];
    const riskLevel = this.getTaskRiskLevel(task);
    const completion = this.calculateTaskCompletion(task);

    if (riskLevel === 'critical') {
      recommendations.push({
        type: 'urgent',
        message: 'This task requires immediate attention',
        actions: [
          'Contact assigned team immediately',
          'Consider reassigning additional resources',
          'Review and adjust timeline if necessary',
        ],
      });
    }

    if (completion < 25 && task.status === 'in-progress') {
      recommendations.push({
        type: 'productivity',
        message: 'Task progress is below expected pace',
        actions: [
          'Review with assigned team',
          'Identify and remove blockers',
          'Consider providing additional support',
        ],
      });
    }

    if (task.submissions.length > 0) {
      const latestSubmission = task.submissions[task.submissions.length - 1];
      if (latestSubmission.status === 'revision-required') {
        recommendations.push({
          type: 'quality',
          message: 'Recent submission requires revision',
          actions: [
            'Review revision notes carefully',
            'Provide clearer quality guidelines',
            'Consider additional training if needed',
          ],
        });
      }
    }

    return recommendations;
  }
}

export default TaskService;
