/**
 * QRScannerScreen.tsx
 *
 * QR code and barcode scanner screen with result handling,
 * history, and action shortcuts.
 *
 * Story: CAM-003 - QR/Barcode Scanner
 */

import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

import { useThemeColor } from "../../hooks/useThemeColor";
import {
    BARCODE_TYPE_NAMES,
    CATEGORY_ICONS,
    CATEGORY_LABELS,
    detectCategory,
    formatScanResult,
    formatScanTime,
    getAvailableActions,
    performDefaultAction,
    ScanHistoryEntry,
    ScanResult,
    useQRScanner,
    useScanHistory,
    useScannerSettings
} from "../../services/QRScannerService";

// ============================================================================
// Scanner Frame Overlay
// ============================================================================

interface ScannerFrameProps {
  isScanning: boolean;
}

function ScannerFrame({ isScanning }: ScannerFrameProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      // Scanning line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.stopAnimation();
    }
  }, [isScanning, animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <View style={frameStyles.container}>
      {/* Top overlay */}
      <View style={frameStyles.overlay} />

      {/* Middle row */}
      <View style={frameStyles.middleRow}>
        {/* Left overlay */}
        <View style={frameStyles.sideOverlay} />

        {/* Scanner frame */}
        <View style={frameStyles.frame}>
          {/* Corner markers */}
          <View style={[frameStyles.corner, frameStyles.topLeft]} />
          <View style={[frameStyles.corner, frameStyles.topRight]} />
          <View style={[frameStyles.corner, frameStyles.bottomLeft]} />
          <View style={[frameStyles.corner, frameStyles.bottomRight]} />

          {/* Scanning line */}
          {isScanning && (
            <Animated.View
              style={[frameStyles.scanLine, { transform: [{ translateY }] }]}
            />
          )}
        </View>

        {/* Right overlay */}
        <View style={frameStyles.sideOverlay} />
      </View>

      {/* Bottom overlay */}
      <View style={frameStyles.overlay} />
    </View>
  );
}

const frameStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleRow: {
    flexDirection: "row",
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  frame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#00D4FF",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: "#00D4FF",
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});

// ============================================================================
// Result Modal
// ============================================================================

interface ResultModalProps {
  visible: boolean;
  result: ScanResult | null;
  onClose: () => void;
  onSaveToHistory: () => void;
}

function ResultModal({
  visible,
  result,
  onClose,
  onSaveToHistory,
}: ResultModalProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  if (!result) return null;

  const category = detectCategory(result.data);
  const actions = getAvailableActions(result);

  const handleAction = async (action: () => Promise<boolean>) => {
    await action();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor }]}>
          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.categoryBadge}>
              <Ionicons
                name={CATEGORY_ICONS[category] as "link-outline"}
                size={20}
                color="#00D4FF"
              />
              <Text style={modalStyles.categoryText}>
                {CATEGORY_LABELS[category]}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={modalStyles.content}>
            <Text style={modalStyles.barcodeType}>
              {BARCODE_TYPE_NAMES[result.type]}
            </Text>
            <Text style={[modalStyles.data, { color: textColor }]} selectable>
              {result.data}
            </Text>
          </View>

          {/* Actions */}
          <View style={modalStyles.actions}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={modalStyles.actionButton}
                onPress={() => handleAction(action.action)}
              >
                <Ionicons
                  name={action.icon as "link-outline"}
                  size={24}
                  color="#FFF"
                />
                <Text style={modalStyles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer buttons */}
          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={[modalStyles.footerButton, modalStyles.secondaryButton]}
              onPress={onSaveToHistory}
            >
              <Ionicons name="bookmark-outline" size={20} color="#00D4FF" />
              <Text style={modalStyles.secondaryButtonText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.footerButton, modalStyles.primaryButton]}
              onPress={async () => {
                await performDefaultAction(result);
              }}
            >
              <Text style={modalStyles.primaryButtonText}>Mở</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: "#00D4FF",
    marginLeft: 6,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginBottom: 20,
  },
  barcodeType: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  data: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 80,
  },
  actionLabel: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
  },
  primaryButton: {
    backgroundColor: "#00D4FF",
  },
  secondaryButtonText: {
    color: "#00D4FF",
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "600",
  },
});

// ============================================================================
// History Screen
// ============================================================================

interface HistoryScreenProps {
  visible: boolean;
  onClose: () => void;
}

