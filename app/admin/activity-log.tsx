import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ActivityLog {
  id: number;
  action: string;
  module: string;
  description: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
  details?: string;
}

export default function ActivityLogScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  // Mock data
  const activities: ActivityLog[] = [
    {
      id: 1,
      action: 'LOGIN',
      module: 'auth',
      description: 'Đăng nhập hệ thống',
      user: { name: 'Nguyễn Văn A', role: 'Admin' },
      timestamp: '2025-01-20T09:30:00',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: 2,
      action: 'CREATE',
      module: 'projects',
      description: 'Tạo dự án mới: Tòa nhà Sunrise Tower',
      user: { name: 'Trần Thị B', role: 'Project Manager' },
      timestamp: '2025-01-20T10:15:00',
      ipAddress: '192.168.1.101',
      status: 'success',
      details: 'Project ID: PRJ-2025-001',
    },
    {
      id: 3,
      action: 'UPDATE',
      module: 'budget',
      description: 'Cập nhật ngân sách Q1/2025',
      user: { name: 'Lê Văn C', role: 'Finance' },
      timestamp: '2025-01-20T11:00:00',
      ipAddress: '192.168.1.102',
      status: 'success',
      details: 'Tăng ngân sách từ 5 tỷ lên 5.5 tỷ',
    },
    {
      id: 4,
      action: 'DELETE',
      module: 'documents',
      description: 'Xóa tài liệu: Bản vẽ cũ v1',
      user: { name: 'Phạm Văn D', role: 'Engineer' },
      timestamp: '2025-01-20T11:30:00',
      ipAddress: '192.168.1.103',
      status: 'warning',
    },
    {
      id: 5,
      action: 'LOGIN',
      module: 'auth',
      description: 'Đăng nhập thất bại - sai mật khẩu',
      user: { name: 'Unknown', role: 'N/A' },
      timestamp: '2025-01-20T12:00:00',
      ipAddress: '203.162.1.50',
      status: 'failed',
      details: 'Tài khoản: test@example.com',
    },
    {
      id: 6,
      action: 'EXPORT',
      module: 'reports',
      description: 'Xuất báo cáo tiến độ tháng 1/2025',
      user: { name: 'Nguyễn Văn A', role: 'Admin' },
      timestamp: '2025-01-20T14:00:00',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: 7,
      action: 'UPDATE',
      module: 'permissions',
      description: 'Thay đổi quyền user: Phạm Văn D',
      user: { name: 'Nguyễn Văn A', role: 'Admin' },
      timestamp: '2025-01-20T14:30:00',
      ipAddress: '192.168.1.100',
      status: 'success',
      details: 'Thêm quyền: can_approve_documents',
    },
  ];

  const modules = [
    { key: 'all', label: 'Tất cả' },
    { key: 'auth', label: 'Đăng nhập' },
    { key: 'projects', label: 'Dự án' },
    { key: 'budget', label: 'Ngân sách' },
    { key: 'documents', label: 'Tài liệu' },
    { key: 'reports', label: 'Báo cáo' },
    { key: 'permissions', label: 'Phân quyền' },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return '#0D9488';
      case 'UPDATE': return '#0D9488';
      case 'DELETE': return '#000000';
      case 'LOGIN': return '#666666';
      case 'EXPORT': return '#0D9488';
      default: return '#94A3B8';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#0D9488';
      case 'failed': return '#000000';
      case 'warning': return '#0D9488';
      default: return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'ellipse';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN');
  };

  const filteredActivities = activities.filter(activity => {
    const matchSearch = activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       activity.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchModule = filterModule === 'all' || activity.module === filterModule;
    return matchSearch && matchModule;
  });

  return (
    <Container fullWidth>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhật ký hoạt động</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.summaryNumber, { color: '#0D9488' }]}>
              {activities.filter(a => a.status === 'success').length}
            </Text>
            <Text style={styles.summaryLabel}>Thành công</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.summaryNumber, { color: '#0D9488' }]}>
              {activities.filter(a => a.status === 'warning').length}
            </Text>
            <Text style={styles.summaryLabel}>Cảnh báo</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.summaryNumber, { color: '#000000' }]}>
              {activities.filter(a => a.status === 'failed').length}
            </Text>
            <Text style={styles.summaryLabel}>Thất bại</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm hoạt động..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Module Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {modules.map((module) => (
            <TouchableOpacity
              key={module.key}
              style={[
                styles.filterTab,
                filterModule === module.key && styles.filterTabActive,
              ]}
              onPress={() => setFilterModule(module.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterModule === module.key && styles.filterTextActive,
                ]}
              >
                {module.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={[styles.actionBadge, { backgroundColor: `${getActionColor(activity.action)}15` }]}>
                  <Text style={[styles.actionText, { color: getActionColor(activity.action) }]}>
                    {activity.action}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <Ionicons
                    name={getStatusIcon(activity.status) as any}
                    size={16}
                    color={getStatusColor(activity.status)}
                  />
                </View>
              </View>

              <Text style={styles.description}>{activity.description}</Text>

              {activity.details && (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailsText}>{activity.details}</Text>
                </View>
              )}

              <View style={styles.activityFooter}>
                <View style={styles.userInfo}>
                  <Ionicons name="person-circle-outline" size={16} color="#94A3B8" />
                  <Text style={styles.userName}>{activity.user.name}</Text>
                  <Text style={styles.userRole}>({activity.user.role})</Text>
                </View>
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>{formatTime(activity.timestamp)}</Text>
                  <Text style={styles.dateText}>{formatDate(activity.timestamp)}</Text>
                </View>
              </View>

              <View style={styles.ipRow}>
                <Ionicons name="globe-outline" size={12} color="#CBD5E1" />
                <Text style={styles.ipText}>IP: {activity.ipAddress}</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  exportButton: {
    padding: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  filterContainer: {
    marginTop: 12,
    maxHeight: 44,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusContainer: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailsBox: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  userRole: {
    fontSize: 11,
    color: '#94A3B8',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  ipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ipText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
});
