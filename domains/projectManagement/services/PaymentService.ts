/**
 * Payment Service
 * Domain-specific business logic cho payment management
 */

import { projectProgressService } from '../../../services/projectProgressService';
import { PaymentSchedule, ProjectPayment } from '../../../types/projectProgress';

export class PaymentService {
  /**
   * Get payment overview with analytics
   */
  static async getPaymentOverview(projectId: string) {
    try {
      const response = await projectProgressService.getPaymentSchedule(projectId);
      
      if (response.success && response.data) {
        const schedule = response.data;
        const analytics = this.calculatePaymentAnalytics(schedule);
        
        return {
          success: true,
          data: {
            schedule,
            analytics,
          },
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load payment overview',
      };
    }
  }

  /**
   * Calculate payment analytics
   */
  static calculatePaymentAnalytics(schedule: PaymentSchedule) {
    const { scheduledPayments, totalBudget, totalPaid, totalPending, totalOverdue } = schedule;
    
    const analytics = {
      paymentProgress: totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0,
      overdueAmount: totalOverdue,
      pendingAmount: totalPending,
      cashFlow: this.calculateCashFlow(scheduledPayments),
      paymentVelocity: this.calculatePaymentVelocity(scheduledPayments),
      riskAssessment: this.assessPaymentRisk(schedule),
    };

    return analytics;
  }

  /**
   * Calculate cash flow projection
   */
  private static calculateCashFlow(payments: ProjectPayment[]) {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const next90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const cashFlow = {
      next30Days: 0,
      next90Days: 0,
      total: 0,
    };

    payments.forEach(payment => {
      if (payment.status === 'pending' || payment.status === 'processing') {
        const dueDate = new Date(payment.dueDate);
        
        if (dueDate <= next30Days) {
          cashFlow.next30Days += payment.amount;
        }
        
        if (dueDate <= next90Days) {
          cashFlow.next90Days += payment.amount;
        }
        
        cashFlow.total += payment.amount;
      }
    });

    return cashFlow;
  }

  /**
   * Calculate payment velocity (average days to approve/process)
   */
  private static calculatePaymentVelocity(payments: ProjectPayment[]) {
    const completedPayments = payments.filter(p => p.status === 'completed' && p.completedDate);
    
    if (completedPayments.length === 0) {
      return { averageDays: 0, efficiency: 'unknown' };
    }

    let totalDays = 0;
    completedPayments.forEach(payment => {
      const createdDate = new Date(payment.createdAt);
      const completedDate = new Date(payment.completedDate!);
      const days = Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += days;
    });

    const averageDays = totalDays / completedPayments.length;
    
    let efficiency: 'excellent' | 'good' | 'average' | 'poor';
    if (averageDays <= 3) efficiency = 'excellent';
    else if (averageDays <= 7) efficiency = 'good';
    else if (averageDays <= 14) efficiency = 'average';
    else efficiency = 'poor';

    return { averageDays: Math.round(averageDays), efficiency };
  }

  /**
   * Assess payment risk
   */
  private static assessPaymentRisk(schedule: PaymentSchedule) {
    const { totalOverdue, totalBudget, costOverruns } = schedule;
    
    let riskScore = 0;
    const risks = [];

    // Overdue payment risk
    if (totalOverdue > 0) {
      const overduePercentage = (totalOverdue / totalBudget) * 100;
      if (overduePercentage > 10) {
        riskScore += 3;
        risks.push({
          type: 'overdue',
          severity: 'high',
          message: `${overduePercentage.toFixed(1)}% of payments are overdue`,
        });
      } else if (overduePercentage > 5) {
        riskScore += 2;
        risks.push({
          type: 'overdue',
          severity: 'medium',
          message: `${overduePercentage.toFixed(1)}% of payments are overdue`,
        });
      }
    }

    // Cost overrun risk
    if (costOverruns.length > 0) {
      const totalOverrun = costOverruns.reduce((sum, co) => sum + co.variance, 0);
      const overrunPercentage = (totalOverrun / totalBudget) * 100;
      
      if (overrunPercentage > 15) {
        riskScore += 3;
        risks.push({
          type: 'budget',
          severity: 'high',
          message: `Cost overruns at ${overrunPercentage.toFixed(1)}% of budget`,
        });
      } else if (overrunPercentage > 5) {
        riskScore += 2;
        risks.push({
          type: 'budget',
          severity: 'medium',
          message: `Cost overruns at ${overrunPercentage.toFixed(1)}% of budget`,
        });
      }
    }

    let overallRisk: 'low' | 'medium' | 'high';
    if (riskScore >= 5) overallRisk = 'high';
    else if (riskScore >= 3) overallRisk = 'medium';
    else overallRisk = 'low';

    return { overallRisk, riskScore, risks };
  }

  /**
   * Generate payment recommendations
   */
  static generatePaymentRecommendations(schedule: PaymentSchedule) {
    const recommendations = [];
    const analytics = this.calculatePaymentAnalytics(schedule);

    // Overdue payment recommendations
    if (analytics.riskAssessment.overallRisk === 'high') {
      recommendations.push({
        category: 'urgent',
        title: 'Address Payment Issues',
        description: 'Multiple payment issues require immediate attention',
        actions: [
          'Review all overdue payments',
          'Contact payment approvers',
          'Implement expedited approval process',
        ],
      });
    }

    // Cash flow recommendations
    if (analytics.cashFlow.next30Days > schedule.totalBudget * 0.3) {
      recommendations.push({
        category: 'cash-flow',
        title: 'High Cash Flow Requirements',
        description: 'Large payments due in next 30 days',
        actions: [
          'Ensure sufficient cash reserves',
          'Consider payment rescheduling',
          'Review budget allocation',
        ],
      });
    }

    // Payment velocity recommendations
    if (analytics.paymentVelocity.efficiency === 'poor') {
      recommendations.push({
        category: 'process',
        title: 'Improve Payment Processing',
        description: 'Payment approval process is slower than optimal',
        actions: [
          'Streamline approval workflow',
          'Automate routine approvals',
          'Train approval staff',
        ],
      });
    }

    return recommendations;
  }

  /**
   * Validate payment request
   */
  static validatePaymentRequest(payment: Partial<ProjectPayment>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!payment.amount || payment.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!payment.category) {
      errors.push('Payment category is required');
    }

    if (!payment.dueDate) {
      errors.push('Due date is required');
    } else {
      const dueDate = new Date(payment.dueDate);
      const today = new Date();
      if (dueDate < today) {
        errors.push('Due date cannot be in the past');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate payment priority
   */
  static calculatePaymentPriority(payment: ProjectPayment): 'low' | 'medium' | 'high' | 'critical' {
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'critical'; // Overdue
    if (daysUntilDue <= 1) return 'critical'; // Due today or tomorrow
    if (daysUntilDue <= 3) return 'high';     // Due within 3 days
    if (daysUntilDue <= 7) return 'medium';   // Due within a week
    return 'low';                             // Due later
  }
}

export default PaymentService;
