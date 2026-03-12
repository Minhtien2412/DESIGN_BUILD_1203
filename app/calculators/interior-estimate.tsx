/**
 * Interior Estimate Calculator - Tính Dự toán Nội thất
 * Furniture and interior decoration cost estimation
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Room types with default furniture
const ROOM_TEMPLATES = {
  livingRoom: {
    label: "Phòng khách",
    icon: "🛋️",
    defaultItems: [
      { id: "sofa", name: "Bộ sofa", qty: 1, rate: 25000000 },
      { id: "coffeeTable", name: "Bàn trà", qty: 1, rate: 5500000 },
      { id: "tvUnit", name: "Kệ TV", qty: 1, rate: 8500000 },
      { id: "shelf", name: "Kệ trang trí", qty: 2, rate: 3500000 },
      { id: "curtain", name: "Rèm cửa", qty: 1, rate: 4500000 },
      { id: "lighting", name: "Đèn trang trí", qty: 3, rate: 2500000 },
    ],
  },
  bedroom: {
    label: "Phòng ngủ",
    icon: "🛏️",
    defaultItems: [
      { id: "bed", name: "Giường ngủ", qty: 1, rate: 15000000 },
      { id: "mattress", name: "Nệm", qty: 1, rate: 8500000 },
      { id: "wardrobe", name: "Tủ quần áo", qty: 1, rate: 18000000 },
      { id: "dresser", name: "Bàn trang điểm", qty: 1, rate: 5500000 },
      { id: "nightstand", name: "Tab đầu giường", qty: 2, rate: 2500000 },
      { id: "curtain", name: "Rèm cửa", qty: 1, rate: 3500000 },
    ],
  },
  kitchen: {
    label: "Phòng bếp",
    icon: "🍳",
    defaultItems: [
      { id: "cabinet", name: "Tủ bếp trên + dưới", qty: 1, rate: 45000000 },
      { id: "countertop", name: "Mặt bàn đá", qty: 1, rate: 12000000 },
      { id: "sink", name: "Chậu rửa + vòi", qty: 1, rate: 5500000 },
      { id: "hood", name: "Máy hút mùi", qty: 1, rate: 8500000 },
      { id: "stove", name: "Bếp từ/gas", qty: 1, rate: 12000000 },
      { id: "oven", name: "Lò nướng", qty: 1, rate: 8000000 },
      { id: "fridge", name: "Tủ lạnh", qty: 1, rate: 18000000 },
    ],
  },
  bathroom: {
    label: "Phòng tắm",
    icon: "🚿",
    defaultItems: [
      { id: "vanity", name: "Tủ lavabo", qty: 1, rate: 8500000 },
      { id: "mirror", name: "Gương tủ", qty: 1, rate: 3500000 },
      { id: "toilet", name: "Bồn cầu thông minh", qty: 1, rate: 12000000 },
      { id: "shower", name: "Vách kính phòng tắm", qty: 1, rate: 8500000 },
      { id: "showerSet", name: "Sen tắm đứng", qty: 1, rate: 5500000 },
      { id: "accessories", name: "Phụ kiện inox", qty: 1, rate: 2500000 },
    ],
  },
  diningRoom: {
    label: "Phòng ăn",
    icon: "🍽️",
    defaultItems: [
      { id: "diningTable", name: "Bàn ăn", qty: 1, rate: 12000000 },
      { id: "chairs", name: "Ghế ăn", qty: 6, rate: 2500000 },
      { id: "sideboard", name: "Tủ rượu/kệ bày", qty: 1, rate: 8500000 },
      { id: "lighting", name: "Đèn bàn ăn", qty: 1, rate: 4500000 },
    ],
  },
  workroom: {
    label: "Phòng làm việc",
    icon: "💼",
    defaultItems: [
      { id: "desk", name: "Bàn làm việc", qty: 1, rate: 8500000 },
      { id: "chair", name: "Ghế công thái học", qty: 1, rate: 6500000 },
      { id: "bookshelf", name: "Kệ sách", qty: 1, rate: 5500000 },
      { id: "cabinet", name: "Tủ hồ sơ", qty: 1, rate: 4500000 },
      { id: "lighting", name: "Đèn bàn", qty: 1, rate: 1500000 },
    ],
  },
};

// Furniture quality levels
const QUALITY_LEVELS = [
  {
    id: "economy",
    label: "Tiết kiệm",
    multiplier: 0.6,
    desc: "Gỗ công nghiệp thường",
  },
  {
    id: "standard",
    label: "Tiêu chuẩn",
    multiplier: 1.0,
    desc: "Gỗ MDF/MFC cao cấp",
  },
  {
    id: "premium",
    label: "Cao cấp",
    multiplier: 1.5,
    desc: "Gỗ tự nhiên + nhập khẩu",
  },
  {
    id: "luxury",
    label: "Sang trọng",
    multiplier: 2.2,
    desc: "Thương hiệu cao cấp",
  },
];

interface FurnitureItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  customRate?: number;
}

interface RoomData {
  roomType: string;
  roomName: string;
  items: FurnitureItem[];
  qualityLevel: string;
}

export default function InteriorEstimateScreen() {
  const insets = useSafeAreaInsets();

  // Rooms
  const [rooms, setRooms] = useState<RoomData[]>([
    {
      roomType: "livingRoom",
      roomName: "Phòng khách",
      items: [...ROOM_TEMPLATES.livingRoom.defaultItems],
      qualityLevel: "standard",
    },
  ]);

  // Active room index
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  // Show results
  const [showResults, setShowResults] = useState(false);

  // Calculations
  const calculations = useMemo(() => {
    const roomTotals = rooms.map((room) => {
      const quality = QUALITY_LEVELS.find((q) => q.id === room.qualityLevel);
      const multiplier = quality?.multiplier || 1.0;

      const itemsTotal = room.items.reduce((sum, item) => {
        const rate = item.customRate ?? item.rate;
        return sum + item.qty * rate * multiplier;
      }, 0);

      return {
        roomName: room.roomName,
        roomType: room.roomType,
        qualityLevel: room.qualityLevel,
        multiplier,
        itemsTotal,
      };
    });

    const grandTotal = roomTotals.reduce((sum, r) => sum + r.itemsTotal, 0);

    return { roomTotals, grandTotal };
  }, [rooms]);

  const handleBack = useCallback(() => router.back(), []);

  const handleAddRoom = useCallback(
    (roomType: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const template = ROOM_TEMPLATES[roomType as keyof typeof ROOM_TEMPLATES];
      const newRoom: RoomData = {
        roomType,
        roomName: template.label,
        items: template.defaultItems.map((item) => ({ ...item })),
        qualityLevel: "standard",
      };
      setRooms((prev) => [...prev, newRoom]);
      setActiveRoomIndex(rooms.length);
    },
    [rooms.length],
  );

  const handleRemoveRoom = useCallback(
    (index: number) => {
      if (rooms.length <= 1) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setRooms((prev) => prev.filter((_, i) => i !== index));
      if (activeRoomIndex >= rooms.length - 1) {
        setActiveRoomIndex(Math.max(0, rooms.length - 2));
      }
    },
    [rooms.length, activeRoomIndex],
  );

  const handleUpdateRoom = useCallback(
    (field: keyof RoomData, value: any) => {
      setRooms((prev) => {
        const updated = [...prev];
        updated[activeRoomIndex] = {
          ...updated[activeRoomIndex],
          [field]: value,
        };
        return updated;
      });
    },
    [activeRoomIndex],
  );

  const handleUpdateItem = useCallback(
    (itemIndex: number, field: keyof FurnitureItem, value: any) => {
      setRooms((prev) => {
        const updated = [...prev];
        const room = { ...updated[activeRoomIndex] };
        room.items = [...room.items];
        room.items[itemIndex] = { ...room.items[itemIndex], [field]: value };
        updated[activeRoomIndex] = room;
        return updated;
      });
    },
    [activeRoomIndex],
  );

  const handleAddItem = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRooms((prev) => {
      const updated = [...prev];
      const room = { ...updated[activeRoomIndex] };
      room.items = [
        ...room.items,
        { id: `custom-${Date.now()}`, name: "Mục mới", qty: 1, rate: 5000000 },
      ];
      updated[activeRoomIndex] = room;
      return updated;
    });
  }, [activeRoomIndex]);

  const handleRemoveItem = useCallback(
    (itemIndex: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setRooms((prev) => {
        const updated = [...prev];
        const room = { ...updated[activeRoomIndex] };
        room.items = room.items.filter((_, i) => i !== itemIndex);
        updated[activeRoomIndex] = room;
        return updated;
      });
    },
    [activeRoomIndex],
  );

  const handleCalculate = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResults(true);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return `${amount.toLocaleString("vi-VN")} đ`;
  };

  const currentRoom = rooms[activeRoomIndex];
  const currentTemplate =
    ROOM_TEMPLATES[currentRoom?.roomType as keyof typeof ROOM_TEMPLATES];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🛋️ Dự toán Nội thất</Text>
          <Text style={styles.headerSubtitle}>Theo phòng và chất lượng</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Room Tabs */}
          <View style={styles.roomTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomTabs}
            >
              {rooms.map((room, index) => {
                const template =
                  ROOM_TEMPLATES[room.roomType as keyof typeof ROOM_TEMPLATES];
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.roomTab,
                      activeRoomIndex === index && styles.roomTabActive,
                    ]}
                    onPress={() => setActiveRoomIndex(index)}
                  >
                    <Text style={styles.roomTabIcon}>{template?.icon}</Text>
                    <Text
                      style={[
                        styles.roomTabText,
                        activeRoomIndex === index && styles.roomTabTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {room.roomName}
                    </Text>
                    {rooms.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeRoomBtn}
                        onPress={() => handleRemoveRoom(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={MODERN_COLORS.error}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Add Room Buttons */}
          <View style={styles.addRoomSection}>
            <Text style={styles.addRoomLabel}>Thêm phòng:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addRoomList}
            >
              {Object.entries(ROOM_TEMPLATES).map(([key, template]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.addRoomBtn}
                  onPress={() => handleAddRoom(key)}
                >
                  <Text style={styles.addRoomIcon}>{template.icon}</Text>
                  <Text style={styles.addRoomText}>{template.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Current Room Editor */}
          {currentRoom && (
            <View style={styles.editorSection}>
              {/* Room Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên phòng</Text>
                <TextInput
                  style={styles.input}
                  value={currentRoom.roomName}
                  onChangeText={(text) => handleUpdateRoom("roomName", text)}
                  placeholder="VD: Phòng khách"
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                />
              </View>

              {/* Quality Level */}
              <Text style={styles.sectionTitle}>Mức chất lượng</Text>
              <View style={styles.qualityGrid}>
                {QUALITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.qualityCard,
                      currentRoom.qualityLevel === level.id &&
                        styles.qualityCardActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleUpdateRoom("qualityLevel", level.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.qualityLabel,
                        currentRoom.qualityLevel === level.id &&
                          styles.qualityLabelActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text style={styles.qualityDesc}>{level.desc}</Text>
                    <Text style={styles.qualityMultiplier}>
                      x{level.multiplier.toFixed(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Furniture Items */}
              <View style={styles.itemsHeader}>
                <Text style={styles.sectionTitle}>Danh mục nội thất</Text>
                <TouchableOpacity
                  style={styles.addItemBtn}
                  onPress={handleAddItem}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.addItemText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {currentRoom.items.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <TextInput
                      style={styles.itemNameInput}
                      value={item.name}
                      onChangeText={(text) =>
                        handleUpdateItem(index, "name", text)
                      }
                      placeholder="Tên mục"
                      placeholderTextColor={MODERN_COLORS.textTertiary}
                    />
                    <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={MODERN_COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemInputs}>
                    <View style={styles.itemInputCol}>
                      <Text style={styles.itemInputLabel}>SL</Text>
                      <TextInput
                        style={styles.itemInput}
                        value={item.qty.toString()}
                        onChangeText={(text) =>
                          handleUpdateItem(index, "qty", parseInt(text) || 0)
                        }
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={[styles.itemInputCol, { flex: 2 }]}>
                      <Text style={styles.itemInputLabel}>Đơn giá (đ)</Text>
                      <TextInput
                        style={styles.itemInput}
                        value={(item.customRate ?? item.rate).toString()}
                        onChangeText={(text) =>
                          handleUpdateItem(
                            index,
                            "customRate",
                            parseInt(text) || 0,
                          )
                        }
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.itemTotalCol}>
                      <Text style={styles.itemInputLabel}>Thành tiền</Text>
                      <Text style={styles.itemTotal}>
                        {formatCurrency(
                          item.qty *
                            (item.customRate ?? item.rate) *
                            (QUALITY_LEVELS.find(
                              (q) => q.id === currentRoom.qualityLevel,
                            )?.multiplier || 1),
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Room Subtotal */}
              <View style={styles.subtotalCard}>
                <Text style={styles.subtotalLabel}>
                  Tổng {currentRoom.roomName}:
                </Text>
                <Text style={styles.subtotalValue}>
                  {formatCurrency(
                    calculations.roomTotals[activeRoomIndex]?.itemsTotal || 0,
                  )}
                </Text>
              </View>
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
          >
            <LinearGradient
              colors={["#ec4899", "#d946ef"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính tổng nội thất</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Results */}
          {showResults && calculations.grandTotal > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>📊 Bảng dự toán nội thất</Text>

              {calculations.roomTotals.map((room, index) => {
                const template =
                  ROOM_TEMPLATES[room.roomType as keyof typeof ROOM_TEMPLATES];
                return (
                  <View key={index} style={styles.resultRoomCard}>
                    <View style={styles.resultRoomHeader}>
                      <Text style={styles.resultRoomIcon}>
                        {template?.icon}
                      </Text>
                      <Text style={styles.resultRoomName}>{room.roomName}</Text>
                      <Text style={styles.resultRoomQuality}>
                        {
                          QUALITY_LEVELS.find((q) => q.id === room.qualityLevel)
                            ?.label
                        }{" "}
                        (x{room.multiplier})
                      </Text>
                    </View>
                    <Text style={styles.resultRoomTotal}>
                      {formatCurrency(room.itemsTotal)}
                    </Text>
                  </View>
                );
              })}

              {/* Grand Total */}
              <View style={styles.grandTotalCard}>
                <LinearGradient
                  colors={["#ec4899", "#d946ef"]}
                  style={styles.grandTotalGradient}
                >
                  <Text style={styles.grandTotalLabel}>
                    TỔNG CHI PHÍ NỘI THẤT
                  </Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(calculations.grandTotal)}
                  </Text>
                  <Text style={styles.grandTotalMeta}>
                    {rooms.length} phòng •{" "}
                    {rooms.reduce((sum, r) => sum + r.items.length, 0)} hạng mục
                  </Text>
                </LinearGradient>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MODERN_COLORS.background },
  flex1: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, marginLeft: MODERN_SPACING.sm },
  headerTitle: { fontSize: 18, fontWeight: "700", color: MODERN_COLORS.text },
  headerSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: MODERN_SPACING.md },

  // Room Tabs
  roomTabsContainer: { marginBottom: MODERN_SPACING.md },
  roomTabs: { gap: MODERN_SPACING.sm },
  roomTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    borderWidth: 2,
    borderColor: "transparent",
  },
  roomTabActive: { borderColor: "#ec4899", backgroundColor: "#fce7f3" },
  roomTabIcon: { fontSize: 16 },
  roomTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    maxWidth: 80,
  },
  roomTabTextActive: { color: "#db2777" },
  removeRoomBtn: { marginLeft: 4 },

  // Add Room
  addRoomSection: { marginBottom: MODERN_SPACING.lg },
  addRoomLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 8,
  },
  addRoomList: { gap: MODERN_SPACING.sm },
  addRoomBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    borderStyle: "dashed",
  },
  addRoomIcon: { fontSize: 16 },
  addRoomText: { fontSize: 12, color: MODERN_COLORS.textSecondary },

  // Editor Section
  editorSection: { marginBottom: MODERN_SPACING.lg },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  inputGroup: { marginBottom: MODERN_SPACING.md },
  inputLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  // Quality Grid
  qualityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.lg,
  },
  qualityCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  qualityCardActive: { borderColor: "#ec4899", backgroundColor: "#fce7f3" },
  qualityLabel: { fontSize: 13, fontWeight: "600", color: MODERN_COLORS.text },
  qualityLabelActive: { color: "#db2777" },
  qualityDesc: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
  },
  qualityMultiplier: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ec4899",
    marginTop: 6,
  },

  // Items Header
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    backgroundColor: MODERN_COLORS.primaryLight,
    borderRadius: MODERN_RADIUS.full,
  },
  addItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },

  // Item Card
  itemCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  itemNameInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginRight: MODERN_SPACING.sm,
  },
  itemInputs: { flexDirection: "row", gap: MODERN_SPACING.sm },
  itemInputCol: { flex: 1 },
  itemTotalCol: { flex: 1.5, alignItems: "flex-end" },
  itemInputLabel: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 4,
  },
  itemInput: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.sm,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ec4899",
    marginTop: 4,
  },

  // Subtotal
  subtotalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fce7f3",
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
  },
  subtotalLabel: { fontSize: 14, fontWeight: "600", color: "#9d174d" },
  subtotalValue: { fontSize: 18, fontWeight: "700", color: "#db2777" },

  // Calculate Button
  calculateBtn: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    marginBottom: MODERN_SPACING.lg,
  },
  calculateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  calculateText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Results
  resultsSection: { marginTop: MODERN_SPACING.md },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.md,
  },
  resultRoomCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  resultRoomHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultRoomIcon: { fontSize: 20 },
  resultRoomName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  resultRoomQuality: { fontSize: 11, color: MODERN_COLORS.textSecondary },
  resultRoomTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ec4899",
    marginTop: MODERN_SPACING.sm,
  },

  // Grand Total
  grandTotalCard: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    marginTop: MODERN_SPACING.md,
    ...MODERN_SHADOWS.lg,
  },
  grandTotalGradient: { padding: MODERN_SPACING.lg, alignItems: "center" },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  grandTotalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  grandTotalMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
});
