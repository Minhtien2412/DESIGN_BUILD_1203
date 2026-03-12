/**
 * Materials Management - Material Requests
 * Danh sách yêu cầu vật liệu
 */

import { StatusBadge, TimelineItem } from '@/components/construction';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { MaterialRequest, MaterialsService, RequestStatus } from '@/services/api/materials.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_CONFIG: Record<RequestStatus, {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  pending: { label: 'Chờ duyệt', variant: 'warning', icon: 'time' },
  approved: { label: 'Đã duyệt', variant: 'success', icon: 'checkmark-circle' },
  rejected: { label: 'Từ chối', variant: 'error', icon: 'close-circle' },
  ordered: { label: 'Đã đặt', variant: 'info', icon: 'cart' },
  delivered: { label: 'Đã nhận', variant: 'success', icon: 'checkmark-done' },
  cancelled: { label: 'Hủy', variant: 'neutral', icon: 'ban' },
};

const URGENCY_CONFIG = {
  low: { label: 'Thấp', color: '#0D9488' },
  medium: { label: 'Trung bình', color: '#0D9488' },
  high: { label: 'Cao', color: '#000000' },
};

export default function MaterialRequestsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await MaterialsService.getRequests(
        projectId,
        filter !== 'all' ? { status: filter } : undefined
      );
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApprove = async (requestId: string) => {
    try {
      await MaterialsService.updateRequest(requestId, {
        status: 'approved',
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
      });
      Alert.alert('Thành công', 'Đã phê duyệt yêu cầu');
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phê duyệt yêu cầu');
    }
  };

  const handleReject = async (requestId: string) => {
    Alert.alert(
      'Từ chối yêu cầu',
      'Bạn có chắc muốn từ chối yêu cầu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              await MaterialsService.updateRequest(requestId, {
                status: 'rejected',
                approvedBy: 'Current User',
                approvedAt: new Date().toISOString(),
              });
              Alert.alert('Đã từ chối yêu cầu');
              loadData();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối yêu cầu');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (loading && !refreshing) {
    return (
      <Container fullWidth>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container fullWidth>
      <StatusBar style="dark" />

      {/* Header */}
      <Section>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Yêu cầu vật liệu</Text>
            <Text style={styles.subtitle}>{requests.length} yêu cầu</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push(`/projects/${projectId}/materials/requests/create`)}
          >
            <Ionicons name="add-circle" size={28} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>

          {(Object.keys(STATUS_CONFIG) as RequestStatus[]).map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filter === status && styles.filterChipActive]}
              onPress={() => setFilter(status)}
            >
              <Ionicons
                name={STATUS_CONFIG[status].icon}
                size={16}
                color={filter === status ? '#fff' : '#6b7280'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                {STATUS_CONFIG[status].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Section>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Section>
          {requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Chưa có yêu cầu nào</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push(`/projects/${projectId}/materials/requests/create`)}
              >
                <Text style={styles.emptyButtonText}>Tạo yêu cầu mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timeline}>
              {requests.map((request, index) => {
                const config = STATUS_CONFIG[request.status];
                const urgency = URGENCY_CONFIG[request.urgency];

                return (
                  <View key={request.id} style={styles.requestCard}>
                    <TimelineItem
                      title={request.materialName}
                      description={`${request.quantity} ${request.unit} • ${request.requestedBy}`}
                      date={formatDate(request.requestedAt)}
                      status={
                        request.status === 'delivered' || request.status === 'approved'
                          ? 'completed'
                          : request.status === 'rejected' || request.status === 'cancelled'
                          ? 'failed'
                          : request.status === 'pending'
                          ? 'current'
                          : 'pending'
                      }
                      icon={config.icon}
                      isFirst={index === 0}
                      isLast={index === requests.length - 1}
                      onPress={() =>
                        router.push(`/projects/${projectId}/materials/requests/${request.id}`)
                      }
                    />

                    <View style={styles.requestDetails}>
                      <View style={styles.badges}>
                        <StatusBadge
                          label={config.label}
                          variant={config.variant}
                          icon={config.icon}
                          size="small"
                        />
                        <View
                          style={[styles.urgencyBadge, { backgroundColor: urgency.color + '15' }]}
                        >
                          <Text style={[styles.urgencyText, { color: urgency.color }]}>
                            {urgency.label}
                          </Text>
                        </View>
                      </View>

                      {request.notes && (
                        <Text style={styles.notes} numberOfLines={2}>
                          {request.notes}
                        </Text>
                      )}

                      {request.deliveryDate && (
                        <View style={styles.deliveryInfo}>
                          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                          <Text style={styles.deliveryText}>
                            Giao: {formatDate(request.deliveryDate)}
                          </Text>
                        </View>
                      )}

                      {request.status === 'pending' && (
                        <View style={styles.actions}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleApprove(request.id)}
                          >
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Duyệt</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleReject(request.id)}
                          >
                            <Ionicons name="close" size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Từ chối</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    marginLeft: 12,
  },
  filterRow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  timeline: {
    marginTop: 8,
  },
  requestCard: {
    marginBottom: 16,
  },
  requestDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginLeft: 52,
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  urgencyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notes: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#0D9488',
  },
  rejectButton: {
    backgroundColor: '#000000',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
