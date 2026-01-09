import { Container } from '@/components/ui/container';
import { useViewHistory } from '@/context/ViewHistoryContext';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ViewHistoryScreen() {
  const router = useRouter();
  const { history, clearHistory, removeFromHistory } = useViewHistory();
  const [filter, setFilter] = useState<'all' | 'product' | 'service' | 'worker'>('all');

  const filteredHistory = history.filter(
    item => filter === 'all' || item.type === filter
  );

  const handleClearAll = () => {
    Alert.alert(
      'Xóa lịch sử',
      'Bạn có chắc muốn xóa toàn bộ lịch sử xem?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const handleItemPress = (item: any) => {
    if (item.type === 'product') {
      router.push(`/product/${item.id}` as Href);
    }
  };

  const groupByDate = (items: any[]) => {
    const groups: { [key: string]: any[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    items.forEach(item => {
      const viewDate = new Date(item.viewedAt);
      viewDate.setHours(0, 0, 0, 0);

      let key: string;
      if (viewDate.getTime() === today.getTime()) {
        key = 'Hôm nay';
      } else if (viewDate.getTime() === yesterday.getTime()) {
        key = 'Hôm qua';
      } else {
        key = viewDate.toLocaleDateString('vi-VN');
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  };

  const groupedHistory = groupByDate(filteredHistory);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} ₫</Text>
        <Text style={styles.time}>
          {new Date(item.viewedAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromHistory(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={24} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSection = ({ item }: any) => (
    <View>
      <Text style={styles.dateHeader}>{item.date}</Text>
      {item.items.map((historyItem: any) => (
        <View key={historyItem.id}>{renderItem({ item: historyItem })}</View>
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="time-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có lịch sử xem</Text>
      <Text style={styles.emptySubtext}>
        Các sản phẩm bạn xem sẽ hiển thị ở đây
      </Text>
    </View>
  );

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử xem</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearBtn}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      {history.length > 0 && (
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Tất cả ({history.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'product' && styles.filterTabActive]}
            onPress={() => setFilter('product')}
          >
            <Text style={[styles.filterText, filter === 'product' && styles.filterTextActive]}>
              Sản phẩm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'service' && styles.filterTabActive]}
            onPress={() => setFilter('service')}
          >
            <Text style={[styles.filterText, filter === 'service' && styles.filterTextActive]}>
              Dịch vụ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'worker' && styles.filterTabActive]}
            onPress={() => setFilter('worker')}
          >
            <Text style={[styles.filterText, filter === 'worker' && styles.filterTextActive]}>
              Thợ
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={groupedHistory}
        renderItem={renderSection}
        keyExtractor={item => item.date}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  clearBtn: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterTabActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#0066CC',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  removeBtn: {
    padding: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
