import { SafeScrollView } from "@/components/ui/safe-area";
import { Colors } from "@/constants/theme";
import { CONSTRUCTION_UTILITIES, FINISHING_UTILITIES } from "@/data/home-sections";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ConstructionUtilitiesScreen() {
  const params = useLocalSearchParams();
  const initialTab = params.tab === 'finish' ? 'finish' : 'build';
  const [activeTab, setActiveTab] = useState<'build' | 'finish'>(initialTab);

  const data = activeTab === 'build' ? CONSTRUCTION_UTILITIES : FINISHING_UTILITIES;

  return (
    <SafeScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tiện ích thi công</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'build' && styles.tabActive]}
          onPress={() => setActiveTab('build')}
        >
          <Text style={[styles.tabText, activeTab === 'build' && styles.tabTextActive]}>
            Xây dựng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'finish' && styles.tabActive]}
          onPress={() => setActiveTab('finish')}
        >
          <Text style={[styles.tabText, activeTab === 'finish' && styles.tabTextActive]}>
            Hoàn thiện
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {data.map((item) => (
          <UtilityCard key={item.id} item={item} />
        ))}
      </View>
    </SafeScrollView>
  );
}

function UtilityCard({ item }: { item: typeof CONSTRUCTION_UTILITIES[0] }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.utilityCard}
      activeOpacity={1}
      onPress={() => router.push('/construction/booking')}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.utilityCardInner, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={item.icon} style={styles.utilityIcon} resizeMode="contain" />
        <Text style={styles.utilityName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={10} color={Colors.light.primary} />
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.countText}>·{item.count}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  utilityCard: {
    width: '31%',
  },
  utilityCardInner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  utilityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  utilityName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
  },
  locationText: {
    fontSize: 9,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  countText: {
    fontSize: 9,
    color: '#666',
  },
});
