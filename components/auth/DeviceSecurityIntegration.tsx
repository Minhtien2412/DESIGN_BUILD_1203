import { useAuth } from '@/features/auth';
import { router } from 'expo-router';
import { DeviceSecurityAlert } from './DeviceSecurityAlert';

export function DeviceSecurityIntegration() {
  const { 
    deviceSecurityAlert, 
    dismissDeviceAlert, 
    trustCurrentDevice 
  } = useAuth();

  const handleChangePassword = () => {
    // Navigate to profile where user can change password
    router.push('/(tabs)/profile');
  };

  const handleViewDevices = () => {
    // Navigate to device management screen
    router.push('/device-management');
  };

  return (
    <DeviceSecurityAlert
      visible={deviceSecurityAlert.visible}
      isNewDevice={deviceSecurityAlert.isNewDevice}
      otherDevices={deviceSecurityAlert.otherDevices}
      warningMessage={deviceSecurityAlert.warningMessage}
      onTrustDevice={trustCurrentDevice}
      onChangePassword={handleChangePassword}
      onViewDevices={handleViewDevices}
      onDismiss={dismissDeviceAlert}
    />
  );
}
