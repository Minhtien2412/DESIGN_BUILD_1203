/**
 * Đặt hàng VLXD - Step 1: Tạo đơn hàng
 * Route: /vlxd/order
 * Tạo đơn hàng mới với mã đơn, vị trí, công việc, lịch cấp hàng
 */

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Job type options ────────────────────────────────────────────────────
const JOB_TYPES = [
  { value: "vlxd", label: "Cung cấp VLXD", icon: "cube-outline" },
  { value: "ep_coc", label: "Ép cọc", icon: "flash-outline" },
  { value: "be_tong", label: "Đổ bê tông", icon: "construct-outline" },
  { value: "thi_cong", label: "Thi công", icon: "hammer-outline" },
  { value: "khac", label: "Khác", icon: "ellipsis-horizontal-outline" },
] as const;

export default function VLXDOrderScreen() {
  const [orderCode, setOrderCode] = useState("MS102");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("vlxd");
  const [scheduleDate, setScheduleDate] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent" | "critical">(
    "normal",
  );

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!location.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập vị trí công trình");
      return;
    }
    if (!scheduleDate.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập lịch cấp hàng");
      return;
    }
    Alert.alert("Thành công", `Đơn hàng ${orderCode} đã được tạo`, [
      {
        text: "Báo giá NCC",
        onPress: () => router.push("/vlxd/quotation" as any),
      },
      { text: "Quay lại", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Đặt hàng VLXD</Text>
          <Text style={styles.headerStep}>Bước 1/4</Text>
        </View>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Thông tin đơn hàng ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          </View>

          {/* Mã đơn hàng */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Mã đơn hàng <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.codeRow}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={orderCode}
                onChangeText={setOrderCode}
                placeholder="MS102"
              />
              <Pressable
                style={styles.generateBtn}
                onPress={() =>
                  setOrderCode(`MS${Math.floor(100 + Math.random() * 900)}`)
                }
              >
                <Ionicons name="refresh-outline" size={18} color="#0D9488" />
                <Text style={styles.generateText}>Tạo mã</Text>
              </Pressable>
            </View>
          </View>

          {/* Vị trí */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Vị trí công trình <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="location-outline"
                size={18}
                color="#94A3B8"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={location}
                onChangeText={setLocation}
                placeholder="VD: Vinhomes Q9"
              />
            </View>
          </View>

          {/* Lịch cấp hàng */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Lịch cấp hàng <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#94A3B8"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                value={scheduleDate}
                onChangeText={setScheduleDate}
                placeholder="26/03/2026"
              />
            </View>
          </View>
        </View>

        {/* ── Công việc ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Công việc</Text>
          </View>

          <View style={styles.chipGrid}>
            {JOB_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={[
                  styles.jobChip,
                  jobType === type.value && styles.jobChipActive,
                ]}
                onPress={() => setJobType(type.value)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={18}
                  color={jobType === type.value ? "#fff" : "#64748B"}
                />
                <Text
                  style={[
                    styles.jobChipText,
                    jobType === type.value && styles.jobChipTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Ưu tiên ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Mức độ ưu tiên</Text>
          </View>
          <View style={styles.priorityRow}>
            {(
              [
                { key: "normal", label: "Bình thường", color: "#10B981" },
                { key: "urgent", label: "Gấp", color: "#F59E0B" },
                { key: "critical", label: "Rất gấp", color: "#EF4444" },
              ] as const
            ).map((p) => (
              <Pressable
                key={p.key}
                style={[
                  styles.priorityBtn,
                  priority === p.key && {
                    backgroundColor: p.color + "15",
                    borderColor: p.color,
                  },
                ]}
                onPress={() => setPriority(p.key)}
              >
                <View
                  style={[styles.priorityDot, { backgroundColor: p.color }]}
                />
                <Text
                  style={[
                    styles.priorityText,
                    priority === p.key && { color: p.color, fontWeight: "700" },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Hình ảnh ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Hình ảnh</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable style={styles.addImageBtn} onPress={pickImages}>
              <Ionicons name="add-circle-outline" size={32} color="#0D9488" />
              <Text style={styles.addImageText}>Thêm ảnh</Text>
            </Pressable>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageThumb}>
                <Image source={{ uri }} style={styles.thumbImg} />
                <Pressable
                  style={styles.removeImg}
                  onPress={() => removeImage(idx)}
                >
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Mô tả chi tiết ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả chi tiết yêu cầu cung cấp vật liệu..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* ── Liên hệ ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Người liên hệ</Text>
          </View>
          <View style={styles.contactRow}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Họ tên</Text>
              <TextInput
                style={styles.input}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Nguyễn Văn A"
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="0901234567"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.draftBtn} onPress={() => router.back()}>
          <Text style={styles.draftBtnText}>Lưu nháp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>Tiếp tục báo giá</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { padding: 8, marginRight: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  headerStep: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  stepIndicator: { flexDirection: "row", gap: 4 },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  stepDotActive: { backgroundColor: "#0D9488", width: 20 },

  body: { flex: 1 },
  bodyContent: { padding: 16 },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 6 },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputWrap: { flexDirection: "row", alignItems: "center" },
  inputIcon: { position: "absolute", left: 12, zIndex: 1 },
  inputWithIcon: { paddingLeft: 38, flex: 1 },
  codeRow: { flexDirection: "row", gap: 10 },
  codeInput: { flex: 1 },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  generateText: { fontSize: 13, fontWeight: "600", color: "#0D9488" },
  textArea: { minHeight: 100, paddingTop: 12 },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  jobChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  jobChipActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  jobChipText: { fontSize: 13, fontWeight: "500", color: "#64748B" },
  jobChipTextActive: { color: "#fff" },

  priorityRow: { flexDirection: "row", gap: 8 },
  priorityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontSize: 12, fontWeight: "500", color: "#64748B" },

  addImageBtn: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDFA",
    marginRight: 10,
  },
  addImageText: { fontSize: 11, color: "#0D9488", marginTop: 4 },
  imageThumb: { width: 90, height: 90, borderRadius: 12, marginRight: 10 },
  thumbImg: { width: 90, height: 90, borderRadius: 12 },
  removeImg: { position: "absolute", top: -6, right: -6 },

  contactRow: { flexDirection: "row" },

  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 10,
  },
  draftBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  draftBtnText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0D9488",
  },
  submitBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
