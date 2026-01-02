/**
 * useBiometric Hook
 * Centralized biometric authentication with secure credential storage
 */

import { deleteItem, getItem, setItem } from '@/utils/storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface BiometricCredentials {
  email: string;
  token: string; // Encrypted JWT token
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | 'None';
}

export function useBiometric() {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    isEnrolled: false,
    biometricType: 'None',
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCapabilities();
    checkIfEnabled();
  }, []);

  const checkCapabilities = async () => {
    if (Platform.OS === 'web') {
      setCapabilities({ isAvailable: false, isEnrolled: false, biometricType: 'None' });
      setLoading(false);
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricCapabilities['biometricType'] = 'None';
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = Platform.OS === 'ios' ? 'FaceID' : 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = Platform.OS === 'android' ? 'Fingerprint' : 'TouchID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'Iris';
      }

      setCapabilities({
        isAvailable: hasHardware,
        isEnrolled: enrolled,
        biometricType,
      });
    } catch (error) {
      console.error('[useBiometric] Error checking capabilities:', error);
      setCapabilities({ isAvailable: false, isEnrolled: false, biometricType: 'None' });
    } finally {
      setLoading(false);
    }
  };

  const checkIfEnabled = async () => {
    try {
      const enabled = await getItem(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(enabled === 'true');
    } catch (error) {
      console.error('[useBiometric] Error checking enabled status:', error);
      setIsEnabled(false);
    }
  };

  const authenticate = async (promptMessage?: string): Promise<{ success: boolean; error?: string }> => {
    if (!capabilities.isAvailable || !capabilities.isEnrolled) {
      return { success: false, error: 'Biometric not available or not enrolled' };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || `Xác thực bằng ${capabilities.biometricType}`,
        cancelLabel: 'Hủy',
        fallbackLabel: 'Sử dụng mật khẩu',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (error: any) {
      console.error('[useBiometric] Authentication error:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  };

  const saveCredentials = async (email: string, token: string): Promise<boolean> => {
    try {
      const credentials: BiometricCredentials = { email, token };
      await setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
      await setItem(BIOMETRIC_ENABLED_KEY, 'true');
      setIsEnabled(true);
      return true;
    } catch (error) {
      console.error('[useBiometric] Error saving credentials:', error);
      return false;
    }
  };

  const getCredentials = async (): Promise<BiometricCredentials | null> => {
    try {
      const stored = await getItem(BIOMETRIC_CREDENTIALS_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as BiometricCredentials;
    } catch (error) {
      console.error('[useBiometric] Error getting credentials:', error);
      return null;
    }
  };

  const clearCredentials = async (): Promise<boolean> => {
    try {
      await deleteItem(BIOMETRIC_CREDENTIALS_KEY);
      await deleteItem(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(false);
      return true;
    } catch (error) {
      console.error('[useBiometric] Error clearing credentials:', error);
      return false;
    }
  };

  const enableBiometric = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    if (!capabilities.isAvailable || !capabilities.isEnrolled) {
      return { success: false, error: 'Biometric not available' };
    }

    // Test authentication first
    const authResult = await authenticate('Xác thực để bật sinh trắc học');
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Save credentials
    const saved = await saveCredentials(email, token);
    if (!saved) {
      return { success: false, error: 'Failed to save credentials' };
    }

    return { success: true };
  };

  const disableBiometric = async (): Promise<boolean> => {
    return await clearCredentials();
  };

  const loginWithBiometric = async (): Promise<{ success: boolean; credentials?: BiometricCredentials; error?: string }> => {
    if (!isEnabled) {
      return { success: false, error: 'Biometric not enabled' };
    }

    // Authenticate
    const authResult = await authenticate();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // Get credentials
    const credentials = await getCredentials();
    if (!credentials) {
      return { success: false, error: 'No credentials found' };
    }

    return { success: true, credentials };
  };

  return {
    capabilities,
    isEnabled,
    loading,
    authenticate,
    saveCredentials,
    getCredentials,
    clearCredentials,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
  };
}
