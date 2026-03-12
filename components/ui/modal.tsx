/**
 * Modal/Dialog Component
 * Customizable modal with header, body, and footer
 */

import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
    Dimensions,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle,
} from 'react-native';
import { Shadows } from '../../constants/shadows';
import { BorderRadiusSemantic, IconSize, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';
import { Button } from './button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayPress?: boolean;
  style?: ViewStyle;
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayPress = true,
  style,
}: ModalProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const overlayColor = useThemeColor({}, 'overlay');

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { maxHeight: SCREEN_HEIGHT * 0.4 },
    md: { maxHeight: SCREEN_HEIGHT * 0.6 },
    lg: { maxHeight: SCREEN_HEIGHT * 0.8 },
    full: { height: SCREEN_HEIGHT - Spacing[12] },
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={closeOnOverlayPress ? onClose : undefined}
        >
          <View
            style={[
              styles.modalContainer,
              sizeStyles[size],
              { backgroundColor: surfaceColor },
              Shadows.modal,
              style,
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={[styles.header, { borderBottomColor: borderColor }]}>
                {title && (
                  <Text style={[styles.title, { color: textColor }]}>
                    {title}
                  </Text>
                )}
                {showCloseButton && (
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={IconSize.lg} color={textColor} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Body */}
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {/* Footer */}
            {footer && (
              <View style={[styles.footer, { borderTopColor: borderColor }]}>
                {footer}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalContainer: {
    width: '100%',
    borderRadius: BorderRadiusSemantic.modal,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
    borderBottomWidth: 1,
  },
  title: {
    fontSize: TextVariants.h5.fontSize,
    fontWeight: TextVariants.h5.fontWeight,
    flex: 1,
  },
  closeButton: {
    marginLeft: Spacing[2],
    padding: Spacing[1],
  },
  body: {
    maxHeight: '100%',
  },
  bodyContent: {
    padding: Spacing[4],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: Spacing[4],
    borderTopWidth: 1,
    gap: Spacing[2],
  },
});

// Confirm Dialog Helper
export interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: 'primary' | 'danger';
}

export function ConfirmDialog({
  visible,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
}: ConfirmDialogProps) {
  const textColor = useThemeColor({}, 'text');

  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button title={cancelText} variant="secondary" onPress={onCancel} />
          <Button
            title={confirmText}
            variant="primary"
            onPress={onConfirm}
          />
        </>
      }
    >
      <Text style={[confirmDialogStyles.confirmMessage, { color: textColor }]}>
        {message}
      </Text>
    </Modal>
  );
}

const confirmDialogStyles = StyleSheet.create({
  confirmMessage: {
    fontSize: TextVariants.body1.fontSize,
    lineHeight: TextVariants.body1.lineHeight,
  },
});
