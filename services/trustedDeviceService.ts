/**
 * Trusted Device Service - Dịch Vụ Thiết Bị Tin Cậy
 * ==================================================
 * 
 * 🔐 Quản lý thiết bị tin cậy để đăng nhập nhanh không cần OTP
 * 
 * Cách hoạt động:
 * ✅ Đăng nhập OTP thành công → Lưu thiết bị vào danh sách tin cậy
 * ✅ Lần sau đăng nhập cùng SĐT + cùng thiết bị → Không cần OTP (30 ngày)
 * ✅ Đổi thiết bị HOẶC hết 30 ngày → Yêu cầu xác thực OTP lại
 * ✅ Đăng xuất → Tùy chọn xóa thiết bị tin cậy
 * 
 * @author Design Build Team
 * @version 2.0.0
 * @created 2026-01-15
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ==================== CONFIG ====================

const TRUSTED_DEVICE_CONFIG = {
  storageKey: '@trusted_device',
  tokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 ngày (milliseconds)
  maxTrustedDevices: 5, // Tối đa 5 thiết bị tin cậy
};

// ==================== TYPES ====================

export interface TrustedDevice {
  deviceId: string;
  deviceName: string;
  platform: string;
  phone: string;
  userId?: string;
  trustedAt: number; // Timestamp lúc trust
  expiresAt: number; // Timestamp hết hạn
  lastLoginAt: number; // Lần đăng nhập gần nhất
  accessToken?: string; // Token để auto-login
  refreshToken?: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: string;
  osVersion: string;
  appVersion: string;
}

// ==================== DEVICE INFO ====================

/**
 * Lấy thông tin thiết bị hiện tại
 * Tạo unique deviceId dựa trên hardware + app installation
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  let deviceId = '';
  
  try {
    if (Platform.OS === 'ios') {
      // iOS: Dùng identifierForVendor
      deviceId = (await Application.getIosIdForVendorAsync()) || '';
    } else if (Platform.OS === 'android') {
      // Android: Dùng androidId
      deviceId = Application.getAndroidId() || '';
    }
    
    // Fallback: Tạo từ device info + random
    if (!deviceId) {
      const storedId = await AsyncStorage.getItem('@device_unique_id');
      if (storedId) {
        deviceId = storedId;
      } else {
        deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        await AsyncStorage.setItem('@device_unique_id', deviceId);
      }
    }
  } catch (error) {
    // Fallback for web/simulator
    const storedId = await AsyncStorage.getItem('@device_unique_id');
    if (storedId) {
      deviceId = storedId;
    } else {
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      await AsyncStorage.setItem('@device_unique_id', deviceId);
    }
  }
  
  return {
    deviceId,
    deviceName: Device.deviceName || Device.modelName || 'Unknown Device',
    platform: Platform.OS,
    osVersion: Device.osVersion || 'Unknown',
    appVersion: Application.nativeApplicationVersion || '1.0.0',
  };
}

// ==================== TRUSTED DEVICE MANAGER ====================

class TrustedDeviceService {
  private cachedDeviceInfo: DeviceInfo | null = null;
  
  /**
   * Lấy device info (có cache)
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    if (!this.cachedDeviceInfo) {
      this.cachedDeviceInfo = await getDeviceInfo();
    }
    return this.cachedDeviceInfo;
  }
  
  /**
   * Lấy danh sách trusted devices từ storage
   */
  private async getTrustedDevices(): Promise<TrustedDevice[]> {
    try {
      const data = await AsyncStorage.getItem(TRUSTED_DEVICE_CONFIG.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[TrustedDevice] Error reading:', error);
    }
    return [];
  }
  
  /**
   * Lưu danh sách trusted devices
   */
  private async saveTrustedDevices(devices: TrustedDevice[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        TRUSTED_DEVICE_CONFIG.storageKey, 
        JSON.stringify(devices)
      );
    } catch (error) {
      console.error('[TrustedDevice] Error saving:', error);
    }
  }
  
  /**
   * Kiểm tra thiết bị hiện tại có được trust không
   * 
   * @returns TrustedDevice nếu trust và còn hạn, null nếu không
   */
  async checkTrustedDevice(phone: string): Promise<TrustedDevice | null> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      const devices = await this.getTrustedDevices();
      
      // Tìm device với cùng deviceId và phone
      const trusted = devices.find(
        d => d.deviceId === deviceInfo.deviceId && d.phone === phone
      );
      
      if (!trusted) {
        console.log('[TrustedDevice] Device not trusted for phone:', phone);
        return null;
      }
      
      // Kiểm tra hết hạn
      const now = Date.now();
      if (now > trusted.expiresAt) {
        console.log('[TrustedDevice] Trust expired for device');
        // Xóa device hết hạn
        await this.removeTrustedDevice(phone);
        return null;
      }
      
      console.log('[TrustedDevice] Device trusted, expires in:', 
        Math.ceil((trusted.expiresAt - now) / (24 * 60 * 60 * 1000)), 'days'
      );
      
      return trusted;
    } catch (error) {
      console.error('[TrustedDevice] Check error:', error);
      return null;
    }
  }
  
  /**
   * Trust thiết bị hiện tại sau khi OTP verify thành công
   */
  async trustDevice(
    phone: string,
    userId?: string,
    tokens?: { accessToken: string; refreshToken: string }
  ): Promise<TrustedDevice> {
    const deviceInfo = await this.getDeviceInfo();
    const devices = await this.getTrustedDevices();
    const now = Date.now();
    
    // Tạo trusted device mới
    const newTrusted: TrustedDevice = {
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      platform: deviceInfo.platform,
      phone,
      userId,
      trustedAt: now,
      expiresAt: now + TRUSTED_DEVICE_CONFIG.tokenExpiry,
      lastLoginAt: now,
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
    };
    
    // Xóa device cũ nếu có (cùng deviceId + phone)
    const filteredDevices = devices.filter(
      d => !(d.deviceId === deviceInfo.deviceId && d.phone === phone)
    );
    
    // Thêm device mới
    filteredDevices.push(newTrusted);
    
    // Giữ tối đa N devices gần nhất
    const sortedDevices = filteredDevices
      .sort((a, b) => b.lastLoginAt - a.lastLoginAt)
      .slice(0, TRUSTED_DEVICE_CONFIG.maxTrustedDevices);
    
    await this.saveTrustedDevices(sortedDevices);
    
    console.log('[TrustedDevice] Device trusted for 30 days:', deviceInfo.deviceName);
    
    return newTrusted;
  }
  
  /**
   * Cập nhật lastLoginAt và tokens
   */
  async updateTrustedDevice(
    phone: string,
    tokens?: { accessToken: string; refreshToken: string }
  ): Promise<void> {
    const deviceInfo = await this.getDeviceInfo();
    const devices = await this.getTrustedDevices();
    
    const index = devices.findIndex(
      d => d.deviceId === deviceInfo.deviceId && d.phone === phone
    );
    
    if (index >= 0) {
      devices[index].lastLoginAt = Date.now();
      if (tokens) {
        devices[index].accessToken = tokens.accessToken;
        devices[index].refreshToken = tokens.refreshToken;
      }
      await this.saveTrustedDevices(devices);
    }
  }
  
  /**
   * Xóa trusted device (khi logout hoặc user revoke)
   */
  async removeTrustedDevice(phone: string): Promise<void> {
    const deviceInfo = await this.getDeviceInfo();
    const devices = await this.getTrustedDevices();
    
    const filtered = devices.filter(
      d => !(d.deviceId === deviceInfo.deviceId && d.phone === phone)
    );
    
    await this.saveTrustedDevices(filtered);
    console.log('[TrustedDevice] Device removed for phone:', phone);
  }
  
  /**
   * Xóa TẤT CẢ trusted devices (reset hoàn toàn)
   */
  async clearAllTrustedDevices(): Promise<void> {
    await AsyncStorage.removeItem(TRUSTED_DEVICE_CONFIG.storageKey);
    console.log('[TrustedDevice] All trusted devices cleared');
  }
  
  /**
   * Lấy danh sách devices đang trust cho phone (để hiển thị trong settings)
   */
  async getMyTrustedDevices(phone: string): Promise<TrustedDevice[]> {
    const devices = await this.getTrustedDevices();
    return devices.filter(d => d.phone === phone);
  }
  
  /**
   * Tính số ngày còn lại trước khi hết hạn
   */
  getDaysRemaining(trusted: TrustedDevice): number {
    const remaining = trusted.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  }
  
  /**
   * Kiểm tra nhanh có cần OTP không
   * 
   * @returns true nếu CẦN OTP, false nếu KHÔNG cần (trusted device)
   */
  async needsOTP(phone: string): Promise<boolean> {
    const trusted = await this.checkTrustedDevice(phone);
    return trusted === null;
  }
  
  /**
   * Auto-login với trusted device (không cần OTP)
   * 
   * @returns tokens nếu có, null nếu không
   */
  async autoLogin(phone: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const trusted = await this.checkTrustedDevice(phone);
    
    if (!trusted || !trusted.accessToken || !trusted.refreshToken) {
      return null;
    }
    
    // Cập nhật lastLoginAt
    await this.updateTrustedDevice(phone);
    
    return {
      accessToken: trusted.accessToken,
      refreshToken: trusted.refreshToken,
    };
  }
}

// ==================== SINGLETON EXPORT ====================

export const trustedDeviceService = new TrustedDeviceService();

// Default export
export default trustedDeviceService;
