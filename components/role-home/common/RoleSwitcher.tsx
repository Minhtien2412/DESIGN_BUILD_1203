/**
 * RoleSwitcher — Bottom sheet modal to switch between 4 roles
 *
 * Shows current role highlighted, allows tap-to-switch.
 * Updates storage + navigates to the correct homepage.
 *
 * @created 2026-03-21
 */

import {
    type AppRole,
    ROLE_LIST,
    ROLE_THEME,
    type RoleMeta,
} from "@/constants/roleTheme";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

interface Props {
  visible: boolean;
  currentRole: AppRole;
  onSelect: (role: AppRole) => void;
  onClose: () => void;
}

export function RoleSwitcher({
  visible,
  currentRole,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  const renderRoleOption = (meta: RoleMeta) => {
    const isActive = currentRole === meta.key;
    return (
      <TouchableOpacity
        key={meta.key}
        style={[
          s.option,
          isActive && {
            backgroundColor: meta.accentLight,
            borderColor: meta.accent,
          },
        ]}
        onPress={() => {
          onSelect(meta.key);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            s.optionIcon,
            { backgroundColor: isActive ? meta.accent : ROLE_THEME.bgMuted },
          ]}
        >
          <Ionicons
            name={meta.icon as any}
            size={22}
            color={isActive ? "#FFFFFF" : ROLE_THEME.textSecondary}
          />
        </View>
        <View style={s.optionText}>
          <Text style={[s.optionLabel, isActive && { color: meta.accent }]}>
            {meta.label}
          </Text>
          <Text style={s.optionDesc} numberOfLines={1}>
            {meta.description}
          </Text>
        </View>
        {isActive && (
          <View style={[s.checkCircle, { backgroundColor: meta.accent }]}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable
          style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
          onPress={() => {}} // prevent close on sheet body tap
        >
          {/* Handle */}
          <View style={s.handle} />

          {/* Title */}
          <Text style={s.title}>Chuyển vai trò</Text>
          <Text style={s.subtitle}>Chọn vai trò bạn muốn sử dụng</Text>

          {/* Options */}
          <View style={s.options}>{ROLE_LIST.map(renderRoleOption)}</View>

          {/* Cancel */}
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={s.cancelText}>Đóng</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: ROLE_THEME.bg,
    borderTopLeftRadius: ROLE_THEME.radius.xxl,
    borderTopRightRadius: ROLE_THEME.radius.xxl,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: ROLE_THEME.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: ROLE_THEME.fontSize.title,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: ROLE_THEME.fontSize.sm,
    color: ROLE_THEME.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  options: {
    gap: 10,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: ROLE_THEME.radius.lg,
    borderWidth: 1.5,
    borderColor: ROLE_THEME.borderLight,
    backgroundColor: ROLE_THEME.card,
    gap: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: ROLE_THEME.fontSize.lg,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
  },
  optionDesc: {
    fontSize: ROLE_THEME.fontSize.sm,
    color: ROLE_THEME.textSecondary,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: ROLE_THEME.radius.lg,
    backgroundColor: ROLE_THEME.bgMuted,
  },
  cancelText: {
    fontSize: ROLE_THEME.fontSize.md,
    fontWeight: "600",
    color: ROLE_THEME.textSecondary,
  },
});
