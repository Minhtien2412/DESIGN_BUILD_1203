/**
 * Quote Request Screen (Customer Portal)
 * Khách hàng tạo yêu cầu báo giá
 */

import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
    createQuoteRequest,
    type CreateQuoteRequestInput,
    type ProjectType,
} from "@/services/quoteRequestService";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function QuoteRequestScreen() {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const primary = useThemeColor({}, "primary");
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const projectTypes: { value: ProjectType; label: string }[] = [
    { value: "construction", label: "Xây dựng" },
    { value: "renovation", label: "Cải tạo" },
    { value: "design", label: "Thiết kế" },
    { value: "consultation", label: "Tư vấn" },
    { value: "maintenance", label: "Bảo trì" },
    { value: "other", label: "Khác" },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!projectName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên dự án");
      return;
    }
    if (!projectType) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn loại dự án");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng mô tả yêu cầu");
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại");
      return;
    }

    setSubmitting(true);

    try {
      // Create submission data for BE API using new service
      const quoteRequestData: CreateQuoteRequestInput = {
        projectName: projectName.trim(),
        projectType: projectType as ProjectType,
        description: description.trim(),
        contactName: contactName || user?.name || "Khách",
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail || user?.email || undefined,
        address: address || undefined,
        budget: budget ? parseFloat(budget.replace(/[^0-9]/g, "")) : undefined,
      };

      // Send to backend API using new service
      const result = await createQuoteRequest(quoteRequestData);

      if (!result.ok) {
        throw new Error(result.error?.message || "Không thể gửi yêu cầu");
      }

      // Show success with quote code
      const quoteCode = result.data?.code || `QR-${Date.now()}`;

      // Show success
      Alert.alert(
        "Gửi yêu cầu thành công!",
        `Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.\n\nMã yêu cầu: ${quoteCode}`,
        [
          {
            text: "Xem yêu cầu của tôi",
            onPress: () => router.push("/profile/my-requests" as Href),
          },
          {
            text: "Tạo yêu cầu mới",
            onPress: () => {
              // Reset form
              setProjectName("");
              setProjectType("");
              setArea("");
              setBudget("");
              setDescription("");
              setAddress("");
            },
          },
        ],
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu. Vui lòng thử lại.";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Yêu cầu báo giá
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin dự án</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Tên dự án <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Thiết kế nội thất phòng khách"
              value={projectName}
              onChangeText={setProjectName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Loại dự án <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chips}
            >
              {projectTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    projectType === type.value && { backgroundColor: primary },
                  ]}
                  onPress={() => setProjectType(type.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      projectType === type.value && { color: "#fff" },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Diện tích (m²)</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Ngân sách dự kiến</Text>
              <TextInput
                style={styles.input}
                placeholder="100 triệu"
                value={budget}
                onChangeText={setBudget}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Mô tả yêu cầu <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết yêu cầu của bạn..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Địa chỉ dự án</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              value={contactName}
              onChangeText={setContactName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Số điện thoại <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0901234567"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={primary} />
          <Text style={styles.infoText}>
            Yêu cầu của bạn sẽ được gửi đến đội ngũ tư vấn. Chúng tôi sẽ liên hệ
            với bạn trong vòng 24 giờ.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: primary }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  required: {
    color: "#000000",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  row: {
    flexDirection: "row",
  },
  chips: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    color: "#111",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0F766E",
    lineHeight: 18,
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
