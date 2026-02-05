/**
 * Meeting Detail Screen - View and manage meeting
 * Route: /meetings/[id]
 */

import { useAuth } from "@/context/AuthContext";
import {
    deleteMeeting,
    getMeetingById,
    type Meeting
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
    ScrollView,
    Share,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

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
    live: "#FF3B30",
  };

  useEffect(() => {
    if (id) {
      loadMeeting();
    }
  }, [id]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const data = await getMeetingById(id!);
      setMeeting(data);
    } catch (error) {
      console.error("[MeetingDetail] Error:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin cuộc họp");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (meeting) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(`/meetings/room?meetingId=${meeting.id}`);
    }
  };

  const handleShare = async () => {
    if (!meeting) return;
    try {
      await Share.share({
        message: `Tham gia cuộc họp "${meeting.title}"\nMã: ${meeting.code}\nLink: ${meeting.joinUrl}`,
      });
    } catch (error) {
      console.error("[MeetingDetail] Share error:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert("Xóa cuộc họp", "Bạn có chắc muốn xóa cuộc họp này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMeeting(id!);
            router.back();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa cuộc họp");
          }
        },
      },
    ]);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isHost = meeting?.hostId === user?.id;
  const isLive = meeting?.status === "active";

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
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
          Chi tiết cuộc họp
        </Text>
        <Pressable onPress={handleShare} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.springify()}
          style={[
            styles.mainCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.titleRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isLive ? colors.live : colors.accentSoft },
              ]}
            >
              <Ionicons
                name="videocam"
                size={24}
                color={isLive ? "#fff" : colors.accent}
              />
            </View>
            <View style={styles.titleInfo}>
              <View style={styles.titleWithBadge}>
                <Text
                  style={[styles.meetingTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {meeting?.title}
                </Text>
                {isLive && (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>
              {meeting?.description && (
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {meeting.description}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons
                name="code-outline"
                size={20}
                color={colors.textMuted}
              />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Mã cuộc họp
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {meeting?.code}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.textMuted}
              />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Thời gian
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {meeting?.scheduledAt
                  ? formatDateTime(meeting.scheduledAt)
                  : "Ngay bây giờ"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.textMuted}
              />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Thời lượng
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {meeting?.duration || 60} phút
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="people-outline"
                size={20}
                color={colors.textMuted}
              />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Số người tham gia
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {meeting?.participantCount || 0} /{" "}
                {meeting?.maxParticipants || 100}
              </Text>
            </View>

            {meeting?.isPasswordProtected && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textMuted}
                />
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Bảo mật
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  Yêu cầu mật khẩu
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.actions}
        >
          <Pressable
            style={[styles.joinButton, { backgroundColor: colors.accent }]}
            onPress={handleJoin}
          >
            <Ionicons name="enter-outline" size={20} color={colors.bg} />
            <Text style={[styles.joinButtonText, { color: colors.bg }]}>
              {isLive ? "Tham gia ngay" : "Bắt đầu cuộc họp"}
            </Text>
          </Pressable>

          {isHost && (
            <>
              <Pressable
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={() => router.push(`/meetings/create?edit=${id}`)}
              >
                <Ionicons name="create-outline" size={20} color={colors.text} />
                <Text
                  style={[styles.secondaryButtonText, { color: colors.text }]}
                >
                  Chỉnh sửa
                </Text>
              </Pressable>

              <Pressable
                style={[styles.deleteButton, { borderColor: colors.error }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text
                  style={[styles.deleteButtonText, { color: colors.error }]}
                >
                  Xóa cuộc họp
                </Text>
              </Pressable>
            </>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleInfo: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  meetingTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF3B30",
  },
  liveText: {
    color: "#FF3B30",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    gap: 12,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
