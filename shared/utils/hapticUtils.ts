/**
 * Haptic Feedback Utilities
 * Rung phản hồi cho các tương tác người dùng
 */

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// ============================================
// TYPES
// ============================================

export type HapticStyle =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error"
  | "selection";

export type HapticPreset =
  | "buttonPress"
  | "tabChange"
  | "formSubmit"
  | "deleteAction"
  | "purchaseComplete"
  | "pullToRefresh"
  | "longPress"
  | "swipeAction";

// ============================================
// HAPTIC FEEDBACK FUNCTIONS
// ============================================

/**
 * Trigger light impact feedback
 * Dùng cho: nút nhỏ, toggle, tap nhẹ
 */
export async function lightImpact(): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Trigger medium impact feedback
 * Dùng cho: nút chính, thao tác quan trọng
 */
export async function mediumImpact(): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Trigger heavy impact feedback
 * Dùng cho: thao tác mạnh, xác nhận quan trọng
 */
export async function heavyImpact(): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Trigger success notification feedback
 * Dùng cho: hoàn thành, thành công
 */
export async function successNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Trigger warning notification feedback
 * Dùng cho: cảnh báo, chú ý
 */
export async function warningNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/**
 * Trigger error notification feedback
 * Dùng cho: lỗi, thất bại
 */
export async function errorNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/**
 * Trigger selection feedback
 * Dùng cho: chọn item, thay đổi selection
 */
export async function selectionFeedback(): Promise<void> {
  if (Platform.OS === "web") return;
  await Haptics.selectionAsync();
}

/**
 * Trigger haptic feedback by style
 */
export async function haptic(style: HapticStyle = "light"): Promise<void> {
  if (Platform.OS === "web") return;

  switch (style) {
    case "light":
      return lightImpact();
    case "medium":
      return mediumImpact();
    case "heavy":
      return heavyImpact();
    case "success":
      return successNotification();
    case "warning":
      return warningNotification();
    case "error":
      return errorNotification();
    case "selection":
      return selectionFeedback();
    default:
      return lightImpact();
  }
}

// ============================================
// PRESET PATTERNS
// ============================================

/**
 * Button press haptic
 */
export async function buttonPress(): Promise<void> {
  return lightImpact();
}

/**
 * Tab change haptic
 */
export async function tabChange(): Promise<void> {
  return selectionFeedback();
}

/**
 * Form submit haptic
 */
export async function formSubmit(): Promise<void> {
  return mediumImpact();
}

/**
 * Delete action haptic
 */
export async function deleteAction(): Promise<void> {
  return warningNotification();
}

/**
 * Purchase complete haptic
 */
export async function purchaseComplete(): Promise<void> {
  return successNotification();
}

/**
 * Pull to refresh haptic
 */
export async function pullToRefresh(): Promise<void> {
  return lightImpact();
}

/**
 * Long press haptic
 */
export async function longPress(): Promise<void> {
  return heavyImpact();
}

/**
 * Swipe action haptic
 */
export async function swipeAction(): Promise<void> {
  return mediumImpact();
}

// ============================================
// EXPORTS
// ============================================

export const hapticUtils = {
  // Basic
  lightImpact,
  mediumImpact,
  heavyImpact,
  successNotification,
  warningNotification,
  errorNotification,
  selectionFeedback,
  haptic,

  // Presets
  buttonPress,
  tabChange,
  formSubmit,
  deleteAction,
  purchaseComplete,
  pullToRefresh,
  longPress,
  swipeAction,
};

export default hapticUtils;
