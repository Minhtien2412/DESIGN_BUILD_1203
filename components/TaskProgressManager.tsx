/**
 * Task Progress Management Component
 * Quản lý tiến độ công việc cho nhà thầu, công ty, thợ
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
import { Container } from '../components/ui/container';
import { Section } from '../components/ui/section';
import { projectProgressService } from '../services/projectProgressService';
import { ProjectTask, TaskSubmission, UserRole } from '../types/projectProgress';

interface TaskProgressManagerProps {
  projectId: string;
  userRole: UserRole;
  userId: string;
  userName: string;
}

const TaskProgressManager: React.FC<TaskProgressManagerProps> = ({
  projectId,
  userRole,
  userId,
  userName
}) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);

  // Submission form state
  const [submissionForm, setSubmissionForm] = useState({
    completionPercentage: '',
    description: '',
    evidencePhotos: [] as string[],
    evidenceDocuments: [] as string[]
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    status: 'approved' as 'approved' | 'rejected' | 'revision-required',
    qualityScore: '',
    reviewNotes: ''
  });

  const loadTasks = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await projectProgressService.getProjectTasks(projectId);

      if (response.success && response.data) {
        // Filter tasks based on user role
        let filteredTasks = response.data;
        if (userRole === 'contractor' || userRole === 'worker') {
          filteredTasks = response.data.filter(
            task => task.assignedTo.id === userId
          );
        }
        setTasks(filteredTasks);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks(false);
  };

  const handleSubmitProgress = async () => {
    if (!selectedTask) return;

    try {
      const completionPercentage = parseInt(submissionForm.completionPercentage);
      if (isNaN(completionPercentage) || completionPercentage < 0 || completionPercentage > 100) {
        Alert.alert('Error', 'Please enter a valid completion percentage (0-100)');
        return;
      }

      if (!submissionForm.description.trim()) {
        Alert.alert('Error', 'Please provide a description');
        return;
      }

      const submission: Omit<TaskSubmission, 'id' | 'submittedAt'> = {
        taskId: selectedTask.id,
        submittedBy: {
          type: userRole as 'contractor' | 'company' | 'worker',
          id: userId,
          name: userName
        },
        status: 'submitted',
        completionPercentage,
        description: submissionForm.description,
        evidencePhotos: submissionForm.evidencePhotos,
        evidenceDocuments: submissionForm.evidenceDocuments
      };

      const response = await projectProgressService.submitTaskProgress(
        selectedTask.id,
        submission
      );

      if (response.success) {
        Alert.alert('Success', 'Progress submitted successfully');
        setSubmissionModalVisible(false);
        resetSubmissionForm();
        loadTasks();
      } else {
        Alert.alert('Error', 'Failed to submit progress');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit progress');
    }
  };

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const qualityScore = reviewForm.qualityScore ? 
        parseInt(reviewForm.qualityScore) : undefined;

      if (qualityScore !== undefined && (isNaN(qualityScore) || qualityScore < 1 || qualityScore > 10)) {
        Alert.alert('Error', 'Quality score must be between 1-10');
        return;
      }

      const review = {
        status: reviewForm.status,
        qualityScore,
        reviewNotes: reviewForm.reviewNotes,
        reviewedBy: {
          id: userId,
          name: userName,
          role: userRole
        }
      };

      const response = await projectProgressService.reviewTaskSubmission(
        selectedSubmission.id,
        review
      );

      if (response.success) {
        Alert.alert('Success', 'Review submitted successfully');
        setReviewModalVisible(false);
        resetReviewForm();
        loadTasks();
      } else {
        Alert.alert('Error', 'Failed to submit review');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const resetSubmissionForm = () => {
    setSubmissionForm({
      completionPercentage: '',
      description: '',
      evidencePhotos: [],
      evidenceDocuments: []
    });
  };

  const resetReviewForm = () => {
    setReviewForm({
      status: 'approved',
      qualityScore: '',
      reviewNotes: ''
    });
  };

  const openSubmissionModal = (task: ProjectTask) => {
    setSelectedTask(task);
    setSubmissionModalVisible(true);
  };

  const openReviewModal = (submission: TaskSubmission) => {
    setSelectedSubmission(submission);
    setReviewModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#0D9488';
      case 'in-progress': return '#0D9488';
      case 'pending': return '#0D9488';
      case 'delayed': return '#000000';
      case 'submitted': return '#666666';
      case 'under-review': return '#0D9488';
      case 'approved': return '#0D9488';
      case 'rejected': return '#000000';
      case 'revision-required': return '#0D9488';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#000000';
      case 'high': return '#000000';
      case 'medium': return '#0D9488';
      case 'low': return '#0D9488';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const canSubmitProgress = (task: ProjectTask) => {
    if (userRole === 'admin' || userRole === 'manager') return true;
    return task.assignedTo.id === userId && task.status !== 'completed';
  };

  const canReviewSubmissions = () => {
    return userRole === 'admin' || userRole === 'manager' || userRole === 'supervisor';
  };

  useEffect(() => {
    loadTasks();
  }, [projectId, userId]);

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text>Loading tasks...</Text>
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
            <Text style={styles.title}>Task Progress Management</Text>
            <Text style={styles.subtitle}>Project: {projectId}</Text>
          </Section>

          {/* Task List */}
          <Section>
            <Text style={styles.sectionTitle}>📋 Tasks</Text>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskTitleContainer}>
                    <Text style={styles.taskName}>{task.name}</Text>
                    <View style={styles.priorityBadge}>
                      <Text style={[styles.priorityText, {
                        color: getPriorityColor(task.priority)
                      }]}>
                        {task.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, {
                      color: getStatusColor(task.status)
                    }]}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.taskDescription}>{task.description}</Text>

                <View style={styles.taskMeta}>
                  <Text style={styles.taskCategory}>
                    Category: {task.category.replace('-', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.taskCost}>
                    Budget: {formatCurrency(task.estimatedCost)}
                  </Text>
                </View>

                <View style={styles.taskAssignment}>
                  <Text style={styles.assignmentLabel}>Assigned to:</Text>
                  <Text style={styles.assignmentText}>
                    {task.assignedTo.name} ({task.assignedTo.type})
                  </Text>
                </View>

                {/* Task Submissions */}
                {task.submissions.length > 0 && (
                  <View style={styles.submissionsContainer}>
                    <Text style={styles.submissionsTitle}>Recent Submissions:</Text>
                    {task.submissions.slice(-2).map((submission) => (
                      <View key={submission.id} style={styles.submissionItem}>
                        <View style={styles.submissionHeader}>
                          <Text style={styles.submissionProgress}>
                            {submission.completionPercentage}% Complete
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
                        <Text style={styles.submissionDate}>
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
                        </Text>
                        {submission.qualityScore && (
                          <Text style={styles.qualityScore}>
                            Quality Score: {submission.qualityScore}/10
                          </Text>
                        )}
                        {canReviewSubmissions() && submission.status === 'submitted' && (
                          <TouchableOpacity 
                            style={styles.reviewButton}
                            onPress={() => openReviewModal(submission)}
                          >
                            <Text style={styles.reviewButtonText}>Review</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.taskActions}>
                  {canSubmitProgress(task) && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => openSubmissionModal(task)}
                    >
                      <Ionicons name="add-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Submit Progress</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </Section>
        </Container>
      </ScrollView>

      {/* Submission Modal */}
      <Modal
        visible={submissionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Submit Progress</Text>
            <TouchableOpacity 
              onPress={() => setSubmissionModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedTask && (
              <>
                <Text style={styles.taskModalName}>{selectedTask.name}</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Completion Percentage</Text>
                  <TextInput
                    style={styles.formInput}
                    value={submissionForm.completionPercentage}
                    onChangeText={(text) => setSubmissionForm(prev => ({
                      ...prev,
                      completionPercentage: text
                    }))}
                    placeholder="Enter percentage (0-100)"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={submissionForm.description}
                    onChangeText={(text) => setSubmissionForm(prev => ({
                      ...prev,
                      description: text
                    }))}
                    placeholder="Describe the progress made..."
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setSubmissionModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmitProgress}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Submission</Text>
            <TouchableOpacity 
              onPress={() => setReviewModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedSubmission && (
              <>
                <Text style={styles.submissionModalInfo}>
                  {selectedSubmission.completionPercentage}% Complete
                </Text>
                <Text style={styles.submissionModalDescription}>
                  {selectedSubmission.description}
                </Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Review Status</Text>
                  <View style={styles.radioGroup}>
                    {['approved', 'rejected', 'revision-required'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={styles.radioOption}
                        onPress={() => setReviewForm(prev => ({
                          ...prev,
                          status: status as any
                        }))}
                      >
                        <View style={[
                          styles.radioCircle,
                          reviewForm.status === status && styles.radioSelected
                        ]} />
                        <Text style={styles.radioLabel}>
                          {status.replace('-', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Quality Score (1-10)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={reviewForm.qualityScore}
                    onChangeText={(text) => setReviewForm(prev => ({
                      ...prev,
                      qualityScore: text
                    }))}
                    placeholder="Optional quality score"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Review Notes</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={reviewForm.reviewNotes}
                    onChangeText={(text) => setReviewForm(prev => ({
                      ...prev,
                      reviewNotes: text
                    }))}
                    placeholder="Optional review notes..."
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setReviewModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleReviewSubmission}
                  >
                    <Text style={styles.submitButtonText}>Submit Review</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskCost: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskAssignment: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  assignmentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  assignmentText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  submissionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  submissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  submissionItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  submissionProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
  },
  submissionStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  submissionDescription: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  qualityScore: {
    fontSize: 10,
    color: '#0D9488',
    fontWeight: '500',
    marginTop: 2,
  },
  reviewButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
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
  taskModalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
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
  submissionModalInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
    marginBottom: 8,
  },
  submissionModalDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
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

export default TaskProgressManager;
