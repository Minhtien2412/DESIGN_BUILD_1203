/**
 * YouTube Player Component
 * ========================
 *
 * Trình phát YouTube video trong app sử dụng WebView
 * Hỗ trợ cả YouTube links và YouTube embeds
 *
 * @author ThietKeResort Team
 * @created 2025-01-20
 */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Helper Functions
// ============================================

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/,
    // Short URL: youtu.be/VIDEO_ID
    /youtu\.be\/([^?&]+)/,
    // Embed URL: youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([^?&]+)/,
    // Mobile URL: m.youtube.com/watch?v=VIDEO_ID
    /m\.youtube\.com\/watch\?v=([^&]+)/,
    // YouTube Shorts: youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube embed HTML
 */
function generateYouTubeEmbed(videoId: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { 
            width: 100%; 
            height: 100%; 
            background: #000; 
            overflow: hidden;
          }
          .container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&showinfo=0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </body>
    </html>
  `;
}

// ============================================
// Types
// ============================================

interface YouTubePlayerProps {
  visible: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

interface YouTubeEmbedProps {
  videoId: string;
  autoPlay?: boolean;
  style?: object;
}

// ============================================
// YouTube Embed Component (Inline)
// ============================================

export const YouTubeEmbed = memo(
  ({ videoId, autoPlay = false, style }: YouTubeEmbedProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0${autoPlay ? "&autoplay=1" : ""}`;

    if (error) {
      return (
        <View style={[styles.embedContainer, styles.errorContainer, style]}>
          <Ionicons name="alert-circle" size={32} color="#ff4444" />
          <Text style={styles.errorText}>Không thể tải video</Text>
        </View>
      );
    }

    return (
      <View style={[styles.embedContainer, style]}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ff0000" />
            <Text style={styles.loadingText}>Đang tải video...</Text>
          </View>
        )}
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onError={() => setError(true)}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
        />
      </View>
    );
  }
);

// ============================================
// YouTube Player Modal (Full Screen)
// ============================================

export const YouTubePlayer = memo(
  ({ visible, url, title, onClose }: YouTubePlayerProps) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const videoId = extractYouTubeId(url);

    const handleClose = useCallback(() => {
      setLoading(true);
      setError(false);
      onClose();
    }, [onClose]);

    if (!videoId) {
      return (
        <Modal
          visible={visible}
          animationType="fade"
          onRequestClose={handleClose}
        >
          <View style={[styles.modal, { paddingTop: insets.top }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Video
              </Text>
              <View style={styles.placeholder} />
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ff4444" />
              <Text style={styles.errorText}>URL video không hợp lệ</Text>
              <Text style={styles.errorSubtext}>{url}</Text>
            </View>
          </View>
        </Modal>
      );
    }

    const embedHtml = generateYouTubeEmbed(videoId);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
        supportedOrientations={["portrait", "landscape"]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title || "Đang phát video"}
            </Text>
            <TouchableOpacity style={styles.moreBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Video Player */}
          <View style={styles.playerContainer}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#ff0000" />
                <Text style={styles.loadingText}>
                  Đang tải video YouTube...
                </Text>
              </View>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="videocam-off" size={48} color="#ff4444" />
                <Text style={styles.errorText}>Không thể phát video</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => setError(false)}
                >
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <WebView
                source={{ html: embedHtml }}
                style={styles.webview}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={["*"]}
              />
            )}
          </View>

          {/* Video Info */}
          {title && (
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{title}</Text>
              <View style={styles.videoActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="heart-outline" size={22} color="#fff" />
                  <Text style={styles.actionText}>Thích</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons
                    name="share-social-outline"
                    size={22}
                    color="#fff"
                  />
                  <Text style={styles.actionText}>Chia sẻ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="download-outline" size={22} color="#fff" />
                  <Text style={styles.actionText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    );
  }
);

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#111",
  },
  closeBtn: {
    padding: 8,
  },
  moreBtn: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 8,
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 10,
  },
  loadingText: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  errorSubtext: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  videoInfo: {
    padding: 16,
    backgroundColor: "#111",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 22,
  },
  videoActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  actionBtn: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: "#888",
    fontSize: 12,
  },

  // Embed styles
  embedContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
});

export default YouTubePlayer;
