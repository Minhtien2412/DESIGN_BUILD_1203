/**
 * AI Architect Consultant Chat Screen
 * Rich chat with product cards, worker cards, floor plans, cost summaries,
 * quick replies, and CTA blocks. Powered by OpenClaw AI orchestrator.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RichMessageBubble } from "./ChatRenderers";
import {
  buildWelcomeMessage,
  initSalesChat,
  processUserMessage,
  resetSalesChat,
} from "./orchestrator";
import type { ChatMessage, CTAAction } from "./types";

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════

export default function AIAssistantScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // ── Init ──────────────────────────────────────────────
  useEffect(() => {
    initSalesChat();
    setMessages([buildWelcomeMessage()]);
  }, []);

  // ── Auto-scroll on new message ────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        120,
      );
    }
  }, [messages]);

  // ── Send handler ──────────────────────────────────────
  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text ?? inputText).trim();
      if (!messageText || isLoading) return;

      setInputText("");
      Keyboard.dismiss();

      // User message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      // Typing placeholder
      const typingMsg: ChatMessage = {
        id: "typing",
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, userMsg, typingMsg]);
      setIsLoading(true);

      try {
        const response = await processUserMessage(messageText);
        setMessages((prev) =>
          prev.filter((m) => m.id !== "typing").concat(response),
        );
      } catch {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== "typing")
            .concat({
              id: `err-${Date.now()}`,
              role: "assistant",
              content: "❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
              timestamp: new Date(),
              hasError: true,
            }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading],
  );

  // ── Quick reply tapped ────────────────────────────────
  const handleQuickReply = useCallback(
    (value: string) => {
      handleSend(value);
    },
    [handleSend],
  );

  // ── Product tap → navigate to detail ──────────────────
  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}` as any);
    },
    [router],
  );

  // ── Worker tap → navigate to profile ──────────────────
  const handleWorkerPress = useCallback(
    (workerId: string) => {
      router.push(`/workers/${workerId}` as any);
    },
    [router],
  );

  // ── CTA tap ───────────────────────────────────────────
  const handleCTAPress = useCallback(
    (cta: CTAAction) => {
      switch (cta.action) {
        case "book":
          router.push("/booking" as any);
          break;
        case "add_to_cart":
          // Already handled by cart context
          break;
        case "create_lead":
          router.push("/customer-support" as any);
          break;
        case "navigate":
          if (cta.payload?.route) {
            router.push(cta.payload.route as any);
          }
          break;
        default:
          break;
      }
    },
    [router],
  );

  // ── Retry a failed message ────────────────────────────
  const handleRetry = useCallback(
    (messageId: string) => {
      // Find the user message right before the failed one
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx <= 0) return;
      const prev = messages[idx - 1];
      if (prev?.role === "user") {
        // Remove the error message and resend
        setMessages((ms) => ms.filter((m) => m.id !== messageId));
        handleSend(prev.content);
      }
    },
    [messages, handleSend],
  );

  // ── Clear chat ────────────────────────────────────────
  const handleClear = useCallback(() => {
    resetSalesChat();
    setMessages([buildWelcomeMessage()]);
  }, []);

  // ── Render ────────────────────────────────────────────
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <RichMessageBubble
        message={item}
        onQuickReply={handleQuickReply}
        onProductPress={handleProductPress}
        onWorkerPress={handleWorkerPress}
        onCTAPress={handleCTAPress}
        onRetry={handleRetry}
      />
    ),
    [
      handleQuickReply,
      handleProductPress,
      handleWorkerPress,
      handleCTAPress,
      handleRetry,
    ],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Kiến trúc sư AI</Text>
          <Text style={styles.headerSubtitle}>Tư vấn thiết kế • BaoTien</Text>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mô tả nhà bạn muốn xây, ví dụ: 5x20, 3 tầng..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              editable={!isLoading}
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            Powered by OpenClaw AI • BaoTien
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES — preserves existing dark theme
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#16213e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4e",
  },
  backButton: { padding: 8 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  headerSubtitle: { fontSize: 12, color: "#8B5CF6", marginTop: 2 },
  clearButton: {
    padding: 8,
    backgroundColor: "rgba(139,92,246,0.2)",
    borderRadius: 8,
  },
  chatArea: { flex: 1 },
  messagesList: { padding: 16, paddingBottom: 8 },
  inputContainer: {
    padding: 12,
    backgroundColor: "#16213e",
    borderTopWidth: 1,
    borderTopColor: "#2a2a4e",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#2a2a4e",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: "#4a4a6e" },
  disclaimer: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});
