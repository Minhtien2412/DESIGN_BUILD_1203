import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Calculator Types
const CALCULATOR_TYPES = [
  { id: "paint", name: "Sơn tường", icon: "color-palette", unit: "lít" },
  { id: "tiles", name: "Gạch lát", icon: "grid", unit: "m²" },
  { id: "wood", name: "Sàn gỗ", icon: "leaf", unit: "m²" },
  { id: "wallpaper", name: "Giấy dán", icon: "document", unit: "cuộn" },
  { id: "concrete", name: "Bê tông", icon: "cube", unit: "m³" },
  { id: "steel", name: "Thép", icon: "barbell", unit: "kg" },
];

// Room Types
const ROOM_TYPES = [
  { id: "living", name: "Phòng khách", avgArea: 25 },
  { id: "bedroom", name: "Phòng ngủ", avgArea: 16 },
  { id: "kitchen", name: "Nhà bếp", avgArea: 12 },
  { id: "bathroom", name: "Phòng tắm", avgArea: 8 },
  { id: "balcony", name: "Ban công", avgArea: 6 },
  { id: "custom", name: "Tùy chỉnh", avgArea: 0 },
];

export default function DesignCalculatorScreen() {
  const { colors, spacing, radius, shadow, screen } = useDS();
  const [selectedCalculator, setSelectedCalculator] = useState("paint");
  const [selectedRoom, setSelectedRoom] = useState("custom");

  // Paint Calculator States
  const [wallLength, setWallLength] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [doorWidth, setDoorWidth] = useState("0.9");
  const [doorHeight, setDoorHeight] = useState("2.1");
  const [windowWidth, setWindowWidth] = useState("1.2");
  const [windowHeight, setWindowHeight] = useState("1.5");
  const [doorCount, setDoorCount] = useState("1");
  const [windowCount, setWindowCount] = useState("2");
  const [coats, setCoats] = useState("2");

  // Tiles Calculator States
  const [floorLength, setFloorLength] = useState("");
  const [floorWidth, setFloorWidth] = useState("");
  const [tileSize, setTileSize] = useState("60");
  const [wastePercent, setWastePercent] = useState("10");

  const currentCalculator = CALCULATOR_TYPES.find(
    (c) => c.id === selectedCalculator,
  );

  const calculatePaint = () => {
    const length = parseFloat(wallLength) || 0;
    const height = parseFloat(wallHeight) || 0;
    const dWidth = parseFloat(doorWidth) || 0;
    const dHeight = parseFloat(doorHeight) || 0;
    const wWidth = parseFloat(windowWidth) || 0;
    const wHeight = parseFloat(windowHeight) || 0;
    const dCount = parseInt(doorCount) || 0;
    const wCount = parseInt(windowCount) || 0;
    const layers = parseInt(coats) || 1;

    // Calculate wall area
    const wallArea = length * height;

    // Calculate openings area
    const doorArea = dWidth * dHeight * dCount;
    const windowArea = wWidth * wHeight * wCount;

    // Net area to paint
    const paintArea = wallArea - doorArea - windowArea;

    // Paint coverage (1 liter covers ~10m² per coat)
    const coverage = 10;
    const paintNeeded = (paintArea * layers) / coverage;

    // Add 10% buffer
    const paintWithBuffer = paintNeeded * 1.1;

    if (paintArea <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng kích thước");
      return;
    }

    Alert.alert(
      "Kết quả tính toán",
      `Diện tích tường: ${wallArea.toFixed(2)} m²\n` +
        `Diện tích cửa: ${(doorArea + windowArea).toFixed(2)} m²\n` +
        `Diện tích cần sơn: ${paintArea.toFixed(2)} m²\n\n` +
        `Số lượng sơn cần: ${paintWithBuffer.toFixed(2)} lít\n` +
        `(Đã tính ${layers} lớp và dự phòng 10%)`,
      [{ text: "OK" }],
    );
  };

  const calculateTiles = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;
    const size = parseFloat(tileSize) || 60;
    const waste = parseFloat(wastePercent) || 10;

    // Floor area in m²
    const floorArea = length * width;

    // Tile area in m²
    const tileAreaCm = size * size;
    const tileAreaM = tileAreaCm / 10000;

    // Number of tiles needed
    const tilesNeeded = floorArea / tileAreaM;

    // Add waste percentage
    const tilesWithWaste = tilesNeeded * (1 + waste / 100);

    if (floorArea <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng kích thước");
      return;
    }

    Alert.alert(
      "Kết quả tính toán",
      `Diện tích sàn: ${floorArea.toFixed(2)} m²\n` +
        `Kích thước gạch: ${size}x${size} cm\n\n` +
        `Số viên gạch cần: ${Math.ceil(tilesWithWaste)} viên\n` +
        `(Đã tính thêm ${waste}% dự phòng)\n\n` +
        `Số m² gạch: ${(Math.ceil(tilesWithWaste) * tileAreaM).toFixed(2)} m²`,
      [{ text: "OK" }],
    );
  };

  const calculateWood = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;
    const waste = parseFloat(wastePercent) || 10;

    const floorArea = length * width;

    // Sàn gỗ thường được bán theo m² (12-15mm thick)
    const woodAreaNeeded = floorArea * (1 + waste / 100);

    // Average cost per m² (example: 500k VND)
    const avgCostPerSqm = 500000;
    const totalCost = woodAreaNeeded * avgCostPerSqm;

    if (floorArea <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng kích thước");
      return;
    }

    Alert.alert(
      "Kết quả tính toán - Sàn gỗ",
      `Diện tích sàn: ${floorArea.toFixed(2)} m²\n\n` +
        `Diện tích gỗ cần: ${woodAreaNeeded.toFixed(2)} m²\n` +
        `(Đã tính thêm ${waste}% dự phòng)\n\n` +
        `Ước tính chi phí: ${totalCost.toLocaleString("vi-VN")} VND\n` +
        `(Giá trung bình 500k/m²)`,
      [{ text: "OK" }],
    );
  };

  const calculateConcrete = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;
    const height = parseFloat(wallHeight) || 2.8; // Default thickness

    const volume = length * width * height;

    // Add 5% waste
    const concreteNeeded = volume * 1.05;

    // Cement bags (30 bags per m³ for M200 concrete)
    const bags = Math.ceil(concreteNeeded * 30);

    // Cost estimation (180k per bag)
    const cost = bags * 180000;

    if (volume <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng kích thước");
      return;
    }

    Alert.alert(
      "Kết quả tính toán - Bê tông",
      `Kích thước: ${length}m × ${width}m × ${height}m\n` +
        `Thể tích: ${volume.toFixed(2)} m³\n\n` +
        `Bê tông cần: ${concreteNeeded.toFixed(2)} m³\n` +
        `(Đã tính thêm 5% dự phòng)\n\n` +
        `Số bao xi măng (M200): ${bags} bao\n` +
        `Ước tính chi phí: ${cost.toLocaleString("vi-VN")} VND`,
      [{ text: "OK" }],
    );
  };

  const calculateSteel = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;

    const area = length * width;
    const spacing = 0.2; // 20cm spacing standard

    // Length bars
    const lengthBars = Math.ceil(width / spacing) * length;

    // Width bars
    const widthBars = Math.ceil(length / spacing) * width;

    const totalLength = lengthBars + widthBars;

    // Weight (10mm rebar = 0.617kg/m)
    const weight = totalLength * 0.617;

    // Cost (18k per kg)
    const cost = weight * 18000;

    if (area <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng kích thước");
      return;
    }

    Alert.alert(
      "Kết quả tính toán - Thép D10",
      `Diện tích đan lưới: ${area.toFixed(2)} m²\n` +
        `Khoảng cách: ${spacing * 100}cm\n\n` +
        `Tổng chiều dài thép: ${totalLength.toFixed(2)} m\n` +
        `Trọng lượng (D10): ${weight.toFixed(2)} kg\n\n` +
        `Ước tính chi phí: ${cost.toLocaleString("vi-VN")} VND\n` +
        `(Giá 18k/kg)`,
      [{ text: "OK" }],
    );
  };

  const calculateWallpaper = () => {
    const length = parseFloat(wallLength) || 0;
    const height = parseFloat(wallHeight) || 0;
    const dWidth = parseFloat(doorWidth) || 0;
    const dHeight = parseFloat(doorHeight) || 0;
    const wWidth = parseFloat(windowWidth) || 0;
    const wHeight = parseFloat(windowHeight) || 0;
    const dCount = parseInt(doorCount) || 0;
    const wCount = parseInt(windowCount) || 0;

    const wallArea = length * height;
    const doorArea = dWidth * dHeight * dCount;
    const windowArea = wWidth * wHeight * wCount;
    const netArea = wallArea - doorArea - windowArea;

    // Standard wallpaper roll: 0.53m × 10m = 5.3m²
    const rollCoverage = 5.3;
    const rollsNeeded = Math.ceil((netArea * 1.1) / rollCoverage); // +10% waste

    // Average cost per roll
    const costPerRoll = 250000;
    const totalCost = rollsNeeded * costPerRoll;

    if (netArea <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng kích thước");
      return;
    }

    Alert.alert(
      "Kết quả tính toán - Giấy dán tường",
      `Diện tích tường: ${wallArea.toFixed(2)} m²\n` +
        `Diện tích cửa: ${(doorArea + windowArea).toFixed(2)} m²\n` +
        `Diện tích cần dán: ${netArea.toFixed(2)} m²\n\n` +
        `Số cuộn giấy cần: ${rollsNeeded} cuộn\n` +
        `(Đã tính thêm 10% dự phòng)\n\n` +
        `Ước tính chi phí: ${totalCost.toLocaleString("vi-VN")} VND\n` +
        `(Giá 250k/cuộn)`,
      [{ text: "OK" }],
    );
  };

  const handleCalculate = () => {
    if (selectedCalculator === "paint") {
      calculatePaint();
    } else if (selectedCalculator === "tiles") {
      calculateTiles();
    } else if (selectedCalculator === "wood") {
      calculateWood();
    } else if (selectedCalculator === "concrete") {
      calculateConcrete();
    } else if (selectedCalculator === "steel") {
      calculateSteel();
    } else if (selectedCalculator === "wallpaper") {
      calculateWallpaper();
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    const room = ROOM_TYPES.find((r) => r.id === roomId);
    if (room && room.avgArea > 0) {
      // Auto-fill approximate dimensions
      const sideLength = Math.sqrt(room.avgArea);
      setFloorLength(sideLength.toFixed(1));
      setFloorWidth(sideLength.toFixed(1));
      setWallLength((sideLength * 4).toFixed(1));
    }
  };

  // Helper: input style
  const inputStyle = {
    backgroundColor: colors.bgInput,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  } as const;

  // Helper: selector button
  const selectorBtn = (active: boolean) => ({
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: active ? colors.primary : colors.bgMuted,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Máy tính thiết kế",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            alignItems: "center",
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.xl,
          }}
        >
          <Ionicons name="calculator" size={40} color={colors.textInverse} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.textInverse,
              marginTop: spacing.lg,
            }}
          >
            Tính toán vật liệu xây dựng
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.9)",
              marginTop: 4,
            }}
          >
            Nhanh chóng & chính xác
          </Text>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Calculator Type Selector */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: spacing.xl,
              marginTop: spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: spacing.xl,
              }}
            >
              Chọn loại tính toán
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.lg,
              }}
            >
              {CALCULATOR_TYPES.map((calc) => (
                <TouchableOpacity
                  key={calc.id}
                  style={{
                    width: (screen.width - spacing.xl * 2 - spacing.lg * 2) / 3,
                    aspectRatio: 1,
                    backgroundColor:
                      selectedCalculator === calc.id
                        ? colors.primary
                        : colors.card,
                    borderRadius: radius.md,
                    borderWidth: 2,
                    borderColor:
                      selectedCalculator === calc.id
                        ? colors.primary
                        : colors.border,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: spacing.sm,
                  }}
                  onPress={() => setSelectedCalculator(calc.id)}
                >
                  <Ionicons
                    name={calc.icon as any}
                    size={32}
                    color={
                      selectedCalculator === calc.id
                        ? colors.textInverse
                        : colors.primary
                    }
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        selectedCalculator === calc.id
                          ? colors.textInverse
                          : colors.text,
                      marginTop: spacing.sm,
                      textAlign: "center",
                    }}
                  >
                    {calc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Room Type Quick Select */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: spacing.xl,
              marginTop: spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: spacing.xl,
              }}
            >
              Chọn nhanh theo phòng
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {ROOM_TYPES.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={{
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.sm,
                    borderRadius: 20,
                    backgroundColor:
                      selectedRoom === room.id
                        ? colors.primaryBg
                        : colors.bgMuted,
                    borderWidth: 1,
                    borderColor:
                      selectedRoom === room.id
                        ? colors.primary
                        : colors.bgMuted,
                  }}
                  onPress={() => handleRoomSelect(room.id)}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: selectedRoom === room.id ? "600" : "500",
                      color:
                        selectedRoom === room.id
                          ? colors.primary
                          : colors.textSecondary,
                    }}
                  >
                    {room.name}
                  </Text>
                  {room.avgArea > 0 && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.textTertiary,
                        marginTop: 2,
                      }}
                    >
                      ~{room.avgArea}m²
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Paint Calculator */}
          {selectedCalculator === "paint" && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: spacing.xl,
                marginTop: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: spacing.xl,
                }}
              >
                Thông số tường cần sơn
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều dài tường (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 10"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={wallLength}
                  onChangeText={setWallLength}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều cao tường (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 2.8"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={wallHeight}
                  onChangeText={setWallHeight}
                />
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginTop: spacing.xl,
                  marginBottom: spacing.lg,
                }}
              >
                Cửa ra vào
              </Text>

              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    marginRight: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Rộng (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="0.9"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={doorWidth}
                    onChangeText={setDoorWidth}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Cao (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="2.1"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={doorHeight}
                    onChangeText={setDoorHeight}
                  />
                </View>
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Số lượng cửa
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="1"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={doorCount}
                  onChangeText={setDoorCount}
                />
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginTop: spacing.xl,
                  marginBottom: spacing.lg,
                }}
              >
                Cửa sổ
              </Text>

              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    marginRight: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Rộng (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="1.2"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={windowWidth}
                    onChangeText={setWindowWidth}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Cao (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="1.5"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={windowHeight}
                    onChangeText={setWindowHeight}
                  />
                </View>
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Số lượng cửa sổ
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="2"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={windowCount}
                  onChangeText={setWindowCount}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Số lớp sơn
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  {["1", "2", "3"].map((coat) => (
                    <TouchableOpacity
                      key={coat}
                      style={selectorBtn(coats === coat)}
                      onPress={() => setCoats(coat)}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color:
                            coats === coat
                              ? colors.textInverse
                              : colors.textSecondary,
                        }}
                      >
                        {coat} lớp
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Tiles Calculator */}
          {selectedCalculator === "tiles" && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: spacing.xl,
                marginTop: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: spacing.xl,
                }}
              >
                Thông số sàn cần lát
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều dài sàn (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 5"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều rộng sàn (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 4"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Kích thước gạch (cm)
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  {["30", "40", "60", "80"].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={selectorBtn(tileSize === size)}
                      onPress={() => setTileSize(size)}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            tileSize === size
                              ? colors.textInverse
                              : colors.textSecondary,
                        }}
                      >
                        {size}x{size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Dự phòng thất thoát (%)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="10"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={wastePercent}
                  onChangeText={setWastePercent}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textTertiary,
                    marginTop: 4,
                  }}
                >
                  Khuyến nghị: 10-15%
                </Text>
              </View>
            </View>
          )}

          {/* Wood Calculator */}
          {selectedCalculator === "wood" && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: spacing.xl,
                marginTop: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: spacing.xl,
                }}
              >
                Thông số sàn gỗ
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều dài sàn (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 5"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều rộng sàn (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 4"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Dự phòng thất thoát (%)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="10"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={wastePercent}
                  onChangeText={setWastePercent}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textTertiary,
                    marginTop: 4,
                  }}
                >
                  Khuyến nghị: 10-15%
                </Text>
              </View>
            </View>
          )}

          {/* Wallpaper Calculator */}
          {selectedCalculator === "wallpaper" && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: spacing.xl,
                marginTop: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: spacing.xl,
                }}
              >
                Thông số tường cần dán
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều dài tường (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 10"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={wallLength}
                  onChangeText={setWallLength}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều cao tường (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 2.8"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={wallHeight}
                  onChangeText={setWallHeight}
                />
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginTop: spacing.xl,
                  marginBottom: spacing.lg,
                }}
              >
                Cửa ra vào
              </Text>

              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    marginRight: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Rộng (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="0.9"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={doorWidth}
                    onChangeText={setDoorWidth}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Cao (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="2.1"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={doorHeight}
                    onChangeText={setDoorHeight}
                  />
                </View>
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Số lượng cửa
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="1"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={doorCount}
                  onChangeText={setDoorCount}
                />
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginTop: spacing.xl,
                  marginBottom: spacing.lg,
                }}
              >
                Cửa sổ
              </Text>

              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    marginRight: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Rộng (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="1.2"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={windowWidth}
                    onChangeText={setWindowWidth}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: spacing.sm,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Cao (m)
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="1.5"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={windowHeight}
                    onChangeText={setWindowHeight}
                  />
                </View>
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Số lượng cửa sổ
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="2"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={windowCount}
                  onChangeText={setWindowCount}
                />
              </View>
            </View>
          )}

          {/* Concrete Calculator */}
          {selectedCalculator === "concrete" && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: spacing.xl,
                marginTop: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: spacing.xl,
                }}
              >
                Thông số móng/sàn bê tông
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều dài (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 5"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều rộng (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 3"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Độ dày/Chiều cao (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 0.3"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={wallHeight}
                  onChangeText={setWallHeight}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textTertiary,
                    marginTop: 4,
                  }}
                >
                  Móng: 0.2-0.5m, Sàn: 0.1-0.15m
                </Text>
              </View>
            </View>
          )}

          {/* Steel Calculator */}
          {selectedCalculator === "steel" && (
            <View
              style={{
                backgroundColor: colors.card,
                padding: spacing.xl,
                marginTop: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: spacing.xl,
                }}
              >
                Thông số lưới thép
              </Text>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều dài lưới (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 10"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: spacing.sm,
                  }}
                >
                  Chiều rộng lưới (m)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 8"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={{ marginBottom: spacing.xl }}>
                <Text style={{ fontSize: 11, color: colors.textTertiary }}>
                  Mặc định: D10 (Φ10mm), khoảng cách 20cm
                </Text>
              </View>
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              marginHorizontal: spacing.xl,
              marginTop: spacing.xxl,
              paddingVertical: spacing.xl,
              borderRadius: radius.md,
              gap: spacing.sm,
              ...shadow.md,
            }}
            onPress={handleCalculate}
          >
            <Ionicons name="calculator" size={24} color={colors.textInverse} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.textInverse,
              }}
            >
              Tính toán ngay
            </Text>
          </TouchableOpacity>

          {/* Tips */}
          <View
            style={{
              backgroundColor: colors.warningBg,
              margin: spacing.xl,
              padding: spacing.xl,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.warning,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: spacing.lg,
                gap: spacing.sm,
              }}
            >
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: colors.text }}
              >
                Mẹo hữu ích
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: spacing.sm,
                gap: spacing.sm,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                Luôn tính thêm 10-15% vật liệu dự phòng cho thất thoát
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: spacing.sm,
                gap: spacing.sm,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                Đo kỹ kích thước trước khi đặt mua để tránh lãng phí
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: spacing.sm,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                Tham khảo ý kiến chuyên gia nếu công trình phức tạp
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}
