import { Platform } from 'react-native';

// Lazy require to avoid type resolution issues before dependency is installed
function getLocalAuth() {
  try {
     
    const mod = require('expo-local-authentication');
    return mod as any;
  } catch {
    return null as any;
  }
}

export type BiometricType = 'FINGERPRINT' | 'FACIAL_RECOGNITION' | 'IRIS' | 'UNKNOWN';

export async function isBiometricAvailable(): Promise<{ available: boolean; enrolled: boolean; types: BiometricType[] }>{
  if (Platform.OS === 'web') return { available: false, enrolled: false, types: [] };
  const LocalAuthentication = getLocalAuth();
  if (!LocalAuthentication) return { available: false, enrolled: false, types: [] };

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
    let types: BiometricType[] = [];
    if (hasHardware) {
      try {
        const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
        types = (supported || []).map((t: number) => {
          switch (t) {
            // expo-local-authentication constants
            case 1: return 'FINGERPRINT';
            case 2: return 'FACIAL_RECOGNITION';
            case 3: return 'IRIS';
            default: return 'UNKNOWN';
          }
        });
      } catch {}
    }
    return { available: hasHardware, enrolled: isEnrolled, types };
  } catch {
    return { available: false, enrolled: false, types: [] };
  }
}

export async function authenticateWithBiometrics(promptMessage = 'Xác thực sinh trắc học', cancelLabel = 'Hủy') {
  if (Platform.OS === 'web') return { success: false, error: 'UNSUPPORTED' } as const;
  const LocalAuthentication = getLocalAuth();
  if (!LocalAuthentication) return { success: false, error: 'UNAVAILABLE' } as const;

  try {
    const { available, enrolled } = await isBiometricAvailable();
    if (!available) return { success: false, error: 'NO_HARDWARE' } as const;
    if (!enrolled) return { success: false, error: 'NOT_ENROLLED' } as const;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel,
      disableDeviceFallback: false, // allow device PIN/passcode fallback
      requireConfirmation: Platform.OS === 'android' ? false : undefined,
    });
    return { success: !!result?.success, error: result?.error } as const;
  } catch (e: any) {
    return { success: false, error: e?.message || 'UNKNOWN' } as const;
  }
}
