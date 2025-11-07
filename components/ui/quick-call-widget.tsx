import { useVideoCallBackend } from '@/services/videoCallBackend';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

interface QuickContact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  lastCall?: string;
}

interface QuickCallWidgetProps {
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function QuickCallWidget({ compact, style }: QuickCallWidgetProps = {}) {
  const { service, isAuthenticated } = useVideoCallBackend();
  const [contacts, setContacts] = useState<QuickContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickContacts();
  }, []);

  const loadQuickContacts = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      // Get recent contacts from call history and online contacts
      const [callHistory, onlineContacts] = await Promise.all([
        service.getCallHistory(5), // Get 5 recent calls
        service.getContactsWithPresence()
      ]);

      // Combine and deduplicate
      const recentContactIds = new Set(
        callHistory.flatMap(call => call.participants.map(p => p.id))
      );

      const quickContacts: QuickContact[] = [];
      
      // Add recent contacts from call history
      callHistory.forEach(call => {
        call.participants.forEach(participant => {
          if (quickContacts.length < 6 && !quickContacts.find(c => c.id === participant.id)) {
            quickContacts.push({
              id: participant.id,
              name: participant.name,
              avatar: participant.avatar,
              status: 'offline', // Will be updated below
              lastCall: call.timestamp,
            });
          }
        });
      });

      // Fill remaining slots with online contacts
      const onlineList = onlineContacts.filter(c => c.status === 'online');
      onlineList.forEach(contact => {
        if (quickContacts.length < 6 && !quickContacts.find(c => c.id === contact.id)) {
          quickContacts.push({
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
            status: contact.status as any,
          });
        }
      });

      // Update status for existing contacts
      quickContacts.forEach(contact => {
        const onlineContact = onlineContacts.find(c => c.id === contact.id);
        if (onlineContact) {
          contact.status = onlineContact.status as any;
        }
      });

      setContacts(quickContacts);
    } catch (error) {
      console.error('Failed to load quick contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCall = (contact: QuickContact) => {
    const roomId = `quick-${Date.now()}`;
  router.push(`/call-popup?roomId=${roomId}&kind=video&peerId=${contact.id}&peerName=${encodeURIComponent(contact.name)}`);
  };

  const statusColors = {
    online: '#4CAF50',
    busy: '#FF5722',
    away: '#FF9800',
    offline: '#9E9E9E',
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="video" size={20} color="#667eea" />
          <Text style={styles.title}>Video Call</Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.loginText}>Đăng nhập</Text>
          </Pressable>
        </View>
        
        <View style={styles.authPrompt}>
          <MaterialIcons name="person" size={24} color="#ccc" />
          <Text style={styles.authText}>Đăng nhập để gọi video</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="video" size={20} color="#667eea" />
          <Text style={styles.title}>Video Call</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={20} color="#ccc" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer, style]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="video" size={20} color="#667eea" />
        <Text style={styles.title}>Video Call</Text>
        
        <Pressable
          style={styles.moreButton}
          // Legacy video-call-home removed; go to contact-picker instead
          onPress={() => router.push('/contact-picker')}
        >
          <Text style={styles.moreText}>Xem thêm</Text>
          <MaterialIcons name="chevron-right" size={16} color="#667eea" />
        </Pressable>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={32} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có liên hệ gần đây</Text>
          <Pressable
            style={styles.startButton}
            onPress={() => router.push('/contact-picker')}
          >
            <Text style={styles.startButtonText}>Bắt đầu gọi</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          horizontal
          data={contacts}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contactsList}
          renderItem={({ item }) => (
            <Pressable
              style={styles.contactItem}
              onPress={() => handleQuickCall(item)}
            >
              <View style={styles.avatarContainer}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                
                <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] }]} />
                
                {item.status === 'online' && (
                  <View style={styles.callButton}>
                    <MaterialCommunityIcons name="video" size={12} color="#fff" />
                  </View>
                )}
              </View>
              
              <Text style={styles.contactName} numberOfLines={1}>
                {item.name}
              </Text>
              
              {item.lastCall && (
                <Text style={styles.lastCallText} numberOfLines={1}>
                  {formatLastCall(item.lastCall)}
                </Text>
              )}
            </Pressable>
          )}
        />
      )}

      <View style={[styles.quickActions, compact && styles.compactQuickActions]}>
        <Pressable 
          style={styles.quickAction}
          onPress={() => router.push('/contact-picker')}
        >
          <MaterialCommunityIcons name="account-multiple-plus" size={16} color="#667eea" />
          <Text style={styles.quickActionText}>Gọi nhóm</Text>
        </Pressable>
        
        <Pressable 
          style={styles.quickAction}
          onPress={() => router.push('/join-call')}
        >
          <MaterialCommunityIcons name="phone-plus" size={16} color="#667eea" />
          <Text style={styles.quickActionText}>Tham gia</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatLastCall(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Vừa gọi';
  if (diffHours < 24) return `${diffHours}h trước`;
  if (diffDays < 7) return `${diffDays} ngày`;
  return date.toLocaleDateString('vi-VN');
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactContainer: {
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(102,126,234,0.1)',
  },
  loginText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  authPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  authText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 12,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#667eea',
  },
  startButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  contactsList: {
    paddingVertical: 4,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  callButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contactName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  lastCallText: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  compactQuickActions: {
    marginTop: 8,
    paddingTop: 8,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(102,126,234,0.1)',
    gap: 4,
  },
  quickActionText: {
    fontSize: 11,
    color: '#667eea',
    fontWeight: '500',
  },
});
