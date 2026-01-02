import { SafeScrollView } from "@/components/ui/safe-area";
import { Colors } from "@/constants/theme";
import { EQUIPMENT_SHOPPING } from "@/data/home-sections";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EquipmentShoppingScreen() {
  return (
    <SafeScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mua sắm trang thiết bị</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Equipment Grid */}
      <View style={styles.grid}>
        {EQUIPMENT_SHOPPING.map((item) => (
          <EquipmentCard key={item.id} item={item} />
        ))}
      </View>
    </SafeScrollView>
  );
}

function EquipmentCard({ item }: { item: typeof EQUIPMENT_SHOPPING[0] }) {
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
      style={styles.equipmentCard}
      activeOpacity={1}
      onPress={() => router.push('/shopping')}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.equipmentCardInner, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <Image source={item.icon} style={styles.icon} resizeMode="contain" />
        </View>
        <Text style={styles.equipmentName} numberOfLines={2}>
          {item.name}
        </Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  equipmentCard: {
    width: '31%',
    aspectRatio: 1,
  },
  equipmentCardInner: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 36,
    height: 36,
  },
  equipmentName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});
