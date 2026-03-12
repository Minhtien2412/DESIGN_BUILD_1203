/**
 * Contacts List Component - Teams Style
 * Alphabetically grouped contacts with quick actions
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Image,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar: string | null;
  role?: string;
  company?: string;
  isOnline?: boolean;
  isFavorite?: boolean;
}

interface ContactsListProps {
  contacts: Contact[];
  onContactPress: (contactId: number) => void;
  onStartChat?: (contactId: number) => void;
  onStartCall?: (contactId: number, type: 'video' | 'audio') => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ContactsList({
  contacts,
  onContactPress,
  onStartChat,
  onStartCall,
  onRefresh,
  refreshing = false,
}: ContactsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.role?.toLowerCase().includes(query)
      );
    }
    if (showFavoritesOnly) {
      return contact.isFavorite;
    }
    return true;
  });

  // Group by first letter
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const firstLetter = contact.name[0].toUpperCase();
    const isVietnamese = /[À-ỹ]/.test(firstLetter);
    const key = isVietnamese ? firstLetter : (firstLetter.match(/[A-Z]/) ? firstLetter : '#');
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  // Sort sections
  const sections = Object.keys(groupedContacts)
    .sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'vi');
    })
    .map(letter => ({
      title: letter,
      data: groupedContacts[letter].sort((a, b) => 
        a.name.localeCompare(b.name, 'vi')
      ),
    }));

  // Favorites section
  const favorites = filteredContacts.filter(c => c.isFavorite);

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => onContactPress(item.id)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
        {item.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="star" size={10} color="#FFAA00" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.role && (
          <Text style={styles.contactRole} numberOfLines={1}>
            {item.role}
            {item.company && ` • ${item.company}`}
          </Text>
        )}
        {!item.role && item.email && (
          <Text style={styles.contactEmail} numberOfLines={1}>
            {item.email}
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        {onStartChat && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStartChat(item.id)}
          >
            <Ionicons name="chatbubble" size={18} color="#6264A7" />
          </TouchableOpacity>
        )}
        {onStartCall && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStartCall(item.id, 'video')}
          >
            <Ionicons name="videocam" size={20} color="#6264A7" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderFavoritesHeader = () => {
    if (favorites.length === 0) return null;
    return (
      <View style={styles.favoritesSection}>
        <Text style={styles.favoritesTitle}>Yêu thích</Text>
        <View style={styles.favoritesList}>
          {favorites.slice(0, 5).map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.favoriteItem}
              onPress={() => onContactPress(contact.id)}
            >
              <View style={styles.favoriteAvatarContainer}>
                {contact.avatar ? (
                  <Image 
                    source={{ uri: contact.avatar }} 
                    style={styles.favoriteAvatar} 
                  />
                ) : (
                  <View style={[styles.favoriteAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.favoriteAvatarText}>
                      {contact.name.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                {contact.isOnline && <View style={styles.favoriteOnlineDot} />}
              </View>
              <Text style={styles.favoriteName} numberOfLines={1}>
                {contact.name.split(' ').slice(-1)[0]}
              </Text>
            </TouchableOpacity>
          ))}
          {favorites.length > 5 && (
            <TouchableOpacity
              style={styles.favoriteItem}
              onPress={() => setShowFavoritesOnly(true)}
            >
              <View style={[styles.favoriteAvatar, styles.moreButton]}>
                <Ionicons name="add" size={20} color="#6264A7" />
              </View>
              <Text style={styles.favoriteName}>
                +{favorites.length - 5}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Ionicons 
              name={showFavoritesOnly ? "star" : "star-outline"}
              size={20} 
              color={showFavoritesOnly ? "#FFAA00" : "#424242"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="person-add-outline" size={20} color="#424242" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8A8886" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm danh bạ"
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

      {/* Contact Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredContacts.length} liên hệ
        </Text>
      </View>

      {/* Contacts List */}
      <SectionList
        sections={sections}
        renderItem={renderContactItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={!showFavoritesOnly && !searchQuery ? renderFavoritesHeader : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#E1DFDD" />
            <Text style={styles.emptyText}>Chưa có liên hệ</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
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
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
    color: '#8A8886',
    fontWeight: '500',
  },
  favoritesSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1DFDD',
  },
  favoritesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#242424',
    marginBottom: 12,
  },
  favoritesList: {
    flexDirection: 'row',
    gap: 16,
  },
  favoriteItem: {
    alignItems: 'center',
    width: 60,
  },
  favoriteAvatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  favoriteAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  favoriteAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  favoriteOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#92C353',
    borderWidth: 2,
    borderColor: '#fff',
  },
  favoriteName: {
    fontSize: 12,
    color: '#242424',
    textAlign: 'center',
  },
  moreButton: {
    backgroundColor: '#E8E8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E1DFDD',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6264A7',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
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
    backgroundColor: '#6264A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  favoriteBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#242424',
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 13,
    color: '#616161',
  },
  contactEmail: {
    fontSize: 13,
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
    backgroundColor: '#E8E8F8',
    justifyContent: 'center',
    alignItems: 'center',
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
