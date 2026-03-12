/**
 * Enhanced Project Management Screen
 * Full Perfex CRM features for projects
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useProjects } from '@/hooks/usePerfex';
import { ProjectDetails } from '@/services/perfexService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectManagementScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {loading: projectsLoading, getProjects, createProject} = useProjects();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await getProjects();
    setProjects(data);
  };

  const handleCreateProject = async (name: string, description: string, clientId: string) => {
    const result = await createProject({
      name,
      description,
      clientId,
      billingType: 'fixed',
      status: 'not_started',
    });
    
    if (result) {
      Alert.alert('Success', 'Project created successfully');
      setShowCreateModal(false);
      loadProjects();
    }
  };

  const renderProjectCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: cardBg, borderColor }]}
      onPress={() => setSelectedProject(item)}
    >
      <View style={styles.projectHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={[styles.projectName, { color: textColor }]} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      
      {item.description && (
        <Text style={[styles.projectDescription, { color: textColor }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.projectMeta}>
        {item.deadline && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={textColor} />
            <Text style={[styles.metaText, { color: textColor }]}>
              {item.deadline}
            </Text>
          </View>
        )}
        {item.cost && (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={16} color={textColor} />
            <Text style={[styles.metaText, { color: textColor }]}>
              {formatCurrency(item.cost)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      not_started: '#f59e0b',
      in_progress: '#0D9488',
      on_hold: '#8b5cf6',
      cancelled: '#ef4444',
      finished: '#22c55e',
    };
    return colors[status] || '#6b7280';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (projectsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textColor }]}>CRM Projects</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: cardBg }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: primaryColor }]}>{projects.length}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>
            {projects.filter(p => p.status === 'in_progress').length}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>
            {projects.filter(p => p.status === 'finished').length}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Completed</Text>
        </View>
      </View>

      <FlatList
        data={projects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="folder-open-outline" size={64} color="#6b7280" />
            <Text style={[styles.emptyText, { color: textColor }]}>No projects yet</Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: primaryColor }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create First Project</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  projectCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  projectDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
