/**
 * Smart Project List Component
 * Hiển thị danh sách dự án với smart error handling và security
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { enhancedProjectApiService, ProjectApiResponse } from '../services/enhancedProjectApiServiceV2';
import { ConstructionProject, ProjectStatus, ProjectType } from '../types/construction';
import { Container } from './ui/container';
import { Section } from './ui/section';

interface SmartProjectListProps {
  showHeader?: boolean;
  maxItems?: number;
  filters?: {
    project_type?: ProjectType;
    status?: ProjectStatus;
    owner_id?: string;
  };
  onProjectPress?: (project: ConstructionProject) => void;
}

interface ApiStatusBadgeProps {
  source: 'api' | 'fallback' | 'cache';
  hasError?: boolean;
}

const ApiStatusBadge: React.FC<ApiStatusBadgeProps> = ({ source, hasError }) => {
  const getStatusConfig = () => {
    switch (source) {
      case 'api':
        return {
          color: hasError ? '#ff9500' : '#34c759',
          text: hasError ? 'API (với lỗi)' : 'API Live',
          icon: hasError ? 'warning' : 'cloud-done'
        };
      case 'cache':
        return {
          color: '#007aff',
          text: 'Cache',
          icon: 'save'
        };
      case 'fallback':
        return {
          color: '#ff6b6b',
          text: 'Fallback',
          icon: 'shield'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
      <Ionicons name={config.icon as any} size={12} color="white" />
      <Text style={styles.statusText}>{config.text}</Text>
    </View>
  );
};

const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return { color: '#34c759', text: 'Hoàn thành' };
      case 'in_progress':
        return { color: '#007aff', text: 'Đang thi công' };
      case 'approved':
        return { color: '#32d74b', text: 'Đã duyệt' };
      case 'pending_review':
        return { color: '#ff9500', text: 'Chờ duyệt' };
      case 'draft':
        return { color: '#8e8e93', text: 'Bản nháp' };
      case 'on_hold':
        return { color: '#ff9500', text: 'Tạm dừng' };
      case 'cancelled':
        return { color: '#ff3b30', text: 'Hủy bỏ' };
      default:
        return { color: '#8e8e93', text: 'Không xác định' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.projectStatusBadge, { backgroundColor: config.color }]}>
      <Text style={styles.projectStatusText}>{config.text}</Text>
    </View>
  );
};

const ProjectTypeIcon: React.FC<{ type: ProjectType }> = ({ type }) => {
  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'biet_thu':
        return 'home';
      case 'nha_pho':
        return 'business';
      case 'chung_cu':
        return 'layers';
      case 'van_phong':
        return 'briefcase';
      case 'thuong_mai':
        return 'storefront';
      case 'cong_nghiep':
        return 'construct';
      default:
        return 'cube';
    }
  };

  return (
    <Ionicons 
      name={getTypeIcon(type) as any} 
      size={24} 
      color="#007aff" 
      style={styles.typeIcon}
    />
  );
};

const ProjectCard: React.FC<{ 
  project: ConstructionProject; 
  onPress?: () => void;
}> = ({ project, onPress }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <ProjectTypeIcon type={project.project_type} />
          <View style={styles.titleContent}>
            <Text style={styles.projectName} numberOfLines={2}>
              {project.project_name}
            </Text>
            <Text style={styles.projectCode}>{project.project_code}</Text>
          </View>
        </View>
        <ProjectStatusBadge status={project.status} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#8e8e93" />
          <Text style={styles.infoText} numberOfLines={1}>
            {project.location.district}, {project.location.province}
          </Text>
        </View>

        {project.budget && (
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={16} color="#8e8e93" />
            <Text style={styles.infoText}>
              {formatCurrency(project.budget.estimated_cost)}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#8e8e93" />
          <Text style={styles.infoText}>
            Bắt đầu: {formatDate(project.timeline.start_date)}
          </Text>
        </View>

        {project.specifications && (
          <View style={styles.specsRow}>
            {project.specifications.floors && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{project.specifications.floors}</Text>
                <Text style={styles.specLabel}>tầng</Text>
              </View>
            )}
            {project.specifications.bedrooms && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{project.specifications.bedrooms}</Text>
                <Text style={styles.specLabel}>phòng ngủ</Text>
              </View>
            )}
            {project.specifications.bathrooms && (
              <View style={styles.specItem}>
                <Text style={styles.specValue}>{project.specifications.bathrooms}</Text>
                <Text style={styles.specLabel}>phòng tắm</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ErrorBanner: React.FC<{ 
  error: any; 
  recommendations: string[];
  onRetry: () => void;
}> = ({ error, recommendations, onRetry }) => {
  return (
    <View style={styles.errorBanner}>
      <View style={styles.errorHeader}>
        <Ionicons name="warning" size={20} color="#ff9500" />
        <Text style={styles.errorTitle}>Thông báo kết nối</Text>
      </View>
      
      <Text style={styles.errorMessage}>
        {error.errorType === 'server' 
          ? 'Máy chủ tạm thời không khả dụng. Đang hiển thị dữ liệu có sẵn.'
          : 'Đã xảy ra lỗi khi tải dữ liệu. Ứng dụng vẫn hoạt động bình thường.'
        }
      </Text>

      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          {recommendations.slice(0, 2).map((rec, index) => (
            <Text key={index} style={styles.recommendation}>
              • {rec}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Ionicons name="refresh" size={16} color="#007aff" />
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
};

export const SmartProjectList: React.FC<SmartProjectListProps> = ({
  showHeader = true,
  maxItems,
  filters,
  onProjectPress
}) => {
  const [projectsResponse, setProjectsResponse] = useState<ProjectApiResponse<ConstructionProject[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('[SmartProjectList] Loading projects with filters:', filters);
      
      const response = await enhancedProjectApiService.getProjects(filters);
      setProjectsResponse(response);
      
      console.log(`[SmartProjectList] Loaded ${response.data.length} projects from ${response.source}`);
      
    } catch (error) {
      console.error('[SmartProjectList] Error loading projects:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleProjectPress = (project: ConstructionProject) => {
    if (onProjectPress) {
      onProjectPress(project);
    } else {
      Alert.alert(
        project.project_name,
        `Mã dự án: ${project.project_code}\nTrạng thái: ${project.status}\nChủ đầu tư: ${project.owner_name}`
      );
    }
  };

  useEffect(() => {
    loadProjects();
  }, [filters]);

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={styles.loadingText}>Đang tải danh sách dự án...</Text>
        </View>
      </Container>
    );
  }

  if (!projectsResponse) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProjects}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const displayProjects = maxItems 
    ? projectsResponse.data.slice(0, maxItems)
    : projectsResponse.data;

  return (
    <Container>
      {showHeader && (
        <Section title="Dự án xây dựng">
          <View style={styles.headerRow}>
            <Text style={styles.projectCount}>
              {projectsResponse.data.length} dự án
            </Text>
            <ApiStatusBadge 
              source={projectsResponse.source} 
              hasError={!!projectsResponse.error}
            />
          </View>
        </Section>
      )}

      {projectsResponse.error && projectsResponse.recommendations && (
        <ErrorBanner
          error={projectsResponse.error}
          recommendations={projectsResponse.recommendations}
          onRetry={loadProjects}
        />
      )}

      <ScrollView
        style={styles.projectsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {displayProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onPress={() => handleProjectPress(project)}
          />
        ))}

        {displayProjects.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open" size={48} color="#8e8e93" />
            <Text style={styles.emptyText}>Chưa có dự án nào</Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b6b',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  projectsList: {
    flex: 1,
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  titleContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectCode: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  projectStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  projectStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  specItem: {
    alignItems: 'center',
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007aff',
  },
  specLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  errorBanner: {
    backgroundColor: '#fff9e6',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff9500',
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendationsContainer: {
    marginBottom: 12,
  },
  recommendation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
});

export default SmartProjectList;
