/**
 * Example Screen - Demo API Integration
 * Shows how to use the new API services
 */

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useChat, useNotifications } from "@/hooks/useSocket";
import { login, logout } from "@/services/authApi";
import { createPayment } from "@/services/paymentsApi";
import { getProducts } from "@/services/productsApi";
import { createProject, getProjects } from "@/services/projectsApi";
import { handleApiError } from "@/utils/errorHandler";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ApiExampleScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // =========================================================================
  // Authentication Examples
  // =========================================================================

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await login({
        email: "test@example.com",
        password: "test123",
      });
      setResult(`✅ Logged in: ${response.user.fullName}`);
      Alert.alert("Success", "Logged in successfully");
    } catch (error) {
      const errorInfo = handleApiError(error);
      setResult(`❌ Error: ${errorInfo.message}`);
      Alert.alert("Error", errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      await logout("refresh_token_here");
      setResult("✅ Logged out successfully");
      Alert.alert("Success", "Logged out successfully");
    } catch (error) {
      const errorInfo = handleApiError(error);
      setResult(`❌ Error: ${errorInfo.message}`);
      Alert.alert("Error", errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // Projects Examples
  // =========================================================================

  const testGetProjects = async () => {
    setLoading(true);
    try {
      const response = await getProjects({
        page: 1,
        limit: 10,
        status: "active",
      });
      setResult(`✅ Found ${response.data.length} projects`);
      console.log("Projects:", response.data);
    } catch (error) {
      const errorInfo = handleApiError(error);
      setResult(`❌ Error: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateProject = async () => {
    setLoading(true);
    try {
      const project = await createProject({
        name: "Test Resort Project",
        description: "A test resort project",
        budget: 10000000000,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        category: "resort-design",
      });
      setResult(`✅ Created project: ${project.name}`);
      Alert.alert("Success", "Project created successfully");
    } catch (error) {
      const errorInfo = handleApiError(error);
      setResult(`❌ Error: ${errorInfo.message}`);
      Alert.alert("Error", errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // Products Examples
  // =========================================================================

  const testGetProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        page: 1,
        limit: 10,
        category: "resort-design",
      });
      setResult(`✅ Found ${response.data.length} products`);
      console.log("Products:", response.data);
    } catch (error) {
      const errorInfo = handleApiError(error);
      setResult(`❌ Error: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // Payments Examples
  // =========================================================================

  const testCreatePayment = async () => {
    setLoading(true);
    try {
      const payment = await createPayment({
        projectId: "proj_123",
        amount: 50000000,
        method: "bank_transfer",
        description: "Test payment",
      });
      setResult(`✅ Created payment: ${payment.id}`);
      Alert.alert("Success", "Payment created successfully");
    } catch (error) {
      const errorInfo = handleApiError(error);
      setResult(`❌ Error: ${errorInfo.message}`);
      Alert.alert("Error", errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ScrollView>
        <Section title="🔐 Authentication">
          <Button
            title="Test Login"
            onPress={testLogin}
            loading={loading}
            style={styles.button}
          />
          <Button
            title="Test Logout"
            onPress={testLogout}
            loading={loading}
            style={styles.button}
          />
        </Section>

        <Section title="📦 Projects">
          <Button
            title="Get Projects"
            onPress={testGetProjects}
            loading={loading}
            style={styles.button}
          />
          <Button
            title="Create Project"
            onPress={testCreateProject}
            loading={loading}
            style={styles.button}
          />
        </Section>

        <Section title="🛍️ Products">
          <Button
            title="Get Products"
            onPress={testGetProducts}
            loading={loading}
            style={styles.button}
          />
        </Section>

        <Section title="💳 Payments">
          <Button
            title="Create Payment"
            onPress={testCreatePayment}
            loading={loading}
            style={styles.button}
          />
        </Section>

        <Section title="📊 Result">
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              {result || "Click a button to test API"}
            </Text>
          </View>
        </Section>

        <Section title="💡 Tips">
          <Text style={styles.tipText}>
            • Check console logs for detailed responses{"\n"}• Update
            API_BASE_URL in config/env.ts for local testing{"\n"}• Use real
            credentials for login test{"\n"}• Refer to API_INTEGRATION.md for
            full documentation
          </Text>
        </Section>
      </ScrollView>
    </Container>
  );
}

// ============================================================================
// Example: Chat Component
// ============================================================================

export function ChatExample({ projectId }: { projectId: string }) {
  const {
    connected,
    messages,
    sendMessage,
    typingUsers,
    startTyping,
    stopTyping,
  } = useChat(projectId);
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text, "text");
      setText("");
      stopTyping();
    }
  };

  const handleChangeText = (value: string) => {
    setText(value);
    if (value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <View style={styles.chatContainer}>
      <Text style={styles.statusText}>
        Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}
      </Text>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageItem}>
            <Text style={styles.messageUser}>
              {msg.senderName || "Unknown"}
            </Text>
            <Text style={styles.messageContent}>{msg.body}</Text>
          </View>
        ))}
      </ScrollView>

      {typingUsers.length > 0 && (
        <Text style={styles.typingText}>
          {typingUsers.map((u) => u.userName).join(", ")} đang gõ...
        </Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          placeholder="Nhập tin nhắn..."
          onSubmitEditing={handleSend}
        />
        <Button title="Gửi" onPress={handleSend} />
      </View>
    </View>
  );
}

// ============================================================================
// Example: Notifications Component
// ============================================================================

export function NotificationsExample() {
  const { connected, notifications, unreadCount } = useNotifications();

  return (
    <View style={styles.notificationsContainer}>
      <Text style={styles.statusText}>
        Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}
      </Text>
      <Text style={styles.unreadText}>Unread: {unreadCount}</Text>

      <ScrollView>
        {notifications.map((notif) => (
          <View key={notif.id} style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{notif.title}</Text>
            <Text style={styles.notificationMessage}>{notif.body}</Text>
            <Text style={styles.notificationTime}>
              {new Date(notif.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  button: {
    marginBottom: 12,
  },
  resultBox: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 8,
    minHeight: 100,
  },
  resultText: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  chatContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  messageUser: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
  },
  typingText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  notificationsContainer: {
    flex: 1,
  },
  unreadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E82A34",
    marginBottom: 16,
  },
  notificationItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#666",
  },
});
