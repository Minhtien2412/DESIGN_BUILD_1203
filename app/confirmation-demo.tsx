/**
 * Confirmation Demo Screen
 * End-to-end workflow: Upload → Confirm → Audit → Download
 *
 * This screen demonstrates the complete confirmation workflow using
 * real hooks, services, and components. Usable for QA testing and
 * backend integration verification.
 *
 * @created 2026-03-16 — Round 5 E2E implementation
 */
import {
    AttachmentList,
    BiometricConfirmButton,
    ConfirmationStatusBadge,
    DownloadActionButton,
    PhotoConfirmationButton,
    SignaturePad,
    type SignaturePadRef,
    SignaturePreview,
    UploadProgressCard,
    VerificationTimeline,
} from "@/components/workflow";
import { useConfirmationWorkflow } from "@/hooks/useConfirmationWorkflow";
import { useFileDownload } from "@/hooks/useFileDownload";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { FileMetadata } from "@/types/workflow";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ── Demo config ─────────────────────────────────────────────────────────

const DEMO_RECORD_ID = "demo_001";
const DEMO_RECORD_TYPE = "work_order";

// ── Step navigation ─────────────────────────────────────────────────────

type WorkflowStep = "upload" | "confirm" | "audit" | "download";

const STEPS: { key: WorkflowStep; label: string; icon: string }[] = [
  { key: "upload", label: "Tải lên", icon: "cloud-upload-outline" },
  { key: "confirm", label: "Xác nhận", icon: "checkmark-circle-outline" },
  { key: "audit", label: "Lịch sử", icon: "time-outline" },
  { key: "download", label: "Tải xuống", icon: "download-outline" },
];

// ── Main Component ──────────────────────────────────────────────────────

