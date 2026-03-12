/**
 * Two Factor Auth Input Component
 * ================================
 *
 * OTP input for 2FA verification during login
 *
 * @author BaoTienWeb Team
 * @created 2026-01-22
 */

import { theme } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface TwoFactorInputProps {
  /** When true, shows the 2FA input modal */
  visible: boolean;
  /** Called when user submits the code */
  onSubmit: (code: string) => Promise<void>;
  /** Called when user cancels */
  onCancel: () => void;
  /** Called when user wants to use backup code */
  onUseBackupCode?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Number of digits for the OTP */
  codeLength?: number;
}

export function TwoFactorInput({
  visible,
  onSubmit,
  onCancel,
  onUseBackupCode,
  loading = false,
  error,
  codeLength = 6,
}: TwoFactorInputProps) {
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
  const inputRef = useRef<TextInput>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Auto focus input
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setCode("");
      setLocalError("");
      fadeAnimation.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      triggerShake();
    }
  }, [error]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCodeChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, "");
    setCode(cleaned);
    setLocalError("");

    // Auto submit when code is complete
    if (cleaned.length === codeLength) {
      Keyboard.dismiss();
      handleSubmit(cleaned);
    }
  };

  const handleSubmit = async (submittedCode?: string) => {
    const codeToSubmit = submittedCode || code;

    if (codeToSubmit.length !== codeLength) {
      setLocalError(`Please enter ${codeLength} digits`);
      triggerShake();
      return;
    }

    try {
      await onSubmit(codeToSubmit);
    } catch (err: any) {
      setLocalError(err.message || "Invalid code");
      triggerShake();
      setCode("");
    }
  };

  if (!visible) return null;

  // Render individual digit boxes
  const renderDigitBoxes = () => {
    const boxes = [];
    for (let i = 0; i < codeLength; i++) {
      const digit = code[i] || "";
      const isFocused = code.length === i;

      boxes.push(
        <View
          key={i}
          style={[
            styles.digitBox,
            isFocused && styles.digitBoxFocused,
            localError && styles.digitBoxError,
          ]}
        >
          <Text style={styles.digitText}>{digit}</Text>
        </View>,
      );
    }
    return boxes;
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnimation }]}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>Two-Factor Authentication</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code from your authenticator app
          </Text>
        </View>

        {/* Hidden input for keyboard */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={codeLength}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />

        {/* Digit boxes */}
        <TouchableOpacity
          style={styles.digitContainer}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={1}
        >
          {renderDigitBoxes()}
        </TouchableOpacity>

        {/* Error message */}
        {localError ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={16}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{localError}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={() => handleSubmit()}
            disabled={loading || code.length !== codeLength}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onUseBackupCode}
            disabled={loading}
          >
            <Text style={styles.linkButtonText}>Use backup code instead</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onCancel}
            disabled={loading}
          >
            <Text
              style={[
                styles.linkButtonText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================================================
// BACKUP CODE INPUT
// ============================================================================

interface BackupCodeInputProps {
  visible: boolean;
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export function BackupCodeInput({
  visible,
  onSubmit,
  onCancel,
  loading = false,
  error,
}: BackupCodeInputProps) {
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setCode("");
      setLocalError("");
    }
  }, [visible]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleSubmit = async () => {
    const cleanedCode = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    if (cleanedCode.length < 8) {
      setLocalError("Please enter a valid backup code");
      return;
    }

    try {
      await onSubmit(cleanedCode);
    } catch (err: any) {
      setLocalError(err.message || "Invalid backup code");
      setCode("");
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="key-variant"
            size={48}
            color={theme.colors.warning}
          />
          <Text style={styles.title}>Backup Code</Text>
          <Text style={styles.subtitle}>
            Enter one of your backup codes to access your account
          </Text>
        </View>

        <TextInput
          ref={inputRef}
          style={styles.backupCodeInput}
          value={code}
          onChangeText={(text) => {
            setCode(text.toUpperCase());
            setLocalError("");
          }}
          placeholder="XXXX-XXXX"
          placeholderTextColor={theme.colors.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={9} // 8 chars + hyphen
        />

        {localError ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={16}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{localError}</Text>
          </View>
        ) : null}

        <View style={styles.warningBox}>
          <MaterialCommunityIcons
            name="alert"
            size={20}
            color={theme.colors.warning}
          />
          <Text style={styles.warningText}>
            Each backup code can only be used once. After using this code, it
            will be invalidated.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading || code.length < 8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Verify Backup Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onCancel}
            disabled={loading}
          >
            <Text
              style={[
                styles.linkButtonText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Back to authenticator code
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
  },
  digitContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  digitBox: {
    width: 45,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  digitBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + "20",
  },
  digitBoxError: {
    borderColor: theme.colors.error,
  },
  digitText: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    padding: 8,
    alignItems: "center",
  },
  linkButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  backupCodeInput: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: theme.colors.warning + "15",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.warning,
    lineHeight: 18,
  },
});

export default TwoFactorInput;
