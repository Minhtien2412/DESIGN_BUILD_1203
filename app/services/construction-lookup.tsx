import { DSCard } from "@/components/ds";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Mock data - Construction standards and prices
const MATERIAL_STANDARDS = [
  {
    id: 1,
    category: "Xi măng",
    items: [
      {
        name: "Xi măng PCB40",
        unit: "kg",
        standard: "350-400 kg/m³ bê tông",
        description: "Dùng cho công trình dân dụng, móng, cột, dầm",
      },
      {
        name: "Xi măng PCB30",
        unit: "kg",
        standard: "300-350 kg/m³ bê tông",
        description: "Dùng cho tường, sàn, công trình nhẹ",
      },
    ],
  },
  {
    id: 2,
    category: "Cát",
    items: [
      {
        name: "Cát vàng",
        unit: "m³",
        standard: "0.4-0.5 m³/m³ bê tông",
        description: "Cát sông, hạt vừa, không lẫn bùn đất",
      },
      {
        name: "Cát xây",
        unit: "m³",
        standard: "1.2-1.4 m³/100m² tường",
        description: "Dùng xây tường, trát",
      },
    ],
  },
  {
    id: 3,
    category: "Đá",
    items: [
      {
        name: "Đá 1x2",
        unit: "m³",
        standard: "0.8-0.9 m³/m³ bê tông",
        description: "Dùng đổ bê tông móng, cột, dầm, sàn",
      },
      {
        name: "Đá 4x6",
        unit: "m³",
        standard: "0.6-0.7 m³/m³ bê tông",
        description: "Dùng đổ bê tông nhẹ, lót móng",
      },
    ],
  },
];

const LABOR_PRICES = [
  {
    id: 1,
    category: "Thợ xây",
    items: [
      {
        name: "Xây tường gạch",
        unit: "m²",
        price: "80.000 - 120.000₫",
        region: "Miền Bắc",
        note: "Giá tùy độ dày tường và loại gạch",
      },
      {
        name: "Xây tường gạch",
        unit: "m²",
        price: "100.000 - 150.000₫",
        region: "Miền Nam",
        note: "Bao gồm vật tư phụ, không bao xi măng cát",
      },
      {
        name: "Trát tường",
        unit: "m²",
        price: "40.000 - 60.000₫",
        region: "Toàn quốc",
        note: "Trát 2 lớp, bóng láng",
      },
    ],
  },
  {
    id: 2,
    category: "Thợ coffa",
    items: [
      {
        name: "Đóng ván khuôn móng",
        unit: "m²",
        price: "80.000 - 100.000₫",
        region: "Toàn quốc",
        note: "Bao công cả tháo dỡ",
      },
      {
        name: "Đóng ván khuôn cột",
        unit: "m²",
        price: "100.000 - 120.000₫",
        region: "Toàn quốc",
        note: "Công tác phức tạp hơn móng",
      },
    ],
  },
  {
    id: 3,
    category: "Thợ điện nước",
    items: [
      {
        name: "Lắp đặt điện",
        unit: "điểm",
        price: "150.000 - 200.000₫",
        region: "Toàn quốc",
        note: "Bao gồm đục rãnh, luồn dây, lắp đặt",
      },
      {
        name: "Lắp đặt nước",
        unit: "điểm",
        price: "200.000 - 250.000₫",
        region: "Toàn quốc",
        note: "Ống PPR, bao thử áp",
      },
    ],
  },
];

const BUILDING_CODES = [
  {
    id: 1,
    code: "TCVN 2737:1995",
    title: "Tải trọng và tác động - Tiêu chuẩn thiết kế",
    category: "Kết cấu",
    description:
      "Quy định về tĩnh tải, hoạt tải, tải trọng gió, động đất cho thiết kế công trình",
  },
  {
    id: 2,
    code: "TCXDVN 356:2005",
    title: "Kết cấu bê tông và bê tông cốt thép",
    category: "Kết cấu",
    description: "Tiêu chuẩn thiết kế kết cấu bê tông cốt thép",
  },
  {
    id: 3,
    code: "QCVN 06:2021",
    title: "Quy chuẩn an toàn cháy cho nhà và công trình",
    category: "PCCC",
    description: "Yêu cầu về phòng cháy chữa cháy, lối thoát hiểm",
  },
  {
    id: 4,
    code: "TCXDVN 362:2005",
    title: "Quy hoạch xây dựng - Đô thị",
    category: "Quy hoạch",
    description: "Tiêu chuẩn về mật độ xây dựng, tỷ lệ xây dựng, chiều cao",
  },
];