export default function ConfirmationDemoScreen() {
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [confirmMethod, setConfirmMethod] = useState<
    "signature" | "biometric" | "photo" | null
  >(null);

  // Hooks
  const workflow = useConfirmationWorkflow({
    recordId: DEMO_RECORD_ID,
    recordType: DEMO_RECORD_TYPE,
  });
  const fileUpload = useFileUpload();
  const fileDownload = useFileDownload();

  // Signature pad ref
  const sigPadRef = useRef<SignaturePadRef>(null);
  const [signatureUri, setSignatureUri] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  // ── Step 1: Upload ──

  const handlePickDocument = useCallback(async () => {
    const uri = await fileUpload.pickDocument();
    if (uri) {
      const result = await workflow.addAttachment(uri);
      if (result) {
        Alert.alert("Thành công", `Đã tải lên: ${result.filename}`);
      }
    }
  }, [fileUpload, workflow]);

  const handlePickImage = useCallback(async () => {
    const uri = await fileUpload.pickImage();
    if (uri) {
      const result = await workflow.addAttachment(uri);
      if (result) {
        Alert.alert("Thành công", `Đã tải lên: ${result.filename}`);
      }
    }
  }, [fileUpload, workflow]);

  const handleTakePhoto = useCallback(async () => {
    const uri = await fileUpload.takePhoto();
    if (uri) {
      const result = await workflow.addAttachment(uri);
      if (result) {
        Alert.alert("Thành công", `Đã tải lên: ${result.filename}`);
      }
    }
  }, [fileUpload, workflow]);

  // ── Step 2: Confirm ──

  const handleSignatureCapture = useCallback(() => {
    const dataUri = sigPadRef.current?.toDataURL();
    if (dataUri) {
      setSignatureUri(dataUri);
      workflow.signature.setSignature(dataUri);
    }
  }, [workflow.signature]);

  const handleSubmitSignature = useCallback(async () => {
    if (!signatureUri) {
      Alert.alert("Lỗi", "Vui lòng ký trước khi xác nhận");
      return;
    }
    const result = await workflow.confirmWithSignature(
      signatureUri,
      "Ký xác nhận qua demo screen",
    );
    if (result.success) {
      Alert.alert("Thành công", "Đã gửi chữ ký xác nhận");
      setStep("audit");
    } else {
      Alert.alert("Lỗi", result.error || "Gửi xác nhận thất bại");
    }
  }, [signatureUri, workflow]);

  const handleBiometricConfirm = useCallback(async () => {
    const result = await workflow.confirmWithBiometric(
      "Xác nhận bằng sinh trắc học qua demo screen",
    );
    if (result.success) {
      Alert.alert("Thành công", "Đã xác nhận bằng sinh trắc học");
      setStep("audit");
    } else {
      Alert.alert("Lỗi", result.error || "Xác thực thất bại");
    }
  }, [workflow]);

  const handlePhotoConfirm = useCallback(async () => {
    const result = await workflow.confirmWithPhoto(
      "Ảnh xác nhận qua demo screen",
    );
    if (result.success) {
      Alert.alert("Thành công", "Đã gửi ảnh xác nhận");
      setStep("audit");
    } else {
      Alert.alert("Lỗi", result.error || "Gửi ảnh thất bại");
    }
  }, [workflow]);

  // ── Step 4: Download ──

  const handleDownloadFile = useCallback(
    async (file: FileMetadata) => {
      await fileDownload.download(file);
    },
    [fileDownload],
  );

  const handlePreviewFile = useCallback(async () => {
    if (fileDownload.localPath) {
      await fileDownload.preview(fileDownload.localPath);
    }
  }, [fileDownload]);

  // ── Render ──

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận công việc</Text>
        <ConfirmationStatusBadge status={workflow.status} size="sm" />
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {STEPS.map((s, i) => {
          const isActive = s.key === step;
          const stepIdx = STEPS.findIndex((x) => x.key === step);
          const isDone = i < stepIdx;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.stepItem, isActive && styles.stepItemActive]}
              onPress={() => setStep(s.key)}
            >
              <Ionicons
                name={
                  isDone
                    ? "checkmark-circle"
                    : (s.icon as keyof typeof Ionicons.glyphMap)
                }
                size={20}
                color={isActive ? "#0D9488" : isDone ? "#10B981" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isDone && styles.stepLabelDone,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── STEP 1: UPLOAD ── */}
        {step === "upload" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bước 1: Tải lên tài liệu</Text>
            <Text style={styles.sectionDesc}>
              Chọn file, ảnh hoặc chụp trực tiếp để đính kèm vào hồ sơ xác nhận.
            </Text>

            {/* Upload actions */}
            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handlePickDocument}
                disabled={fileUpload.uploading}
              >
                <Ionicons name="document-outline" size={24} color="#0D9488" />
                <Text style={styles.uploadBtnText}>Chọn tài liệu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handlePickImage}
                disabled={fileUpload.uploading}
              >
                <Ionicons name="images-outline" size={24} color="#0D9488" />
                <Text style={styles.uploadBtnText}>Chọn ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleTakePhoto}
                disabled={fileUpload.uploading}
              >
                <Ionicons name="camera-outline" size={24} color="#0D9488" />
                <Text style={styles.uploadBtnText}>Chụp ảnh</Text>
              </TouchableOpacity>
            </View>

            {/* Upload progress */}
            {fileUpload.uploading && (
              <UploadProgressCard
                state={{
                  status: "uploading",
                  progress: fileUpload.progress,
                }}
                filename="Đang tải..."
              />
            )}

            {fileUpload.error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{fileUpload.error}</Text>
              </View>
            )}

            {/* Attachment list */}
            <View style={styles.attachmentSection}>
              <Text style={styles.subTitle}>
                Tập tin đính kèm ({workflow.attachments.length})
              </Text>
              <AttachmentList
                attachments={workflow.attachments}
                onDownload={handleDownloadFile}
              />
            </View>

            {/* Next step */}
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setStep("confirm")}
            >
              <Text style={styles.nextBtnText}>Tiếp tục xác nhận</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: CONFIRM ── */}
        {step === "confirm" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Bước 2: Chọn phương thức xác nhận
            </Text>

            {/* Method selector */}
            <View style={styles.methodPicker}>
              {workflow.availableMethods.map((m) => (
                <TouchableOpacity
                  key={m.method}
                  style={[
                    styles.methodCard,
                    confirmMethod ===
                      (m.method === "manual_signature"
                        ? "signature"
                        : m.method.startsWith("biometric")
                          ? "biometric"
                          : "photo") && styles.methodCardActive,
                    !m.available && styles.methodCardDisabled,
                  ]}
                  onPress={() => {
                    if (!m.available) return;
                    setConfirmMethod(
                      m.method === "manual_signature"
                        ? "signature"
                        : m.method.startsWith("biometric")
                          ? "biometric"
                          : "photo",
                    );
                  }}
                  disabled={!m.available}
                >
                  <Ionicons
                    name={m.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={m.available ? "#0D9488" : "#D1D5DB"}
                  />
                  <Text
                    style={[
                      styles.methodLabel,
                      !m.available && styles.methodLabelDisabled,
                    ]}
                  >
                    {m.label}
                  </Text>
                  {m.reason && (
                    <Text style={styles.methodReason}>{m.reason}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Signature method ── */}
            {confirmMethod === "signature" && (
              <View style={styles.methodContent}>
                <Text style={styles.subTitle}>Ký tay xác nhận</Text>
                {!signatureUri ? (
                  <>
                    <SignaturePad
                      ref={sigPadRef}
                      height={200}
                      onSignatureChange={setHasSignature}
                    />
                    <TouchableOpacity
                      style={[
                        styles.confirmActionBtn,
                        !hasSignature && styles.confirmActionBtnDisabled,
                      ]}
                      onPress={handleSignatureCapture}
                      disabled={!hasSignature}
                    >
                      <Text style={styles.confirmActionBtnText}>
                        Xác nhận chữ ký
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <SignaturePreview
                      signatureUri={signatureUri}
                      status={
                        workflow.signature.uploadState.status === "picking"
                          ? "idle"
                          : workflow.signature.uploadState.status === "canceled"
                            ? "idle"
                            : workflow.signature.uploadState.status
                      }
                      error={workflow.signature.uploadState.error}
                      onClear={() => {
                        setSignatureUri(null);
                        setHasSignature(false);
                        sigPadRef.current?.clear();
                        workflow.signature.clear();
                      }}
                      onResign={() => {
                        setSignatureUri(null);
                        setHasSignature(false);
                        sigPadRef.current?.clear();
                      }}
                      onConfirm={handleSubmitSignature}
                    />
                  </>
                )}
              </View>
            )}

            {/* ── Biometric method ── */}
            {confirmMethod === "biometric" && (
              <View style={styles.methodContent}>
                <Text style={styles.subTitle}>Xác nhận sinh trắc học</Text>
                {Platform.OS === "web" ? (
                  <View style={styles.infoBox}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color="#3B82F6"
                    />
                    <Text style={styles.infoText}>
                      Sinh trắc học chỉ khả dụng trên thiết bị di động
                    </Text>
                  </View>
                ) : (
                  <BiometricConfirmButton
                    biometricType={
                      workflow.biometric.capabilities.biometricType
                    }
                    available={
                      workflow.biometric.capabilities.isAvailable &&
                      workflow.biometric.capabilities.isEnrolled
                    }
                    loading={workflow.isSubmitting}
                    onPress={handleBiometricConfirm}
                  />
                )}
              </View>
            )}

            {/* ── Photo method ── */}
            {confirmMethod === "photo" && (
              <View style={styles.methodContent}>
                <Text style={styles.subTitle}>Chụp ảnh xác nhận</Text>
                <PhotoConfirmationButton
                  imageUri={workflow.photo.payload?.imageUri}
                  isCapturing={workflow.photo.isCapturing}
                  onCapture={workflow.photo.capturePhoto}
                  onPick={workflow.photo.pickPhoto}
                  onClear={workflow.photo.clear}
                />
                {workflow.photo.payload?.imageUri && (
                  <TouchableOpacity
                    style={styles.confirmActionBtn}
                    onPress={handlePhotoConfirm}
                    disabled={workflow.isSubmitting}
                  >
                    <Text style={styles.confirmActionBtnText}>
                      {workflow.isSubmitting
                        ? "Đang gửi..."
                        : "Gửi ảnh xác nhận"}
                    </Text>
                  </TouchableOpacity>
                )}
                {workflow.photo.error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{workflow.photo.error}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Error display */}
            {workflow.error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{workflow.error}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── STEP 3: AUDIT TRAIL ── */}
        {step === "audit" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bước 3: Lịch sử xác nhận</Text>
            <Text style={styles.sectionDesc}>
              Timeline các hoạt động xác nhận trên hồ sơ này.
            </Text>

            <VerificationTimeline items={workflow.auditTrail} />

            {/* Navigation */}
            <View style={styles.navRow}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => setStep("confirm")}
              >
                <Ionicons name="arrow-back" size={16} color="#6B7280" />
                <Text style={styles.navBtnText}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnPrimary]}
                onPress={() => setStep("download")}
              >
                <Text style={styles.navBtnTextPrimary}>Xem tài liệu</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 4: DOWNLOAD ── */}
        {step === "download" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bước 4: Tải xuống & xem lại</Text>
            <Text style={styles.sectionDesc}>
              Xem lại và tải xuống tập tin đính kèm, chữ ký, ảnh xác nhận.
            </Text>

            {/* Attachments list with download */}
            <AttachmentList
              attachments={workflow.attachments}
              onDownload={handleDownloadFile}
              onPreview={handleDownloadFile}
            />

            {/* Download action button */}
            {workflow.attachments.length > 0 && (
              <View style={styles.downloadSection}>
                <DownloadActionButton
                  state={{
                    status: fileDownload.status,
                    progress: fileDownload.progress,
                    localPath: fileDownload.localPath,
                  }}
                  label="Tải tập tin đầu tiên"
                  onDownload={() => {
                    if (workflow.attachments[0]) {
                      handleDownloadFile(workflow.attachments[0]);
                    }
                  }}
                  onCancel={fileDownload.cancel}
                  onPreview={handlePreviewFile}
                />
              </View>
            )}

            {workflow.attachments.length === 0 && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={16} color="#3B82F6" />
                <Text style={styles.infoText}>
                  Chưa có tập tin đính kèm. Hãy quay lại bước 1 để tải lên.
                </Text>
              </View>
            )}

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tóm tắt</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trạng thái:</Text>
                <ConfirmationStatusBadge status={workflow.status} size="sm" />
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tập tin:</Text>
                <Text style={styles.summaryValue}>
                  {workflow.attachments.length} file
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Hoạt động:</Text>
                <Text style={styles.summaryValue}>
                  {workflow.auditTrail.length} mục
                </Text>
              </View>
            </View>

            {/* Reset */}
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                workflow.reset();
                setStep("upload");
                setConfirmMethod(null);
                setSignatureUri(null);
                setHasSignature(false);
              }}
            >
              <Ionicons name="refresh-outline" size={16} color="#6B7280" />
              <Text style={styles.resetBtnText}>Làm lại từ đầu</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  stepBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepItemActive: {
    backgroundColor: "#F0FDFA",
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  stepLabelActive: {
    color: "#0D9488",
    fontWeight: "700",
  },
  stepLabelDone: {
    color: "#10B981",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  uploadActions: {
    flexDirection: "row",
    gap: 10,
  },
  uploadBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "#0D9488",
    borderStyle: "dashed",
    borderRadius: 12,
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0D9488",
  },
  attachmentSection: {
    gap: 8,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0D9488",
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  methodPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  methodCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    gap: 6,
  },
  methodCardActive: {
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  methodLabelDisabled: {
    color: "#9CA3AF",
  },
  methodReason: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
  methodContent: {
    gap: 12,
    paddingTop: 8,
  },
  confirmActionBtn: {
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmActionBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  confirmActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    flex: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#3B82F6",
    flex: 1,
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  navBtnPrimary: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
    marginLeft: "auto",
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  navBtnTextPrimary: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  downloadSection: {
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
});
