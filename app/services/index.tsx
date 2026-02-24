import { SafeScrollView } from "@/components/ui/safe-area";
import { AI_SERVICES, SERVICES } from "@/data/home-sections";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ServicesHubScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />

      {/* Gradient Header */}
      <LinearGradient
        colors={["#0F766E", "#115E59", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dịch vụ</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/unified-search" as any)}
          >
            <Ionicons name="search-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="flash" size={14} color="#FFAB40" />
            <Text style={styles.statText}>AI tư vấn</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="briefcase" size={14} color="#C5CAE9" />
            <Text style={styles.statText}>{SERVICES.length}+ dịch vụ</Text>
          </View>
        </View>
      </LinearGradient>

      <SafeScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* AI Services Banner */}
        <View style={styles.aiSection}>
          <View style={styles.aiSectionHeader}>
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              style={styles.aiHeaderIcon}
            >
              <MaterialCommunityIcons name="robot-happy" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.aiSectionTitle}>Tư vấn AI</Text>
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
          onPress={() => router.push("/services/marketplace")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#0F766E", "#14B8A6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.marketplaceGradient}
          >
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIconBox}>
                <Ionicons name="storefront" size={24} color="#fff" />
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>Services Marketplace</Text>
                <Text style={styles.bannerSubtitle}>
                  Tìm & đặt dịch vụ chuyên nghiệp
                </Text>
              </View>
            </View>
            <View style={styles.bannerArrow}>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tất cả dịch vụ</Text>
          <Text style={styles.sectionCount}>{SERVICES.length}</Text>
        </View>

        {/* Services Grid */}
        <View style={styles.grid}>
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} item={service} />
          ))}
        </View>

        <View style={{ height: 80 }} />
      </SafeScrollView>
    </View>
  );
}

// AI Service Card Component
function AIServiceCard({ item }: { item: (typeof AI_SERVICES)[0] }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => router.push(item.route as Href)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.aiServiceCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <View
          style={[styles.aiIconContainer, { backgroundColor: item.color + "15" }]}
        >
          <Text style={styles.aiServiceIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.aiServiceName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.isNew && (
          <View style={[styles.hotDot, { backgroundColor: item.color }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function ServiceCard({ item }: { item: (typeof SERVICES)[0] }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
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
      <Animated.View
        style={[styles.serviceCardInner, { transform: [{ scale: scaleAnim }] }]}
      >
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
  wrapper: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  headerGradient: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E8EAF6",
  },
  container: {
    flex: 1,
  },

  // AI Section
  aiSection: {
    backgroundColor: "#FAF5FF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    ...Platform.select({
      ios: {
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  aiSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  aiHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  aiSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6D28D9",
  },
  newBadge: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  aiSectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
  },
  aiServicesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  aiServiceCard: {
    width: "18.5%",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    position: "relative",
    borderWidth: 1,
    borderColor: "#F3E8FF",
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  aiServiceIcon: {
    fontSize: 20,
  },
  aiServiceName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 13,
  },
  hotDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Marketplace Banner
  marketplaceBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 18,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  marketplaceGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  bannerArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4338CA",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },

  // Services Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  serviceCard: {
    width: "31%",
    aspectRatio: 1,
  },
  serviceCardInner: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    width: 32,
    height: 32,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 16,
  },
});
