/**
 * New Conversation Screen - Enhanced
 * Tạo cuộc hội thoại mới với contact
 * - Tìm kiếm theo tên/email/vai trò
 * - Phân loại: Tất cả, Nhân viên, Khách hàng, CSKH
 * - Liên hệ nhanh với bộ phận CSKH
 */

import Avatar from '@/components/ui/avatar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#0068FF',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E5E5',
  online: '#0066CC',
  support: '#0066CC',
  staff: '#666666',
  customer: '#0066CC',
};

// Filter tabs
type ContactFilter = 'all' | 'staff' | 'customer' | 'support';

const FILTER_TABS: { key: ContactFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'Tất cả', icon: 'people' },
  { key: 'staff', label: 'Nhân viên', icon: 'briefcase' },
  { key: 'customer', label: 'Khách hàng', icon: 'person' },
  { key: 'support', label: 'CSKH', icon: 'headset' },
];

// Customer Support Team
const SUPPORT_TEAM = [
  { 
    id: 100, 
    name: 'Hỗ trợ kỹ thuật', 
    email: 'support@thietkeresort.vn', 
    role: 'CSKH - Kỹ thuật', 
    avatar: '', 
    online: true,
    isSupport: true,
    description: 'Hỗ trợ vấn đề kỹ thuật, sử dụng app',
  },
  { 
    id: 101, 
    name: 'Tư vấn thiết kế', 
    email: 'design@thietkeresort.vn', 
    role: 'CSKH - Thiết kế', 
    avatar: '', 
    online: true,
    isSupport: true,
    description: 'Tư vấn về thiết kế, báo giá',
  },
  { 
    id: 102, 
    name: 'Chăm sóc khách hàng', 
    email: 'cskh@thietkeresort.vn', 
    role: 'CSKH - Tổng đài', 
    avatar: '', 
    online: true,
    isSupport: true,
    description: 'Hỗ trợ chung, khiếu nại',
  },
  { 
    id: 103, 
    name: 'Hotline 24/7', 
    email: 'hotline@thietkeresort.vn', 
    role: 'CSKH - Khẩn cấp', 
    avatar: '', 
    online: true,
    isSupport: true,
    description: 'Hỗ trợ khẩn cấp, ngoài giờ hành chính',
  },
];

// Mock contacts - Staff & Customers
const STAFF_CONTACTS = [
  { id: 2, name: 'Nguyễn Văn Kiến', email: 'kien@thietkeresort.vn', role: 'Kiến trúc sư', avatar: 'https://i.pravatar.cc/150?u=kien', online: true, isSupport: false },
  { id: 4, name: 'Lê Thị Admin', email: 'admin@thietkeresort.vn', role: 'Quản trị viên', avatar: 'https://i.pravatar.cc/150?u=admin', online: false, isSupport: false },
  { id: 5, name: 'Phạm Đức Long', email: 'long@thietkeresort.vn', role: 'Kỹ sư', avatar: 'https://i.pravatar.cc/150?u=long', online: true, isSupport: false },
  { id: 7, name: 'Đặng Minh Tú', email: 'tu@thietkeresort.vn', role: 'Designer', avatar: 'https://i.pravatar.cc/150?u=tu', online: true, isSupport: false },
  { id: 8, name: 'Ngô Thị Hương', email: 'huong@thietkeresort.vn', role: 'Kế toán', avatar: 'https://i.pravatar.cc/150?u=huong', online: false, isSupport: false },
  { id: 9, name: 'Trần Văn Bình', email: 'binh@thietkeresort.vn', role: 'PM', avatar: 'https://i.pravatar.cc/150?u=binh', online: true, isSupport: false },
  { id: 10, name: 'Lý Minh Châu', email: 'chau@thietkeresort.vn', role: 'Designer', avatar: 'https://i.pravatar.cc/150?u=chau', online: false, isSupport: false },
];

