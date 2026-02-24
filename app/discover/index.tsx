import { GRADIENTS } from "@/constants/modern-ui-styles";
import { useThemeColor } from "@/hooks/use-theme-color";
import { get } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const discoverSections = [
  {
    id: "1",
    title: "Xu hướng thiết kế 2026",
    subtitle: "Khám phá phong cách mới",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=200&q=80",
    route: "/trending",
  },
  {
    id: "2",
    title: "Flash Sale mỗi ngày",
    subtitle: "Giảm đến 50%",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&q=80",
    route: "/flash-sale",
  },
  {
    id: "3",
    title: "Thợ được yêu thích",
    subtitle: "Top đánh giá cao nhất",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&q=80",
    route: "/workers",
  },
];

const quickLinks = [
  { icon: "home-outline", label: "Thiết kế nhà", route: "/ai-design" },
  { icon: "construct-outline", label: "Dự án", route: "/projects" },
  { icon: "cart-outline", label: "Mua sắm", route: "/categories" },
  { icon: "people-outline", label: "Tìm thợ", route: "/workers" },
  { icon: "pricetags-outline", label: "Khuyến mãi", route: "/promotions" },
  { icon: "cube-outline", label: "So sánh", route: "/compare" },
  { icon: "location-outline", label: "Gần tôi", route: "/nearby" },
  { icon: "newspaper-outline", label: "Tin tức", route: "/news" },
];

const inspirations = [
  {
    id: "1",
    title: "Phòng khách hiện đại",
    image:
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=200&q=80",
    likes: 1234,
  },
  {
    id: "2",
    title: "Phòng ngủ minimalist",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=200&q=80",
    likes: 987,
  },
  {
    id: "3",
    title: "Nhà bếp sang trọng",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80",
    likes: 756,
  },
  {
    id: "4",
    title: "Phòng tắm spa",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&q=80",
    likes: 654,
  },
];

export default function DiscoverScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState(discoverSections);
  const [inspoList, setInspoList] = useState(inspirations);

  const fetchDiscover = useCallback(async () => {
    try {
      const res = await get("/api/discover");
      if (res?.data?.sections) setSections(res.data.sections);
      if (res?.data?.inspirations) setInspoList(res.data.inspirations);
    } catch {
      /* use mock */
    }
  }, []);

  useEffect(() => {
    fetchDiscover();
  }, [fetchDiscover]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDiscover();
    setRefreshing(false);
  }, [fetchDiscover]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Khám phá", headerShown: true }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {/* Banner Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerContainer}
        >
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.bannerCard}
              onPress={() => router.push(section.route as any)}
            >
              <Image
                source={{ uri: section.image }}
                style={styles.bannerImage}
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{section.title}</Text>
                <Text style={styles.bannerSubtitle}>{section.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Links */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.quickLinksGrid}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickLinkItem}
                onPress={() => router.push(link.route as any)}
              >
                <View
                  style={[
                    styles.quickLinkIcon,
                    { backgroundColor: "#14B8A615" },
                  ]}
                >
                  <Ionicons name={link.icon as any} size={24} color="#14B8A6" />
                </View>
                <Text style={[styles.quickLinkLabel, { color: textColor }]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Inspirations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Cảm hứng thiết kế
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inspirationsGrid}>
            {inspoList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.inspirationCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/ai-design" as any);
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.inspirationImage}
                />
                <View style={styles.inspirationOverlay}>
                  <Text style={styles.inspirationTitle}>{item.title}</Text>
                  <View style={styles.likesRow}>
                    <Ionicons name="heart" size={14} color="#fff" />
                    <Text style={styles.likesText}>
                      {formatNumber(item.likes)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <LinearGradient
          colors={GRADIENTS.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaCard}
        >
          <Ionicons name="sparkles" size={32} color="#FFD700" />
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Thiết kế với AI</Text>
            <Text style={styles.ctaDesc}>Tạo thiết kế trong vài giây</Text>
          </View>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push("/ai-design" as any)}
          >
            <Text style={styles.ctaBtnText}>Thử ngay</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  bannerContainer: { height: 180 },
  bannerCard: {
    width: width - 32,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bannerImage: { width: "100%", height: 180, backgroundColor: "#f0f0f0" },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  bannerSubtitle: { color: "#fff", opacity: 0.9, marginTop: 4 },
  section: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  viewAll: { color: "#0D9488", fontSize: 14 },
  quickLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickLinkItem: { width: "23%", alignItems: "center", marginBottom: 16 },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickLinkLabel: { fontSize: 12, textAlign: "center" },
  inspirationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inspirationCard: {
    width: "48%",
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  inspirationImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  inspirationOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  inspirationTitle: { color: "#fff", fontSize: 13, fontWeight: "500" },
  likesRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  likesText: { color: "#fff", fontSize: 12, marginLeft: 4 },
  ctaCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden" as const,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaContent: { flex: 1, marginLeft: 16 },
  ctaTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  ctaDesc: { color: "#fff", opacity: 0.9, marginTop: 2 },
  ctaBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  ctaBtnText: { color: "#0D9488", fontWeight: "700" },
});
