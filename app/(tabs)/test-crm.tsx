/**
 * CRM Data Sync Test Screen
 * Test integration between main backend and Perfex CRM
 */

import { CRMDataList } from "@/components/ui/CRMDataList";
import { SyncStatusBadge } from "@/components/ui/SyncStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useDataSync } from "@/hooks/useDataSync";
import { SyncStatus } from "@/services/dataSyncService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestCRMScreen() {
  const { user } = useAuth();
  const {
    crmData,
    loading,
    error,
    isLinked,
    fetchCRMData,
    checkSyncStatus,
    clearData,
  } = useDataSync();

  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    const status = checkSyncStatus();
    setSyncStatus(status);
  }, [checkSyncStatus]);

  const handleManualSync = async () => {
    try {
      await fetchCRMData(true);
      Alert.alert("Success", "CRM data synced successfully!");
    } catch (_err) {
      Alert.alert("Error", "Failed to sync CRM data");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Sync Data",
      "Are you sure you want to clear all synced CRM data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            clearData();
            setSyncStatus(null);
            Alert.alert("Success", "Sync data cleared");
          },
        },
      ],
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <Ionicons name="lock-closed" size={64} color={primaryColor} />
          <Text style={[styles.title, { color: textColor }]}>
            Login Required
          </Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Please login to test CRM integration
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={() => router.push("/(auth)/sign-in" as const)}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            CRM Sync Test
          </Text>
          <SyncStatusBadge />
        </View>

        {/* User Info */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            User Info
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            Email: {user.email}
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            User ID: {user.id || "N/A"}
          </Text>
        </View>

        {/* Sync Status */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            Sync Status
          </Text>
          <View style={styles.statusRow}>
            <Text style={[styles.infoText, { color: textColor }]}>
              CRM Linked:
            </Text>
            <Text
              style={[
                styles.statusValue,
                { color: isLinked ? "#22c55e" : "#ef4444" },
              ]}
            >
              {isLinked ? "✅ Yes" : "❌ No"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.infoText, { color: textColor }]}>
              Last Sync:
            </Text>
            <Text style={[styles.statusValue, { color: textColor }]}>
              {syncStatus?.lastSync
                ? new Date(syncStatus.lastSync).toLocaleString()
                : "Never"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.infoText, { color: textColor }]}>
              Data Version:
            </Text>
            <Text style={[styles.statusValue, { color: textColor }]}>
              {syncStatus?.dataVersion || "N/A"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleManualSync}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sync" size={20} color="#fff" />
                <Text style={styles.buttonText}>Manual Sync</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
            onPress={handleClearData}
            disabled={loading}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Clear Data</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: "#fee2e2", borderColor: "#ef4444" },
            ]}
          >
            <Ionicons name="warning" size={20} color="#ef4444" />
            <Text style={[styles.errorText, { color: "#dc2626" }]}>
              {error}
            </Text>
          </View>
        )}

        {/* CRM Data Display */}
        {isLinked && crmData && (
          <>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Projects
            </Text>
            <CRMDataList type="projects" limit={5} />

            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Invoices
            </Text>
            <CRMDataList type="invoices" limit={5} />

            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Estimates
            </Text>
            <CRMDataList type="estimates" limit={5} />

            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Tickets
            </Text>
            <CRMDataList type="tickets" limit={5} />
          </>
        )}

        {!isLinked && !loading && (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline" size={64} color="#6b7280" />
            <Text style={[styles.subtitle, { color: textColor }]}>
              CRM not linked. Try manual sync to connect.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
});
