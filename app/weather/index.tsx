import { Container } from '@/components/ui/container';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = Colors.light.primary;

export default function WeatherIndexScreen() {
  const weatherFeatures = [
    {
      id: 1,
      title: 'Thời tiết hôm nay',
      description: 'Dự báo thời tiết chi tiết',
      icon: 'sunny-outline' as const,
      route: '/weather/dashboard',
      color: '#FFFFFF',
    },
    {
      id: 2,
      title: 'Cảnh báo thời tiết',
      description: 'Thông báo thời tiết nguy hiểm',
      icon: 'warning-outline' as const,
      route: '/weather/alerts',
      color: '#FF6B6B',
    },
    {
      id: 3,
      title: 'Tạm dừng thi công',
      description: 'Quản lý ngày dừng do thời tiết',
      icon: 'pause-circle-outline' as const,
      route: '/weather/stoppages',
      color: '#0080FF',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thời tiết',
          headerStyle: { backgroundColor: PRIMARY_COLOR },
          headerTintColor: '#fff',
        }}
      />
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Dự báo thời tiết xây dựng</Text>
            <Text style={styles.subtitle}>
              Theo dõi thời tiết để lên kế hoạch thi công hợp lý
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            {weatherFeatures.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.card}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon} size={32} color={feature.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{feature.title}</Text>
                  <Text style={styles.cardDescription}>{feature.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.infoText}>
              Dự báo thời tiết giúp bạn lên kế hoạch thi công an toàn và hiệu quả hơn
            </Text>
          </View>
        </ScrollView>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardsContainer: {
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PRIMARY_COLOR + '10',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
});
