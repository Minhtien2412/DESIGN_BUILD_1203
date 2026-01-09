/**
 * Component hiển thị danh sách dữ liệu từ Perfex CRM
 * 
 * @description Hiển thị projects, invoices, estimates, tickets từ CRM
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useDataSync } from '../../hooks/useDataSync';
import { PerfexEstimate, PerfexInvoice, PerfexProject, PerfexTicket } from '../../services/dataSyncService';

type CRMDataType = 'projects' | 'invoices' | 'estimates' | 'tickets';

interface CRMDataListProps {
  /** Loại dữ liệu cần hiển thị */
  type: CRMDataType;
  /** Callback khi chọn item */
  onItemPress?: (item: any) => void;
  /** Số lượng item tối đa */
  limit?: number;
  /** Header title */
  title?: string;
  /** Hiện nút "Xem tất cả" */
  showViewAll?: boolean;
  /** Callback khi nhấn "Xem tất cả" */
  onViewAll?: () => void;
}

const TYPE_CONFIG: Record<CRMDataType, { icon: string; emptyText: string }> = {
  projects: { icon: 'folder-open', emptyText: 'Chưa có dự án nào' },
  invoices: { icon: 'document-text', emptyText: 'Chưa có hóa đơn nào' },
  estimates: { icon: 'calculator', emptyText: 'Chưa có báo giá nào' },
  tickets: { icon: 'chatbubble-ellipses', emptyText: 'Chưa có ticket nào' },
};

/**
 * Danh sách dữ liệu CRM
 */
