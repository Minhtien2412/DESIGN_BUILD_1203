import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
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

  const filteredItems = nearbyItems.filter((item) => {
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
            <Ionicons name="navigate-outline" size={12} color="#FF6B35" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {(item.categories || item.services)?.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.directionBtn}>
        <Ionicons name="navigate" size={20} color="#FF6B35" />
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
        <TouchableOpacity style={styles.locationBtn}>
          <Ionicons name="location" size={18} color="#FF6B35" />
          <Text style={styles.locationText}>Q.7</Text>
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
      <TouchableOpacity style={styles.mapPlaceholder}>
        <Ionicons name="map" size={24} color="#FF6B35" />
        <Text style={styles.mapText}>Xem trên bản đồ</Text>
      </TouchableOpacity>

      {/* Results */}
      <FlatList
        data={filteredItems}
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
  container: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  locationBtn: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  locationText: { color: "#FF6B35", fontSize: 13, marginLeft: 4 },
  filterContainer: { maxHeight: 50, marginTop: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    gap: 6,
  },
  filterBtnActive: { backgroundColor: "#FF6B35" },
  filterText: { color: "#666", fontSize: 13 },
  filterTextActive: { color: "#fff" },
  mapPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FF6B3510",
    gap: 8,
  },
  mapText: { color: "#FF6B35", fontSize: 14, fontWeight: "500" },
  listContent: { padding: 16, paddingTop: 0 },
  resultCount: { fontSize: 13, marginBottom: 12 },
  itemCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  itemContent: { flex: 1, marginLeft: 12 },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  addressRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  addressText: { color: "#666", fontSize: 12, marginLeft: 4 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 12,
  },
  ratingBox: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 12, fontWeight: "500", marginLeft: 3 },
  reviewText: { fontSize: 11, color: "#999", marginLeft: 2 },
  distanceBox: { flexDirection: "row", alignItems: "center" },
  distanceText: { fontSize: 12, color: "#FF6B35", marginLeft: 3 },
  tagsRow: { flexDirection: "row", marginTop: 8, gap: 6 },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 10, color: "#666" },
  directionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B3510",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
