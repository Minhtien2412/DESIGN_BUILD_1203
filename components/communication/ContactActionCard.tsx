/**
 * Contact Action Card Component
 * Card liên hệ với các action: Chat, Call, Video - giống Zalo
 * 
 * @author AI Assistant
 * @date 22/12/2025
 */

import Avatar from '@/components/ui/avatar';
import { useCommunicationHub } from '@/context/CommunicationHubContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Contact } from '@/services/unifiedContacts';
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ContactActionCardProps {
  contact: Contact;
  showActions?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

export function ContactActionCard({
  contact,
  showActions = true,
  compact = false,
  onPress,
}: ContactActionCardProps) {
  const { isContactOnline, initiateCall } = useCommunicationHub();
  
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const tintColor = useThemeColor({}, 'tint');
  
  const isOnline = isContactOnline(contact.id) || contact.status === 'online';
  
  const handleChat = () => {
    router.push(`/messages/${contact.id}`);
  };
  
  const handleCall = () => {
    initiateCall(contact.id, 'audio');
    router.push(`/call/${contact.id}?type=audio` as Href);
  };
  
  const handleVideoCall = () => {
    initiateCall(contact.id, 'video');
    router.push(`/call/${contact.id}?type=video` as Href);
  };
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      handleChat();
    }
  };
  
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: cardBg }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactAvatar}>
          <Avatar
            avatar={contact.avatar || null}
            userId={String(contact.id)}
            name={contact.name}
            pixelSize={40}
            showBadge={false}
          />
          {isOnline && <View style={styles.compactOnlineIndicator} />}
        </View>
        <Text style={[styles.compactName, { color: textColor }]} numberOfLines={1}>
          {contact.name}
        </Text>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Avatar
          avatar={contact.avatar || null}
          userId={String(contact.id)}
          name={contact.name}
          pixelSize={56}
          showBadge={false}
        />
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      {/* Info */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {contact.name}
          </Text>
          {contact.isFavorite && (
            <Ionicons name="star" size={14} color="#0D9488" />
          )}
          {contact.unreadMessages && contact.unreadMessages > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{contact.unreadMessages}</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.role, { color: textColor + '70' }]} numberOfLines={1}>
          {contact.role || contact.department || contact.email}
        </Text>
        
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(contact.status) },
          ]} />
          <Text style={[styles.statusText, { color: getStatusColor(contact.status) }]}>
            {getStatusText(contact.status, contact.lastSeen)}
          </Text>
        </View>
      </View>
      
      {/* Actions */}
      {showActions && (
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.chatBtn]}
            onPress={handleChat}
          >
            <Ionicons name="chatbubble" size={18} color="#0D9488" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={handleCall}
          >
            <Ionicons name="call" size={18} color="#0D9488" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, styles.videoBtn]}
            onPress={handleVideoCall}
          >
            <Ionicons name="videocam" size={18} color="#0D9488" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ==================== HELPERS ====================

function getStatusColor(status: Contact['status']): string {
  switch (status) {
    case 'online': return '#0D9488';
    case 'busy': return '#000000';
    case 'away': return '#0D9488';
    default: return '#9CA3AF';
  }
}

function getStatusText(status: Contact['status'], lastSeen?: string): string {
  switch (status) {
    case 'online': return 'Đang hoạt động';
    case 'busy': return 'Đang bận';
    case 'away': return 'Đang vắng';
    default:
      if (lastSeen) {
        return `Hoạt động ${formatLastSeen(lastSeen)}`;
      }
      return 'Offline';
  }
}

function formatLastSeen(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  avatarSection: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0D9488',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoSection: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  role: {
    fontSize: 13,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtn: {
    backgroundColor: '#F0FDFA',
  },
  callBtn: {
    backgroundColor: '#D1FAE5',
  },
  videoBtn: {
    backgroundColor: '#FEF3C7',
  },
  // Compact styles
  compactCard: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
    width: 72,
  },
  compactAvatar: {
    position: 'relative',
  },
  compactOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0D9488',
    borderWidth: 2,
    borderColor: '#fff',
  },
  compactName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ContactActionCard;
