/**
 * Call History Screen
 * Displays call history with video/audio calls, missed/completed status
 */

import Avatar from '@/components/ui/avatar';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OtherUser {
  id: number;
  name: string;
  avatar: string | null;
}

interface Call {
  id: number;
  type: 'video' | 'audio';
  status: 'missed' | 'completed' | 'declined' | 'failed';
  duration: number; // in seconds
  startedAt: string;
  endedAt: string | null;
  isIncoming: boolean;
  otherUser: OtherUser;
}

export default function CallHistoryScreen() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchCalls = useCallback(async (isRefresh = false, currentOffset?: number) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (currentOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const offsetToUse = isRefresh ? 0 : (currentOffset ?? offset);
      const data = await apiFetch(`/api/calls?limit=${limit}&offset=${offsetToUse}`);

      const newCalls = data.calls || [];
      
      if (isRefresh || offsetToUse === 0) {
        setCalls(newCalls);
        setOffset(limit);
      } else {
        setCalls(prev => [...prev, ...newCalls]);
        setOffset(offsetToUse + limit);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []); // REMOVE offset dependency!

  useEffect(() => {
    fetchCalls(false, 0);
  }, [fetchCalls]);

  const handleRefresh = () => {
    fetchCalls(true, 0);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCalls(false, offset);
    }
  };

  const handleCallPress = (call: Call) => {
    // Start new call with the same user
    router.push(`/call/video-call?userId=${call.otherUser.id}` as any);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = (call: Call) => {
    if (call.status === 'missed') {
      return call.isIncoming ? 'Cuộc gọi nhỡ' : 'Không trả lời';
    }
    if (call.status === 'completed') {
      return call.isIncoming ? 'Cuộc gọi đến' : 'Cuộc gọi đi';
    }
    if (call.status === 'declined') {
      return call.isIncoming ? 'Từ chối' : 'Đã từ chối';
    }
    if (call.status === 'failed') {
      return 'Cuộc gọi thất bại';
    }
    return '';
  };

  const getCallStatusColor = (call: Call) => {
    if (call.status === 'missed') return '#ef4444';
    if (call.status === 'completed') return '#22c55e';
    if (call.status === 'declined') return '#f59e0b';
    if (call.status === 'failed') return '#999';
    return '#111';
  };

  const getCallIcon = (call: Call) => {
    if (call.status === 'missed') {
      return call.isIncoming ? 'call-outline' : 'call-outline';
    }
    return call.isIncoming ? 'call' : 'call';
  };

  const renderCall = ({ item }: { item: Call }) => (
    <TouchableOpacity
      style={styles.callItem}
      onPress={() => handleCallPress(item)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar
          avatar={item.otherUser.avatar}
          userId={String(item.otherUser.id)}
          name={item.otherUser.name}
          pixelSize={56}
        />
        
        {/* Call type badge */}
        <View style={[
          styles.callTypeBadge,
          item.type === 'video' ? styles.videoBadge : styles.audioBadge
        ]}>
          <Ionicons 
            name={item.type === 'video' ? 'videocam' : 'call'} 
            size={12} 
            color="#fff" 
          />
        </View>
      </View>

      {/* Call info */}
      <View style={styles.callInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.otherUser.name}
        </Text>
        
        <View style={styles.callDetails}>
          <Ionicons 
            name={getCallIcon(item)} 
            size={14} 
            color={getCallStatusColor(item)}
            style={{ 
              transform: [{ 
                rotate: item.isIncoming ? '135deg' : '-45deg' 
              }] 
            }}
          />
          <Text style={[styles.callStatus, { color: getCallStatusColor(item) }]}>
            {getCallStatusText(item)}
          </Text>
          {item.duration > 0 && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
            </>
          )}
        </View>

        <Text style={styles.timeText}>{formatTime(item.startedAt)}</Text>
      </View>

      {/* Call action button */}
      <TouchableOpacity 
        style={styles.callButton}
        onPress={() => handleCallPress(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons 
          name={item.type === 'video' ? 'videocam' : 'call'} 
          size={22} 
          color="#3b82f6" 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="call-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Chưa có cuộc gọi</Text>
        <Text style={styles.emptySubtitle}>
          Lịch sử cuộc gọi của bạn sẽ hiển thị ở đây
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải lịch sử cuộc gọi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cuộc gọi</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Calls list */}
      <FlatList
        data={calls}
        renderItem={renderCall}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={calls.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
  },
  callItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callTypeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  videoBadge: {
    backgroundColor: '#3b82f6',
  },
  audioBadge: {
    backgroundColor: '#22c55e',
  },
  callInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  callStatus: {
    fontSize: 13,
    marginLeft: 6,
  },
  separator: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 6,
  },
  duration: {
    fontSize: 13,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
