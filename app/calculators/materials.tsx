/**
 * Materials Calculator - Tính Vật liệu chi tiết
 * Detailed material calculation with editable formulas
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

// Material categories
const MATERIAL_CATEGORIES = [
  { id: "brick", icon: "🧱", label: "Gạch xây", color: "#ef4444" },
  { id: "cement", icon: "📦", label: "Xi măng", color: "#6b7280" },
  { id: "sand", icon: "⏳", label: "Cát", color: "#f59e0b" },
  { id: "steel", icon: "🔩", label: "Sắt thép", color: "#3b82f6" },
  { id: "stone", icon: "🪨", label: "Đá", color: "#8b5cf6" },
];

// Default material specifications
const DEFAULT_SPECS = {
  // Brick specs
  brick: {
    label: "Gạch xây",
    unit: "viên",
    variants: [
      {
        id: "4x8x18",
        name: "Gạch 4 lỗ (4x8x18)",
        qtyPerM2: 68,
        price: 850,
        wastage: 5,
      },
      {
        id: "6x10x22",
        name: "Gạch 6 lỗ (6x10x22)",
        qtyPerM2: 45,
        price: 1200,
        wastage: 5,
      },
      {
        id: "blockD10",
        name: "Gạch block D10",
        qtyPerM2: 12.5,
        price: 5500,
        wastage: 3,
      },
      {
        id: "blockD15",
        name: "Gạch block D15",
        qtyPerM2: 12.5,
        price: 7500,
        wastage: 3,
      },
    ],
  },
  // Cement specs
  cement: {
    label: "Xi măng",
    unit: "bao (50kg)",
    variants: [
      { id: "pcb40", name: "Xi măng PCB40", pricePerBag: 95000, wastage: 3 },
      { id: "pc50", name: "Xi măng PC50", pricePerBag: 105000, wastage: 3 },
    ],
    // Usage per m³ of mortar/concrete
    usageRates: {
      mortarM75: { cement: 4.5, sand: 1.1 }, // per m³ vữa xây
      mortarM100: { cement: 5.5, sand: 1.05 }, // per m³ vữa xây
      concreteM200: { cement: 7.5, sand: 0.5, stone: 0.85 }, // per m³ bê tông
      concreteM250: { cement: 8.5, sand: 0.48, stone: 0.82 }, // per m³ bê tông
      concreteM300: { cement: 9.5, sand: 0.46, stone: 0.8 }, // per m³ bê tông
    },
  },
  // Sand specs
  sand: {
    label: "Cát",
    unit: "m³",
    variants: [
      {
        id: "yellow",
        name: "Cát vàng (xây trát)",
        pricePerM3: 350000,
        wastage: 5,
      },
      { id: "concrete", name: "Cát bê tông", pricePerM3: 320000, wastage: 5 },
      { id: "san", name: "Cát san lấp", pricePerM3: 180000, wastage: 3 },
    ],
  },
  // Stone specs
  stone: {
    label: "Đá",
    unit: "m³",
    variants: [
      { id: "1x2", name: "Đá 1x2", pricePerM3: 380000, wastage: 5 },
      { id: "2x4", name: "Đá 2x4", pricePerM3: 350000, wastage: 5 },
      { id: "4x6", name: "Đá 4x6", pricePerM3: 320000, wastage: 5 },
      { id: "base", name: "Đá base", pricePerM3: 280000, wastage: 3 },
    ],
  },
  // Steel specs
  steel: {
    label: "Thép",
    unit: "kg",
    variants: [
      { id: "d6", name: "Thép D6", pricePerKg: 17000, kgPerM: 0.222 },
      { id: "d8", name: "Thép D8", pricePerKg: 17000, kgPerM: 0.395 },
      { id: "d10", name: "Thép D10", pricePerKg: 16500, kgPerM: 0.617 },
      { id: "d12", name: "Thép D12", pricePerKg: 16500, kgPerM: 0.888 },
      { id: "d14", name: "Thép D14", pricePerKg: 16000, kgPerM: 1.21 },
      { id: "d16", name: "Thép D16", pricePerKg: 16000, kgPerM: 1.58 },
      { id: "d18", name: "Thép D18", pricePerKg: 15500, kgPerM: 2.0 },
      { id: "d20", name: "Thép D20", pricePerKg: 15500, kgPerM: 2.47 },
      { id: "d22", name: "Thép D22", pricePerKg: 15500, kgPerM: 2.98 },
      { id: "d25", name: "Thép D25", pricePerKg: 15500, kgPerM: 3.85 },
    ],
  },
};

type CalculatorMode = "brick" | "mortar" | "concrete" | "steel";

export default function MaterialsCalculatorScreen() {
  const insets = useSafeAreaInsets();

  // Mode
  const [mode, setMode] = useState<CalculatorMode>("brick");

  // Brick calculator
  const [wallArea, setWallArea] = useState("");
  const [selectedBrick, setSelectedBrick] = useState("4x8x18");
  const [brickWastage, setBrickWastage] = useState("5");

  // Mortar calculator
  const [mortarVolume, setMortarVolume] = useState("");
  const [mortarType, setMortarType] = useState("mortarM100");

  // Concrete calculator
  const [concreteVolume, setConcreteVolume] = useState("");
  const [concreteGrade, setConcreteGrade] = useState("concreteM250");

  // Steel calculator
  const [steelLength, setSteelLength] = useState("");
  const [selectedSteel, setSelectedSteel] = useState("d10");
  const [steelQty, setSteelQty] = useState("1");

  // Prices (editable)
  const [brickPrice, setBrickPrice] = useState("850");
  const [cementPrice, setCementPrice] = useState("95000");
  const [sandPrice, setSandPrice] = useState("350000");
  const [stonePrice, setStonePrice] = useState("380000");
  const [steelPrice, setSteelPrice] = useState("16500");

  // Show results
  const [showResults, setShowResults] = useState(false);

  // Calculation types
  type BrickCalc = {
    type: "brick";
    area: number;
    rawQty: number;
    wastage: number;
    totalQty: number;
    price: number;
    totalCost: number;
    mortarNeeded: number;
    cementForMortar: number;
    sandForMortar: number;
  };

  type MortarCalc = {
    type: "mortar";
    volume: number;
    mortarType: string;
    cementBags: number;
    sandM3: number;
    cementCost: number;
    sandCost: number;
    totalCost: number;
  };

  type ConcreteCalc = {
    type: "concrete";
    volume: number;
    concreteGrade: string;
    cementBags: number;
    sandM3: number;
    stoneM3: number;
    cementCost: number;
    sandCost: number;
    stoneCost: number;
    totalCost: number;
  };

  type SteelCalc = {
    type: "steel";
    length: number;
    qty: number;
    diameter: string;
    kgPerM: number;
    totalLength: number;
    totalKg: number;
    price: number;
    totalCost: number;
  };

  type Calculations = BrickCalc | MortarCalc | ConcreteCalc | SteelCalc | null;

  // Calculations based on mode
  const calculations: Calculations = useMemo(() => {
    if (mode === "brick") {
      const area = parseFloat(wallArea) || 0;
      const wastage = parseFloat(brickWastage) || 5;
      const brickData = DEFAULT_SPECS.brick.variants.find(
        (v) => v.id === selectedBrick,
      );
      const qtyPerM2 = brickData?.qtyPerM2 || 68;
      const price = parseFloat(brickPrice) || brickData?.price || 850;

      const rawQty = Math.ceil(area * qtyPerM2);
      const totalQty = Math.ceil(rawQty * (1 + wastage / 100));
      const totalCost = totalQty * price;

      // Mortar for brick laying (approx 0.03 m³/m² wall)
      const mortarNeeded = area * 0.03;
      const cementForMortar = mortarNeeded * 5; // bags
      const sandForMortar = mortarNeeded * 1.1; // m³

      return {
        type: "brick",
        area,
        rawQty,
        wastage,
        totalQty,
        price,
        totalCost,
        mortarNeeded,
        cementForMortar,
        sandForMortar,
      };
    }

    if (mode === "mortar") {
      const volume = parseFloat(mortarVolume) || 0;
      const rates =
        DEFAULT_SPECS.cement.usageRates[
          mortarType as keyof typeof DEFAULT_SPECS.cement.usageRates
        ];
      const cementBags = volume * (rates?.cement || 5);
      const sandM3 = volume * (rates?.sand || 1.1);

      const cPrice = parseFloat(cementPrice) || 95000;
      const sPrice = parseFloat(sandPrice) || 350000;

      const cementCost = Math.ceil(cementBags) * cPrice;
      const sandCost = sandM3 * sPrice;
      const totalCost = cementCost + sandCost;

      return {
        type: "mortar",
        volume,
        mortarType,
        cementBags,
        sandM3,
        cementCost,
        sandCost,
        totalCost,
      };
    }

    if (mode === "concrete") {
      const volume = parseFloat(concreteVolume) || 0;
      const rates =
        DEFAULT_SPECS.cement.usageRates[
          concreteGrade as keyof typeof DEFAULT_SPECS.cement.usageRates
        ];
      const cementBags = volume * (rates?.cement || 8);
      const sandM3 = volume * (rates?.sand || 0.5);
      const stoneM3 = volume * ((rates as any)?.stone || 0.85);

      const cPrice = parseFloat(cementPrice) || 95000;
      const sPrice = parseFloat(sandPrice) || 350000;
      const stPrice = parseFloat(stonePrice) || 380000;

      const cementCost = Math.ceil(cementBags) * cPrice;
      const sandCost = sandM3 * sPrice;
      const stoneCost = stoneM3 * stPrice;
      const totalCost = cementCost + sandCost + stoneCost;

      return {
        type: "concrete",
        volume,
        concreteGrade,
        cementBags,
        sandM3,
        stoneM3,
        cementCost,
        sandCost,
        stoneCost,
        totalCost,
      };
    }

    if (mode === "steel") {
      const length = parseFloat(steelLength) || 0;
      const qty = parseInt(steelQty) || 1;
      const steelData = DEFAULT_SPECS.steel.variants.find(
        (v) => v.id === selectedSteel,
      );
      const kgPerM = steelData?.kgPerM || 0.617;
      const price = parseFloat(steelPrice) || steelData?.pricePerKg || 16500;

      const totalLength = length * qty;
      const totalKg = totalLength * kgPerM;
      const totalCost = totalKg * price;

      return {
        type: "steel",
        length,
        qty,
        diameter: selectedSteel,
        kgPerM,
        totalLength,
        totalKg,
        price,
        totalCost,
      };
    }

    return null;
  }, [
    mode,
    wallArea,
    selectedBrick,
    brickWastage,
    brickPrice,
    mortarVolume,
    mortarType,
    concreteVolume,
    concreteGrade,
    steelLength,
    selectedSteel,
    steelQty,
    cementPrice,
    sandPrice,
    stonePrice,
    steelPrice,
  ]);

  const handleBack = useCallback(() => router.back(), []);

  const handleCalculate = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowResults(true);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)} triệu`;
    }
    return `${amount.toLocaleString("vi-VN")} đ`;
  };

  const renderBrickCalculator = () => (
    <View style={styles.calculatorSection}>
      <Text style={styles.calcTitle}>🧱 Tính số lượng gạch xây tường</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Diện tích tường (m²)</Text>
        <TextInput
          style={styles.input}
          value={wallArea}
          onChangeText={setWallArea}
          placeholder="VD: 100"
          placeholderTextColor={MODERN_COLORS.textTertiary}
          keyboardType="decimal-pad"
        />
      </View>

      <Text style={styles.inputLabel}>Loại gạch</Text>
      <View style={styles.optionGrid}>
        {DEFAULT_SPECS.brick.variants.map((brick) => (
          <TouchableOpacity
            key={brick.id}
            style={[
              styles.optionCard,
              selectedBrick === brick.id && styles.optionCardActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedBrick(brick.id);
              setBrickPrice(brick.price.toString());
            }}
          >
            <Text style={styles.optionName}>{brick.name}</Text>
            <Text style={styles.optionDetail}>{brick.qtyPerM2} viên/m²</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Hao hụt (%)</Text>
          <TextInput
            style={styles.input}
            value={brickWastage}
            onChangeText={setBrickWastage}
            placeholder="5"
            placeholderTextColor={MODERN_COLORS.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Đơn giá (đ/viên)</Text>
          <TextInput
            style={styles.input}
            value={brickPrice}
            onChangeText={setBrickPrice}
            placeholder="850"
            placeholderTextColor={MODERN_COLORS.textTertiary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {showResults && calculations?.type === "brick" && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>📊 Kết quả</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Số gạch (chưa hao hụt)</Text>
            <Text style={styles.resultValue}>
              {calculations.rawQty.toLocaleString()} viên
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>
              Hao hụt {calculations.wastage}%
            </Text>
            <Text style={styles.resultValue}>
              +{(calculations.totalQty - calculations.rawQty).toLocaleString()}{" "}
              viên
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tổng số gạch cần mua</Text>
            <Text style={[styles.resultValue, styles.resultHighlight]}>
              {calculations.totalQty.toLocaleString()} viên
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chi phí gạch</Text>
            <Text style={[styles.resultValue, styles.resultPrimary]}>
              {formatCurrency(calculations.totalCost)}
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <Text style={styles.resultNote}>Vữa xây kèm theo:</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Xi măng</Text>
            <Text style={styles.resultValue}>
              ~{Math.ceil(calculations.cementForMortar)} bao
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Cát vàng</Text>
            <Text style={styles.resultValue}>
              ~{calculations.sandForMortar.toFixed(2)} m³
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderMortarCalculator = () => (
    <View style={styles.calculatorSection}>
      <Text style={styles.calcTitle}>📦 Tính vữa xây/trát</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Thể tích vữa (m³)</Text>
        <TextInput
          style={styles.input}
          value={mortarVolume}
          onChangeText={setMortarVolume}
          placeholder="VD: 5"
          placeholderTextColor={MODERN_COLORS.textTertiary}
          keyboardType="decimal-pad"
        />
      </View>

      <Text style={styles.inputLabel}>Mác vữa</Text>
      <View style={styles.optionRow}>
        {[
          { id: "mortarM75", name: "Vữa M75" },
          { id: "mortarM100", name: "Vữa M100" },
        ].map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionBtn,
              mortarType === type.id && styles.optionBtnActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMortarType(type.id);
            }}
          >
            <Text
              style={[
                styles.optionBtnText,
                mortarType === type.id && styles.optionBtnTextActive,
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Giá xi măng (đ/bao)</Text>
          <TextInput
            style={styles.input}
            value={cementPrice}
            onChangeText={setCementPrice}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Giá cát (đ/m³)</Text>
          <TextInput
            style={styles.input}
            value={sandPrice}
            onChangeText={setSandPrice}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {showResults && calculations?.type === "mortar" && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>
            📊 Kết quả cho {calculations.volume} m³ vữa
          </Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Xi măng</Text>
            <Text style={styles.resultValue}>
              {Math.ceil(calculations.cementBags)} bao
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Cát vàng</Text>
            <Text style={styles.resultValue}>
              {calculations.sandM3.toFixed(2)} m³
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chi phí xi măng</Text>
            <Text style={styles.resultValue}>
              {formatCurrency(calculations.cementCost)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chi phí cát</Text>
            <Text style={styles.resultValue}>
              {formatCurrency(calculations.sandCost)}
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tổng chi phí</Text>
            <Text style={[styles.resultValue, styles.resultPrimary]}>
              {formatCurrency(calculations.totalCost)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderConcreteCalculator = () => (
    <View style={styles.calculatorSection}>
      <Text style={styles.calcTitle}>🏗️ Tính bê tông</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Thể tích bê tông (m³)</Text>
        <TextInput
          style={styles.input}
          value={concreteVolume}
          onChangeText={setConcreteVolume}
          placeholder="VD: 10"
          placeholderTextColor={MODERN_COLORS.textTertiary}
          keyboardType="decimal-pad"
        />
      </View>

      <Text style={styles.inputLabel}>Mác bê tông</Text>
      <View style={styles.optionRow}>
        {[
          { id: "concreteM200", name: "M200" },
          { id: "concreteM250", name: "M250" },
          { id: "concreteM300", name: "M300" },
        ].map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionBtn,
              concreteGrade === type.id && styles.optionBtnActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setConcreteGrade(type.id);
            }}
          >
            <Text
              style={[
                styles.optionBtnText,
                concreteGrade === type.id && styles.optionBtnTextActive,
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputThird}>
          <Text style={styles.inputLabel}>Xi măng (đ/bao)</Text>
          <TextInput
            style={styles.input}
            value={cementPrice}
            onChangeText={setCementPrice}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.inputThird}>
          <Text style={styles.inputLabel}>Cát (đ/m³)</Text>
          <TextInput
            style={styles.input}
            value={sandPrice}
            onChangeText={setSandPrice}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.inputThird}>
          <Text style={styles.inputLabel}>Đá (đ/m³)</Text>
          <TextInput
            style={styles.input}
            value={stonePrice}
            onChangeText={setStonePrice}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {showResults && calculations?.type === "concrete" && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>
            📊 Kết quả cho {calculations.volume} m³ bê tông
          </Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Xi măng</Text>
            <Text style={styles.resultValue}>
              {Math.ceil(calculations.cementBags)} bao
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Cát</Text>
            <Text style={styles.resultValue}>
              {calculations.sandM3.toFixed(2)} m³
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Đá 1x2</Text>
            <Text style={styles.resultValue}>
              {calculations.stoneM3.toFixed(2)} m³
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chi phí xi măng</Text>
            <Text style={styles.resultValue}>
              {formatCurrency(calculations.cementCost)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chi phí cát</Text>
            <Text style={styles.resultValue}>
              {formatCurrency(calculations.sandCost)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chi phí đá</Text>
            <Text style={styles.resultValue}>
              {formatCurrency(calculations.stoneCost)}
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tổng chi phí vật liệu</Text>
            <Text style={[styles.resultValue, styles.resultPrimary]}>
              {formatCurrency(calculations.totalCost)}
            </Text>
          </View>
          <Text style={styles.resultNote}>
            * Chưa bao gồm thép và nhân công đổ bê tông
          </Text>
        </View>
      )}
    </View>
  );

  const renderSteelCalculator = () => (
    <View style={styles.calculatorSection}>
      <Text style={styles.calcTitle}>🔩 Tính thép</Text>

      <Text style={styles.inputLabel}>Đường kính thép</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.steelList}
      >
        {DEFAULT_SPECS.steel.variants.map((steel) => (
          <TouchableOpacity
            key={steel.id}
            style={[
              styles.steelBtn,
              selectedSteel === steel.id && styles.steelBtnActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedSteel(steel.id);
              setSteelPrice(steel.pricePerKg.toString());
            }}
          >
            <Text
              style={[
                styles.steelBtnText,
                selectedSteel === steel.id && styles.steelBtnTextActive,
              ]}
            >
              {steel.name.replace("Thép ", "")}
            </Text>
            <Text style={styles.steelBtnMeta}>{steel.kgPerM} kg/m</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Chiều dài (m)</Text>
          <TextInput
            style={styles.input}
            value={steelLength}
            onChangeText={setSteelLength}
            placeholder="VD: 11.7"
            placeholderTextColor={MODERN_COLORS.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Số lượng (cây)</Text>
          <TextInput
            style={styles.input}
            value={steelQty}
            onChangeText={setSteelQty}
            placeholder="1"
            placeholderTextColor={MODERN_COLORS.textTertiary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Đơn giá (đ/kg)</Text>
        <TextInput
          style={styles.input}
          value={steelPrice}
          onChangeText={setSteelPrice}
          placeholder="16500"
          placeholderTextColor={MODERN_COLORS.textTertiary}
          keyboardType="number-pad"
        />
      </View>

      {showResults && calculations?.type === "steel" && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>📊 Kết quả</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Đường kính</Text>
            <Text style={styles.resultValue}>
              {calculations.diameter.toUpperCase()}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tổng chiều dài</Text>
            <Text style={styles.resultValue}>
              {calculations.totalLength.toFixed(1)} m
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Khối lượng/m</Text>
            <Text style={styles.resultValue}>{calculations.kgPerM} kg/m</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tổng khối lượng</Text>
            <Text style={[styles.resultValue, styles.resultHighlight]}>
              {calculations.totalKg.toFixed(2)} kg
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Chi phí thép</Text>
            <Text style={[styles.resultValue, styles.resultPrimary]}>
              {formatCurrency(calculations.totalCost)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📦 Tính Vật liệu</Text>
          <Text style={styles.headerSubtitle}>Gạch, xi măng, cát, thép</Text>
        </View>
      </View>

      {/* Mode Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {[
            { id: "brick", label: "🧱 Gạch" },
            { id: "mortar", label: "📦 Vữa" },
            { id: "concrete", label: "🏗️ Bê tông" },
            { id: "steel", label: "🔩 Thép" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, mode === tab.id && styles.tabActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMode(tab.id as CalculatorMode);
                setShowResults(false);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          {mode === "brick" && renderBrickCalculator()}
          {mode === "mortar" && renderMortarCalculator()}
          {mode === "concrete" && renderConcreteCalculator()}
          {mode === "steel" && renderSteelCalculator()}

          {/* Calculate Button */}
          <TouchableOpacity
            style={styles.calculateBtn}
            onPress={handleCalculate}
          >
            <LinearGradient
              colors={["#6366f1", "#4f46e5"]}
              style={styles.calculateGradient}
            >
              <Ionicons name="calculator" size={22} color="#fff" />
              <Text style={styles.calculateText}>Tính toán</Text>
            </LinearGradient>
          </TouchableOpacity>

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

  // Tabs
  tabsContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  tabs: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
  },
  tab: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
  },
  tabActive: { backgroundColor: MODERN_COLORS.primary },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  tabTextActive: { color: "#fff" },

  // Calculator Section
  calculatorSection: { marginBottom: MODERN_SPACING.lg },
  calcTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.md,
  },

  // Inputs
  inputGroup: { marginBottom: MODERN_SPACING.md },
  inputLabel: {
    fontSize: 13,
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
  inputRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  inputHalf: { flex: 1 },
  inputThird: { flex: 1 },

  // Options
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  optionCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardActive: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.primaryLight,
  },
  optionName: { fontSize: 13, fontWeight: "600", color: MODERN_COLORS.text },
  optionDetail: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  optionRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionBtnActive: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.primaryLight,
  },
  optionBtnText: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  optionBtnTextActive: { color: MODERN_COLORS.primary },

  // Steel list
  steelList: { gap: MODERN_SPACING.sm, marginBottom: MODERN_SPACING.md },
  steelBtn: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 70,
  },
  steelBtnActive: { borderColor: "#3b82f6", backgroundColor: "#dbeafe" },
  steelBtnText: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  steelBtnTextActive: { color: "#2563eb" },
  steelBtnMeta: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  // Result Box
  resultBox: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.md,
    ...MODERN_SHADOWS.md,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.sm,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  resultLabel: { fontSize: 13, color: MODERN_COLORS.textSecondary },
  resultValue: { fontSize: 14, fontWeight: "600", color: MODERN_COLORS.text },
  resultHighlight: { color: "#f59e0b" },
  resultPrimary: { color: MODERN_COLORS.primary, fontSize: 16 },
  resultDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginVertical: MODERN_SPACING.sm,
  },
  resultNote: {
    fontSize: 11,
    color: MODERN_COLORS.textTertiary,
    marginTop: MODERN_SPACING.sm,
    fontStyle: "italic",
  },

  // Calculate Button
  calculateBtn: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    marginTop: MODERN_SPACING.md,
  },
  calculateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  calculateText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
