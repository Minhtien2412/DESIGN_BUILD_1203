/**
 * Tickets/Support Screen - Perfex CRM Style
 * ===========================================
 * 
 * Yêu cầu hỗ trợ dự án:
 * - Ticket list với status filtering
 * - Priority indicators
 * - Assign to staff
 * - Reply/comment system
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useTickets } from '@/hooks/usePerfexAPI';
import type { Ticket } from '@/types/perfex';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

const STATUS_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'open', label: 'Mở' },
  { id: 'in_progress', label: 'Đang xử lý' },
  { id: 'answered', label: 'Đã trả lời' },
  { id: 'closed', label: 'Đã đóng' },
];

export default function TicketsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { 
    tickets, 
    stats, 
    loading, 
    error, 
    refresh, 
    createTicket, 
    updateTicket, 
    deleteTicket 
  } = useTickets();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState<{ subject: string; message: string; priority: Priority }>({ subject: '', message: '', priority: 'medium' });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Loading state
  if (loading && tickets.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Tickets</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.emptyState, { flex: 1 }]}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.emptyText, { color: textColor, marginTop: 16 }]}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Tickets</Text>
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={22} color={primaryColor} />
          </TouchableOpacity>
        </View>
        <View style={[styles.emptyState, { flex: 1 }]}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.emptyText, { color: '#EF4444', marginTop: 16 }]}>Lỗi tải dữ liệu</Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 12 }}>
            <Text style={{ color: primaryColor, fontWeight: '600' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      open: '#0D9488',
      in_progress: '#f59e0b',
      answered: '#22c55e',
      on_hold: '#8b5cf6',
      closed: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      open: 'Mở',
      in_progress: 'Đang xử lý',
      answered: 'Đã trả lời',
      on_hold: 'Tạm dừng',
      closed: 'Đã đóng',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: '#22c55e',
      medium: '#0D9488',
      high: '#f59e0b',
      urgent: '#ef4444',
    };
    return colors[priority] || '#6b7280';
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: Record<string, string> = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao',
      urgent: 'Khẩn cấp',
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredTickets = filter === 'all'
    ? tickets
    : tickets.filter((t) => t.status === filter);

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;

    try {
      await createTicket({
        subject: newTicket.subject,
        message: newTicket.message,
        priority: newTicket.priority,
        department: 'General',
        status: 'open',
      });
      setNewTicket({ subject: '', message: '', priority: 'medium' });
      setShowCreateModal(false);
      await refresh();
    } catch (err) {
      console.error('Create ticket error:', err);
    }
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity style={[styles.ticketCard, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.ticketHeader}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
        <View style={styles.ticketInfo}>
          <Text style={[styles.ticketSubject, { color: textColor }]} numberOfLines={2}>
            {item.subject}
          </Text>
          <View style={styles.ticketMeta}>
            <Text style={[styles.ticketDepartment, { color: textColor }]}>
              {item.department || 'General'}
            </Text>
            <Text style={[styles.ticketDate, { color: textColor }]}>
              • {formatDate(item.date)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <Text style={[styles.ticketMessage, { color: textColor }]} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.ticketFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={14} color="#6b7280" />
          <Text style={[styles.footerText, { color: textColor }]}>0</Text>
        </View>
        {item.assigned && (
          <View style={styles.footerItem}>
            <Ionicons name="person-outline" size={14} color="#6b7280" />
            <Text style={[styles.footerText, { color: textColor }]}>{item.assigned}</Text>
          </View>
        )}
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {getPriorityLabel(item.priority)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Stats
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'closed').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Yêu cầu hỗ trợ</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{openCount}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Mở</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{inProgressCount}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Đang xử lý</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{urgentCount}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Khẩn cấp</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: textColor }]}>{tickets.length}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Tổng</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { borderBottomColor: borderColor }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { borderColor },
                filter === item.id && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
              onPress={() => setFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === item.id ? '#fff' : textColor },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Ticket List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Chưa có yêu cầu</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Tạo yêu cầu hỗ trợ đầu tiên
              </Text>
            </View>
          }
        />
      )}

      {/* Create Ticket Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Tạo yêu cầu mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Tiêu đề"
              placeholderTextColor="#6b7280"
              value={newTicket.subject}
              onChangeText={(text) => setNewTicket({ ...newTicket, subject: text })}
            />

            <TextInput
              style={[styles.textarea, { color: textColor, borderColor }]}
              placeholder="Mô tả chi tiết vấn đề..."
              placeholderTextColor="#6b7280"
              value={newTicket.message}
              onChangeText={(text) => setNewTicket({ ...newTicket, message: text })}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: textColor }]}>Mức độ ưu tiên</Text>
            <View style={styles.priorityOptions}>
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    { borderColor: getPriorityColor(p) },
                    newTicket.priority === p && { backgroundColor: getPriorityColor(p) + '20' },
                  ]}
                  onPress={() => setNewTicket({ ...newTicket, priority: p })}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      { color: getPriorityColor(p) },
                    ]}
                  >
                    {getPriorityLabel(p)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelText, { color: textColor }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: primaryColor }]}
                onPress={handleCreateTicket}
              >
                <Text style={styles.submitText}>Tạo yêu cầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },
  filterBar: {
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  ticketCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    minHeight: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketDepartment: {
    fontSize: 12,
    opacity: 0.7,
  },
  ticketDate: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ticketMessage: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
    marginBottom: 12,
    marginLeft: 16,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.7,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
