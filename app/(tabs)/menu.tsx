/**
 * Menu/Utilities screen (5th tab)
 * Quick access to all app utilities
 */
import { SafeScrollView } from '@/components/ui/safe-area';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_W - 48) / 3;

type MenuRoute =
  | '/utilities/design'
  | '/utilities/interior'
  | '/utilities/construction'
  | '/utilities/finishing'
  | '/utilities/equipment'
  | '/utilities/library'
  | '/messages'
  | '/call/history'
  | '/profile/settings';

const MENU_ITEMS: { id: number; name: string; icon?: any; iconType?: 'ionicon'; route: MenuRoute }[] = [
  { id: 1, name: 'Thiết kế nhà', icon: require('@/assets/images/icon-dich-vu/thiet-ke-nha.png'), route: '/utilities/design' },
  { id: 2, name: 'Thiết kế nội thất', icon: require('@/assets/images/icon-dich-vu/thiet-ke-noi-that.png'), route: '/utilities/interior' },
  { id: 3, name: 'Xây dựng', icon: require('@/assets/images/tien-ich-xay-dung/ep-coc.png'), route: '/utilities/construction' },
  { id: 4, name: 'Hoàn thiện', icon: require('@/assets/images/tien-ich-hoan-thien/tho-lat-gach.png'), route: '/utilities/finishing' },
  { id: 5, name: 'Thiết bị', icon: require('@/assets/images/tien-ich-mua-sam-trang-thiet-bi/thiet-bi-bep.png'), route: '/utilities/equipment' },
  { id: 6, name: 'Thư viện', icon: require('@/assets/images/thu-vien/van-phong.png'), route: '/utilities/library' },
  { id: 7, name: 'Tin nhắn', icon: 'chatbubbles', route: '/messages', iconType: 'ionicon' },
  { id: 8, name: 'Cuộc gọi', icon: 'call', route: '/call/history', iconType: 'ionicon' },
  { id: 9, name: 'Cài đặt', icon: 'settings', route: '/profile/settings', iconType: 'ionicon' },
];

export default function MenuScreen() {
  const handlePress = (route: MenuRoute) => {
    router.push(route);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeScrollView style={styles.container} hasTabBar>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tiện ích</Text>
          <Text style={styles.headerSubtitle}>Khám phá các dịch vụ của chúng tôi</Text>
        </View>

        {/* Menu Grid */}
        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handlePress(item.route)}
            >
              <View style={styles.iconWrapper}>
                {item.iconType === 'ionicon' ? (
                  <Ionicons name={item.icon as any} size={32} color="#90b44c" />
                ) : (
                  <Image source={item.icon} style={styles.icon} resizeMode="contain" />
                )}
              </View>
              <Text style={styles.cardLabel} numberOfLines={2}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_SIZE,
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 48,
    height: 48,
  },
  cardLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});
