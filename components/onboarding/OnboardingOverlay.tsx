import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDING_KEY = '@onboarding_completed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetPosition?: { x: number; y: number; width: number; height: number };
  placement?: 'top' | 'bottom' | 'center';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Chào mừng đến với App Design & Build',
    description: 'Khám phá hệ thống điều hướng thông minh với 9 danh mục và 52 module chức năng',
    icon: 'rocket-outline',
    placement: 'center',
  },
  {
    id: 'categories',
    title: 'Danh Mục',
    description: 'Nhấn vào bất kỳ danh mục nào để xem các module bên trong. Mỗi danh mục có màu riêng để dễ nhận biết',
    icon: 'grid-outline',
    placement: 'top',
  },
  {
    id: 'search',
    title: 'Tìm Kiếm',
    description: 'Tìm kiếm nhanh bất kỳ chức năng nào trong ứng dụng. Hỗ trợ lọc theo danh mục',
    icon: 'search-outline',
    placement: 'top',
  },
  {
    id: 'drawer',
    title: 'Menu Drawer',
    description: 'Nhấn vào icon menu hoặc vuốt từ trái sang phải để mở drawer. Xem danh sách yêu thích và màn hình gần đây',
    icon: 'menu-outline',
    placement: 'top',
  },
  {
    id: 'favorites',
    title: 'Yêu Thích',
    description: 'Đánh dấu sao để thêm danh mục vào yêu thích. Truy cập nhanh từ drawer',
    icon: 'star-outline',
    placement: 'center',
  },
  {
    id: 'complete',
    title: 'Sẵn sàng!',
    description: 'Bạn đã sẵn sàng khám phá ứng dụng. Có thể xem lại hướng dẫn bất kỳ lúc nào từ cài đặt',
    icon: 'checkmark-circle-outline',
    placement: 'center',
  },
];

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingOverlay({ visible, onComplete }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 8,
        }),
      ]).start();

      // Pulse animation for spotlight
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }),
        ]).start();
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShow(false);
      onComplete();
    });
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShow(false);
        onComplete();
      });
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        slideAnim.setValue(-50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }),
        ]).start();
      });
    }
  };

  if (!show) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Modal visible={show} transparent animationType="none" statusBarTranslucent>
      <View style={styles.container}>
        {/* Dark overlay */}
        <Animated.View style={[styles.overlay, { opacity: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.85],
        }) }]} />

        {/* Spotlight effect */}
        {step.targetPosition && (
          <Animated.View
            style={[
              styles.spotlight,
              {
                left: step.targetPosition.x - 20,
                top: step.targetPosition.y - 20,
                width: step.targetPosition.width + 40,
                height: step.targetPosition.height + 40,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltipContainer,
            step.placement === 'top' && styles.tooltipTop,
            step.placement === 'bottom' && styles.tooltipBottom,
            step.placement === 'center' && styles.tooltipCenter,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.light.primary, '#4A90E2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tooltipGradient}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name={step.icon as any} size={48} color="#FFFFFF" />
            </View>

            {/* Content */}
            <Text style={styles.tooltipTitle}>{step.title}</Text>
            <Text style={styles.tooltipDescription}>{step.description}</Text>

            {/* Progress dots */}
            <View style={styles.progressContainer}>
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {!isFirstStep && (
                <Pressable
                  onPress={handleBack}
                  style={({ pressed }) => [
                    styles.button,
                    styles.backButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </Pressable>
              )}

              <View style={styles.rightButtons}>
                {!isLastStep && (
                  <Pressable
                    onPress={handleSkip}
                    style={({ pressed }) => [
                      styles.button,
                      styles.skipButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={styles.skipButtonText}>Bỏ qua</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleNext}
                  style={({ pressed }) => [
                    styles.button,
                    styles.nextButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.nextButtonText}>
                    {isLastStep ? 'Bắt đầu' : 'Tiếp'}
                  </Text>
                  {!isLastStep && (
                    <Ionicons name="arrow-forward" size={20} color="#1E88E5" />
                  )}
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  tooltipContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH - 48,
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tooltipTop: {
    top: 120,
  },
  tooltipBottom: {
    bottom: 120,
  },
  tooltipCenter: {
    top: (SCREEN_HEIGHT - 400) / 2,
  },
  tooltipGradient: {
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tooltipTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  tooltipDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});

// Hook to check if onboarding has been completed
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding state:', error);
    return false;
  }
}

// Hook to reset onboarding (for testing or settings)
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
}
