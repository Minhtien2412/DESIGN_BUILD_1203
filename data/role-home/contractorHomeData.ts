/**
 * Contractor/Company Home Screen Mock Data
 * Dữ liệu cho trang chủ role Nhà thầu / Công ty
 */
import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: IconName;
  color: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  bgColor: string;
  badge?: number;
}

export interface ActiveProject {
  id: string;
  name: string;
  progress: number;
  team: number;
  dueDate: string;
  status: "on_track" | "at_risk" | "delayed";
  budget: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: "active" | "busy" | "off";
  avatar?: string;
}

// ────── Dashboard KPIs ──────
export const contractorStats: DashboardStat[] = [
  {
    id: "s1",
    label: "Doanh thu tháng",
    value: "2.4 tỷ",
    change: "+12%",
    isPositive: true,
    icon: "trending-up-outline",
    color: "#10B981",
  },
  {
    id: "s2",
    label: "Chi phí",
    value: "1.8 tỷ",
    change: "-5%",
    isPositive: true,
    icon: "wallet-outline",
    color: "#F59E0B",
  },
  {
    id: "s3",
    label: "Dự án đang chạy",
    value: "7",
    change: "+2",
    isPositive: true,
    icon: "folder-outline",
    color: "#6366F1",
  },
  {
    id: "s4",
    label: "Nhân sự",
    value: "45",
    change: "+3",
    isPositive: true,
    icon: "people-outline",
    color: "#3B82F6",
  },
];

// ────── Quick Actions ──────
export const contractorActions: QuickAction[] = [
  {
    id: "ca1",
    label: "Quản lý nhân sự",
    icon: "people-outline",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    badge: 3,
  },
  {
    id: "ca2",
    label: "Đội thi công",
    icon: "shield-outline",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "ca3",
    label: "Dự án",
    icon: "folder-outline",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    badge: 7,
  },
  {
    id: "ca4",
    label: "Hợp đồng",
    icon: "document-text-outline",
    color: "#EF4444",
    bgColor: "#FEE2E2",
    badge: 2,
  },
  {
    id: "ca5",
    label: "Kho vật tư",
    icon: "cube-outline",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  {
    id: "ca6",
    label: "Điều phối",
    icon: "swap-horizontal-outline",
    color: "#EC4899",
    bgColor: "#FCE7F3",
  },
  {
    id: "ca7",
    label: "Báo giá",
    icon: "calculator-outline",
    color: "#10B981",
    bgColor: "#D1FAE5",
    badge: 5,
  },
  {
    id: "ca8",
    label: "Báo cáo",
    icon: "bar-chart-outline",
    color: "#3B82F6",
    bgColor: "#DBEAFE",
  },
];

// ────── Active Projects ──────
export const contractorProjects: ActiveProject[] = [
  {
    id: "cp1",
    name: "Biệt thự Thảo Điền",
    progress: 72,
    team: 12,
    dueDate: "15/06/2026",
    status: "on_track",
    budget: "8.5 tỷ",
  },
  {
    id: "cp2",
    name: "Văn phòng Landmark",
    progress: 45,
    team: 8,
    dueDate: "30/08/2026",
    status: "at_risk",
    budget: "15 tỷ",
  },
  {
    id: "cp3",
    name: "Nhà phố Quận 9",
    progress: 90,
    team: 6,
    dueDate: "01/04/2026",
    status: "on_track",
    budget: "3.2 tỷ",
  },
  {
    id: "cp4",
    name: "Chung cư Riverside",
    progress: 20,
    team: 15,
    dueDate: "31/12/2026",
    status: "delayed",
    budget: "120 tỷ",
  },
];

// ────── Team Overview ──────
export const contractorTeam: TeamMember[] = [
  {
    id: "t1",
    name: "Trần Văn An",
    role: "Đội trưởng thi công",
    status: "active",
  },
  { id: "t2", name: "Lê Thị Bình", role: "Kế toán", status: "active" },
  { id: "t3", name: "Phạm Quốc Cường", role: "Giám sát", status: "busy" },
  { id: "t4", name: "Nguyễn Hữu Dũng", role: "Thợ chính", status: "active" },
  {
    id: "t5",
    name: "Hoàng Minh Đức",
    role: "Kỹ sư hiện trường",
    status: "off",
  },
];

// ────── Notifications ──────
export const contractorAlerts = [
  {
    id: "n1",
    type: "warning",
    message: "Dự án Landmark sắp trễ deadline",
    time: "30 phút trước",
  },
  {
    id: "n2",
    type: "info",
    message: "3 hồ sơ ứng tuyển mới",
    time: "1 giờ trước",
  },
  {
    id: "n3",
    type: "success",
    message: "Thanh toán giai đoạn 3 đã nhận",
    time: "2 giờ trước",
  },
];
