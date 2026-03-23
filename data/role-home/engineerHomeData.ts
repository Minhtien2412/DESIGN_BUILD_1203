/**
 * Engineer/Architect Home Screen Mock Data
 * Dữ liệu cho trang chủ role Kỹ sư / Kiến trúc sư
 */
import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface ProfileSummary {
  name: string;
  title: string;
  level: string;
  experience: string;
  certCount: number;
  projectCount: number;
  rating: number;
  avatar?: string;
}

export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
  verified: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  type: string;
  status: "completed" | "ongoing" | "pending";
  value: string;
  image?: string;
}

export interface ToolItem {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  bgColor: string;
}

// ────── Profile ──────
export const engineerProfile: ProfileSummary = {
  name: "Nguyễn Văn Kiến",
  title: "Kiến trúc sư | Kỹ sư xây dựng",
  level: "Senior",
  experience: "12 năm",
  certCount: 5,
  projectCount: 48,
  rating: 4.8,
};

// ────── Professional Tools Grid ──────
export const engineerTools: ToolItem[] = [
  {
    id: "e1",
    label: "Hồ sơ năng lực",
    icon: "document-text-outline",
    color: "#6366F1",
    bgColor: "#EEF2FF",
  },
  {
    id: "e2",
    label: "Dự án",
    icon: "briefcase-outline",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "e3",
    label: "Chứng chỉ",
    icon: "ribbon-outline",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  {
    id: "e4",
    label: "Báo giá",
    icon: "calculator-outline",
    color: "#EF4444",
    bgColor: "#FEE2E2",
  },
  {
    id: "e5",
    label: "Hợp đồng",
    icon: "reader-outline",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  {
    id: "e6",
    label: "Giám sát",
    icon: "eye-outline",
    color: "#10B981",
    bgColor: "#D1FAE5",
  },
  {
    id: "e7",
    label: "Live Preview",
    icon: "videocam-outline",
    color: "#3B82F6",
    bgColor: "#DBEAFE",
  },
  {
    id: "e8",
    label: "Lịch họp",
    icon: "calendar-outline",
    color: "#EC4899",
    bgColor: "#FCE7F3",
  },
];

// ────── Certifications ──────
export const engineerCerts: CertItem[] = [
  {
    id: "cert1",
    name: "Chứng chỉ hành nghề KTS",
    issuer: "Bộ Xây dựng",
    year: "2022",
    verified: true,
  },
  {
    id: "cert2",
    name: "Chứng chỉ LEED AP",
    issuer: "USGBC",
    year: "2021",
    verified: true,
  },
  {
    id: "cert3",
    name: "BIM Manager",
    issuer: "Autodesk",
    year: "2023",
    verified: true,
  },
  {
    id: "cert4",
    name: "Kỹ sư xây dựng hạng I",
    issuer: "Bộ Xây dựng",
    year: "2020",
    verified: true,
  },
  {
    id: "cert5",
    name: "Project Management Professional",
    issuer: "PMI",
    year: "2023",
    verified: false,
  },
];

// ────── Recent Projects ──────
export const engineerProjects: ProjectItem[] = [
  {
    id: "p1",
    name: "Biệt thự Thạnh Mỹ Lợi",
    type: "Biệt thự",
    status: "completed",
    value: "8.5 tỷ",
  },
  {
    id: "p2",
    name: "Chung cư Sky Garden",
    type: "Chung cư",
    status: "ongoing",
    value: "120 tỷ",
  },
  {
    id: "p3",
    name: "Nhà phố Q7 Boulevard",
    type: "Nhà phố",
    status: "ongoing",
    value: "3.2 tỷ",
  },
  {
    id: "p4",
    name: "Resort Hồ Tràm",
    type: "Resort",
    status: "pending",
    value: "450 tỷ",
  },
];

// ────── Action Cards ──────
export const engineerActions: ToolItem[] = [
  {
    id: "ea1",
    label: "VR/AR Mặt bằng",
    icon: "glasses-outline",
    color: "#6366F1",
    bgColor: "#EEF2FF",
  },
  {
    id: "ea2",
    label: "Camera công trình",
    icon: "camera-outline",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "ea3",
    label: "Bản vẽ 2D/3D",
    icon: "layers-outline",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  {
    id: "ea4",
    label: "Tư vấn khách hàng",
    icon: "chatbubbles-outline",
    color: "#EC4899",
    bgColor: "#FCE7F3",
  },
];
