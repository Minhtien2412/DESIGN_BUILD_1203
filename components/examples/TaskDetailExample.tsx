/**
 * Task Detail Screen with File Attachments
 * Example usage of enhanced Tasks API with upload service
 */
import {
    Task,
    TaskAttachment,
    addTaskAttachment,
    deleteTask,
    deleteTaskAttachment,
    getTask,
    getTaskAttachments,
    updateTask,
} from '@/services/tasksApi';
import {
    uploadDocument,
    uploadImageFromGallery,
    uploadPhotoFromCamera
} from '@/services/uploadService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface TaskDetailExampleProps {
  taskId: number;
  onBack: () => void;
}

export function TaskDetailExample({ taskId, onBack }: TaskDetailExampleProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load task and attachments
  useEffect(() => {
    loadTaskData();
  }, [taskId]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      const [taskData, attachmentsData] = await Promise.all([
        getTask(taskId),
        getTaskAttachments(taskId),
      ]);
      setTask(taskData);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Failed to load task:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const handleUpdateStatus = async (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!task) return;

    try {
      const updated = await updateTask(task.id, { status });
      setTask(updated);
      Alert.alert('Success', 'Task status updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              Alert.alert('Success', 'Task deleted');
              onBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  // Upload from gallery
  const handleUploadFromGallery = async () => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadImageFromGallery(
        { multiple: true, maxSizeMB: 10 },
        (progress) => setUploadProgress(progress.percentage)
      );

      if (result.success && result.urls) {
        // Add attachments to task
        for (let i = 0; i < result.urls.length; i++) {
          const url = result.urls[i];
          const fileId = result.fileIds?.[i];
          
          const attachment = await addTaskAttachment(
            taskId,
            url,
            `image-${Date.now()}.jpg`,
            0,
            'image/jpeg'
          );
          
          setAttachments((prev) => [...prev, attachment]);
        }

        Alert.alert('Success', 'Photos uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Take photo
  const handleTakePhoto = async () => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadPhotoFromCamera(
        (progress) => setUploadProgress(progress.percentage)
      );

      if (result.success && result.url) {
        const attachment = await addTaskAttachment(
          taskId,
          result.url,
          `photo-${Date.now()}.jpg`,
          0,
          'image/jpeg'
        );

        setAttachments((prev) => [...prev, attachment]);
        Alert.alert('Success', 'Photo uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload document
  const handleUploadDocument = async () => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadDocument(
        { multiple: true },
        (progress) => setUploadProgress(progress.percentage)
      );

      if (result.success && result.urls) {
        for (let i = 0; i < result.urls.length; i++) {
          const url = result.urls[i];
          
          const attachment = await addTaskAttachment(
            taskId,
            url,
            `document-${Date.now()}.pdf`,
            0,
            'application/pdf'
          );
          
          setAttachments((prev) => [...prev, attachment]);
        }

        Alert.alert('Success', 'Documents uploaded successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload documents');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    Alert.alert(
      'Delete Attachment',
      'Are you sure you want to delete this attachment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskAttachment(taskId, attachmentId);
              setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
              Alert.alert('Success', 'Attachment deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete attachment');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading task...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Task not found</Text>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Task Details</Text>
        <Pressable onPress={handleDeleteTask} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </Pressable>
      </View>

      {/* Task Info */}
      <View style={styles.section}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}
        
        <View style={styles.statusRow}>
          <Pressable 
            style={[styles.statusChip, task.status === 'PENDING' && styles.statusActive]} 
            onPress={() => handleUpdateStatus('PENDING')}
          >
            <Text style={styles.statusText}>Pending</Text>
          </Pressable>
          <Pressable 
            style={[styles.statusChip, task.status === 'IN_PROGRESS' && styles.statusActive]} 
            onPress={() => handleUpdateStatus('IN_PROGRESS')}
          >
            <Text style={styles.statusText}>In Progress</Text>
          </Pressable>
          <Pressable 
            style={[styles.statusChip, task.status === 'COMPLETED' && styles.statusActive]} 
            onPress={() => handleUpdateStatus('COMPLETED')}
          >
            <Text style={styles.statusText}>Completed</Text>
          </Pressable>
        </View>
      </View>

      {/* Upload Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attachments ({attachments.length})</Text>
        
        {uploading && (
          <View style={styles.uploadProgress}>
            <ActivityIndicator size="small" />
            <Text style={styles.uploadText}>Uploading... {uploadProgress}%</Text>
          </View>
        )}

        <View style={styles.uploadActions}>
          <Pressable style={styles.uploadBtn} onPress={handleUploadFromGallery} disabled={uploading}>
            <Ionicons name="images-outline" size={24} color="#EE4D2D" />
            <Text style={styles.uploadBtnText}>Gallery</Text>
          </Pressable>
          <Pressable style={styles.uploadBtn} onPress={handleTakePhoto} disabled={uploading}>
            <Ionicons name="camera-outline" size={24} color="#EE4D2D" />
            <Text style={styles.uploadBtnText}>Camera</Text>
          </Pressable>
          <Pressable style={styles.uploadBtn} onPress={handleUploadDocument} disabled={uploading}>
            <Ionicons name="document-outline" size={24} color="#EE4D2D" />
            <Text style={styles.uploadBtnText}>Document</Text>
          </Pressable>
        </View>
      </View>

      {/* Attachments List */}
      <View style={styles.section}>
        {attachments.map((attachment) => (
          <View key={attachment.id} style={styles.attachmentItem}>
            <Ionicons name="attach-outline" size={20} color="#666" />
            <Text style={styles.attachmentName}>{attachment.fileName}</Text>
            <Pressable onPress={() => handleDeleteAttachment(attachment.id)}>
              <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
            </Pressable>
          </View>
        ))}
        {attachments.length === 0 && (
          <Text style={styles.emptyText}>No attachments yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#666', marginBottom: 16 },
  backButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#EE4D2D', borderRadius: 8 },
  backButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  deleteBtn: { padding: 8 },
  section: { backgroundColor: '#FFF', padding: 16, marginTop: 12 },
  taskTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  taskDescription: { fontSize: 14, color: '#666', lineHeight: 20 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statusChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F0F0F0', borderRadius: 16 },
  statusActive: { backgroundColor: '#EE4D2D' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  uploadProgress: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  uploadText: { fontSize: 13, color: '#666' },
  uploadActions: { flexDirection: 'row', gap: 12 },
  uploadBtn: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#FFF5F0', borderRadius: 12, borderWidth: 1, borderColor: '#EE4D2D' },
  uploadBtnText: { fontSize: 12, fontWeight: '600', color: '#EE4D2D', marginTop: 4 },
  attachmentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  attachmentName: { flex: 1, fontSize: 14, color: '#333' },
  emptyText: { fontSize: 13, color: '#999', textAlign: 'center', paddingVertical: 20 },
});
