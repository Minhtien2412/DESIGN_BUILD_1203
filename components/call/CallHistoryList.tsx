import { useCall } from '@/context/CallContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Container } from '../ui/container';
import { Section } from '../ui/section';

export function CallHistoryList() {
  const { callHistory } = useCall();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const formatDate = (dateString: string) => {
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
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: any) => {
    const isMissed = call.status === 'missed';
    const isIncoming = call.calleeId === call.id; // Would need current user ID
    
    if (isMissed) {
      return <Ionicons name="call-outline" size={20} color="#000000" />;
    }
    
    if (call.type === 'video') {
      return (
        <Ionicons
          name={isIncoming ? 'arrow-down' : 'arrow-up'}
          size={20}
          color={tintColor}
        />
      );
    }
    
    return (
      <Ionicons
        name={isIncoming ? 'call-outline' : 'call'}
        size={20}
        color={tintColor}
      />
    );
  };

  const renderCallItem = ({ item }: { item: any }) => {
    const otherUser = item.caller || item.callee;
    const isMissed = item.status === 'missed';
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.callItem,
          { borderBottomColor: borderColor },
          pressed && styles.itemPressed,
        ]}
      >
        <View style={styles.callIcon}>
          {getCallIcon(item)}
        </View>

        <View style={styles.callInfo}>
          <Text
            style={[
              styles.callerName,
              { color: isMissed ? '#000000' : textColor },
            ]}
            numberOfLines={1}
          >
            {otherUser?.name || 'Unknown'}
          </Text>
          
          <View style={styles.callMeta}>
            <Text style={[styles.callType, { color: textColor + '80' }]}>
              {item.type === 'video' ? '📹 Video' : '📞 Voice'}
            </Text>
            <Text style={[styles.separator, { color: textColor + '80' }]}>
              •
            </Text>
            <Text style={[styles.callDate, { color: textColor + '80' }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.callActions}>
          {item.duration ? (
            <Text style={[styles.duration, { color: textColor + '60' }]}>
              {formatDuration(item.duration)}
            </Text>
          ) : (
            <Text style={[styles.duration, { color: '#000000' }]}>
              {item.status === 'missed' ? 'Nhớ' : item.status === 'rejected' ? 'Từ chối' : ''}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Container>
      <Section title="Lịch sử cuộc gọi">
        {callHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="call-outline" size={64} color={textColor + '40'} />
            <Text style={[styles.emptyText, { color: textColor + '60' }]}>
              Chưa có cuộc gọi nào
            </Text>
          </View>
        ) : (
          <FlatList
            data={callHistory}
            renderItem={renderCallItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
          />
        )}
      </Section>
    </Container>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemPressed: {
    opacity: 0.7,
  },
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callType: {
    fontSize: 13,
  },
  separator: {
    fontSize: 13,
  },
  callDate: {
    fontSize: 13,
  },
  callActions: {
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});
