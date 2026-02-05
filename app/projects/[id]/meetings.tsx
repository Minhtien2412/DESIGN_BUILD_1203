/**
 * Meeting Notes Screen
 * Document project meetings with agenda, decisions, and action items
 */

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import {
    communicationService,
    type MeetingNote,
} from "@/services/api/communication.service";

export default function MeetingNotesScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, "primary");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");
  const background = useThemeColor({}, "background");
  const surface = useThemeColor({}, "surface");

  const [meetings, setMeetings] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      setError(null);

      if (!projectId || Number.isNaN(Number(projectId))) {
        setMeetings([]);
        setError("Thiếu mã dự án hợp lệ");
        return;
      }

      const response = await communicationService.getMeetingNotes(
        Number(projectId),
      );

      if (response?.success) {
        setMeetings(response.data || []);
      } else {
        setMeetings(response.data || []);
        if (response?.message) setError(response.message);
      }
    } catch (error: any) {
      console.error("Load meetings failed:", error);
      setError("Không thể tải danh sách biên bản họp");
      Alert.alert("Lỗi", "Không thể tải danh sách cuộc họp");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeetings();
    setRefreshing(false);
  };

  const filteredMeetings = meetings;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMeeting = ({ item }: { item: MeetingNote }) => {
    const attendedCount = item.attendees.filter((a) => a.isPresent).length;
    const completedActions = item.actionItems.filter(
      (a) => a.status === "COMPLETED",
    ).length;

    return (
      <Pressable
        style={[
          styles.meetingCard,
          { backgroundColor: surface, borderColor: border },
        ]}
        onPress={() =>
          router.push(`/projects/${projectId}/meetings/${item.id}` as any)
        }
      >
        <View style={styles.meetingContent}>
          <View style={styles.titleRow}>
            <Ionicons name="document-text-outline" size={16} color={primary} />
            <Text
              style={[styles.meetingTitle, { color: text }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={textMuted} />
            <Text style={[styles.metaText, { color: textMuted }]}>
              {formatDate(item.meetingDate)}
            </Text>
          </View>

          {!!item.duration && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={textMuted} />
              <Text style={[styles.metaText, { color: textMuted }]}>
                {item.duration} phút
              </Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={textMuted} />
            <Text style={[styles.metaText, { color: textMuted }]}>
              {item.location || "Chưa cập nhật địa điểm"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={textMuted} />
            <Text style={[styles.metaText, { color: textMuted }]}>
              Người tạo: {item.createdByName || "Chưa rõ"}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={primary} />
              <Text style={[styles.statText, { color: text }]}>
                {attendedCount}/{item.attendees.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={primary}
              />
              <Text style={[styles.statText, { color: text }]}>
                {item.decisions.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={primary}
              />
              <Text style={[styles.statText, { color: text }]}>
                {completedActions}/{item.actionItems.length}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: background },
        ]}
      >
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: surface, borderBottomColor: border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Biên bản họp</Text>
        <Pressable
          onPress={() =>
            router.push(`/projects/${projectId}/create-meeting` as any)
          }
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={primary} />
        </Pressable>
      </View>

      {/* Meeting List */}
      <FlatList
        data={filteredMeetings}
        renderItem={renderMeeting}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.meetingList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={textMuted}
            />
            <Text style={[styles.emptyText, { color: textMuted }]}>
              {error ? "Không thể tải biên bản họp" : "Chưa có biên bản họp"}
            </Text>
            {!!error && (
              <Text style={[styles.emptySubtext, { color: textMuted }]}>
                {" "}
                {error}{" "}
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  addButton: {
    padding: 4,
  },
  meetingList: {
    padding: 16,
    gap: 12,
  },
  meetingCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  meetingContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
});
