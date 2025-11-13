import * as Clipboard from 'expo-clipboard';
import { Stack, router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { QRScanner } from '../../components/qr/QRScanner';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function QRScannerScreen() {
  const background = useThemeColor({}, 'background');

  const handleScan = (data: string) => {
    Alert.alert(
      'QR Code Scanned',
      data,
      [
        { text: 'Open Link', onPress: () => handleOpenLink(data) },
        { text: 'Copy', onPress: () => handleCopy(data) },
        { text: 'Close', onPress: () => router.back() },
      ]
    );
  };

  const handleOpenLink = (data: string) => {
    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      // Navigate to web view or open in browser
      router.push(`/web-view?url=${encodeURIComponent(data)}` as any);
    } else if (data.startsWith('user:')) {
      // Navigate to user profile
      const userId = data.replace('user:', '');
      router.push(`/profile/${userId}` as any);
    } else if (data.startsWith('project:')) {
      // Navigate to project
      const projectId = data.replace('project:', '');
      router.push(`/projects/${projectId}`);
    } else {
      Alert.alert('Info', 'This is not a recognized link format');
    }
  };

  const handleCopy = async (data: string) => {
    try {
      await Clipboard.setStringAsync(data);
      Alert.alert('Đã sao chép', 'Nội dung QR đã được sao chép');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể sao chép nội dung');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <QRScanner onScan={handleScan} onClose={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
