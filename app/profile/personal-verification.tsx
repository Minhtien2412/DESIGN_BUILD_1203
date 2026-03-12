import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ApiError, apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ACCOUNT_TYPES = [
  "Cá nhân",
  "Chủ đầu tư",
  "Công ty",
  "Ngân hàng",
  "Nhà thầu",
  "Giám sát",
  "Tư vấn",
];

type KycStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_CONFIG: Record<
  KycStatus,
  { label: string; color: string; icon: string }
> = {
  NOT_SUBMITTED: {
    label: "Chưa xác minh",
    color: "#999",
    icon: "shield-outline",
  },
  PENDING: { label: "Đang chờ duyệt", color: "#F59E0B", icon: "time-outline" },
  APPROVED: {
    label: "Đã xác minh",
    color: "#10B981",
    icon: "checkmark-circle",
  },
  REJECTED: { label: "Bị từ chối", color: "#EF4444", icon: "close-circle" },
};

export default function PersonalVerificationScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const primaryColor = useThemeColor({}, "tint");

  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>(
    [],
  );
  const [kycStatus, setKycStatus] = useState<KycStatus>("NOT_SUBMITTED");
  const [adminNote, setAdminNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch current KYC status on mount
  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch("/profile/verification/status");
      const data = (res as any)?.data;
      if (data?.status) {
        setKycStatus(data.status as KycStatus);
        if (data.adminNote) setAdminNote(data.adminNote);
        // Pre-fill form with existing data
        if (data.fullName) setFullName(data.fullName);
        if (data.idNumber) setIdNumber(data.idNumber);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
        if (data.accountTypes?.length)
          setSelectedAccountTypes(data.accountTypes);
      }
    } catch {
      // If endpoint doesn't respond, allow form submission
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const toggleAccountType = (type: string) => {
    setSelectedAccountTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập CCCD/CMND");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }
    if (selectedAccountTypes.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một loại tài khoản");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/profile/verification", {
        method: "POST",
        data: {
          fullName,
          idNumber,
          address,
          phone,
          email,
          accountTypes: selectedAccountTypes,
        },
      });

      setKycStatus("PENDING");
      Alert.alert("Thành công", "Đã gửi yêu cầu xác minh tài khoản", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      const msg =
        (e as ApiError)?.data?.message ||
        (e as Error)?.message ||
        "Không thể gửi xác minh";
      Alert.alert("Lỗi", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ backgroundColor }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </Container>
    );
  }

  const statusConfig = STATUS_CONFIG[kycStatus];
  const canSubmit = kycStatus === "NOT_SUBMITTED" || kycStatus === "REJECTED";

  return (
    <Container style={{ backgroundColor }}>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>
          Tài khoản xác minh
        </Text>

        {/* KYC Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.color + "15",
              borderColor: statusConfig.color,
            },
          ]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={24}
            color={statusConfig.color}
          />
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            {adminNote && kycStatus === "REJECTED" && (
              <Text style={[styles.adminNote, { color: textColor }]}>
                Lý do: {adminNote}
              </Text>
            )}
            {kycStatus === "APPROVED" && (
              <Text style={[styles.statusSubtext, { color: "#10B981" }]}>
                Tài khoản của bạn đã được xác minh thành công
              </Text>
            )}
            {kycStatus === "PENDING" && (
              <Text style={[styles.statusSubtext, { color: "#F59E0B" }]}>
                Yêu cầu đang được xem xét, vui lòng chờ trong 1-3 ngày làm việc
              </Text>
            )}
          </View>
        </View>

        {/* Only show form if can submit */}
        {canSubmit && (
          <>
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Họ và tên
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: borderColor },
                  ]}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  CCCD/CMND
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: borderColor },
                  ]}
                  placeholder="Nhập số CCCD"
                  placeholderTextColor="#999"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Địa chỉ
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: borderColor },
                  ]}
                  placeholder="Số nhà, đường, thị xã, tỉnh thành"
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>
                  Số điện thoại
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: borderColor },
                  ]}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: borderColor },
                  ]}
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Account Type Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>
                Tài khoản
              </Text>
              <View style={styles.accountTypesGrid}>
                {ACCOUNT_TYPES.map((type) => {
                  const isSelected = selectedAccountTypes.includes(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.accountTypeChip,
                        {
                          backgroundColor: isSelected
                            ? primaryColor
                            : "#F5F5F5",
                          borderColor: isSelected ? primaryColor : borderColor,
                        },
                      ]}
                      onPress={() => toggleAccountType(type)}
                    >
                      <Text
                        style={[
                          styles.accountTypeText,
                          { color: isSelected ? "#FFF" : textColor },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title={kycStatus === "REJECTED" ? "Gửi lại xác minh" : "Tiếp tục"}
              onPress={handleSubmit}
              disabled={submitting}
              style={styles.submitButton}
            />
          </>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  adminNote: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  accountTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  accountTypeChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
