/**
 * QR Scanner Tool
 * Quét mã QR cho vật liệu, sản phẩm, thợ
 */

import { Ionicons } from "@expo/vector-icons";
import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#7CB342",
  primaryDark: "#689F38",
  text: "#1A1A2E",
  textSecondary: "#4A4A68",
  textLight: "#8E8EA0",
  white: "#FFFFFF",
  bg: "#FAFBFC",
  border: "#E8ECF0",
  overlay: "rgba(0,0,0,0.7)",
  success: "#43A047",
  warning: "#FF9800",
  error: "#E53935",
};

interface ScanResult {
  type: string;
  data: string;
}

export default function QRScannerScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  const handleBarCodeScanned = useCallback(
    ({ type, data }: BarcodeScanningResult) => {
      if (scanned) return;

      setScanned(true);
      Vibration.vibrate(100);

      setScanResult({ type, data });
    },
    [scanned],
  );

  const handleScanAgain = useCallback(() => {
    setScanned(false);
    setScanResult(null);
  }, []);

  const handleOpenLink = useCallback(() => {
    if (!scanResult?.data) return;

    // Check if it's a URL
    if (
      scanResult.data.startsWith("http://") ||
      scanResult.data.startsWith("https://")
    ) {
      Linking.openURL(scanResult.data).catch(() => {
        Alert.alert("Lỗi", "Không thể mở đường link này");
      });
    } else {
      Alert.alert("Kết quả quét", scanResult.data, [
        { text: "Copy", onPress: () => {} },
        { text: "Đóng", style: "cancel" },
      ]);
    }
  }, [scanResult]);

  const handleNavigateToProduct = useCallback(() => {
    if (!scanResult?.data) return;

    // Try to extract product ID from QR data
    // Format: product://PRODUCT_ID or just ID
    const productIdMatch =
      scanResult.data.match(/product:\/\/(\w+)/) ||
      scanResult.data.match(/^[A-Za-z0-9-]+$/);

    if (productIdMatch) {
      const productId = productIdMatch[1] || productIdMatch[0];
      router.push(`/product/${productId}`);
    } else {
      Alert.alert("Thông báo", "Mã QR này không chứa thông tin sản phẩm");
    }
  }, [scanResult]);

  // Permission handling
  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang kiểm tra quyền camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[styles.container, styles.centered, { paddingTop: insets.top }]}
      >
        <Stack.Screen
          options={{
            title: "Quét mã QR",
            headerShown: true,
          }}
        />
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name="camera-outline" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.permissionTitle}>Cần quyền Camera</Text>
          <Text style={styles.permissionText}>
            Để quét mã QR, ứng dụng cần truy cập camera của bạn
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Cho phép truy cập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Quét mã QR",
          headerShown: false,
        }}
      />

      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "code93"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quét mã QR</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Ionicons
              name={flashOn ? "flash" : "flash-outline"}
              size={24}
              color={flashOn ? COLORS.warning : COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Scanner Frame */}
        <View style={styles.scannerFrameContainer}>
          <View style={styles.scannerFrame}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Scan line animation placeholder */}
            {!scanned && <View style={styles.scanLine} />}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Đưa mã QR vào khung để quét
          </Text>
          <Text style={styles.instructionsSubtext}>
            Hỗ trợ: QR Code, Barcode, EAN-13
          </Text>
        </View>

        {/* Bottom actions */}
        <View
          style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Open photo library to scan QR from image
              Alert.alert("Thông báo", "Tính năng quét từ ảnh sẽ sớm có mặt");
            }}
          >
            <Ionicons name="images-outline" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Từ ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/tools")}
          >
            <Ionicons name="apps-outline" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Công cụ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result Modal */}
      <Modal
        visible={!!scanResult}
        transparent
        animationType="slide"
        onRequestClose={handleScanAgain}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.resultModal, { paddingBottom: insets.bottom + 20 }]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.resultHeader}
            >
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={COLORS.white}
              />
              <Text style={styles.resultHeaderTitle}>Quét thành công!</Text>
            </LinearGradient>

            <View style={styles.resultContent}>
              <Text style={styles.resultLabel}>Loại mã:</Text>
              <Text style={styles.resultType}>
                {scanResult?.type?.toUpperCase()}
              </Text>

              <Text style={styles.resultLabel}>Nội dung:</Text>
              <View style={styles.resultDataContainer}>
                <Text style={styles.resultData} numberOfLines={5}>
                  {scanResult?.data}
                </Text>
              </View>

              {/* Action buttons */}
              <View style={styles.resultActions}>
                {scanResult?.data?.startsWith("http") && (
                  <TouchableOpacity
                    style={[styles.resultButton, styles.resultButtonPrimary]}
                    onPress={handleOpenLink}
                  >
                    <Ionicons
                      name="open-outline"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={styles.resultButtonTextPrimary}>
                      Mở đường link
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.resultButton, styles.resultButtonOutline]}
                  onPress={handleNavigateToProduct}
                >
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.resultButtonTextOutline}>
                    Xem sản phẩm
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resultButton, styles.resultButtonOutline]}
                  onPress={handleScanAgain}
                >
                  <Ionicons
                    name="scan-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.resultButtonTextOutline}>Quét lại</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.text,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textLight,
  },

  // Permission
  permissionContainer: {
    alignItems: "center",
    padding: 32,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Camera
  camera: {
    flex: 1,
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },

  // Scanner Frame
  scannerFrameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "50%",
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },

  // Instructions
  instructionsContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.white,
    marginBottom: 8,
  },
  instructionsSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    paddingHorizontal: 32,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  resultModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  resultHeader: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  resultHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  resultContent: {
    padding: 20,
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    marginTop: 12,
  },
  resultType: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  resultDataContainer: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  resultData: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  resultActions: {
    marginTop: 24,
    gap: 12,
  },
  resultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  resultButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  resultButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  resultButtonTextPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  resultButtonTextOutline: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
