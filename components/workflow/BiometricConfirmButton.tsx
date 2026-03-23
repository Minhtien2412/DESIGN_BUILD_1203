/**
 * BiometricConfirmButton — Triggers Face ID / Touch ID / Fingerprint confirmation
 */
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  biometricType: "FaceID" | "TouchID" | "Fingerprint" | "Iris" | "None";
  available: boolean;
  loading?: boolean;
  onPress: () => void;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  FaceID: "scan-outline",
  TouchID: "finger-print-outline",
  Fingerprint: "finger-print-outline",
  Iris: "eye-outline",
  None: "lock-closed-outline",
};

const LABEL_MAP: Record<string, string> = {
  FaceID: "Xác nhận bằng Face ID",
  TouchID: "Xác nhận bằng Touch ID",
  Fingerprint: "Xác nhận bằng vân tay",
  Iris: "Xác nhận bằng mống mắt",
  None: "Sinh trắc học không khả dụng",
};

export const BiometricConfirmButton = memo<Props>(
  ({ biometricType, available, loading, onPress }) => (
    <TouchableOpacity
      style={[styles.btn, !available && styles.btnDisabled]}
      onPress={onPress}
      disabled={!available || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons
          name={ICON_MAP[biometricType] || "lock-closed-outline"}
          size={22}
          color={available ? "#fff" : "#9CA3AF"}
        />
      )}
      <View style={styles.textCol}>
        <Text style={[styles.label, !available && styles.labelDisabled]}>
          {LABEL_MAP[biometricType] || "Sinh trắc học"}
        </Text>
        {!available && (
          <Text style={styles.hint}>Chưa khả dụng trên thiết bị này</Text>
        )}
      </View>
    </TouchableOpacity>
  ),
);

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  btnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  labelDisabled: {
    color: "#9CA3AF",
  },
  hint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
