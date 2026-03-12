import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

type AuthGateProps = {
  children?: React.ReactNode;
  mode?: 'redirect' | 'inline';
  message?: string;
};

export function AuthGate({ children, mode = 'inline', message }: AuthGateProps) {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!user && mode === 'redirect') {
      router.replace('/(auth)/login');
    }
  }, [user, mode, router]);

  if (user) return <>{children}</>;

  if (mode === 'redirect') {
    return <View />; // blank while navigating
  }

  return (
    <Container>
      <SurfaceCard>
        <ThemedText type="title" style={{ marginBottom: 8 }}>Cần đăng nhập</ThemedText>
        <ThemedText style={{ marginBottom: 12 }}>
          {message || 'Vui lòng đăng nhập để tiếp tục sử dụng tính năng này.'}
        </ThemedText>
        <Button title="Đăng nhập" onPress={() => router.push('/(auth)/login')} />
      </SurfaceCard>
    </Container>
  );
}

export default AuthGate;
