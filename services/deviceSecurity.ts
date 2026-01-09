import { ClientDeviceFingerprint, getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { deleteItem, getItem, setItem } from '@/utils/storage';
import { Platform } from 'react-native';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  fingerprint: ClientDeviceFingerprint;
  lastLoginAt: string;
  isCurrentDevice: boolean;
  isTrusted: boolean;
  location?: {
    ip?: string;
    country?: string;
    city?: string;
  };
}

export interface UserSession {
  userId: string;
  devices: DeviceInfo[];
  maxDevices: number;
  lastSecurityCheck: string;
}

const DEVICE_SESSIONS_KEY = 'auth:device_sessions';
const CURRENT_DEVICE_KEY = 'auth:current_device';
const TRUSTED_DEVICES_KEY = 'auth:trusted_devices';

// Tạo tên thiết bị thân thiện
function generateDeviceName(): string {
  const platform = Platform.OS;
  const timestamp = new Date().toISOString().slice(0, 10);
  
  switch (platform) {
    case 'ios':
      return `iPhone ${timestamp}`;
    case 'android':
      return `Android ${timestamp}`;
    case 'web':
      return `Web Browser ${timestamp}`;
    default:
      return `Thiết bị ${timestamp}`;
  }
}

// Lấy thông tin thiết bị hiện tại
export function getCurrentDeviceInfo(): DeviceInfo {
  const fingerprint = getDeviceFingerprint();
  const deviceName = generateDeviceName();
  
  return {
    deviceId: fingerprint.deviceId,
    deviceName,
    deviceType: Platform.OS,
    fingerprint,
    lastLoginAt: new Date().toISOString(),
    isCurrentDevice: true,
    isTrusted: false,
    location: {
      // Có thể lấy từ API IP geolocation
      ip: 'unknown',
      country: 'VN',
      city: 'unknown'
    }
  };
}

// Lưu thông tin thiết bị hiện tại
export async function saveCurrentDevice(deviceInfo: DeviceInfo): Promise<void> {
  await setItem(CURRENT_DEVICE_KEY, JSON.stringify(deviceInfo));
}