export function CRMDataList({
  type,
  onItemPress,
  limit,
  title,
  showViewAll = false,
  onViewAll,
}: CRMDataListProps) {
  const { crmData, loading, error, isLinked, fetchCRMData, checkSyncStatus } = useDataSync();
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');

  useEffect(() => {
    checkSyncStatus();
    if (isLinked && !crmData) {
      fetchCRMData();
    }
  }, [isLinked]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCRMData(true);
    setRefreshing(false);
  };

  const getData = (): any[] => {
    if (!crmData) return [];
    let items = crmData[type] || [];
    if (limit) {
      items = items.slice(0, limit);
    }
    return items;
  };

  const renderProjectItem = (item: PerfexProject) => (
    <View style={[styles.itemCard, { backgroundColor: cardBg }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      {item.description && (
        <Text style={[styles.itemSubtitle, { color: secondaryText }]} numberOfLines={1}>
          {item.description}
        </Text>
      )}
      <View style={styles.itemMeta}>
        <Text style={[styles.metaText, { color: secondaryText }]}>
          {item.status}
        </Text>
        {item.deadline && (
          <Text style={[styles.metaText, { color: secondaryText }]}>
            Hạn: {item.deadline}
          </Text>
        )}
      </View>
    </View>
  );

  const renderInvoiceItem = (item: PerfexInvoice) => (
    <View style={[styles.itemCard, { backgroundColor: cardBg }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.statusDot, { backgroundColor: getInvoiceStatusColor(item.status) }]} />
        <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>
          #{item.number}
        </Text>
        <Text style={[styles.amount, { color: primaryColor }]}>
          {formatCurrency(item.total)}
        </Text>
      </View>
      <View style={styles.itemMeta}>
        <Text style={[styles.metaText, { color: secondaryText }]}>
          {item.status}
        </Text>
        {item.dueDate && (
          <Text style={[styles.metaText, { color: secondaryText }]}>
            Hạn: {item.dueDate}
          </Text>
        )}
      </View>
    </View>
  );

  const renderEstimateItem = (item: PerfexEstimate) => (
    <View style={[styles.itemCard, { backgroundColor: cardBg }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.statusDot, { backgroundColor: getEstimateStatusColor(item.status) }]} />
        <Text style={[styles.itemTitle, { color: textColor }]} numberOfLines={1}>
          #{item.number}
        </Text>
        <Text style={[styles.amount, { color: primaryColor }]}>
          {formatCurrency(item.total)}
        </Text>
      </View>
      <Text style={[styles.metaText, { color: secondaryText }]}>
        {item.status} • Hết hạn: {item.expiryDate || 'N/A'}
      </Text>
    </View>
  );

  const renderTicketItem = (item: PerfexTicket) => (
    <View style={[styles.itemCard, { backgroundColor: cardBg }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        <Text style={[styles.itemTitle, { color: textColor, flex: 1 }]} numberOfLines={1}>
          #{item.id}
        </Text>
      </View>
      <Text style={[styles.ticketSubject, { color: textColor }]} numberOfLines={2}>
        {item.subject}
      </Text>
      <View style={styles.itemMeta}>
        <Text style={[styles.metaText, { color: secondaryText }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const content = (() => {
      switch (type) {
        case 'projects': return renderProjectItem(item);
        case 'invoices': return renderInvoiceItem(item);
        case 'estimates': return renderEstimateItem(item);
        case 'tickets': return renderTicketItem(item);
      }
    })();

    if (onItemPress) {
      return (
        <TouchableOpacity onPress={() => onItemPress(item)} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      );
    }
    return content;
  };

  const config = TYPE_CONFIG[type];
  const data = getData();

  // Chưa liên kết CRM
  if (!isLinked) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline" size={40} color={secondaryText} />
          <Text style={[styles.emptyText, { color: secondaryText }]}>
            Tài khoản chưa liên kết với CRM
          </Text>
        </View>
      </View>
    );
  }

  // Lỗi
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={40} color="#ef4444" />
          <Text style={[styles.emptyText, { color: '#ef4444' }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { borderColor: primaryColor }]} onPress={handleRefresh}>
            <Text style={{ color: primaryColor }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {title && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name={config.icon as any} size={20} color={primaryColor} />
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          </View>
          {showViewAll && onViewAll && (
            <TouchableOpacity onPress={onViewAll}>
              <Text style={{ color: primaryColor }}>Xem tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primaryColor]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name={config.icon as any} size={40} color={secondaryText} />
              <Text style={[styles.emptyText, { color: secondaryText }]}>{config.emptyText}</Text>
            </View>
          ) : null
        }
        contentContainerStyle={data.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'not_started': '#f59e0b', // Not Started - Amber
    'in_progress': '#3b82f6', // In Progress - Blue  
    'on_hold': '#8b5cf6', // On Hold - Purple
    'cancelled': '#ef4444', // Cancelled - Red
    'finished': '#22c55e', // Finished - Green
    'completed': '#22c55e', // Completed - Green
  };
  return colors[status?.toLowerCase()] || '#6b7280';
}

function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'unpaid': '#f59e0b', // Unpaid - Amber
    'paid': '#22c55e', // Paid - Green
    'partially_paid': '#ef4444', // Partially Paid - Red
    'overdue': '#ef4444', // Overdue - Red
    'cancelled': '#6b7280', // Cancelled - Gray
    'draft': '#8b5cf6', // Draft - Purple
  };
  return colors[status?.toLowerCase()] || '#6b7280';
}

function getEstimateStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'draft': '#8b5cf6', // Draft - Purple
    'sent': '#3b82f6', // Sent - Blue
    'declined': '#f59e0b', // Declined - Amber
    'accepted': '#22c55e', // Accepted - Green
    'expired': '#ef4444', // Expired - Red
  };
  return colors[status?.toLowerCase()] || '#6b7280';
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'low': '#6b7280', // Low - Gray
    'medium': '#3b82f6', // Medium - Blue
    'high': '#f59e0b', // High - Amber
    'urgent': '#ef4444', // Urgent - Red
  };
  return colors[priority?.toLowerCase()] || '#6b7280';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 13,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  ticketSubject: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
});

export default CRMDataList;
