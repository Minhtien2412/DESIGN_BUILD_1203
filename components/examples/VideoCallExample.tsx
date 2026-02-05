/**
 * Video Call Usage Example
 *
 * This example demonstrates how to:
 * 1. Navigate to video call screen
 * 2. Use video call service directly
 * 3. Handle video call events
 */

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useNotifications } from "@/context/NotificationsContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VideoCallExampleScreen() {
  const { notifications, unreadCount } = useNotifications();

  /**
   * Example 1: Start a video call
   */
  const startVideoCall = () => {
    const meetingId = "meeting-123"; // From backend or generate
    const participantName = "John Doe"; // From auth context

    // Navigate to video call room
    router.push(
      `/meetings/room?meetingId=${meetingId}&participantName=${encodeURIComponent(participantName)}` as Href,
    );
  };

  /**
   * Example 2: Start video call with custom config
   */
  const startVideoCallWithConfig = () => {
    const meetingId = "meeting-456";
    const participantName = "Jane Smith";

    // Navigate with camera/mic initially off
    router.push({
      pathname: `/meetings/room` as any,
      params: {
        meetingId,
        participantName,
        // Service will handle these via query params
        // For custom handling, extend the service
      },
    });
  };

  /**
   * Example 3: Join scheduled meeting from notification
   *
   * When user taps notification with type='meeting',
   * NotificationsContext automatically routes to /meetings/room
   *
   * Notification payload example:
   * {
   *   type: 'meeting',
   *   title: 'Meeting Starting Soon',
   *   body: 'Project kickoff meeting in 5 minutes',
   *   data: {
   *     meetingId: 'meeting-789',
   *     type: 'meeting'
   *   }
   * }
   */
  const handleMeetingNotification = () => {
    // This is handled automatically by NotificationsContext
    // No additional code needed!
    // User taps notification → routes to /meetings/room
  };

  /**
   * Example 4: Display notifications with video call invites
   */
  const getMeetingNotifications = () => {
    return notifications.filter((n) => n.type === "meeting");
  };

  return (
    <Container>
      <Text style={styles.title}>Video Call Examples</Text>

      {/* Example 1: Start Video Call */}
      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>Example 1: Start Video Call</Text>
        <Text style={styles.exampleDescription}>
          Launch a video call with default settings (camera and mic on)
        </Text>
        <Button onPress={startVideoCall}>
          <Ionicons
            name="videocam"
            size={20}
            color="#fff"
            style={styles.icon}
          />
          Start Video Call
        </Button>
      </View>

      {/* Example 2: Start with Custom Config */}
      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>Example 2: Custom Configuration</Text>
        <Text style={styles.exampleDescription}>
          Start video call with camera/mic initially off (user can enable later)
        </Text>
        <Button onPress={startVideoCallWithConfig}>
          <Ionicons
            name="videocam-off"
            size={20}
            color="#fff"
            style={styles.icon}
          />
          Start Call (Camera/Mic Off)
        </Button>
      </View>

      {/* Example 3: Notification Integration */}
      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>
          Example 3: Join from Notification
        </Text>
        <Text style={styles.exampleDescription}>
          Meeting invites appear as notifications. Tapping them automatically
          joins the call.
        </Text>
        <View style={styles.notificationBadge}>
          <Ionicons name="notifications" size={24} color="#0066CC" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Button onPress={() => router.push("/notifications")}>
          View Notifications
        </Button>
      </View>

      {/* Example 4: Meeting Notifications List */}
      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>
          Example 4: Meeting Notifications
        </Text>
        <Text style={styles.exampleDescription}>
          Display meeting-specific notifications with join buttons
        </Text>
        {getMeetingNotifications()
          .slice(0, 3)
          .map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.meetingCard}
              onPress={() => {
                // Notification tap is handled by NotificationsContext
                // This is just for UI demonstration
              }}
            >
              <Ionicons name="videocam" size={24} color="#0066CC" />
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingTitle}>{notification.title}</Text>
                <Text style={styles.meetingBody}>{notification.body}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        {getMeetingNotifications().length === 0 && (
          <Text style={styles.emptyText}>No meeting notifications</Text>
        )}
      </View>

      {/* Usage Notes */}
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>📝 Implementation Notes</Text>
        <Text style={styles.noteItem}>
          • Video calls require camera/microphone permissions
        </Text>
        <Text style={styles.noteItem}>
          • LiveKit token is fetched from backend /video/token
        </Text>
        <Text style={styles.noteItem}>
          • Call history is saved to backend on disconnect
        </Text>
        <Text style={styles.noteItem}>
          • Auto-reconnect on network interruption
        </Text>
        <Text style={styles.noteItem}>
          • Supports 4+ participants with adaptive grid
        </Text>
      </View>

      {/* API Integration Notes */}
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>🔌 Backend Integration</Text>
        <Text style={styles.noteItem}>
          POST /video/token - Get LiveKit access token
        </Text>
        <Text style={styles.noteItem}>
          Body: {`{ meetingId, participantName }`}
        </Text>
        <Text style={styles.noteItem}>
          Response: {`{ token, url, roomName }`}
        </Text>
        <Text style={styles.noteItem}>POST /video/end - Notify call ended</Text>
        <Text style={styles.noteItem}>Body: {`{ duration }`}</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  exampleContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  exampleDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  notificationBadge: {
    alignSelf: "center",
    marginVertical: 16,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#0066CC",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  meetingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  meetingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  meetingBody: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 16,
  },
  notesContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0066CC",
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    paddingLeft: 8,
  },
});
