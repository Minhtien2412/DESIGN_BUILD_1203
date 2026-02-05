import { CallButton, CallHistoryList } from "@/components/call";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function CallTestScreen() {
  const [targetUserId, setTargetUserId] = useState("");
  const { user } = useAuth();
  const { connected, currentCall, incomingCall, callHistory } = useCall();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  const _handleTestCall = () => {
    const userId = parseInt(targetUserId);
    if (isNaN(userId)) {
      Alert.alert("Lỗi", "Vui lòng nhập ID người dùng hợp lệ");
      return;
    }
    // CallButton will handle the actual call
  };

  return (
    <ScrollView style={styles.container}>
      <Container>
        {/* Connection Status */}
        <Section title="🔌 Trạng thái kết nối">
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons
                name={connected ? "checkmark-circle" : "close-circle"}
                size={24}
                color={connected ? "#0066CC" : "#000000"}
              />
              <Text style={[styles.statusText, { color: textColor }]}>
                WebSocket: {connected ? "Đã kết nối" : "Ngắt kết nối"}
              </Text>
            </View>

            {user && (
              <View style={styles.userInfo}>
                <Text style={[styles.label, { color: textColor + "80" }]}>
                  Logged in as:
                </Text>
                <Text style={[styles.value, { color: textColor }]}>
                  {user.name} (ID: {user.id})
                </Text>
              </View>
            )}
          </View>
        </Section>

        {/* Test Call */}
        <Section title="📞 Test cuộc gọi">
          <View style={styles.testCard}>
            <Text style={[styles.label, { color: textColor + "80" }]}>
              ID người dùng muốn gọi:
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  borderColor,
                  backgroundColor: useThemeColor({}, "card"),
                },
              ]}
              placeholder="Nhập user ID (ví dụ: 2)"
              placeholderTextColor={textColor + "60"}
              value={targetUserId}
              onChangeText={setTargetUserId}
              keyboardType="number-pad"
            />

            {targetUserId && !isNaN(parseInt(targetUserId)) && (
              <View style={styles.callButtons}>
                <CallButton
                  userId={parseInt(targetUserId)}
                  userName={`User ${targetUserId}`}
                  type="video"
                  size="large"
                />
                <CallButton
                  userId={parseInt(targetUserId)}
                  userName={`User ${targetUserId}`}
                  type="audio"
                  size="large"
                />
              </View>
            )}

            <View style={styles.hint}>
              <Ionicons name="information-circle" size={16} color="#0EA5E9" />
              <Text style={styles.hintText}>
                Tạo test user trên server để test calling
              </Text>
            </View>
          </View>
        </Section>

        {/* Current Call Status */}
        {(currentCall || incomingCall) && (
          <Section title="📱 Cuộc gọi hiện tại">
            <View style={styles.statusCard}>
              {currentCall && (
                <View>
                  <Text style={[styles.label, { color: textColor + "80" }]}>
                    Đang gọi:
                  </Text>
                  <Text style={[styles.value, { color: textColor }]}>
                    {currentCall.callee?.name || currentCall.caller?.name}
                  </Text>
                  <Text style={[styles.status, { color: "#0EA5E9" }]}>
                    Status: {currentCall.status}
                  </Text>
                </View>
              )}

              {incomingCall && (
                <View>
                  <Text style={[styles.label, { color: textColor + "80" }]}>
                    Cuộc gọi đến:
                  </Text>
                  <Text style={[styles.value, { color: "#0066CC" }]}>
                    {incomingCall.caller?.name}
                  </Text>
                </View>
              )}
            </View>
          </Section>
        )}

        {/* Call History */}
        <CallHistoryList />

        {/* API Info */}
        <Section title="ℹ️ Thông tin API">
          <View style={styles.apiInfo}>
            <Text style={[styles.apiText, { color: textColor + "80" }]}>
              Backend: https://baotienweb.cloud
            </Text>
            <Text style={[styles.apiText, { color: textColor + "80" }]}>
              WebSocket: wss://baotienweb.cloud/call
            </Text>
            <Text style={[styles.apiText, { color: textColor + "80" }]}>
              Total calls: {callHistory.length}
            </Text>
          </View>
        </Section>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    marginTop: 8,
  },
  testCard: {
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  status: {
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  callButtons: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    marginTop: 8,
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: "#E8F4FF",
    borderRadius: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
  },
  apiInfo: {
    padding: 16,
    gap: 8,
  },
  apiText: {
    fontSize: 13,
    fontFamily: "monospace",
  },
});
