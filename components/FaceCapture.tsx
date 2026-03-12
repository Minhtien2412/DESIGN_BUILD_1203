import { Colors } from "@/constants/theme";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    Animated as RNAnimated,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const OVAL_WIDTH = SCREEN_WIDTH * 0.65;
const OVAL_HEIGHT = OVAL_WIDTH * 1.35;

type ChallengeStep = "ready" | "blink" | "turn-left" | "capturing" | "done";

interface FaceCaptureProps {
  onCaptureComplete: (images: string[]) => void;
  onCancel: () => void;
}

export default function FaceCapture({
  onCaptureComplete,
  onCancel,
}: FaceCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<ChallengeStep>("ready");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [instruction, setInstruction] = useState(
    "Đặt khuôn mặt vào khung hình",
  );
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  // Pulse animation for the oval guide
  useEffect(() => {
    const pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const captureFrame = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });
      return photo?.base64 ? `data:image/jpeg;base64,${photo.base64}` : null;
    } catch {
      return null;
    }
  }, []);

  const startChallenge = useCallback(async () => {
    const images: string[] = [];

    // Step 1: Capture neutral frame
    setStep("blink");
    setInstruction("Nháy mắt 1 lần");
    await delay(500);
    const frame1 = await captureFrame();
    if (frame1) images.push(frame1);

    // Step 2: Wait for blink, capture during blink window
    await delay(2000);
    const frame2 = await captureFrame();
    if (frame2) images.push(frame2);

    // Step 3: After blink, capture recovery frame
    await delay(800);
    const frame3 = await captureFrame();
    if (frame3) images.push(frame3);

    // Step 4: Turn head
    setStep("turn-left");
    setInstruction("Quay đầu sang trái");
    await delay(2000);
    const frame4 = await captureFrame();
    if (frame4) images.push(frame4);

    // Step 5: Return to center
    setInstruction("Nhìn thẳng vào camera");
    await delay(1500);
    const frame5 = await captureFrame();
    if (frame5) images.push(frame5);

    setStep("done");
    setCapturedImages(images);

    if (images.length >= 3) {
      setInstruction("Xác minh khuôn mặt hoàn tất!");
      onCaptureComplete(images);
    } else {
      setInstruction("Không thể chụp đủ ảnh. Vui lòng thử lại.");
      setStep("ready");
    }
  }, [captureFrame, onCaptureComplete]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Cần quyền truy cập camera để xác minh khuôn mặt
        </Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Cho phép Camera</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        animateShutter={false}
      >
        {/* Overlay with oval cutout */}
        <View style={styles.overlay}>
          {/* Top instruction */}
          <View style={styles.topBar}>
            <Text style={styles.instructionText}>{instruction}</Text>
            <StepIndicator currentStep={step} />
          </View>

          {/* Oval guide */}
          <RNAnimated.View
            style={[
              styles.ovalGuide,
              {
                transform: [{ scale: pulseAnim }],
                borderColor:
                  step === "done"
                    ? Colors.light.success
                    : step === "ready"
                      ? Colors.light.border
                      : Colors.light.primary,
              },
            ]}
          />

          {/* Bottom controls */}
          <View style={styles.bottomBar}>
            {step === "ready" && (
              <>
                <Pressable
                  style={styles.primaryButton}
                  onPress={startChallenge}
                >
                  <Text style={styles.primaryButtonText}>Bắt đầu xác minh</Text>
                </Pressable>
                <Pressable style={styles.cancelButton} onPress={onCancel}>
                  <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                </Pressable>
              </>
            )}
            {(step === "blink" ||
              step === "turn-left" ||
              step === "capturing") && (
              <ActivityIndicator size="small" color="#fff" />
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

function StepIndicator({ currentStep }: { currentStep: ChallengeStep }) {
  const steps = [
    { key: "blink", label: "Nháy mắt" },
    { key: "turn-left", label: "Quay đầu" },
    { key: "done", label: "Hoàn tất" },
  ];

  const getStepState = (stepKey: string) => {
    const order = ["ready", "blink", "turn-left", "capturing", "done"];
    const currentIdx = order.indexOf(currentStep);
    const stepIdx = order.indexOf(stepKey);
    if (stepIdx < currentIdx) return "completed";
    if (
      stepKey === currentStep ||
      (currentStep === "capturing" && stepKey === "turn-left")
    )
      return "active";
    return "pending";
  };

  return (
    <View style={styles.stepRow}>
      {steps.map((s, i) => {
        const state = getStepState(s.key);
        return (
          <View key={s.key} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                state === "completed" && styles.stepDotCompleted,
                state === "active" && styles.stepDotActive,
              ]}
            />
            {i < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  state === "completed" && styles.stepLineCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBar: {
    paddingTop: 60,
    alignItems: "center",
    gap: 16,
  },
  instructionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: 24,
  },
  ovalGuide: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 3,
    borderStyle: "dashed",
  },
  bottomBar: {
    paddingBottom: 50,
    alignItems: "center",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  permissionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  stepDotActive: {
    backgroundColor: Colors.light.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotCompleted: {
    backgroundColor: Colors.light.success,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: Colors.light.success,
  },
});
