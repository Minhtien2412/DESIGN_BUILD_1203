/**
 * LuxuryModal - Premium modal component
 * European luxury design with backdrop blur and smooth animations
 */

import { LuxuryButton } from '@/components/ui/luxury-button';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    ModalProps,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LuxuryModalProps extends Omit<ModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  showHeader?: boolean;
  footerActions?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury';
    loading?: boolean;
  }[];
  maxHeight?: number;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export function LuxuryModal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  showHeader = true,
  footerActions,
  maxHeight,
  size = 'medium',
  ...modalProps
}: LuxuryModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: Animations.timing.smooth,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: Animations.timing.fast,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: Animations.timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const getModalSize = () => {
    switch (size) {
      case 'small':
        return { width: '80%' as const, maxHeight: maxHeight || 400 };
      case 'large':
        return { width: '95%' as const, maxHeight: maxHeight || '85%' as const };
      case 'fullscreen':
        return { width: '100%' as const, height: '100%' as const, borderRadius: 0, marginTop: 0 };
      default:
        return { width: '90%' as const, maxHeight: maxHeight || 600 };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      {...modalProps}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
            ) : (
              <View style={styles.backdropFallback} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            getModalSize(),
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Header */}
          {showHeader && (
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.goldAccent} />
                {title && <Text style={styles.title}>{title}</Text>}
              </View>
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={Colors.light.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>

          {/* Footer Actions */}
          {footerActions && footerActions.length > 0 && (
            <View style={styles.footer}>
              {footerActions.map((action, index) => (
                <LuxuryButton
                  key={index}
                  title={action.label}
                  variant={action.variant || 'primary'}
                  onPress={action.onPress}
                  loading={action.loading}
                  style={StyleSheet.flatten([
                    styles.footerButton,
                    index < footerActions.length - 1 ? styles.footerButtonGap : undefined,
                  ])}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    marginTop: 60,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goldAccent: {
    width: 4,
    height: 24,
    backgroundColor: Colors.light.accent,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  footerButtonGap: {
    marginRight: 0,
  },
});
