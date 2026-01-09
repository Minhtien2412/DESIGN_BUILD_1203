/**
 * Project Progress Dashboard Component
 * Hiển thị tổng quan tiến độ dự án và thanh toán
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from '../components/ui/button';
import { Container } from '../components/ui/container';
import { Section } from '../components/ui/section';
import { projectProgressService } from '../services/projectProgressService';
import { ProgressDashboard, UserRole } from '../types/projectProgress';

interface ProgressDashboardProps {
  projectId: string;
  userRole: UserRole;
}

const ProjectProgressDashboard: React.FC<ProgressDashboardProps> = ({
  projectId,
  userRole
}) => {
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const response = await projectProgressService.getProgressDashboard(
        projectId,
        userRole
      );

      if (response.success && response.data) {
        setDashboard(response.data);
      } else {
  // ApiErrorContext may not have message; fallback to generic
  const errMsg = (response as any).error?.message || 'Failed to load dashboard';
  setError(errMsg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard(false);
  };

  useEffect(() => {
    loadDashboard();
  }, [projectId, userRole]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#0066CC';
      case 'in-progress': return '#3B82F6';
      case 'pending': return '#0066CC';
      case 'delayed': return '#000000';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#000000';
      case 'error': return '#000000';
      case 'warning': return '#0066CC';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </Container>
    );
  }

  if (error || !dashboard) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#000000" />
          <Text style={styles.errorText}>{error || 'No data available'}</Text>
          <Button title="Retry" onPress={() => loadDashboard()} />
        </View>
      </Container>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Container>
          {/* Project Header */}
          <Section>
            <View style={styles.headerCard}>
              <Text style={styles.projectName}>{dashboard.project.name}</Text>
              <Text style={styles.projectType}>{dashboard.project.type}</Text>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusText, {
                  color: getStatusColor(dashboard.project.status)
                }]}>
                  {dashboard.project.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </Section>

          {/* Progress Overview */}
          <Section>
            <Text style={styles.sectionTitle}>📊 Project Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressPercentage}>
                  {formatPercentage(dashboard.progress.overallProgress)}
                </Text>
                <Text style={styles.progressLabel}>Overall Progress</Text>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${dashboard.progress.overallProgress}%` }
                  ]} 
                />
              </View>

              <View style={styles.taskSummary}>
                <View style={styles.taskStat}>
                  <Text style={styles.taskNumber}>{dashboard.progress.completedTasks}</Text>
                  <Text style={styles.taskLabel}>Completed</Text>
                </View>
                <View style={styles.taskStat}>
                  <Text style={styles.taskNumber}>{dashboard.progress.inProgressTasks}</Text>
                  <Text style={styles.taskLabel}>In Progress</Text>
                </View>
                <View style={styles.taskStat}>
                  <Text style={styles.taskNumber}>{dashboard.progress.pendingTasks}</Text>
                  <Text style={styles.taskLabel}>Pending</Text>
                </View>
                <View style={styles.taskStat}>
                  <Text style={[styles.taskNumber, { color: '#000000' }]}>
                    {dashboard.progress.delayedTasks}
                  </Text>
                  <Text style={styles.taskLabel}>Delayed</Text>
                </View>
              </View>
            </View>
          </Section>

          {/* Phase Progress */}
          <Section>
            <Text style={styles.sectionTitle}>🏗️ Phase Progress</Text>
            {Object.entries(dashboard.progress.phases).map(([key, phase]) => (
              <View key={key} style={styles.phaseCard}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                  <Text style={[styles.phaseStatus, {
                    color: getStatusColor(phase.status)
                  }]}>
                    {phase.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${phase.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.phaseProgress}>
                  {formatPercentage(phase.progress)}
                </Text>
              </View>
            ))}
          </Section>

          {/* Payment Status */}
          <Section>
            <Text style={styles.sectionTitle}>💰 Payment Status</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentSummary}>
                <View style={styles.paymentStat}>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(dashboard.paymentSchedule.totalPaid)}
                  </Text>
                  <Text style={styles.paymentLabel}>Total Paid</Text>
                </View>
                <View style={styles.paymentStat}>
                  <Text style={[styles.paymentAmount, { color: '#0066CC' }]}>
                    {formatCurrency(dashboard.paymentSchedule.totalPending)}
                  </Text>
                  <Text style={styles.paymentLabel}>Pending</Text>
                </View>
                <View style={styles.paymentStat}>
                  <Text style={[styles.paymentAmount, { color: '#000000' }]}>
                    {formatCurrency(dashboard.paymentSchedule.totalOverdue)}
                  </Text>
                  <Text style={styles.paymentLabel}>Overdue</Text>
                </View>
              </View>
              
              <View style={styles.budgetInfo}>
                <Text style={styles.budgetLabel}>Budget Utilization</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${dashboard.progress.budgetUtilization}%`,
                        backgroundColor: dashboard.progress.budgetUtilization > 100 ? '#000000' : '#0066CC'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.budgetPercentage}>
                  {formatPercentage(dashboard.progress.budgetUtilization)}
                </Text>
              </View>
            </View>
          </Section>

          {/* Recent Submissions */}
          {dashboard.recentSubmissions.length > 0 && (
            <Section>
              <Text style={styles.sectionTitle}>📋 Recent Submissions</Text>
              {dashboard.recentSubmissions.slice(0, 3).map((submission) => (
                <View key={submission.id} style={styles.submissionCard}>
                  <View style={styles.submissionHeader}>
                    <Text style={styles.submissionTitle}>
                      Task Progress Update
                    </Text>
                    <Text style={[styles.submissionStatus, {
                      color: getStatusColor(submission.status)
                    }]}>
                      {submission.status.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.submissionDescription}>
                    {submission.description}
                  </Text>
                  <View style={styles.submissionMeta}>
                    <Text style={styles.submissionBy}>
                      By: {submission.submittedBy.name}
                    </Text>
                    <Text style={styles.submissionDate}>
                      {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${submission.completionPercentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.completionText}>
                    {submission.completionPercentage}% Complete
                  </Text>
                </View>
              ))}
            </Section>
          )}

          {/* Upcoming Payments */}
          {dashboard.upcomingPayments.length > 0 && (
            <Section>
              <Text style={styles.sectionTitle}>⏰ Upcoming Payments</Text>
              {dashboard.upcomingPayments.slice(0, 3).map((payment) => (
                <View key={payment.id} style={styles.paymentItemCard}>
                  <View style={styles.paymentItemHeader}>
                    <Text style={styles.paymentCategory}>
                      {payment.category.replace('-', ' ').toUpperCase()}
                    </Text>
                    <Text style={[styles.paymentItemStatus, {
                      color: getStatusColor(payment.status)
                    }]}>
                      {payment.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.paymentItemAmount}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={styles.paymentDueDate}>
                    Due: {new Date(payment.dueDate).toLocaleDateString('vi-VN')}
                  </Text>
                  {payment.contractorName && (
                    <Text style={styles.paymentContractor}>
                      To: {payment.contractorName}
                    </Text>
                  )}
                </View>
              ))}
            </Section>
          )}

          {/* Alerts */}
          {dashboard.alerts.length > 0 && (
            <Section>
              <Text style={styles.sectionTitle}>🚨 Alerts</Text>
              {dashboard.alerts.map((alert, index) => (
                <View key={index} style={[styles.alertCard, {
                  borderLeftColor: getSeverityColor(alert.severity)
                }]}>
                  <View style={styles.alertHeader}>
                    <Ionicons 
                      name={alert.type === 'delay' ? 'time' : 
                            alert.type === 'payment' ? 'card' :
                            alert.type === 'quality' ? 'star' : 'alert-circle'} 
                      size={20} 
                      color={getSeverityColor(alert.severity)} 
                    />
                    <Text style={[styles.alertSeverity, {
                      color: getSeverityColor(alert.severity)
                    }]}>
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertDate}>
                    {new Date(alert.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
              ))}
            </Section>
          )}

          {/* KPIs */}
          <Section>
            <Text style={styles.sectionTitle}>📈 Key Performance Indicators</Text>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>
                  {formatPercentage(dashboard.kpis.schedulePerformance * 100)}
                </Text>
                <Text style={styles.kpiLabel}>Schedule Performance</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>
                  {formatPercentage(dashboard.kpis.costPerformance * 100)}
                </Text>
                <Text style={styles.kpiLabel}>Cost Performance</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>
                  {dashboard.kpis.qualityIndex.toFixed(1)}/10
                </Text>
                <Text style={styles.kpiLabel}>Quality Index</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>
                  {dashboard.kpis.stakeholderSatisfaction.toFixed(1)}/10
                </Text>
                <Text style={styles.kpiLabel}>Satisfaction</Text>
              </View>
            </View>
          </Section>

          {/* Action Buttons */}
          <Section>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="list" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>View All Tasks</Text>
              </TouchableOpacity>
              
              {(userRole === 'admin' || userRole === 'manager') && (
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="card" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Manage Payments</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Generate Report</Text>
              </TouchableOpacity>
            </View>
          </Section>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginVertical: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  projectType: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  taskSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  taskStat: {
    alignItems: 'center',
  },
  taskNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  taskLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  phaseCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  phaseStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  phaseProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'right',
    marginTop: 4,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  paymentStat: {
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    textAlign: 'center',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  budgetInfo: {
    marginTop: 16,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'right',
    marginTop: 4,
  },
  submissionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  submissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  submissionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  submissionDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  submissionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  submissionBy: {
    fontSize: 12,
    color: '#6b7280',
  },
  submissionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'right',
    marginTop: 4,
  },
  paymentItemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  paymentItemStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentItemAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 4,
  },
  paymentDueDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  paymentContractor: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  alertDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: '48%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProjectProgressDashboard;
