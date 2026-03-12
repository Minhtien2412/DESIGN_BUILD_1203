/**
 * Thước Lỗ Ban - Công cụ đo phong thủy
 * Tính toán kích thước theo thước Lỗ Ban (Lu Ban ruler)
 * Theo tài liệu: nhaxinhcenter.com/thuoc-lo-ban.html
 *
 * 3 loại thước:
 * - 52.2cm: Đo thông thủy (cửa, cửa sổ, giếng trời...)
 * - 42.9cm: Đo khối xây dựng (bệ, bậc, tủ bếp...)
 * - 38.8cm: Đo âm trạch (mồ mả, bàn thờ...)
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==================== THƯỚC LỖ BAN 52.2cm - ĐO THÔNG THỦY ====================
// Dùng để đo khoảng thông thủy: cửa chính, cửa sổ, giếng trời, ô thoáng...
// L = 0.522m = 522mm, mỗi cung = 65.25mm

interface SubCung {
  name: string;
  meaning: string;
}

interface Cung {
  id: number;
  name: string;
  nameHan: string;
  type: "good" | "bad";
  color: string;
  meaning: string;
  rangeStart: number;
  rangeEnd: number;
  subCung: SubCung[];
}

interface Ruler {
  name: string;
  description: string;
  lengthMm: number;
  cungCount: number;
  cungLengthMm: number;
  cung: Cung[];
}

const THUOC_522: Ruler = {
  name: "Thước 52.2cm",
  description: "Đo thông thủy (cửa, cửa sổ, giếng trời...)",
  lengthMm: 522,
  cungCount: 8,
  cungLengthMm: 65.25, // 522 / 8
  cung: [
    {
      id: 1,
      name: "Quý Nhân",
      nameHan: "貴人",
      type: "good",
      color: "#22c55e",
      meaning:
        "Gia cảnh khả quan, làm ăn phát đạt, bạn bè trung thành, con cái thông minh hiếu thảo",
      rangeStart: 0.015,
      rangeEnd: 0.065,
      subCung: [
        { name: "Quyền Lộc", meaning: "Có quyền, có lộc" },
        { name: "Trung Tín", meaning: "Trung thành đáng tin" },
        { name: "Tác Quan", meaning: "Làm quan" },
        { name: "Phát Đạt", meaning: "Phát đạt thịnh vượng" },
        { name: "Thông Minh", meaning: "Thông minh sáng suốt" },
      ],
    },
    {
      id: 2,
      name: "Hiểm Họa",
      nameHan: "險禍",
      type: "bad",
      color: "#ef4444",
      meaning:
        "Tán tài lộc, trôi dạt tha phương, cuộc sống túng thiếu, gia đạo đau ốm, con cái hư thân",
      rangeStart: 0.07,
      rangeEnd: 0.13,
      subCung: [
        { name: "Án Thành", meaning: "Bị kiện tụng" },
        { name: "Hỗn Nhân", meaning: "Gặp kẻ xấu" },
        { name: "Thất Hiếu", meaning: "Con cái bất hiếu" },
        { name: "Tai Họa", meaning: "Tai họa đến" },
        { name: "Thường Bệnh", meaning: "Hay ốm đau" },
      ],
    },
    {
      id: 3,
      name: "Thiên Tai",
      nameHan: "天災",
      type: "bad",
      color: "#f97316",
      meaning: "Ốm đau, chết chóc, mất của, vợ chồng bất hòa, con cái gặp nạn",
      rangeStart: 0.135,
      rangeEnd: 0.195,
      subCung: [
        { name: "Hoàn Tử", meaning: "Chết oan" },
        { name: "Quan Tài", meaning: "Liên quan đến chết" },
        { name: "Thân Tàn", meaning: "Thân thể tàn phế" },
        { name: "Thất Tài", meaning: "Mất tiền của" },
        { name: "Hệ Quả", meaning: "Hậu quả xấu" },
      ],
    },
    {
      id: 4,
      name: "Thiên Tài",
      nameHan: "天財",
      type: "good",
      color: "#0D9488",
      meaning:
        "Luôn may mắn về tài lộc, năng tài đắc lợi, con cái nhờ vả hiếu thảo, gia đạo chí thọ an vui",
      rangeStart: 0.2,
      rangeEnd: 0.26,
      subCung: [
        { name: "Thi Thư", meaning: "Học hành giỏi giang" },
        { name: "Văn Học", meaning: "Có văn học" },
        { name: "Thanh Quý", meaning: "Thanh cao quý phái" },
        { name: "Tác Lộc", meaning: "Có lộc" },
        { name: "Thiên Lộc", meaning: "Lộc trời ban" },
      ],
    },
    {
      id: 5,
      name: "Phúc Lộc",
      nameHan: "福祿",
      type: "good",
      color: "#8b5cf6",
      meaning:
        "Sung túc, phúc lộc, nghề nghiệp phát triển, năng tài đắc lợi, con cái thông minh hiếu học",
      rangeStart: 0.265,
      rangeEnd: 0.325,
      subCung: [
        { name: "Trí Tồn", meaning: "Có trí tuệ" },
        { name: "Phú Quý", meaning: "Giàu có" },
        { name: "Tiến Bửu", meaning: "Được của báu" },
        { name: "Thập Thiện", meaning: "Mười điều thiện" },
        { name: "Văn Chương", meaning: "Giỏi văn chương" },
      ],
    },
    {
      id: 6,
      name: "Cô Độc",
      nameHan: "孤獨",
      type: "bad",
      color: "#dc2626",
      meaning: "Hao người hao của, biệt ly, con cái ngỗ nghịch, tửu sắc vô độ",
      rangeStart: 0.33,
      rangeEnd: 0.39,
      subCung: [
        { name: "Bạc Nghịch", meaning: "Bạc bẽo phản nghịch" },
        { name: "Vô Vọng", meaning: "Tuyệt vọng" },
        { name: "Ly Tán", meaning: "Tan tác ly tán" },
        { name: "Tửu Thục", meaning: "Nghiện rượu" },
        { name: "Dâm Dục", meaning: "Ham mê sắc dục" },
      ],
    },
    {
      id: 7,
      name: "Thiên Tặc",
      nameHan: "天賊",
      type: "bad",
      color: "#ea580c",
      meaning:
        "Bệnh đến bất ngờ, tai bay vạ gió, kiện tụng, tù ngục, chết chóc",
      rangeStart: 0.395,
      rangeEnd: 0.455,
      subCung: [
        { name: "Phong Bệnh", meaning: "Bệnh phong" },
        { name: "Chiêu Ôn", meaning: "Chiêu dịch bệnh" },
        { name: "Ôn Tài", meaning: "Mất tài vì dịch" },
        { name: "Ngục Tù", meaning: "Vào tù" },
        { name: "Quang Tài", meaning: "Mất sạch tiền" },
      ],
    },
    {
      id: 8,
      name: "Tể Tướng",
      nameHan: "宰相",
      type: "good",
      color: "#10b981",
      meaning:
        "Hanh thông mọi mặt, con cái tấn tài danh, sinh con quý tử, luôn may mắn bất ngờ",
      rangeStart: 0.46,
      rangeEnd: 0.52,
      subCung: [
        { name: "Tiến Bảo", meaning: "Được của báu" },
        { name: "Hưng Vượng", meaning: "Hưng thịnh" },
        { name: "Quý Tử", meaning: "Con quý" },
        { name: "Tài Lộc", meaning: "Tài lộc dồi dào" },
        { name: "Đại Cát", meaning: "Rất tốt lành" },
      ],
    },
  ],
};

// ==================== THƯỚC LỖ BAN 42.9cm - ĐO KHỐI XÂY DỰNG ====================
// Dùng để đo kích thước đặc: bệ, bậc, tủ bếp, giường, tủ đồ...
// L = 0.429m = 429mm, mỗi cung = 53.625mm

const THUOC_429: Ruler = {
  name: "Thước 42.9cm",
  description: "Đo khối xây dựng (bệ, bậc, tủ bếp, giường...)",
  lengthMm: 429,
  cungCount: 8,
  cungLengthMm: 53.625, // 429 / 8
  cung: [
    {
      id: 1,
      name: "Tài",
      nameHan: "財",
      type: "good",
      color: "#22c55e",
      meaning: "Tài lộc, của cải đến",
      rangeStart: 0.01,
      rangeEnd: 0.053,
      subCung: [
        { name: "Tài Đức", meaning: "Có tài và có đức" },
        { name: "Bảo Khố", meaning: "Có kho quý" },
        { name: "Lục Hợp", meaning: "Đạt được sáu điều ưng ý" },
        { name: "Nghênh Phúc", meaning: "Đón điều phúc" },
      ],
    },
    {
      id: 2,
      name: "Bệnh",
      nameHan: "病",
      type: "bad",
      color: "#ef4444",
      meaning: "Bệnh tật, ốm đau",
      rangeStart: 0.055,
      rangeEnd: 0.107,
      subCung: [
        { name: "Thoát Tài", meaning: "Mất tiền" },
        { name: "Công Sự", meaning: "Bị đến cửa quan" },
        { name: "Lao Chấp", meaning: "Bị tù đày" },
        { name: "Cô Quả", meaning: "Đơn lẻ" },
      ],
    },
    {
      id: 3,
      name: "Ly",
      nameHan: "離",
      type: "bad",
      color: "#f97316",
      meaning: "Xa cách, chia ly",
      rangeStart: 0.11,
      rangeEnd: 0.16,
      subCung: [
        { name: "Trưởng Khố", meaning: "Cầm cố đồ đạc" },
        { name: "Kiếp Tài", meaning: "Của cải bị cướp" },
        { name: "Quan Quỷ", meaning: "Công việc kém tối" },
        { name: "Thất Thoát", meaning: "Bị mất mát" },
      ],
    },
    {
      id: 4,
      name: "Nghĩa",
      nameHan: "義",
      type: "good",
      color: "#0D9488",
      meaning: "Đạt được điều hay lẽ phải",
      rangeStart: 0.162,
      rangeEnd: 0.214,
      subCung: [
        { name: "Thêm Đinh", meaning: "Thêm con trai" },
        { name: "Ích Lợi", meaning: "Có lợi, có ích" },
        { name: "Quý Tử", meaning: "Sinh con quý tử" },
        { name: "Đại Cát", meaning: "Nhiều điều hay" },
      ],
    },
    {
      id: 5,
      name: "Quan",
      nameHan: "官",
      type: "good",
      color: "#8b5cf6",
      meaning: "Người chủ, công danh",
      rangeStart: 0.216,
      rangeEnd: 0.268,
      subCung: [
        { name: "Thuận Khoa", meaning: "Tiến đường công danh" },
        { name: "Hoành Tài", meaning: "Tiền nhiều" },
        { name: "Tiến Ích", meaning: "Ích lợi tăng" },
        { name: "Phú Quý", meaning: "Giàu sang" },
      ],
    },
    {
      id: 6,
      name: "Kiếp",
      nameHan: "劫",
      type: "bad",
      color: "#dc2626",
      meaning: "Tai nạn, kiếp nạn",
      rangeStart: 0.27,
      rangeEnd: 0.321,
      subCung: [
        { name: "Tử Biệt", meaning: "Chết chóc" },
        { name: "Thoái Khẩu", meaning: "Mất người" },
        { name: "Ly Hương", meaning: "Bỏ quê mà đi" },
        { name: "Tài Thất", meaning: "Mất tiền" },
      ],
    },
    {
      id: 7,
      name: "Hại",
      nameHan: "害",
      type: "bad",
      color: "#ea580c",
      meaning: "Bị xấu, tai hại",
      rangeStart: 0.323,
      rangeEnd: 0.375,
      subCung: [
        { name: "Tai Chí", meaning: "Tai nạn đến" },
        { name: "Tử Tuyệt", meaning: "Chết chóc" },
        { name: "Bệnh Lâm", meaning: "Mắc bệnh" },
        { name: "Khẩu Thiệt", meaning: "Cãi nhau" },
      ],
    },
    {
      id: 8,
      name: "Bản",
      nameHan: "本",
      type: "good",
      color: "#10b981",
      meaning: "Gốc rễ, căn bản vững chắc",
      rangeStart: 0.377,
      rangeEnd: 0.429,
      subCung: [
        { name: "Tài Chí", meaning: "Tiền tài đến" },
        { name: "Đăng Khoa", meaning: "Đỗ đạt" },
        { name: "Tiến Bảo", meaning: "Được dâng của quý" },
        { name: "Hưng Vượng", meaning: "Làm ăn phát đạt" },
      ],
    },
  ],
};

// ==================== THƯỚC LỖ BAN 38.8cm - ĐO ÂM TRẠCH ====================
// Dùng để đo âm phần: mồ mả, bàn thờ, tiểu quách...
// L = 0.388m = 388mm, 10 cung, mỗi cung = 38.8mm

const THUOC_388: Ruler = {
  name: "Thước 38.8cm",
  description: "Đo âm trạch (mồ mả, bàn thờ...)",
  lengthMm: 388,
  cungCount: 10,
  cungLengthMm: 38.8, // 388 / 10
  cung: [
    {
      id: 1,
      name: "Đinh",
      nameHan: "丁",
      type: "good",
      color: "#22c55e",
      meaning: "Con trai, đinh vượng",
      rangeStart: 0,
      rangeEnd: 0.0388,
      subCung: [
        { name: "Phúc Tinh", meaning: "Sao phúc" },
        { name: "Đỗ Đạt", meaning: "Thi cử đỗ đạt" },
        { name: "Tài Vượng", meaning: "Tiền của đến" },
        { name: "Đăng Khoa", meaning: "Thi đỗ" },
      ],
    },
    {
      id: 2,
      name: "Hại",
      nameHan: "害",
      type: "bad",
      color: "#ef4444",
      meaning: "Tai hại, tổn thương",
      rangeStart: 0.0388,
      rangeEnd: 0.0776,
      subCung: [
        { name: "Khẩu Thiệt", meaning: "Mang họa vì lời nói" },
        { name: "Lâm Bệnh", meaning: "Bị mắc bệnh" },
        { name: "Tử Tuyệt", meaning: "Đoạn tuyệt con cháu" },
        { name: "Họa Chí", meaning: "Tai họa ập đến bất ngờ" },
      ],
    },
    {
      id: 3,
      name: "Vượng",
      nameHan: "旺",
      type: "good",
      color: "#0D9488",
      meaning: "Hưng vượng, thịnh vượng",
      rangeStart: 0.0776,
      rangeEnd: 0.1164,
      subCung: [
        { name: "Thiên Đức", meaning: "Đức của trời" },
        { name: "Hỷ Sự", meaning: "Chuyện vui đến" },
        { name: "Tiến Bảo", meaning: "Tiền của đến" },
        { name: "Thêm Phúc", meaning: "Phúc lộc dồi dào" },
      ],
    },
    {
      id: 4,
      name: "Khổ",
      nameHan: "苦",
      type: "bad",
      color: "#f97316",
      meaning: "Khổ cực, vất vả",
      rangeStart: 0.1164,
      rangeEnd: 0.1552,
      subCung: [
        { name: "Thất Thoát", meaning: "Mất của" },
        { name: "Quan Quỷ", meaning: "Tranh chấp, kiện tụng" },
        { name: "Kiếp Tài", meaning: "Bị cướp của" },
        { name: "Vô Tự", meaning: "Không có con nối dõi" },
      ],
    },
    {
      id: 5,
      name: "Nghĩa",
      nameHan: "義",
      type: "good",
      color: "#8b5cf6",
      meaning: "Nghĩa khí, điều hay",
      rangeStart: 0.1552,
      rangeEnd: 0.194,
      subCung: [
        { name: "Đại Cát", meaning: "Cát lành" },
        { name: "Tài Vượng", meaning: "Tiền của nhiều" },
        { name: "Lợi Ích", meaning: "Thu được lợi" },
        { name: "Thiên Khố", meaning: "Kho báu trời cho" },
      ],
    },
    {
      id: 6,
      name: "Quan",
      nameHan: "官",
      type: "good",
      color: "#6366f1",
      meaning: "Quan lộc, công danh",
      rangeStart: 0.194,
      rangeEnd: 0.2328,
      subCung: [
        { name: "Phú Quý", meaning: "Giàu có" },
        { name: "Tiến Bảo", meaning: "Được của quý" },
        { name: "Tài Lộc", meaning: "Tiền của nhiều" },
        { name: "Thuận Khoa", meaning: "Thi đỗ" },
      ],
    },
    {
      id: 7,
      name: "Tử",
      nameHan: "死",
      type: "bad",
      color: "#dc2626",
      meaning: "Tử vong, chết chóc",
      rangeStart: 0.2328,
      rangeEnd: 0.2716,
      subCung: [
        { name: "Ly Hương", meaning: "Xa quê hương" },
        { name: "Tử Biệt", meaning: "Có người mất" },
        { name: "Thoát Đinh", meaning: "Con trai mất" },
        { name: "Thất Tài", meaning: "Mất tiền của" },
      ],
    },
    {
      id: 8,
      name: "Hưng",
      nameHan: "興",
      type: "good",
      color: "#10b981",
      meaning: "Hưng thịnh, phát triển",
      rangeStart: 0.2716,
      rangeEnd: 0.3104,
      subCung: [
        { name: "Đăng Khoa", meaning: "Thi cử đỗ đạt" },
        { name: "Quý Tử", meaning: "Con ngoan" },
        { name: "Thêm Đinh", meaning: "Có thêm con trai" },
        { name: "Hưng Vượng", meaning: "Giàu có" },
      ],
    },
    {
      id: 9,
      name: "Thất",
      nameHan: "失",
      type: "bad",
      color: "#ea580c",
      meaning: "Mất mát, thất bại",
      rangeStart: 0.3104,
      rangeEnd: 0.3492,
      subCung: [
        { name: "Cô Quả", meaning: "Cô đơn" },
        { name: "Lao Chấp", meaning: "Bị tù đày" },
        { name: "Công Sự", meaning: "Dính dáng tới chính quyền" },
        { name: "Thoát Tài", meaning: "Mất tiền của" },
      ],
    },
    {
      id: 10,
      name: "Tài",
      nameHan: "財",
      type: "good",
      color: "#22c55e",
      meaning: "Tài lộc, của cải",
      rangeStart: 0.3492,
      rangeEnd: 0.388,
      subCung: [
        { name: "Nghinh Phúc", meaning: "Phúc đến" },
        { name: "Lục Hợp", meaning: "6 hướng đều tốt" },
        { name: "Tiến Bảo", meaning: "Tiền của đến" },
        { name: "Tài Đức", meaning: "Có tiền và có đức" },
      ],
    },
  ],
};

// ==================== RULER TYPES ====================

type RulerType = "522" | "429" | "388";

const RULERS: Record<RulerType, Ruler> = {
  "522": THUOC_522,
  "429": THUOC_429,
  "388": THUOC_388,
};

// Các loại kích thước phổ biến theo loại thước
const DIMENSION_TYPES: Record<
  RulerType,
  Array<{ id: string; label: string; icon: string; placeholder: string }>
> = {
  "522": [
    {
      id: "door",
      label: "Cửa chính",
      icon: "enter-outline",
      placeholder: "VD: 2100",
    },
    {
      id: "window",
      label: "Cửa sổ",
      icon: "grid-outline",
      placeholder: "VD: 1200",
    },
    {
      id: "skylight",
      label: "Giếng trời",
      icon: "sunny-outline",
      placeholder: "VD: 800",
    },
    {
      id: "gate",
      label: "Cổng",
      icon: "business-outline",
      placeholder: "VD: 3000",
    },
    {
      id: "vent",
      label: "Ô thoáng",
      icon: "apps-outline",
      placeholder: "VD: 400",
    },
  ],
  "429": [
    {
      id: "bed",
      label: "Giường",
      icon: "bed-outline",
      placeholder: "VD: 1800",
    },
    {
      id: "desk",
      label: "Bàn",
      icon: "desktop-outline",
      placeholder: "VD: 1200",
    },
    {
      id: "cabinet",
      label: "Tủ",
      icon: "file-tray-stacked-outline",
      placeholder: "VD: 800",
    },
    {
      id: "step",
      label: "Bậc thang",
      icon: "layers-outline",
      placeholder: "VD: 300",
    },
    {
      id: "counter",
      label: "Bệ/Quầy",
      icon: "cube-outline",
      placeholder: "VD: 600",
    },
  ],
  "388": [
    {
      id: "altar",
      label: "Bàn thờ",
      icon: "flame-outline",
      placeholder: "VD: 1070",
    },
    {
      id: "tomb",
      label: "Mộ phần",
      icon: "home-outline",
      placeholder: "VD: 1500",
    },
    {
      id: "coffin",
      label: "Tiểu quách",
      icon: "archive-outline",
      placeholder: "VD: 600",
    },
    {
      id: "incense",
      label: "Bát hương",
      icon: "bonfire-outline",
      placeholder: "VD: 150",
    },
  ],
};

// ==================== QUICK PRESETS ====================
// Các kích thước phổ biến theo loại thước

const QUICK_PRESETS: Record<
  RulerType,
  Array<{ label: string; value: number; desc: string }>
> = {
  "522": [
    { label: "Cửa chính", value: 2100, desc: "Chiều cao chuẩn" },
    { label: "Cửa phòng", value: 2000, desc: "Chiều cao phòng" },
    { label: "Rộng cửa", value: 900, desc: "Cửa 1 cánh" },
    { label: "Cửa đôi", value: 1200, desc: "Cửa 2 cánh" },
    { label: "Cửa sổ", value: 1400, desc: "Cao cửa sổ" },
    { label: "Giếng trời", value: 800, desc: "Kích thước nhỏ" },
  ],
  "429": [
    { label: "Giường đơn", value: 1000, desc: "Rộng 1m" },
    { label: "Giường đôi", value: 1600, desc: "Rộng 1.6m" },
    { label: "Giường King", value: 1800, desc: "Rộng 1.8m" },
    { label: "Bàn làm việc", value: 1200, desc: "Dài bàn" },
    { label: "Tủ bếp", value: 850, desc: "Cao tủ dưới" },
    { label: "Bậc thang", value: 280, desc: "Cao bậc" },
  ],
  "388": [
    { label: "Bàn thờ lớn", value: 1530, desc: "Rộng 1.53m" },
    { label: "Bàn thờ TB", value: 1070, desc: "Rộng 1.07m" },
    { label: "Bàn thờ nhỏ", value: 810, desc: "Rộng 81cm" },
    { label: "Bát hương", value: 150, desc: "Đường kính" },
    { label: "Mộ phần", value: 1500, desc: "Chiều dài" },
    { label: "Tiểu quách", value: 600, desc: "Chiều dài" },
  ],
};

// ==================== UTILITIES ====================

interface LoBanResult {
  cung: Cung;
  subCung: SubCung;
  position: number;
  isGood: boolean;
  nearestGood: { min: number; max: number } | null;
  ruler: Ruler;
}

function calculateLoBan(sizeInMm: number, rulerType: RulerType): LoBanResult {
  const ruler = RULERS[rulerType];
  const L = ruler.lengthMm;

  // Lấy phần dư trong chu kỳ thước (đơn vị mm)
  const n = Math.floor(sizeInMm / L);
  const remainder = sizeInMm - n * L;

  // Tìm cung dựa trên vị trí trong thước (chia đều theo cung)
  const cungLengthMm = L / ruler.cungCount;
  const cungIndex = Math.min(
    Math.floor(remainder / cungLengthMm),
    ruler.cungCount - 1,
  );
  const foundCung = ruler.cung[cungIndex] || ruler.cung[0];

  // Xác định tiểu cung
  const positionInCungMm = remainder - cungIndex * cungLengthMm;
  const subCungLengthMm = cungLengthMm / foundCung.subCung.length;
  const subCungIndex = Math.max(
    0,
    Math.min(
      Math.floor(positionInCungMm / subCungLengthMm),
      foundCung.subCung.length - 1,
    ),
  );

  // Tìm kích thước tốt gần nhất nếu cung hiện tại xấu
  let nearestGood: { min: number; max: number } | null = null;
  if (foundCung.type === "bad") {
    const goodCungs = ruler.cung.filter((c) => c.type === "good");
    let minDistance = Infinity;

    for (const goodCung of goodCungs) {
      const goodCungIdx = ruler.cung.indexOf(goodCung);
      const currentCungIdx = cungIndex;
      const distance = Math.abs(goodCungIdx - currentCungIdx);

      if (distance < minDistance) {
        minDistance = distance;
        // Tính kích thước tốt dựa trên cùng chu kỳ n
        const goodCungStart = n * L + goodCungIdx * cungLengthMm;
        const goodCungEnd = n * L + (goodCungIdx + 1) * cungLengthMm;
        nearestGood = {
          min: Math.round(goodCungStart),
          max: Math.round(goodCungEnd),
        };
      }
    }
  }

  return {
    cung: foundCung,
    subCung: foundCung.subCung[subCungIndex],
    position: subCungIndex + 1,
    isGood: foundCung.type === "good",
    nearestGood,
    ruler,
  };
}

// ==================== COMPONENTS ====================

interface CungCardProps {
  cung: Cung;
  isActive?: boolean;
  onPress?: () => void;
  isCompact?: boolean;
}

const CungCard: React.FC<CungCardProps> = ({
  cung,
  isActive,
  onPress,
  isCompact,
}) => (
  <TouchableOpacity
    style={[
      styles.cungCard,
      isActive && { borderColor: cung.color, borderWidth: 2 },
      isCompact && styles.cungCardCompact,
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.cungIcon, { backgroundColor: cung.color + "20" }]}>
      <Text style={[styles.cungHan, { color: cung.color }]}>
        {cung.nameHan}
      </Text>
    </View>
    <Text style={styles.cungName}>{cung.name}</Text>
    <View
      style={[
        styles.cungBadge,
        { backgroundColor: cung.type === "good" ? "#22c55e" : "#ef4444" },
      ]}
    >
      <Text style={styles.cungBadgeText}>
        {cung.type === "good" ? "Cát" : "Hung"}
      </Text>
    </View>
  </TouchableOpacity>
);

// ==================== MAIN SCREEN ====================

export default function LoBanRulerScreen() {
  const [inputValue, setInputValue] = useState("");
  const [unit, setUnit] = useState<"mm" | "cm" | "m">("mm");
  const [rulerType, setRulerType] = useState<RulerType>("522");
  const [dimensionType, setDimensionType] = useState("door");
  const [selectedCung, setSelectedCung] = useState<Cung | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "slider" | "preset">(
    "text",
  );
  const [sliderValue, setSliderValue] = useState(1000);
  const [measureHistory, setMeasureHistory] = useState<
    Array<{ size: number; ruler: RulerType; cung: string; isGood: boolean }>
  >([]);

  const currentRuler = RULERS[rulerType];
  const currentDimensionTypes = DIMENSION_TYPES[rulerType];
  const currentPresets = QUICK_PRESETS[rulerType];

  // Slider range based on ruler type
  const sliderRange = useMemo(() => {
    switch (rulerType) {
      case "522":
        return { min: 100, max: 5000, step: 10 };
      case "429":
        return { min: 100, max: 3000, step: 10 };
      case "388":
        return { min: 50, max: 2000, step: 5 };
    }
  }, [rulerType]);

  // Convert input to mm
  const sizeInMm = useMemo(() => {
    if (inputMode === "slider") {
      return sliderValue;
    }
    const num = parseFloat(inputValue);
    if (isNaN(num)) return 0;
    switch (unit) {
      case "cm":
        return num * 10;
      case "m":
        return num * 1000;
      default:
        return num;
    }
  }, [inputValue, unit, inputMode, sliderValue]);

  // Calculate Lo Ban result
  const result = useMemo(() => {
    if (sizeInMm <= 0) return null;
    return calculateLoBan(sizeInMm, rulerType);
  }, [sizeInMm, rulerType]);

  // Handle ruler type change
  const handleRulerTypeChange = useCallback((type: RulerType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRulerType(type);
    setDimensionType(DIMENSION_TYPES[type][0].id);
  }, []);

  // Handle suggest good size
  const handleSuggestSize = useCallback(
    (size: number) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      let suggested = size;
      switch (unit) {
        case "cm":
          suggested = suggested / 10;
          break;
        case "m":
          suggested = suggested / 1000;
          break;
      }
      setInputMode("text");
      setInputValue(
        suggested.toFixed(unit === "m" ? 3 : unit === "cm" ? 1 : 0),
      );
    },
    [unit],
  );

  // Handle slider change
  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(Math.round(value));
    Haptics.selectionAsync();
  }, []);

  // Handle preset selection
  const handlePresetSelect = useCallback((presetValue: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputMode("text");
    setInputValue(presetValue.toString());
  }, []);

  // Save to history
  const saveToHistory = useCallback(() => {
    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMeasureHistory((prev) =>
        [
          {
            size: sizeInMm,
            ruler: rulerType,
            cung: result.cung.name,
            isGood: result.isGood,
          },
          ...prev,
        ].slice(0, 10),
      );
    }
  }, [result, sizeInMm, rulerType]);

  // Clear input
  const handleClearInput = useCallback(() => {
    setInputValue("");
    setSliderValue(1000);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Fine tune slider value
  const handleFineTune = useCallback(
    (delta: number) => {
      setSliderValue((prev) =>
        Math.max(sliderRange.min, Math.min(sliderRange.max, prev + delta)),
      );
      Haptics.selectionAsync();
    },
    [sliderRange],
  );

  // Slider track width ref for touch calculations
  const sliderTrackWidth = useRef(SCREEN_WIDTH - MODERN_SPACING.md * 4);
  const sliderTrackRef = useRef<View>(null);

  // Pan responder for touch slider
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          // Calculate initial position from touch
          const touchX = evt.nativeEvent.locationX;
          const ratio = Math.max(
            0,
            Math.min(1, touchX / sliderTrackWidth.current),
          );
          const newValue = Math.round(
            sliderRange.min + ratio * (sliderRange.max - sliderRange.min),
          );
          setSliderValue(newValue);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (evt, gestureState) => {
          // Calculate value from drag position
          const startX = evt.nativeEvent.locationX - gestureState.dx;
          const currentX = startX + gestureState.dx;
          const ratio = Math.max(
            0,
            Math.min(1, currentX / sliderTrackWidth.current),
          );
          const newValue = Math.round(
            sliderRange.min + ratio * (sliderRange.max - sliderRange.min),
          );
          setSliderValue(newValue);
        },
        onPanResponderRelease: () => {
          Haptics.selectionAsync();
        },
      }),
    [sliderRange],
  );

  // Get ruler color based on type
  const getRulerColor = useCallback((type: RulerType): [string, string] => {
    switch (type) {
      case "522":
        return ["#0D9488", "#0D9488"];
      case "429":
        return ["#8b5cf6", "#7c3aed"];
      case "388":
        return ["#f59e0b", "#d97706"];
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={MODERN_COLORS.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerHan}>魯班尺</Text>
          <Text style={styles.headerText}>Thước Lỗ Ban</Text>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setSelectedCung(currentRuler.cung[0])}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={MODERN_COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ruler Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Chọn loại thước</Text>
          <View style={styles.rulerTypeRow}>
            {(Object.keys(RULERS) as RulerType[]).map((type) => {
              const ruler = RULERS[type];
              const colors = getRulerColor(type);
              const isActive = rulerType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.rulerTypeCard,
                    isActive && styles.rulerTypeCardActive,
                  ]}
                  onPress={() => handleRulerTypeChange(type)}
                >
                  <LinearGradient
                    colors={isActive ? colors : ["#f1f5f9", "#e2e8f0"]}
                    style={styles.rulerTypeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text
                      style={[
                        styles.rulerTypeLength,
                        isActive && styles.rulerTypeLengthActive,
                      ]}
                    >
                      {ruler.lengthMm / 10}cm
                    </Text>
                    <Text
                      style={[
                        styles.rulerTypeDesc,
                        isActive && styles.rulerTypeDescActive,
                      ]}
                      numberOfLines={2}
                    >
                      {ruler.description}
                    </Text>
                    <Text
                      style={[
                        styles.rulerTypeCung,
                        isActive && styles.rulerTypeCungActive,
                      ]}
                    >
                      {ruler.cungCount} cung
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dimension Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Loại kích thước</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typeRow}>
              {currentDimensionTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    dimensionType === type.id && styles.typeChipActive,
                  ]}
                  onPress={() => setDimensionType(type.id)}
                >
                  <Ionicons
                    name={type.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={
                      dimensionType === type.id
                        ? "#fff"
                        : MODERN_COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      dimensionType === type.id && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <View style={styles.inputHeader}>
            <Text style={styles.sectionTitle}>📐 Nhập kích thước</Text>
            <View style={styles.inputModeSelector}>
              {[
                {
                  mode: "text" as const,
                  icon: "keypad-outline",
                  label: "Nhập",
                },
                {
                  mode: "slider" as const,
                  icon: "options-outline",
                  label: "Kéo",
                },
                {
                  mode: "preset" as const,
                  icon: "flash-outline",
                  label: "Nhanh",
                },
              ].map(({ mode, icon, label }) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeButton,
                    inputMode === mode && styles.modeButtonActive,
                  ]}
                  onPress={() => setInputMode(mode)}
                >
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={
                      inputMode === mode ? "#fff" : MODERN_COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      inputMode === mode && styles.modeButtonTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Text Input Mode */}
          {inputMode === "text" && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={
                  currentDimensionTypes.find((t) => t.id === dimensionType)
                    ?.placeholder
                }
                placeholderTextColor={MODERN_COLORS.textSecondary}
                keyboardType="numeric"
              />
              <View style={styles.unitSelector}>
                {(["mm", "cm", "m"] as const).map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.unitButton,
                      unit === u && styles.unitButtonActive,
                    ]}
                    onPress={() => setUnit(u)}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === u && styles.unitTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {inputValue !== "" && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearInput}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={MODERN_COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Slider Input Mode */}
          {inputMode === "slider" && (
            <View style={styles.sliderContainer}>
              {/* Current Value Display */}
              <View style={styles.sliderValueDisplay}>
                <Text style={styles.sliderValueText}>{sliderValue}</Text>
                <Text style={styles.sliderValueUnit}>mm</Text>
                {result && (
                  <View
                    style={[
                      styles.sliderCungBadge,
                      { backgroundColor: result.cung.color },
                    ]}
                  >
                    <Text style={styles.sliderCungText}>
                      {result.cung.name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Visual Ruler Bar */}
              <View style={styles.rulerBarContainer}>
                <View style={styles.rulerBar}>
                  {currentRuler.cung.map((cung, idx) => (
                    <View
                      key={cung.id}
                      style={[
                        styles.rulerSegment,
                        { backgroundColor: cung.color + "40", flex: 1 },
                        result?.cung.id === cung.id && {
                          backgroundColor: cung.color,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rulerSegmentText,
                          result?.cung.id === cung.id && { color: "#fff" },
                        ]}
                      >
                        {cung.nameHan}
                      </Text>
                    </View>
                  ))}
                </View>
                <View
                  style={[
                    styles.rulerPointer,
                    {
                      left: `${((sliderValue % currentRuler.lengthMm) / currentRuler.lengthMm) * 100}%`,
                    },
                  ]}
                />
              </View>

              {/* Touch Slider - Kéo thả cảm ứng */}
              <View style={styles.touchSliderContainer}>
                <Text style={styles.touchSliderHint}>
                  👆 Chạm và kéo để điều chỉnh
                </Text>
                <View
                  ref={sliderTrackRef}
                  style={styles.touchSliderTrack}
                  onLayout={(e) => {
                    sliderTrackWidth.current = e.nativeEvent.layout.width;
                  }}
                  {...panResponder.panHandlers}
                >
                  {/* Background gradient showing cung colors */}
                  <View style={styles.touchSliderGradient}>
                    {currentRuler.cung.map((cung, idx) => (
                      <View
                        key={cung.id}
                        style={[
                          styles.touchSliderCungSegment,
                          { backgroundColor: cung.color + "30", flex: 1 },
                        ]}
                      />
                    ))}
                  </View>

                  {/* Filled track */}
                  <View
                    style={[
                      styles.touchSliderFill,
                      {
                        width: `${((sliderValue - sliderRange.min) / (sliderRange.max - sliderRange.min)) * 100}%`,
                        backgroundColor: result?.isGood ? "#22c55e" : "#ef4444",
                      },
                    ]}
                  />

                  {/* Thumb/Handle */}
                  <View
                    style={[
                      styles.touchSliderThumb,
                      {
                        left: `${((sliderValue - sliderRange.min) / (sliderRange.max - sliderRange.min)) * 100}%`,
                        backgroundColor: result?.isGood ? "#22c55e" : "#ef4444",
                      },
                    ]}
                  >
                    <View style={styles.touchSliderThumbInner} />
                  </View>
                </View>

                {/* Scale markers */}
                <View style={styles.scaleMarkers}>
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <View key={ratio} style={styles.scaleMarker}>
                      <View style={styles.scaleMarkerLine} />
                      <Text style={styles.scaleMarkerText}>
                        {Math.round(
                          sliderRange.min +
                            (sliderRange.max - sliderRange.min) * ratio,
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Quick Jump Buttons */}
              <View style={styles.quickJumpRow}>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const value = Math.round(
                    sliderRange.min +
                      (sliderRange.max - sliderRange.min) * ratio,
                  );
                  return (
                    <TouchableOpacity
                      key={ratio}
                      style={[
                        styles.quickJumpBtn,
                        sliderValue === value && styles.quickJumpBtnActive,
                      ]}
                      onPress={() => {
                        setSliderValue(value);
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text
                        style={[
                          styles.quickJumpText,
                          sliderValue === value && styles.quickJumpTextActive,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Range Labels */}
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>{sliderRange.min}mm</Text>
                <Text style={styles.sliderLabel}>{sliderRange.max}mm</Text>
              </View>

              {/* Fine Tune Buttons */}
              <View style={styles.fineTuneRow}>
                <TouchableOpacity
                  style={styles.fineTuneButton}
                  onPress={() => handleFineTune(-100)}
                >
                  <Text style={styles.fineTuneText}>-100</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fineTuneButton}
                  onPress={() => handleFineTune(-10)}
                >
                  <Text style={styles.fineTuneText}>-10</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fineTuneButton}
                  onPress={() => handleFineTune(-1)}
                >
                  <Text style={styles.fineTuneText}>-1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fineTuneButton, styles.fineTuneButtonAccent]}
                  onPress={() => handleFineTune(1)}
                >
                  <Text
                    style={[styles.fineTuneText, styles.fineTuneTextAccent]}
                  >
                    +1
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fineTuneButton, styles.fineTuneButtonAccent]}
                  onPress={() => handleFineTune(10)}
                >
                  <Text
                    style={[styles.fineTuneText, styles.fineTuneTextAccent]}
                  >
                    +10
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fineTuneButton, styles.fineTuneButtonAccent]}
                  onPress={() => handleFineTune(100)}
                >
                  <Text
                    style={[styles.fineTuneText, styles.fineTuneTextAccent]}
                  >
                    +100
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Preset Mode */}
          {inputMode === "preset" && (
            <View style={styles.presetContainer}>
              <Text style={styles.presetHint}>Chọn kích thước phổ biến:</Text>
              <View style={styles.presetGrid}>
                {currentPresets.map((preset, idx) => {
                  const presetResult = calculateLoBan(preset.value, rulerType);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.presetCard,
                        {
                          borderLeftColor: presetResult.isGood
                            ? "#22c55e"
                            : "#ef4444",
                        },
                      ]}
                      onPress={() => handlePresetSelect(preset.value)}
                    >
                      <View style={styles.presetHeader}>
                        <Text style={styles.presetLabel}>{preset.label}</Text>
                        <View
                          style={[
                            styles.presetCungBadge,
                            { backgroundColor: presetResult.cung.color },
                          ]}
                        >
                          <Text style={styles.presetCungText}>
                            {presetResult.cung.nameHan}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.presetValue}>{preset.value}mm</Text>
                      <Text style={styles.presetDesc}>{preset.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Formula display */}
          {sizeInMm > 0 && (
            <View style={styles.formulaBox}>
              <View style={styles.formulaHeader}>
                <Text style={styles.formulaText}>
                  Công thức: n × {currentRuler.lengthMm}mm + vị trí cung
                </Text>
                <TouchableOpacity
                  style={styles.saveHistoryBtn}
                  onPress={saveToHistory}
                >
                  <Ionicons
                    name="bookmark-outline"
                    size={18}
                    color={MODERN_COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.formulaCalc}>
                {Math.floor(sizeInMm / currentRuler.lengthMm)} ×{" "}
                {currentRuler.lengthMm} +{" "}
                {(sizeInMm % currentRuler.lengthMm).toFixed(1)} = {sizeInMm}mm
              </Text>
            </View>
          )}

          {/* History Section */}
          {measureHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>📜 Lịch sử đo gần đây</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.historyRow}>
                  {measureHistory.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.historyItem,
                        {
                          borderLeftColor: item.isGood ? "#22c55e" : "#ef4444",
                        },
                      ]}
                      onPress={() => {
                        setRulerType(item.ruler);
                        setInputMode("text");
                        setInputValue(item.size.toString());
                      }}
                    >
                      <Text style={styles.historySize}>{item.size}mm</Text>
                      <Text style={styles.historyCung}>{item.cung}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Result Section */}
        {result && (
          <View style={styles.resultSection}>
            <LinearGradient
              colors={
                result.isGood
                  ? ["#22c55e15", "#22c55e05"]
                  : ["#ef444415", "#ef444405"]
              }
              style={styles.resultCard}
            >
              <View style={styles.resultHeader}>
                <View
                  style={[
                    styles.resultCungIcon,
                    { backgroundColor: result.cung.color },
                  ]}
                >
                  <Text style={styles.resultCungHan}>
                    {result.cung.nameHan}
                  </Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultCungName}>{result.cung.name}</Text>
                  <Text style={styles.resultRuler}>
                    Thước {currentRuler.lengthMm / 10}cm
                  </Text>
                </View>
                <View
                  style={[
                    styles.resultBadge,
                    { backgroundColor: result.isGood ? "#22c55e" : "#ef4444" },
                  ]}
                >
                  <Ionicons
                    name={result.isGood ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.resultBadgeText}>
                    {result.isGood ? "CÁT" : "HUNG"}
                  </Text>
                </View>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.subCungInfo}>
                <Text style={styles.subCungLabel}>
                  Tiểu cung {result.position}:
                </Text>
                <Text style={styles.subCungName}>{result.subCung.name}</Text>
              </View>
              <Text style={styles.subCungMeaning}>
                "{result.subCung.meaning}"
              </Text>

              <View style={styles.resultDivider} />

              <Text style={styles.resultDescription}>
                📖 {result.cung.meaning}
              </Text>

              {!result.isGood && result.nearestGood && (
                <View style={styles.suggestSection}>
                  <Text style={styles.suggestTitle}>
                    💡 Gợi ý kích thước tốt gần nhất:
                  </Text>
                  <View style={styles.suggestButtons}>
                    <TouchableOpacity
                      style={styles.suggestButton}
                      onPress={() => handleSuggestSize(result.nearestGood!.min)}
                    >
                      <Text style={styles.suggestText}>
                        {result.nearestGood.min}mm
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.suggestTo}>đến</Text>
                    <TouchableOpacity
                      style={styles.suggestButton}
                      onPress={() => handleSuggestSize(result.nearestGood!.max)}
                    >
                      <Text style={styles.suggestText}>
                        {result.nearestGood.max}mm
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Cung Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🧭 Bảng {currentRuler.cungCount} Cung - Thước{" "}
            {currentRuler.lengthMm / 10}cm
          </Text>
          <View style={styles.cungGrid}>
            {currentRuler.cung.map((cung) => (
              <CungCard
                key={cung.id}
                cung={cung}
                isActive={result?.cung.id === cung.id}
                isCompact={currentRuler.cungCount === 10}
                onPress={() => setSelectedCung(cung)}
              />
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Hướng dẫn sử dụng</Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "600", color: "#0D9488" }}>
              Thước 52.2cm:
            </Text>{" "}
            Đo khoảng thông thủy (lọt lòng) như cửa chính, cửa sổ, giếng trời, ô
            thoáng...
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "600", color: "#8b5cf6" }}>
              Thước 42.9cm:
            </Text>{" "}
            Đo khối đặc (phủ bì) như giường, tủ, bàn, bệ, bậc thang...
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "600", color: "#f59e0b" }}>
              Thước 38.8cm:
            </Text>{" "}
            Đo âm trạch như mộ phần, bàn thờ, tiểu quách...
          </Text>
          <View style={styles.infoLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#22c55e" }]}
              />
              <Text style={styles.legendText}>Cung Cát (Tốt) - Nên dùng</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#ef4444" }]}
              />
              <Text style={styles.legendText}>Cung Hung (Xấu) - Nên tránh</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cung Detail Modal */}
      {selectedCung && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCung(null)}
        >
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: selectedCung.color },
              ]}
            >
              <Text style={styles.modalHan}>{selectedCung.nameHan}</Text>
              <Text style={styles.modalName}>{selectedCung.name}</Text>
              <View
                style={[
                  styles.modalBadge,
                  {
                    backgroundColor:
                      selectedCung.type === "good" ? "#ffffff40" : "#ffffff40",
                  },
                ]}
              >
                <Text style={styles.modalBadgeText}>
                  {selectedCung.type === "good" ? "CÁT - Tốt" : "HUNG - Xấu"}
                </Text>
              </View>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalMeaning}>{selectedCung.meaning}</Text>
              <View style={styles.modalDivider} />
              <Text style={styles.modalSubTitle}>
                {selectedCung.subCung.length} Tiểu cung:
              </Text>
              {selectedCung.subCung.map((sub, idx) => (
                <View key={idx} style={styles.modalSubItem}>
                  <View
                    style={[
                      styles.modalSubNumber,
                      { backgroundColor: selectedCung.color },
                    ]}
                  >
                    <Text style={styles.modalSubNumberText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.modalSubContent}>
                    <Text style={styles.modalSubName}>{sub.name}</Text>
                    <Text style={styles.modalSubMeaning}>{sub.meaning}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedCung(null)}
            >
              <Text style={styles.modalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    alignItems: "center",
  },
  headerHan: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  headerText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: MODERN_SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },

  // Ruler Type Selector
  rulerTypeRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  rulerTypeCard: {
    flex: 1,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  rulerTypeCardActive: {
    borderColor: MODERN_COLORS.primary,
  },
  rulerTypeGradient: {
    padding: MODERN_SPACING.sm,
    alignItems: "center",
    minHeight: 90,
  },
  rulerTypeLength: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textSecondary,
  },
  rulerTypeLengthActive: {
    color: "#fff",
  },
  rulerTypeDesc: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  rulerTypeDescActive: {
    color: "#ffffffcc",
  },
  rulerTypeCung: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
  },
  rulerTypeCungActive: {
    color: "#fff",
  },

  // Dimension Type
  typeRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  typeChipText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },
  typeChipTextActive: {
    color: "#fff",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  unitSelector: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: 4,
  },
  unitButton: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
  },
  unitButtonActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  unitTextActive: {
    color: "#fff",
  },
  formulaBox: {
    backgroundColor: MODERN_COLORS.surface,
    padding: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    marginTop: MODERN_SPACING.sm,
  },
  formulaText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    fontStyle: "italic",
  },
  formulaCalc: {
    fontSize: 13,
    color: MODERN_COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
  },

  // Result
  resultSection: {
    paddingHorizontal: MODERN_SPACING.md,
  },
  resultCard: {
    borderRadius: MODERN_RADIUS.xl,
    padding: MODERN_SPACING.lg,
    ...MODERN_SHADOWS.md,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  resultCungIcon: {
    width: 56,
    height: 56,
    borderRadius: MODERN_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  resultCungHan: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  resultInfo: {
    flex: 1,
  },
  resultCungName: {
    fontSize: 22,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  resultRuler: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  resultBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  resultDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginVertical: MODERN_SPACING.md,
  },
  subCungInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  subCungLabel: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  subCungName: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  subCungMeaning: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: MODERN_COLORS.textPrimary,
    lineHeight: 22,
  },
  suggestSection: {
    marginTop: MODERN_SPACING.md,
    padding: MODERN_SPACING.md,
    backgroundColor: "#22c55e15",
    borderRadius: MODERN_RADIUS.md,
  },
  suggestTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22c55e",
    marginBottom: MODERN_SPACING.sm,
  },
  suggestButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  suggestButton: {
    backgroundColor: "#22c55e",
    paddingVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
  },
  suggestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  suggestTo: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },

  // Cung Grid
  cungGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  cungCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 3) / 4,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.sm,
    alignItems: "center",
  },
  cungCardCompact: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 4) / 5,
    padding: MODERN_SPACING.xs,
  },
  cungIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cungHan: {
    fontSize: 18,
    fontWeight: "700",
  },
  cungName: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  cungBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cungBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
  },

  // Info Section
  infoSection: {
    margin: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: MODERN_SPACING.sm,
  },
  infoLegend: {
    marginTop: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: MODERN_SPACING.lg,
  },
  modalContent: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.xl,
    width: "100%",
    maxWidth: 360,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: MODERN_SPACING.lg,
    alignItems: "center",
  },
  modalHan: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
  modalName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  modalBadge: {
    marginTop: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  modalBody: {
    padding: MODERN_SPACING.md,
    maxHeight: 300,
  },
  modalMeaning: {
    fontSize: 14,
    color: MODERN_COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 22,
  },
  modalDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginVertical: MODERN_SPACING.md,
  },
  modalSubTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },
  modalSubItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    gap: MODERN_SPACING.sm,
  },
  modalSubNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  modalSubContent: {
    flex: 1,
  },
  modalSubName: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  modalSubMeaning: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  modalClose: {
    padding: MODERN_SPACING.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },

  // Input Header with Mode Selector
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  inputModeSelector: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: 3,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.md,
    gap: 4,
  },
  modeButtonActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  modeButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  clearButton: {
    position: "absolute",
    right: 110,
    top: 14,
  },

  // Slider Container
  sliderContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
  },
  sliderValueDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  sliderValueText: {
    fontSize: 36,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  sliderValueUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  sliderCungBadge: {
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
    marginLeft: MODERN_SPACING.sm,
  },
  sliderCungText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  // Ruler Bar
  rulerBarContainer: {
    marginBottom: MODERN_SPACING.sm,
    position: "relative",
  },
  rulerBar: {
    flexDirection: "row",
    height: 32,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
  },
  rulerSegment: {
    alignItems: "center",
    justifyContent: "center",
  },
  rulerSegmentText: {
    fontSize: 10,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  rulerPointer: {
    position: "absolute",
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: MODERN_COLORS.primary,
    marginLeft: -6,
  },

  // Slider
  slider: {
    width: "100%",
    height: 40,
  },
  customSliderContainer: {
    marginVertical: MODERN_SPACING.sm,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: MODERN_COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  quickJumpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  quickJumpBtn: {
    flex: 1,
    paddingVertical: MODERN_SPACING.xs,
    paddingHorizontal: MODERN_SPACING.xs,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    alignItems: "center",
  },
  quickJumpBtnActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  quickJumpText: {
    fontSize: 10,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  quickJumpTextActive: {
    color: "#fff",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: MODERN_SPACING.xs,
  },
  sliderLabel: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
  },

  // Touch Slider - Kéo thả cảm ứng
  touchSliderContainer: {
    marginVertical: MODERN_SPACING.md,
  },
  touchSliderHint: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  touchSliderTrack: {
    height: 48,
    backgroundColor: MODERN_COLORS.border,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "visible",
    position: "relative",
  },
  touchSliderGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
  },
  touchSliderCungSegment: {
    height: "100%",
  },
  touchSliderFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: MODERN_RADIUS.lg,
    opacity: 0.8,
  },
  touchSliderThumb: {
    position: "absolute",
    top: -4,
    width: 28,
    height: 56,
    borderRadius: 14,
    marginLeft: -14,
    justifyContent: "center",
    alignItems: "center",
    ...MODERN_SHADOWS.lg,
    borderWidth: 3,
    borderColor: "#fff",
  },
  touchSliderThumbInner: {
    width: 4,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  scaleMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: MODERN_SPACING.xs,
    paddingHorizontal: 2,
  },
  scaleMarker: {
    alignItems: "center",
  },
  scaleMarkerLine: {
    width: 1,
    height: 6,
    backgroundColor: MODERN_COLORS.border,
  },
  scaleMarkerText: {
    fontSize: 9,
    color: MODERN_COLORS.textTertiary,
    marginTop: 2,
  },

  // Fine Tune
  fineTuneRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: MODERN_SPACING.xs,
    marginTop: MODERN_SPACING.md,
  },
  fineTuneButton: {
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },
  fineTuneButtonAccent: {
    backgroundColor: MODERN_COLORS.primary + "15",
    borderColor: MODERN_COLORS.primary,
  },
  fineTuneText: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  fineTuneTextAccent: {
    color: MODERN_COLORS.primary,
  },

  // Preset
  presetContainer: {
    marginTop: MODERN_SPACING.xs,
  },
  presetHint: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  presetCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 2) / 3,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.sm,
    borderLeftWidth: 3,
  },
  presetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    flex: 1,
  },
  presetCungBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  presetCungText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },
  presetValue: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  presetDesc: {
    fontSize: 9,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  // Formula
  formulaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveHistoryBtn: {
    padding: 4,
  },

  // History
  historySection: {
    marginTop: MODERN_SPACING.md,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },
  historyRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  historyItem: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    borderLeftWidth: 3,
    minWidth: 80,
  },
  historySize: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  historyCung: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
  },
});
