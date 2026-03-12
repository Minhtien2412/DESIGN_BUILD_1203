import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import FaceCapture from "../../components/FaceCapture";
import { Colors } from "../../constants/theme";
import { verifyFaceForRegistration } from "../../services/api/faceRecognitionApi";

type ScreenState = "intro" | "capture" | "verifying" | "success" | "error";

export default function FaceVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [state, setState] = useState<ScreenState>("intro");
  const [error, setError] = useState<string>("");
  const [faceData, setFaceData] = useState<{
    embedding: number[];
    images: string[];
  } | null>(null);

  const handleCaptureComplete = useCallback(
    async (images: string[]) => {
      setState("verifying");
      setError("");

      try {
        const result = await verifyFaceForRegistration(images, params.email);

        if (result.passed && result.embedding) {
          setFaceData({ embedding: result.embedding, images });
          setState("success");
        } else {
          setError(result.reason || "Xác minh khuôn mặt không thành công");
          setState("error");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối server");
        setState("error");
      }
    },
    [params.email],
  );

  const handleConfirm = useCallback(async () => {
    if (faceData) {
      // Store face data temporarily for the registration screen to pick up
      await AsyncStorage.setItem(
        "@face_verification_result",
        JSON.stringify({ embedding: faceData.embedding, verified: true }),
      );
      router.back();
    }
  }, [faceData, router]);

  const handleRetry = useCallback(() => {
    setState("intro");
    setError("");
    setFaceData(null);
  }, []);

  if (state === "capture") {
    return (
      <FaceCapture
        onCaptureComplete={handleCaptureComplete}
        onCancel={() => setState("intro")}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {state === "intro" && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="scan-outline"
                size={80}
                color={Colors.light.primary}
              />
            </View>
            <Text style={styles.title}>Xác minh khuôn mặt</Text>
            <Text style={styles.description}>
              Để bảo vệ tài khoản của bạn, chúng tôi cần xác minh khuôn mặt. Mỗi
              khuôn mặt chỉ được đăng ký với một tài khoản duy nhất.
            </Text>

            <View style={styles.steps}>
              <StepInfo icon="eye-outline" text="Nháy mắt khi được yêu cầu" />
              <StepInfo icon="arrow-back-outline" text="Quay đầu sang trái" />
              <StepInfo icon="camera-outline" text="Nhìn thẳng vào camera" />
            </View>

            <View style={styles.tips}>
              <Text style={styles.tipTitle}>Lưu ý:</Text>
              <Text style={styles.tipText}>• Đảm bảo ánh sáng đủ</Text>
              <Text style={styles.tipText}>
                • Không đeo kính râm hoặc khẩu trang
              </Text>
              <Text style={styles.tipText}>
                • Giữ khuôn mặt trong khung hình
              </Text>
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={() => setState("capture")}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Bắt đầu xác minh</Text>
            </Pressable>

            <Pressable style={styles.skipButton} onPress={() => router.back()}>
              <Text style={styles.skipButtonText}>Quay lại</Text>
            </Pressable>
          </>
        )}

        {state === "verifying" && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.verifyingText}>Đang xác minh khuôn mặt...</Text>
            <Text style={styles.verifyingSubtext}>
              Vui lòng chờ trong giây lát
            </Text>
          </View>
        )}

        {state === "success" && (
          <View style={styles.centerContent}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#ECFDF5" }]}
            >
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={Colors.light.success}
              />
            </View>
            <Text style={styles.title}>Xác minh thành công!</Text>
            <Text style={styles.description}>
              Khuôn mặt của bạn đã được xác minh. Nhấn tiếp tục để hoàn tất đăng
              ký.
            </Text>
            <Pressable style={styles.primaryButton} onPress={handleConfirm}>
              <Text style={styles.primaryButtonText}>Tiếp tục đăng ký</Text>
            </Pressable>
          </View>
        )}

        {state === "error" && (
          <View style={styles.centerContent}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#FEF2F2" }]}
            >
              <Ionicons
                name="alert-circle"
                size={80}
                color={Colors.light.error}
              />
            </View>
            <Text style={[styles.title, { color: Colors.light.error }]}>
              Xác minh thất bại
            </Text>
            <Text style={styles.description}>{error}</Text>
            <Pressable style={styles.primaryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Thử lại</Text>
            </Pressable>
            <Pressable style={styles.skipButton} onPress={() => router.back()}>
              <Text style={styles.skipButtonText}>Quay lại</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function StepInfo({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.stepInfo}>
      <Ionicons name={icon as any} size={24} color={Colors.light.primary} />
      <Text style={styles.stepInfoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.light.chipBackground,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  steps: {
    gap: 16,
    marginBottom: 24,
  },
  stepInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.surfaceMuted,
    borderRadius: 12,
  },
  stepInfoText: {
    fontSize: 15,
    color: Colors.light.text,
    flex: 1,
  },
  tips: {
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.warning,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipButtonText: {
    color: Colors.light.textMuted,
    fontSize: 14,
  },
  verifyingText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 24,
  },
  verifyingSubtext: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 8,
  },
});
