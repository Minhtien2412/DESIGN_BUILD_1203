import { Container } from "@/components/ui/container";
import { useMeeting } from "@/context/MeetingContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Meeting } from "@/types/meeting";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type FilterType = "all" | "in-progress" | "scheduled" | "completed";

export default function ProgressTrackingScreen() {
  const { meetings, setActiveMeeting, refreshLocation } = useMeeting();
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor("textMuted");
  const cardBg = useThemeColor({}, "card");

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  };

  const filteredMeetings = meetings.filter((meeting) => {
    if (filter === "all") return true;
    return meeting.status === filter;
  });

  const handleMeetingPress = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    router.push(`/meetings/${meeting.id}` as Href);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMeetingStatusColor = (status: Meeting["status"]) => {
    switch (status) {
      case "in-progress":
        return "#F59E0B";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6366F1";
    }
  };

  const getMeetingTypeIcon = (type: Meeting["type"]) => {
    switch (type) {
      case "meeting":
        return "people";
      case "site-inspection":
        return "construct";
      case "delivery":
        return "cube";
      case "construction":
        return "hammer";
      default:
        return "calendar";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBg }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Theo dõi Tiến độ
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <FilterChip
          label="Tất cả"
          count={meetings.length}
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterChip
          label="Đang diễn ra"
          count={meetings.filter((m) => m.status === "in-progress").length}
          active={filter === "in-progress"}
          onPress={() => setFilter("in-progress")}
          color="#F59E0B"
        />
        <FilterChip
          label="Sắp tới"
          count={meetings.filter((m) => m.status === "scheduled").length}
          active={filter === "scheduled"}
          onPress={() => setFilter("scheduled")}
          color="#6366F1"
        />
      </ScrollView>

      {/* Meeting List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Container>
          {filteredMeetings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={mutedColor} />
              <Text style={[styles.emptyText, { color: mutedColor }]}>
                Không có cuộc họp nào
              </Text>
            </View>
          ) : (
            <View style={styles.meetingList}>
              {filteredMeetings.map((meeting) => (
                <TouchableOpacity
                  key={meeting.id}
                  style={[styles.meetingCard, { backgroundColor: cardBg }]}
                  onPress={() => handleMeetingPress(meeting)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor:
                          getMeetingStatusColor(meeting.status) + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={getMeetingTypeIcon(meeting.type)}
                      size={24}
                      color={getMeetingStatusColor(meeting.status)}
                    />
                  </View>

                  <View style={styles.meetingContent}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[styles.meetingTitle, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {meeting.title}
                      </Text>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: getMeetingStatusColor(
                              meeting.status,
                            ),
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={mutedColor}
                      />
                      <Text
                        style={[styles.infoText, { color: mutedColor }]}
                        numberOfLines={1}
                      >
                        {formatDate(meeting.scheduledTime)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={mutedColor}
                      />
                      <Text
                        style={[styles.infoText, { color: mutedColor }]}
                        numberOfLines={1}
                      >
                        {meeting.location.name || meeting.location.address}
                      </Text>
                    </View>

                    <View style={styles.participantsSummary}>
                      <Text
                        style={[
                          styles.participantsCount,
                          { color: mutedColor },
                        ]}
                      >
                        {meeting.participants.length} người tham gia
                      </Text>
                      {meeting.status === "in-progress" && (
                        <>
                          <Text
                            style={[styles.separator, { color: mutedColor }]}
                          >
                            •
                          </Text>
                          <Text
                            style={[styles.arrivedCount, { color: "#10B981" }]}
                          >
                            {
                              meeting.participants.filter(
                                (p) => p.status === "arrived",
                              ).length
                            }{" "}
                            đã tới
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={mutedColor}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Container>
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  count,
  active,
  onPress,
  color = "#3B82F6",
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && { backgroundColor: color + "20", borderColor: color },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.filterLabel, active && { color }]}>{label}</Text>
      <View style={[styles.countBadge, active && { backgroundColor: color }]}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    marginTop: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
  },
  content: {
    flex: 1,
  },
  meetingList: {
    gap: 12,
    paddingVertical: 8,
  },
  meetingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  meetingContent: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meetingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
  },
  participantsSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  participantsCount: {
    fontSize: 12,
  },
  separator: {
    fontSize: 12,
  },
  arrivedCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
