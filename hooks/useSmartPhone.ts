/**
 * Smart Phone Actions Hook
 * Tái sử dụng dữ liệu và tính năng có sẵn từ thiết bị
 * @created 04/02/2026
 */

import {
    checkContactsPermission,
    getDeviceContacts,
    makePhoneCall,
    openMaps,
    requestContactsPermission,
    searchContacts,
    sendEmail,
    sendSMS,
} from "@/utils/devicePermissions";
import * as Contacts from "expo-contacts";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

// ============================================================================
// Types
// ============================================================================

export interface DeviceContact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: Array<{
    number: string;
    label?: string;
  }>;
  emails?: Array<{
    email: string;
    label?: string;
  }>;
  image?: {
    uri: string;
  };
  company?: string;
}

export interface UseContactsResult {
  contacts: DeviceContact[];
  loading: boolean;
  hasPermission: boolean;
  error: string | null;
  loadContacts: () => Promise<void>;
  searchContacts: (query: string) => Promise<DeviceContact[]>;
  requestPermission: () => Promise<boolean>;
}

export interface UseCommunicationResult {
  call: (phoneNumber: string) => Promise<boolean>;
  sms: (phoneNumber: string, message?: string) => Promise<boolean>;
  email: (to: string, subject?: string, body?: string) => Promise<boolean>;
  maps: (lat: number, lng: number, label?: string) => Promise<boolean>;
  callWithConfirm: (phoneNumber: string, name?: string) => void;
  smsWithTemplate: (phoneNumber: string, template: string) => void;
}

// ============================================================================
// Transform Functions
// ============================================================================

function transformContact(contact: Contacts.Contact): DeviceContact {
  return {
    id: (contact as any).id || "",
    name:
      contact.name ||
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
      "Unknown",
    firstName: contact.firstName || undefined,
    lastName: contact.lastName || undefined,
    phoneNumbers: contact.phoneNumbers?.map((p) => ({
      number: p.number || "",
      label: p.label || undefined,
    })),
    emails: contact.emails?.map((e) => ({
      email: e.email || "",
      label: e.label || undefined,
    })),
    image: contact.image?.uri ? { uri: contact.image.uri } : undefined,
    company: contact.company || undefined,
  };
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access device contacts
 */
export function useDeviceContacts(): UseContactsResult {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async () => {
    const status = await checkContactsPermission();
    setHasPermission(status.granted);
    return status.granted;
  }, []);

  const requestPermission = useCallback(async () => {
    const status = await requestContactsPermission();
    setHasPermission(status.granted);
    return status.granted;
  }, []);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasAccess = await checkPermission();
      if (!hasAccess) {
        const granted = await requestPermission();
        if (!granted) {
          setError("Không có quyền truy cập danh bạ");
          setLoading(false);
          return;
        }
      }

      const deviceContacts = await getDeviceContacts({ pageSize: 100 });
      const transformed = deviceContacts.map(transformContact);

      // Sort by name
      transformed.sort((a, b) => a.name.localeCompare(b.name, "vi"));
      setContacts(transformed);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh bạ");
      console.error("[useDeviceContacts] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [checkPermission, requestPermission]);

  const search = useCallback(
    async (query: string): Promise<DeviceContact[]> => {
      if (!query.trim()) return contacts;

      try {
        const results = await searchContacts(query);
        return results.map(transformContact);
      } catch (err) {
        console.error("[useDeviceContacts] Search error:", err);
        return [];
      }
    },
    [contacts],
  );

  return {
    contacts,
    loading,
    hasPermission,
    error,
    loadContacts,
    searchContacts: search,
    requestPermission,
  };
}

/**
 * Hook for communication actions (call, SMS, email, maps)
 */
export function useCommunication(): UseCommunicationResult {
  const call = useCallback(async (phoneNumber: string): Promise<boolean> => {
    return makePhoneCall(phoneNumber);
  }, []);

  const sms = useCallback(
    async (phoneNumber: string, message?: string): Promise<boolean> => {
      return sendSMS(phoneNumber, message);
    },
    [],
  );

  const email = useCallback(
    async (to: string, subject?: string, body?: string): Promise<boolean> => {
      return sendEmail(to, subject, body);
    },
    [],
  );

  const maps = useCallback(
    async (lat: number, lng: number, label?: string): Promise<boolean> => {
      return openMaps(lat, lng, label);
    },
    [],
  );

  const callWithConfirm = useCallback((phoneNumber: string, name?: string) => {
    const displayName = name || phoneNumber;
    Alert.alert("Gọi điện", `Bạn có muốn gọi cho ${displayName}?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gọi",
        style: "default",
        onPress: () => makePhoneCall(phoneNumber),
      },
    ]);
  }, []);

  const smsWithTemplate = useCallback(
    (phoneNumber: string, template: string) => {
      Alert.alert("Gửi tin nhắn", "Chọn phương thức", [
        { text: "Hủy", style: "cancel" },
        {
          text: "SMS",
          onPress: () => sendSMS(phoneNumber, template),
        },
        {
          text: "Zalo",
          onPress: () => {
            // TODO: Implement Zalo deep link
            Alert.alert("Thông báo", "Tính năng đang phát triển");
          },
        },
      ]);
    },
    [],
  );

  return {
    call,
    sms,
    email,
    maps,
    callWithConfirm,
    smsWithTemplate,
  };
}

// ============================================================================
// Message Templates
// ============================================================================

export const MessageTemplates = {
  // Gửi báo giá
  quotation: (projectName: string, amount: string) =>
    `Kính gửi Quý khách,\n\nChúng tôi xin gửi báo giá dự án "${projectName}" với tổng giá trị ${amount}.\n\nVui lòng liên hệ để biết thêm chi tiết.\n\nTrân trọng!`,

  // Xác nhận lịch hẹn
  appointment: (date: string, time: string, location: string) =>
    `Xác nhận lịch hẹn:\n📅 Ngày: ${date}\n⏰ Giờ: ${time}\n📍 Địa điểm: ${location}\n\nVui lòng xác nhận hoặc liên hệ nếu cần đổi lịch.`,

  // Cập nhật tiến độ
  progressUpdate: (projectName: string, progress: number) =>
    `Cập nhật tiến độ dự án "${projectName}":\n📊 Hoàn thành: ${progress}%\n\nChi tiết xem trong ứng dụng.`,

  // Yêu cầu thanh toán
  paymentRequest: (amount: string, dueDate: string) =>
    `Thông báo thanh toán:\n💰 Số tiền: ${amount}\n📅 Hạn thanh toán: ${dueDate}\n\nVui lòng thanh toán đúng hạn.`,

  // Mời tham gia dự án
  projectInvite: (projectName: string) =>
    `Bạn được mời tham gia dự án "${projectName}" trên Design & Build App.\n\nTải ứng dụng: https://baotienweb.cloud/app`,
};

// ============================================================================
// Export
// ============================================================================

export default {
  useDeviceContacts,
  useCommunication,
  MessageTemplates,
};
