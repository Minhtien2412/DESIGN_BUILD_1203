/**
 * Tư vấn Dự toán Chi phí AI
 * AI-powered construction cost estimation
 * @author AI Assistant
 * @date 13/01/2026
 */

import VoiceInput, { VoiceOutput } from "@/components/ai/VoiceInput";
import { useDS } from "@/hooks/useDS";
import {
    AIMessage,
    ConsultantContext,
    getConsultantConfig,
    sendConsultMessage,
} from "@/services/aiConsultantService";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Screen accent color (cost-estimate red branding)
const ACCENT = "#DC2626";
const ACCENT_DARK = "#B91C1C";

// ==================== DATA ====================

const CONSTRUCTION_LEVELS = [
  {
    id: "basic",
    name: "Cơ bản",
    price: "4.5-5.5",
    unit: "triệu/m²",
    icon: "🏠",
    color: "#10B981",
  },
  {
    id: "standard",
    name: "Tiêu chuẩn",
    price: "5.5-7",
    unit: "triệu/m²",
    icon: "🏡",
    color: "#0D9488",
  },
  {
    id: "premium",
    name: "Cao cấp",
    price: "7-10",
    unit: "triệu/m²",
    icon: "🏰",
    color: "#8B5CF6",
  },
  {
    id: "luxury",
    name: "Siêu cao cấp",
    price: "10-15+",
    unit: "triệu/m²",
    icon: "🏯",
    color: "#F59E0B",
  },
];

const MATERIAL_PRICES = [
  {
    id: "cement",
    name: "Xi măng",
    price: "95,000 - 110,000",
    unit: "₫/bao 50kg",
    icon: "🧱",
  },
  {
    id: "steel",
    name: "Sắt thép",
    price: "15,000 - 18,000",
    unit: "₫/kg",
    icon: "🔩",
  },
  {
    id: "brick",
    name: "Gạch xây",
    price: "1,200 - 2,000",
    unit: "₫/viên",
    icon: "🧱",
  },
  {
    id: "sand",
    name: "Cát",
    price: "350,000 - 450,000",
    unit: "₫/m³",
    icon: "🏖️",
  },
  {
    id: "stone",
    name: "Đá",
    price: "380,000 - 500,000",
    unit: "₫/m³",
    icon: "🪨",
  },
  {
    id: "tile",
    name: "Gạch ốp lát",
    price: "150,000 - 500,000",
    unit: "₫/m²",
    icon: "🔲",
  },
];

const LABOR_COSTS = [
  {
    id: "mason",
    name: "Thợ xây",
    price: "400,000 - 500,000",
    unit: "₫/ngày",
    icon: "👷",
  },
  {
    id: "electrician",
    name: "Thợ điện",
    price: "450,000 - 600,000",
    unit: "₫/ngày",
    icon: "⚡",
  },
  {
    id: "plumber",
    name: "Thợ nước",
    price: "400,000 - 550,000",
    unit: "₫/ngày",
    icon: "🚿",
  },
  {
    id: "painter",
    name: "Thợ sơn",
    price: "350,000 - 450,000",
    unit: "₫/ngày",
    icon: "🎨",
  },
  {
    id: "carpenter",
    name: "Thợ mộc",
    price: "450,000 - 600,000",
    unit: "₫/ngày",
    icon: "🪚",
  },
];

const COST_COMPONENTS = [
  { id: "foundation", name: "Móng", percent: "15-20%", icon: "🏗️" },
  { id: "structure", name: "Kết cấu thân", percent: "30-35%", icon: "🧱" },
  { id: "roof", name: "Mái", percent: "8-12%", icon: "🏠" },
  { id: "finish", name: "Hoàn thiện", percent: "25-30%", icon: "✨" },
  { id: "mep", name: "Điện nước", percent: "10-15%", icon: "⚡" },
  { id: "misc", name: "Phát sinh", percent: "5-10%", icon: "📦" },
];

// ==================== COMPONENTS ====================

