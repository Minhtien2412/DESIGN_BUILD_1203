/**
 * AI Assistant Chat Screen
 * Main interface for GPT-4 powered construction assistant
 */

import { AIChatBubble } from "@/components/ai/AIChatBubble";
import { AIThinkingIndicator } from "@/components/ai/AIThinkingIndicator";
import { MessageInput } from "@/components/ai/MessageInput";
import { useAIChat } from "@/hooks/useAI";
import { useDS } from "@/hooks/useDS";
import type { AIChatMessage } from "@/types/ai";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AIAssistantScreen() {
  const params = useLocalSearchParams<{ projectId?: string }>();
  const { colors, spacing, radius, text: textStyles } = useDS();

  const {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    loadHistory,
    clearChat,
  } = useAIChat(params.projectId);

  const flatListRef = useRef<FlatList>(null);

  // Load chat history on mount
  useEffect(() => {
    if (params.projectId) {
      loadHistory(params.projectId);
    }
  }, [params.projectId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async (message: string, imageUrls?: string[]) => {
    const success = await sendMessage(message, imageUrls);
    if (!success && error) {
      Alert.alert("Lỗi", error);
    }
  };

  const handleImagePick = async (): Promise<string[] | undefined> => {
    // TODO: Integrate with ImagePicker when file upload is implemented
    Alert.alert(
      "Upload ảnh",
      "Tính năng upload ảnh sẽ được tích hợp trong Task #43-45",
    );
    return undefined;
  };

  const handleClearChat = () => {
    Alert.alert(
      "Xóa cuộc trò chuyện",
      "Bạn có chắc muốn xóa toàn bộ lịch sử chat?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: clearChat,
        },
      ],
    );
  };

  const renderMessage = ({ item }: { item: AIChatMessage }) => (
    <AIChatBubble message={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Trợ lý AI xây dựng
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Hỏi bất kỳ điều gì về dự án của bạn
      </Text>
      <View style={styles.suggestionsContainer}>
        <TouchableOpacity
          style={[styles.suggestionChip, { borderColor: colors.primary }]}
          onPress={() => handleSend("Phân tích tiến độ dự án hiện tại")}
        >
          <Text style={[styles.suggestionText, { color: colors.primary }]}>
            Phân tích tiến độ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.suggestionChip, { borderColor: colors.primary }]}
          onPress={() => handleSend("Kiểm tra chất lượng thi công")}
        >
          <Text style={[styles.suggestionText, { color: colors.primary }]}>
            Kiểm tra chất lượng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.suggestionChip, { borderColor: colors.primary }]}
          onPress={() => handleSend("Ước tính vật liệu cần thiết")}
        >
          <Text style={[styles.suggestionText, { color: colors.primary }]}>
            Ước tính vật liệu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Trợ lý AI",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleClearChat}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="trash-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={loading ? <AIThinkingIndicator /> : null}
        />

        {/* Error Message */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.error}
            />
            <Text style={[styles.errorText, { color: colors.text }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Input */}
        <MessageInput
          onSend={handleSend}
          loading={loading}
          placeholder="Hỏi AI về dự án..."
          onImagePick={handleImagePick}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: "center" as const,
  },
  suggestionsContainer: {
    marginTop: 24,
    gap: 12,
    alignItems: "center" as const,
  },
  suggestionChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  errorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
};
