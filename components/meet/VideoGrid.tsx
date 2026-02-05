/**
 * VideoGrid - Multi-participant video layout for meetings
 *
 * Features:
 * - Grid view: Equal-sized tiles for all participants
 * - Speaker view: Large active speaker + small thumbnails
 * - Spotlight view: Pin specific participant
 * - Screen share detection
 * - Audio level indicators
 * - Connection quality badges
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

// ============================================================================
// TYPES
// ============================================================================

export interface VideoParticipant {
  id: string;
  name: string;
  avatar?: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "unknown";
  audioLevel: number; // 0-100
  videoTrack?: any; // RTCTrack or LiveKit VideoTrack
  screenTrack?: any;
}

export type ViewMode = "grid" | "speaker" | "spotlight";

export interface VideoGridProps {
  participants: VideoParticipant[];
  localParticipant?: VideoParticipant;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  spotlightParticipantId?: string;
  onSpotlightChange?: (participantId: string | null) => void;
  onParticipantPress?: (participant: VideoParticipant) => void;
  showControls?: boolean;
  maxVisibleParticipants?: number;
  style?: ViewStyle;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  background: "#1a1a1a",
  tile: "#2a2a2a",
  text: "#ffffff",
  textSecondary: "#888888",
  accent: "#6366f1",
  speaking: "#22c55e",
  muted: "#ef4444",
  excellent: "#22c55e",
  good: "#eab308",
  poor: "#ef4444",
  overlay: "rgba(0,0,0,0.5)",
};

// ============================================================================
// VIDEO TILE COMPONENT
// ============================================================================

interface VideoTileProps {
  participant: VideoParticipant;
  size: { width: number; height: number };
  isSpotlight?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

function VideoTile({
  participant,
  size,
  isSpotlight,
  onPress,
  onLongPress,
}: VideoTileProps) {
  const connectionColor = {
    excellent: COLORS.excellent,
    good: COLORS.good,
    poor: COLORS.poor,
    unknown: COLORS.textSecondary,
  }[participant.connectionQuality];

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        { width: size.width, height: size.height },
        participant.isSpeaking && styles.tileSpeaking,
        isSpotlight && styles.tileSpotlight,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      {/* Video placeholder - replace with actual RTCView/LiveKitVideoView */}
      <View style={styles.videoContainer}>
        {participant.isVideoEnabled ? (
          <View style={styles.videoPlaceholder}>
            {/* In real implementation: <RTCView streamURL={...} /> */}
            <Ionicons name="videocam" size={40} color={COLORS.textSecondary} />
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {participant.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Screen share indicator */}
      {participant.isScreenSharing && (
        <View style={styles.screenShareBadge}>
          <Ionicons name="desktop-outline" size={14} color={COLORS.text} />
          <Text style={styles.screenShareText}>Đang chia sẻ màn hình</Text>
        </View>
      )}

      {/* Bottom overlay */}
      <View style={styles.tileOverlay}>
        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.tileName} numberOfLines={1}>
            {participant.name}
            {participant.isLocal ? " (Bạn)" : ""}
          </Text>
        </View>

        {/* Status icons */}
        <View style={styles.statusIcons}>
          {/* Connection quality */}
          <View
            style={[styles.qualityDot, { backgroundColor: connectionColor }]}
          />

          {/* Mute indicator */}
          {participant.isMuted && (
            <View style={styles.mutedIcon}>
              <Ionicons name="mic-off" size={14} color={COLORS.muted} />
            </View>
          )}

          {/* Speaking indicator */}
          {participant.isSpeaking && !participant.isMuted && (
            <View style={styles.speakingIcon}>
              <Ionicons name="volume-high" size={14} color={COLORS.speaking} />
            </View>
          )}
        </View>
      </View>

      {/* Audio level indicator */}
      {participant.isSpeaking && !participant.isMuted && (
        <View style={styles.audioLevelContainer}>
          <View
            style={[
              styles.audioLevel,
              { width: `${Math.min(100, participant.audioLevel)}%` },
            ]}
          />
        </View>
      )}

      {/* Spotlight indicator */}
      {isSpotlight && (
        <View style={styles.spotlightBadge}>
          <Ionicons name="pin" size={12} color={COLORS.text} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// VIEW MODE CONTROLS
// ============================================================================

interface ViewModeControlsProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  participantCount: number;
}

function ViewModeControls({
  currentMode,
  onModeChange,
  participantCount,
}: ViewModeControlsProps) {
  return (
    <View style={styles.viewModeControls}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          currentMode === "grid" && styles.modeButtonActive,
        ]}
        onPress={() => onModeChange("grid")}
      >
        <Ionicons
          name="grid-outline"
          size={18}
          color={currentMode === "grid" ? COLORS.accent : COLORS.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          currentMode === "speaker" && styles.modeButtonActive,
        ]}
        onPress={() => onModeChange("speaker")}
      >
        <Ionicons
          name="person-outline"
          size={18}
          color={
            currentMode === "speaker" ? COLORS.accent : COLORS.textSecondary
          }
        />
      </TouchableOpacity>

      <View style={styles.participantCountBadge}>
        <Ionicons
          name="people-outline"
          size={14}
          color={COLORS.textSecondary}
        />
        <Text style={styles.participantCountText}>{participantCount}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VideoGrid({
  participants,
  localParticipant,
  viewMode = "grid",
  onViewModeChange,
  spotlightParticipantId,
  onSpotlightChange,
  onParticipantPress,
  showControls = true,
  maxVisibleParticipants = 9,
  style,
}: VideoGridProps) {
  const [currentMode, setCurrentMode] = useState<ViewMode>(viewMode);

  // Combine participants with local participant
  const allParticipants = useMemo(() => {
    const list = [...participants];
    if (localParticipant && !list.find((p) => p.id === localParticipant.id)) {
      list.unshift(localParticipant);
    }
    return list;
  }, [participants, localParticipant]);

  // Find active speaker
  const activeSpeaker = useMemo(() => {
    return allParticipants.find((p) => p.isSpeaking) || allParticipants[0];
  }, [allParticipants]);

  // Find spotlight participant
  const spotlightParticipant = useMemo(() => {
    if (!spotlightParticipantId) return null;
    return allParticipants.find((p) => p.id === spotlightParticipantId);
  }, [allParticipants, spotlightParticipantId]);

  // Calculate tile sizes based on mode and participant count
  const calculateGridLayout = useCallback(
    (count: number) => {
      const containerWidth = SCREEN_WIDTH - 16;
      const containerHeight = SCREEN_HEIGHT - 200; // Account for controls

      let cols: number;
      let rows: number;

      if (count === 1) {
        cols = 1;
        rows = 1;
      } else if (count === 2) {
        cols = 2;
        rows = 1;
      } else if (count <= 4) {
        cols = 2;
        rows = 2;
      } else if (count <= 6) {
        cols = 3;
        rows = 2;
      } else if (count <= 9) {
        cols = 3;
        rows = 3;
      } else {
        cols = 4;
        rows = Math.ceil(Math.min(count, maxVisibleParticipants) / 4);
      }

      const tileWidth = (containerWidth - (cols - 1) * 8) / cols;
      const tileHeight = (containerHeight - (rows - 1) * 8) / rows;

      return { cols, rows, tileWidth, tileHeight };
    },
    [maxVisibleParticipants],
  );

  const handleModeChange = useCallback(
    (mode: ViewMode) => {
      setCurrentMode(mode);
      onViewModeChange?.(mode);
    },
    [onViewModeChange],
  );

  const handleParticipantPress = useCallback(
    (participant: VideoParticipant) => {
      onParticipantPress?.(participant);
    },
    [onParticipantPress],
  );

  const handleParticipantLongPress = useCallback(
    (participant: VideoParticipant) => {
      if (currentMode === "spotlight") {
        // Toggle spotlight
        if (spotlightParticipantId === participant.id) {
          onSpotlightChange?.(null);
        } else {
          onSpotlightChange?.(participant.id);
        }
      } else {
        // Switch to spotlight mode
        handleModeChange("spotlight");
        onSpotlightChange?.(participant.id);
      }
    },
    [currentMode, spotlightParticipantId, onSpotlightChange, handleModeChange],
  );

  // ============================================================================
  // RENDER GRID VIEW
  // ============================================================================

  const renderGridView = () => {
    const visibleParticipants = allParticipants.slice(
      0,
      maxVisibleParticipants,
    );
    const hiddenCount = allParticipants.length - maxVisibleParticipants;
    const { cols, tileWidth, tileHeight } = calculateGridLayout(
      visibleParticipants.length,
    );

    return (
      <View style={styles.gridContainer}>
        <FlatList
          data={visibleParticipants}
          keyExtractor={(item) => item.id}
          numColumns={cols}
          key={cols} // Force re-render when columns change
          renderItem={({ item }) => (
            <VideoTile
              participant={item}
              size={{ width: tileWidth, height: tileHeight }}
              onPress={() => handleParticipantPress(item)}
              onLongPress={() => handleParticipantLongPress(item)}
            />
          )}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={cols > 1 ? styles.gridRow : undefined}
          scrollEnabled={false}
        />

        {hiddenCount > 0 && (
          <View style={styles.hiddenCount}>
            <Text style={styles.hiddenCountText}>
              +{hiddenCount} người khác
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ============================================================================
  // RENDER SPEAKER VIEW
  // ============================================================================

  const renderSpeakerView = () => {
    const mainParticipant = activeSpeaker || allParticipants[0];
    const thumbnailParticipants = allParticipants.filter(
      (p) => p.id !== mainParticipant?.id,
    );

    const mainSize = {
      width: SCREEN_WIDTH - 16,
      height: SCREEN_HEIGHT - 300,
    };

    const thumbnailSize = {
      width: 100,
      height: 80,
    };

    return (
      <View style={styles.speakerContainer}>
        {/* Main speaker */}
        {mainParticipant && (
          <VideoTile
            participant={mainParticipant}
            size={mainSize}
            onPress={() => handleParticipantPress(mainParticipant)}
            onLongPress={() => handleParticipantLongPress(mainParticipant)}
          />
        )}

        {/* Thumbnail strip */}
        {thumbnailParticipants.length > 0 && (
          <FlatList
            data={thumbnailParticipants}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <VideoTile
                participant={item}
                size={thumbnailSize}
                onPress={() => handleParticipantPress(item)}
                onLongPress={() => handleParticipantLongPress(item)}
              />
            )}
            contentContainerStyle={styles.thumbnailStrip}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          />
        )}
      </View>
    );
  };

  // ============================================================================
  // RENDER SPOTLIGHT VIEW
  // ============================================================================

  const renderSpotlightView = () => {
    const mainParticipant =
      spotlightParticipant || activeSpeaker || allParticipants[0];
    const thumbnailParticipants = allParticipants.filter(
      (p) => p.id !== mainParticipant?.id,
    );

    const mainSize = {
      width: SCREEN_WIDTH - 16,
      height: SCREEN_HEIGHT - 300,
    };

    const thumbnailSize = {
      width: 100,
      height: 80,
    };

    return (
      <View style={styles.spotlightContainer}>
        {/* Pinned participant */}
        {mainParticipant && (
          <VideoTile
            participant={mainParticipant}
            size={mainSize}
            isSpotlight={!!spotlightParticipant}
            onPress={() => handleParticipantPress(mainParticipant)}
            onLongPress={() => handleParticipantLongPress(mainParticipant)}
          />
        )}

        {/* Thumbnail strip */}
        {thumbnailParticipants.length > 0 && (
          <FlatList
            data={thumbnailParticipants}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <VideoTile
                participant={item}
                size={thumbnailSize}
                onPress={() => handleParticipantPress(item)}
                onLongPress={() => handleParticipantLongPress(item)}
              />
            )}
            contentContainerStyle={styles.thumbnailStrip}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          />
        )}
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={[styles.container, style]}>
      {/* View mode controls */}
      {showControls && (
        <ViewModeControls
          currentMode={currentMode}
          onModeChange={handleModeChange}
          participantCount={allParticipants.length}
        />
      )}

      {/* Video grid/speaker/spotlight */}
      {currentMode === "grid" && renderGridView()}
      {currentMode === "speaker" && renderSpeakerView()}
      {currentMode === "spotlight" && renderSpotlightView()}

      {/* Empty state */}
      {allParticipants.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="people-outline"
            size={48}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyText}>Đang chờ người tham gia...</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // View mode controls
  viewModeControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  modeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.tile,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  participantCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.tile,
    borderRadius: 16,
    gap: 4,
  },
  participantCountText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  // Grid layout
  gridContainer: {
    flex: 1,
    padding: 8,
  },
  gridContent: {
    gap: 8,
  },
  gridRow: {
    gap: 8,
  },
  hiddenCount: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.overlay,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hiddenCountText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  // Speaker/Spotlight layout
  speakerContainer: {
    flex: 1,
    padding: 8,
  },
  spotlightContainer: {
    flex: 1,
    padding: 8,
  },
  thumbnailStrip: {
    paddingVertical: 8,
  },

  // Video tile
  tile: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.tile,
    margin: 4,
  },
  tileSpeaking: {
    borderWidth: 2,
    borderColor: COLORS.speaking,
  },
  tileSpotlight: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.tile,
  },
  avatarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "600",
  },
  screenShareBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  screenShareText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "500",
  },
  tileOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.overlay,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  nameContainer: {
    flex: 1,
  },
  tileName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "500",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mutedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  speakingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  audioLevelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(34, 197, 94, 0.3)",
  },
  audioLevel: {
    height: "100%",
    backgroundColor: COLORS.speaking,
  },
  spotlightBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default VideoGrid;