const ChatMessage: React.FC<{
  message: AIMessage;
  colors: any;
  spacing: any;
  radius: any;
}> = ({ message, colors, spacing, radius }) => {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        { flexDirection: "row", marginBottom: spacing.md, maxWidth: "85%" },
        isUser
          ? { alignSelf: "flex-end", justifyContent: "flex-end" }
          : { alignSelf: "flex-start" },
      ]}
    >
      {!isUser && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.sm,
            backgroundColor: ACCENT,
          }}
        >
          <FontAwesome5
            name="calculator"
            size={16}
            color={colors.textInverse}
          />
        </View>
      )}
      <View
        style={{
          padding: spacing.md,
          borderRadius: radius.lg,
          maxWidth: "100%",
          backgroundColor: isUser ? ACCENT : colors.card,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: isUser ? colors.textInverse : colors.text,
          }}
        >
          {message.content}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: 4,
            gap: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: isUser ? "rgba(255,255,255,0.7)" : colors.textSecondary,
            }}
          >
            {message.timestamp.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {!isUser && (
            <VoiceOutput
              text={message.content}
              size={18}
              color={colors.textSecondary}
              activeColor={ACCENT}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const PriceCard: React.FC<{
  level: (typeof CONSTRUCTION_LEVELS)[0];
  selected: boolean;
  onPress: () => void;
  colors: any;
  spacing: any;
  radius: any;
  screen: any;
}> = ({ level, selected, onPress, colors, spacing, radius, screen }) => (
  <TouchableOpacity
    style={[
      {
        width: (screen.width - 44) / 2,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        backgroundColor: colors.card,
      },
      selected && { borderColor: level.color, borderWidth: 2 },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>{level.icon}</Text>
    <Text
      style={{
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        color: colors.text,
      }}
    >
      {level.name}
    </Text>
    <Text style={{ fontSize: 16, fontWeight: "700", color: level.color }}>
      {level.price}
    </Text>
    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
      {level.unit}
    </Text>
  </TouchableOpacity>
);

const MaterialPriceItem: React.FC<{
  material: (typeof MATERIAL_PRICES)[0];
  onPress: () => void;
  colors: any;
  spacing: any;
  radius: any;
}> = ({ material, onPress, colors, spacing, radius }) => (
  <TouchableOpacity
    style={{
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderRadius: radius.sm,
      gap: spacing.md,
      backgroundColor: colors.card,
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={{ fontSize: 24 }}>{material.icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
        {material.name}
      </Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: ACCENT }}>
        {material.price}
      </Text>
      <Text style={{ fontSize: 11, color: colors.textSecondary }}>
        {material.unit}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const CostCalculator: React.FC<{
  colors: any;
  spacing: any;
  radius: any;
  onCalculate: (estimate: string) => void;
}> = ({ colors, spacing, radius, onCalculate }) => {
  const [area, setArea] = useState("");
  const [floors, setFloors] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("standard");

  const calculate = () => {
    const areaNum = parseFloat(area) || 0;
    const floorsNum = parseInt(floors) || 1;
    const totalArea = areaNum * floorsNum;

    const level = CONSTRUCTION_LEVELS.find((l) => l.id === selectedLevel);
    const priceRange = level?.price || "5.5-7";
    const [minPrice, maxPrice] = priceRange
      .replace("+", "")
      .split("-")
      .map((p) => parseFloat(p));

    const minTotal = totalArea * minPrice;
    const maxTotal = totalArea * maxPrice;

    const formatMoney = (num: number) => {
      if (num >= 1000) return `${(num / 1000).toFixed(1)} tỷ`;
      return `${num.toFixed(0)} triệu`;
    };

    const estimate = `Với diện tích đất ${area}m², xây ${floors} tầng (tổng ${totalArea}m² sàn), hoàn thiện ${level?.name.toLowerCase()}:

💰 **Ước tính chi phí:**
• Phạm vi: ${formatMoney(minTotal)} - ${formatMoney(maxTotal)}

📊 **Phân bổ dự kiến:**
• Phần thô: ${formatMoney(minTotal * 0.55)} - ${formatMoney(maxTotal * 0.55)}
• Hoàn thiện: ${formatMoney(minTotal * 0.35)} - ${formatMoney(maxTotal * 0.35)}
• Phát sinh: ${formatMoney(minTotal * 0.1)} - ${formatMoney(maxTotal * 0.1)}

⚠️ Đây là ước tính sơ bộ, chi phí thực tế có thể thay đổi.`;

    onCalculate(estimate);
  };

  return (
    <View
      style={{
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.card,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: spacing.md,
          color: colors.text,
        }}
      >
        🧮 Ước tính nhanh
      </Text>

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              marginBottom: 6,
              color: colors.textSecondary,
            }}
          >
            Diện tích đất
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={{
                height: 44,
                paddingHorizontal: 12,
                paddingRight: 40,
                borderRadius: radius.sm,
                borderWidth: 1,
                fontSize: 15,
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              }}
              value={area}
              onChangeText={setArea}
              placeholder="100"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              m²
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              marginBottom: 6,
              color: colors.textSecondary,
            }}
          >
            Số tầng
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={{
                height: 44,
                paddingHorizontal: 12,
                paddingRight: 40,
                borderRadius: radius.sm,
                borderWidth: 1,
                fontSize: 15,
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              }}
              value={floors}
              onChangeText={setFloors}
              placeholder="3"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              tầng
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={{
          fontSize: 12,
          marginBottom: 6,
          marginTop: 12,
          color: colors.textSecondary,
        }}
      >
        Mức hoàn thiện
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.sm,
          marginTop: spacing.sm,
        }}
      >
        {CONSTRUCTION_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                gap: 6,
                backgroundColor: colors.bg,
              },
              selectedLevel === level.id && { backgroundColor: level.color },
            ]}
            onPress={() => setSelectedLevel(level.id)}
          >
            <Text style={{ fontSize: 16 }}>{level.icon}</Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color:
                  selectedLevel === level.id ? colors.textInverse : colors.text,
              }}
            >
              {level.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
          borderRadius: radius.sm,
          marginTop: spacing.md,
          gap: spacing.sm,
          backgroundColor: ACCENT,
        }}
        onPress={calculate}
        disabled={!area || !floors}
      >
        <FontAwesome5 name="calculator" size={18} color={colors.textInverse} />
        <Text
          style={{ fontSize: 15, fontWeight: "600", color: colors.textInverse }}
        >
          Tính dự toán
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ==================== MAIN SCREEN ====================

