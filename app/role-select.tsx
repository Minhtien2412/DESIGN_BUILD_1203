/**
 * Role Selection Screen — "Bạn là Khách hay là Thợ?"
 *
 * Dark blue themed screen with two role cards (KHÁCH / THỢ).
 * Shown on first app launch before registration.
 * Design matches the provided Figma screenshot.
 *
 * @created 2026-03-05
 */

import { AppRole, useRole } from "@/context/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");

export default function RoleSelectScreen() {
  const { setRole } = useRole();
  const [selected, setSelected] = useState<AppRole>("khach");

  const handleContinue = async () => {
    await setRole(selected);
    // Navigate to main app (tabs)
    router.replace("/(tabs)" as Href);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1B2D" />

      {/* Top icon */}
      <View style={s.topIcon}>
        <Ionicons name="people-outline" size={36} color="#4DA8DA" />
      </View>

      {/* Title */}
      <Text style={s.title}>Bạn là Khách hay là Thợ?</Text>
      <Text style={s.subtitle}>Chọn vai trò của bạn</Text>

      {/* Role Cards */}
      <View style={s.cardsContainer}>
        {/* KHÁCH Card */}
        <TouchableOpacity
          style={[s.card, selected === "khach" && s.cardSelected]}
          onPress={() => setSelected("khach")}
          activeOpacity={0.8}
        >
          <View style={s.cardContent}>
            <View style={s.cardLeft}>
              <View
                style={[
                  s.roleIconBox,
                  { backgroundColor: "rgba(77,168,218,0.15)" },
                ]}
              >
                <Ionicons name="person-outline" size={22} color="#4DA8DA" />
              </View>
              <Text style={s.roleTitle}>KHÁCH</Text>
              <Text style={s.roleDesc}>Tìm thợ uy tín</Text>
              {selected === "khach" ? (
                <View style={s.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#4DA8DA" />
                  <Text style={s.selectedText}>Đã chọn</Text>
                </View>
              ) : (
                <View style={s.unselectedBadge}>
                  <View style={s.emptyCircle} />
                  <Text style={s.unselectedText}>Nhấn để chọn</Text>
                </View>
              )}
            </View>
            <Image
              source={require("@/assets/icon-home-page/Generated Image March 04, 2026 - 10_09AM.jpeg")}
              style={s.cardImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* THỢ Card */}
        <TouchableOpacity
          style={[s.card, selected === "tho" && s.cardSelected]}
          onPress={() => setSelected("tho")}
          activeOpacity={0.8}
        >
          <View style={s.cardContent}>
            <View style={s.cardLeft}>
              <View
                style={[
                  s.roleIconBox,
                  { backgroundColor: "rgba(77,168,218,0.15)" },
                ]}
              >
                <Ionicons name="construct-outline" size={22} color="#4DA8DA" />
              </View>
              <Text style={s.roleTitle}>THỢ</Text>
              <Text style={s.roleDesc}>Phát triển công việc</Text>
              {selected === "tho" ? (
                <View style={s.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#4DA8DA" />
                  <Text style={s.selectedText}>Đã chọn</Text>
                </View>
              ) : (
                <View style={s.unselectedBadge}>
                  <View style={s.emptyCircle} />
                  <Text style={s.unselectedText}>Nhấn để chọn</Text>
                </View>
              )}
            </View>
            <Image
              source={require("@/assets/icon-home-page/Generated Image March 04, 2026 - 10_09AM.jpeg")}
              style={s.cardImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={s.continueBtn}
        onPress={handleContinue}
        activeOpacity={0.85}
      >
        <Text style={s.continueTxt}>Tiếp tục</Text>
        <Ionicons name="arrow-forward" size={20} color="#1A1A2E" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  topIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(77,168,218,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginBottom: 30,
  },
  cardsContainer: {
    width: "100%",
    gap: 16,
    flex: 1,
    justifyContent: "center",
    maxHeight: SH * 0.55,
  },
  card: {
    backgroundColor: "#1A2744",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 180,
  },
  cardSelected: {
    borderColor: "#4DA8DA",
    backgroundColor: "#1E2E4A",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flex: 1,
    gap: 8,
  },
  roleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  roleDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 8,
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(77,168,218,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  selectedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4DA8DA",
  },
  unselectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  unselectedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F5C542",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: Platform.OS === "ios" ? 40 : 30,
  },
  continueTxt: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
  },
});
