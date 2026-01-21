/**
 * Video Cache Settings Component
 * VIDEO-003 T8: Settings UI for cache size
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useThemeColor } from "../../hooks/use-theme-color";
import {
    useCacheConfig,
    useCacheStats,
    VideoCacheManager,
} from "../../services/VideoCacheManager";

// ============================================================================
// TYPES
// ============================================================================

export interface VideoCacheSettingsProps {
  onClose?: () => void;
  showHeader?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatPercentage = (ratio: number): string => {
  return `${(ratio * 100).toFixed(1)}%`;
};

const CACHE_SIZE_OPTIONS = [
  { label: "500 MB", value: 500 * 1024 * 1024 },
  { label: "1 GB", value: 1024 * 1024 * 1024 },
  { label: "2 GB", value: 2 * 1024 * 1024 * 1024 },
  { label: "4 GB", value: 4 * 1024 * 1024 * 1024 },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function VideoCacheSettings({
  onClose,
  showHeader = true,
}: VideoCacheSettingsProps) {
  const { stats, refresh, clear } = useCacheStats();
  const { config, updateConfig } = useCacheConfig();
  const [isClearing, setIsClearing] = useState(false);
  const [prefetchEnabled, setPrefetchEnabled] = useState(
    config.prefetchAhead > 0
  );

  const colors = useThemeColor();
  const textColor = colors.text || "#1a1a1a";
  const secondaryText = colors.secondaryText || "#666";
  const background = colors.background || "#fff";
  const cardBg = colors.card || "#f5f5f5";
  const primaryColor = colors.primary || "#FF6B35";
  const dangerColor = "#FF4444";

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      "Xóa bộ nhớ đệm",
      "Bạn có chắc muốn xóa toàn bộ video đã cache? Thao tác này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              await clear();
              await refresh();
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, [clear, refresh]);

  const handleSizeChange = useCallback(
    async (newSize: number) => {
      await updateConfig({ maxSizeBytes: newSize });
      // Force cleanup if current size exceeds new quota
      if (stats && stats.totalSize > newSize) {
        await VideoCacheManager.performCleanup();
        await refresh();
      }
    },
    [updateConfig, stats, refresh]
  );

  const handlePrefetchToggle = useCallback(
    async (enabled: boolean) => {
      setPrefetchEnabled(enabled);
      await updateConfig({ prefetchAhead: enabled ? 2 : 0 });
    },
    [updateConfig]
  );

  const usagePercentage = stats
    ? Math.min((stats.totalSize / config.maxSizeBytes) * 100, 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Cài đặt Video Cache
          </Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Usage Stats */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Bộ nhớ đệm</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: "#e0e0e0" }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${usagePercentage}%`,
                  backgroundColor:
                    usagePercentage > 90 ? dangerColor : primaryColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: secondaryText }]}>
            {stats ? formatBytes(stats.totalSize) : "..."} /{" "}
            {formatBytes(config.maxSizeBytes)}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats?.entryCount ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              Videos
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats ? formatPercentage(stats.hitRate) : "0%"}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              Tỉ lệ hit
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats?.hitCount ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryText }]}>
              Hits
            </Text>
          </View>
        </View>

        {/* Clear Button */}
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: dangerColor }]}
          onPress={handleClearCache}
          disabled={isClearing || (stats?.entryCount ?? 0) === 0}
        >
          {isClearing ? (
            <ActivityIndicator size="small" color={dangerColor} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={dangerColor} />
              <Text style={[styles.clearButtonText, { color: dangerColor }]}>
                Xóa cache
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Cache Size Selection */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>
          Dung lượng tối đa
        </Text>
        <View style={styles.sizeOptions}>
          {CACHE_SIZE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sizeOption,
                {
                  borderColor:
                    config.maxSizeBytes === option.value
                      ? primaryColor
                      : "#e0e0e0",
                  backgroundColor:
                    config.maxSizeBytes === option.value
                      ? `${primaryColor}15`
                      : "transparent",
                },
              ]}
              onPress={() => handleSizeChange(option.value)}
            >
              <Text
                style={[
                  styles.sizeOptionText,
                  {
                    color:
                      config.maxSizeBytes === option.value
                        ? primaryColor
                        : textColor,
                    fontWeight:
                      config.maxSizeBytes === option.value ? "600" : "400",
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Prefetch Toggle */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text
              style={[styles.cardTitle, { color: textColor, marginBottom: 0 }]}
            >
              Tải trước video
            </Text>
            <Text style={[styles.toggleDescription, { color: secondaryText }]}>
              Tự động tải video tiếp theo để xem mượt hơn
            </Text>
          </View>
          <Switch
            value={prefetchEnabled}
            onValueChange={handlePrefetchToggle}
            trackColor={{ false: "#e0e0e0", true: `${primaryColor}50` }}
            thumbColor={prefetchEnabled ? primaryColor : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={secondaryText}
        />
        <Text style={[styles.infoText, { color: secondaryText }]}>
          Cache sẽ tự động dọn dẹp khi vượt quá dung lượng hoặc sau 30 phút.
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// COMPACT VERSION FOR INLINE USE
// ============================================================================

export function VideoCacheQuickStats() {
  const { stats } = useCacheStats();
  const { config } = useCacheConfig();

  const colors = useThemeColor();
  const secondaryText = colors.secondaryText || "#666";

  if (!stats) return null;

  const usagePercentage = Math.min(
    (stats.totalSize / config.maxSizeBytes) * 100,
    100
  );

  return (
    <View style={styles.quickStats}>
      <View style={[styles.quickProgressBar, { backgroundColor: "#e0e0e0" }]}>
        <View
          style={[
            styles.quickProgressFill,
            {
              width: `${usagePercentage}%`,
              backgroundColor: usagePercentage > 90 ? "#FF4444" : "#FF6B35",
            },
          ]}
        />
      </View>
      <Text style={[styles.quickStatsText, { color: secondaryText }]}>
        Cache: {formatBytes(stats.totalSize)} ({stats.entryCount} videos)
      </Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sizeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  sizeOptionText: {
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  // Quick Stats (compact)
  quickStats: {
    paddingVertical: 8,
  },
  quickProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  quickProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  quickStatsText: {
    fontSize: 12,
  },
});

export default VideoCacheSettings;
