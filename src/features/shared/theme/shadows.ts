import { Platform } from "react-native";

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.06,
      shadowRadius: 18,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: "0px 10px 18px rgba(15, 23, 42, 0.06)",
    },
  }),
  soft: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: "0px 6px 12px rgba(15, 23, 42, 0.05)",
    },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: "0px 16px 24px rgba(15, 23, 42, 0.12)",
    },
  }),
  cta: Platform.select({
    ios: {
      shadowColor: "#90B44C",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
    },
    android: {
      elevation: 6,
    },
    default: {
      boxShadow: "0px 12px 18px rgba(144, 180, 76, 0.22)",
    },
  }),
};
