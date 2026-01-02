import { SafeScrollView } from "@/components/ui/safe-area";
import { Colors } from "@/constants/theme";
import { LIBRARY } from "@/data/home-sections";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LibraryScreen() {
  return (
    <SafeScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thư viện</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Library Grid */}
      <View style={styles.grid}>
        {LIBRARY.map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </View>
    </SafeScrollView>
  );
}

function LibraryCard({ item }: { item: typeof LIBRARY[0] }) {
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
      style={styles.libraryCard}
      activeOpacity={1}
      onPress={() => router.push('/projects')}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.libraryCardInner, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={item.icon} style={styles.libraryImage} resizeMode="cover" />
        <View style={styles.overlay}>
          <Text style={styles.libraryName}>{item.name}</Text>
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
  libraryCard: {
    width: '48%',
    aspectRatio: 1.3,
  },
  libraryCardInner: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  libraryImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  libraryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});
