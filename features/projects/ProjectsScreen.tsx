import ProjectQuickActions from '@/components/projects/quick-actions';
import TopPlusMenu from '@/components/projects/top-plus-menu';
import { Colors } from '@/constants/theme';
import { useProjectData } from '@/context/project-data-context';
import { useSmartBackHandler } from '@/hooks/useBackHandler';
import { Project, ProjectStatus, ProjectType, useProjects } from '@/hooks/useProjects';
import { getItem, setItem } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

// Compact filter chip
const FilterChip = ({
  label,
  active,
  onPress,
  count,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.3)' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, { color: active ? colors.accent : '#fff' }]}>
        {label}
      </Text>
      {typeof count === 'number' && (
        <View style={[styles.countBadge, { backgroundColor: active ? colors.accent : '#fff' }]}>
          <Text style={[styles.countBadgeText, { color: active ? '#fff' : colors.accent }]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Project card
const ProjectCard = ({
  project,
  onPress,
  onMenuPress,
  budgetData,
  projectTasks,
}: {
  project: Project;
  onPress: () => void;
  onMenuPress: () => void;
  budgetData?: { totalBudget: number; totalSpent: number } | undefined;
  projectTasks?: ({ status: string } | any)[];
}) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  const getStatusColor = () => {
    switch (project.status) {
      case 'active':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'planning':
        return '#FF9500';
      case 'paused':
        return '#FF3B30';
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = () => {
    switch (project.status) {
      case 'active':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'planning':
        return 'Lên kế hoạch';
      case 'paused':
        return 'Tạm dừng';
      default:
        return 'Khác';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const budgetStat = (() => {
    if (!budgetData) return null;
    const percentage = (budgetData.totalSpent / budgetData.totalBudget) * 100;
    const color = percentage > 100 ? '#EF4444' : percentage > 80 ? '#F59E0B' : '#10B981';
    return { percentage, color };
  })();

  const taskStat = (() => {
    if (!projectTasks || projectTasks.length === 0) return null;
    const completed = projectTasks.filter((t: any) => t.status === 'completed').length;
    return { completed, total: projectTasks.length };
  })();

  const typeLabel = (() => {
    switch (project.type) {
      case 'residential': return 'Nhà ở';
      case 'commercial': return 'Thương mại';
      case 'landscape': return 'Cảnh quan';
      case 'interior': return 'Nội thất';
      case 'renovation': return 'Cải tạo';
      default: return project.type;
    }
  })();

  const formatCurrency = (v?: number) => {
    if (!v && v !== 0) return undefined;
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
    } catch {
      return `₫${(v || 0).toLocaleString('vi-VN')}`;
    }
  };

  const onCallPress = () => {
    const phone = project.client?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const onMessagePress = () => {
    // Navigate to messages; could be enhanced to pass project context later
    router.push('/messages' as const);
  };

  return (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: colors.chipBackground }]}
      onPress={onPress}
      onLongPress={onMenuPress}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleContainer}>
          <Text style={[styles.projectTitle, { color: colors.text }]}>{project.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {project.description ? (
        <Text style={[styles.projectDescription, { color: colors.textMuted }]} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}

      {project.location ? (
        <View style={styles.projectLocation}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.projectLocationText, { color: colors.textMuted }]}>{project.location}</Text>
        </View>
      ) : null}

      {/* Meta row: type, client, budget */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cube-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{typeLabel}</Text>
        </View>
        {project.client?.name ? (
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{project.client.name}</Text>
          </View>
        ) : null}
        {(budgetData?.totalBudget || project.budget) ? (
          <View style={styles.metaItem}>
            <Ionicons name="wallet-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {formatCurrency(budgetData?.totalBudget ?? project.budget ?? 0)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Tiến độ</Text>
          <Text style={[styles.progressValue, { color: colors.accent }]}>{project.progress ?? 0}%</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${project.progress ?? 0}%` }]} />
        </View>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.projectInfo}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.projectInfoText, { color: colors.textMuted }]}>
            {project.start_date ? `${formatDate(project.start_date)} → ${formatDate(project.end_date ?? undefined)}` : formatDate(project.end_date ?? undefined)}
          </Text>
        </View>
        <View style={styles.projectStats}>
          {/* Contact quick actions */}
          {project.client?.phone ? (
            <View style={styles.contactActions}>
              <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.border }]} onPress={onCallPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="call-outline" size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.border }]} onPress={onMessagePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          ) : null}
          {budgetStat ? (
            <View style={styles.projectStat}>
              <Ionicons name="wallet-outline" size={14} color={budgetStat.color} />
              <Text style={[styles.projectStatText, { color: budgetStat.color }]}>{budgetStat.percentage.toFixed(0)}%</Text>
            </View>
          ) : null}

          {taskStat ? (
            <View style={styles.projectStat}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.projectStatText, { color: colors.textMuted }]}>
                {taskStat.completed}/{taskStat.total}
              </Text>
            </View>
          ) : null}

          <View style={styles.projectStat}>
            <Ionicons name="people-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.projectStatText, { color: colors.textMuted }]}>{project.team?.length || 0}</Text>
          </View>
          <View style={styles.projectStat}>
            <Ionicons name="document-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.projectStatText, { color: colors.textMuted }]}>{Array.isArray(project.documents) ? project.documents.length : (project.documents || 0)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ProjectsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | ProjectStatus>('all');
  const [activeType, setActiveType] = useState<'all' | ProjectType>('all');
  const [sortKey, setSortKey] = useState<'newest' | 'budget' | 'progress'>('newest');
  const [showAdvFilter, setShowAdvFilter] = useState(false);
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);

  useSmartBackHandler();

  const { budgets, tasks: allTasks } = useProjectData();
  const { projects, loading, error, pagination, refresh, fetchMore, hasMore } = useProjects({
    status: activeFilter === 'all' || activeFilter === 'mine' ? undefined : activeFilter,
    mine: activeFilter === 'mine',
    type: activeType === 'all' ? undefined : activeType,
    search: debouncedSearch || undefined,
    limit: 20,
  });

  const projectCounts = useMemo(() => ({
    all: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    planning: projects.filter((p) => p.status === 'planning').length,
    paused: projects.filter((p) => p.status === 'paused').length,
  }), [projects]);

  const displayedProjects = useMemo(() => {
    let arr = [...projects];
    // Client-side advanced filter: budget range
    const min = budgetMin ? parseFloat(budgetMin) : undefined;
    const max = budgetMax ? parseFloat(budgetMax) : undefined;
    if (min != null || max != null) {
      arr = arr.filter((p) => {
        const b = p.budget ?? 0;
        if (min != null && b < min) return false;
        if (max != null && b > max) return false;
        return true;
      });
    }
    // Date range filter on created_at or start_date as fallback
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : undefined;
    const toTs = dateTo ? new Date(dateTo).getTime() : undefined;
    if (fromTs != null || toTs != null) {
      arr = arr.filter((p) => {
        const dStr = p.created_at || p.start_date || p.end_date;
        if (!dStr) return false;
        const ts = new Date(dStr).getTime();
        if (Number.isNaN(ts)) return false;
        if (fromTs != null && ts < fromTs) return false;
        if (toTs != null && ts > toTs) return false;
        return true;
      });
    }
    switch (sortKey) {
      case 'budget':
        return arr.sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
      case 'progress':
        return arr.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
      case 'newest':
      default:
        return arr.sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });
    }
  }, [projects, sortKey, budgetMin, budgetMax, dateFrom, dateTo]);

  // Type counts for chips
  const typeCounts = useMemo(() => {
    const counts: Record<ProjectType, number> = {
      residential: 0,
      commercial: 0,
      landscape: 0,
      interior: 0,
      renovation: 0,
    };
    projects.forEach((p) => {
      if (p?.type && counts[p.type as ProjectType] != null) {
        counts[p.type as ProjectType] += 1;
      }
    });
    return counts;
  }, [projects]);

  // Persist filters/sort/search
  const PREF_STATUS = 'projects_filter_status';
  const PREF_TYPE = 'projects_filter_type';
  const PREF_SORT = 'projects_sort_key';
  const PREF_SEARCH = 'projects_search_query';
  const PREF_BUDGET_MIN = 'projects_budget_min';
  const PREF_BUDGET_MAX = 'projects_budget_max';
  const PREF_DATE_FROM = 'projects_date_from';
  const PREF_DATE_TO = 'projects_date_to';

  useEffect(() => {
    (async () => {
      const [s, t, k, q, bmin, bmax, df, dt] = await Promise.all([
        getItem(PREF_STATUS),
        getItem(PREF_TYPE),
        getItem(PREF_SORT),
        getItem(PREF_SEARCH),
        getItem(PREF_BUDGET_MIN),
        getItem(PREF_BUDGET_MAX),
        getItem(PREF_DATE_FROM),
        getItem(PREF_DATE_TO),
      ]);
      if (s && ['all','mine','active','completed','planning','paused'].includes(s)) setActiveFilter(s as any);
      if (t && ['all','residential','commercial','landscape','interior','renovation'].includes(t)) setActiveType(t as any);
      if (k && ['newest','budget','progress'].includes(k)) setSortKey(k as any);
      if (typeof q === 'string') setSearchQuery(q);
      if (typeof bmin === 'string') setBudgetMin(bmin);
      if (typeof bmax === 'string') setBudgetMax(bmax);
      if (typeof df === 'string') setDateFrom(df);
      if (typeof dt === 'string') setDateTo(dt);
    })();
  }, []);

  useEffect(() => { setItem(PREF_STATUS, String(activeFilter)); }, [activeFilter]);
  useEffect(() => { setItem(PREF_TYPE, String(activeType)); }, [activeType]);
  useEffect(() => { setItem(PREF_SORT, String(sortKey)); }, [sortKey]);
  useEffect(() => { setItem(PREF_SEARCH, String(searchQuery)); }, [searchQuery]);
  // Debounce search to reduce calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  useEffect(() => { setItem(PREF_BUDGET_MIN, String(budgetMin)); }, [budgetMin]);
  useEffect(() => { setItem(PREF_BUDGET_MAX, String(budgetMax)); }, [budgetMax]);
  useEffect(() => { setItem(PREF_DATE_FROM, String(dateFrom)); }, [dateFrom]);
  useEffect(() => { setItem(PREF_DATE_TO, String(dateTo)); }, [dateTo]);

  const overviewStats = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    projects.forEach((project) => {
      const budget = budgets[project.id];
      if (budget) {
        totalBudget += budget.totalBudget;
        totalSpent += budget.totalSpent;
      }
      const tasks = allTasks[project.id];
      if (tasks) {
        totalTasks += tasks.length;
        completedTasks += tasks.filter((t: any) => t.status === 'completed').length;
      }
    });

    return {
      budgetPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      taskPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalBudget,
      totalSpent,
      totalTasks,
      completedTasks,
    };
  }, [projects, budgets, allTasks]);

  const handleProjectPress = (project: Project) => {
    router.push((`/projects/${project.id}`) as const);
  };

  const handleMenuPress = (project: Project) => {
    setSelectedProject(project);
    setShowQuickActions(true);
  };

  const handleQuickAction = (action: 'edit' | 'share' | 'archive' | 'delete') => {
    if (!selectedProject) return;
    switch (action) {
      case 'edit':
        router.push((`/projects/edit/${selectedProject.id}`) as const);
        break;
      case 'share':
        Alert.alert('Chia sẻ', `Chia sẻ dự án: ${selectedProject.name}`);
        break;
      case 'archive':
        Alert.alert('Đã lưu trữ', `Dự án "${selectedProject.name}" đã được lưu trữ`);
        break;
      case 'delete':
        Alert.alert('Đã xóa', `Dự án "${selectedProject.name}" đã được xóa`);
        refresh();
        break;
    }
  };

  const handleCreateProject = () => {
    router.push('/projects/create' as const);
  };

  const renderProjectCard = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => handleProjectPress(item)}
      onMenuPress={() => handleMenuPress(item)}
      budgetData={budgets[item.id]}
      projectTasks={allTasks[item.id]}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        {searchQuery ? 'Không tìm thấy dự án' : 'Chưa có dự án'}
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
        {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Tạo dự án mới để bắt đầu'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: colors.accent }]} onPress={handleCreateProject}>
          <Text style={styles.emptyStateButtonText}>Tạo dự án mới</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Dự án</Text>
            <Text style={styles.headerSubtitle}>
              {displayedProjects.length} / {projects.length} dự án
            </Text>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowTopMenu(true)}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search - compact like Home */}
        <View style={[styles.searchBar, { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: Colors.light.border, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14 }]}> 
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={[styles.searchInput, { color: '#333', fontSize: 13, marginLeft: 10 }]}
            placeholder="Tìm kiếm dự án..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters: status + mine */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          <FilterChip label="Tất cả" active={activeFilter === 'all'} onPress={() => setActiveFilter('all')} count={projectCounts.all} />
          <FilterChip label="Của tôi" active={activeFilter === 'mine'} onPress={() => setActiveFilter('mine')} />
          <FilterChip label="Đang thực hiện" active={activeFilter === 'active'} onPress={() => setActiveFilter('active')} count={projectCounts.active} />
          <FilterChip label="Hoàn thành" active={activeFilter === 'completed'} onPress={() => setActiveFilter('completed')} count={projectCounts.completed} />
          <FilterChip label="Lên kế hoạch" active={activeFilter === 'planning'} onPress={() => setActiveFilter('planning')} count={projectCounts.planning} />
          <FilterChip label="Tạm dừng" active={activeFilter === 'paused'} onPress={() => setActiveFilter('paused')} count={projectCounts.paused} />
        </ScrollView>

        {/* Type filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterScrollContent, { marginTop: 8 }] }>
          <FilterChip label="Tất cả loại" active={activeType === 'all'} onPress={() => setActiveType('all')} />
          <FilterChip label="Nhà ở" active={activeType === 'residential'} onPress={() => setActiveType('residential')} count={typeCounts.residential} />
          <FilterChip label="Thương mại" active={activeType === 'commercial'} onPress={() => setActiveType('commercial')} count={typeCounts.commercial} />
          <FilterChip label="Cảnh quan" active={activeType === 'landscape'} onPress={() => setActiveType('landscape')} count={typeCounts.landscape} />
          <FilterChip label="Nội thất" active={activeType === 'interior'} onPress={() => setActiveType('interior')} count={typeCounts.interior} />
          <FilterChip label="Cải tạo" active={activeType === 'renovation'} onPress={() => setActiveType('renovation')} count={typeCounts.renovation} />
        </ScrollView>

        {/* Sort controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12, opacity: 0.9 }}>Sắp xếp:</Text>
            <TouchableOpacity onPress={() => setSortKey('newest')} style={[styles.sortPill, { backgroundColor: sortKey === 'newest' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }]}>
              <Ionicons name="time-outline" size={14} color={sortKey === 'newest' ? '#000' : '#fff'} />
              <Text style={[styles.sortPillText, { color: sortKey === 'newest' ? '#000' : '#fff' }]}>Mới nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortKey('budget')} style={[styles.sortPill, { backgroundColor: sortKey === 'budget' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }]}>
              <Ionicons name="wallet-outline" size={14} color={sortKey === 'budget' ? '#000' : '#fff'} />
              <Text style={[styles.sortPillText, { color: sortKey === 'budget' ? '#000' : '#fff' }]}>Ngân sách</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortKey('progress')} style={[styles.sortPill, { backgroundColor: sortKey === 'progress' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }]}>
              <Ionicons name="trending-up-outline" size={14} color={sortKey === 'progress' ? '#000' : '#fff'} />
              <Text style={[styles.sortPillText, { color: sortKey === 'progress' ? '#000' : '#fff' }]}>Tiến độ</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setShowAdvFilter(true)} style={[styles.sortPill, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Ionicons name="options-outline" size={14} color={'#fff'} />
              <Text style={[styles.sortPillText, { color: '#fff' }]}>Bộ lọc nâng cao</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setActiveFilter('all'); setActiveType('all'); setSortKey('newest'); setSearchQuery(''); setBudgetMin(''); setBudgetMax(''); setDateFrom(''); setDateTo(''); }}>
              <Text style={{ color: '#fff', fontSize: 12, textDecorationLine: 'underline', opacity: 0.9 }}>Xóa lọc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Active filters summary */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
          {activeFilter !== 'all' && (
            <TouchableOpacity style={styles.activeFilterChip} onPress={() => setActiveFilter('all')}>
              <Ionicons name="filter" size={12} color={'#fff'} />
              <Text style={styles.activeFilterText}>
                {activeFilter === 'mine' ? 'Của tôi' : activeFilter === 'active' ? 'Đang thực hiện' : activeFilter === 'completed' ? 'Hoàn thành' : activeFilter === 'planning' ? 'Lên kế hoạch' : 'Tạm dừng'}
              </Text>
              <Ionicons name="close" size={12} color={'#fff'} />
            </TouchableOpacity>
          )}
          {activeType !== 'all' && (
            <TouchableOpacity style={styles.activeFilterChip} onPress={() => setActiveType('all')}>
              <Ionicons name="cube-outline" size={12} color={'#fff'} />
              <Text style={styles.activeFilterText}>
                {activeType === 'residential' ? 'Nhà ở' : activeType === 'commercial' ? 'Thương mại' : activeType === 'landscape' ? 'Cảnh quan' : activeType === 'interior' ? 'Nội thất' : 'Cải tạo'}
              </Text>
              <Ionicons name="close" size={12} color={'#fff'} />
            </TouchableOpacity>
          )}
          {(budgetMin || budgetMax) && (
            <TouchableOpacity style={styles.activeFilterChip} onPress={() => { setBudgetMin(''); setBudgetMax(''); }}>
              <Ionicons name="wallet-outline" size={12} color={'#fff'} />
              <Text style={styles.activeFilterText}>₫{budgetMin || '0'} - ₫{budgetMax || '∞'}</Text>
              <Ionicons name="close" size={12} color={'#fff'} />
            </TouchableOpacity>
          )}
          {(dateFrom || dateTo) && (
            <TouchableOpacity style={styles.activeFilterChip} onPress={() => { setDateFrom(''); setDateTo(''); }}>
              <Ionicons name="calendar-outline" size={12} color={'#fff'} />
              <Text style={styles.activeFilterText}>{dateFrom || '...'} → {dateTo || '...'}</Text>
              <Ionicons name="close" size={12} color={'#fff'} />
            </TouchableOpacity>
          )}
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.activeFilterChip} onPress={() => setSearchQuery('')}>
              <Ionicons name="search-outline" size={12} color={'#fff'} />
              <Text style={styles.activeFilterText}>{searchQuery}</Text>
              <Ionicons name="close" size={12} color={'#fff'} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Quick Stats Overview */}
      {projects.length > 0 && (
        <View style={[styles.statsOverview, { backgroundColor: colors.chipBackground, borderBottomColor: colors.border }]}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#3b82f620' }]}>
              <Ionicons name="wallet-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ngân sách</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{overviewStats.budgetPercentage.toFixed(0)}%</Text>
            <Text style={[styles.statSubtext, { color: colors.textMuted }]}>
              ₫{(overviewStats.totalSpent / 1000000000).toFixed(1)}B / ₫{(overviewStats.totalBudget / 1000000000).toFixed(1)}B
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="checkmark-done-outline" size={20} color="#10b981" />
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Công việc</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{overviewStats.taskPercentage.toFixed(0)}%</Text>
            <Text style={[styles.statSubtext, { color: colors.textMuted }]}>
              {overviewStats.completedTasks}/{overviewStats.totalTasks} hoàn thành
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tiến độ TB</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {projects.length > 0 ? (projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / projects.length).toFixed(0) : 0}%
            </Text>
            <Text style={[styles.statSubtext, { color: colors.textMuted }]}>
              Trung bình {projectCounts.active} dự án
            </Text>
          </View>
        </View>
      )}

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#FF3B30" />
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={displayedProjects}
        renderItem={renderProjectCard}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading && !hasMore}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (hasMore && !loading) fetchMore();
        }}
        onEndReachedThreshold={0.5}
      />

      {loading && projects.length === 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải dự án...</Text>
        </View>
      ) : null}

      {/* Quick Actions Menu */}
      <ProjectQuickActions
        visible={showQuickActions}
        projectName={selectedProject?.name || ''}
        onClose={() => setShowQuickActions(false)}
        onAction={handleQuickAction}
      />

      {/* Top-right Plus Menu */}
      <TopPlusMenu visible={showTopMenu} onClose={() => setShowTopMenu(false)} />

      {/* Advanced Filter Modal */}
      <Modal visible={showAdvFilter} transparent animationType="fade" onRequestClose={() => setShowAdvFilter(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>
            <View style={{ gap: 12 }}>
              <Text style={styles.modalSectionTitle}>Ngân sách (VND)</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Tối thiểu</Text>
                  <TextInput value={budgetMin} onChangeText={setBudgetMin} keyboardType="numeric" placeholder="vd 50000000" style={styles.modalInput} placeholderTextColor="#999" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Tối đa</Text>
                  <TextInput value={budgetMax} onChangeText={setBudgetMax} keyboardType="numeric" placeholder="vd 500000000" style={styles.modalInput} placeholderTextColor="#999" />
                </View>
              </View>

              <Text style={[styles.modalSectionTitle, { marginTop: 8 }]}>Thời gian</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Từ ngày</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput value={dateFrom} onChangeText={setDateFrom} placeholder="YYYY-MM-DD" style={[styles.modalInput, { flex: 1 }]} placeholderTextColor="#999" />
                    <TouchableOpacity onPress={() => setShowFromPicker(true)} style={[styles.sortPill, { backgroundColor: '#eee' }]}>
                      <Ionicons name="calendar-outline" size={14} color={'#111'} />
                      <Text style={[styles.sortPillText, { color: '#111' }]}>Chọn</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Đến ngày</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput value={dateTo} onChangeText={setDateTo} placeholder="YYYY-MM-DD" style={[styles.modalInput, { flex: 1 }]} placeholderTextColor="#999" />
                    <TouchableOpacity onPress={() => setShowToPicker(true)} style={[styles.sortPill, { backgroundColor: '#eee' }]}>
                      <Ionicons name="calendar-outline" size={14} color={'#111'} />
                      <Text style={[styles.sortPillText, { color: '#111' }]}>Chọn</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#e5e5e5' }]} onPress={() => { setBudgetMin(''); setBudgetMax(''); setDateFrom(''); setDateTo(''); }}>
                <Text style={[styles.modalButtonText, { color: '#111' }]}>Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: Colors.light.accent, flex: 1 }]} onPress={() => setShowAdvFilter(false)}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Native Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={dateFrom ? new Date(dateFrom) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => {
            setShowFromPicker(Platform.OS === 'ios');
            if (d) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              setDateFrom(`${yyyy}-${mm}-${dd}`);
            }
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={dateTo ? new Date(dateTo) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => {
            setShowToPicker(Platform.OS === 'ios');
            if (d) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              setDateTo(`${yyyy}-${mm}-${dd}`);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 42, paddingBottom: 16, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  createButton: { padding: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchInput: { flex: 1 },
  filterScrollContent: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  sortPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  sortPillText: { fontSize: 12, fontWeight: '600' },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  countBadgeText: { fontSize: 11, fontWeight: '700' },
  statsOverview: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, gap: 12, borderBottomWidth: 1 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  statSubtext: { fontSize: 10, textAlign: 'center' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE5E5', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  errorText: { flex: 1, fontSize: 14, color: '#FF3B30' },
  retryText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 32 },
  projectCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  projectTitleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flex: 1 },
  projectTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  menuButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  projectDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  projectLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  projectLocationText: { fontSize: 13 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12, alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  progressContainer: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 12, fontWeight: '700' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  projectInfoText: { fontSize: 12 },
  projectStats: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  contactActions: { flexDirection: 'row', gap: 8, marginRight: 4 },
  contactButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  projectStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  projectStatText: { fontSize: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyStateTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  emptyStateButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  emptyStateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
  modalSectionTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  modalLabel: { fontSize: 12, color: '#666', marginBottom: 6, marginTop: 6 },
  modalInput: { backgroundColor: '#f8f8f8', borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#111' },
  modalButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalButtonText: { fontSize: 16, fontWeight: '700' },
  activeFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#9CA3AF' },
  activeFilterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
