/**
 * Interactive Sitemap V3 - Role-Based Navigation Tree
 * Shows internal links organized by User Role with tree structure
 * Separates Dashboard items from Personal Timeline
 * @route /sitemap
 */

import {
    ADMIN_SITEMAP,
    EMPLOYEE_SITEMAP,
    flattenSitemap,
    getDashboardRoutes,
    getPersonalTimelineRoutes,
    searchSitemapRoutes,
    SITEMAP_STATS,
    USER_SITEMAP,
    type SitemapNode,
    type UserRole,
} from '@/constants/sitemap-tree-v2';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'tree' | 'dashboard' | 'timeline';

export default function SitemapScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['user-root', 'home']));
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  const currentSitemap = useMemo(() => {
    switch (selectedRole) {
      case 'admin':
        return ADMIN_SITEMAP;
      case 'employee':
        return EMPLOYEE_SITEMAP;
      default:
        return USER_SITEMAP;
    }
  }, [selectedRole]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchSitemapRoutes(searchQuery, currentSitemap);
  }, [searchQuery, currentSitemap]);

  const dashboardRoutes = useMemo(() => getDashboardRoutes(currentSitemap), [currentSitemap]);
  const timelineRoutes = useMemo(() => getPersonalTimelineRoutes(currentSitemap), [currentSitemap]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = () => {
    const allIds = flattenSitemap(currentSitemap).map(n => n.id);
    setExpandedNodes(new Set(allIds));
  };

  const collapseAll = () => setExpandedNodes(new Set());

  const navigateToRoute = (route: string) => {
    router.push(route as any);
  };

  const exportSitemap = async () => {
    const md = generateMarkdown();
    try {
      await Share.share({ message: md, title: 'App Sitemap' });
    } catch {
      console.log('Share cancelled');
    }
  };

  const generateMarkdown = (): string => {
    let md = '# Sơ đồ ứng dụng - Role-Based Navigation\n\n';
    md += `**Tổng routes:** ${SITEMAP_STATS.total}\n`;
    md += `- Người dùng: ${SITEMAP_STATS.user}\n`;
    md += `- Nhân viên: ${SITEMAP_STATS.employee}\n`;
    md += `- Admin: ${SITEMAP_STATS.admin}\n\n`;
    md += '---\n\n';

    const printNode = (node: SitemapNode, level: number) => {
      const indent = '  '.repeat(level);
      const prefix = node.route ? `[${node.titleVi}](${node.route})` : `**${node.titleVi}**`;
      md += `${indent}- ${prefix}\n`;
      node.children?.forEach(child => printNode(child, level + 1));
    };

    md += '## Người dùng\n';
    USER_SITEMAP.children?.forEach(child => printNode(child, 0));
    md += '\n## Nhân viên\n';
    EMPLOYEE_SITEMAP.children?.forEach(child => printNode(child, 0));
    md += '\n## Admin\n';
    ADMIN_SITEMAP.children?.forEach(child => printNode(child, 0));

    return md;
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return '#EE4D2D';
      case 'employee': return '#4ECDC4';
      default: return '#000';
    }
  };

  const renderTreeNode = (node: SitemapNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 16;

    return (
      <View key={node.id}>
        <TouchableOpacity
          style={[styles.treeNode, { marginLeft: indent }]}
          onPress={() => {
            if (hasChildren) {
              toggleNode(node.id);
            } else if (node.route) {
              navigateToRoute(node.route);
            }
          }}
          activeOpacity={0.7}
        >
          {/* Tree connector line */}
          {level > 0 && (
            <View style={styles.treeLine}>
              <View style={styles.treeLineHorizontal} />
              <View style={styles.treeLineVertical} />
            </View>
          )}

          {/* Expand/collapse icon */}
          {hasChildren ? (
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-forward'}
              size={16}
              color="#666"
              style={styles.expandIcon}
            />
          ) : (
            <View style={styles.leafDot} />
          )}

          {/* Node icon */}
          <View style={[styles.nodeIcon, { backgroundColor: getRoleColor(selectedRole) + '15' }]}>
            <Ionicons name={node.icon} size={18} color={getRoleColor(selectedRole)} />
          </View>

          {/* Node content */}
          <View style={styles.nodeContent}>
            <View style={styles.nodeTitleRow}>
              <Text style={styles.nodeTitle}>{node.titleVi}</Text>
              {node.badge && (
                <View style={[styles.badge, { backgroundColor: node.badge === 'NEW' ? '#22c55e' : node.badge === 'HOT' ? '#EE4D2D' : '#8B5CF6' }]}>
                  <Text style={styles.badgeText}>{node.badge}</Text>
                </View>
              )}
              {node.isPersonalTimeline && (
                <View style={[styles.badge, { backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.badgeText}>Timeline</Text>
                </View>
              )}
              {node.isDashboardItem && !node.isPersonalTimeline && (
                <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.badgeText}>Dashboard</Text>
                </View>
              )}
            </View>
            {node.route && (
              <Text style={styles.nodeRoute} numberOfLines={1}>{node.route}</Text>
            )}
          </View>

          {/* Navigate arrow for leaf nodes with routes */}
          {node.route && !hasChildren && (
            <Ionicons name="arrow-forward" size={16} color="#CCC" />
          )}
        </TouchableOpacity>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  const renderFlatList = (nodes: SitemapNode[], emptyMessage: string) => {
    if (nodes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    return (
      <View style={styles.flatList}>
        {nodes.map(node => (
          <TouchableOpacity
            key={node.id}
            style={styles.flatItem}
            onPress={() => node.route && navigateToRoute(node.route)}
          >
            <View style={[styles.nodeIcon, { backgroundColor: getRoleColor(selectedRole) + '15' }]}>
              <Ionicons name={node.icon} size={18} color={getRoleColor(selectedRole)} />
            </View>
            <View style={styles.flatItemContent}>
              <Text style={styles.nodeTitle}>{node.titleVi}</Text>
              {node.route && <Text style={styles.nodeRoute}>{node.route}</Text>}
            </View>
            <Ionicons name="arrow-forward" size={16} color="#CCC" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sơ đồ ứng dụng</Text>
        <TouchableOpacity onPress={exportSitemap} hitSlop={8}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Role Tabs */}
      <View style={styles.roleTabs}>
        {(['user', 'employee', 'admin'] as UserRole[]).map(role => (
          <TouchableOpacity
            key={role}
            style={[styles.roleTab, selectedRole === role && { backgroundColor: getRoleColor(role), borderColor: getRoleColor(role) }]}
            onPress={() => {
              setSelectedRole(role);
              setExpandedNodes(new Set());
            }}
          >
            <Ionicons
              name={role === 'admin' ? 'shield-outline' : role === 'employee' ? 'briefcase-outline' : 'person-outline'}
              size={16}
              color={selectedRole === role ? '#FFF' : '#666'}
            />
            <Text style={[styles.roleTabText, selectedRole === role && styles.roleTabTextActive]}>
              {role === 'admin' ? 'Admin' : role === 'employee' ? 'Nhân viên' : 'Người dùng'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getRoleColor(selectedRole) }]}>
            {selectedRole === 'admin' ? SITEMAP_STATS.admin : selectedRole === 'employee' ? SITEMAP_STATS.employee : SITEMAP_STATS.user}
          </Text>
          <Text style={styles.statLabel}>Routes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{dashboardRoutes.length}</Text>
          <Text style={styles.statLabel}>Dashboard</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{timelineRoutes.length}</Text>
          <Text style={styles.statLabel}>Timeline</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm route..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* View Mode Tabs */}
      <View style={styles.viewModeTabs}>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'tree' && styles.viewModeTabActive]}
          onPress={() => setViewMode('tree')}
        >
          <Ionicons name="git-branch-outline" size={16} color={viewMode === 'tree' ? '#FFF' : '#666'} />
          <Text style={[styles.viewModeText, viewMode === 'tree' && styles.viewModeTextActive]}>Cây</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'dashboard' && styles.viewModeTabActive]}
          onPress={() => setViewMode('dashboard')}
        >
          <Ionicons name="apps-outline" size={16} color={viewMode === 'dashboard' ? '#FFF' : '#666'} />
          <Text style={[styles.viewModeText, viewMode === 'dashboard' && styles.viewModeTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'timeline' && styles.viewModeTabActive]}
          onPress={() => setViewMode('timeline')}
        >
          <Ionicons name="time-outline" size={16} color={viewMode === 'timeline' ? '#FFF' : '#666'} />
          <Text style={[styles.viewModeText, viewMode === 'timeline' && styles.viewModeTextActive]}>Timeline</Text>
        </TouchableOpacity>
      </View>

      {/* Controls for tree view */}
      {viewMode === 'tree' && !filteredNodes && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={expandAll}>
            <Ionicons name="add-circle-outline" size={16} color="#4ECDC4" />
            <Text style={styles.controlText}>Mở tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={collapseAll}>
            <Ionicons name="remove-circle-outline" size={16} color="#EE4D2D" />
            <Text style={styles.controlText}>Thu gọn</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredNodes ? (
          <>
            <Text style={styles.sectionTitle}>Kết quả tìm kiếm ({filteredNodes.length})</Text>
            {renderFlatList(filteredNodes, 'Không tìm thấy kết quả')}
          </>
        ) : viewMode === 'tree' ? (
          <>
            {currentSitemap.children?.map(child => renderTreeNode(child, 0))}
          </>
        ) : viewMode === 'dashboard' ? (
          <>
            <Text style={styles.sectionTitle}>Xem & Chỉnh sửa trong Dashboard ({dashboardRoutes.length})</Text>
            <Text style={styles.sectionSubtitle}>Các mục này hiển thị trong bảng điều khiển</Text>
            {renderFlatList(dashboardRoutes, 'Không có mục dashboard')}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Timeline cá nhân ({timelineRoutes.length})</Text>
            <Text style={styles.sectionSubtitle}>Các mục riêng tư, không trong dashboard chung</Text>
            {renderFlatList(timelineRoutes, 'Không có mục timeline')}
          </>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Chú thích:</Text>
          <View style={styles.legendRow}>
            <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.badgeText}>Dashboard</Text>
            </View>
            <Text style={styles.legendText}>Mục trong bảng điều khiển</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.badge, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.badgeText}>Timeline</Text>
            </View>
            <Text style={styles.legendText}>Mục cá nhân riêng tư</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.badge, { backgroundColor: '#22c55e' }]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
            <Text style={styles.legendText}>Tính năng mới</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.badge, { backgroundColor: '#EE4D2D' }]}>
              <Text style={styles.badgeText}>HOT</Text>
            </View>
            <Text style={styles.legendText}>Phổ biến</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.badgeText}>PRO</Text>
            </View>
            <Text style={styles.legendText}>Tính năng cao cấp</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  roleTabTextActive: {
    color: '#FFF',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFF',
    marginTop: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    padding: 0,
  },
  viewModeTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  viewModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewModeTabActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  viewModeTextActive: {
    color: '#FFF',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  controlText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  treeNode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  treeLine: {
    width: 16,
    height: '100%',
    position: 'absolute',
    left: -8,
  },
  treeLineHorizontal: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 8,
    height: 1,
    backgroundColor: '#DDD',
  },
  treeLineVertical: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1,
    height: '100%',
    backgroundColor: '#DDD',
  },
  expandIcon: {
    marginRight: 6,
  },
  leafDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCC',
    marginRight: 10,
    marginLeft: 5,
  },
  nodeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  nodeContent: {
    flex: 1,
  },
  nodeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  nodeRoute: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  childrenContainer: {
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    paddingLeft: 8,
  },
  flatList: {
    gap: 8,
  },
  flatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  flatItemContent: {
    flex: 1,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  legend: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
