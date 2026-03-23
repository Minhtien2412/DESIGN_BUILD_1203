/**
 * Tư vấn Thiết kế Nhà AI
 * AI-powered house design consultation
 * @author AI Assistant
 * @date 13/01/2026
 */

import VoiceInput, { VoiceOutput } from "@/components/ai/VoiceInput";
import { useDS } from "@/hooks/useDS";
import {
    AIMessage,
    ConsultantCategory,
    ConsultantContext,
    getConsultantConfig,
    sendConsultMessage,
} from "@/services/aiConsultantService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

// ==================== TYPES ====================

interface ProjectInfo {
  landArea: string;
  floors: string;
  bedrooms: string;
  budget: string;
  style: string;
  location: string;
}

// ==================== DATA ====================

const DESIGN_STYLES = [
  { id: "modern", name: "Hiện đại", icon: "🏢" },
  { id: "neoclassic", name: "Tân cổ điển", icon: "🏛️" },
  { id: "minimalist", name: "Tối giản", icon: "⬜" },
  { id: "indochine", name: "Indochine", icon: "🏮" },
  { id: "tropical", name: "Nhiệt đới", icon: "🌴" },
  { id: "japanese", name: "Nhật Bản", icon: "🎎" },
];

const BUDGET_RANGES = [
  { id: "low", name: "Dưới 1 tỷ", range: "< 1 tỷ" },
  { id: "medium", name: "1-2 tỷ", range: "1-2 tỷ" },
  { id: "high", name: "2-5 tỷ", range: "2-5 tỷ" },
  { id: "premium", name: "Trên 5 tỷ", range: "> 5 tỷ" },
];

