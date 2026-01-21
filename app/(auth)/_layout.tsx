import { UnifiedAuthProvider } from '@/context/UnifiedAuthContext';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <UnifiedAuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="login-enhanced" />
        <Stack.Screen name="login-shopee" />
        <Stack.Screen name="register" />
        <Stack.Screen name="register-enhanced" />
        <Stack.Screen name="register-shopee" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="forgot-password-enhanced" />
      </Stack>
    </UnifiedAuthProvider>
  );
}
