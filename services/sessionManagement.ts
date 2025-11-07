// Session Management Service
// Manages user sessions with device-based cookies and database tracking

import { deleteItem, getItem, setItem } from '@/utils/storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch } from './api';

export interface UserSession {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  last_active_at: string;
  is_active: boolean;
  ip_address?: string;
  user_agent?: string;
}

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: string;
  platform: string;
  app_version: string;
  os_version: string;
}

/**
 * Generate unique device ID for current device
 */
export const generateDeviceId = async (): Promise<string> => {
  // Try to get existing device ID first
  let deviceId = await getItem('device_id');
  
  if (!deviceId) {
    // Generate new device ID based on device characteristics
    const installationId = await Application.getAndroidId() || 'unknown';
    const deviceName = Constants.deviceName || Platform.OS || 'Unknown Device';
    const timestamp = Date.now();
    
    // Create a unique hash-like ID
    deviceId = `device_${Platform.OS}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save for future use
    await setItem('device_id', deviceId);
  }
  
  return deviceId;
};

/**
 * Get current device information
 */
export const getCurrentDeviceInfo = async (): Promise<DeviceInfo> => {
  const deviceId = await generateDeviceId();
  
  return {
    device_id: deviceId,
    device_name: Constants.deviceName || Platform.OS || 'Unknown Device',
    device_type: Platform.OS.toUpperCase(),
    platform: Platform.OS,
    app_version: Application.nativeApplicationVersion || '1.0.0',
    os_version: Platform.Version?.toString() || 'Unknown'
  };
};

/**
 * Create new session after successful login
 */
export const createUserSession = async (userId: string, accessToken: string): Promise<UserSession> => {
  const deviceInfo = await getCurrentDeviceInfo();
  
  try {
    // Call backend to create session
    const session = await apiFetch<UserSession>('/auth/sessions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        device_info: deviceInfo,
        access_token: accessToken
      }),
      token: accessToken
    });

    // Store session info locally
    await setItem('session_id', session.id);
    await setItem('session_token', session.session_token);
    await setItem('device_session_active', 'true');
    
    console.log('✅ User session created:', { 
      sessionId: session.id, 
      deviceId: deviceInfo.device_id 
    });

    return session;
  } catch (error) {
    console.error('❌ Failed to create user session:', error);
    // Fallback: create local session record
    const fallbackSession: UserSession = {
      id: `local_session_${Date.now()}`,
      user_id: userId,
      device_id: deviceInfo.device_id,
      device_name: deviceInfo.device_name,
      device_type: deviceInfo.device_type,
      session_token: `local_token_${Math.random().toString(36).substr(2, 16)}`,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      is_active: true
    };

    await setItem('session_id', fallbackSession.id);
    await setItem('session_token', fallbackSession.session_token);
    await setItem('device_session_active', 'true');

    return fallbackSession;
  }
};

/**
 * Validate current session with backend
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const sessionToken = await getItem('session_token');
    const sessionId = await getItem('session_id');
    
    if (!sessionToken || !sessionId) {
      return false;
    }

    // Check with backend
    const session = await apiFetch<UserSession>(`/auth/sessions/${sessionId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ session_token: sessionToken })
    });

    if (session && session.is_active) {
      // Update last active time
      await updateSessionActivity(sessionId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Session validation failed:', error);
    return false;
  }
};

/**
 * Update session last active time
 */
export const updateSessionActivity = async (sessionId: string): Promise<void> => {
  try {
    const sessionToken = await getItem('session_token');
    
    await apiFetch(`/auth/sessions/${sessionId}/activity`, {
      method: 'PUT',
      body: JSON.stringify({ 
        last_active_at: new Date().toISOString(),
        session_token: sessionToken
      })
    });
  } catch (error) {
    // Silent fail - not critical
    console.warn('⚠️ Failed to update session activity:', error);
  }
};

/**
 * Get all active sessions for current user
 */
export const getUserSessions = async (): Promise<UserSession[]> => {
  try {
    const sessions = await apiFetch<UserSession[]>('/auth/sessions');
    return sessions.filter(session => session.is_active);
  } catch (error) {
    console.error('❌ Failed to get user sessions:', error);
    return [];
  }
};

/**
 * Revoke specific session
 */
export const revokeSession = async (sessionId: string): Promise<void> => {
  try {
    await apiFetch(`/auth/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    
    // If revoking current session, clear local data
    const currentSessionId = await getItem('session_id');
    if (currentSessionId === sessionId) {
      await clearCurrentSession();
    }
    
    console.log('✅ Session revoked:', sessionId);
  } catch (error) {
    console.error('❌ Failed to revoke session:', error);
    throw error;
  }
};

/**
 * Revoke all sessions (logout from all devices)
 */
export const revokeAllSessions = async (): Promise<void> => {
  try {
    await apiFetch('/auth/sessions/revoke-all', {
      method: 'DELETE'
    });
    
    await clearCurrentSession();
    console.log('✅ All sessions revoked');
  } catch (error) {
    console.error('❌ Failed to revoke all sessions:', error);
    throw error;
  }
};

/**
 * Clear current device session data
 */
export const clearCurrentSession = async (): Promise<void> => {
  await deleteItem('session_id');
  await deleteItem('session_token');
  await deleteItem('device_session_active');
  console.log('🧹 Current session data cleared');
};

/**
 * Check if current device has active session
 */
export const hasActiveSession = async (): Promise<boolean> => {
  const isActive = await getItem('device_session_active');
  const sessionToken = await getItem('session_token');
  return isActive === 'true' && !!sessionToken;
};

/**
 * Get current session info
 */
export const getCurrentSession = async (): Promise<UserSession | null> => {
  try {
    const sessionId = await getItem('session_id');
    if (!sessionId) return null;

    const session = await apiFetch<UserSession>(`/auth/sessions/${sessionId}`);
    return session;
  } catch (error) {
    console.error('❌ Failed to get current session:', error);
    return null;
  }
};

/**
 * Initialize session management
 */
export const initializeSessionManagement = async (): Promise<void> => {
  try {
    // Ensure device ID exists
    await generateDeviceId();
    
    // Validate existing session if any
    const hasSession = await hasActiveSession();
    if (hasSession) {
      const isValid = await validateSession();
      if (!isValid) {
        console.log('🔄 Invalid session found, clearing...');
        await clearCurrentSession();
      }
    }
    
    console.log('✅ Session management initialized');
  } catch (error) {
    console.error('❌ Failed to initialize session management:', error);
  }
};