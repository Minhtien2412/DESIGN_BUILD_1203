import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { QRGenerator } from '../../components/qr/QRGenerator';
import { useAuth } from '../../context/AuthContext';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function MyQRCodeScreen() {
  const { user } = useAuth();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <Stack.Screen options={{ title: 'My QR Code' }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="qr-code-outline" size={64} color={textMuted} />
          <Text style={[styles.emptyText, { color: text }]}>
            Please login to view your QR code
          </Text>
        </View>
      </View>
    );
  }

  // Generate user data for QR code
  const userData = `user:${user.id}`;
  const profileUrl = `https://app.thietkeresort.com.vn/profile/${user.id}`;

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Stack.Screen 
        options={{ 
          title: 'My QR Code',
          headerRight: () => (
            <Pressable onPress={() => router.push('/utilities/qr-scanner' as any)}>
              <Ionicons name="scan-outline" size={24} color={primary} style={{ marginRight: 16 }} />
            </Pressable>
          ),
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info */}
        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.name, { color: text }]}>{user.name || user.email}</Text>
          <Text style={[styles.email, { color: textMuted }]}>{user.email}</Text>
          {user.role && (
            <Text style={[styles.role, { color: primary }]}>{user.role}</Text>
          )}
        </View>

        {/* QR Code - User Profile */}
        <QRGenerator
          data={userData}
          title="Profile QR Code"
          description="Others can scan this to view your profile"
          size={240}
        />

        {/* QR Code - Profile URL */}
        <QRGenerator
          data={profileUrl}
          title="Profile Link"
          description="Share your profile URL"
          size={200}
        />

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.instructionsTitle, { color: text }]}>
            How to use:
          </Text>
          <View style={styles.instruction}>
            <Ionicons name="checkmark-circle" size={20} color={primary} />
            <Text style={[styles.instructionText, { color: textMuted }]}>
              Show this QR code to others to share your profile
            </Text>
          </View>
          <View style={styles.instruction}>
            <Ionicons name="checkmark-circle" size={20} color={primary} />
            <Text style={[styles.instructionText, { color: textMuted }]}>
              Tap share icon to send via messaging apps
            </Text>
          </View>
          <View style={styles.instruction}>
            <Ionicons name="checkmark-circle" size={20} color={primary} />
            <Text style={[styles.instructionText, { color: textMuted }]}>
              Tap save icon to download QR code image
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  instructionsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