const TABS = [
  { id: "area", name: "Tính diện tích", icon: "calculator-outline" },
  { id: "standards", name: "Định mức", icon: "document-text-outline" },
  { id: "prices", name: "Giá nhân công", icon: "cash-outline" },
  { id: "codes", name: "Quy chuẩn", icon: "book-outline" },
];

interface AccordionItemProps {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  item,
  isExpanded,
  onToggle,
}) => {
  const { colors, spacing, radius, text: textStyles, shadow } = useDS();
  return (
    <DSCard
      variant="elevated"
      style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm }}
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: spacing.xl,
        }}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.primaryBg,
              justifyContent: "center",
              alignItems: "center",
              marginRight: spacing.lg,
            }}
          >
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
          </View>
          <Text
            style={[textStyles.bodySemibold, { color: colors.text, flex: 1 }]}
          >
            {item.category || item.code}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.xl,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          }}
        >
          {item.items ? (
            item.items.map((subItem: any, idx: number) => (
              <View
                key={idx}
                style={{
                  backgroundColor: colors.bgMuted,
                  padding: spacing.lg,
                  borderRadius: radius.md,
                  marginTop: spacing.lg,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text
                    style={[
                      textStyles.bodySemibold,
                      { color: colors.text, flex: 1 },
                    ]}
                  >
                    {subItem.name}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.primaryBg,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 2,
                      borderRadius: radius.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: colors.info,
                      }}
                    >
                      {subItem.unit}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: spacing.xs,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.success}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.primary,
                      marginLeft: spacing.xs,
                    }}
                  >
                    {subItem.standard || subItem.price}
                  </Text>
                </View>
                {subItem.region && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Ionicons name="location" size={16} color={colors.info} />
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.primary,
                        marginLeft: spacing.xs,
                      }}
                    >
                      {subItem.region}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    textStyles.small,
                    {
                      color: colors.textSecondary,
                      lineHeight: 18,
                      marginTop: spacing.xs,
                    },
                  ]}
                >
                  {subItem.description || subItem.note}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ paddingTop: spacing.lg }}>
              <View style={{ marginBottom: spacing.lg }}>
                <Text
                  style={[
                    textStyles.small,
                    {
                      fontWeight: "600",
                      color: colors.textTertiary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Tiêu đề:
                </Text>
                <Text
                  style={[
                    textStyles.bodySemibold,
                    { color: colors.text, lineHeight: 20 },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <View style={{ marginBottom: spacing.lg }}>
                <Text
                  style={[
                    textStyles.small,
                    {
                      fontWeight: "600",
                      color: colors.textTertiary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Lĩnh vực:
                </Text>
                <View
                  style={{
                    backgroundColor: colors.primaryBg,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.full,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={[
                      textStyles.small,
                      { fontWeight: "600", color: colors.success },
                    ]}
                  >
                    {item.category}
                  </Text>
                </View>
              </View>
              <View style={{ marginBottom: spacing.lg }}>
                <Text
                  style={[
                    textStyles.small,
                    {
                      fontWeight: "600",
                      color: colors.textTertiary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Mô tả:
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    lineHeight: 20,
                  }}
                >
                  {item.description}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.primaryBg,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.md,
                  marginTop: spacing.sm,
                }}
              >
                <Ionicons
                  name="download-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.primary,
                    marginLeft: spacing.xs,
                  }}
                >
                  Tải tài liệu
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </DSCard>
  );
};

export default function ConstructionLookupScreen() {
  const { colors, spacing, radius, text: textStyles } = useDS();
  const [activeTab, setActiveTab] = useState("area");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Area calculator state
  const [length, setLength] = useState<string>("10"); // m
  const [width, setWidth] = useState<string>("5"); // m
  const [floors, setFloors] = useState<string>("2"); // count
  const [setbackFront, setSetbackFront] = useState<string>("0");
  const [setbackBack, setSetbackBack] = useState<string>("0");
  const [setbackLeft, setSetbackLeft] = useState<string>("0");
  const [setbackRight, setSetbackRight] = useState<string>("0");
  const [mezzanine, setMezzanine] = useState<boolean>(false);
  const [roofType, setRoofType] = useState<"none" | "slab" | "tile">("none");

  const getCurrentData = () => {
    switch (activeTab) {
      case "standards":
        return MATERIAL_STANDARDS;
      case "prices":
        return LABOR_PRICES;
      case "codes":
        return BUILDING_CODES;
      default:
        return [];
    }
  };

  const filteredData = getCurrentData().filter((item: any) => {
    const searchLower = searchQuery.toLowerCase();
    if (activeTab === "codes") {
      return (
        item.code.toLowerCase().includes(searchLower) ||
        item.title.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    } else {
      return item.category.toLowerCase().includes(searchLower);
    }
  });

  const handleToggle = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tra cứu xây dựng",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View style={{ flex: 1, backgroundColor: colors.bgMuted }}>
        {/* Search Bar or Calculator Header */}
        {activeTab === "area" ? (
          <View
            style={{
              backgroundColor: colors.card,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={[textStyles.bodySemibold, { color: colors.text }]}>
              Tính diện tích xây dựng
            </Text>
            <Text
              style={[
                textStyles.small,
                { marginTop: spacing.xs, color: colors.textSecondary },
              ]}
            >
              Nhập kích thước lô đất và thông số công trình để ước tính tổng
              diện tích xây dựng.
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: colors.card,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.bgMuted,
                borderRadius: radius.md,
                paddingHorizontal: spacing.lg,
                height: 40,
              }}
            >
              <Ionicons name="search" size={20} color={colors.textTertiary} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: spacing.sm,
                  fontSize: 14,
                  color: colors.text,
                }}
                placeholder={
                  activeTab === "codes"
                    ? "Tìm mã quy chuẩn, tiêu đề..."
                    : "Tìm kiếm vật tư, công việc..."
                }
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Tabs */}
        <View
          style={{
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
            paddingHorizontal: spacing.lg,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.lg,
                  marginRight: spacing.sm,
                  borderBottomWidth: 2,
                  borderBottomColor:
                    activeTab === tab.id ? colors.primary : "transparent",
                }}
                onPress={() => {
                  setActiveTab(tab.id);
                  setExpandedId(null);
                  setSearchQuery("");
                }}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={
                    activeTab === tab.id ? colors.primary : colors.textTertiary
                  }
                />
                <Text
                  style={[
                    textStyles.body,
                    {
                      marginLeft: spacing.xs,
                      fontWeight: activeTab === tab.id ? "600" : "500",
                      color:
                        activeTab === tab.id
                          ? colors.primary
                          : colors.textTertiary,
                    },
                  ]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Info Banner */}
        <View
          style={{
            backgroundColor: colors.primaryBg,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            marginTop: spacing.sm,
            marginHorizontal: spacing.lg,
            borderRadius: radius.md,
          }}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <Text
            style={[
              textStyles.small,
              {
                flex: 1,
                color: colors.info,
                marginLeft: spacing.sm,
                lineHeight: 18,
              },
            ]}
          >
            {activeTab === "area"
              ? "Kết quả chỉ mang tính tham khảo, chưa thay thế hồ sơ thiết kế."
              : activeTab === "standards"
                ? "Định mức vật tư tham khảo cho 1m³ bê tông"
                : activeTab === "prices"
                  ? "Giá nhân công tham khảo, chưa bao gồm VAT"
                  : activeTab === "codes"
                    ? "Quy chuẩn và tiêu chuẩn xây dựng Việt Nam"
                    : ""}
          </Text>
        </View>

        {/* Content */}
        {activeTab === "area" ? (
          <ScrollView
            style={{ flex: 1, paddingTop: spacing.sm }}
            showsVerticalScrollIndicator={false}
          >
            {/* Calculator form */}
            <DSCard
              variant="elevated"
              style={{
                marginHorizontal: spacing.lg,
                marginBottom: spacing.sm,
                padding: spacing.xl,
              }}
            >
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginBottom: spacing.md },
                ]}
              >
                Thông số lô đất (m)
              </Text>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Chiều dài
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={length}
                    onChangeText={setLength}
                    style={{
                      height: 40,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                    placeholder="VD: 10"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Chiều rộng
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={width}
                    onChangeText={setWidth}
                    style={{
                      height: 40,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                    placeholder="VD: 5"
                  />
                </View>
              </View>

              <Text
                style={[
                  textStyles.bodySemibold,
                  {
                    color: colors.text,
                    marginTop: spacing.xl,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                Khoảng lùi (m)
              </Text>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Trước
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={setbackFront}
                    onChangeText={setSetbackFront}
                    style={{
                      height: 40,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                    placeholder="0"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Sau
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={setbackBack}
                    onChangeText={setSetbackBack}
                    style={{
                      height: 40,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                    placeholder="0"
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", marginTop: spacing.sm }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Trái
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={setbackLeft}
                    onChangeText={setSetbackLeft}
                    style={{
                      height: 40,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                    placeholder="0"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Phải
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={setbackRight}
                    onChangeText={setSetbackRight}
                    style={{
                      height: 40,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                    placeholder="0"
                  />
                </View>
              </View>
            </DSCard>

            <DSCard
              variant="elevated"
              style={{
                marginHorizontal: spacing.lg,
                marginBottom: spacing.sm,
                padding: spacing.xl,
              }}
            >
              <Text
                style={[
                  textStyles.bodySemibold,
                  { color: colors.text, marginBottom: spacing.md },
                ]}
              >
                Cấu hình công trình
              </Text>
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Số tầng
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={floors}
                    onChangeText={setFloors}
                    style={{
                      height: 40,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                    placeholder="VD: 2"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text
                    style={[
                      textStyles.small,
                      { color: colors.textSecondary, marginBottom: spacing.xs },
                    ]}
                  >
                    Sân thượng
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: spacing.sm,
                      marginTop: spacing.xs,
                    }}
                  >
                    {(["none", "slab", "tile"] as const).map((rt) => (
                      <TouchableOpacity
                        key={rt}
                        onPress={() => setRoofType(rt)}
                        style={{
                          borderWidth: 1,
                          borderColor:
                            roofType === rt ? colors.info : colors.border,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs,
                          borderRadius: radius.full,
                          backgroundColor:
                            roofType === rt ? colors.primaryBg : colors.card,
                        }}
                      >
                        <Text
                          style={[
                            textStyles.small,
                            {
                              fontWeight: "600",
                              color:
                                roofType === rt
                                  ? colors.info
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {rt === "none"
                            ? "Không"
                            : rt === "slab"
                              ? "BTCT 50%"
                              : "Mái ngói 30%"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ marginTop: spacing.lg }}>
                <Text
                  style={[
                    textStyles.small,
                    { color: colors.textSecondary, marginBottom: spacing.xs },
                  ]}
                >
                  Tầng lửng
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: spacing.sm,
                    marginTop: spacing.xs,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setMezzanine(false)}
                    style={{
                      borderWidth: 1,
                      borderColor: !mezzanine ? colors.info : colors.border,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.full,
                      backgroundColor: !mezzanine
                        ? colors.primaryBg
                        : colors.card,
                    }}
                  >
                    <Text
                      style={[
                        textStyles.small,
                        {
                          fontWeight: "600",
                          color: !mezzanine
                            ? colors.info
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      Không
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMezzanine(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: mezzanine ? colors.info : colors.border,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.full,
                      backgroundColor: mezzanine
                        ? colors.primaryBg
                        : colors.card,
                    }}
                  >
                    <Text
                      style={[
                        textStyles.small,
                        {
                          fontWeight: "600",
                          color: mezzanine ? colors.info : colors.textSecondary,
                        },
                      ]}
                    >
                      Có (70%)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </DSCard>

            <AreaResult
              length={length}
              width={width}
              floors={floors}
              setbackFront={setbackFront}
              setbackBack={setbackBack}
              setbackLeft={setbackLeft}
              setbackRight={setbackRight}
              mezzanine={mezzanine}
              roofType={roofType}
            />
            <View style={{ height: 20 }} />
          </ScrollView>
        ) : (
          <ScrollView
            style={{ flex: 1, paddingTop: spacing.sm }}
            showsVerticalScrollIndicator={false}
          >
            {filteredData.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}

            {filteredData.length === 0 && (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 60,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={64}
                  color={colors.border}
                />
                <Text
                  style={[
                    textStyles.body,
                    {
                      color: colors.textTertiary,
                      marginTop: spacing.xl,
                      marginBottom: spacing.xxl,
                    },
                  ]}
                >
                  Không tìm thấy kết quả
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: spacing.xxl,
                    paddingVertical: spacing.md,
                    borderRadius: radius.md,
                  }}
                  onPress={() => setSearchQuery("")}
                >
                  <Text
                    style={[
                      textStyles.bodySemibold,
                      { color: colors.textInverse },
                    ]}
                  >
                    Xóa tìm kiếm
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Bottom Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.infoBg,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={colors.primary}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 11,
              color: colors.primary,
              marginLeft: spacing.sm,
              lineHeight: 16,
            }}
          >
            Thông tin mang tính chất tham khảo. Liên hệ chuyên gia để được tư
            vấn chi tiết.
          </Text>
        </View>
      </View>
    </>
  );
}

// --- Calculator helper + UI ---
type AreaProps = {
  length: string;
  width: string;
  floors: string;
  setbackFront: string;
  setbackBack: string;
  setbackLeft: string;
  setbackRight: string;
  mezzanine: boolean;
  roofType: "none" | "slab" | "tile";
};

const clamp0 = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

function computeArea(p: AreaProps) {
  const L = clamp0(parseFloat(p.length));
  const W = clamp0(parseFloat(p.width));
  const F = Math.max(0, Math.floor(parseFloat(p.floors) || 0));
  const sf = clamp0(parseFloat(p.setbackFront));
  const sb = clamp0(parseFloat(p.setbackBack));
  const sl = clamp0(parseFloat(p.setbackLeft));
  const sr = clamp0(parseFloat(p.setbackRight));

  const effL = Math.max(0, L - (sf + sb));
  const effW = Math.max(0, W - (sl + sr));
  const floorArea = effL * effW; // m2

  const mezz = p.mezzanine ? 0.7 * floorArea : 0;
  const roof =
    p.roofType === "slab"
      ? 0.5 * floorArea
      : p.roofType === "tile"
        ? 0.3 * floorArea
        : 0;
  const total = floorArea * F + mezz + roof;

  return { effL, effW, floorArea, mezz, roof, total };
}

const AreaResult: React.FC<AreaProps> = (props) => {
  const { colors, spacing, radius, text: textStyles } = useDS();
  const result = useMemo(
    () => computeArea(props),
    [
      props.length,
      props.width,
      props.floors,
      props.setbackFront,
      props.setbackBack,
      props.setbackLeft,
      props.setbackRight,
      props.mezzanine,
      props.roofType,
    ],
  );
  return (
    <DSCard
      variant="elevated"
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        padding: spacing.xl,
      }}
    >
      <Text
        style={[
          textStyles.bodySemibold,
          { color: colors.text, marginBottom: spacing.md },
        ]}
      >
        Kết quả ước tính
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: spacing.sm,
        }}
      >
        <Ionicons name="resize-outline" size={18} color={colors.primary} />
        <Text
          style={{ marginLeft: spacing.sm, fontSize: 14, color: colors.text }}
        >
          Kích thước hiệu dụng: {result.effW.toFixed(2)} x{" "}
          {result.effL.toFixed(2)} m
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: spacing.sm,
        }}
      >
        <Ionicons name="grid-outline" size={18} color={colors.primary} />
        <Text
          style={{ marginLeft: spacing.sm, fontSize: 14, color: colors.text }}
        >
          Diện tích 1 sàn: {result.floorArea.toFixed(2)} m²
        </Text>
      </View>
      {props.mezzanine && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: spacing.sm,
          }}
        >
          <Ionicons name="layers-outline" size={18} color={colors.primary} />
          <Text
            style={{ marginLeft: spacing.sm, fontSize: 14, color: colors.text }}
          >
            Tầng lửng (70%): {result.mezz.toFixed(2)} m²
          </Text>
        </View>
      )}
      {props.roofType !== "none" && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: spacing.sm,
          }}
        >
          <Ionicons name="home-outline" size={18} color={colors.primary} />
          <Text
            style={{ marginLeft: spacing.sm, fontSize: 14, color: colors.text }}
          >
            Mái ({props.roofType === "slab" ? "BTCT 50%" : "Ngói 30%"}):{" "}
            {result.roof.toFixed(2)} m²
          </Text>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: spacing.md,
        }}
      >
        <Ionicons name="calculator-outline" size={18} color={colors.success} />
        <Text
          style={{
            marginLeft: spacing.sm,
            fontSize: 14,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          Tổng diện tích: {result.total.toFixed(2)} m²
        </Text>
      </View>
      <Text
        style={[
          textStyles.small,
          { marginTop: spacing.sm, color: colors.textTertiary, lineHeight: 18 },
        ]}
      >
        Lưu ý: Công thức tham khảo (tầng lửng 70%, sân thượng BTCT 50%, mái ngói
        30%). Quy chuẩn có thể thay đổi theo địa phương và hồ sơ thiết kế.
      </Text>
    </DSCard>
  );
};
