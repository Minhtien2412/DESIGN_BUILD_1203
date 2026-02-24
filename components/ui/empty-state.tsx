import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'error' | 'info';
}

const VARIANT_CONFIG = {
  default: {
    iconColor: '#9CA3AF',
    icon: 'folder-open-outline',
  },
  search: {
    iconColor: '#0D9488',
    icon: 'search-outline',
  },
  error: {
    iconColor: '#000000',
    icon: 'alert-circle-outline',
  },
  info: {
    iconColor: '#0D9488',
    icon: 'information-circle-outline',
  },
};

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = '#6B7280';
  const primaryColor = '#0D9488';
  
  const config = VARIANT_CONFIG[variant];
  const displayIcon = icon || config.icon;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.iconColor + '15' }]}>
        <Ionicons
          name={displayIcon as any}
          size={64}
          color={config.iconColor}
        />
      </View>
      
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      
      {message && (
        <Text style={[styles.message, { color: mutedColor }]}>{message}</Text>
      )}
      
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
