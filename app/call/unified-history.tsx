/**
 * Unified Call History Screen
 * Màn hình lịch sử cuộc gọi kiểu Zalo
 * Tích hợp với messaging system
 * 
 * @author AI Assistant
 * @date 29/12/2025
 */

import Avatar from '@/components/ui/avatar';
import { useCall } from '@/hooks/useCall';
import { CallHistoryItem, CallType } from '@/services/api/call.service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ==================== THEME ====================

const COLORS = {
  primary: '#0068FF',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E5E5',
  success: '#0066CC',
  danger: '#000000',
  warning: '#0066CC',
};

// ==================== FILTER TABS ====================

type FilterTab = 'all' | 'missed' | 'outgoing' | 'incoming';

const FILTER_TABS: Array<{ key: FilterTab; label: string; icon: string }> = [
  { key: 'all', label: 'Tất cả', icon: 'call' },
  { key: 'missed', label: 'Gọi nhỡ', icon: 'call-outline' },
  { key: 'outgoing', label: 'Gọi đi', icon: 'arrow-up' },
  { key: 'incoming', label: 'Gọi đến', icon: 'arrow-down' },
];

// ==================== CALL ITEM ====================

interface CallItemProps {
  call: CallHistoryItem;
  onPress: () => void;
  onCallBack: (type: CallType) => void;
}

function CallItem({ call, onPress, onCallBack }: CallItemProps) {
  const { otherUser, type, status, duration, isOutgoing, createdAt } = call;
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (diffMins < 60) return time;
    if (diffHours < 24) return time;
    if (diffDays === 1) return `Hôm qua ${time}`;
    if (diffDays < 7) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return `${days[date.getDay()]} ${time}`;
    }
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} phút ${secs} giây`;
    }
    return `${secs} giây`;
  };

  // Get call icon and color
  const getCallIndicator = () => {
    const isMissed = status === 'missed';
    const isRejected = status === 'rejected';
    
    if (isMissed || isRejected) {
      return {
        icon: isOutgoing ? 'arrow-up' : 'arrow-down',
        color: COLORS.danger,
        text: isMissed ? 'Cuộc gọi nhỡ' : 'Từ chối',
      };
    }

    return {
      icon: isOutgoing ? 'arrow-up' : 'arrow-down',
      color: COLORS.success,
      text: duration ? formatDuration(duration) : 'Đã kết nối',
    };
  };

  const indicator = getCallIndicator();
  const isVideo = type === 'video';

  return (
    <TouchableOpacity style={styles.callItem} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Avatar
          avatar={otherUser.avatar || null}
          userId={String(otherUser.id)}
          name={otherUser.name}
          pixelSize={50}
        />
        {/* Call type badge */}
        <View style={[styles.callTypeBadge, { backgroundColor: indicator.color }]}>
          <Ionicons 
            name={isVideo ? 'videocam' : 'call'} 
            size={10} 
            color="#FFFFFF" 
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.callInfo}>
        <Text style={styles.callName} numberOfLines={1}>
          {otherUser.name}
        </Text>
        <View style={styles.callMeta}>
          <Ionicons 
            name={indicator.icon as any} 
            size={14} 
            color={indicator.color} 
          />
          <Text style={[styles.callStatus, { color: indicator.color }]}>
            {indicator.text}
          </Text>
          <Text style={styles.callTime}>• {formatTime(createdAt)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.callActions}>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => onCallBack('audio')}
        >
          <Ionicons name="call" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => onCallBack('video')}
        >
          <Ionicons name="videocam" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ==================== MAIN COMPONENT ====================

export default function UnifiedCallHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const {
    callHistory,
    missedCallsCount,
    loading,
    refreshing,
    refreshHistory,
    loadMoreHistory,
    startCall,
    hasMoreHistory,
    clearMissedCalls,
  } = useCall({ autoLoadHistory: true });

  // Filter calls
  const filteredCalls = useMemo(() => {
    switch (activeFilter) {
      case 'missed':
        return callHistory.filter(c => c.status === 'missed' || c.status === 'rejected');
      case 'outgoing':
        return callHistory.filter(c => c.isOutgoing);
      case 'incoming':
        return callHistory.filter(c => !c.isOutgoing);
      default:
        return callHistory;
    }
  }, [callHistory, activeFilter]);

  // Group by date
  const groupedCalls = useMemo(() => {
    const groups: Record<string, CallHistoryItem[]> = {};
    
    filteredCalls.forEach(call => {
      const date = new Date(call.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Hôm nay';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Hôm qua';
      } else {
        key = date.toLocaleDateString('vi-VN', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(call);
    });

    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filteredCalls]);

  // Handlers
  const handleCallPress = useCallback((call: CallHistoryItem) => {
    // Navigate to chat with this user
    router.push(`/messages/${call.otherUser.id}`);
  }, []);

  const handleCallBack = useCallback((userId: number, type: CallType) => {
    startCall(userId, type);
  }, [startCall]);

  const handleClearMissed = useCallback(() => {
    Alert.alert(
      'Xóa cuộc gọi nhỡ',
      'Bạn có chắc muốn đánh dấu tất cả cuộc gọi nhỡ là đã xem?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: () => clearMissedCalls() },
      ]
    );
  }, [clearMissedCalls]);

  // Render section header
  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), []);

  // Render call item
  const renderCall = useCallback(({ item }: { item: CallHistoryItem }) => (
    <CallItem
      call={item}
      onPress={() => handleCallPress(item)}
      onCallBack={(type) => handleCallBack(item.otherUser.id, type)}
    />
  ), [handleCallPress, handleCallBack]);

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="call-outline" size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>Chưa có cuộc gọi</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'missed' 
          ? 'Không có cuộc gọi nhỡ'
          : 'Bắt đầu cuộc gọi với đồng nghiệp'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Lịch sử cuộc gọi</Text>
        
        <View style={styles.headerRight}>
          {missedCallsCount > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearMissed}>
              <Text style={styles.clearButtonText}>Xóa nhỡ ({missedCallsCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {FILTER_TABS.map(tab => {
          const isActive = activeFilter === tab.key;
          const count = tab.key === 'missed' ? missedCallsCount : null;
          
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={isActive ? '#FFFFFF' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.filterTabText,
                isActive && styles.filterTabTextActive,
              ]}>
                {tab.label}
                {count ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Call List */}
      {loading && callHistory.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <SectionList
          sections={groupedCalls}
          renderItem={renderCall}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            groupedCalls.length === 0 && styles.emptyListContent,
          ]}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshHistory}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={loadMoreHistory}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Quick Dial FAB */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/call/dial')}
      >
        <Ionicons name="keypad" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: COLORS.background,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Section
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },

  // Call Item
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  callTypeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callStatus: {
    fontSize: 13,
    marginLeft: 4,
  },
  callTime: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    padding: 8,
    marginLeft: 4,
  },

  // List
  listContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 78,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
