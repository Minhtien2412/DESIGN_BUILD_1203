/**
 * Perfex CRM Components
 * ======================
 * 
 * UI Components để hiển thị dữ liệu từ Perfex CRM
 * 
 * @author ThietKeResort Team
 * @since 2025-12-30
 */

import {
    usePerfexCustomers,
    usePerfexDashboard,
    usePerfexProjects,
    usePerfexSyncState
} from '@/context/PerfexSyncContext';
import {
    Customer,
    formatDate,
    formatVND,
    getProjectStatusColor,
    getProjectStatusName,
    Project,
} from '@/services/perfexSync';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ==================== SYNC STATUS BANNER ====================

export function SyncStatusBanner() {
  const { isSyncing, lastSyncTime, lastError, syncProgress, sync } = usePerfexSyncState();

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Chưa đồng bộ';
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    return date.toLocaleTimeString('vi-VN');
  };

  return (
    <View style={[styles.syncBanner, lastError ? styles.syncBannerError : null]}>
      <View style={styles.syncInfo}>
        {isSyncing ? (
          <>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.syncText}>Đang đồng bộ... {syncProgress}%</Text>
          </>
        ) : lastError ? (
          <>
            <Ionicons name="alert-circle" size={16} color="#000000" />
            <Text style={[styles.syncText, styles.syncTextError]}>Lỗi: {lastError}</Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
            <Text style={styles.syncText}>Đồng bộ: {formatLastSync()}</Text>
          </>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.syncButton} 
        onPress={() => sync(true)}
        disabled={isSyncing}
      >
        <Ionicons 
          name="refresh" 
          size={18} 
          color={isSyncing ? '#9CA3AF' : '#3B82F6'} 
        />
      </TouchableOpacity>
    </View>
  );
}

// ==================== DASHBOARD CARDS ====================

export function DashboardCards() {
  const { dashboard, isLoading, error, refresh } = usePerfexDashboard();

  if (isLoading && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error && !dashboard) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#000000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.dashboardGrid}>
      <DashboardCard
        icon="people"
        title="Khách hàng"
        value={dashboard?.totalCustomers || 0}
        color="#3B82F6"
      />
      <DashboardCard
        icon="folder"
        title="Dự án"
        value={dashboard?.totalProjects || 0}
        color="#0066CC"
      />
      <DashboardCard
        icon="play-circle"
        title="Đang thực hiện"
        value={dashboard?.activeProjects || 0}
        color="#0066CC"
      />
      <DashboardCard
        icon="cash"
        title="Tổng giá trị"
        value={formatVND(dashboard?.totalValue || 0)}
        color="#666666"
        isLarge
      />
    </View>
  );
}

interface DashboardCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  color: string;
  isLarge?: boolean;
}

function DashboardCard({ icon, title, value, color, isLarge }: DashboardCardProps) {
  return (
    <View style={[styles.dashboardCard, isLarge && styles.dashboardCardLarge]}>
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, isLarge && styles.cardValueSmall]}>
        {value}
      </Text>
    </View>
  );
}

// ==================== PROJECT LIST ====================

interface ProjectListProps {
  customerId?: string;
  onProjectPress?: (project: Project) => void;
  showHeader?: boolean;
}

export function ProjectList({ customerId, onProjectPress, showHeader = true }: ProjectListProps) {
  const { projects, isLoading, refresh, getByCustomer } = usePerfexProjects();
  const [refreshing, setRefreshing] = React.useState(false);

  const displayProjects = customerId ? getByCustomer(customerId) : projects;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => onProjectPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getProjectStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getProjectStatusColor(item.status) }]}>
            {getProjectStatusName(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.projectInfo}>
        <View style={styles.projectInfoRow}>
          <Ionicons name="business" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>{item.company}</Text>
        </View>
        <View style={styles.projectInfoRow}>
          <Ionicons name="cash" size={14} color="#6B7280" />
          <Text style={styles.projectInfoText}>{formatVND(parseFloat(item.project_cost || '0'))}</Text>
        </View>
      </View>
      
      <View style={styles.projectFooter}>
        <View style={styles.projectDateRow}>
          <Ionicons name="calendar" size={12} color="#9CA3AF" />
          <Text style={styles.projectDate}>{formatDate(item.start_date)}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${item.progress || 0}%` as any }]} />
          <Text style={styles.progressText}>{item.progress || 0}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !projects.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {showHeader && (
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Dự án ({displayProjects.length})</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={displayProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có dự án nào</Text>
          </View>
        }
      />
    </View>
  );
}

// ==================== CUSTOMER LIST ====================

interface CustomerListProps {
  onCustomerPress?: (customer: Customer) => void;
  showHeader?: boolean;
}

export function CustomerList({ onCustomerPress, showHeader = true }: CustomerListProps) {
  const { customers, isLoading, refresh } = usePerfexCustomers();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => onCustomerPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.customerAvatar}>
        <Text style={styles.customerAvatarText}>
          {item.company.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.customerInfo}>
        <Text style={styles.customerName} numberOfLines={1}>{item.company}</Text>
        <View style={styles.customerDetails}>
          <Ionicons name="call" size={12} color="#6B7280" />
          <Text style={styles.customerDetailText}>{item.phonenumber}</Text>
        </View>
        <View style={styles.customerDetails}>
          <Ionicons name="location" size={12} color="#6B7280" />
          <Text style={styles.customerDetailText} numberOfLines={1}>{item.city}</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  if (isLoading && !customers.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {showHeader && (
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Khách hàng ({customers.length})</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.userid}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có khách hàng nào</Text>
          </View>
        }
      />
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // Sync Banner
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  syncBannerError: {
    backgroundColor: '#FEE2E2',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncText: {
    fontSize: 13,
    color: '#6B7280',
  },
  syncTextError: {
    color: '#000000',
  },
  syncButton: {
    padding: 4,
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#000000',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },

  // Dashboard
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  dashboardCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dashboardCardLarge: {
    width: '100%',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  cardValueSmall: {
    fontSize: 18,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Project Card
  projectCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  projectInfo: {
    marginBottom: 12,
  },
  projectInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    minWidth: 40,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Customer Card
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerDetailText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default {
  SyncStatusBanner,
  DashboardCards,
  ProjectList,
  CustomerList,
};
