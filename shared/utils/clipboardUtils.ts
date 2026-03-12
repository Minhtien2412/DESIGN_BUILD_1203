/**
 * Clipboard Utilities
 * Sao chép và dán từ clipboard
 */

import * as Clipboard from "expo-clipboard";

// ============================================
// CLIPBOARD FUNCTIONS
// ============================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error("[Clipboard] Copy error:", error);
    return false;
  }
}

/**
 * Get text from clipboard
 */
export async function getFromClipboard(): Promise<string | null> {
  try {
    const hasString = await Clipboard.hasStringAsync();
    if (!hasString) return null;
    return await Clipboard.getStringAsync();
  } catch (error) {
    console.error("[Clipboard] Get error:", error);
    return null;
  }
}

/**
 * Check if clipboard has content
 */
export async function hasClipboardContent(): Promise<boolean> {
  try {
    return await Clipboard.hasStringAsync();
  } catch {
    return false;
  }
}

/**
 * Copy URL to clipboard
 */
export async function copyUrl(url: string): Promise<boolean> {
  return copyToClipboard(url);
}

/**
 * Copy phone number to clipboard
 */
export async function copyPhoneNumber(phone: string): Promise<boolean> {
  // Clean phone number
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  return copyToClipboard(cleanPhone);
}

/**
 * Copy email to clipboard
 */
export async function copyEmail(email: string): Promise<boolean> {
  return copyToClipboard(email.toLowerCase().trim());
}

/**
 * Copy formatted price to clipboard
 */
export async function copyPrice(
  price: number,
  currency: string = "VND",
): Promise<boolean> {
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
  return copyToClipboard(formatted);
}

/**
 * Copy JSON object to clipboard
 */
export async function copyJson(obj: object): Promise<boolean> {
  try {
    const json = JSON.stringify(obj, null, 2);
    return copyToClipboard(json);
  } catch {
    return false;
  }
}

// ============================================
// EXPORTS
// ============================================

export const clipboardUtils = {
  copyToClipboard,
  getFromClipboard,
  hasClipboardContent,
  copyUrl,
  copyPhoneNumber,
  copyEmail,
  copyPrice,
  copyJson,
};

export default clipboardUtils;
