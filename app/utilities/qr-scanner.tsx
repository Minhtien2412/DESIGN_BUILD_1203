/**
 * QR Code Scanner
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // In real implementation, request camera permission here
    setHasPermission(true);
  }, []);

  const handleBarCodeScanned = (data: string) => {
    setScanned(true);
    Alert.alert(
      'QR Code Scanned',
      `Data: ${data}`,
      [
        { text: 'Scan Again', onPress: () => setScanned(false) },
        { text: 'OK', onPress: () => router.back() },
      ]
    );
  };

  // Demo scan function
  const handleDemoScan = () => {
    handleBarCodeScanned('https://example.com/user/12345');
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContent}>
          <Text>Đang yêu cầu quyền camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Cần quyền truy cập Camera</Text>
          <Text style={styles.errorText}>
            Vui lòng cấp quyền camera để quét mã QR
          </Text>
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.settingsBtnText}>Mở Cài đặt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quét mã QR</Text>
        <TouchableOpacity style={styles.flashBtn}>
          <Ionicons name="flash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Scanner View (Mock) */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame}>
            {/* Corner decorators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Scan line animation placeholder */}
            <View style={styles.scanLine} />
          </View>
          
          <Text style={styles.instruction}>
            Đưa mã QR vào khung để quét
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDemoScan}>
          <Ionicons name="scan" size={24} color="#0066CC" />
          <Text style={styles.actionBtnText}>Demo Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="image-outline" size={24} color="#666" />
          <Text style={styles.actionBtnText}>Từ thư viện</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="time-outline" size={24} color="#666" />
          <Text style={styles.actionBtnText}>Lịch sử</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  errorText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  settingsBtn: { backgroundColor: '#0066CC', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  settingsBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  flashBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scannerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scannerOverlay: { alignItems: 'center' },
  scannerFrame: {
    width: 280,
    height: 280,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#0066CC',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#0066CC',
    opacity: 0.8,
  },
  instruction: { color: '#fff', fontSize: 14, marginTop: 24 },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  actionBtn: { alignItems: 'center', padding: 12 },
  actionBtnText: { fontSize: 12, color: '#333', marginTop: 4 },
});
