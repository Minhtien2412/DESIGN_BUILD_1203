/**
 * API Integration Examples
 * =========================
 * 
 * Ví dụ sử dụng API hooks trong các component
 * 
 * @author ThietKeResort Team
 * @created 2025-12-31
 */

import {
    useClearCache,
    useCreateProject,
    usePerfexCustomers,
    useProject,
    useProjects
} from '@/hooks/useApiIntegration';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ==================== EXAMPLE 1: PROJECT LIST ====================

export function ProjectListExample() {
  const { data: projects, loading, error, source, refetch } = useProjects({
    cache: true,
    onSuccess: (data) => {
      console.log('✅ Projects loaded:', data.length);
    },
    onError: (err) => {
      console.error('❌ Failed to load projects:', err.message);
    },
  });

  const clearCache = useClearCache();

  const handleClearCache = () => {
    clearCache('projects');
    refetch();
  };

  if (loading && !projects) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải dự án...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={48} color="#000000" />
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Data Source Badge */}
      <View style={styles.sourceContainer}>
        <View style={[styles.sourceBadge, source === 'api' ? styles.source_api : source === 'cache' ? styles.source_cache : styles.source_mock]}>
          <Ionicons
            name={source === 'api' ? 'cloud-done' : source === 'cache' ? 'time' : 'folder'}
            size={14}
            color="#fff"
          />
          <Text style={styles.sourceText}>
            {source === 'api' && 'API Live'}
            {source === 'cache' && 'Cached'}
            {source === 'mock' && 'Offline'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClearCache}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Project List */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProjectCard project={item} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có dự án nào</Text>
          </View>
        }
      />
    </View>
  );
}

// ==================== EXAMPLE 2: PROJECT DETAILS ====================

export function ProjectDetailExample({ projectId }: { projectId: string }) {
  const {
    data: project,
    loading,
    error,
    source,
    refetch,
  } = useProject(projectId, {
    cache: true,
    refetchInterval: 60000, // Auto refetch every minute
  });

  if (loading && !project) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy dự án</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live indicator */}
      {source === 'api' && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live data</Text>
        </View>
      )}

      <Text style={styles.projectName}>{project.name}</Text>
      <Text style={styles.projectDescription}>{project.description}</Text>

      <View style={styles.statsRow}>
        <StatCard label="Tiến độ" value={`${project.progress}%`} />
        <StatCard label="Ngân sách" value={formatVND(project.budget)} />
        <StatCard label="Đã chi" value={formatVND(project.spent)} />
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.refreshText}>Cập nhật</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==================== EXAMPLE 3: CREATE PROJECT ====================

export function CreateProjectExample() {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
  });

  const { mutate, loading, error, success } = useCreateProject({
    onSuccess: (project) => {
      Alert.alert('Thành công', `Đã tạo dự án: ${project.name}`);
      console.log('✅ Project created:', project);
      // Navigate or refresh list
    },
    onError: (err) => {
      Alert.alert('Lỗi', err.message);
    },
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.budget) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const result = await mutate({
      name: formData.name,
      description: formData.description,
      budget: parseFloat(formData.budget),
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate,
    });

    if (result) {
      // Clear form
      setFormData({
        name: '',
        description: '',
        budget: '',
        startDate: '',
        endDate: '',
      });
    }
  };

  return (
    <View style={styles.form}>
      {/* Form fields would go here */}
      <Text style={styles.formTitle}>Tạo dự án mới</Text>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Tạo dự án</Text>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.formError}>{error.message}</Text>
      )}

      {success && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
          <Text style={styles.successText}>Đã tạo thành công!</Text>
        </View>
      )}
    </View>
  );
}

// ==================== EXAMPLE 4: PERFEX CUSTOMERS ====================

export function PerfexCustomersExample() {
  const { data: customers, loading, error, source } = usePerfexCustomers({
    cache: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (loading && !customers) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải khách hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Source indicator */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khách hàng</Text>
        <View style={[styles.sourceBadge, source === 'api' ? styles.source_api : source === 'cache' ? styles.source_cache : styles.source_mock]}>
          <Text style={styles.sourceText}>
            {source === 'api' ? '🟢 Live' : source === 'cache' ? '🟡 Cache' : '🔴 Offline'}
          </Text>
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.userid}
        renderItem={({ item }) => (
          <View style={styles.customerCard}>
            <Text style={styles.customerName}>{item.company}</Text>
            <Text style={styles.customerPhone}>{item.phonenumber}</Text>
            <Text style={styles.customerCity}>{item.city}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ==================== HELPER COMPONENTS ====================

function ProjectCard({ project }: { project: any }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{project.name}</Text>
      <Text style={styles.cardSubtitle}>{project.status}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{project.progress}%</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // Loading
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Error
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Source badge
  sourceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  source_api: {
    backgroundColor: '#0066CC',
  },
  source_cache: {
    backgroundColor: '#0066CC',
  },
  source_mock: {
    backgroundColor: '#6B7280',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Cards
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  
  // Progress
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  
  // Empty state
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  // Form
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  formError: {
    marginTop: 12,
    color: '#000000',
    fontSize: 14,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  successText: {
    color: '#065F46',
    fontWeight: '600',
  },
  
  // Project details
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Live indicator
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066CC',
  },
  liveText: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Customer card
  customerCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  customerCity: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default {
  ProjectListExample,
  ProjectDetailExample,
  CreateProjectExample,
  PerfexCustomersExample,
};
