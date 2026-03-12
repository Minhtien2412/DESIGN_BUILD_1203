/**
 * AI Assistant Chat Screen
 * Main interface for GPT-4 powered construction assistant
 */

import { AIChatBubble } from "@/components/ai/AIChatBubble";
import { AIThinkingIndicator } from "@/components/ai/AIThinkingIndicator";
import { MessageInput } from "@/components/ai/MessageInput";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAIChat } from "@/hooks/useAI";
import type { AIChatMessage } from "@/types/ai";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AIAssistantScreen() {
  const params = useLocalSearchParams<{ projectId?: string }>();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

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
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Trợ lý AI xây dựng</Text>
      <Text style={styles.emptySubtitle}>
        Hỏi bất kỳ điều gì về dự án của bạn
      </Text>
      <View style={styles.suggestionsContainer}>
        <TouchableOpacity
          style={[styles.suggestionChip, { borderColor: tintColor }]}
          onPress={() => handleSend("Phân tích tiến độ dự án hiện tại")}
        >
          <Text style={[styles.suggestionText, { color: tintColor }]}>
            Phân tích tiến độ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.suggestionChip, { borderColor: tintColor }]}
          onPress={() => handleSend("Kiểm tra chất lượng thi công")}
        >
          <Text style={[styles.suggestionText, { color: tintColor }]}>
            Kiểm tra chất lượng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.suggestionChip, { borderColor: tintColor }]}
          onPress={() => handleSend("Ước tính vật liệu cần thiết")}
        >
          <Text style={[styles.suggestionText, { color: tintColor }]}>
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
              <Ionicons name="trash-outline" size={22} color={tintColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
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
            <Ionicons name="alert-circle-outline" size={16} color="#000000" />
            <Text style={styles.errorText}>{error}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    color: "#333",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  suggestionsContainer: {
    marginTop: 24,
    gap: 12,
    alignItems: "center",
  },
  suggestionChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#000000",
  },
});
