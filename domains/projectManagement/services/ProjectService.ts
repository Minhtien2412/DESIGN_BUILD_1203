/**
 * Project Service
 * Domain-specific business logic cho project management
 */

import { projectProgressService } from '../../../services/projectProgressService';
import { ProjectProgress, UserRole } from '../../../types/projectProgress';

export class ProjectService {
  /**
   * Get comprehensive project overview
   */
  static async getProjectOverview(projectId: string, userRole: UserRole) {
    try {
      const [dashboardResponse, progressResponse] = await Promise.all([
        projectProgressService.getProgressDashboard(projectId, userRole),
        projectProgressService.getProjectProgress(projectId),
      ]);

      return {
        success: true,
        data: {
          dashboard: dashboardResponse.data,
          progress: progressResponse.data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load project overview',
      };
    }
  }

  /**
   * Calculate project health score
   */
  static calculateHealthScore(progress: ProjectProgress): number {
    if (!progress) return 0;

    const scheduleScore = this.calculateScheduleScore(progress);
    const budgetScore = this.calculateBudgetScore(progress);
    const qualityScore = progress.qualityMetrics.averageQualityScore || 0;

    return Math.round((scheduleScore + budgetScore + qualityScore) / 3);
  }

  /**
   * Calculate schedule performance score
   */
  private static calculateScheduleScore(progress: ProjectProgress): number {
    const { daysDelayed } = progress;
    
    if (daysDelayed <= 0) return 10; // Ahead or on schedule
    if (daysDelayed <= 7) return 8;  // Up to 1 week delay
    if (daysDelayed <= 14) return 6; // Up to 2 weeks delay
    if (daysDelayed <= 30) return 4; // Up to 1 month delay
    return 2; // More than 1 month delay
  }

  /**
   * Calculate budget performance score
   */
  private static calculateBudgetScore(progress: ProjectProgress): number {
    const { budgetUtilization } = progress;
    
    if (budgetUtilization <= 100) return 10; // Within budget
    if (budgetUtilization <= 110) return 8;  // 10% over budget
    if (budgetUtilization <= 125) return 6;  // 25% over budget
    if (budgetUtilization <= 150) return 4;  // 50% over budget
    return 2; // More than 50% over budget
  }

  /**
   * Get project alerts and recommendations
   */
  static getProjectAlerts(progress: ProjectProgress) {
    const alerts = [];

    // Schedule alerts
    if (progress.daysDelayed > 0) {
      alerts.push({
        type: 'delay' as const,
        severity: progress.daysDelayed > 30 ? 'critical' as const : 'warning' as const,
        message: `Project is ${progress.daysDelayed} days behind schedule`,
        recommendation: 'Consider reallocating resources or adjusting timeline',
      });
    }

    // Budget alerts
    if (progress.budgetUtilization > 100) {
      alerts.push({
        type: 'budget' as const,
        severity: progress.budgetUtilization > 150 ? 'critical' as const : 'warning' as const,
        message: `Budget utilization at ${progress.budgetUtilization.toFixed(1)}%`,
        recommendation: 'Review cost overruns and implement cost control measures',
      });
    }

    // Quality alerts
    if (progress.qualityMetrics.averageQualityScore < 7) {
      alerts.push({
        type: 'quality' as const,
        severity: 'warning' as const,
        message: `Average quality score is ${progress.qualityMetrics.averageQualityScore}/10`,
        recommendation: 'Implement additional quality control measures',
      });
    }

    return alerts;
  }

  /**
   * Generate project recommendations
   */
  static generateRecommendations(progress: ProjectProgress) {
    const recommendations = [];

    // Performance-based recommendations
    const healthScore = this.calculateHealthScore(progress);
    
    if (healthScore < 6) {
      recommendations.push({
        category: 'critical',
        title: 'Project Health Critical',
        description: 'Immediate intervention required to get project back on track',
        actions: [
          'Conduct emergency project review meeting',
          'Reassess resource allocation',
          'Consider scope adjustments',
        ],
      });
    } else if (healthScore < 8) {
      recommendations.push({
        category: 'improvement',
        title: 'Performance Improvement Needed',
        description: 'Several areas need attention to ensure project success',
        actions: [
          'Review current processes',
          'Optimize team productivity',
          'Implement additional monitoring',
        ],
      });
    }

    return recommendations;
  }
}

export default ProjectService;
