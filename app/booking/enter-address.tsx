/**
 * Enter Address Screen — Step 2 of booking flow
 * Customer enters the address where they need the service
 */

import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const SAVED_ADDRESSES = [
  {
    id: "1",
    label: "Nhà",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    icon: "home-outline" as const,
  },
  {
    id: "2",
    label: "Cơ quan",
    address: "456 Lê Lợi, Q.3, TP.HCM",
    icon: "business-outline" as const,
  },
];

export default function EnterAddressScreen() {
  const { serviceId, serviceName } = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
  }>();

  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("TP. Hồ Chí Minh");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const isValid = address.trim().length >= 5;

  const onContinue = useCallback(() => {
    router.push({
      pathname: "/booking/scan-workers",
      params: {
        serviceId,
        serviceName,
        address: address.trim(),
        district: district.trim(),
        city: city.trim(),
        note: note.trim(),
        date: date || new Date().toISOString().split("T")[0],
        time: time || "Càng sớm càng tốt",
      },
    } as Href);
  }, [serviceId, serviceName, address, district, city, note, date, time]);

  const onSelectSaved = useCallback((saved: (typeof SAVED_ADDRESSES)[0]) => {
    setAddress(saved.address);
    setDistrict("");
  }, []);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Địa chỉ cần đặt thợ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Service info pill */}
      <View style={s.servicePill}>
        <Ionicons name="construct-outline" size={16} color="#0D9488" />
        <Text style={s.serviceText}>{serviceName || "Dịch vụ"}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Saved addresses */}
          <Text style={s.sectionTitle}>Địa chỉ đã lưu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.savedRow}
          >
            {SAVED_ADDRESSES.map((saved) => (
              <TouchableOpacity
                key={saved.id}
                style={s.savedCard}
                onPress={() => onSelectSaved(saved)}
                activeOpacity={0.7}
              >
                <View style={s.savedIcon}>
                  <Ionicons name={saved.icon} size={18} color="#0D9488" />
                </View>
                <Text style={s.savedLabel}>{saved.label}</Text>
                <Text style={s.savedAddr} numberOfLines={2}>
                  {saved.address}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.savedCardAdd}>
              <Ionicons name="add-circle-outline" size={28} color="#D1D5DB" />
              <Text style={s.addLabel}>Thêm địa chỉ</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Address input */}
          <Text style={s.sectionTitle}>Nhập địa chỉ</Text>

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Địa chỉ chi tiết *</Text>
            <View style={s.inputWrap}>
              <Ionicons name="location-outline" size={18} color="#0D9488" />
              <TextInput
                style={s.textInput}
                placeholder="Số nhà, tên đường..."
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Quận/Huyện</Text>
            <View style={s.inputWrap}>
              <Ionicons name="map-outline" size={18} color="#0D9488" />
              <TextInput
                style={s.textInput}
                placeholder="Nhập quận/huyện"
                placeholderTextColor="#9CA3AF"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Thành phố</Text>
            <View style={s.inputWrap}>
              <Ionicons name="business-outline" size={18} color="#0D9488" />
              <TextInput
                style={s.textInput}
                placeholder="Nhập thành phố"
                placeholderTextColor="#9CA3AF"
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          {/* Schedule */}
          <Text style={s.sectionTitle}>Thời gian</Text>

          <View style={s.row}>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.inputLabel}>Ngày</Text>
              <TouchableOpacity style={s.inputWrap}>
                <Ionicons name="calendar-outline" size={18} color="#0D9488" />
                <Text
                  style={[
                    s.textInput,
                    {
                      paddingVertical: 12,
                      color: date ? "#1F2937" : "#9CA3AF",
                    },
                  ]}
                >
                  {date || "Hôm nay"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[s.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={s.inputLabel}>Giờ</Text>
              <TouchableOpacity style={s.inputWrap}>
                <Ionicons name="time-outline" size={18} color="#0D9488" />
                <Text
                  style={[
                    s.textInput,
                    {
                      paddingVertical: 12,
                      color: time ? "#1F2937" : "#9CA3AF",
                    },
                  ]}
                >
                  {time || "Càng sớm càng tốt"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Ghi chú cho thợ</Text>
            <View style={[s.inputWrap, { alignItems: "flex-start" }]}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#0D9488"
                style={{ marginTop: 12 }}
              />
              <TextInput
                style={[s.textInput, { minHeight: 60 }]}
                placeholder="Mô tả vấn đề, hình ảnh có thể gửi sau..."
                placeholderTextColor="#9CA3AF"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CTA */}
      <View style={s.ctaWrap}>
        <TouchableOpacity
          style={[s.ctaBtn, !isValid && s.ctaBtnDisabled]}
          onPress={onContinue}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={s.ctaText}>Tìm thợ gần đây</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },
  servicePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0FDFA",
    borderRadius: 20,
    gap: 6,
  },
  serviceText: { fontSize: 13, fontWeight: "600", color: "#0D9488" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  savedRow: { paddingHorizontal: 16, gap: 10 },
  savedCard: {
    width: 130,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  savedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  savedLabel: { fontSize: 13, fontWeight: "700", color: "#1F2937" },
  savedAddr: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  savedCardAdd: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addLabel: { fontSize: 11, color: "#9CA3AF" },
  inputGroup: { paddingHorizontal: 16, marginBottom: 12 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    paddingVertical: 12,
  },
  row: { flexDirection: "row", paddingRight: 0 },
  ctaWrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  ctaBtnDisabled: { opacity: 0.4 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
