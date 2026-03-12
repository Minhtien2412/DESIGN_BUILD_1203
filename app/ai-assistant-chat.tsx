/**
 * ChatGPT-Style AI Assistant UI
 * ================================================
 * Premium glassmorphism meets conversational AI 💎
 * Features:
 * - Voice input with animated feedback ring
 * - Chat history with glassmorphic message cards
 * - Staggered entrance animations for messages
 * - Floating AI assistant FAB with pulse animation
 * - Quick action shortcut pills
 * - Smooth spring physics throughout
 * - Typing indicator with bouncing dots
 * - Auto-scroll to bottom on new message
 *
 * Stack: React Native • Expo • TypeScript • Reanimated • BlurView
 */

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInRight,
    FadeInUp,
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    ZoomIn
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");
const SPRING = { damping: 14, stiffness: 160, mass: 0.8 };

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const C = {
  bg: "#0A0A14",
  surface: "#12121E",
  card: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.08)",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSoft: "rgba(255,255,255,0.7)",
  accent: "#14B8A6",
  accentGlow: "rgba(20,184,166,0.2)",
  purple: "#8B5CF6",
  purpleGlow: "rgba(139,92,246,0.15)",
  userBubble: "rgba(20,184,166,0.12)",
  userBubbleBorder: "rgba(20,184,166,0.25)",
  aiBubble: "rgba(139,92,246,0.08)",
  aiBubbleBorder: "rgba(139,92,246,0.18)",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.12)",
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// MOCK AI RESPONSES
// ═══════════════════════════════════════════════════════════════
const AI_RESPONSES = [
  "Đây là câu hỏi rất hay! Để tôi phân tích chi tiết cho bạn. Trong kiến trúc hiện đại, xu hướng 2026 tập trung vào **Biophilic Design** - hòa hợp không gian sống với thiên nhiên, giảm thiểu carbon footprint và tối ưu năng lượng. 🌿",
  "Tôi đã nghiên cứu vấn đề này. Theo dữ liệu thị trường xây dựng Việt Nam Q1/2026:\n\n• Giá thép tăng 8% so với cùng kỳ\n• Xi măng ổn định\n• Vật liệu xanh tăng nhu cầu 35%\n\nKhuyến nghị: Nên ký hợp đồng cố định giá vật liệu ngay từ đầu dự án. 📊",
  "Tuyệt vời! Dựa trên yêu cầu của bạn, tôi suggest thiết kế theo phong cách **Modern Tropical** với các đặc điểm:\n\n1. **Mái dốc** chống nóng, thoát nước\n2. **Khoảng thông tầng** lấy ánh sáng tự nhiên\n3. **Vật liệu địa phương** (gỗ teak, đá granite)\n4. **Hồ bơi infinity** hướng biển\n\nBạn muốn tôi tạo bản vẽ concept không? ✨",
  "Chào bạn! Tôi là trợ lý AI chuyên về kiến trúc và xây dựng. Tôi có thể giúp bạn:\n\n🏗️ Tư vấn thiết kế\n📊 Dự toán chi phí\n📋 Quản lý tiến độ\n🎨 Gợi ý phong cách\n\nBạn cần hỗ trợ gì hôm nay?",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Xin chào! 👋 Tôi là **BaoTien AI** - trợ lý thông minh chuyên về kiến trúc, xây dựng và nội thất. Tôi có thể giúp bạn tư vấn thiết kế, dự toán, và quản lý dự án. Hãy hỏi tôi bất cứ điều gì! 🏗️✨",
    timestamp: new Date(Date.now() - 300000),
  },
];

const QUICK_ACTIONS = [
  { icon: "home-outline" as const, label: "Tư vấn thiết kế", color: C.accent },
  {
    icon: "calculator-outline" as const,
    label: "Dự toán chi phí",
    color: C.purple,
  },
  {
    icon: "construct-outline" as const,
    label: "Vật liệu xây dựng",
    color: "#F97316",
  },
  {
    icon: "color-palette-outline" as const,
    label: "Phong cách nội thất",
    color: "#EC4899",
  },
];

