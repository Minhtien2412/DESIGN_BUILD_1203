/**
 * CRM Notifications Page
 * ======================
 * 
 * Hiển thị thông báo từ Perfex CRM
 * Route: /crm-notifications
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import { CrmNotificationsScreen } from '@/components/crm/CrmNotificationsScreen';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';

export default function CrmNotificationsPage() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const headerBackground = useThemeColor({}, 'card');
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Thông báo CRM',
          headerStyle: {
            backgroundColor: headerBackground,
          },
          headerTintColor: textColor,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <CrmNotificationsScreen />
    </>
  );
}
