import { apiFetch, getVideos, healthCheck } from "@/services/api";
import { uploadMediaWithProgress } from "@/services/media";
import { Asset } from "expo-asset";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ApiDiagnosticsScreen() {
  const router = useRouter();
  const [health, setHealth] = useState<string>("-");
  const [videos, setVideos] = useState<string>("-");
  const [refreshTest, setRefreshTest] = useState<string>("-");
  const [upload, setUpload] = useState<string>("-");
  const [percent, setPercent] = useState<number>(0);
  const [busy, setBusy] = useState<boolean>(false);

  const runHealth = async () => {
    setHealth("Running...");
    try {
      const r = await healthCheck();
      setHealth(
        `OK: ${typeof r === "object" ? r.status || "healthy" : "healthy"}`,
      );
    } catch (e: any) {
      setHealth(`FAIL: ${e?.message || "error"}`);
    }
  };

  const runVideos = async () => {
    setVideos("Running...");
    try {
      const r = await getVideos(1);
      if (
        Array.isArray(r) ? r.length >= 0 : r && typeof r.total !== "undefined"
      ) {
        setVideos("OK");
      } else {
        setVideos("OK (unknown shape)");
      }
    } catch (e: any) {
      setVideos(`FAIL: ${e?.message || "error"}`);
    }
  };

  const runRefreshTest = async () => {
    setRefreshTest("Running...");
    try {
      // Force this request to use a bogus token so the 401 path triggers refresh machinery.
      // The global refresh uses the real in-memory token to refresh; this call only overrides per-request token.
      const me = await apiFetch("/api/auth/me", {
        method: "GET",
        token: "bogus.invalid.token",
      });
      setRefreshTest(me ? "OK: refreshed & succeeded" : "OK: succeeded");
    } catch (e: any) {
      setRefreshTest(`FAIL: ${e?.message || "error"}`);
    }
  };

  const runUpload = async () => {
    setUpload("Preparing...");
    setPercent(0);
    setBusy(true);
    try {
      const asset = Asset.fromModule(
        require("../../assets/images/react-logo.webp"),
      );
      await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      setUpload("Uploading...");
      const { url } = await uploadMediaWithProgress(
        "temp",
        uri,
        "diag-react-logo.webp",
        { kind: "diagnostic" },
        ({ percent }) => setPercent(Math.round(percent)),
      );
      setUpload(`OK: ${url || "uploaded (no url)"}`);
    } catch (e: any) {
      setUpload(`FAIL: ${e?.message || "error"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>API Diagnostics</Text>
      <Text style={styles.subtitle}>
        Quick field checks for health, auth-refresh, and media uploads
      </Text>

      <Section title="Health">
        <Row>
          <PrimaryButton
            label="Ping /health"
            onPress={runHealth}
            disabled={busy}
          />
          <Text style={styles.result}>{health}</Text>
        </Row>
      </Section>

      <Section title="Videos">
        <Row>
          <PrimaryButton
            label="List videos"
            onPress={runVideos}
            disabled={busy}
          />
          <Text style={styles.result}>{videos}</Text>
        </Row>
      </Section>

      <Section title="Auth Refresh">
        <Row>
          <PrimaryButton
            label="Test refresh"
            onPress={runRefreshTest}
            disabled={busy}
          />
          <Text style={styles.result}>{refreshTest}</Text>
        </Row>
        <Text style={styles.note}>
          This forces a 401 on this request only to exercise the
          refresh-and-retry logic.
        </Text>
      </Section>

      <Section title="Media Upload">
        <Row>
          <PrimaryButton
            label={busy ? `Uploading ${percent}%` : "Upload tiny image"}
            onPress={runUpload}
            disabled={busy}
          />
          <Text style={styles.result}>{upload}</Text>
        </Row>
      </Section>

      <Text style={styles.tip}>Route: /utilities/api-diagnostics</Text>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {/* Safe wrap: use Fragment to allow both JSX and string children */}
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: -6,
  },
  section: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#2f6feb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  result: {
    fontSize: 13,
    color: "#333",
  },
  note: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  tip: {
    marginTop: 16,
    color: "#888",
  },
});
