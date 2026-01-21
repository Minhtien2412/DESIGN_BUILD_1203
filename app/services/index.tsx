import { SafeScrollView } from "@/components/ui/safe-area";
import { Colors } from "@/constants/theme";
import { AI_SERVICES, SERVICES } from "@/data/home-sections";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ServicesHubScreen() {
  return (
    <SafeScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* AI Services Banner */}
      <View style={styles.aiSection}>
        <View style={styles.aiSectionHeader}>
          <MaterialCommunityIcons name="robot-happy" size={24} color="#7C3AED" />
          <Text style={styles.aiSectionTitle}>🤖 Tư vấn AI</Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>MỚI</Text>
          </View>
        </View>
        <Text style={styles.aiSectionSubtitle}>
          Trợ lý AI thông minh tư vấn mọi vấn đề về xây dựng
        </Text>
        
        <View style={styles.aiServicesRow}>
          {AI_SERVICES.map((service) => (
            <AIServiceCard key={service.id} item={service} />
          ))}
        </View>
      </View>

      {/* Marketplace Banner */}
      <TouchableOpacity
        style={styles.marketplaceBanner}
        onPress={() => router.push('/services/marketplace')}
      >
        <View style={styles.bannerLeft}>
          <Ionicons name="storefront" size={32} color={Colors.light.primary} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Services Marketplace</Text>
            <Text style={styles.bannerSubtitle}>Browse & book professional services</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.light.primary} />
      </TouchableOpacity>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 Tất cả dịch vụ</Text>
      </View>

      {/* Services Grid */}
      <View style={styles.grid}>
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} item={service} />
        ))}
      </View>
    </SafeScrollView>
  );
}

// AI Service Card Component
function AIServiceCard({ item }: { item: typeof AI_SERVICES[0] }) {
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
      activeOpacity={1}
      onPress={() => router.push(item.route as Href)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.aiServiceCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.aiIconContainer, { backgroundColor: item.color + '20' }]}>
          <Text style={styles.aiServiceIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.aiServiceName} numberOfLines={2}>{item.name}</Text>
        {item.isNew && (
          <View style={[styles.hotDot, { backgroundColor: item.color }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function ServiceCard({ item }: { item: typeof SERVICES[0] }) {
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
      style={styles.serviceCard}
      activeOpacity={1}
      onPress={() => router.push(item.route as Href)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.serviceCardInner, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <Image source={item.icon} style={styles.icon} resizeMode="contain" />
        </View>
        <Text style={styles.serviceName} numberOfLines={2}>
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
  
  // AI Section
  aiSection: {
    backgroundColor: '#7C3AED10',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7C3AED30',
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  aiSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  newBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  aiSectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  aiServicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiServiceCard: {
    width: '18.5%',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    position: 'relative',
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  aiServiceIcon: {
    fontSize: 20,
  },
  aiServiceName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 13,
  },
  hotDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Marketplace Banner
  marketplaceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.primary + '15',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  
  // Section Header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  
  // Services Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  serviceCard: {
    width: '31%',
    aspectRatio: 1,
  },
  serviceCardInner: {
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
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});
