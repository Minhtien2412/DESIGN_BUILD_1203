import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProjectAction {
  id: string;
  title: string;
  icon: string;
  route: string;
  color: string;
}

interface ProjectActionsMenuProps {
  projectId: string;
}

const PROJECT_ACTIONS: ProjectAction[] = [
  {
    id: 'timeline',
    title: 'Timeline Thi Công',
    icon: 'git-network-outline',
    route: '/projects/[id]/construction-timeline',
    color: '#3B82F6',
  },
  {
    id: 'payment',
    title: 'Tiến Độ Thanh Toán',
    icon: 'cash-outline',
    route: '/projects/[id]/payment-progress',
    color: '#10B981',
  },
  {
    id: 'process',
    title: 'Quy Trình Chi Tiết',
    icon: 'git-branch-outline',
    route: '/projects/[id]/process-detail/1',
    color: '#8B5CF6',
  },
  {
    id: 'quotation',
    title: 'Báo Giá Nhà Thầu',
    icon: 'document-text-outline',
    route: '/projects/quotation-list',
    color: '#F59E0B',
  },
  {
    id: 'contractors',
    title: 'Tìm Thợ Xây',
    icon: 'people-outline',
    route: '/projects/find-contractors',
    color: '#EF4444',
  },
  {
    id: 'portfolio',
    title: 'Hồ Sơ Mẫu',
    icon: 'folder-open-outline',
    route: '/projects/design-portfolio',
    color: '#06B6D4',
  },
];

export default function ProjectActionsMenu({ projectId }: ProjectActionsMenuProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleAction = (action: ProjectAction) => {
    const route = action.route.replace('[id]', projectId);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>Quản Lý Dự Án</Text>
      
      <View style={styles.grid}>
        {PROJECT_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { borderColor: borderColor }]}
            onPress={() => handleAction(action)}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text style={[styles.actionTitle, { color: textColor }]} numberOfLines={2}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
