import { SafeScrollView } from "@/components/ui/safe-area";
import { Colors } from "@/constants/theme";
import { DESIGN_UTILITIES } from "@/data/home-sections";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DesignTeamScreen() {
  return (
    <SafeScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đội ngũ thiết kế</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Designers Grid */}
      <View style={styles.grid}>
        {DESIGN_UTILITIES.map((designer) => (
          <DesignerCard key={designer.id} item={designer} />
        ))}
      </View>
    </SafeScrollView>
  );
}

function DesignerCard({ item }: { item: typeof DESIGN_UTILITIES[0] }) {
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
      style={styles.designerCard}
      activeOpacity={1}
      onPress={() => router.push('/utilities/designer-booking')}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.designerCardInner, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={item.icon} style={styles.designerIcon} resizeMode="contain" />
        <Text style={styles.designerName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.price}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  designerCard: {
    width: '31%',
  },
  designerCardInner: {
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
  designerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  designerName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  priceText: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
