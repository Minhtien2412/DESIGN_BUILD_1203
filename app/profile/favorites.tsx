import { Container } from '@/components/ui/container';
import { useFavorites } from '@/context/FavoritesContext';
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

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, removeFavorite, clearFavorites, totalFavorites } = useFavorites();
  const [filter, setFilter] = useState<'all' | 'product' | 'service' | 'worker'>('all');

  const filteredFavorites = favorites.filter(
    item => filter === 'all' || item.type === filter
  );

  const handleClearAll = () => {
    Alert.alert(
      'Xóa tất cả yêu thích',
      'Bạn có chắc muốn xóa tất cả mục yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: clearFavorites,
        },
      ]
    );
  };

  const handleItemPress = (item: any) => {
    if (item.type === 'product') {
      router.push(`/product/${item.id}` as Href);
    }
  };

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
        <View style={styles.meta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.type === 'product' ? 'Sản phẩm' : item.type === 'service' ? 'Dịch vụ' : 'Thợ'}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.addedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFavorite(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="heart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có mục yêu thích</Text>
      <Text style={styles.emptySubtext}>
        Nhấn vào biểu tượng trái tim để lưu sản phẩm yêu thích
      </Text>
    </View>
  );

  return (
    <Container scroll={false} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Yêu thích</Text>
        {totalFavorites > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearBtn}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      {totalFavorites > 0 && (
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Tất cả ({totalFavorites})
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
        data={filteredFavorites}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
    color: '#FF3B30',
    fontWeight: '600',
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#666',
  },
  date: {
    fontSize: 11,
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
