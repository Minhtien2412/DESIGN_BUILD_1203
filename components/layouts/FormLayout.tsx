import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface FormLayoutProps {
  // Header
  title: string;
  description?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;

  // Form content
  children: ReactNode;

  // Progress indicator (for multi-step forms)
  steps?: Array<{
    label: string;
    completed: boolean;
  }>;
  currentStep?: number;

  // Form actions (typically at bottom)
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
  }>;

  // Layout options
  scrollable?: boolean;
  safeArea?: boolean;
}

export function FormLayout({
  title,
  description,
  showBackButton = true,
  onBackPress,
  children,
  steps,
  currentStep,
  actions,
  scrollable = true,
  safeArea = true,
}: FormLayoutProps) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
      )}
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );

  const renderSteps = () => {
    if (!steps || steps.length === 0) return null;

    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = step.completed;

          return (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isActive && styles.stepCircleActive,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isActive && styles.stepNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isCompleted && styles.stepLabelCompleted,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
              {index < steps.length - 1 && <View style={styles.stepLine} />}
            </View>
          );
        })}
      </View>
    );
  };

  const renderActions = () => {
    if (!actions || actions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => {
          const variant = action.variant || "primary";
          const buttonStyle =
            variant === "primary"
              ? styles.actionButtonPrimary
              : variant === "danger"
              ? styles.actionButtonDanger
              : styles.actionButtonSecondary;

          const textStyle =
            variant === "secondary"
              ? styles.actionButtonTextSecondary
              : styles.actionButtonTextPrimary;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                buttonStyle,
                action.disabled && styles.actionButtonDisabled,
              ]}
              onPress={action.onPress}
              disabled={action.disabled || action.loading}
            >
              {action.icon && !action.loading && (
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={variant === "secondary" ? "#6B7280" : "#fff"}
                  style={styles.actionButtonIcon}
                />
              )}
              <Text style={textStyle}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      {renderHeader()}
      {renderSteps()}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContent}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.formContent}>{children}</View>
        )}
        {renderActions()}
      </KeyboardAvoidingView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  stepCircleCompleted: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  stepLabelActive: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  stepLabelCompleted: {
    color: "#0066CC",
  },
  stepLine: {
    position: "absolute",
    top: 16,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#E5E7EB",
    zIndex: -1,
  },
  formContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContent: {
    padding: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  actionButtonSecondary: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  actionButtonDanger: {
    backgroundColor: "#000000",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonIcon: {
    marginRight: -2,
  },
  actionButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});
