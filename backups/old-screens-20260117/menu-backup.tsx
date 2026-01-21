/**
 * Menu/Utilities screen (5th tab)
 * Quick access to all app utilities
 */
import { SafeScrollView } from '@/components/ui/safe-area';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const MENU_ITEMS: { id: number; name: string; icon: string; route: MenuRoute }[] = [
  { id: 1, name: 'Thiết kế nhà', icon: 'home-outline', route: '/utilities/design' },
  { id: 2, name: 'Thiết kế nội thất', icon: 'bed-outline', route: '/utilities/interior' },
  { id: 3, name: 'Xây dựng', icon: 'construct-outline', route: '/utilities/construction' },
  { id: 4, name: 'Hoàn thiện', icon: 'color-palette-outline', route: '/utilities/finishing' },
  { id: 5, name: 'Thiết bị', icon: 'hardware-chip-outline', route: '/utilities/equipment' },
  { id: 6, name: 'Thư viện', icon: 'library-outline', route: '/utilities/library' },
  { id: 7, name: 'Tin nhắn', icon: 'chatbubbles-outline', route: '/messages' },
  { id: 8, name: 'Cuộc gọi', icon: 'call-outline', route: '/call/history' },
  { id: 9, name: 'Cài đặt', icon: 'settings-outline', route: '/profile/settings' },
];

export default function MenuScreen() {
  const handlePress = (route: MenuRoute) => {
    router.push(route);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
                <Ionicons name={item.icon as any} size={28} color="#0066CC" />
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#808080',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    paddingTop: 16,
  },
  card: {
    width: CARD_SIZE,
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 32,
    height: 32,
  },
  cardLabel: {
    fontSize: 11,
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '500',
  },
});