const CUSTOMER_CONTACTS = [
  { id: 3, name: 'Trần Minh Hoàng', email: 'hoang@client.com', role: 'Khách hàng', avatar: 'https://i.pravatar.cc/150?u=hoang', online: false, isSupport: false },
  { id: 6, name: 'Vũ Thanh Hà', email: 'ha@client.com', role: 'Khách hàng', avatar: 'https://i.pravatar.cc/150?u=ha', online: false, isSupport: false },
  { id: 11, name: 'Nguyễn Thị Lan', email: 'lan@client.com', role: 'Khách hàng VIP', avatar: 'https://i.pravatar.cc/150?u=lan', online: true, isSupport: false },
  { id: 12, name: 'Phan Văn Đức', email: 'duc@client.com', role: 'Khách hàng', avatar: 'https://i.pravatar.cc/150?u=duc', online: false, isSupport: false },
];

interface Contact {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  online: boolean;
  isSupport: boolean;
  description?: string;
}

// Support Contact Item - Special UI
function SupportContactItem({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.supportItem} onPress={onPress}>
      <View style={styles.supportIconWrapper}>
        <Ionicons name="headset" size={24} color={COLORS.support} />
      </View>
      
      <View style={styles.supportInfo}>
        <Text style={styles.supportName}>{contact.name}</Text>
        <Text style={styles.supportDesc}>{contact.description}</Text>
      </View>
      
      <View style={styles.supportActions}>
        {contact.online && (
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>Online</Text>
          </View>
        )}
        <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

// Regular Contact Item
function ContactItem({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  const isStaff = contact.email.includes('@thietkeresort.vn');
  
  return (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <View style={styles.avatarWrapper}>
        <Avatar
          avatar={contact.avatar}
          userId={String(contact.id)}
          name={contact.name}
          pixelSize={48}
        />
        {contact.online && <View style={styles.onlineDot} />}
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.contactNameRow}>
          <Text style={styles.contactName}>{contact.name}</Text>
          {isStaff && (
            <View style={styles.staffBadge}>
              <Ionicons name="briefcase" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.contactRole}>{contact.role}</Text>
        <Text style={styles.contactEmail}>{contact.email}</Text>
      </View>
      
      <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
    </TouchableOpacity>
  );
}

export default function NewConversationScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContactFilter>('all');
  
  // All contacts combined
  const allContacts = useMemo(() => [
    ...SUPPORT_TEAM,
    ...STAFF_CONTACTS,
    ...CUSTOMER_CONTACTS,
  ], []);
  
  // Filter contacts
  const filteredContacts = useMemo(() => {
    let result: Contact[] = [];
    
    // Filter by tab
    switch (activeFilter) {
      case 'support':
        result = SUPPORT_TEAM;
        break;
      case 'staff':
        result = STAFF_CONTACTS;
        break;
      case 'customer':
        result = CUSTOMER_CONTACTS;
        break;
      default:
        result = allContacts;
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.role.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [allContacts, activeFilter, searchQuery]);
  
  // Handle contact press - create conversation
  const handleContactPress = useCallback((contact: Contact) => {
    // For support, we can create a special conversation
    if (contact.isSupport) {
      router.push(`/messages/chat/support_${contact.id}`);
    } else {
      // Find existing conversation ID from mock data, or use user ID
      const convId = contact.id === 2 ? 'conv_1' : 
                     contact.id === 3 ? 'conv_2' :
                     contact.id === 4 ? 'conv_3' :
                     contact.id === 5 ? 'conv_4' :
                     contact.id === 6 ? 'conv_5' :
                     `conv_user_${contact.id}`;
      router.push(`/messages/chat/${convId}`);
    }
  }, []);

  // Handle quick call to support
  const handleCallSupport = useCallback(() => {
    console.log('Calling support hotline');
  }, []);

  // Render support section
  const renderSupportSection = () => {
    if (activeFilter !== 'all' && activeFilter !== 'support') return null;
    
    return (
      <View style={styles.supportSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="headset" size={18} color={COLORS.support} />
          <Text style={styles.sectionTitleSupport}>HỖ TRỢ KHÁCH HÀNG</Text>
          <TouchableOpacity style={styles.callHotline} onPress={handleCallSupport}>
            <Ionicons name="call" size={16} color={COLORS.primary} />
            <Text style={styles.callHotlineText}>Gọi hotline</Text>
          </TouchableOpacity>
        </View>
        
        {activeFilter === 'all' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.supportScroll}>
            {SUPPORT_TEAM.map(contact => (
              <TouchableOpacity 
                key={contact.id} 
                style={styles.supportCard}
                onPress={() => handleContactPress(contact)}
              >
                <View style={styles.supportCardIcon}>
                  <Ionicons name="headset" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.supportCardName} numberOfLines={1}>{contact.name}</Text>
                {contact.online && <View style={styles.supportCardDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          SUPPORT_TEAM.map(contact => (
            <SupportContactItem
              key={contact.id}
              contact={contact}
              onPress={() => handleContactPress(contact)}
            />
          ))
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn mới</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email, vai trò..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                activeFilter === tab.key && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeFilter === tab.key ? '#FFFFFF' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.filterTabText,
                activeFilter === tab.key && styles.filterTabTextActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="people" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Tạo nhóm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.online }]}>
            <Ionicons name="person-add" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Thêm liên hệ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: COLORS.support }]}>
            <Ionicons name="scan" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Quét QR</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      {renderSupportSection()}

      {/* Contacts Section Header */}
      {(activeFilter === 'all' || activeFilter === 'staff' || activeFilter === 'customer') && filteredContacts.filter(c => !c.isSupport).length > 0 && (
        <View style={styles.sectionHeader}>
          <Ionicons 
            name={activeFilter === 'customer' ? 'person' : 'people'} 
            size={18} 
            color={COLORS.textSecondary} 
          />
          <Text style={styles.sectionTitle}>
            {activeFilter === 'staff' ? 'NHÂN VIÊN' : 
             activeFilter === 'customer' ? 'KHÁCH HÀNG' : 
             'LIÊN HỆ GẦN ĐÂY'}
          </Text>
          <Text style={styles.sectionCount}>
            ({filteredContacts.filter(c => !c.isSupport).length})
          </Text>
        </View>
      )}

      {/* Contacts List */}
      <FlatList
        data={activeFilter === 'support' ? [] : filteredContacts.filter(c => !c.isSupport)}
        renderItem={({ item }) => (
          <ContactItem contact={item} onPress={() => handleContactPress(item)} />
        )}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeFilter === 'support' ? 'headset' : 'person-outline'} 
              size={48} 
              color={COLORS.textTertiary} 
            />
            <Text style={styles.emptyText}>
              {activeFilter === 'support' 
                ? 'Xem danh sách CSKH ở trên' 
                : searchQuery 
                  ? 'Không tìm thấy liên hệ' 
                  : 'Chưa có liên hệ nào'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  
  // Filter Tabs
  filterTabs: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickAction: {
    alignItems: 'center',
    marginRight: 24,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  
  // Support Section
  supportSection: {
    backgroundColor: '#FEF7ED',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  supportScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  supportCard: {
    alignItems: 'center',
    width: 80,
    marginRight: 12,
  },
  supportCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.support,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  supportCardName: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  supportCardDot: {
    position: 'absolute',
    top: 2,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: '#FEF7ED',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEF7ED',
  },
  supportIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  supportDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  supportActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    backgroundColor: COLORS.online,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 12,
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callHotline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
  },
  callHotlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 4,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  sectionTitleSupport: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.support,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  
  // Contact Item
  listContent: {
    paddingBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 76,
  },
  contactItem: {
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
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  staffBadge: {
    backgroundColor: COLORS.staff,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  contactRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  contactEmail: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});
