/**
 * Tư vấn Giấy phép Xây dựng AI
 * AI-powered building permit consultation
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
import {
    Ionicons,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
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

const ACCENT = "#059669";
const ACCENT_DARK = "#047857";

// ==================== DATA ====================

const PERMIT_TYPES = [
  {
    id: "new_build",
    name: "Xây mới",
    icon: "🏗️",
    description: "Xây dựng công trình mới",
  },
  {
    id: "renovation",
    name: "Sửa chữa",
    icon: "🔧",
    description: "Cải tạo, sửa chữa công trình",
  },
  {
    id: "demolition",
    name: "Phá dỡ",
    icon: "🏚️",
    description: "Phá dỡ công trình",
  },
  {
    id: "addition",
    name: "Cơi nới",
    icon: "📐",
    description: "Mở rộng, cơi nới công trình",
  },
];

const BUILDING_TYPES = [
  { id: "townhouse", name: "Nhà phố", icon: "🏠" },
  { id: "villa", name: "Biệt thự", icon: "🏡" },
  { id: "apartment", name: "Chung cư", icon: "🏢" },
  { id: "commercial", name: "Thương mại", icon: "🏪" },
  { id: "factory", name: "Nhà xưởng", icon: "🏭" },
  { id: "religious", name: "Tôn giáo", icon: "⛪" },
];

const DOCUMENT_CHECKLIST = [
  {
    id: "application",
    name: "Đơn xin cấp giấy phép",
    required: true,
    icon: "📝",
  },
  {
    id: "land_doc",
    name: "Giấy tờ quyền sử dụng đất",
    required: true,
    icon: "📜",
  },
  { id: "design", name: "Bản vẽ thiết kế", required: true, icon: "📐" },
  { id: "id_card", name: "CMND/CCCD chủ đầu tư", required: true, icon: "🪪" },
  { id: "fire", name: "Hồ sơ PCCC", required: false, icon: "🔥" },
  {
    id: "environment",
    name: "Báo cáo môi trường",
    required: false,
    icon: "🌿",
  },
  { id: "neighbor", name: "Cam kết hàng xóm", required: false, icon: "🤝" },
];

const PROCESS_STEPS = [
  { id: 1, name: "Chuẩn bị hồ sơ", duration: "1-2 tuần", icon: "📋" },
  { id: 2, name: "Nộp hồ sơ", duration: "1 ngày", icon: "📤" },
  { id: 3, name: "Thẩm định", duration: "15-20 ngày", icon: "🔍" },
  { id: 4, name: "Cấp giấy phép", duration: "3-5 ngày", icon: "✅" },
];

const FAQ_ITEMS = [
  {
    question: "Nhà mấy tầng cần xin phép?",
    answer:
      "Theo quy định, nhà ở từ 7 tầng trở lên hoặc có tổng diện tích sàn từ 500m² trở lên cần xin giấy phép xây dựng.",
  },
  {
    question: "Chi phí xin giấy phép là bao nhiêu?",
    answer:
      "Lệ phí cấp giấy phép xây dựng: 50.000 - 500.000đ tùy loại công trình. Chi phí thiết kế và hoàn thiện hồ sơ: 5-15 triệu.",
  },
  {
    question: "Thời gian cấp giấy phép là bao lâu?",
    answer:
      "Nhà ở riêng lẻ: 15-20 ngày. Công trình khác: 20-30 ngày kể từ ngày nộp đủ hồ sơ hợp lệ.",
  },
  {
    question: "Xây không phép bị phạt bao nhiêu?",
    answer:
      "Phạt 50-100 triệu đồng và buộc tháo dỡ phần xây dựng không phép. Trường hợp nghiêm trọng có thể bị truy cứu hình sự.",
  },
];

// ==================== COMPONENTS ====================

const ChatMessage: React.FC<{
  message: AIMessage;
  colors: any;
}> = ({ message, colors }) => {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: ACCENT }]}>
          <MaterialIcons
            name="assignment"
            size={18}
            color={colors.textInverse}
          />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser
            ? { backgroundColor: ACCENT }
            : { backgroundColor: colors.card },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isUser ? colors.textInverse : colors.text },
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              {
                color: isUser ? "rgba(255,255,255,0.7)" : colors.textSecondary,
              },
            ]}
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

const ProcessTimeline: React.FC<{
  colors: any;
}> = ({ colors }) => (
  <View style={styles.timelineContainer}>
    {PROCESS_STEPS.map((step, idx) => (
      <View key={step.id} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineNode, { backgroundColor: ACCENT }]}>
            <Text style={styles.timelineNodeText}>{step.id}</Text>
          </View>
          {idx < PROCESS_STEPS.length - 1 && (
            <View style={[styles.timelineLine, { backgroundColor: ACCENT }]} />
          )}
        </View>
        <View
          style={[styles.timelineContent, { backgroundColor: colors.card }]}
        >
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineIcon}>{step.icon}</Text>
            <Text style={[styles.timelineName, { color: colors.text }]}>
              {step.name}
            </Text>
          </View>
          <Text
            style={[styles.timelineDuration, { color: colors.textSecondary }]}
          >
            ⏱️ {step.duration}
          </Text>
        </View>
      </View>
    ))}
  </View>
);

const DocumentChecklist: React.FC<{
  colors: any;
  onItemPress: (item: (typeof DOCUMENT_CHECKLIST)[0]) => void;
}> = ({ colors, onItemPress }) => (
  <View style={styles.checklistContainer}>
    {DOCUMENT_CHECKLIST.map((doc) => (
      <TouchableOpacity
        key={doc.id}
        style={[styles.checklistItem, { backgroundColor: colors.card }]}
        onPress={() => onItemPress(doc)}
      >
        <Text style={styles.checklistIcon}>{doc.icon}</Text>
        <View style={styles.checklistInfo}>
          <Text style={[styles.checklistName, { color: colors.text }]}>
            {doc.name}
          </Text>
          {doc.required ? (
            <Text style={styles.requiredBadge}>Bắt buộc</Text>
          ) : (
            <Text
              style={[styles.optionalBadge, { color: colors.textSecondary }]}
            >
              Tùy trường hợp
            </Text>
          )}
        </View>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    ))}
  </View>
);

// ==================== MAIN SCREEN ====================

export default function PermitAIScreen() {
  const { colors, spacing, radius, screen } = useDS();
  const config = getConsultantConfig("permit");

  // State
  const [activeTab, setActiveTab] = useState<"chat" | "process" | "faq">(
    "chat",
  );
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermitType, setSelectedPermitType] = useState<string>("");
  const [selectedBuildingType, setSelectedBuildingType] = useState<string>("");

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
      content: `📋 **Chào mừng bạn đến với Tư vấn Giấy phép XD AI!**\n\nTôi là chuyên gia pháp lý xây dựng AI, sẵn sàng hỗ trợ bạn:\n\n• Hướng dẫn thủ tục xin giấy phép\n• Kiểm tra hồ sơ cần thiết\n• Giải đáp quy định pháp luật\n• Ước tính thời gian và chi phí\n\nBạn đang cần xin giấy phép cho công trình gì?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Build context
  const buildContext = useCallback((): ConsultantContext => {
    const ctx: ConsultantContext = {};
    if (selectedPermitType) {
      const permitType = PERMIT_TYPES.find((p) => p.id === selectedPermitType);
      if (permitType) ctx.projectType = permitType.name;
    }
    if (selectedBuildingType) {
      const buildingType = BUILDING_TYPES.find(
        (b) => b.id === selectedBuildingType,
      );
      if (buildingType) {
        ctx.requirements = [buildingType.name];
      }
    }
    return ctx;
  }, [selectedPermitType, selectedBuildingType]);

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
          "permit",
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

  // Render tabs
  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "chat" && { backgroundColor: ACCENT },
        ]}
        onPress={() => setActiveTab("chat")}
      >
        <Ionicons
          name="chatbubbles"
          size={18}
          color={
            activeTab === "chat" ? colors.textInverse : colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "chat"
                  ? colors.textInverse
                  : colors.textSecondary,
            },
          ]}
        >
          Chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "process" && { backgroundColor: ACCENT },
        ]}
        onPress={() => setActiveTab("process")}
      >
        <MaterialIcons
          name="timeline"
          size={18}
          color={
            activeTab === "process" ? colors.textInverse : colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "process"
                  ? colors.textInverse
                  : colors.textSecondary,
            },
          ]}
        >
          Quy trình
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "faq" && { backgroundColor: ACCENT }]}
        onPress={() => setActiveTab("faq")}
      >
        <Ionicons
          name="help-circle"
          size={18}
          color={
            activeTab === "faq" ? colors.textInverse : colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "faq" ? colors.textInverse : colors.textSecondary,
            },
          ]}
        >
          FAQ
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render chat tab
  const renderChatTab = () => (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} colors={colors} />
        ))}

        {isLoading && (
          <View
            style={[styles.loadingContainer, { backgroundColor: colors.card }]}
          >
            <ActivityIndicator size="small" color={ACCENT} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Đang trả lời...
            </Text>
          </View>
        )}
      </ScrollView>

      {messages.length <= 2 && (
        <View style={styles.quickQuestionsContainer}>
          <Text
            style={[
              styles.quickQuestionsTitle,
              { color: colors.textSecondary },
            ]}
          >
            💡 Câu hỏi gợi ý:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickQuestionsScroll}
          >
            {config.quickQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.quickQuestionBtn, { borderColor: ACCENT }]}
                onPress={() => handleQuickQuestion(q)}
              >
                <Text
                  style={[styles.quickQuestionText, { color: ACCENT }]}
                  numberOfLines={2}
                >
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderTopColor: colors.divider },
        ]}
      >
        <VoiceInput
          onTextReceived={(text) => handleSendMessage(text)}
          disabled={isLoading}
        />
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập câu hỏi về giấy phép..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() ? ACCENT : colors.border,
            },
          ]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </>
  );

  // Render process tab
  const renderProcessTab = () => (
    <ScrollView
      style={styles.processContainer}
      contentContainerStyle={styles.processContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        📝 Loại giấy phép
      </Text>

      <View style={styles.permitTypesGrid}>
        {PERMIT_TYPES.map((permit) => (
          <TouchableOpacity
            key={permit.id}
            style={[
              styles.permitTypeCard,
              { backgroundColor: colors.card },
              selectedPermitType === permit.id && {
                borderColor: ACCENT,
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedPermitType(permit.id)}
          >
            <Text style={styles.permitTypeIcon}>{permit.icon}</Text>
            <Text style={[styles.permitTypeName, { color: colors.text }]}>
              {permit.name}
            </Text>
            <Text
              style={[styles.permitTypeDesc, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {permit.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        🏠 Loại công trình
      </Text>

      <View style={styles.buildingTypesRow}>
        {BUILDING_TYPES.map((building) => (
          <TouchableOpacity
            key={building.id}
            style={[
              styles.buildingTypeChip,
              { backgroundColor: colors.card },
              selectedBuildingType === building.id && {
                backgroundColor: ACCENT,
              },
            ]}
            onPress={() => setSelectedBuildingType(building.id)}
          >
            <Text style={styles.buildingTypeIcon}>{building.icon}</Text>
            <Text
              style={[
                styles.buildingTypeName,
                {
                  color:
                    selectedBuildingType === building.id
                      ? colors.textInverse
                      : colors.text,
                },
              ]}
            >
              {building.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        📅 Quy trình cấp phép
      </Text>

      <ProcessTimeline colors={colors} />

      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        📄 Hồ sơ cần chuẩn bị
      </Text>

      <DocumentChecklist
        colors={colors}
        onItemPress={(doc) =>
          handleQuickQuestion(`Hồ sơ ${doc.name} cần những gì?`)
        }
      />

      <TouchableOpacity
        style={[
          styles.consultButton,
          { backgroundColor: ACCENT, marginTop: 20 },
        ]}
        onPress={() => {
          const parts = [];
          const permitType = PERMIT_TYPES.find(
            (p) => p.id === selectedPermitType,
          );
          if (permitType) parts.push(permitType.name.toLowerCase());

          const buildingType = BUILDING_TYPES.find(
            (b) => b.id === selectedBuildingType,
          );
          if (buildingType) parts.push(buildingType.name.toLowerCase());

          const question =
            parts.length > 0
              ? `Hướng dẫn thủ tục xin giấy phép ${parts.join(" cho ")}`
              : "Hướng dẫn thủ tục xin giấy phép xây dựng";

          handleQuickQuestion(question);
        }}
      >
        <MaterialCommunityIcons
          name="robot"
          size={24}
          color={colors.textInverse}
        />
        <Text style={styles.consultButtonText}>Tư vấn thủ tục</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Render FAQ tab
  const renderFAQTab = () => (
    <ScrollView
      style={styles.faqContainer}
      contentContainerStyle={styles.faqContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        ❓ Câu hỏi thường gặp
      </Text>

      {FAQ_ITEMS.map((faq, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.faqItem, { backgroundColor: colors.card }]}
          onPress={() => handleQuickQuestion(faq.question)}
        >
          <View style={styles.faqHeader}>
            <Ionicons name="help-circle" size={24} color={ACCENT} />
            <Text style={[styles.faqQuestion, { color: colors.text }]}>
              {faq.question}
            </Text>
          </View>
          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
            {faq.answer}
          </Text>
          <View style={styles.faqFooter}>
            <Text style={[styles.faqAskMore, { color: ACCENT }]}>
              Hỏi thêm →
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Category questions */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        📂 Câu hỏi theo chủ đề
      </Text>

      {config.categories.map((cat) => (
        <View
          key={cat.id}
          style={[styles.categorySection, { backgroundColor: colors.card }]}
        >
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {cat.name}
            </Text>
          </View>

          {cat.questions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.categoryQuestion}
              onPress={() => handleQuickQuestion(q)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={ACCENT} />
              <Text
                style={[styles.categoryQuestionText, { color: colors.text }]}
              >
                {q}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Warning box */}
      <View style={[styles.warningBox, { backgroundColor: colors.warningBg }]}>
        <Ionicons name="warning" size={24} color={colors.warning} />
        <View style={styles.warningContent}>
          <Text style={[styles.warningTitle, { color: colors.warning }]}>
            Lưu ý quan trọng
          </Text>
          <Text style={[styles.warningText, { color: colors.warning }]}>
            Thông tin tư vấn chỉ mang tính chất tham khảo. Vui lòng liên hệ cơ
            quan có thẩm quyền để được hướng dẫn chính xác.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tư vấn Giấy phép XD AI",
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
        style={[styles.container, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <LinearGradient
            colors={[ACCENT, ACCENT_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerIcon}>{config.icon}</Text>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{config.title}</Text>
                <Text style={styles.headerSubtitle}>{config.description}</Text>
              </View>
            </View>
          </LinearGradient>

          {renderTabs()}

          {activeTab === "chat" && renderChatTab()}
          {activeTab === "process" && renderProcessTab()}
          {activeTab === "faq" && renderFAQTab()}
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
}

// ==================== STYLES ====================

const styles = {
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  headerIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: "row" as const,
    marginBottom: 12,
    maxWidth: "85%" as const,
  },
  userMessage: {
    alignSelf: "flex-end" as const,
    justifyContent: "flex-end" as const,
  },
  aiMessage: {
    alignSelf: "flex-start" as const,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "100%" as const,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    marginTop: 4,
    gap: 8,
  },
  messageTime: {
    fontSize: 10,
  },

  // Loading
  loadingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    borderRadius: 16,
    alignSelf: "flex-start" as const,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },

  // Quick questions
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  quickQuestionsTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  quickQuestionsScroll: {
    gap: 8,
  },
  quickQuestionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 200,
  },
  quickQuestionText: {
    fontSize: 13,
  },

  // Input
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  // Process tab
  processContainer: {
    flex: 1,
  },
  processContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },

  // Permit types
  permitTypesGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  permitTypeCard: {
    width: "47%" as const as unknown as number,
    padding: 16,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  permitTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  permitTypeName: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  permitTypeDesc: {
    fontSize: 11,
    textAlign: "center" as const,
  },

  // Building types
  buildingTypesRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  buildingTypeChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  buildingTypeIcon: {
    fontSize: 16,
  },
  buildingTypeName: {
    fontSize: 13,
  },

  // Timeline
  timelineContainer: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row" as const,
  },
  timelineLeft: {
    width: 40,
    alignItems: "center" as const,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  timelineNodeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    marginBottom: 12,
  },
  timelineHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  timelineIcon: {
    fontSize: 18,
  },
  timelineName: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  timelineDuration: {
    fontSize: 12,
  },

  // Checklist
  checklistContainer: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  checklistIcon: {
    fontSize: 20,
  },
  checklistInfo: {
    flex: 1,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  requiredBadge: {
    fontSize: 10,
    color: "#DC2626",
    fontWeight: "600" as const,
  },
  optionalBadge: {
    fontSize: 10,
  },

  // FAQ tab
  faqContainer: {
    flex: 1,
  },
  faqContent: {
    padding: 16,
    paddingBottom: 40,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    marginBottom: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 34,
  },
  faqFooter: {
    marginTop: 8,
    marginLeft: 34,
  },
  faqAskMore: {
    fontSize: 13,
    fontWeight: "500" as const,
  },

  // Category section
  categorySection: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 10,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  categoryQuestion: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 8,
    gap: 10,
  },
  categoryQuestionText: {
    flex: 1,
    fontSize: 13,
  },

  // Warning box
  warningBox: {
    flexDirection: "row" as const,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 18,
  },

  // Consult button
  consultButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  consultButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
};
