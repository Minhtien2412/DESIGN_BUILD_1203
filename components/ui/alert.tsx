/**
 * Alert/Toast Component
 * Shows temporary success/error/warning/info messages
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Shadows } from '../../constants/shadows';
import { BorderRadiusSemantic, IconSize, Spacing } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

// Context for managing alerts globally
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  visible: boolean;
  onClose?: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
}

const iconMap: Record<AlertType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

export default function Alert({
  type,
  title,
  message,
  visible,
  onClose,
  duration = 3000,
  position = 'top',
}: AlertProps) {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const infoColor = useThemeColor({}, 'info');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');

  const colorMap: Record<AlertType, string> = {
    success: successColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
  };

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.containerTop : styles.containerBottom,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.alert,
          {
            backgroundColor: surfaceColor,
            borderLeftColor: colorMap[type],
          },
          Shadows.toast,
        ]}
      >
        <Ionicons
          name={iconMap[type]}
          size={IconSize.lg}
          color={colorMap[type]}
          style={styles.icon}
        />
        <View style={styles.content}>
          {title && (
            <Text
              style={[
                styles.title,
                { color: textColor },
              ]}
            >
              {title}
            </Text>
          )}
          <Text
            style={[
              styles.message,
              { color: textColor },
            ]}
          >
            {message}
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={IconSize.md} color={textColor} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 9999,
  },
  containerTop: {
    top: Spacing[12],
  },
  containerBottom: {
    bottom: Spacing[12],
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing[4],
    borderRadius: BorderRadiusSemantic.card,
    borderLeftWidth: 4,
  },
  icon: {
    marginRight: Spacing[3],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TextVariants.body1.fontSize,
    fontWeight: TextVariants.h6.fontWeight,
    marginBottom: Spacing[1],
  },
  message: {
    fontSize: TextVariants.body2.fontSize,
    lineHeight: TextVariants.body2.lineHeight,
  },
  closeButton: {
    marginLeft: Spacing[2],
    padding: Spacing[1],
  },
});

interface AlertContextType {
  showAlert: (config: Omit<AlertProps, 'visible'>) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<AlertProps | null>(null);

  const showAlert = useCallback((config: Omit<AlertProps, 'visible'>) => {
    setAlertConfig({ ...config, visible: true });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => prev ? { ...prev, visible: false } : null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <Alert
          {...alertConfig}
          onClose={() => {
            alertConfig.onClose?.();
            hideAlert();
          }}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
