/**
 * Payment Management Component
 * Quản lý thanh toán dự án cho Admin và Manager
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from '../components/ui/button';
import { Container } from '../components/ui/container';
import { Section } from '../components/ui/section';
import { projectProgressService } from '../services/projectProgressService';
import { PaymentSchedule, ProjectPayment, UserRole } from '../types/projectProgress';

interface PaymentManagerProps {
  projectId: string;
  userRole: UserRole;
  userId: string;
  userName: string;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({
  projectId,
  userRole,
  userId,
  userName
}) => {
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ProjectPayment | null>(null);
  const [createPaymentModalVisible, setCreatePaymentModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

  // Create payment form state
  const [paymentForm, setPaymentForm] = useState({
    type: 'milestone' as ProjectPayment['type'],
    category: 'foundation' as ProjectPayment['category'],
    amount: '',
    dueDate: '',
    description: '',
    triggerType: 'manual' as ProjectPayment['triggerType'],
    paymentMethod: 'bank-transfer' as ProjectPayment['paymentMethod'],
    contractorName: ''
  });

  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    action: 'approve' as 'approve' | 'reject',
    rejectionReason: ''
  });

  const loadPaymentSchedule = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await projectProgressService.getPaymentSchedule(projectId);

      if (response.success && response.data) {
        setPaymentSchedule(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load payment schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPaymentSchedule(false);
  };

  const handleCreatePayment = async () => {
    try {
      const amount = parseFloat(paymentForm.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      if (!paymentForm.dueDate) {
        Alert.alert('Error', 'Please select a due date');
        return;
      }

      const payment: Omit<ProjectPayment, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        type: paymentForm.type,
        category: paymentForm.category,
        amount,
        scheduledAmount: amount,
        currency: 'VND',
        status: 'scheduled',
        dueDate: paymentForm.dueDate,
        triggerType: paymentForm.triggerType,
        triggerConditions: {
          requiredApproval: true
        },
        approvalStatus: 'pending',
        paymentMethod: paymentForm.paymentMethod,
        taxAmount: amount * 0.1, // 10% tax
        netAmount: amount * 0.9,
        relatedTasks: [],
        contractorName: paymentForm.contractorName,
        createdBy: userId,
        updatedBy: userId
      };

      const response = await projectProgressService.createPayment(payment);

      if (response.success) {
        Alert.alert('Success', 'Payment created successfully');
        setCreatePaymentModalVisible(false);
        resetPaymentForm();
        loadPaymentSchedule();
      } else {
        Alert.alert('Error', 'Failed to create payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment');
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;

    try {
      if (approvalForm.action === 'approve') {
        const response = await projectProgressService.approvePayment(
          selectedPayment.id,
          {
            id: userId,
            name: userName,
            role: userRole as 'manager' | 'admin'
          }
        );

        if (response.success) {
          Alert.alert('Success', 'Payment approved successfully');
        } else {
          Alert.alert('Error', 'Failed to approve payment');
        }
      } else {
        if (!approvalForm.rejectionReason.trim()) {
          Alert.alert('Error', 'Please provide a rejection reason');
          return;
        }

        const response = await projectProgressService.rejectPayment(
          selectedPayment.id,
          approvalForm.rejectionReason,
          {
            id: userId,
            name: userName,
            role: userRole
          }
        );

        if (response.success) {
          Alert.alert('Success', 'Payment rejected successfully');
        } else {
          Alert.alert('Error', 'Failed to reject payment');
        }
      }

      setApprovalModalVisible(false);
      resetApprovalForm();
      loadPaymentSchedule();
    } catch (error) {
      Alert.alert('Error', 'Failed to process approval');
    }
  };

  const handleProcessPayment = async (payment: ProjectPayment) => {
    try {
      const response = await projectProgressService.processPayment(
        payment.id,
        {
          paymentMethod: payment.paymentMethod,
          paymentReference: `TXN${Date.now()}`,
          processedBy: userId
        }
      );

      if (response.success) {
        Alert.alert('Success', 'Payment processed successfully');
        loadPaymentSchedule();
      } else {
        Alert.alert('Error', 'Failed to process payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      type: 'milestone',
      category: 'foundation',
      amount: '',
      dueDate: '',
      description: '',
      triggerType: 'manual',
      paymentMethod: 'bank-transfer',
      contractorName: ''
    });
  };

  const resetApprovalForm = () => {
    setApprovalForm({
      action: 'approve',
      rejectionReason: ''
    });
  };

  const openApprovalModal = (payment: ProjectPayment) => {
    setSelectedPayment(payment);
    setApprovalModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#0D9488';
      case 'processing': return '#0D9488';
      case 'pending': return '#0D9488';
      case 'overdue': return '#000000';
      case 'scheduled': return '#6B7280';
      case 'cancelled': return '#9CA3AF';
      default: return '#6B7280';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'admin-approved': return '#0D9488';
      case 'manager-approved': return '#0D9488';
      case 'pending': return '#0D9488';
      case 'rejected': return '#000000';
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

  const canApprovePayments = () => {
    return userRole === 'admin' || userRole === 'manager';
  };

  const canProcessPayments = () => {
    return userRole === 'admin';
  };

  const canCreatePayments = () => {
    return userRole === 'admin' || userRole === 'manager';
  };

  useEffect(() => {
    loadPaymentSchedule();
  }, [projectId]);

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text>Loading payment schedule...</Text>
        </View>
      </Container>
    );
  }

  if (!paymentSchedule) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No payment schedule found</Text>
          <Button title="Retry" onPress={() => loadPaymentSchedule()} />
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
          <Section>
            <View style={styles.header}>
              <Text style={styles.title}>Payment Management</Text>
              {canCreatePayments() && (
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => setCreatePaymentModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.createButtonText}>Create Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          </Section>

          {/* Payment Overview */}
          <Section>
            <Text style={styles.sectionTitle}>💰 Payment Overview</Text>
            <View style={styles.overviewCard}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Total Budget</Text>
                <Text style={styles.overviewValue}>
                  {formatCurrency(paymentSchedule.totalBudget)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Total Paid</Text>
                <Text style={[styles.overviewValue, { color: '#0D9488' }]}>
                  {formatCurrency(paymentSchedule.totalPaid)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Pending</Text>
                <Text style={[styles.overviewValue, { color: '#0D9488' }]}>
                  {formatCurrency(paymentSchedule.totalPending)}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Overdue</Text>
                <Text style={[styles.overviewValue, { color: '#000000' }]}>
                  {formatCurrency(paymentSchedule.totalOverdue)}
                </Text>
              </View>
            </View>

            {/* Budget Progress */}
            <View style={styles.budgetProgress}>
              <Text style={styles.budgetLabel}>Budget Utilization</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(paymentSchedule.totalPaid / paymentSchedule.totalBudget) * 100}%`,
                      backgroundColor: '#0D9488'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.budgetPercentage}>
                {formatPercentage((paymentSchedule.totalPaid / paymentSchedule.totalBudget) * 100)}
              </Text>
            </View>
          </Section>

          {/* Payment Breakdown */}
          <Section>
            <Text style={styles.sectionTitle}>📊 Payment Breakdown</Text>
            <View style={styles.breakdownCard}>
              {Object.entries(paymentSchedule.breakdown).map(([key, percentage]) => (
                <View key={key} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <Text style={styles.breakdownPercentage}>
                    {formatPercentage(percentage)}
                  </Text>
                  <Text style={styles.breakdownAmount}>
                    {formatCurrency((paymentSchedule.totalBudget * percentage) / 100)}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Scheduled Payments */}
          <Section>
            <Text style={styles.sectionTitle}>📅 Scheduled Payments</Text>
            {paymentSchedule.scheduledPayments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentTitleContainer}>
                    <Text style={styles.paymentCategory}>
                      {payment.category.replace('-', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.paymentType}>
                      {payment.type.replace('-', ' ')}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.paymentStatus, {
                      color: getStatusColor(payment.status)
                    }]}>
                      {payment.status.toUpperCase()}
                    </Text>
                    <Text style={[styles.approvalStatus, {
                      color: getApprovalStatusColor(payment.approvalStatus)
                    }]}>
                      {payment.approvalStatus.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.paymentAmount}>
                  {formatCurrency(payment.amount)}
                </Text>

                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentDetail}>
                    Due: {new Date(payment.dueDate).toLocaleDateString('vi-VN')}
                  </Text>
                  {payment.contractorName && (
                    <Text style={styles.paymentDetail}>
                      To: {payment.contractorName}
                    </Text>
                  )}
                  <Text style={styles.paymentDetail}>
                    Method: {payment.paymentMethod.replace('-', ' ').toUpperCase()}
                  </Text>
                  {payment.paymentReference && (
                    <Text style={styles.paymentDetail}>
                      Ref: {payment.paymentReference}
                    </Text>
                  )}
                </View>

                {payment.rejectionReason && (
                  <View style={styles.rejectionContainer}>
                    <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                    <Text style={styles.rejectionReason}>{payment.rejectionReason}</Text>
                  </View>
                )}

                {/* Payment Actions */}
                <View style={styles.paymentActions}>
                  {canApprovePayments() && payment.approvalStatus === 'pending' && (
                    <TouchableOpacity 
                      style={styles.approveButton}
                      onPress={() => openApprovalModal(payment)}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.approveButtonText}>Review</Text>
                    </TouchableOpacity>
                  )}

                  {canProcessPayments() && 
                   payment.approvalStatus === 'admin-approved' && 
                   payment.status === 'pending' && (
                    <TouchableOpacity 
                      style={styles.processButton}
                      onPress={() => handleProcessPayment(payment)}
                    >
                      <Ionicons name="card" size={16} color="#fff" />
                      <Text style={styles.processButtonText}>Process</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </Section>

          {/* Budget Variance */}
          {paymentSchedule.budgetVariance !== 0 && (
            <Section>
              <Text style={styles.sectionTitle}>⚠️ Budget Variance</Text>
              <View style={styles.varianceCard}>
                <Text style={[styles.varianceAmount, {
                  color: paymentSchedule.budgetVariance > 0 ? '#000000' : '#0D9488'
                }]}>
                  {paymentSchedule.budgetVariance > 0 ? '+' : ''}
                  {formatCurrency(paymentSchedule.budgetVariance)}
                </Text>
                <Text style={styles.varianceLabel}>
                  {paymentSchedule.budgetVariance > 0 ? 'Over Budget' : 'Under Budget'}
                </Text>
              </View>
            </Section>
          )}
        </Container>
      </ScrollView>

      {/* Create Payment Modal */}
      <Modal
        visible={createPaymentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Payment</Text>
            <TouchableOpacity 
              onPress={() => setCreatePaymentModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Payment Type</Text>
              <View style={styles.pickerContainer}>
                {['milestone', 'progress', 'material', 'bonus'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerOption,
                      paymentForm.type === type && styles.pickerSelected
                    ]}
                    onPress={() => setPaymentForm(prev => ({ ...prev, type: type as any }))}
                  >
                    <Text style={[
                      styles.pickerText,
                      paymentForm.type === type && styles.pickerTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                {['initial', 'foundation', 'structure', 'finishing', 'final'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.pickerOption,
                      paymentForm.category === category && styles.pickerSelected
                    ]}
                    onPress={() => setPaymentForm(prev => ({ ...prev, category: category as any }))}
                  >
                    <Text style={[
                      styles.pickerText,
                      paymentForm.category === category && styles.pickerTextSelected
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount (VND)</Text>
              <TextInput
                style={styles.formInput}
                value={paymentForm.amount}
                onChangeText={(text) => setPaymentForm(prev => ({ ...prev, amount: text }))}
                placeholder="Enter payment amount"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Due Date</Text>
              <TextInput
                style={styles.formInput}
                value={paymentForm.dueDate}
                onChangeText={(text) => setPaymentForm(prev => ({ ...prev, dueDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contractor Name</Text>
              <TextInput
                style={styles.formInput}
                value={paymentForm.contractorName}
                onChangeText={(text) => setPaymentForm(prev => ({ ...prev, contractorName: text }))}
                placeholder="Enter contractor name"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCreatePaymentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleCreatePayment}
              >
                <Text style={styles.submitButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Approval Modal */}
      <Modal
        visible={approvalModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Payment</Text>
            <TouchableOpacity 
              onPress={() => setApprovalModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedPayment && (
              <>
                <View style={styles.paymentSummary}>
                  <Text style={styles.paymentSummaryAmount}>
                    {formatCurrency(selectedPayment.amount)}
                  </Text>
                  <Text style={styles.paymentSummaryCategory}>
                    {selectedPayment.category.replace('-', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.paymentSummaryContractor}>
                    To: {selectedPayment.contractorName}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Action</Text>
                  <View style={styles.radioGroup}>
                    {['approve', 'reject'].map((action) => (
                      <TouchableOpacity
                        key={action}
                        style={styles.radioOption}
                        onPress={() => setApprovalForm(prev => ({ ...prev, action: action as any }))}
                      >
                        <View style={[
                          styles.radioCircle,
                          approvalForm.action === action && styles.radioSelected
                        ]} />
                        <Text style={styles.radioLabel}>
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {approvalForm.action === 'reject' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Rejection Reason</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={approvalForm.rejectionReason}
                      onChangeText={(text) => setApprovalForm(prev => ({ ...prev, rejectionReason: text }))}
                      placeholder="Please provide a reason for rejection..."
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setApprovalModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleApprovePayment}
                  >
                    <Text style={styles.submitButtonText}>
                      {approvalForm.action === 'approve' ? 'Approve' : 'Reject'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  overviewCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  budgetProgress: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    textAlign: 'right',
  },
  breakdownCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  breakdownPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 16,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentTitleContainer: {
    flex: 1,
  },
  paymentCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentType: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  approvalStatus: {
    fontSize: 10,
    fontWeight: '500',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 12,
  },
  paymentDetails: {
    marginBottom: 16,
  },
  paymentDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  rejectionContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 12,
    color: '#7f1d1d',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  processButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  varianceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  varianceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  varianceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  pickerSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#0D9488',
  },
  pickerText: {
    fontSize: 12,
    color: '#6b7280',
  },
  pickerTextSelected: {
    color: '#fff',
  },
  radioGroup: {
    flexDirection: 'column',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#0D9488',
  },
  radioLabel: {
    fontSize: 14,
    color: '#1f2937',
  },
  paymentSummary: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  paymentSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 8,
  },
  paymentSummaryCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentSummaryContractor: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default PaymentManager;
