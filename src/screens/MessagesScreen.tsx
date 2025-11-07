import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  unread: boolean;
  avatar?: string;
}

const MessagesScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Nguyễn Văn A',
      content: 'Tiến độ dự án Villa Hòa Bình đang ổn chưa bạn?',
      timestamp: '10:30',
      unread: true,
    },
    {
      id: '2',
      sender: 'Trần Thị B',
      content: 'Báo giá vật liệu đã gửi qua email rồi nhé.',
      timestamp: '09:15',
      unread: false,
    },
    {
      id: '3',
      sender: 'Lê Văn C',
      content: 'Hẹn gặp ngày mai để thảo luận về thiết kế.',
      timestamp: 'Hôm qua',
      unread: true,
    },
    {
      id: '4',
      sender: 'Phạm Văn D',
      content: 'Cảm ơn bạn đã hỗ trợ dự án. Rất hài lòng!',
      timestamp: 'Hôm qua',
      unread: false,
    },
  ]);
  const [searchText, setSearchText] = useState('');

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchText.toLowerCase()) ||
    message.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity style={styles.messageItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.sender.split(' ').map(name => name[0]).join('').slice(0, 2)}
        </Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={[styles.messageText, item.unread && styles.unreadMessage]} numberOfLines={2}>
          {item.content}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tin nhắn</Text>
        <TouchableOpacity style={styles.composeButton}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tin nhắn..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
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
  composeButton: {
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
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '500',
    color: '#333',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
});

export default MessagesScreen;
