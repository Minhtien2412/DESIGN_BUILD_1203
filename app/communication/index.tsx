/**
 * Communication Hub Screen
 * Giao diện tích hợp giống Zalo: Tin nhắn, Cuộc gọi, Danh bạ, Live
 * 
 * @author AI Assistant
 * @date 22/12/2025
 */

import Avatar from '@/components/ui/avatar';
import { Container } from '@/components/ui/container';
import { useCommunicationHub } from '@/context/CommunicationHubContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Contact, ContactGroup } from '@/services/unifiedContacts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Platform,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'messages' | 'calls' | 'contacts' | 'live';

interface TabItem {
  key: TabType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

export default function CommunicationHubScreen() {
  const {
    contacts,
    favoriteContacts,
    onlineContacts,
    groups,
    unreadCounts,
    connected,
    refreshContacts,
    isContactOnline,
    initiateCall,
  } = useCommunicationHub();

  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');

  // Tabs configuration
  const tabs: TabItem[] = [
    { key: 'messages', label: 'Tin nhắn', icon: 'chatbubbles', badge: unreadCounts.messages },
    { key: 'calls', label: 'Cuộc gọi', icon: 'call', badge: unreadCounts.calls },
    { key: 'contacts', label: 'Danh bạ', icon: 'people' },
    { key: 'live', label: 'Live', icon: 'videocam' },
  ];

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    );
  }, [contacts, searchQuery]);

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const grouped: { [key: string]: Contact[] } = {};
    
    // Favorites first
    if (favoriteContacts.length > 0) {
      grouped['⭐ Yêu thích'] = favoriteContacts;
    }
    
    // Then by letter
    filteredContacts.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      // Avoid duplicates from favorites
      if (!favoriteContacts.find(f => f.id === contact.id)) {
        grouped[firstLetter].push(contact);
      }
    });
    
    return Object.entries(grouped)
      .sort(([a], [b]) => {
        if (a.startsWith('⭐')) return -1;
        if (b.startsWith('⭐')) return 1;
        return a.localeCompare(b);
      })
      .map(([title, data]) => ({ title, data }));
  }, [filteredContacts, favoriteContacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshContacts();
    setRefreshing(false);
  };

  const handleContactPress = (contact: Contact) => {
    // Open chat with this contact
    router.push(`/messages/${contact.id}`);
  };

  const handleCall = (contact: Contact, type: 'audio' | 'video') => {
    initiateCall(contact.id, type);
    // Navigate to call screen
    router.push(`/call/${contact.id}?type=${type}` as any);
  };

  const handleOpenLive = () => {
    router.push('/(tabs)/live');
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.key;
    
    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tab,
          isActive && { borderBottomColor: tintColor, borderBottomWidth: 2 },
        ]}
        onPress={() => setActiveTab(tab.key)}
      >
        <View style={styles.tabContent}>
          <Ionicons
            name={tab.icon}
            size={22}
            color={isActive ? tintColor : textColor + '60'}
          />
          <Text style={[
            styles.tabLabel,
            { color: isActive ? tintColor : textColor + '60' },
          ]}>
            {tab.label}
          </Text>
          {tab.badge && tab.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContactItem = ({ item: contact }: { item: Contact }) => {
    const online = isContactOnline(contact.id) || contact.status === 'online';
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, { backgroundColor: cardBg }]}
        onPress={() => handleContactPress(contact)}
        activeOpacity={0.7}
      >
        {/* Avatar with online indicator */}
        <View style={styles.avatarContainer}>
          <Avatar
            avatar={contact.avatar || null}
            userId={String(contact.id)}
            name={contact.name}
            pixelSize={50}
            showBadge={false}
          />
          {online && <View style={styles.onlineIndicator} />}
        </View>

        {/* Contact info */}
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={[styles.contactName, { color: textColor }]} numberOfLines={1}>
              {contact.name}
              {contact.isFavorite && ' ⭐'}
            </Text>
            {contact.unreadMessages && contact.unreadMessages > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{contact.unreadMessages}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.contactRole, { color: textColor + '70' }]} numberOfLines={1}>
            {contact.role || contact.email}
          </Text>
          <Text style={[styles.contactStatus, { color: online ? '#10B981' : textColor + '50' }]}>
            {online ? '● Đang hoạt động' : contact.lastSeen ? `Hoạt động ${formatLastSeen(contact.lastSeen)}` : 'Offline'}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#DBEAFE' }]}
            onPress={() => handleContactPress(contact)}
          >
            <Ionicons name="chatbubble" size={18} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
            onPress={() => handleCall(contact, 'audio')}
          >
            <Ionicons name="call" size={18} color="#10B981" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FEF3C7' }]}
            onPress={() => handleCall(contact, 'video')}
          >
            <Ionicons name="videocam" size={18} color="#F59E0B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupItem = ({ item: group }: { item: ContactGroup }) => (
    <TouchableOpacity
      style={[styles.groupItem, { backgroundColor: cardBg }]}
      onPress={() => router.push(`/messages/group/${group.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.groupAvatar}>
        <Ionicons name="people" size={24} color={tintColor} />
      </View>
      <View style={styles.groupInfo}>
        <Text style={[styles.groupName, { color: textColor }]}>{group.name}</Text>
        <Text style={[styles.groupMembers, { color: textColor + '70' }]}>
          {group.members.length} thành viên
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={textColor + '50'} />
    </TouchableOpacity>
  );

  const renderOnlineNow = () => (
    <View style={styles.onlineSection}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        🟢 Đang hoạt động ({onlineContacts.length})
      </Text>
      <FlatList
        horizontal
        data={onlineContacts}
        keyExtractor={item => String(item.id)}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.onlineItem}
            onPress={() => handleContactPress(item)}
          >
            <View style={styles.onlineAvatarContainer}>
              <Avatar
                avatar={item.avatar || null}
                userId={String(item.id)}
                name={item.name}
                pixelSize={56}
                showBadge={false}
              />
              <View style={styles.onlineIndicatorSmall} />
            </View>
            <Text style={[styles.onlineName, { color: textColor }]} numberOfLines={1}>
              {item.name.split(' ').pop()}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.onlineList}
      />
    </View>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor }]}>
      <Text style={[styles.sectionHeaderText, { color: tintColor }]}>
        {section.title}
      </Text>
    </View>
  );

  // ==================== TAB CONTENT ====================

  const renderMessagesTab = () => (
    <View style={styles.tabContainer}>
      {/* Online now section */}
      {onlineContacts.length > 0 && renderOnlineNow()}
      
      {/* Recent conversations - reuse contact list as placeholder */}
      <FlatList
        data={contacts.filter(c => c.unreadMessages || c.lastMessageAt)}
        keyExtractor={item => String(item.id)}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={textColor + '30'} />
            <Text style={[styles.emptyText, { color: textColor + '50' }]}>
              Chưa có tin nhắn nào
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderCallsTab = () => (
    <View style={styles.tabContainer}>
      <FlatList
        data={contacts.filter(c => c.missedCalls || c.lastCallAt)}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.callItem, { backgroundColor: cardBg }]}
            onPress={() => handleCall(item, 'audio')}
          >
            <Avatar
              avatar={item.avatar || null}
              userId={String(item.id)}
              name={item.name}
              pixelSize={50}
              showBadge={false}
            />
            <View style={styles.callInfo}>
              <Text style={[styles.callName, { color: textColor }]}>{item.name}</Text>
              <View style={styles.callMeta}>
                <Ionicons
                  name={item.missedCalls ? 'arrow-down-outline' : 'arrow-up-outline'}
                  size={14}
                  color={item.missedCalls ? '#EF4444' : '#10B981'}
                />
                <Text style={[styles.callTime, { color: textColor + '60' }]}>
                  {item.missedCalls ? 'Cuộc gọi nhỡ' : 'Đã gọi'} • {formatLastSeen(item.lastCallAt || new Date().toISOString())}
                </Text>
              </View>
            </View>
            <View style={styles.callActions}>
              <TouchableOpacity onPress={() => handleCall(item, 'audio')}>
                <Ionicons name="call" size={24} color={tintColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleCall(item, 'video')} style={{ marginLeft: 16 }}>
                <Ionicons name="videocam" size={24} color={tintColor} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="call-outline" size={48} color={textColor + '30'} />
            <Text style={[styles.emptyText, { color: textColor + '50' }]}>
              Chưa có cuộc gọi nào
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderContactsTab = () => (
    <View style={styles.tabContainer}>
      {/* Groups section */}
      {groups.length > 0 && (
        <View style={styles.groupsSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            👥 Nhóm ({groups.length})
          </Text>
          <FlatList
            horizontal
            data={groups}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.groupChip, { backgroundColor: cardBg }]}
                onPress={() => router.push(`/messages/group/${item.id}`)}
              >
                <Ionicons name="people" size={16} color={tintColor} />
                <Text style={[styles.groupChipText, { color: textColor }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.groupsList}
          />
        </View>
      )}
      
      {/* Contacts list */}
      <SectionList
        sections={groupedContacts}
        keyExtractor={item => String(item.id)}
        renderItem={renderContactItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={textColor + '30'} />
            <Text style={[styles.emptyText, { color: textColor + '50' }]}>
              Không tìm thấy liên hệ
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderLiveTab = () => (
    <View style={styles.tabContainer}>
      <View style={styles.liveContent}>
        <Ionicons name="videocam" size={64} color={tintColor} />
        <Text style={[styles.liveTitle, { color: textColor }]}>
          Phát trực tiếp
        </Text>
        <Text style={[styles.liveSubtitle, { color: textColor + '70' }]}>
          Xem hoặc phát live stream công trình
        </Text>
        <TouchableOpacity
          style={[styles.liveButton, { backgroundColor: tintColor }]}
          onPress={handleOpenLive}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.liveButtonText}>Xem Live</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'messages':
        return renderMessagesTab();
      case 'calls':
        return renderCallsTab();
      case 'contacts':
        return renderContactsTab();
      case 'live':
        return renderLiveTab();
      default:
        return null;
    }
  };

  // ==================== MAIN RENDER ====================

  return (
    <Container scroll={false} style={{ backgroundColor, flex: 1 }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            💬 Liên lạc
          </Text>
          <View style={styles.headerActions}>
            <View style={[
              styles.connectionStatus,
              { backgroundColor: connected ? '#D1FAE5' : '#FEE2E2' },
            ]}>
              <View style={[
                styles.connectionDot,
                { backgroundColor: connected ? '#10B981' : '#EF4444' },
              ]} />
              <Text style={[
                styles.connectionText,
                { color: connected ? '#10B981' : '#EF4444' },
              ]}>
                {connected ? 'Online' : 'Offline'}
              </Text>
            </View>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="add-circle" size={28} color={tintColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
          <Ionicons name="search" size={20} color={textColor + '50'} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm kiếm liên hệ..."
            placeholderTextColor={textColor + '50'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={textColor + '50'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor, borderBottomColor: textColor + '10' }]}>
        {tabs.map(renderTab)}
      </View>

      {/* Tab content */}
      {renderTabContent()}
    </Container>
  );
}

// ==================== HELPERS ====================

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
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tabContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  // Contact item
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  contactRole: {
    fontSize: 13,
    marginTop: 2,
  },
  contactStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
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
  // Section header
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  // Online section
  onlineSection: {
    marginBottom: 8,
  },
  onlineList: {
    paddingHorizontal: 16,
  },
  onlineItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  onlineAvatarContainer: {
    position: 'relative',
  },
  onlineIndicatorSmall: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineName: {
    fontSize: 12,
    marginTop: 4,
    maxWidth: 60,
    textAlign: 'center',
  },
  // Groups
  groupsSection: {
    marginBottom: 8,
  },
  groupsList: {
    paddingHorizontal: 16,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  groupChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupMembers: {
    fontSize: 13,
    marginTop: 2,
  },
  // Call item
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  callInfo: {
    flex: 1,
    marginLeft: 12,
  },
  callName: {
    fontSize: 16,
    fontWeight: '600',
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  callTime: {
    fontSize: 13,
  },
  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  // Live tab
  liveContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  liveTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  liveSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  liveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