const PROJECT_TYPES = [
  { id: "townhouse", name: "Nhà phố", icon: "🏠" },
  { id: "villa", name: "Biệt thự", icon: "🏡" },
  { id: "apartment", name: "Căn hộ", icon: "🏢" },
  { id: "garden_house", name: "Nhà vườn", icon: "🌳" },
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
        <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons
            name="robot"
            size={20}
            color={colors.textInverse}
          />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser
            ? { backgroundColor: colors.primary }
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
              activeColor={colors.primary}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const QuickQuestionButton: React.FC<{
  question: string;
  onPress: () => void;
  colors: any;
}> = ({ question, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.quickQuestionBtn, { borderColor: colors.primary }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      style={[styles.quickQuestionText, { color: colors.primary }]}
      numberOfLines={2}
    >
      {question}
    </Text>
  </TouchableOpacity>
);

const CategoryCard: React.FC<{
  category: ConsultantCategory;
  onPress: () => void;
  colors: any;
}> = ({ category, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: colors.card }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.categoryIcon}>{category.icon}</Text>
    <Text style={[styles.categoryName, { color: colors.text }]}>
      {category.name}
    </Text>
    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
      {category.questions.length} câu hỏi
    </Text>
  </TouchableOpacity>
);

const ProjectInfoForm: React.FC<{
  projectInfo: ProjectInfo;
  onUpdate: (info: ProjectInfo) => void;
  colors: any;
}> = ({ projectInfo, onUpdate, colors }) => {
  return (
    <View style={[styles.formSection, { backgroundColor: colors.card }]}>
      <Text style={[styles.formTitle, { color: colors.text }]}>
        📋 Thông tin dự án (tùy chọn)
      </Text>

      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Diện tích đất
          </Text>
          <TextInput
            style={[
              styles.formInput,
              {
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={projectInfo.landArea}
            onChangeText={(text) =>
              onUpdate({ ...projectInfo, landArea: text })
            }
            placeholder="VD: 100"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
          <Text style={[styles.formUnit, { color: colors.textSecondary }]}>
            m²
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Số tầng
          </Text>
          <TextInput
            style={[
              styles.formInput,
              {
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={projectInfo.floors}
            onChangeText={(text) => onUpdate({ ...projectInfo, floors: text })}
            placeholder="VD: 3"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
          <Text style={[styles.formUnit, { color: colors.textSecondary }]}>
            tầng
          </Text>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Phòng ngủ
          </Text>
          <TextInput
            style={[
              styles.formInput,
              {
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={projectInfo.bedrooms}
            onChangeText={(text) =>
              onUpdate({ ...projectInfo, bedrooms: text })
            }
            placeholder="VD: 4"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
          <Text style={[styles.formUnit, { color: colors.textSecondary }]}>
            phòng
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Vị trí
          </Text>
          <TextInput
            style={[
              styles.formInput,
              {
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={projectInfo.location}
            onChangeText={(text) =>
              onUpdate({ ...projectInfo, location: text })
            }
            placeholder="VD: Hà Nội"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );
};

// ==================== MAIN SCREEN ====================

export default function HouseDesignAIScreen() {
  const { colors, spacing, radius, screen } = useDS();
  const config = getConsultantConfig("house_design");

  // State
  const [activeTab, setActiveTab] = useState<"chat" | "categories" | "info">(
    "chat",
  );
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ConsultantCategory | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    landArea: "",
    floors: "",
    bedrooms: "",
    budget: "",
    style: "",
    location: "",
  });

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Welcome message
    const welcomeMsg: AIMessage = {
      id: Date.now().toString(),
      role: "ai",
      content: `🏠 **Chào mừng bạn đến với Tư vấn Thiết kế Nhà AI!**\n\nTôi là trợ lý AI chuyên về thiết kế kiến trúc nhà ở. Tôi có thể giúp bạn:\n\n• Tư vấn phong cách thiết kế\n• Bố trí mặt bằng hợp lý\n• Ước tính chi phí thiết kế\n• Giải đáp thắc mắc về kiến trúc\n\nHãy cho tôi biết bạn cần hỗ trợ gì nhé!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Build context from project info
  const buildContext = useCallback((): ConsultantContext => {
    const ctx: ConsultantContext = {};
    if (projectInfo.landArea) ctx.area = parseFloat(projectInfo.landArea);
    if (projectInfo.budget) ctx.budget = projectInfo.budget;
    if (projectInfo.location) ctx.location = projectInfo.location;
    if (projectInfo.style) ctx.style = projectInfo.style;
    if (projectInfo.floors || projectInfo.bedrooms) {
      ctx.requirements = [];
      if (projectInfo.floors)
        ctx.requirements.push(`${projectInfo.floors} tầng`);
      if (projectInfo.bedrooms)
        ctx.requirements.push(`${projectInfo.bedrooms} phòng ngủ`);
    }
    return ctx;
  }, [projectInfo]);

  // Send message
  const handleSendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || inputText.trim();
      if (!messageText || isLoading) return;

      // Add user message
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsLoading(true);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const context = buildContext();
        const response = await sendConsultMessage(
          messageText,
          "house_design",
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

  // Handle quick question
  const handleQuickQuestion = useCallback(
    (question: string) => {
      handleSendMessage(question);
      setActiveTab("chat");
    },
    [handleSendMessage],
  );

  // Handle category select
  const handleCategorySelect = useCallback((category: ConsultantCategory) => {
    setSelectedCategory(category);
  }, []);

  // Render tabs
  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "chat" && { backgroundColor: colors.primary },
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
          activeTab === "categories" && { backgroundColor: colors.primary },
        ]}
        onPress={() => setActiveTab("categories")}
      >
        <Ionicons
          name="grid"
          size={18}
          color={
            activeTab === "categories"
              ? colors.textInverse
              : colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "categories"
                  ? colors.textInverse
                  : colors.textSecondary,
            },
          ]}
        >
          Chủ đề
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "info" && { backgroundColor: colors.primary },
        ]}
        onPress={() => setActiveTab("info")}
      >
        <Ionicons
          name="document-text"
          size={18}
          color={
            activeTab === "info" ? colors.textInverse : colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "info"
                  ? colors.textInverse
                  : colors.textSecondary,
            },
          ]}
        >
          Dự án
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render chat tab
  const renderChatTab = () => (
    <>
      {/* Messages */}
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
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Đang trả lời...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick questions */}
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
              <QuickQuestionButton
                key={idx}
                question={q}
                onPress={() => handleQuickQuestion(q)}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
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
          ref={inputRef}
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
          placeholder="Nhập câu hỏi của bạn..."
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
              backgroundColor: inputText.trim()
                ? colors.primary
                : colors.border,
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

  // Render categories tab
  const renderCategoriesTab = () => (
    <ScrollView
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
      showsVerticalScrollIndicator={false}
    >
      {selectedCategory ? (
        // Category questions
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Quay lại
            </Text>
          </TouchableOpacity>

          <View
            style={[styles.categoryHeader, { backgroundColor: colors.card }]}
          >
            <Text style={styles.categoryHeaderIcon}>
              {selectedCategory.icon}
            </Text>
            <Text style={[styles.categoryHeaderTitle, { color: colors.text }]}>
              {selectedCategory.name}
            </Text>
          </View>

          {selectedCategory.questions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.questionItem, { backgroundColor: colors.card }]}
              onPress={() => handleQuickQuestion(q)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.questionText, { color: colors.text }]}>
                {q}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // Categories grid
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📂 Chủ đề tư vấn
          </Text>

          <View style={styles.categoriesGrid}>
            {config.categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onPress={() => handleCategorySelect(cat)}
                colors={colors}
              />
            ))}
          </View>

          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
          >
            🏠 Loại công trình
          </Text>

          <View style={styles.typesRow}>
            {PROJECT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeChip, { backgroundColor: colors.card }]}
                onPress={() =>
                  handleQuickQuestion(
                    `Tư vấn thiết kế ${type.name.toLowerCase()}`,
                  )
                }
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeName, { color: colors.text }]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
          >
            🎨 Phong cách thiết kế
          </Text>

          <View style={styles.stylesGrid}>
            {DESIGN_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleChip,
                  { backgroundColor: colors.card },
                  projectInfo.style === style.id && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => {
                  setProjectInfo((prev) => ({ ...prev, style: style.id }));
                  handleQuickQuestion(
                    `Tư vấn thiết kế phong cách ${style.name}`,
                  );
                }}
              >
                <Text style={styles.styleIcon}>{style.icon}</Text>
                <Text style={[styles.styleName, { color: colors.text }]}>
                  {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );

  // Render info tab
  const renderInfoTab = () => (
    <ScrollView
      style={styles.infoContainer}
      contentContainerStyle={styles.infoContent}
      showsVerticalScrollIndicator={false}
    >
      <ProjectInfoForm
        projectInfo={projectInfo}
        onUpdate={setProjectInfo}
        colors={colors}
      />

      <View
        style={[
          styles.formSection,
          { backgroundColor: colors.card, marginTop: 16 },
        ]}
      >
        <Text style={[styles.formTitle, { color: colors.text }]}>
          💰 Ngân sách
        </Text>

        <View style={styles.budgetGrid}>
          {BUDGET_RANGES.map((budget) => (
            <TouchableOpacity
              key={budget.id}
              style={[
                styles.budgetChip,
                { backgroundColor: colors.bg },
                projectInfo.budget === budget.id && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                setProjectInfo((prev) => ({ ...prev, budget: budget.id }))
              }
            >
              <Text
                style={[
                  styles.budgetText,
                  {
                    color:
                      projectInfo.budget === budget.id
                        ? colors.textInverse
                        : colors.text,
                  },
                ]}
              >
                {budget.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.consultButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          const parts = [];
          if (projectInfo.landArea)
            parts.push(`diện tích ${projectInfo.landArea}m²`);
          if (projectInfo.floors) parts.push(`${projectInfo.floors} tầng`);
          if (projectInfo.bedrooms)
            parts.push(`${projectInfo.bedrooms} phòng ngủ`);

          const budgetLabel = BUDGET_RANGES.find(
            (b) => b.id === projectInfo.budget,
          )?.range;
          if (budgetLabel) parts.push(`ngân sách ${budgetLabel}`);

          const styleLabel = DESIGN_STYLES.find(
            (s) => s.id === projectInfo.style,
          )?.name;
          if (styleLabel) parts.push(`phong cách ${styleLabel}`);

          if (projectInfo.location) parts.push(`tại ${projectInfo.location}`);

          const question =
            parts.length > 0
              ? `Tư vấn thiết kế nhà với ${parts.join(", ")}`
              : "Tư vấn thiết kế nhà cho tôi";

          handleQuickQuestion(question);
        }}
      >
        <MaterialCommunityIcons
          name="robot"
          size={24}
          color={colors.textInverse}
        />
        <Text style={styles.consultButtonText}>Tư vấn theo thông tin</Text>
      </TouchableOpacity>

      <View style={[styles.tipsSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>
          💡 Mẹo tư vấn
        </Text>
        <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
          • Cung cấp thông tin dự án để nhận tư vấn chính xác hơn{"\n"}• Hỏi cụ
          thể về từng vấn đề (diện tích, chi phí, phong cách...){"\n"}• Có thể
          đặt câu hỏi tiếp nối để làm rõ thông tin
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tư vấn Thiết kế Nhà AI",
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
            colors={[colors.primary, colors.primaryDark]}
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

          {/* Tabs */}
          {renderTabs()}

          {/* Tab content */}
          {activeTab === "chat" && renderChatTab()}
          {activeTab === "categories" && renderCategoriesTab()}
          {activeTab === "info" && renderInfoTab()}
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
}

// ==================== STYLES ====================

const styles = {
  container: { flex: 1 } as const,
  content: { flex: 1 } as const,
  header: { paddingHorizontal: 16, paddingVertical: 16 } as const,
  headerContent: { flexDirection: "row" as const, alignItems: "center" as const } as const,
  headerIcon: { fontSize: 40, marginRight: 12 } as const,
  headerInfo: { flex: 1 } as const,
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff" as const,
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" as const },

  // Tabs
  tabContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  } as const,
  tab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  } as const,
  tabText: { fontSize: 13, fontWeight: "600" as const } as const,

  // Messages
  messagesContainer: { flex: 1 } as const,
  messagesContent: { padding: 16, paddingBottom: 80 } as const,
  messageContainer: {
    flexDirection: "row" as const,
    marginBottom: 12,
    maxWidth: "85%" as const,
  } as const,
  userMessage: { alignSelf: "flex-end" as const, justifyContent: "flex-end" as const } as const,
  aiMessage: { alignSelf: "flex-start" as const } as const,
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 8,
  } as const,
  messageBubble: { padding: 12, borderRadius: 16, maxWidth: "100%" as const } as const,
  messageText: { fontSize: 15, lineHeight: 22 } as const,
  messageFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    marginTop: 4,
    gap: 8,
  } as const,
  messageTime: { fontSize: 10 } as const,

  // Loading
  loadingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    borderRadius: 16,
    alignSelf: "flex-start" as const,
    gap: 8,
  } as const,
  loadingText: { fontSize: 14 } as const,

  // Quick questions
  quickQuestionsContainer: { paddingHorizontal: 16, paddingBottom: 8 } as const,
  quickQuestionsTitle: { fontSize: 13, marginBottom: 8 } as const,
  quickQuestionsScroll: { gap: 8 } as const,
  quickQuestionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 200,
  } as const,
  quickQuestionText: { fontSize: 13 } as const,

  // Input
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  } as const,
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 15,
  } as const,
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  } as const,

  // Categories
  categoriesContainer: { flex: 1 } as const,
  categoriesContent: { padding: 16 } as const,
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 12 },
  categoriesGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 12 } as const,
  categoryCard: {
    width: "47%" as const as unknown as number,
    padding: 16,
    borderRadius: 12,
    alignItems: "center" as const,
  } as const,
  categoryIcon: { fontSize: 32, marginBottom: 8 } as const,
  categoryName: { fontSize: 14, fontWeight: "600" as const, marginBottom: 4 },
  categoryCount: { fontSize: 12 } as const,

  // Back button
  backButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
    gap: 4,
  } as const,
  backText: { fontSize: 15, fontWeight: "500" as const } as const,

  // Category header
  categoryHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  } as const,
  categoryHeaderIcon: { fontSize: 32 } as const,
  categoryHeaderTitle: { fontSize: 18, fontWeight: "600" as const } as const,

  // Question item
  questionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  } as const,
  questionText: { flex: 1, fontSize: 14 } as const,

  // Types
  typesRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 } as const,
  typeChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  } as const,
  typeIcon: { fontSize: 18 } as const,
  typeName: { fontSize: 13, fontWeight: "500" as const } as const,

  // Styles
  stylesGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 } as const,
  styleChip: {
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: "30%" as const as unknown as number,
  } as const,
  styleIcon: { fontSize: 24, marginBottom: 4 } as const,
  styleName: { fontSize: 12, fontWeight: "500" as const } as const,

  // Info tab
  infoContainer: { flex: 1 } as const,
  infoContent: { padding: 16 } as const,
  formSection: { padding: 16, borderRadius: 12 } as const,
  formTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 16 },
  formRow: { flexDirection: "row" as const, gap: 12, marginBottom: 12 } as const,
  formField: { flex: 1, position: "relative" as const } as const,
  formLabel: { fontSize: 12, marginBottom: 6 } as const,
  formInput: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    paddingRight: 40,
  } as const,
  formUnit: {
    position: "absolute" as const,
    right: 12,
    bottom: 12,
    fontSize: 13,
  } as const,

  // Budget
  budgetGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 } as const,
  budgetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  } as const,
  budgetText: { fontSize: 13, fontWeight: "500" as const } as const,

  // Consult button
  consultButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  } as const,
  consultButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff" as const,
  },

  // Tips
  tipsSection: { padding: 16, borderRadius: 12, marginTop: 16 } as const,
  tipsTitle: { fontSize: 14, fontWeight: "600" as const, marginBottom: 8 },
  tipsText: { fontSize: 13, lineHeight: 20 } as const,
};
