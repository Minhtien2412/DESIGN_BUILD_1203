import { CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/theme";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.8;
const FAVORITES_KEY = "@drawer_favorites";

interface RecentScreen {
  id: string;
  name: string;
  icon: string;
  route: string;
  timestamp: number;
}

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function AppDrawer({ visible, onClose }: AppDrawerProps) {
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [recentScreens, setRecentScreens] = useState<RecentScreen[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { trackDrawer, trackFavoriteAdd, trackFavoriteRemove, trackNavigation } = useAnalytics();

  useEffect(() => {
    if (visible) {
      trackDrawer('menu_button');
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      loadRecentScreens();
      loadFavorites();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadRecentScreens = async () => {
    try {
      const data = await AsyncStorage.getItem("@recent_screens");
      if (data) {
        setRecentScreens(JSON.parse(data).slice(0, 5));
      }
    } catch (e) {
      console.log("Error loading recent screens:", e);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) {
        setFavorites(JSON.parse(data));
      }
    } catch (e) {
      console.log("Error loading favorites:", e);
    }
  };

  const toggleFavorite = async (categoryId: string) => {
    try {
      const isFavorite = favorites.includes(categoryId);
      const newFavorites = isFavorite
        ? favorites.filter((id) => id !== categoryId)
        : [...favorites, categoryId];
      
      // Track analytics
      if (isFavorite) {
        trackFavoriteRemove(categoryId, 'category');
      } else {
        trackFavoriteAdd(categoryId, 'category');
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (e) {
      console.log("Error saving favorites:", e);
    }
  };

  const navigateToCategory = (categoryId: string) => {
    trackNavigation('drawer', `/categories/${categoryId}`);
    router.push(`/categories/${categoryId}` as any);
    onClose();
  };

  const navigateToRecent = (route: string) => {
    trackNavigation('drawer', route);
    router.push(route as any);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.light.primary, "#4A90E2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.drawerHeader}
          >
            <View style={styles.headerContent}>
              <Ionicons name="menu" size={32} color="#fff" />
              <Text style={styles.drawerTitle}>Menu Điều hướng</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
            {/* Favorites Section */}
            {favorites.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={20} color={Colors.light.primary} />
                  <Text style={styles.sectionTitle}>Yêu thích</Text>
                </View>
                {CATEGORIES.filter((cat) => favorites.includes(cat.id)).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => navigateToCategory(category.id)}
                  >
                    <View style={styles.categoryLeft}>
                      <Ionicons name={category.icon as any} size={22} color={category.color} />
                      <Text style={styles.categoryName}>{category.label}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(category.id)}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Screens */}
            {recentScreens.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={20} color={Colors.light.primary} />
                  <Text style={styles.sectionTitle}>Gần đây</Text>
                </View>
                {recentScreens.map((screen) => (
                  <TouchableOpacity
                    key={screen.id}
                    style={styles.recentItem}
                    onPress={() => navigateToRecent(screen.route)}
                  >
                    <Ionicons name={screen.icon as any} size={20} color="#666" />
                    <Text style={styles.recentName}>{screen.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* All Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="apps-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.sectionTitle}>Tất cả danh mục</Text>
              </View>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => navigateToCategory(category.id)}
                >
                  <View style={styles.categoryLeft}>
                    <Ionicons name={category.icon as any} size={22} color={category.color} />
                    <View>
                      <Text style={styles.categoryName}>{category.label}</Text>
                      <Text style={styles.categoryCount}>{category.modules.length} module</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(category.id)}>
                    <Ionicons
                      name={favorites.includes(category.id) ? "star" : "star-outline"}
                      size={20}
                      color={favorites.includes(category.id) ? "#FFD700" : "#ccc"}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  drawerContent: {
    flex: 1,
  },
  section: {
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  categoryCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  recentName: {
    fontSize: 14,
    color: "#666",
  },
});