function HistoryScreen({ visible, onClose }: HistoryScreenProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const { history, loading, removeEntry, toggleFavorite, clear } =
    useScanHistory();
  const [selectedEntry, setSelectedEntry] = useState<ScanHistoryEntry | null>(
    null
  );

  const handleDelete = (id: string) => {
    Alert.alert("Xóa mục này?", "Bạn có chắc muốn xóa mục này khỏi lịch sử?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => removeEntry(id),
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert("Xóa tất cả?", "Bạn có chắc muốn xóa toàn bộ lịch sử quét?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa tất cả",
        style: "destructive",
        onPress: () => clear(),
      },
    ]);
  };

  const renderItem = ({ item }: { item: ScanHistoryEntry }) => (
    <TouchableOpacity
      style={historyStyles.item}
      onPress={() => setSelectedEntry(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={historyStyles.iconContainer}>
        <Ionicons
          name={CATEGORY_ICONS[item.category] as "link-outline"}
          size={24}
          color="#00D4FF"
        />
      </View>
      <View style={historyStyles.itemContent}>
        <Text
          style={[historyStyles.itemTitle, { color: textColor }]}
          numberOfLines={1}
        >
          {formatScanResult(item)}
        </Text>
        <Text style={historyStyles.itemMeta}>
          {BARCODE_TYPE_NAMES[item.type]} • {formatScanTime(item.timestamp)}
        </Text>
      </View>
      <TouchableOpacity
        style={historyStyles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons
          name={item.favorite ? "star" : "star-outline"}
          size={20}
          color={item.favorite ? "#FFD700" : "#888"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[historyStyles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={historyStyles.header}>
          <TouchableOpacity onPress={onClose} style={historyStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[historyStyles.title, { color: textColor }]}>
            Lịch sử quét
          </Text>
          {history.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={historyStyles.clearButton}
            >
              <Ionicons name="trash-outline" size={22} color="#FF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={historyStyles.emptyContainer}>
            <Text style={historyStyles.emptyText}>Đang tải...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={historyStyles.emptyContainer}>
            <Ionicons name="scan-outline" size={64} color="#888" />
            <Text style={historyStyles.emptyText}>Chưa có lịch sử quét</Text>
            <Text style={historyStyles.emptySubtext}>
              Các mã bạn quét sẽ xuất hiện ở đây
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={historyStyles.list}
          />
        )}

        {/* Selected entry modal */}
        {selectedEntry && (
          <ResultModal
            visible={!!selectedEntry}
            result={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onSaveToHistory={() => {}}
          />
        )}
      </View>
    </Modal>
  );
}

const historyStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  clearButton: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  itemMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  favoriteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});

// ============================================================================
// Main QR Scanner Screen
// ============================================================================

interface QRScannerScreenProps {
  onScanComplete?: (result: ScanResult) => void;
  showHeader?: boolean;
}

export function QRScannerScreen({
  onScanComplete,
  showHeader = true,
}: QRScannerScreenProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { settings } = useScannerSettings();
  const { addEntry } = useScanHistory();

  const handleScan = useCallback(
    (result: ScanResult) => {
      // Vibrate on scan
      if (settings.enableVibration) {
        Vibration.vibrate(100);
      }

      // Show result
      setShowResult(true);
      pauseScanner();

      // Callback
      onScanComplete?.(result);
    },
    [settings.enableVibration, onScanComplete]
  );

  const {
    isScanning,
    lastScan,
    handleBarCodeScanned,
    resetScanner,
    pauseScanner,
  } = useQRScanner(handleScan);

  const handleCloseResult = () => {
    setShowResult(false);
    resetScanner();
  };

  const handleSaveToHistory = async () => {
    if (lastScan) {
      await addEntry(lastScan);
      Alert.alert("Đã lưu", "Mã đã được lưu vào lịch sử");
    }
  };

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Đang kiểm tra quyền camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color="#888" />
        <Text style={styles.permissionTitle}>Cần quyền truy cập Camera</Text>
        <Text style={styles.permissionText}>
          Để quét mã QR và barcode, ứng dụng cần quyền truy cập camera của bạn
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Cấp quyền Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: settings.allowedBarcodeTypes.map((t) =>
            t === "qr" ? "qr" : t.replace("_", "-")
          ) as Array<
            | "qr"
            | "aztec"
            | "ean13"
            | "ean8"
            | "pdf417"
            | "upc_e"
            | "datamatrix"
            | "code39"
            | "code93"
            | "itf14"
            | "codabar"
            | "code128"
            | "upc_a"
          >,
        }}
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
      />

      {/* Scanner overlay */}
      <ScannerFrame isScanning={isScanning} />

      {/* Header */}
      {showHeader && (
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quét mã</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowHistory(true)}
          >
            <Ionicons name="time-outline" size={26} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          {isScanning ? "Đưa mã vào khung để quét" : "Đã quét thành công!"}
        </Text>
      </View>

      {/* Controls */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.controls}
      >
        <TouchableOpacity
          style={[
            styles.controlButton,
            flashEnabled && styles.controlButtonActive,
          ]}
          onPress={() => setFlashEnabled(!flashEnabled)}
        >
          <Ionicons
            name={flashEnabled ? "flash" : "flash-outline"}
            size={24}
            color="#FFF"
          />
          <Text style={styles.controlLabel}>Đèn flash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowHistory(true)}
        >
          <Ionicons name="list-outline" size={24} color="#FFF" />
          <Text style={styles.controlLabel}>Lịch sử</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Result modal */}
      <ResultModal
        visible={showResult}
        result={lastScan}
        onClose={handleCloseResult}
        onSaveToHistory={handleSaveToHistory}
      />

      {/* History screen */}
      <HistoryScreen
        visible={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  instructions: {
    position: "absolute",
    top: "55%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 30,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    gap: 40,
  },
  controlButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  controlButtonActive: {
    backgroundColor: "rgba(0, 212, 255, 0.3)",
  },
  controlLabel: {
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 20,
  },
  permissionText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: "#00D4FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  permissionButtonText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default QRScannerScreen;
