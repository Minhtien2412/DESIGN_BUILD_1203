/**
 * Project Estimate — Chi tiết dự toán
 * ====================================
 * Full project form: building info → floors → foundation → roof → calculate
 * Deep material-level breakdown with editable unit prices.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    type BuildingType,
    type ConstructionGrade,
    type EstimateProject,
    type FloorConfig,
    type FoundationType,
    type MaterialLine,
    type ProjectResult,
    type RoofType,
    BUILDING_TYPE_META,
    FOUNDATION_META,
    GRADE_META,
    ROOF_META,
    calculateProject,
    createProject,
    defaultFloors,
    formatVND,
    formatVNDFull,
    getProjectById,
    makeFloor,
    seqLabel,
    updateProject
} from "@/services/constructionEstimateEngine";

// ─── Palette ───────────────────────────────────────────────────────
const C = {
  bg: "#F3F4F6",
  card: "#FFFFFF",
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#CCFBF1",
  accent: "#0D9488",
  warn: "#F59E0B",
  danger: "#EF4444",
  text: "#111827",
  textSec: "#6B7280",
  textTer: "#9CA3AF",
  border: "#E5E7EB",
  inputBg: "#F9FAFB",
  sectionBg: "#F0FDF4",
} as const;

type Step = "info" | "floors" | "options" | "result";
const STEPS: { key: Step; label: string }[] = [
  { key: "info", label: "Thông tin" },
  { key: "floors", label: "Tầng & Phòng" },
  { key: "options", label: "Tùy chọn" },
  { key: "result", label: "Kết quả" },
];

// ─── Component ─────────────────────────────────────────────────────
export default function ProjectEstimateScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(!!params.id);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [result, setResult] = useState<ProjectResult | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // ── Form state ──────────
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [buildingType, setBuildingType] = useState<BuildingType>("nha-pho");
  const [grade, setGrade] = useState<ConstructionGrade>("standard");
  const [landArea, setLandArea] = useState("80");
  const [density, setDensity] = useState("80");
  const [numFloors, setNumFloors] = useState("3");
  const [floors, setFloors] = useState<FloorConfig[]>([]);
  const [foundationType, setFoundationType] = useState<FoundationType>("bang");
  const [foundationDepth, setFoundationDepth] = useState("1.5");
  const [pileCount, setPileCount] = useState("0");
  const [pileLength, setPileLength] = useState("15");
  const [roofType, setRoofType] = useState<RoofType>("btct-phang");
  const [roofOverhang, setRoofOverhang] = useState("0");
  const [fenceLen, setFenceLen] = useState("0");
  const [fenceH, setFenceH] = useState("1.5");
  const [yardArea, setYardArea] = useState("0");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [existingSeq, setExistingSeq] = useState<number>(0);

  // ── Load existing project ──
  useEffect(() => {
    if (params.id) {
      (async () => {
        const proj = await getProjectById(params.id!);
        if (proj) {
          setExistingId(proj.id);
          setExistingSeq(proj.seq);
          setName(proj.name);
          setClientName(proj.clientName || "");
          setClientPhone(proj.clientPhone || "");
          setAddress(proj.address || "");
          setNotes(proj.notes || "");
          setBuildingType(proj.buildingType);
          setGrade(proj.grade);
          setLandArea(String(proj.landArea));
          setDensity(String(proj.buildingDensity));
          setNumFloors(String(proj.floors.length));
          setFloors(proj.floors);
          setFoundationType(proj.foundation.type);
          setFoundationDepth(String(proj.foundation.depth));
          setPileCount(String(proj.foundation.pileCount || 0));
          setPileLength(String(proj.foundation.pileLength || 15));
          setRoofType(proj.roof.type);
          setRoofOverhang(String(proj.roof.overhangArea));
          setFenceLen(String(proj.fenceLength));
          setFenceH(String(proj.fenceHeight));
          setYardArea(String(proj.yardArea));
          if (proj.lastResult) setResult(proj.lastResult);
        }
        setLoading(false);
      })();
    }
  }, [params.id]);

  // ── Auto-generate floors when numFloors or buildingType changes ──
  useEffect(() => {
    const n = parseInt(numFloors, 10) || 1;
    const area = parseFloat(landArea) * (parseFloat(density) / 100) || 60;
    if (floors.length === 0 || Math.abs(floors.length - n) > 0) {
      setFloors(defaultFloors(buildingType, n, area));
    }
  }, [numFloors, buildingType]);  

  // ── Build project object ──
  const buildProject = useCallback(
    (): Omit<
      EstimateProject,
      "id" | "seq" | "createdAt" | "updatedAt" | "lastResult"
    > => ({
      name: name || "Dự toán mới",
      clientName: clientName || undefined,
      clientPhone: clientPhone || undefined,
      address: address || undefined,
      notes: notes || undefined,
      buildingType,
      grade,
      status: "draft",
      landArea: parseFloat(landArea) || 80,
      buildingDensity: parseFloat(density) || 80,
      floors,
      foundation: {
        type: foundationType,
        depth: parseFloat(foundationDepth) || 1.5,
        pileCount: parseInt(pileCount, 10) || undefined,
        pileLength: parseFloat(pileLength) || undefined,
      },
      roof: { type: roofType, overhangArea: parseFloat(roofOverhang) || 0 },
      fenceLength: parseFloat(fenceLen) || 0,
      fenceHeight: parseFloat(fenceH) || 1.5,
      yardArea: parseFloat(yardArea) || 0,
      priceOverrides: {},
    }),
    [
      name,
      clientName,
      clientPhone,
      address,
      notes,
      buildingType,
      grade,
      landArea,
      density,
      floors,
      foundationType,
      foundationDepth,
      pileCount,
      pileLength,
      roofType,
      roofOverhang,
      fenceLen,
      fenceH,
      yardArea,
    ],
  );

  // ── Calculate ─────────
  const doCalculate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const proj = buildProject() as EstimateProject;
    proj.id = existingId || "temp";
    proj.seq = existingSeq || 0;
    proj.createdAt = new Date().toISOString();
    proj.updatedAt = new Date().toISOString();
    const res = calculateProject(proj);
    setResult(res);
    setStep("result");
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [buildProject, existingId, existingSeq]);

  // ── Save ──────────────
  const doSave = useCallback(async () => {
    setSaving(true);
    try {
      const data = buildProject();
      let saved: EstimateProject | null;
      if (existingId) {
        saved = await updateProject(existingId, {
          ...data,
          lastResult: result || undefined,
        });
      } else {
        saved = await createProject(data);
        if (saved && result) {
          await updateProject(saved.id, { lastResult: result });
        }
        if (saved) {
          setExistingId(saved.id);
          setExistingSeq(saved.seq);
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Đã lưu",
        existingId
          ? "Dự toán đã được cập nhật"
          : `Mã: ${saved ? seqLabel(saved.seq) : ""}`,
        [{ text: "OK" }],
      );
    } catch {
      Alert.alert("Lỗi", "Không thể lưu dự toán");
    } finally {
      setSaving(false);
    }
  }, [buildProject, existingId, result]);

  // ── Step navigation ───
  const goStep = (s: Step) => {
    Haptics.selectionAsync();
    setStep(s);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const nextStep = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) {
      if (STEPS[idx + 1].key === "result") {
        doCalculate();
      } else {
        goStep(STEPS[idx + 1].key);
      }
    }
  };

  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) goStep(STEPS[idx - 1].key);
  };

  // ── Floor editing ─────
  const updateFloor = (floorId: string, patch: Partial<FloorConfig>) => {
    setFloors((prev) =>
      prev.map((f) => (f.id === floorId ? { ...f, ...patch } : f)),
    );
  };

  const addFloor = () => {
    const area = parseFloat(landArea) * (parseFloat(density) / 100) || 60;
    const newF = makeFloor(`Lầu ${floors.length}`, area);
    setFloors((prev) => [...prev, newF]);
    setNumFloors(String(floors.length + 1));
  };

  const removeFloor = (floorId: string) => {
    if (floors.length <= 1) return;
    setFloors((prev) => prev.filter((f) => f.id !== floorId));
    setNumFloors(String(floors.length - 1));
  };

  // ── Toggle result category ──
  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // ── Loading ──────────
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  // ── Input helper ─────
  const InputRow = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    suffix,
  }: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    keyboardType?: "numeric" | "phone-pad" | "default";
    suffix?: string;
  }) => (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textTer}
          keyboardType={keyboardType || "default"}
        />
        {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
      </View>
    </View>
  );

  const OptionGrid = <T extends string>({
    options,
    selected,
    onSelect,
    getLabel,
    getDesc,
  }: {
    options: T[];
    selected: T;
    onSelect: (v: T) => void;
    getLabel: (v: T) => string;
    getDesc?: (v: T) => string;
  }) => (
    <View style={styles.optionGrid}>
      {options.map((opt) => {
        const active = opt === selected;
        return (
          <Pressable
            key={opt}
            style={[styles.optionItem, active && styles.optionItemActive]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(opt);
            }}
          >
            <Text
              style={[styles.optionLabel, active && styles.optionLabelActive]}
            >
              {getLabel(opt)}
            </Text>
            {getDesc && (
              <Text
                style={[styles.optionDesc, active && styles.optionDescActive]}
                numberOfLines={1}
              >
                {getDesc(opt)}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  const SectionTitle = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={[C.primaryDark, C.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>
              {existingId
                ? `${seqLabel(existingSeq)} · Chỉnh sửa`
                : "Dự toán mới"}
            </Text>
          </View>
          <Pressable style={styles.saveBtn} onPress={doSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Text style={styles.saveBtnText}>Lưu</Text>
            )}
          </Pressable>
        </View>

        {/* Step indicator */}
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => {
            const active = step === s.key;
            const done = STEPS.findIndex((x) => x.key === step) > i;
            return (
              <Pressable
                key={s.key}
                onPress={() => goStep(s.key)}
                style={styles.stepItem}
              >
                <View
                  style={[
                    styles.stepDot,
                    active && styles.stepDotActive,
                    done && styles.stepDotDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNum,
                      (active || done) && styles.stepNumActive,
                    ]}
                  >
                    {done ? "✓" : String(i + 1)}
                  </Text>
                </View>
                <Text
                  style={[styles.stepLabel, active && styles.stepLabelActive]}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      {/* ── Body ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ═══════ STEP 1: INFO ═══════ */}
          {step === "info" && (
            <>
              <SectionTitle
                title="Thông tin dự án"
                subtitle="Tên, loại công trình, diện tích"
              />

              <View style={styles.card}>
                <InputRow
                  label="Tên dự toán"
                  value={name}
                  onChangeText={setName}
                  placeholder="VD: Nhà phố 3 tầng Quận 7"
                />
                <InputRow
                  label="Khách hàng"
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="Tên khách hàng"
                />
                <InputRow
                  label="Điện thoại"
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  keyboardType="phone-pad"
                  placeholder="0912..."
                />
                <InputRow
                  label="Địa chỉ"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Quận/Huyện, Tỉnh/TP"
                />
              </View>

              <SectionTitle title="Loại công trình" />
              <OptionGrid
                options={Object.keys(BUILDING_TYPE_META) as BuildingType[]}
                selected={buildingType}
                onSelect={setBuildingType}
                getLabel={(t) => BUILDING_TYPE_META[t].label}
                getDesc={(t) => BUILDING_TYPE_META[t].desc}
              />

              <SectionTitle title="Cấp độ xây dựng" />
              <OptionGrid
                options={Object.keys(GRADE_META) as ConstructionGrade[]}
                selected={grade}
                onSelect={setGrade}
                getLabel={(g) =>
                  `${GRADE_META[g].label} (×${GRADE_META[g].multiplier})`
                }
                getDesc={(g) => GRADE_META[g].desc}
              />

              <SectionTitle title="Diện tích" />
              <View style={styles.card}>
                <InputRow
                  label="Diện tích đất"
                  value={landArea}
                  onChangeText={setLandArea}
                  keyboardType="numeric"
                  suffix="m²"
                />
                <InputRow
                  label="Mật độ xây dựng"
                  value={density}
                  onChangeText={setDensity}
                  keyboardType="numeric"
                  suffix="%"
                />
                <InputRow
                  label="Số tầng"
                  value={numFloors}
                  onChangeText={setNumFloors}
                  keyboardType="numeric"
                  suffix="tầng"
                />
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Diện tích sàn XD:{" "}
                    {(
                      ((parseFloat(landArea) || 0) *
                        (parseFloat(density) || 0)) /
                      100
                    ).toFixed(0)}{" "}
                    m² × {numFloors} tầng ={" "}
                    {(
                      (((parseFloat(landArea) || 0) *
                        (parseFloat(density) || 0)) /
                        100) *
                      (parseInt(numFloors, 10) || 1)
                    ).toFixed(0)}{" "}
                    m²
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* ═══════ STEP 2: FLOORS ═══════ */}
          {step === "floors" && (
            <>
              <SectionTitle
                title="Chi tiết từng tầng"
                subtitle="Điều chỉnh diện tích, cửa, phòng tắm"
              />

              {floors.map((fl, idx) => (
                <View key={fl.id} style={styles.card}>
                  <View style={styles.floorHeader}>
                    <Text style={styles.floorTitle}>{fl.label}</Text>
                    {floors.length > 1 && (
                      <Pressable onPress={() => removeFloor(fl.id)} hitSlop={8}>
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={C.danger}
                        />
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.floorGrid}>
                    <View style={styles.floorGridItem}>
                      <Text style={styles.floorGridLabel}>Diện tích</Text>
                      <TextInput
                        style={styles.floorGridInput}
                        value={String(fl.floorArea)}
                        onChangeText={(t) =>
                          updateFloor(fl.id, { floorArea: parseFloat(t) || 0 })
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.floorGridUnit}>m²</Text>
                    </View>
                    <View style={styles.floorGridItem}>
                      <Text style={styles.floorGridLabel}>Cao trần</Text>
                      <TextInput
                        style={styles.floorGridInput}
                        value={String(fl.ceilingHeight)}
                        onChangeText={(t) =>
                          updateFloor(fl.id, {
                            ceilingHeight: parseFloat(t) || 3.3,
                          })
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.floorGridUnit}>m</Text>
                    </View>
                    <View style={styles.floorGridItem}>
                      <Text style={styles.floorGridLabel}>Cửa đi</Text>
                      <TextInput
                        style={styles.floorGridInput}
                        value={String(fl.doorCount)}
                        onChangeText={(t) =>
                          updateFloor(fl.id, {
                            doorCount: parseInt(t, 10) || 0,
                          })
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.floorGridItem}>
                      <Text style={styles.floorGridLabel}>Cửa sổ</Text>
                      <TextInput
                        style={styles.floorGridInput}
                        value={String(fl.windowCount)}
                        onChangeText={(t) =>
                          updateFloor(fl.id, {
                            windowCount: parseInt(t, 10) || 0,
                          })
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.floorGridItem}>
                      <Text style={styles.floorGridLabel}>Phòng tắm</Text>
                      <TextInput
                        style={styles.floorGridInput}
                        value={String(fl.bathroomCount)}
                        onChangeText={(t) =>
                          updateFloor(fl.id, {
                            bathroomCount: parseInt(t, 10) || 0,
                          })
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.floorGridItem}>
                      <Text style={styles.floorGridLabel}>Ban công</Text>
                      <TextInput
                        style={styles.floorGridInput}
                        value={String(fl.balconyArea)}
                        onChangeText={(t) =>
                          updateFloor(fl.id, {
                            balconyArea: parseFloat(t) || 0,
                          })
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.floorGridUnit}>m²</Text>
                    </View>
                  </View>
                </View>
              ))}

              <Pressable style={styles.addFloorBtn} onPress={addFloor}>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={C.primary}
                />
                <Text style={styles.addFloorText}>Thêm tầng</Text>
              </Pressable>
            </>
          )}

          {/* ═══════ STEP 3: OPTIONS ═══════ */}
          {step === "options" && (
            <>
              <SectionTitle title="Móng" subtitle="Loại móng, chiều sâu" />
              <OptionGrid
                options={Object.keys(FOUNDATION_META) as FoundationType[]}
                selected={foundationType}
                onSelect={setFoundationType}
                getLabel={(f) => FOUNDATION_META[f].label}
                getDesc={(f) => FOUNDATION_META[f].desc}
              />
              <View style={styles.card}>
                <InputRow
                  label="Chiều sâu móng"
                  value={foundationDepth}
                  onChangeText={setFoundationDepth}
                  keyboardType="numeric"
                  suffix="m"
                />
                {(foundationType === "coc-ep" ||
                  foundationType === "coc-nhoi") && (
                  <>
                    <InputRow
                      label="Số cọc"
                      value={pileCount}
                      onChangeText={setPileCount}
                      keyboardType="numeric"
                      suffix="cọc"
                    />
                    <InputRow
                      label="Chiều dài cọc"
                      value={pileLength}
                      onChangeText={setPileLength}
                      keyboardType="numeric"
                      suffix="m"
                    />
                  </>
                )}
              </View>

              <SectionTitle title="Mái" />
              <OptionGrid
                options={Object.keys(ROOF_META) as RoofType[]}
                selected={roofType}
                onSelect={setRoofType}
                getLabel={(r) => ROOF_META[r].label}
                getDesc={(r) =>
                  r !== "btct-phang"
                    ? `${formatVND(ROOF_META[r].pricePerM2)}/m²`
                    : "Đã tính trong sàn"
                }
              />
              <View style={styles.card}>
                <InputRow
                  label="Diện tích hiên/mái che"
                  value={roofOverhang}
                  onChangeText={setRoofOverhang}
                  keyboardType="numeric"
                  suffix="m²"
                />
              </View>

              <SectionTitle title="Hàng rào & Sân" />
              <View style={styles.card}>
                <InputRow
                  label="Chiều dài hàng rào"
                  value={fenceLen}
                  onChangeText={setFenceLen}
                  keyboardType="numeric"
                  suffix="m"
                />
                <InputRow
                  label="Chiều cao hàng rào"
                  value={fenceH}
                  onChangeText={setFenceH}
                  keyboardType="numeric"
                  suffix="m"
                />
                <InputRow
                  label="Diện tích sân"
                  value={yardArea}
                  onChangeText={setYardArea}
                  keyboardType="numeric"
                  suffix="m²"
                />
              </View>

              <SectionTitle title="Ghi chú" />
              <View style={styles.card}>
                <TextInput
                  style={[
                    styles.input,
                    { minHeight: 80, textAlignVertical: "top" },
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Ghi chú thêm cho dự toán..."
                  placeholderTextColor={C.textTer}
                  multiline
                />
              </View>
            </>
          )}

          {/* ═══════ STEP 4: RESULT ═══════ */}
          {step === "result" && result && (
            <>
              {/* Grand total card */}
              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>TỔNG CHI PHÍ DỰ TOÁN</Text>
                <Text style={styles.totalValue}>
                  {formatVNDFull(result.grandTotal)}
                </Text>
                <View style={styles.totalMetaRow}>
                  <View style={styles.totalMetaItem}>
                    <Text style={styles.totalMetaLabel}>Diện tích</Text>
                    <Text style={styles.totalMetaValue}>
                      {result.totalArea} m²
                    </Text>
                  </View>
                  <View style={styles.totalMetaDivider} />
                  <View style={styles.totalMetaItem}>
                    <Text style={styles.totalMetaLabel}>Đơn giá/m²</Text>
                    <Text style={styles.totalMetaValue}>
                      {formatVND(result.perM2)}
                    </Text>
                  </View>
                  <View style={styles.totalMetaDivider} />
                  <View style={styles.totalMetaItem}>
                    <Text style={styles.totalMetaLabel}>Nhân công</Text>
                    <Text style={styles.totalMetaValue}>
                      {result.laborDays} công
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cost breakdown by section */}
              <SectionTitle title="Phân tích chi phí" />
              <View style={styles.card}>
                {(
                  [
                    ["Móng", result.summary.foundation],
                    ["Kết cấu (cột, dầm, sàn)", result.summary.structure],
                    ["Tường xây", result.summary.walls],
                    ["Mái", result.summary.roof],
                    ["Hoàn thiện (trát, sơn, lát)", result.summary.finishing],
                    ["Cửa", result.summary.doors],
                    ["Điện, nước, WC", result.summary.mep],
                    ["Hàng rào", result.summary.fence],
                    ["Sân vườn", result.summary.yard],
                    ["Nhân công", result.summary.labor],
                    ["Dự phòng 5%", result.summary.contingency],
                  ] as [string, number][]
                )
                  .filter(([, v]) => v > 0)
                  .map(([label, value]) => {
                    const pct =
                      result.grandTotal > 0
                        ? ((value / result.grandTotal) * 100).toFixed(1)
                        : "0";
                    return (
                      <View key={label} style={styles.breakdownRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.breakdownLabel}>{label}</Text>
                          <View style={styles.breakdownBar}>
                            <View
                              style={[
                                styles.breakdownBarFill,
                                { width: `${Math.min(parseFloat(pct), 100)}%` },
                              ]}
                            />
                          </View>
                        </View>
                        <View style={styles.breakdownRight}>
                          <Text style={styles.breakdownValue}>
                            {formatVND(value)}
                          </Text>
                          <Text style={styles.breakdownPct}>{pct}%</Text>
                        </View>
                      </View>
                    );
                  })}
              </View>

              {/* Material detail — grouped by category */}
              <SectionTitle
                title="Chi tiết vật tư"
                subtitle={`${result.materials.length} hạng mục`}
              />
              {(() => {
                const cats = new Map<string, MaterialLine[]>();
                for (const m of result.materials) {
                  if (!cats.has(m.category)) cats.set(m.category, []);
                  cats.get(m.category)!.push(m);
                }
                return Array.from(cats.entries()).map(([cat, items]) => {
                  const catTotal = items.reduce((s, m) => s + m.total, 0);
                  const isExpanded = expandedCats.has(cat);
                  return (
                    <View key={cat} style={styles.card}>
                      <Pressable
                        style={styles.catHeader}
                        onPress={() => toggleCat(cat)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.catTitle}>{cat}</Text>
                          <Text style={styles.catSubtitle}>
                            {items.length} hạng mục
                          </Text>
                        </View>
                        <Text style={styles.catTotal}>
                          {formatVND(catTotal)}
                        </Text>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={C.textTer}
                          style={{ marginLeft: 8 }}
                        />
                      </Pressable>
                      {isExpanded &&
                        items.map((m, i) => (
                          <View key={i} style={styles.matRow}>
                            <Text style={styles.matName} numberOfLines={1}>
                              {m.item}
                            </Text>
                            <View style={styles.matRight}>
                              <Text style={styles.matQty}>
                                {m.quantity.toLocaleString("vi-VN")} {m.unit}
                              </Text>
                              <Text style={styles.matPrice}>
                                × {formatVND(m.unitPrice)}
                              </Text>
                              <Text style={styles.matTotal}>
                                {formatVND(m.total)}
                              </Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  );
                });
              })()}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom bar ── */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        {step !== "info" && (
          <Pressable style={styles.backBtn} onPress={prevStep}>
            <Ionicons name="chevron-back" size={18} color={C.textSec} />
            <Text style={styles.backBtnText}>Quay lại</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        {step === "result" ? (
          <Pressable
            style={styles.primaryBtn}
            onPress={doSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Lưu dự toán</Text>
            )}
          </Pressable>
        ) : (
          <Pressable style={styles.primaryBtn} onPress={nextStep}>
            <Text style={styles.primaryBtnText}>
              {step === "options" ? "Tính toán" : "Tiếp theo"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  saveBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 13, fontWeight: "600", color: C.primary },

  // Steps
  stepsRow: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: "#fff" },
  stepDotDone: { backgroundColor: "rgba(255,255,255,0.5)" },
  stepNum: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.6)" },
  stepNumActive: { color: C.primary },
  stepLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  stepLabelActive: { color: "#fff", fontWeight: "600" },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 100 },

  // Section
  sectionHeader: { marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  sectionSubtitle: { fontSize: 12, color: C.textSec, marginTop: 2 },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  // Input
  inputRow: { marginBottom: 14 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginBottom: 6,
  },
  inputWrap: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  inputSuffix: { fontSize: 13, color: C.textSec, marginLeft: 8, minWidth: 30 },

  // Info box
  infoBox: {
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  infoText: { fontSize: 12, color: C.primaryDark, fontWeight: "500" },

  // Option grid
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  optionItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  optionItemActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  optionLabel: { fontSize: 13, fontWeight: "600", color: C.text },
  optionLabelActive: { color: C.primaryDark },
  optionDesc: { fontSize: 11, color: C.textTer, marginTop: 2 },
  optionDescActive: { color: C.primary },

  // Floor
  floorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  floorTitle: { fontSize: 15, fontWeight: "700", color: C.primary },
  floorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  floorGridItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
  },
  floorGridLabel: { fontSize: 12, color: C.textSec, width: 64 },
  floorGridInput: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
    textAlign: "center",
  },
  floorGridUnit: { fontSize: 11, color: C.textTer, marginLeft: 4, width: 20 },
  addFloorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    marginBottom: 12,
  },
  addFloorText: { fontSize: 14, fontWeight: "600", color: C.primary },

  // Result — Total card
  totalCard: {
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
  },
  totalValue: { fontSize: 26, fontWeight: "800", color: "#fff", marginTop: 6 },
  totalMetaRow: {
    flexDirection: "row",
    marginTop: 16,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  totalMetaItem: { alignItems: "center" },
  totalMetaLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)" },
  totalMetaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginTop: 2,
  },
  totalMetaDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Breakdown
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  breakdownLabel: {
    fontSize: 13,
    color: C.text,
    fontWeight: "500",
    marginBottom: 4,
  },
  breakdownBar: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  breakdownBarFill: { height: 4, backgroundColor: C.primary, borderRadius: 2 },
  breakdownRight: { alignItems: "flex-end", marginLeft: 12, minWidth: 80 },
  breakdownValue: { fontSize: 13, fontWeight: "700", color: C.text },
  breakdownPct: { fontSize: 10, color: C.textTer, marginTop: 1 },

  // Material detail
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  catTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  catSubtitle: { fontSize: 11, color: C.textTer },
  catTotal: { fontSize: 14, fontWeight: "700", color: C.primary },
  matRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  matName: { flex: 1, fontSize: 12, color: C.text },
  matRight: { alignItems: "flex-end" },
  matQty: { fontSize: 11, color: C.textSec },
  matPrice: { fontSize: 10, color: C.textTer },
  matTotal: { fontSize: 12, fontWeight: "600", color: C.text, marginTop: 1 },

  // Bottom bar
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingRight: 16,
  },
  backBtnText: { fontSize: 14, color: C.textSec },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  primaryBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
