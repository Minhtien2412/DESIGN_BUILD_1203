import { CallHistoryList } from '@/components/call';
import { ContactActionCard } from '@/components/communication';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useCommunicationHub } from '@/context/CommunicationHubContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Contact } from '@/services/unifiedContacts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ContactsScreen() {
  const { user } = useAuth();
  const { 
    contacts, 
    favoriteContacts, 
    onlineContacts, 
    groups,
    refreshContacts,
    connected,
  } = useCommunicationHub();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const backgroundColor = useThemeColor({}, 'background');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshContacts();
    setRefreshing(false);
  };

  const filteredContacts = searchQuery.trim()
    ? contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
      )
    : contacts;

  const handleOpenCommunicationHub = () => {
    router.push('/communication');
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <ContactActionCard contact={item} showActions={true} />
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: textColor }]}>
              📞 Danh bạ & Liên hệ
            </Text>
            <Text style={[styles.subtitle, { color: textColor + '80' }]}>
              Gọi video/audio trực tiếp với đồng nghiệp
            </Text>
          </View>
          {/* Connection status */}
          <View style={[
            styles.connectionBadge,
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

        {/* Open Full Communication Hub */}
        <TouchableOpacity
          style={[styles.hubButton, { backgroundColor: tintColor }]}
          onPress={handleOpenCommunicationHub}
        >
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.hubButtonText}>Mở trung tâm liên lạc (Tin nhắn, Cuộc gọi, Live)</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Online Now */}
        {onlineContacts.length > 0 && (
          <Section title={`🟢 Đang hoạt động (${onlineContacts.length})`}>
            <FlatList
              horizontal
              data={onlineContacts}
              keyExtractor={item => String(item.id)}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ContactActionCard contact={item} compact />
              )}
            />
          </Section>
        )}

        {/* Favorites */}
        {favoriteContacts.length > 0 && (
          <Section title="⭐ Yêu thích">
            {favoriteContacts.map(contact => (
              <ContactActionCard key={contact.id} contact={contact} showActions />
            ))}
          </Section>
        )}

        {/* All Contacts */}
        <Section title={`👥 Tất cả liên hệ (${filteredContacts.length})`}>
          {filteredContacts.map(contact => (
            <ContactActionCard key={contact.id} contact={contact} showActions />
          ))}
        </Section>

        {/* Call History */}
        <CallHistoryList />

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: tintColor + '10' }]}>
          <Ionicons name="information-circle" size={20} color={tintColor} />
          <Text style={[styles.infoText, { color: textColor + '80' }]}>
            Nhấn vào biểu tượng video/audio để bắt đầu cuộc gọi. Đảm bảo bạn đã 
            cấp quyền truy cập camera và microphone.
          </Text>
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  connectionBadge: {
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  hubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  hubButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
