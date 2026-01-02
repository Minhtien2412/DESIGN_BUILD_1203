/**
 * Communications Sidebar Navigation
 * Teams-style sidebar with Chat, Calls, Contacts, Activity tabs
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavItem = 'chat' | 'calls' | 'contacts' | 'activity';

interface SidebarNavProps {
  active: NavItem;
  onSelect: (item: NavItem) => void;
  unreadCount?: number;
  missedCallsCount?: number;
}

const NAV_ITEMS: Array<{
  id: NavItem;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}> = [
  { id: 'chat', icon: 'chatbubbles', label: 'Chat' },
  { id: 'calls', icon: 'call', label: 'Cuộc gọi' },
  { id: 'contacts', icon: 'people', label: 'Danh bạ' },
  { id: 'activity', icon: 'notifications', label: 'Hoạt động' },
];

export function SidebarNav({ 
  active, 
  onSelect, 
  unreadCount = 0,
  missedCallsCount = 0 
}: SidebarNavProps) {
  const getBadgeCount = (id: NavItem) => {
    if (id === 'chat') return unreadCount;
    if (id === 'calls') return missedCallsCount;
    return 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="apps" size={24} color="#6264A7" />
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const badgeCount = getBadgeCount(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onSelect(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isActive ? '#6264A7' : '#616161'}
                />
                {badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="settings-outline" size={24} color="#616161" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    backgroundColor: '#F3F2F1',
    borderRightWidth: 1,
    borderRightColor: '#E1DFDD',
  },
  header: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E1DFDD',
  },
  nav: {
    flex: 1,
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#E8E8F8',
  },
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C4314B',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#F3F2F1',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#616161',
    textAlign: 'center',
  },
  navTextActive: {
    color: '#6264A7',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E1DFDD',
  },
  footerButton: {
    width: 56,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
