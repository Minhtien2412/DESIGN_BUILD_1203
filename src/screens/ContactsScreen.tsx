import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  company?: string;
  status: 'online' | 'offline';
}

const ContactsScreen = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      role: 'Kỹ sư xây dựng',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      company: 'Công ty TNHH ABC',
      status: 'online',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      role: 'Kiến trúc sư',
      phone: '0912345678',
      email: 'tranthib@email.com',
      company: 'Studio Kiến trúc XYZ',
      status: 'offline',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      role: 'Nhà thầu',
      phone: '0923456789',
      email: 'levanc@email.com',
      status: 'online',
    },
    {
      id: '4',
      name: 'Phạm Văn D',
      role: 'Quản lý dự án',
      phone: '0934567890',
      email: 'phamvand@email.com',
      company: 'Công ty Xây dựng DEF',
      status: 'offline',
    },
  ]);
  const [searchText, setSearchText] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCallContact = (phone: string) => {
    Alert.alert('Gọi điện', `Bạn có muốn gọi đến số ${phone}?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Gọi', onPress: () => console.log('Calling:', phone) },
    ]);
  };

  const handleMessageContact = (contact: Contact) => {
    Alert.alert('Nhắn tin', `Gửi tin nhắn cho ${contact.name}?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Nhắn tin', onPress: () => console.log('Messaging:', contact.name) },
    ]);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.split(' ').map(name => name[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: item.status === 'online' ? '#4CAF50' : '#ccc' }]} />
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactRole}>{item.role}</Text>
          {item.company && <Text style={styles.contactCompany}>{item.company}</Text>}
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCallContact(item.phone)}
        >
          <Ionicons name="call" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleMessageContact(item)}
        >
          <Ionicons name="chatbubble" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh bạ</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm liên hệ..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{contacts.filter(c => c.status === 'online').length}</Text>
          <Text style={styles.statLabel}>Đang online</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{contacts.length}</Text>
          <Text style={styles.statLabel}>Tổng liên hệ</Text>
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactCompany: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  contactPhone: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    marginLeft: 5,
  },
});

export default ContactsScreen;
