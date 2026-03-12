// Construction Projects List Component
// Display list of construction projects with filters

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { constructionProjectService } from '@/services/constructionProjects';
import { ConstructionProject } from '@/types/construction';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ProjectsListProps {
  projects: ConstructionProject[];
  loading?: boolean;
  onRefresh?: () => void;
  onProjectPress?: (project: ConstructionProject) => void;
  onCreateProject?: () => void;
  showCreateButton?: boolean;
  showStats?: boolean;
}

interface ProjectCardProps {
  project: ConstructionProject;
  onPress?: (project: ConstructionProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');
  
  const getStatusColor = (status: ConstructionProject['status']) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return '#0D9488'; // green
      case 'in_progress':
        return '#0D9488'; // blue
      case 'pending_review':
        return '#0D9488'; // yellow
      case 'on_hold':
        return '#000000'; // red
      case 'cancelled':
        return '#6b7280'; // gray
      default:
        return mutedColor;
    }
  };

  const getStatusIcon = (status: ConstructionProject['status']) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'completed':
        return 'checkmark-done-circle';
      case 'in_progress':
        return 'build';
      case 'pending_review':
        return 'time';
      case 'on_hold':
        return 'pause-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'document';
    }
  };

  const getProjectTypeIcon = (type: ConstructionProject['project_type']) => {
    switch (type) {
      case 'nha_o':
        return 'home';
      case 'biet_thu':
        return 'business';
      case 'nha_pho':
        return 'storefront';
      case 'chung_cu':
        return 'layers';
      case 'van_phong':
        return 'briefcase';
      case 'thuong_mai':
        return 'bag';
      case 'cong_nghiep':
        return 'construct';
      default:
        return 'cube';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.projectCard, { borderColor }]}
      onPress={() => onPress?.(project)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.projectInfo}>
          <Ionicons 
            name={getProjectTypeIcon(project.project_type)} 
            size={24} 
            color={primaryColor} 
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.projectName, { color: textColor }]} numberOfLines={1}>
              {project.project_name}
            </Text>
            <Text style={[styles.projectCode, { color: mutedColor }]}>
              {project.project_code}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(project.status)} 
            size={16} 
            color={getStatusColor(project.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
            {constructionProjectService.getStatusText(project.status)}
          </Text>
        </View>
      </View>

      {/* Project Details */}
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={mutedColor} />
          <Text style={[styles.detailText, { color: mutedColor }]} numberOfLines={1}>
            {project.location.address}, {project.location.district}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="resize" size={16} color={mutedColor} />
          <Text style={[styles.detailText, { color: mutedColor }]}>
            {project.location.land_area}m² đất
            {project.location.construction_area && 
              ` • ${project.location.construction_area}m² xây dựng`
            }
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color={mutedColor} />
          <Text style={[styles.detailText, { color: mutedColor }]}>
            {constructionProjectService.formatCurrency(project.budget.estimated_cost)}
          </Text>
        </View>

        {project.specifications && (
          <View style={styles.detailRow}>
            <Ionicons name="layers" size={16} color={mutedColor} />
            <Text style={[styles.detailText, { color: mutedColor }]}>
              {project.specifications.floors} tầng
              {project.specifications.bedrooms && ` • ${project.specifications.bedrooms} phòng ngủ`}
              {project.specifications.bathrooms && ` • ${project.specifications.bathrooms} WC`}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={[styles.footerText, { color: mutedColor }]}>
          Loại: {constructionProjectService.getProjectTypeText(project.project_type)}
        </Text>
        <Text style={[styles.footerText, { color: mutedColor }]}>
          {new Date(project.created_at).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  loading = false,
  onRefresh,
  onProjectPress,
  onCreateProject,
  showCreateButton = true,
  showStats = true
}) => {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icon');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const renderProject = ({ item }: { item: ConstructionProject }) => (
    <ProjectCard project={item} onPress={onProjectPress} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct" size={64} color={mutedColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Chưa có dự án nào
      </Text>
      <Text style={[styles.emptyText, { color: mutedColor }]}>
        Tạo dự án đầu tiên để bắt đầu quản lý xây dựng
      </Text>
      {showCreateButton && onCreateProject && (
        <Button
          title="Tạo dự án mới"
          onPress={onCreateProject}
          style={{ marginTop: 16 }}
        />
      )}
    </View>
  );

  if (projects.length === 0 && !loading) {
    return (
      <Container>
        {renderEmpty()}
      </Container>
    );
  }

  return (
    <Container>
      {/* Stats Section */}
      {showStats && projects.length > 0 && (
        <Section title="Tổng quan">
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {projects.length}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>
                Dự án
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {projects.filter(p => p.status === 'in_progress').length}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>
                Đang thi công
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {projects.filter(p => p.status === 'completed').length}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>
                Hoàn thành
              </Text>
            </View>
          </View>
        </Section>
      )}

      {/* Create Button */}
      {showCreateButton && onCreateProject && (
        <View style={styles.createButtonContainer}>
          <Button
            title="Tạo dự án mới"
            onPress={onCreateProject}
          />
        </View>
      )}

      {/* Projects List */}
      <Section title={`Danh sách dự án (${projects.length})`}>
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Section>
    </Container>
  );
};

const styles = StyleSheet.create({
  projectCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  projectCode: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  createButtonContainer: {
    marginBottom: 16,
  },
});
