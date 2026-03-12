import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeColor } from '../../hooks/use-theme-color';

interface QRGeneratorProps {
  data: string;
  title?: string;
  description?: string;
  size?: number;
  logo?: any;
}

export function QRGenerator({ 
  data, 
  title, 
  description, 
  size = 200,
  logo 
}: QRGeneratorProps) {
  const qrRef = useRef<any>(null);
  
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title || 'Scan this QR code'}:\n${data}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSaveQR = () => {
    qrRef.current?.toDataURL(async (dataURL: string) => {
      try {
        // Convert base64 to blob/file for sharing
        Alert.alert(
          'Save QR Code',
          'QR code generated. Use the Share button to save or share it.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to generate QR code');
        console.error('Save error:', error);
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
      {title && (
        <Text style={[styles.title, { color: text }]}>{title}</Text>
      )}
      
      {description && (
        <Text style={[styles.description, { color: textMuted }]}>
          {description}
        </Text>
      )}

      <View style={[styles.qrContainer, { backgroundColor: '#fff' }]}>
        <QRCode
          value={data}
          size={size}
          color="#000"
          backgroundColor="#fff"
          logo={logo}
          logoSize={size * 0.2}
          logoBackgroundColor="#fff"
          getRef={(ref) => (qrRef.current = ref)}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleShare}
          style={[styles.actionButton, { backgroundColor: primary }]}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>

        <Pressable
          onPress={handleSaveQR}
          style={[styles.actionButton, { backgroundColor: primary }]}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
