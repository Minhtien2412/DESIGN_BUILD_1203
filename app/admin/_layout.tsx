import { useAuth } from '@/context/AuthContext';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  const isAdmin = !!user?.admin || user?.role === 'admin' || user?.global_roles?.includes('admin');

  if (!isAdmin) {
    return (
      <View style={styles.guard}>
        <Text style={styles.title}>Không có quyền truy cập</Text>
        <Text style={styles.subtitle}>Chỉ tài khoản Admin mới được quản lý phân quyền</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  guard: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
});
