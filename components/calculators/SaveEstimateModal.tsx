/**
 * SaveEstimateModal - Modal để lưu dự toán
 * Reusable component for all calculator screens
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface SaveEstimateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  estimateName: string;
  onChangeEstimateName: (name: string) => void;
  isEditMode: boolean;
  isSaving?: boolean;
  infoLines?: { icon: string; text: string }[];
}

export function SaveEstimateModal({
  visible,
  onClose,
  onSave,
  estimateName,
  onChangeEstimateName,
  isEditMode,
  isSaving = false,
  infoLines = [],
}: SaveEstimateModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEditMode ? "Cập nhật dự toán" : "Lưu dự toán mới"}
          </Text>
          <Text style={styles.subtitle}>Nhập tên để lưu bản dự toán này</Text>

          <TextInput
            style={styles.input}
            value={estimateName}
            onChangeText={onChangeEstimateName}
            placeholder="VD: Nhà phố 3 tầng - Quận 7"
            placeholderTextColor={MODERN_COLORS.textTertiary}
            autoFocus
            editable={!isSaving}
          />

          {infoLines.length > 0 && (
            <View style={styles.infoBox}>
              {infoLines.map((line, index) => (
                <View key={index} style={styles.infoRow}>
                  <Ionicons
                    name={line.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={MODERN_COLORS.textSecondary}
                  />
                  <Text style={styles.infoText}>{line.text}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!estimateName.trim() || isSaving) && styles.saveBtnDisabled,
              ]}
              onPress={onSave}
              disabled={!estimateName.trim() || isSaving}
            >
              <LinearGradient
                colors={
                  estimateName.trim() && !isSaving
                    ? ["#22c55e", "#16a34a"]
                    : ["#d1d5db", "#9ca3af"]
                }
                style={styles.saveGradient}
              >
                <Ionicons
                  name={isSaving ? "hourglass" : "save"}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.saveText}>
                  {isSaving ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Lưu"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: MODERN_SPACING.lg,
  },
  content: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  input: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    fontSize: 16,
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.lg,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  infoBox: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.md,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  buttons: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default SaveEstimateModal;
