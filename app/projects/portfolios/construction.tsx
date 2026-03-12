import { Container } from '@/components/ui/container';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PortfolioItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    title: 'Bảng tiến độ & thanh toán',
    icon: 'calendar-outline',
    route: '/projects/portfolio/payment-schedule',
  },
  {
    id: '2',
    title: 'Bảng quy ước phần thô',
    icon: 'hammer-outline',
    route: '/projects/portfolio/rough-work',
  },
  {
    id: '3',
    title: 'Bảng test MEP/PCCC',
    icon: 'flask-outline',
    route: '/projects/portfolio/mep-test',
  },
  {
    id: '4',
    title: 'Bảng defect hoàn thiện',
    icon: 'checkmark-done-outline',
    route: '/projects/portfolio/defect-list',
  },
  {
    id: '5',
    title: 'Danh mục bản vẽ',
    icon: 'albums-outline',
    route: '/projects/portfolio/drawings',
  },
];

export default function ConstructionPortfolioScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleItemPress = (item: PortfolioItem) => {
    if (item.route) {
      // TODO: Navigate to specific portfolio item
      // router.push(item.route);
      alert(`Xem ${item.title}`);
    }
  };

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Hồ sơ mẫu xây dựng
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={[styles.subtitle, { color: mutedColor }]}>
          Danh sách các tài liệu
        </Text>

        {/* Portfolio Items List */}
  <View style={[styles.listContainer, { backgroundColor: surfaceColor }]}>
          {PORTFOLIO_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                {
                  borderBottomWidth: index < PORTFOLIO_ITEMS.length - 1 ? 1 : 0,
                  borderBottomColor: borderColor,
                },
              ]}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.itemContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: primaryColor + '20' },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={24} color={primaryColor} />
                </View>
                <Text style={[styles.itemTitle, { color: textColor }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    flex: 1,
  },
});
