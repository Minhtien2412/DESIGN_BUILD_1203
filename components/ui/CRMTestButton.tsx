import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

/**
 * Quick access button to CRM test screen
 * Add this to profile or menu screen for easy testing
 */
export function CRMTestButton() {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: primaryColor }]}
      onPress={() => router.push('/(tabs)/test-crm')}
    >
      <Ionicons name="cloud-done" size={20} color="#fff" />
      <Text style={styles.buttonText}>Test CRM Sync</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
