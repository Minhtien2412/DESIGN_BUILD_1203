import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface ModuleLayoutProps {
  // Header
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;

  // Content
  children: ReactNode;
  scrollable?: boolean;

  // Footer actions
  footerActions?: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
  }[];

  // Layout options
  backgroundColor?: string;
  padding?: boolean;
  safeArea?: boolean;
}

export function ModuleLayout({
  title,
  subtitle,
  headerRight,
  showBackButton = true,
  onBackPress,
  children,
  scrollable = true,
  footerActions,
  backgroundColor = Colors.light.background,
  padding = true,
  safeArea = true,
}: ModuleLayoutProps) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!footerActions || footerActions.length === 0) return null;

    return (
      <View style={styles.footer}>
        {footerActions.map((action, index) => {
          const variant = action.variant || "primary";
          const buttonStyle =
            variant === "primary"
              ? styles.footerButtonPrimary
              : variant === "danger"
              ? styles.footerButtonDanger
              : styles.footerButtonSecondary;

          const textStyle =
            variant === "secondary"
              ? styles.footerButtonTextSecondary
              : styles.footerButtonTextPrimary;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.footerButton,
                buttonStyle,
                action.disabled && styles.footerButtonDisabled,
              ]}
              onPress={action.onPress}
              disabled={action.disabled || action.loading}
            >
              {action.icon && !action.loading && (
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={variant === "secondary" ? "#6B7280" : "#fff"}
                  style={styles.footerButtonIcon}
                />
              )}
              <Text style={textStyle}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const content = (
    <View style={[styles.content, padding && styles.contentPadding]}>
      {children}
    </View>
  );

  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      {renderHeader()}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {renderFooter()}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    marginLeft: "auto",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  footerButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  footerButtonSecondary: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  footerButtonDanger: {
    backgroundColor: "#000000",
  },
  footerButtonDisabled: {
    opacity: 0.5,
  },
  footerButtonIcon: {
    marginRight: -4,
  },
  footerButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  footerButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});