export default function CostEstimateAIScreen() {
  const { colors, spacing, radius, font, screen } = useDS();
  const config = getConsultantConfig("cost_estimate");

  // State
  const [activeTab, setActiveTab] = useState<"chat" | "prices" | "calculator">(
    "chat",
  );
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const welcomeMsg: AIMessage = {
      id: Date.now().toString(),
      role: "ai",
      content: `💰 **Chào mừng bạn đến với Tư vấn Dự toán AI!**\n\nTôi là chuyên gia dự toán xây dựng AI, sẵn sàng hỗ trợ bạn:\n\n• Ước tính chi phí xây dựng\n• Báo giá vật liệu mới nhất\n• Tính toán nhân công\n• Tư vấn tiết kiệm chi phí\n\nBạn đang muốn dự toán cho công trình gì?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Build context
  const buildContext = useCallback((): ConsultantContext => {
    const ctx: ConsultantContext = {};
    if (selectedLevel) {
      const level = CONSTRUCTION_LEVELS.find((l) => l.id === selectedLevel);
      if (level) ctx.style = level.name;
    }
    return ctx;
  }, [selectedLevel]);

  // Send message
  const handleSendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || inputText.trim();
      if (!messageText || isLoading) return;

      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsLoading(true);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const context = buildContext();
        const response = await sendConsultMessage(
          messageText,
          "cost_estimate",
          context,
        );

        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Send message error:", error);
        const errorMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    },
    [inputText, isLoading, buildContext],
  );

  const handleQuickQuestion = useCallback(
    (question: string) => {
      handleSendMessage(question);
      setActiveTab("chat");
    },
    [handleSendMessage],
  );

  const handleCalculateResult = useCallback((estimate: string) => {
    const aiMessage: AIMessage = {
      id: Date.now().toString(),
      role: "ai",
      content: estimate,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    setActiveTab("chat");
  }, []);

  // Tab data
  const tabs = [
    {
      key: "chat" as const,
      icon: "chatbubbles",
      label: "Chat",
      iconLib: "ionicons",
    },
    { key: "prices" as const, icon: "tags", label: "Bảng giá", iconLib: "fa5" },
    {
      key: "calculator" as const,
      icon: "calculator",
      label: "Tính toán",
      iconLib: "fa5",
    },
  ];

  // Render tabs
  const renderTabs = () => (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        backgroundColor: colors.card,
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            {
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 20,
              gap: 6,
            },
            activeTab === tab.key && { backgroundColor: ACCENT },
          ]}
          onPress={() => setActiveTab(tab.key)}
        >
          {tab.iconLib === "ionicons" ? (
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={
                activeTab === tab.key
                  ? colors.textInverse
                  : colors.textSecondary
              }
            />
          ) : (
            <FontAwesome5
              name={tab.icon}
              size={16}
              color={
                activeTab === tab.key
                  ? colors.textInverse
                  : colors.textSecondary
              }
            />
          )}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color:
                activeTab === tab.key
                  ? colors.textInverse
                  : colors.textSecondary,
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render chat tab
  const renderChatTab = () => (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            colors={colors}
            spacing={spacing}
            radius={radius}
          />
        ))}

        {isLoading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: spacing.md,
              borderRadius: radius.lg,
              alignSelf: "flex-start",
              gap: spacing.sm,
              backgroundColor: colors.card,
            }}
          >
            <ActivityIndicator size="small" color={ACCENT} />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Đang tính toán...
            </Text>
          </View>
        )}
      </ScrollView>

      {messages.length <= 2 && (
        <View
          style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}
        >
          <Text
            style={{
              fontSize: 13,
              marginBottom: spacing.sm,
              color: colors.textSecondary,
            }}
          >
            💡 Câu hỏi gợi ý:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {config.quickQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  maxWidth: 200,
                  borderColor: ACCENT,
                }}
                onPress={() => handleQuickQuestion(q)}
              >
                <Text style={{ fontSize: 13, color: ACCENT }} numberOfLines={2}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          padding: spacing.md,
          gap: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <VoiceInput
          onTextReceived={(text) => handleSendMessage(text)}
          disabled={isLoading}
        />
        <TextInput
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 100,
            paddingHorizontal: spacing.md,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 1,
            fontSize: 15,
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
          }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập câu hỏi về chi phí..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: inputText.trim() ? ACCENT : colors.border,
          }}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </>
  );

  // Render prices tab
  const renderPricesTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 4,
          color: colors.text,
        }}
      >
        🏠 Đơn giá xây dựng trọn gói
      </Text>
      <Text
        style={{
          fontSize: 12,
          marginBottom: spacing.md,
          color: colors.textSecondary,
        }}
      >
        Cập nhật tháng 01/2026
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
        {CONSTRUCTION_LEVELS.map((level) => (
          <PriceCard
            key={level.id}
            level={level}
            selected={selectedLevel === level.id}
            onPress={() => {
              setSelectedLevel(level.id);
              handleQuickQuestion(
                `Chi phí xây nhà mức ${level.name.toLowerCase()} gồm những gì?`,
              );
            }}
            colors={colors}
            spacing={spacing}
            radius={radius}
            screen={screen}
          />
        ))}
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 4,
          marginTop: 24,
          color: colors.text,
        }}
      >
        🧱 Giá vật liệu
      </Text>

      <View style={{ gap: spacing.sm }}>
        {MATERIAL_PRICES.map((material) => (
          <MaterialPriceItem
            key={material.id}
            material={material}
            onPress={() =>
              handleQuickQuestion(
                `Giá ${material.name.toLowerCase()} hiện nay và cách chọn chất lượng?`,
              )
            }
            colors={colors}
            spacing={spacing}
            radius={radius}
          />
        ))}
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 4,
          marginTop: 24,
          color: colors.text,
        }}
      >
        👷 Giá nhân công
      </Text>

      <View style={{ gap: spacing.sm }}>
        {LABOR_COSTS.map((labor) => (
          <View
            key={labor.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: spacing.md,
              borderRadius: radius.sm,
              gap: spacing.md,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ fontSize: 24 }}>{labor.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: colors.text }}
              >
                {labor.name}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: ACCENT }}>
                {labor.price}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              {labor.unit}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 4,
          marginTop: 24,
          color: colors.text,
        }}
      >
        📊 Tỷ lệ phân bổ chi phí
      </Text>

      <View style={{ gap: spacing.sm }}>
        {COST_COMPONENTS.map((comp) => (
          <View
            key={comp.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: spacing.md,
              borderRadius: radius.sm,
              gap: spacing.md,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ fontSize: 20 }}>{comp.icon}</Text>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: "500",
                color: colors.text,
              }}
            >
              {comp.name}
            </Text>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: ACCENT + "20",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: ACCENT }}>
                {comp.percent}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <View
        style={{
          flexDirection: "row",
          padding: spacing.md,
          borderRadius: radius.md,
          marginTop: spacing.md,
          gap: spacing.md,
          alignItems: "center",
          backgroundColor: colors.card,
        }}
      >
        <Ionicons name="information-circle" size={24} color={ACCENT} />
        <Text
          style={{
            flex: 1,
            fontSize: 12,
            lineHeight: 18,
            color: colors.textSecondary,
          }}
        >
          Giá trên chỉ mang tính chất tham khảo và có thể thay đổi theo thị
          trường và khu vực.
        </Text>
      </View>
    </ScrollView>
  );

  // Render calculator tab
  const renderCalculatorTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <CostCalculator
        colors={colors}
        spacing={spacing}
        radius={radius}
        onCalculate={handleCalculateResult}
      />

      {/* Category questions */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 4,
          marginTop: 24,
          color: colors.text,
        }}
      >
        ❓ Câu hỏi theo chủ đề
      </Text>

      {config.categories.map((cat) => (
        <View
          key={cat.id}
          style={{
            padding: 14,
            borderRadius: radius.md,
            marginBottom: spacing.md,
            backgroundColor: colors.card,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              gap: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
            >
              {cat.name}
            </Text>
          </View>

          {cat.questions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing.sm,
                gap: 10,
              }}
              onPress={() => handleQuickQuestion(q)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={ACCENT} />
              <Text style={{ flex: 1, fontSize: 13, color: colors.text }}>
                {q}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Tips */}
      <View
        style={{
          padding: spacing.md,
          borderRadius: radius.md,
          marginTop: spacing.md,
          backgroundColor: colors.warningBg,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginBottom: spacing.sm,
            color: colors.warning,
          }}
        >
          💡 Mẹo tiết kiệm chi phí
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 20, color: colors.warning }}>
          {`• Mua vật liệu số lượng lớn để được giảm giá\n• Xây vào mùa thấp điểm (tháng 5-9)\n• So sánh giá từ nhiều nhà thầu\n• Tránh thay đổi thiết kế trong quá trình xây`}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tư vấn Dự toán AI",
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bg }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {/* Header */}
          <LinearGradient
            colors={[ACCENT, ACCENT_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 40, marginRight: spacing.md }}>
                {config.icon}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: colors.textInverse,
                    marginBottom: 4,
                  }}
                >
                  {config.title}
                </Text>
                <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                  {config.description}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {renderTabs()}

          {activeTab === "chat" && renderChatTab()}
          {activeTab === "prices" && renderPricesTab()}
          {activeTab === "calculator" && renderCalculatorTab()}
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
}