// ═══════════════════════════════════════════════════════════════
// TYPING INDICATOR (3 bouncing dots)
// ═══════════════════════════════════════════════════════════════
const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 300 }),
        withTiming(0, { duration: 300 }),
      ),
      -1,
    );
    dot2.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
      ),
    );
    dot3.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
      ),
    );
  }, []);

  const s1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const s2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const s3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <Animated.View
      entering={FadeInLeft.springify()}
      style={styles.typingContainer}
    >
      <View style={styles.typingBubble}>
        <View style={styles.aiAvatarSmall}>
          <Text style={{ fontSize: 14 }}>🤖</Text>
        </View>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, s1]} />
          <Animated.View style={[styles.dot, s2]} />
          <Animated.View style={[styles.dot, s3]} />
        </View>
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// VOICE INPUT BUTTON (with animated ring)
// ═══════════════════════════════════════════════════════════════
const VoiceButton = ({ onPress }: { onPress: () => void }) => {
  const [recording, setRecording] = useState(false);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);

  const toggleRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const next = !recording;
    setRecording(next);

    if (next) {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800 }),
          withTiming(0, { duration: 800 }),
        ),
        -1,
      );
    } else {
      ringScale.value = withSpring(1);
      ringOpacity.value = withTiming(0);
      onPress();
    }
  };

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <TouchableOpacity onPress={toggleRecording} style={styles.voiceBtn}>
      {/* Animated pulse ring */}
      <Animated.View style={[styles.voiceRing, ringStyle]} />
      <View
        style={[styles.voiceInner, recording && { backgroundColor: "#EF4444" }]}
      >
        <Ionicons
          name={recording ? "stop" : "mic-outline"}
          size={20}
          color="#FFF"
        />
      </View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════
