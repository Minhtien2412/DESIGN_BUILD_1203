/**
 * VideoErrorOverlay - Component hiển thị lỗi video và nút retry
 *
 * @see PRODUCT_BACKLOG.md VIDEO-002 T3, T4
 */

import {
    VideoError,
    VideoErrorType
} from "@/services/VideoErrorHandler";
import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface VideoErrorOverlayProps {
  error: VideoError | null;
  thumbnail?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  style?: any;
}

export function VideoErrorOverlay({
  error,
  thumbnail,
  onRetry,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  style,
}: VideoErrorOverlayProps) {
  if (!error) return null;

  const canRetry = error.retryable && retryCount < maxRetries;
  const errorIcon = getErrorIcon(error.type);

  return (
    <View style={[styles.container, style]}>
      {/* Thumbnail background if available */}
      {thumbnail && (
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnailBackground}
          blurRadius={10}
        />
      )}

      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Error content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={errorIcon} size={48} color="#fff" />
        </View>

        <Text style={styles.errorTitle}>Không thể phát video</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>

        {/* Retry button */}
        {canRetry && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              isRetrying && styles.retryButtonDisabled,
            ]}
            onPress={onRetry}
            disabled={isRetrying}
            activeOpacity={0.7}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryText}>
                  Thử lại{" "}
                  {retryCount > 0 ? `(${retryCount}/${maxRetries})` : ""}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Can't retry message */}
        {!canRetry && !isRetrying && (
          <Text style={styles.cantRetryText}>
            {retryCount >= maxRetries
              ? "Đã vượt quá số lần thử lại"
              : "Không thể khắc phục lỗi này"}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Compact error banner for inline display
 */
interface VideoErrorBannerProps {
  error: VideoError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
}

export function VideoErrorBanner({
  error,
  onRetry,
  onDismiss,
  style,
}: VideoErrorBannerProps) {
  if (!error) return null;

  return (
    <View style={[styles.banner, style]}>
      <View style={styles.bannerContent}>
        <Ionicons name={getErrorIcon(error.type)} size={20} color="#f44336" />
        <Text style={styles.bannerText} numberOfLines={1}>
          {error.message}
        </Text>
      </View>

      <View style={styles.bannerActions}>
        {error.retryable && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.bannerButton}>
            <Ionicons name="refresh" size={18} color="#2196F3" />
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.bannerButton}>
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/**
 * Get appropriate icon for error type
 */
function getErrorIcon(type: VideoErrorType): keyof typeof Ionicons.glyphMap {
  const icons: Record<VideoErrorType, keyof typeof Ionicons.glyphMap> = {
    [VideoErrorType.NETWORK]: "cloud-offline",
    [VideoErrorType.TIMEOUT]: "time-outline",
    [VideoErrorType.CODEC]: "film-outline",
    [VideoErrorType.FORBIDDEN]: "lock-closed",
    [VideoErrorType.NOT_FOUND]: "help-circle-outline",
    [VideoErrorType.SERVER_ERROR]: "server-outline",
    [VideoErrorType.UNKNOWN]: "alert-circle-outline",
  };
  return icons[type] || "alert-circle-outline";
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  thumbnailBackground: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  retryButtonDisabled: {
    backgroundColor: "#666",
  },
  retryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  cantRetryText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },

  // Banner styles
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff3f3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#f44336",
  },
  bannerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  bannerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bannerButton: {
    padding: 6,
  },
});
