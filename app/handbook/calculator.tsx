/**
 * Handbook Calculator Screen
 * Interactive calculator with formula inputs and real-time results
 */
import type { CalculationResult } from "@/data/handbook";
import { getHandbookItem } from "@/data/handbook";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  light: {
    bg: "#F0F9F6",
    card: "#FFFFFF",
    text: "#1A2B3C",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    inputBg: "#F8FAFC",
  },
  dark: {
    bg: "#0A0F1A",
    card: "#1A2332",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#2D3A4A",
    inputBg: "#0F1A28",
  },
};

const TEAL = "#0D9488";

export default function HandbookCalculatorScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? COLORS.dark : COLORS.light;

  const item = useMemo(() => getHandbookItem(itemId), [itemId]);
  const formula = item?.formula;

  // Initialize inputs with default values
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    if (!formula) return {};
    const defaults: Record<string, string> = {};
    formula.inputs.forEach((inp) => {
      defaults[inp.key] = inp.defaultValue?.toString() || "";
    });
    return defaults;
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasError, setHasError] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    // Allow decimal point and numbers only
    const cleaned = value.replace(/[^0-9.]/g, "");
    setInputValues((prev) => ({ ...prev, [key]: cleaned }));
  };

  const calculate = useCallback(() => {
    if (!formula) return;
    try {
      const numericInputs: Record<string, number> = {};
      let valid = true;
      formula.inputs.forEach((inp) => {
        const val = parseFloat(inputValues[inp.key]);
        if (isNaN(val) || val <= 0) {
          valid = false;
        }
        numericInputs[inp.key] = val || 0;
      });
      if (!valid) {
        setHasError(true);
        setResult(null);
        return;
      }
      setHasError(false);
      const calcResult = formula.calculate(numericInputs);
      setResult(calcResult);
    } catch (e) {
      setHasError(true);
      setResult(null);
    }
  }, [formula, inputValues]);

  const resetInputs = () => {
    if (!formula) return;
    const defaults: Record<string, string> = {};
    formula.inputs.forEach((inp) => {
      defaults[inp.key] = inp.defaultValue?.toString() || "";
    });
    setInputValues(defaults);
    setResult(null);
    setHasError(false);
  };

  if (!item || !formula) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: C.bg, paddingTop: insets.top },
        ]}
      >
        <Text style={{ color: C.text, textAlign: "center", marginTop: 40 }}>
          Không tìm thấy công cụ tính toán
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#0A2A2A", "#0D4444"] : ["#065F56", "#0D9488"]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <TouchableOpacity onPress={resetInputs} style={styles.backBtn}>
            <Ionicons name="refresh" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        {/* Formula display */}
        <View style={styles.formulaDisplay}>
          <Text style={styles.formulaLabel}>Công thức:</Text>
          <Text style={styles.formulaText}>{formula.formula}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description */}
          {formula.description && (
            <View
              style={[
                styles.descCard,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={TEAL}
              />
              <Text style={[styles.descText, { color: C.textSecondary }]}>
                {formula.description}
              </Text>
            </View>
          )}

          {/* Input fields */}
          <View
            style={[
              styles.inputSection,
              { backgroundColor: C.card, borderColor: C.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              📐 Nhập thông số
            </Text>
            {formula.inputs.map((inp) => (
              <View key={inp.key} style={styles.inputRow}>
                <View style={styles.inputLabelRow}>
                  <Text style={[styles.inputLabel, { color: C.text }]}>
                    {inp.label}
                  </Text>
                  {inp.unit && (
                    <Text style={[styles.unitText, { color: TEAL }]}>
                      ({inp.unit})
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: C.inputBg, borderColor: C.border },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: C.text }]}
                    value={inputValues[inp.key]}
                    onChangeText={(v) => handleInputChange(inp.key, v)}
                    keyboardType="decimal-pad"
                    placeholder={inp.placeholder || "Nhập giá trị"}
                    placeholderTextColor={C.textSecondary}
                    selectTextOnFocus
                  />
                  {inp.unit && (
                    <Text
                      style={[styles.inputUnit, { color: C.textSecondary }]}
                    >
                      {inp.unit}
                    </Text>
                  )}
                </View>
              </View>
            ))}

            {/* Calculate button */}
            <TouchableOpacity onPress={calculate} activeOpacity={0.8}>
              <LinearGradient
                colors={["#0D9488", "#14B8A6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.calcButton}
              >
                <Ionicons name="calculator" size={20} color="#FFF" />
                <Text style={styles.calcButtonText}>TÍNH TOÁN</Text>
              </LinearGradient>
            </TouchableOpacity>

            {hasError && (
              <Text style={styles.errorText}>
                ⚠️ Vui lòng nhập đầy đủ giá trị hợp lệ (lớn hơn 0)
              </Text>
            )}
          </View>

          {/* Results */}
          {result && (
            <View style={[styles.resultSection, { borderColor: TEAL + "40" }]}>
              <LinearGradient
                colors={
                  isDark ? ["#0A2A2A", "#0D3333"] : ["#F0FDFA", "#CCFBF1"]
                }
                style={styles.resultGradient}
              >
                <Text style={[styles.sectionTitle, { color: C.text }]}>
                  📊 Kết quả
                </Text>

                {/* Main result */}
                <View style={styles.mainResult}>
                  <Text
                    style={[styles.mainResultLabel, { color: C.textSecondary }]}
                  >
                    {result.mainResult.label}
                  </Text>
                  <View style={styles.mainResultValueRow}>
                    <Text style={styles.mainResultValue}>
                      {typeof result.mainResult.value === "number"
                        ? result.mainResult.value.toLocaleString("vi-VN")
                        : result.mainResult.value}
                    </Text>
                    <Text style={styles.mainResultUnit}>
                      {result.mainResult.unit}
                    </Text>
                  </View>
                </View>

                {/* Detail results */}
                {result.details && result.details.length > 0 && (
                  <View style={styles.detailResults}>
                    {result.details.map((detail, idx) => (
                      <View
                        key={idx}
                        style={[styles.detailRow, { borderColor: C.border }]}
                      >
                        <Text
                          style={[
                            styles.detailLabel,
                            { color: C.textSecondary },
                          ]}
                        >
                          {detail.label}
                        </Text>
                        <Text style={[styles.detailValue, { color: C.text }]}>
                          {typeof detail.value === "number"
                            ? detail.value.toLocaleString("vi-VN")
                            : detail.value}
                          {detail.unit ? ` ${detail.unit}` : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Notes */}
          {formula.notes && formula.notes.length > 0 && (
            <View
              style={[
                styles.notesSection,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: C.text }]}>
                📝 Ghi chú
              </Text>
              {formula.notes.map((note, idx) => (
                <View key={idx} style={styles.noteRow}>
                  <Text style={[styles.noteBullet, { color: TEAL }]}>•</Text>
                  <Text style={[styles.noteText, { color: C.textSecondary }]}>
                    {note}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, paddingHorizontal: 12 },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    lineHeight: 20,
  },
  formulaDisplay: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  formulaLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  formulaText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  // Description
  descCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  descText: { flex: 1, fontSize: 13, lineHeight: 18 },
  // Inputs
  inputSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  inputRow: { marginBottom: 14 },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  inputLabel: { fontSize: 13, fontWeight: "600" },
  unitText: { fontSize: 11, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
  },
  inputUnit: { fontSize: 12, marginLeft: 4 },
  // Calculate button
  calcButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    marginTop: 4,
  },
  calcButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 10,
  },
  // Results
  resultSection: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    marginBottom: 12,
  },
  resultGradient: { padding: 16 },
  mainResult: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  mainResultLabel: { fontSize: 13, marginBottom: 4 },
  mainResultValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  mainResultValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0D9488",
  },
  mainResultUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D9488",
  },
  detailResults: { gap: 1 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 14, fontWeight: "700" },
  // Notes
  notesSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  noteRow: { flexDirection: "row", marginBottom: 6, gap: 8 },
  noteBullet: { fontSize: 16, fontWeight: "700" },
  noteText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
