/**
 * Calls List Component - Teams Style
 * Call history with video/audio indicators and actions
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Participant {
  id: number;
  name: string;
  avatar: string | null;
  isOnline?: boolean;
}

export interface Call {
  id: number;
  type: 'video' | 'audio';
  status: 'missed' | 'completed' | 'declined' | 'ongoing';
  direction: 'incoming' | 'outgoing';
  participant: Participant;
  startedAt: string;
  endedAt?: string;
  duration: number; // seconds
}

interface CallsListProps {
  calls: Call[];
  onCallPress: (callId: number) => void;
  onStartCall?: (userId: number, type: 'video' | 'audio') => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function CallsList({
  calls,
  onCallPress,
  onStartCall,
  onRefresh,
  refreshing = false,
}: CallsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'missed'>('all');

  const filteredCalls = calls.filter((call) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!call.participant.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Type filter
    if (filterType === 'video' && call.type !== 'video') return false;
    if (filterType === 'audio' && call.type !== 'audio') return false;
    if (filterType === 'missed' && call.status !== 'missed') return false;

    return true;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric', 
      month: 'numeric' 
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  const getCallStatusInfo = (call: Call) => {
    const isIncoming = call.direction === 'incoming';
    
    switch (call.status) {
      case 'missed':
        return {
          icon: 'arrow-down' as const,
          iconColor: '#C4314B',
          text: isIncoming ? 'Nhỡ cuộc gọi' : 'Không trả lời',
          textColor: '#C4314B',
        };
      case 'declined':
        return {
          icon: 'close' as const,
          iconColor: '#D13438',
          text: 'Từ chối',
          textColor: '#D13438',
        };
      case 'ongoing':
        return {
          icon: 'arrow-up' as const,
          iconColor: '#107C10',
          text: 'Đang gọi...',
          textColor: '#107C10',
        };
      case 'completed':
      default:
        return {
          icon: isIncoming ? ('arrow-down' as const) : ('arrow-up' as const),
          iconColor: '#107C10',
          text: isIncoming ? 'Cuộc gọi đến' : 'Cuộc gọi đi',
          textColor: '#616161',
        };
    }
  };

  const renderCallItem = ({ item }: { item: Call }) => {
    const statusInfo = getCallStatusInfo(item);

    return (
      <TouchableOpacity
        style={[
          styles.callItem,
          item.status === 'missed' && styles.callItemMissed,
        ]}
        onPress={() => onCallPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.participant.avatar ? (
            <Image 
              source={{ uri: item.participant.avatar }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color="#8A8886" />
            </View>
          )}
          {item.participant.isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </View>

        {/* Content */}
        <View style={styles.callContent}>
          <Text 
            style={[
              styles.participantName,
              item.status === 'missed' && styles.missedText,
            ]}
            numberOfLines={1}
          >
            {item.participant.name}
          </Text>

          <View style={styles.callInfo}>
            <Ionicons 
              name={statusInfo.icon} 
              size={14} 
              color={statusInfo.iconColor} 
            />
            <Ionicons 
              name={item.type === 'video' ? 'videocam' : 'call'} 
              size={14} 
              color="#8A8886" 
              style={styles.callTypeIcon}
            />
            <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
              {statusInfo.text}
            </Text>
            {item.duration > 0 && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.durationText}>
                  {formatDuration(item.duration)}
                </Text>
              </>
            )}
          </View>

          <Text style={styles.timeText}>
            {formatTime(item.startedAt)}
          </Text>
        </View>

        {/* Call Actions */}
        {item.status !== 'ongoing' && onStartCall && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.videoButton]}
              onPress={() => onStartCall(item.participant.id, 'video')}
            >
              <Ionicons name="videocam" size={20} color="#6264A7" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.audioButton]}
              onPress={() => onStartCall(item.participant.id, 'audio')}
            >
              <Ionicons name="call" size={18} color="#6264A7" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuộc gọi</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="add-circle-outline" size={20} color="#424242" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8A8886" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm cuộc gọi"
          placeholderTextColor="#8A8886"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#8A8886" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'missed' && styles.filterChipActive]}
          onPress={() => setFilterType('missed')}
        >
          <Text style={[styles.filterText, filterType === 'missed' && styles.filterTextActive]}>
            Nhỡ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'video' && styles.filterChipActive]}
          onPress={() => setFilterType('video')}
        >
          <Ionicons 
            name="videocam" 
            size={14} 
            color={filterType === 'video' ? '#6264A7' : '#616161'} 
          />
          <Text style={[styles.filterText, filterType === 'video' && styles.filterTextActive]}>
            Video
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'audio' && styles.filterChipActive]}
          onPress={() => setFilterType('audio')}
        >
          <Ionicons 
            name="call" 
            size={14} 
            color={filterType === 'audio' ? '#6264A7' : '#616161'} 
          />
          <Text style={[styles.filterText, filterType === 'audio' && styles.filterTextActive]}>
            Audio
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calls List */}
      <FlatList
        data={filteredCalls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="call-outline" size={64} color="#E1DFDD" />
            <Text style={styles.emptyText}>Chưa có cuộc gọi</Text>
          </View>
        }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1DFDD',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#242424',
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F2F1',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#242424',
    marginLeft: 8,
    padding: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F2F1',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#E8E8F8',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#616161',
  },
  filterTextActive: {
    color: '#6264A7',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  callItemMissed: {
    backgroundColor: '#FFF5F5',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: '#E1DFDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#92C353',
    borderWidth: 2,
    borderColor: '#fff',
  },
  callContent: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#242424',
    marginBottom: 4,
  },
  missedText: {
    color: '#C4314B',
    fontWeight: '600',
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  callTypeIcon: {
    marginLeft: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    fontSize: 13,
    color: '#8A8886',
    marginHorizontal: 6,
  },
  durationText: {
    fontSize: 13,
    color: '#616161',
  },
  timeText: {
    fontSize: 12,
    color: '#8A8886',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoButton: {
    backgroundColor: '#E8E8F8',
  },
  audioButton: {
    backgroundColor: '#E8E8F8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8886',
    marginTop: 16,
  },
});
