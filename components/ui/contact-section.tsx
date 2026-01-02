/**
 * Contact Section Component - Nhà Xinh Style
 * Elegant, premium contact interface with multiple contact methods
 * Inspired by Nha Xinh's sophisticated design language
 */

import { Ionicons } from '@expo/vector-icons';
import {
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Nhà Xinh inspired color palette
const NHA_XINH_COLORS = {
  gold: '#B8860B',
  darkGold: '#8B6914',
  black: '#1A1A1A',
  white: '#FFFFFF',
  cream: '#F5F5DC',
  lightGold: '#FFF8DC',
  border: '#E5E1D8',
  textPrimary: '#2C2C2C',
  textSecondary: '#666666',
};

export interface ContactMethod {
  type: 'phone' | 'email' | 'chat' | 'location' | 'website';
  label: string;
  value: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface ContactSectionProps {
  title?: string;
  subtitle?: string;
  methods: ContactMethod[];
  style?: any;
  variant?: 'default' | 'compact' | 'premium';
}

export function ContactSection({
  title = 'Liên hệ với chúng tôi',
  subtitle = 'Chúng tôi luôn sẵn sàng hỗ trợ bạn',
  methods,
  style,
  variant = 'default',
}: ContactSectionProps) {
  
  const handlePress = (method: ContactMethod) => {
    switch (method.type) {
      case 'phone':
        Linking.openURL(`tel:${method.value.replace(/\s/g, '')}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${method.value}`);
        break;
      case 'chat':
        // Navigate to chat - will be handled by parent
        break;
      case 'website':
        Linking.openURL(method.value);
        break;
      case 'location':
        // Open maps
        const encodedAddress = encodeURIComponent(method.value);
        const url = Platform.select({
          ios: `maps:0,0?q=${encodedAddress}`,
          android: `geo:0,0?q=${encodedAddress}`,
        });
        if (url) Linking.openURL(url);
        break;
    }
  };

  const getIcon = (method: ContactMethod): keyof typeof Ionicons.glyphMap => {
    if (method.icon) return method.icon;
    
    switch (method.type) {
      case 'phone': return 'call';
      case 'email': return 'mail';
      case 'chat': return 'chatbubbles';
      case 'location': return 'location';
      case 'website': return 'globe';
      default: return 'information-circle';
    }
  };

  if (variant === 'compact') {
    return (
      <View style={[styles.containerCompact, style]}>
        <View style={styles.methodsRow}>
          {methods.map((method, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.methodCompact,
                pressed && styles.methodPressed,
              ]}
              onPress={() => handlePress(method)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={getIcon(method)} size={20} color={NHA_XINH_COLORS.gold} />
              </View>
              <Text style={styles.methodLabelCompact}>{method.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  if (variant === 'premium') {
    return (
      <View style={[styles.containerPremium, style]}>
        {/* Gold accent bar */}
        <View style={styles.goldBar} />
        
        {/* Header */}
        <View style={styles.headerPremium}>
          <Text style={styles.titlePremium}>{title}</Text>
          {subtitle && <Text style={styles.subtitlePremium}>{subtitle}</Text>}
        </View>

        {/* Contact methods - 2 columns */}
        <View style={styles.methodsGrid}>
          {methods.map((method, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.methodCardPremium,
                pressed && styles.methodCardPressed,
              ]}
              onPress={() => handlePress(method)}
            >
              <View style={styles.methodIconPremium}>
                <Ionicons name={getIcon(method)} size={24} color={NHA_XINH_COLORS.gold} />
              </View>
              <View style={styles.methodContentPremium}>
                <Text style={styles.methodLabelPremium}>{method.label}</Text>
                <Text style={styles.methodValuePremium} numberOfLines={1}>
                  {method.value}
                </Text>
                {method.subtitle && (
                  <Text style={styles.methodSubtitlePremium}>{method.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={NHA_XINH_COLORS.textSecondary} />
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  // Default variant
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Contact methods */}
      <View style={styles.methods}>
        {methods.map((method, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.methodCard,
              pressed && styles.methodCardPressed,
              index < methods.length - 1 && styles.methodCardBorder,
            ]}
            onPress={() => handlePress(method)}
          >
            <View style={styles.methodIcon}>
              <Ionicons name={getIcon(method)} size={22} color={NHA_XINH_COLORS.gold} />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodLabel}>{method.label}</Text>
              <Text style={styles.methodValue}>{method.value}</Text>
              {method.subtitle && (
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={NHA_XINH_COLORS.textSecondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Default variant
  container: {
    backgroundColor: NHA_XINH_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NHA_XINH_COLORS.border,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: NHA_XINH_COLORS.border,
    backgroundColor: NHA_XINH_COLORS.lightGold,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: NHA_XINH_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: NHA_XINH_COLORS.textSecondary,
    lineHeight: 18,
  },
  methods: {
    backgroundColor: NHA_XINH_COLORS.white,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  methodCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: NHA_XINH_COLORS.border,
  },
  methodCardPressed: {
    backgroundColor: NHA_XINH_COLORS.cream,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NHA_XINH_COLORS.lightGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 13,
    color: NHA_XINH_COLORS.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  methodValue: {
    fontSize: 16,
    fontWeight: '600',
    color: NHA_XINH_COLORS.textPrimary,
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 12,
    color: NHA_XINH_COLORS.textSecondary,
    marginTop: 2,
  },

  // Compact variant
  containerCompact: {
    backgroundColor: NHA_XINH_COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: NHA_XINH_COLORS.border,
  },
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  methodCompact: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  methodPressed: {
    backgroundColor: NHA_XINH_COLORS.cream,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NHA_XINH_COLORS.lightGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NHA_XINH_COLORS.gold,
  },
  methodLabelCompact: {
    fontSize: 11,
    fontWeight: '600',
    color: NHA_XINH_COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Premium variant
  containerPremium: {
    backgroundColor: NHA_XINH_COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  goldBar: {
    height: 4,
    backgroundColor: NHA_XINH_COLORS.gold,
  },
  headerPremium: {
    padding: 24,
    paddingBottom: 20,
    backgroundColor: NHA_XINH_COLORS.cream,
  },
  titlePremium: {
    fontSize: 20,
    fontWeight: '700',
    color: NHA_XINH_COLORS.black,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitlePremium: {
    fontSize: 14,
    color: NHA_XINH_COLORS.textSecondary,
    lineHeight: 20,
  },
  methodsGrid: {
    padding: 16,
    gap: 12,
  },
  methodCardPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    backgroundColor: NHA_XINH_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NHA_XINH_COLORS.border,
  },
  methodIconPremium: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NHA_XINH_COLORS.lightGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: NHA_XINH_COLORS.gold,
  },
  methodContentPremium: {
    flex: 1,
  },
  methodLabelPremium: {
    fontSize: 12,
    color: NHA_XINH_COLORS.textSecondary,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  methodValuePremium: {
    fontSize: 16,
    fontWeight: '600',
    color: NHA_XINH_COLORS.black,
    marginBottom: 2,
  },
  methodSubtitlePremium: {
    fontSize: 12,
    color: NHA_XINH_COLORS.textSecondary,
    marginTop: 2,
  },
});

// Export colors for use in other components
export { NHA_XINH_COLORS };
