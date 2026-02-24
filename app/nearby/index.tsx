import { useThemeColor } from "@/hooks/use-theme-color";
import { get } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const nearbyItems = [
  {
    id: "1",
    type: "store",
    name: "Siêu thị VLXD Minh Phát",
    address: "123 Nguyễn Văn Linh, Q.7",
    distance: "0.5 km",
    rating: 4.7,
    reviews: 234,
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=100&q=80",
  },
  {
    id: "2",
    type: "store",
    name: "Cửa hàng thiết bị vệ sinh Thành Công",
    address: "456 Lê Văn Việt, Q.9",
    distance: "1.2 km",
    rating: 4.5,
    reviews: 156,
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=100&q=80",
  },
  {
    id: "3",
    type: "warehouse",
    name: "Kho VLXD Hòa Bình",
    address: "789 Xa lộ Hà Nội, Q.Thủ Đức",
    distance: "2.8 km",
    rating: 4.3,
    reviews: 89,
    isOpen: false,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80",
  },
  {
    id: "4",
    type: "worker",
    name: "Thợ điện Nguyễn Văn An",
    address: "Hoạt động tại Q.7, Q.8",
    distance: "0.8 km",
    rating: 4.9,
    reviews: 78,
    isAvailable: true,
    image: "https://ui-avatars.com/api/?name=An",
    services: ["Lắp điện", "Sửa điện", "Bảo trì"],
  },
  {
    id: "5",
    type: "worker",
    name: "Thợ nước Trần Minh",
    address: "Hoạt động tại Q.7, Q.1",
    distance: "1.5 km",
    rating: 4.7,
    reviews: 56,
    isAvailable: true,
    image: "https://ui-avatars.com/api/?name=Minh",
    services: ["Lắp ống nước", "Sửa vòi", "Chống thấm"],
  },
];

const filterOptions = [
  { id: "all", label: "Tất cả", icon: "apps-outline" },
  { id: "store", label: "Cửa hàng", icon: "storefront-outline" },
  { id: "warehouse", label: "Kho", icon: "cube-outline" },
  { id: "worker", label: "Thợ", icon: "person-outline" },
];

export default function NearbyScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState(nearbyItems);
  const [locationName, setLocationName] = useState("Q.7");

  const fetchNearby = useCallback(async () => {
    try {
      const res = await get("/api/nearby");
      if (res?.data) setItems(res.data);
    } catch {
      /* mock */
    }
  }, []);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNearby();
    setRefreshing(false);
  }, [fetchNearby]);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền vị trí", "Vui lòng cấp quyền vị trí để tìm gần bạn");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocationName(
        `${loc.coords.latitude.toFixed(2)}°, ${loc.coords.longitude.toFixed(2)}°`,
      );
    } catch {
      Alert.alert("Lỗi", "Không lấy được vị trí");
    }
  }, []);

  const handleDirections = useCallback((item: (typeof nearbyItems)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const q = encodeURIComponent(item.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const renderItem = ({ item }: { item: (typeof nearbyItems)[0] }) => (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor: cardBg }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text
            style={[styles.itemName, { color: textColor }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {"isOpen" in item ? (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.isOpen ? "#E8F5E9" : "#FFEBEE" },
              ]}
            >
              <Text
                style={{
                  color: item.isOpen ? "#4CAF50" : "#F44336",
                  fontSize: 10,
                }}
              >
                {item.isOpen ? "Đang mở" : "Đã đóng"}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.isAvailable ? "#E8F5E9" : "#FFEBEE" },
              ]}
            >
              <Text
                style={{
                  color: item.isAvailable ? "#4CAF50" : "#F44336",
                  fontSize: 10,
                }}
              >
                {item.isAvailable ? "Sẵn sàng" : "Bận"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.addressText}>{item.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewText}>({item.reviews})</Text>
          </View>
          <View style={styles.distanceBox}>
            <Ionicons name="navigate-outline" size={12} color="#14B8A6" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {(item as { services?: string[] }).services
            ?.slice(0, 3)
            .map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.directionBtn}
        onPress={() => handleDirections(item)}
      >
        <Ionicons name="navigate" size={20} color="#14B8A6" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Gần tôi", headerShown: true }} />

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm kiếm cửa hàng, thợ..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.locationBtn} onPress={requestLocation}>
          <Ionicons name="location" size={18} color="#14B8A6" />
          <Text style={styles.locationText}>{locationName}</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterBtn,
              activeFilter === filter.id && styles.filterBtnActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={activeFilter === filter.id ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Placeholder */}
      <TouchableOpacity
        style={styles.mapPlaceholder}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Linking.openURL(
            "https://www.google.com/maps/search/vật+liệu+xây+dựng",
          );
        }}
      >
        <Ionicons name="map" size={24} color="#14B8A6" />
        <Text style={styles.mapText}>Xem trên bản đồ</Text>
      </TouchableOpacity>

      {/* Results */}
      <FlatList
        data={filteredItems}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.resultCount, { color: textColor }]}>
            {filteredItems.length} kết quả gần bạn
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  locationBtn: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  locationText: { color: "#0D9488", fontSize: 13, marginLeft: 4 },
  filterContainer: { maxHeight: 50, marginTop: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterBtnActive: { backgroundColor: "#0D9488", borderColor: "#0D9488" },
  filterText: { color: "#6B7280", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  mapPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#0D948815",
    gap: 8,
  },
  mapText: { color: "#0D9488", fontSize: 14, fontWeight: "600" },
  listContent: { padding: 16, paddingTop: 0 },
  resultCount: { fontSize: 13, marginBottom: 12 },
  itemCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  itemContent: { flex: 1, marginLeft: 12 },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  addressRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  addressText: { color: "#6B7280", fontSize: 12, marginLeft: 4 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 12,
  },
  ratingBox: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 12, fontWeight: "500", marginLeft: 3 },
  reviewText: { fontSize: 11, color: "#9CA3AF", marginLeft: 2 },
  distanceBox: { flexDirection: "row", alignItems: "center" },
  distanceText: { fontSize: 12, color: "#0D9488", marginLeft: 3 },
  tagsRow: { flexDirection: "row", marginTop: 8, gap: 6 },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: { fontSize: 10, color: "#6B7280" },
  directionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0D948815",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