// MESSAGE BUBBLE
// ═══════════════════════════════════════════════════════════════
const MessageBubble = React.memo(
  ({ message, index }: { message: Message; index: number }) => {
    const isUser = message.role === "user";
    const enterAnim = isUser
      ? FadeInRight.delay(index * 50).springify()
      : FadeInLeft.delay(index * 50).springify();

    const formatTime = (d: Date) => {
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };

    return (
      <Animated.View
        entering={enterAnim}
        style={[styles.messageRow, isUser && styles.messageRowUser]}
      >
        {/* AI Avatar */}
        {!isUser && (
          <View style={styles.aiAvatar}>
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              style={styles.aiAvatarGradient}
            >
              <Text style={{ fontSize: 16 }}>🤖</Text>
            </LinearGradient>
          </View>
        )}

        {/* Bubble */}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubbleStyle,
          ]}
        >
          {!isUser && (
            <View style={styles.aiLabel}>
              <Text style={styles.aiLabelText}>BaoTien AI</Text>
              <View style={styles.aiVerifiedDot} />
            </View>
          )}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {message.content}
          </Text>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </Animated.View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════
// FLOATING AI FAB (with pulse)
// ═══════════════════════════════════════════════════════════════
const AIFloatingButton = ({ onPress }: { onPress: () => void }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.delay(500).springify()}
      style={styles.fabContainer}
    >
      <Animated.View style={[styles.fabPulse, pulseStyle]} />
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={["#8B5CF6", "#6D28D9", "#5B21B6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="sparkles" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowQuickActions(false);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      scrollToBottom();

      // Simulate AI typing
      setIsTyping(true);
      const delay = 1000 + Math.random() * 2000;

      setTimeout(() => {
        setIsTyping(false);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom],
  );

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendMessage(action.label);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background */}
      <LinearGradient
        colors={["#0A0A14", "#12121E", "#0A0A14"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={["#8B5CF6", "#6D28D9"]}
            style={styles.headerAvatar}
          >
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </LinearGradient>
          <View>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>BaoTien AI</Text>
              <Ionicons name="checkmark-circle" size={14} color={C.accent} />
            </View>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Luôn sẵn sàng</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="call-outline" size={22} color={C.textSoft} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={C.textSoft} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatArea}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item, index }) => (
            <MessageBubble message={item} index={index} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          ListHeaderComponent={
            showQuickActions ? (
              <Animated.View
                entering={FadeInUp.springify()}
                style={styles.quickActionsContainer}
              >
                <Text style={styles.quickActionsTitle}>Gợi ý nhanh ⚡</Text>
                <View style={styles.quickActionsGrid}>
                  {QUICK_ACTIONS.map((action, i) => (
                    <Animated.View
                      key={action.label}
                      entering={FadeInUp.delay(i * 80).springify()}
                    >
                      <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => handleQuickAction(action)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.quickActionIcon,
                            { backgroundColor: action.color + "18" },
                          ]}
                        >
                          <Ionicons
                            name={action.icon}
                            size={22}
                            color={action.color}
                          />
                        </View>
                        <Text style={styles.quickActionLabel}>
                          {action.label}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            ) : null
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Input Area */}
        <Animated.View
          entering={SlideInDown.springify()}
          style={[
            styles.inputArea,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <BlurView intensity={30} tint="dark" style={styles.inputBlur}>
            <View style={styles.inputRow}>
              {/* Attach button */}
              <TouchableOpacity style={styles.attachBtn}>
                <Ionicons
                  name="add-circle-outline"
                  size={26}
                  color={C.textMuted}
                />
              </TouchableOpacity>

              {/* Text input */}
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Nhập tin nhắn..."
                  placeholderTextColor={C.textMuted}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={2000}
                />
              </View>

              {/* Voice or Send */}
              {inputText.trim() ? (
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => sendMessage(inputText)}
                >
                  <LinearGradient
                    colors={[C.accent, "#0D9488"]}
                    style={styles.sendBtnGradient}
                  >
                    <Ionicons name="arrow-up" size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <VoiceButton
                  onPress={() =>
                    sendMessage("Tư vấn thiết kế biệt thự nghỉ dưỡng")
                  }
                />
              )}
            </View>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName: { fontSize: 17, fontWeight: "700", color: C.text },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  onlineText: { fontSize: 12, color: C.textMuted },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.glass,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },

  // Chat
  chatArea: { flex: 1 },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    maxWidth: "85%",
  },
  messageRowUser: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },

  // AI Avatar
  aiAvatar: { marginRight: 8, marginBottom: 2 },
  aiAvatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.purpleGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  // Bubbles
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "100%",
  },
  userBubble: {
    backgroundColor: C.userBubble,
    borderWidth: 1,
    borderColor: C.userBubbleBorder,
    borderBottomRightRadius: 6,
  },
  aiBubbleStyle: {
    backgroundColor: C.aiBubble,
    borderWidth: 1,
    borderColor: C.aiBubbleBorder,
    borderBottomLeftRadius: 6,
  },
  aiLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  aiLabelText: { fontSize: 11, fontWeight: "600", color: C.purple },
  aiVerifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
  },

  messageText: { fontSize: 15, color: C.textSoft, lineHeight: 22 },
  userMessageText: { color: C.text },
  messageTime: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  userMessageTime: { color: "rgba(20,184,166,0.5)" },

  // Typing
  typingContainer: { marginBottom: 12 },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.aiBubble,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: C.aiBubbleBorder,
  },
  typingDots: { flexDirection: "row", gap: 4 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.purple,
  },

  // Quick actions
  quickActionsContainer: { marginBottom: 20 },
  quickActionsTitle: {
    fontSize: 14,
    color: C.textMuted,
    marginBottom: 12,
    textAlign: "center",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  quickActionCard: {
    width: (SW - 72) / 2,
    backgroundColor: C.glass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    gap: 10,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 13,
    color: C.textSoft,
    fontWeight: "500",
    textAlign: "center",
  },

  // Input
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  inputBlur: { paddingHorizontal: 12, paddingTop: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachBtn: { paddingBottom: 6 },
  inputWrapper: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    color: C.text,
    lineHeight: 20,
  },

  // Voice button
  voiceBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  voiceRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.accent,
  },
  voiceInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  // Send button
  sendBtn: { marginBottom: 2 },
  sendBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 100,
    right: 16,
  },
  fabPulse: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.purpleGlow,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
});