// Lấy thông tin thiết bị hiện tại đã lưu
export async function getCurrentDevice(): Promise<DeviceInfo | null> {
  try {
    const stored = await getItem(CURRENT_DEVICE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Lưu session thiết bị của user
export async function saveUserDeviceSession(userId: string, deviceInfo: DeviceInfo): Promise<void> {
  try {
    const sessionsData = await getItem(DEVICE_SESSIONS_KEY);
    const sessions: Record<string, UserSession> = sessionsData ? JSON.parse(sessionsData) : {};
    
    if (!sessions[userId]) {
      sessions[userId] = {
        userId,
        devices: [],
        maxDevices: 3, // Giới hạn tối đa 3 thiết bị
        lastSecurityCheck: new Date().toISOString()
      };
    }
    
    const userSession = sessions[userId];
    
    // Tìm thiết bị hiện tại trong danh sách
    const existingDeviceIndex = userSession.devices.findIndex(d => d.deviceId === deviceInfo.deviceId);
    
    if (existingDeviceIndex >= 0) {
      // Cập nhật thông tin thiết bị đã tồn tại
      userSession.devices[existingDeviceIndex] = {
        ...userSession.devices[existingDeviceIndex],
        ...deviceInfo,
        lastLoginAt: new Date().toISOString()
      };
    } else {
      // Thêm thiết bị mới
      // Nếu vượt quá giới hạn, xóa thiết bị cũ nhất
      if (userSession.devices.length >= userSession.maxDevices) {
        userSession.devices.sort((a, b) => new Date(a.lastLoginAt).getTime() - new Date(b.lastLoginAt).getTime());
        userSession.devices.shift(); // Xóa thiết bị cũ nhất
      }
      
      userSession.devices.push(deviceInfo);
    }
    
    // Đánh dấu tất cả thiết bị khác là không phải thiết bị hiện tại
    userSession.devices.forEach(device => {
      device.isCurrentDevice = device.deviceId === deviceInfo.deviceId;
    });
    
    sessions[userId] = userSession;
    await setItem(DEVICE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving device session:', error);
  }
}

// Lấy danh sách thiết bị của user
export async function getUserDevices(userId: string): Promise<DeviceInfo[]> {
  try {
    const sessionsData = await getItem(DEVICE_SESSIONS_KEY);
    const sessions: Record<string, UserSession> = sessionsData ? JSON.parse(sessionsData) : {};
    
    return sessions[userId]?.devices || [];
  } catch {
    return [];
  }
}

// Kiểm tra thiết bị mới
export async function checkNewDeviceLogin(userId: string): Promise<{
  isNewDevice: boolean;
  otherDevices: DeviceInfo[];
  warningMessage?: string;
}> {
  const currentDevice = getCurrentDeviceInfo();
  const userDevices = await getUserDevices(userId);
  
  const isKnownDevice = userDevices.some(device => device.deviceId === currentDevice.deviceId);
  const otherDevices = userDevices.filter(device => device.deviceId !== currentDevice.deviceId);
  
  if (!isKnownDevice && otherDevices.length > 0) {
    const latestDevice = otherDevices.reduce((latest, device) => 
      new Date(device.lastLoginAt) > new Date(latest.lastLoginAt) ? device : latest
    );
    
    const warningMessage = `Phát hiện đăng nhập từ thiết bị mới!\n\n` +
      `Thiết bị trước đó: ${latestDevice.deviceName}\n` +
      `Lần đăng nhập gần nhất: ${new Date(latestDevice.lastLoginAt).toLocaleString('vi-VN')}\n\n` +
      `Nếu không phải bạn, vui lòng đổi mật khẩu ngay lập tức!`;
    
    return {
      isNewDevice: true,
      otherDevices,
      warningMessage
    };
  }
  
  return {
    isNewDevice: false,
    otherDevices
  };
}

// Tin cậy thiết bị hiện tại
export async function trustCurrentDevice(userId: string): Promise<void> {
  const currentDevice = getCurrentDeviceInfo();
  currentDevice.isTrusted = true;
  
  await saveUserDeviceSession(userId, currentDevice);
  await saveCurrentDevice(currentDevice);
  
  // Lưu vào danh sách thiết bị tin cậy
  const trustedDevices = await getTrustedDevices(userId);
  if (!trustedDevices.some(d => d.deviceId === currentDevice.deviceId)) {
    trustedDevices.push(currentDevice);
    await setTrustedDevices(userId, trustedDevices);
  }
}

// Lấy danh sách thiết bị tin cậy
export async function getTrustedDevices(userId: string): Promise<DeviceInfo[]> {
  try {
    const stored = await getItem(`${TRUSTED_DEVICES_KEY}:${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Lưu danh sách thiết bị tin cậy
export async function setTrustedDevices(userId: string, devices: DeviceInfo[]): Promise<void> {
  await setItem(`${TRUSTED_DEVICES_KEY}:${userId}`, JSON.stringify(devices));
}

// Hủy tin cậy thiết bị
export async function revokeDeviceTrust(userId: string, deviceId: string): Promise<void> {
  const trustedDevices = await getTrustedDevices(userId);
  const filteredDevices = trustedDevices.filter(d => d.deviceId !== deviceId);
  await setTrustedDevices(userId, filteredDevices);
  
  // Cập nhật trong session
  const userDevices = await getUserDevices(userId);
  const device = userDevices.find(d => d.deviceId === deviceId);
  if (device) {
    device.isTrusted = false;
    await saveUserDeviceSession(userId, device);
  }
}

// Xóa thiết bị khỏi tài khoản
export async function removeDevice(userId: string, deviceId: string): Promise<void> {
  try {
    const sessionsData = await getItem(DEVICE_SESSIONS_KEY);
    const sessions: Record<string, UserSession> = sessionsData ? JSON.parse(sessionsData) : {};
    
    if (sessions[userId]) {
      sessions[userId].devices = sessions[userId].devices.filter(d => d.deviceId !== deviceId);
      await setItem(DEVICE_SESSIONS_KEY, JSON.stringify(sessions));
    }
    
    // Xóa khỏi danh sách tin cậy
    await revokeDeviceTrust(userId, deviceId);
  } catch (error) {
    console.error('Error removing device:', error);
  }
}

// Xóa tất cả thiết bị khác (đăng xuất khỏi tất cả thiết bị khác)
export async function logoutOtherDevices(userId: string): Promise<void> {
  const currentDevice = getCurrentDeviceInfo();
  
  try {
    const sessionsData = await getItem(DEVICE_SESSIONS_KEY);
    const sessions: Record<string, UserSession> = sessionsData ? JSON.parse(sessionsData) : {};
    
    if (sessions[userId]) {
      // Chỉ giữ lại thiết bị hiện tại
      sessions[userId].devices = sessions[userId].devices.filter(d => d.deviceId === currentDevice.deviceId);
      await setItem(DEVICE_SESSIONS_KEY, JSON.stringify(sessions));
    }
    
    // Cập nhật danh sách tin cậy - chỉ giữ thiết bị hiện tại nếu nó được tin cậy
    const trustedDevices = await getTrustedDevices(userId);
    const currentTrusted = trustedDevices.find(d => d.deviceId === currentDevice.deviceId);
    await setTrustedDevices(userId, currentTrusted ? [currentTrusted] : []);
  } catch (error) {
    console.error('Error logging out other devices:', error);
  }
}

// Xóa tất cả session khi đăng xuất hoàn toàn
export async function clearAllDeviceSessions(userId: string): Promise<void> {
  try {
    const sessionsData = await getItem(DEVICE_SESSIONS_KEY);
    const sessions: Record<string, UserSession> = sessionsData ? JSON.parse(sessionsData) : {};
    
    delete sessions[userId];
    await setItem(DEVICE_SESSIONS_KEY, JSON.stringify(sessions));
    
    // Xóa thiết bị hiện tại
    await deleteItem(CURRENT_DEVICE_KEY);
    
    // Xóa danh sách tin cậy
    await deleteItem(`${TRUSTED_DEVICES_KEY}:${userId}`);
  } catch (error) {
    console.error('Error clearing device sessions:', error);
  }
}
