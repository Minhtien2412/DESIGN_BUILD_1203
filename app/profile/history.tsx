/**
 * View History Screen - Modern Minimalist Design
 * Features: Swipeable items, grouped timeline, animations, dark mode
 */

import { useViewHistory } from "@/context/ViewHistoryContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

// Filter types
type FilterType = "all" | "product" | "service" | "worker";

const FILTERS: {
  id: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "all", label: "Tất cả", icon: "grid-outline" },
  { id: "product", label: "Sản phẩm", icon: "cube-outline" },
  { id: "service", label: "Dịch vụ", icon: "construct-outline" },
  { id: "worker", label: "Thợ", icon: "person-outline" },
];

// Animated History Item Component
const HistoryItem = ({
  item,
  index,
  onPress,
  onRemove,
  textColor,
  surfaceColor,
  borderColor,
}: {
  item: any;
  index: number;
  onPress: () => void;
  onRemove: () => void;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, -SWIPE_THRESHOLD));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -SWIPE_THRESHOLD / 2) {
        Animated.spring(translateX, {
          toValue: -SWIPE_THRESHOLD,
          useNativeDriver: true,
        }).start();
        setIsSwipeOpen(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setIsSwipeOpen(false);
      }
    },
  });

  const handleRemove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onRemove());
  };

  // Helper functions
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "product":
        return "#6366f115";
      case "service":
        return "#10b98115";
      case "worker":
        return "#f59e0b15";
      default:
        return "#64748b15";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "Sản phẩm";
      case "service":
        return "Dịch vụ";
      case "worker":
        return "Thợ";
      default:
        return "Khác";
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: scaleAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Delete Action Behind */}
      <View style={styles.deleteAction}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleRemove}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: surfaceColor, borderColor },
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={styles.cardTouchable}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {item.price?.toLocaleString("vi-VN")} ₫
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color="#9ca3af" />
              <Text style={styles.time}>
                {new Date(item.viewedAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: getTypeBadgeColor(item.type) },
                ]}
              >
                <Text style={styles.typeBadgeText}>
                  {getTypeLabel(item.type)}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function ViewHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { history, clearHistory, removeFromHistory } = useViewHistory();
  const [filter, setFilter] = useState<FilterType>("all");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredHistory = history.filter(
    (item) => filter === "all" || item.type === filter
  );

  // Group by date
  const groupByDate = useCallback((items: any[]) => {
    const groups: { [key: string]: any[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    items.forEach((item) => {
      const viewDate = new Date(item.viewedAt);
      viewDate.setHours(0, 0, 0, 0);

      let key: string;
      if (viewDate.getTime() === today.getTime()) {
        key = "Hôm nay";
      } else if (viewDate.getTime() === yesterday.getTime()) {
        key = "Hôm qua";
      } else {
        key = viewDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "numeric",
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, []);

  const groupedHistory = groupByDate(filteredHistory);

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Xóa lịch sử xem",
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearHistory();
          },
        },
      ]
    );
  };

  const handleItemPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.type === "product") {
      router.push(`/product/${item.id}` as Href);
    } else if (item.type === "service") {
      router.push(`/service/${item.id}` as Href);
    } else if (item.type === "worker") {
      router.push(`/worker/${item.id}` as Href);
    }
  };

  const renderSection = ({
    item,
    index,
  }: {
    item: { date: string; items: any[] };
    index: number;
  }) => (
    <View style={styles.section}>
      {/* Timeline header */}
      <View style={styles.dateHeaderContainer}>
        <View
          style={[
            styles.timelineDot,
            { backgroundColor: isDark ? "#6366f1" : "#1a1a1a" },
          ]}
        />
        <Text style={[styles.dateHeader, { color: textColor }]}>
          {item.date}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.sectionItems}>
        {item.items.map((historyItem: any, itemIndex: number) => (
          <HistoryItem
            key={historyItem.id}
            item={historyItem}
            index={itemIndex}
            onPress={() => handleItemPress(historyItem)}
            onRemove={() => removeFromHistory(historyItem.id)}
            textColor={textColor}
            surfaceColor={surfaceColor}
            borderColor={borderColor}
          />
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View
        style={[
          styles.emptyIconWrap,
          { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
        ]}
      >
        <Ionicons
          name="time-outline"
          size={48}
          color={isDark ? "#6b7280" : "#9ca3af"}
        />
      </View>
      <Text style={[styles.emptyText, { color: textColor }]}>
        Chưa có lịch sử xem
      </Text>
      <Text style={[styles.emptySubtext, { color: textColor + "80" }]}>
        Các sản phẩm và dịch vụ bạn đã xem sẽ xuất hiện ở đây
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/(tabs)")}
        activeOpacity={0.8}
      >
        <Text style={styles.browseButtonText}>Khám phá ngay</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: surfaceColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: textColor }]}>Lịch sử xem</Text>
          {history.length > 0 && (
            <Text style={[styles.subtitle, { color: textColor + "60" }]}>
              {history.length} mục
            </Text>
          )}
        </View>

        {history.length > 0 && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: "#ef444420" }]}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Filter Chips */}
      {history.length > 0 && (
        <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
          {FILTERS.map((filterItem) => {
            const count =
              filterItem.id === "all"
                ? history.length
                : history.filter((h) => h.type === filterItem.id).length;
            const isActive = filter === filterItem.id;

            return (
              <TouchableOpacity
                key={filterItem.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? "#6366f1"
                        : "#1a1a1a"
                      : surfaceColor,
                    borderColor: isActive ? "transparent" : borderColor,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilter(filterItem.id);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={filterItem.icon}
                  size={14}
                  color={isActive ? "#fff" : textColor + "80"}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? "#fff" : textColor },
                  ]}
                >
                  {filterItem.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      {
                        backgroundColor: isActive
                          ? "rgba(255,255,255,0.2)"
                          : borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        { color: isActive ? "#fff" : textColor + "80" },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}

      {/* Hint */}
      {history.length > 0 && (
        <View style={styles.hintContainer}>
          <Ionicons name="arrow-back" size={14} color={textColor + "50"} />
          <Text style={[styles.hintText, { color: textColor + "50" }]}>
            Vuốt sang trái để xóa
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={groupedHistory}
        renderItem={renderSection}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[
          styles.list,
          groupedHistory.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyList: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionItems: {
    marginLeft: 5,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
  cardContainer: {
    marginBottom: 10,
    position: "relative",
  },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_THRESHOLD,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  deleteButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardTouchable: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6366f1",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: "#9ca3af",
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748b",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
