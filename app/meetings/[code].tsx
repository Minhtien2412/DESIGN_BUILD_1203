/**
 * Meeting Room by Code - Join meeting using invite code
 * Route: /meetings/[code]
 */

import { useAuth } from "@/context/AuthContext";
import {
    getMeetingByCode,
    joinMeeting,
    type Meeting,
} from "@/services/meeting.service";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MeetingCodeScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    bg: isDark ? "#000000" : "#FFFFFF",
    card: isDark ? "#111111" : "#F8F8F8",
    text: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "#999999" : "#666666",
    textMuted: isDark ? "#666666" : "#999999",
    border: isDark ? "#222222" : "#E5E5E5",
    accent: isDark ? "#FFFFFF" : "#000000",
    accentSoft: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    success: "#34C759",
    error: "#FF3B30",
  };

  useEffect(() => {
    if (code) {
      loadMeeting();
    }
  }, [code]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const data = await getMeetingByCode(code!);
      setMeeting(data);
      if (data.isPasswordProtected) {
        setShowPasswordInput(true);
      }
    } catch (error) {
      console.error("[MeetingCode] Error loading meeting:", error);
      Alert.alert("Lỗi", "Không tìm thấy cuộc họp với mã này");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!meeting) return;

    try {
      setJoining(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await joinMeeting(meeting.id, password || undefined);

      // Navigate to meeting room
      router.replace(`/meetings/room?meetingId=${meeting.id}`);
    } catch (error: any) {
      console.error("[MeetingCode] Join error:", error);
      if (error.message?.includes("password")) {
        setShowPasswordInput(true);
        Alert.alert("Lỗi", "Mật khẩu không đúng");
      } else {
        Alert.alert("Lỗi", "Không thể tham gia cuộc họp");
      }
    } finally {
      setJoining(false);
    }
  };

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang tìm cuộc họp...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Tham gia cuộc họp
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.springify()}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.accentSoft },
            ]}
          >
            <Ionicons name="videocam" size={40} color={colors.accent} />
          </View>

          <Text style={[styles.meetingTitle, { color: colors.text }]}>
            {meeting?.title || "Cuộc họp"}
          </Text>

          <View style={styles.codeContainer}>
            <Text style={[styles.codeLabel, { color: colors.textMuted }]}>
              Mã cuộc họp
            </Text>
            <Text style={[styles.codeText, { color: colors.text }]}>
              {code}
            </Text>
          </View>

          {meeting?.host && (
            <View style={styles.hostInfo}>
              <Text style={[styles.hostLabel, { color: colors.textMuted }]}>
                Chủ trì:
              </Text>
              <Text style={[styles.hostName, { color: colors.textSecondary }]}>
                {meeting.host.name}
              </Text>
            </View>
          )}

          {showPasswordInput && (
            <View style={styles.passwordContainer}>
              <Text style={[styles.passwordLabel, { color: colors.textMuted }]}>
                Cuộc họp yêu cầu mật khẩu
              </Text>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          )}

          <AnimatedPressable
            style={[
              styles.joinButton,
              { backgroundColor: colors.accent },
              animStyle,
            ]}
            onPress={handleJoin}
            onPressIn={() => {
              scale.value = withSpring(0.96);
            }}
            onPressOut={() => {
              scale.value = withSpring(1);
            }}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator color={colors.bg} size="small" />
            ) : (
              <>
                <Ionicons name="enter-outline" size={20} color={colors.bg} />
                <Text style={[styles.joinButtonText, { color: colors.bg }]}>
                  Tham gia ngay
                </Text>
              </>
            )}
          </AnimatedPressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { fontSize: 16 },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  meetingTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  codeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  hostLabel: { fontSize: 14 },
  hostName: { fontSize: 14, fontWeight: "500" },
  passwordContainer: {
    width: "100%",
    marginBottom: 24,
  },
  passwordLabel: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: "100%",
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
