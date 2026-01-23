/**
 * Backup Codes Display Component
 * ================================
 *
 * Shows and manages 2FA backup codes
 *
 * @author BaoTienWeb Team
 * @created 2026-01-22
 */

import { theme } from "@/constants/theme";
import {
    documentDirectory,
    writeAsStringAsync,
} from "@/utils/FileSystemCompat";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface BackupCodesDisplayProps {
  /** List of backup codes */
  codes: string[];
  /** Called when user wants to regenerate codes */
  onRegenerate?: () => Promise<string[]>;
  /** Whether regenerate is in progress */
  regenerating?: boolean;
  /** Show warning about regeneration */
  showRegenerateWarning?: boolean;
}

export function BackupCodesDisplay({
  codes,
  onRegenerate,
  regenerating = false,
  showRegenerateWarning = true,
}: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const formatCode = (code: string) => {
    // Format as XXXX-XXXX
    if (code.length === 8) {
      return `${code.slice(0, 4)}-${code.slice(4)}`;
    }
    return code;
  };

  const handleCopyAll = async () => {
    const formattedCodes = codes.map(formatCode).join("\n");
    await Clipboard.setStringAsync(formattedCodes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const content = `BaoTienWeb Backup Codes
========================
Generated: ${new Date().toLocaleString()}

Keep these codes in a safe place. Each code can only be used once.

${codes.map((code, i) => `${i + 1}. ${formatCode(code)}`).join("\n")}

========================
If you lose access to your authenticator app, you can use one of these codes to sign in.
`;

      const filename = `baotienweb-backup-codes-${Date.now()}.txt`;
      const filePath = `${documentDirectory}${filename}`;

      await writeAsStringAsync(filePath, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/plain",
          dialogTitle: "Save Backup Codes",
        });
      } else {
        Alert.alert("Saved", `Backup codes saved to ${filename}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save backup codes");
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = () => {
    if (!onRegenerate) return;

    if (showRegenerateWarning) {
      Alert.alert(
        "Regenerate Backup Codes?",
        "This will invalidate all existing backup codes. You will need to save the new codes.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Regenerate",
            style: "destructive",
            onPress: onRegenerate,
          },
        ],
      );
    } else {
      onRegenerate();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="key-variant"
          size={24}
          color={theme.colors.warning}
        />
        <Text style={styles.title}>Backup Codes</Text>
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <MaterialCommunityIcons
          name="alert"
          size={20}
          color={theme.colors.warning}
        />
        <Text style={styles.warningText}>
          Save these codes in a secure location. Each code can only be used once
          to sign in if you lose access to your authenticator app.
        </Text>
      </View>

      {/* Codes Grid */}
      <View style={styles.codesGrid}>
        {codes.map((code, index) => (
          <View key={index} style={styles.codeItem}>
            <Text style={styles.codeNumber}>{index + 1}.</Text>
            <Text style={styles.codeText}>{formatCode(code)}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.copyButton]}
          onPress={handleCopyAll}
        >
          <MaterialCommunityIcons
            name={copied ? "check" : "content-copy"}
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.actionButtonText}>
            {copied ? "Copied!" : "Copy All"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <MaterialCommunityIcons
              name="download"
              size={20}
              color={theme.colors.primary}
            />
          )}
          <Text style={styles.actionButtonText}>Save to File</Text>
        </TouchableOpacity>
      </View>

      {/* Regenerate */}
      {onRegenerate && (
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={handleRegenerate}
          disabled={regenerating}
        >
          {regenerating ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="refresh"
                size={18}
                color={theme.colors.error}
              />
              <Text style={styles.regenerateText}>Generate New Codes</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Footer */}
      <Text style={styles.footerText}>{codes.length} codes remaining</Text>
    </View>
  );
}

// ============================================================================
// BACKUP CODES MODAL (for initial setup)
// ============================================================================

interface BackupCodesModalProps {
  visible: boolean;
  codes: string[];
  onClose: () => void;
  onConfirm: () => void;
}

export function BackupCodesModal({
  visible,
  codes,
  onClose,
  onConfirm,
}: BackupCodesModalProps) {
  const [saved, setSaved] = useState(false);

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons
              name="shield-check"
              size={48}
              color={theme.colors.success}
            />
            <Text style={styles.modalTitle}>Save Your Backup Codes</Text>
            <Text style={styles.modalSubtitle}>
              These codes are the only way to access your account if you lose
              your authenticator device.
            </Text>
          </View>

          {/* Codes */}
          <BackupCodesDisplay codes={codes} />

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSaved(!saved)}
          >
            <View style={[styles.checkbox, saved && styles.checkboxChecked]}>
              {saved && (
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I have saved these codes in a secure location
            </Text>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                !saved && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={!saved}
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
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
  codesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  codeItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  codeNumber: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    width: 20,
  },
  codeText: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontWeight: "600",
    color: theme.colors.text,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  copyButton: {
    backgroundColor: theme.colors.primary + "10",
  },
  downloadButton: {
    backgroundColor: theme.colors.primary + "10",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
  },
  regenerateText: {
    fontSize: 14,
    color: theme.colors.error,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: "center",
    marginTop: 8,
  },

  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    maxWidth: 450,
    maxHeight: "90%",
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
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default BackupCodesDisplay;
