/**
 * Share Utilities
 * Chia sẻ nội dung qua các ứng dụng khác
 */

import * as Sharing from "expo-sharing";
import { Platform, Share, ShareContent } from "react-native";

// ============================================
// TYPES
// ============================================

export interface ShareResult {
  success: boolean;
  action?: "sharedAction" | "dismissedAction";
  error?: string;
}

export interface ShareFileOptions {
  mimeType?: string;
  dialogTitle?: string;
  UTI?: string;
}

// ============================================
// SHARE FUNCTIONS
// ============================================

/**
 * Share text content
 */
export async function shareText(
  message: string,
  title?: string,
): Promise<ShareResult> {
  try {
    const content: ShareContent = { message };
    if (title) {
      content.title = title;
    }

    const result = await Share.share(content);
    return {
      success: result.action !== Share.dismissedAction,
      action: result.action as ShareResult["action"],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Share failed",
    };
  }
}

/**
 * Share URL
 */
export async function shareUrl(
  url: string,
  title?: string,
  message?: string,
): Promise<ShareResult> {
  try {
    const content: ShareContent = Platform.select({
      ios: { url, title, message },
      default: { message: message ? `${message}\n${url}` : url, title },
    }) as ShareContent;

    const result = await Share.share(content);
    return {
      success: result.action !== Share.dismissedAction,
      action: result.action as ShareResult["action"],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Share failed",
    };
  }
}

/**
 * Share product
 */
export async function shareProduct(
  name: string,
  price: number,
  url?: string,
): Promise<ShareResult> {
  const priceFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

  const message = `Xem sản phẩm: ${name}\nGiá: ${priceFormatted}${url ? `\n${url}` : ""}`;

  return shareText(message, name);
}

/**
 * Share project
 */
export async function shareProject(
  name: string,
  description?: string,
  url?: string,
): Promise<ShareResult> {
  let message = `Dự án: ${name}`;
  if (description) {
    message += `\n${description}`;
  }
  if (url) {
    message += `\n${url}`;
  }

  return shareText(message, name);
}

/**
 * Share app invitation
 */
export async function shareAppInvite(
  appName: string = "APP_DESIGN_BUILD",
  downloadUrl?: string,
): Promise<ShareResult> {
  const message =
    `Tải ứng dụng ${appName} để khám phá các sản phẩm và dịch vụ tuyệt vời!` +
    (downloadUrl ? `\n\nTải tại: ${downloadUrl}` : "");

  return shareText(message, `Mời bạn dùng ${appName}`);
}

/**
 * Check if file sharing is available
 */
export async function isFileSharingAvailable(): Promise<boolean> {
  try {
    return await Sharing.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Share a local file
 */
export async function shareFile(
  fileUri: string,
  options?: ShareFileOptions,
): Promise<ShareResult> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      return {
        success: false,
        error: "File sharing not available on this device",
      };
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: options?.mimeType,
      dialogTitle: options?.dialogTitle,
      UTI: options?.UTI,
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "File share failed",
    };
  }
}

/**
 * Share image file
 */
export async function shareImage(
  imageUri: string,
  title?: string,
): Promise<ShareResult> {
  return shareFile(imageUri, {
    mimeType: "image/*",
    dialogTitle: title || "Chia sẻ hình ảnh",
  });
}

/**
 * Share PDF file
 */
export async function sharePdf(
  pdfUri: string,
  title?: string,
): Promise<ShareResult> {
  return shareFile(pdfUri, {
    mimeType: "application/pdf",
    dialogTitle: title || "Chia sẻ tài liệu",
    UTI: "com.adobe.pdf",
  });
}

/**
 * Share video file
 */
export async function shareVideo(
  videoUri: string,
  title?: string,
): Promise<ShareResult> {
  return shareFile(videoUri, {
    mimeType: "video/*",
    dialogTitle: title || "Chia sẻ video",
  });
}

// ============================================
// EXPORTS
// ============================================

export const shareUtils = {
  shareText,
  shareUrl,
  shareProduct,
  shareProject,
  shareAppInvite,
  isFileSharingAvailable,
  shareFile,
  shareImage,
  sharePdf,
  shareVideo,
};

export default shareUtils;
