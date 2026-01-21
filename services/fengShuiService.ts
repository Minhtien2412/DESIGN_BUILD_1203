/**
 * Feng Shui Service - Dịch vụ Phong Thủy AI
 * Tính toán phong thủy, xem tuổi, xem hướng nhà với AI
 * Tích hợp ChatGPT API cho tư vấn phong thủy thực
 * @author AI Assistant
 * @date 14/01/2026
 */

import { ChatGPTMessage, chatGPTService } from "./api/chatGPTService";
import { geminiService } from "./api/geminiService";

// ==================== TYPES ====================

export interface FengShuiPerson {
  birthYear: number;
  gender: "male" | "female";
  name?: string;
}

export interface FengShuiResult {
  // Thông tin cơ bản
  birthYear: number;
  canChi: string; // Can Chi (VD: Canh Thân)
  zodiac: string; // Con giáp (VD: Thân - Khỉ)
  element: string; // Ngũ hành mệnh (VD: Kim)
  napAm: string; // Nạp âm (VD: Thạch Lựu Mộc)

  // Cung mệnh & hướng
  cungMenh: string; // Cung mệnh theo Bát Trạch
  luckyDirections: DirectionInfo[];
  unluckyDirections: DirectionInfo[];

  // Màu sắc & vật phẩm
  luckyColors: string[];
  unluckyColors: string[];
  luckyNumbers: number[];
  luckyItems: string[];

  // Tương hợp
  compatibleElements: string[];
  incompatibleElements: string[];
  compatibleZodiacs: string[];
  incompatibleZodiacs: string[];
}

export interface DirectionInfo {
  name: string;
  direction: string; // Bắc, Nam, Đông, Tây, ...
  element: string;
  rating: number; // 1-5
  meaning: string; // Sinh khí, Thiên y, Diên niên, ...
  usage: string[]; // Dùng cho: Phòng ngủ, Bếp, Cửa chính, ...
}

export interface HouseAnalysis {
  direction: string;
  personElement: string;
  houseElement: string;
  compatibility: "excellent" | "good" | "neutral" | "bad" | "very_bad";
  score: number;
  analysis: string;
  suggestions: string[];
  roomPlacements: RoomPlacement[];
}

export interface RoomPlacement {
  room: string;
  suggestedDirection: string;
  reason: string;
  rating: number;
}

export interface CoupleCompatibility {
  person1: FengShuiResult;
  person2: FengShuiResult;
  overallScore: number;
  elementCompatibility: number;
  zodiacCompatibility: number;
  cungMenhCompatibility: number;
  analysis: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
}

// ==================== CAN CHI DATA ====================

const THIEN_CAN = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
];
const DIA_CHI = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
];
const ZODIAC_NAMES = [
  "Chuột",
  "Trâu",
  "Hổ",
  "Mèo",
  "Rồng",
  "Rắn",
  "Ngựa",
  "Dê",
  "Khỉ",
  "Gà",
  "Chó",
  "Lợn",
];

// Ngũ hành theo Can
const CAN_ELEMENT: Record<string, string> = {
  Giáp: "Mộc",
  Ất: "Mộc",
  Bính: "Hỏa",
  Đinh: "Hỏa",
  Mậu: "Thổ",
  Kỷ: "Thổ",
  Canh: "Kim",
  Tân: "Kim",
  Nhâm: "Thủy",
  Quý: "Thủy",
};

// Nạp âm 60 năm
const NAP_AM: Record<string, string> = {
  "Giáp Tý": "Hải Trung Kim",
  "Ất Sửu": "Hải Trung Kim",
  "Bính Dần": "Lư Trung Hỏa",
  "Đinh Mão": "Lư Trung Hỏa",
  "Mậu Thìn": "Đại Lâm Mộc",
  "Kỷ Tỵ": "Đại Lâm Mộc",
  "Canh Ngọ": "Lộ Bàng Thổ",
  "Tân Mùi": "Lộ Bàng Thổ",
  "Nhâm Thân": "Kiếm Phong Kim",
  "Quý Dậu": "Kiếm Phong Kim",
  "Giáp Tuất": "Sơn Đầu Hỏa",
  "Ất Hợi": "Sơn Đầu Hỏa",
  "Bính Tý": "Giản Hạ Thủy",
  "Đinh Sửu": "Giản Hạ Thủy",
  "Mậu Dần": "Thành Đầu Thổ",
  "Kỷ Mão": "Thành Đầu Thổ",
  "Canh Thìn": "Bạch Lạp Kim",
  "Tân Tỵ": "Bạch Lạp Kim",
  "Nhâm Ngọ": "Dương Liễu Mộc",
  "Quý Mùi": "Dương Liễu Mộc",
  "Giáp Thân": "Tuyền Trung Thủy",
  "Ất Dậu": "Tuyền Trung Thủy",
  "Bính Tuất": "Ốc Thượng Thổ",
  "Đinh Hợi": "Ốc Thượng Thổ",
  "Mậu Tý": "Tích Lịch Hỏa",
  "Kỷ Sửu": "Tích Lịch Hỏa",
  "Canh Dần": "Tùng Bách Mộc",
  "Tân Mão": "Tùng Bách Mộc",
  "Nhâm Thìn": "Trường Lưu Thủy",
  "Quý Tỵ": "Trường Lưu Thủy",
  "Giáp Ngọ": "Sa Trung Kim",
  "Ất Mùi": "Sa Trung Kim",
  "Bính Thân": "Sơn Hạ Hỏa",
  "Đinh Dậu": "Sơn Hạ Hỏa",
  "Mậu Tuất": "Bình Địa Mộc",
  "Kỷ Hợi": "Bình Địa Mộc",
  "Canh Tý": "Bích Thượng Thổ",
  "Tân Sửu": "Bích Thượng Thổ",
  "Nhâm Dần": "Kim Bạch Kim",
  "Quý Mão": "Kim Bạch Kim",
  "Giáp Thìn": "Phú Đăng Hỏa",
  "Ất Tỵ": "Phú Đăng Hỏa",
  "Bính Ngọ": "Thiên Hà Thủy",
  "Đinh Mùi": "Thiên Hà Thủy",
  "Mậu Thân": "Đại Trạch Thổ",
  "Kỷ Dậu": "Đại Trạch Thổ",
  "Canh Tuất": "Thoa Xuyến Kim",
  "Tân Hợi": "Thoa Xuyến Kim",
  "Nhâm Tý": "Tang Đố Mộc",
  "Quý Sửu": "Tang Đố Mộc",
  "Giáp Dần": "Đại Khê Thủy",
  "Ất Mão": "Đại Khê Thủy",
  "Bính Thìn": "Sa Trung Thổ",
  "Đinh Tỵ": "Sa Trung Thổ",
  "Mậu Ngọ": "Thiên Thượng Hỏa",
  "Kỷ Mùi": "Thiên Thượng Hỏa",
  "Canh Thân": "Thạch Lựu Mộc",
  "Tân Dậu": "Thạch Lựu Mộc",
  "Nhâm Tuất": "Đại Hải Thủy",
  "Quý Hợi": "Đại Hải Thủy",
};

// Ngũ hành của Nạp âm
const NAP_AM_ELEMENT: Record<string, string> = {
  "Hải Trung Kim": "Kim",
  "Kiếm Phong Kim": "Kim",
  "Bạch Lạp Kim": "Kim",
  "Sa Trung Kim": "Kim",
  "Kim Bạch Kim": "Kim",
  "Thoa Xuyến Kim": "Kim",

  "Giản Hạ Thủy": "Thủy",
  "Tuyền Trung Thủy": "Thủy",
  "Trường Lưu Thủy": "Thủy",
  "Thiên Hà Thủy": "Thủy",
  "Đại Khê Thủy": "Thủy",
  "Đại Hải Thủy": "Thủy",

  "Lư Trung Hỏa": "Hỏa",
  "Sơn Đầu Hỏa": "Hỏa",
  "Tích Lịch Hỏa": "Hỏa",
  "Sơn Hạ Hỏa": "Hỏa",
  "Phú Đăng Hỏa": "Hỏa",
  "Thiên Thượng Hỏa": "Hỏa",

  "Đại Lâm Mộc": "Mộc",
  "Dương Liễu Mộc": "Mộc",
  "Tùng Bách Mộc": "Mộc",
  "Bình Địa Mộc": "Mộc",
  "Tang Đố Mộc": "Mộc",
  "Thạch Lựu Mộc": "Mộc",

  "Lộ Bàng Thổ": "Thổ",
  "Thành Đầu Thổ": "Thổ",
  "Ốc Thượng Thổ": "Thổ",
  "Bích Thượng Thổ": "Thổ",
  "Đại Trạch Thổ": "Thổ",
  "Sa Trung Thổ": "Thổ",
};

// Bát Trạch - Cung mệnh theo năm sinh và giới tính
const BAT_TRAI_CUNG: Record<string, string[]> = {
  Khảm: ["Bắc"],
  Ly: ["Nam"],
  Chấn: ["Đông"],
  Đoài: ["Tây"],
  Khôn: ["Tây Nam"],
  Cấn: ["Đông Bắc"],
  Càn: ["Tây Bắc"],
  Tốn: ["Đông Nam"],
};

// Đông Tứ Mệnh và Tây Tứ Mệnh
const DONG_TU_MENH = ["Khảm", "Ly", "Chấn", "Tốn"];
const TAY_TU_MENH = ["Càn", "Khôn", "Cấn", "Đoài"];

// Hướng tốt/xấu theo Cung mệnh (Bát Trạch)
const BAT_TRAI_DIRECTIONS: Record<
  string,
  { lucky: DirectionInfo[]; unlucky: DirectionInfo[] }
> = {
  Khảm: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 5,
        meaning: "Phát tài, may mắn",
        usage: ["Phòng khách", "Cửa chính", "Phòng làm việc"],
      },
      {
        name: "Thiên y",
        direction: "Đông",
        element: "Mộc",
        rating: 4,
        meaning: "Sức khỏe, quý nhân",
        usage: ["Phòng ngủ gia chủ", "Phòng bệnh nhân"],
      },
      {
        name: "Diên niên",
        direction: "Nam",
        element: "Hỏa",
        rating: 4,
        meaning: "Hòa hợp, bền vững",
        usage: ["Phòng ngủ vợ chồng", "Phòng khách"],
      },
      {
        name: "Phục vị",
        direction: "Bắc",
        element: "Thủy",
        rating: 3,
        meaning: "Ổn định, bình an",
        usage: ["Phòng ngủ", "Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Tây",
        element: "Kim",
        rating: 2,
        meaning: "Tiểu hung, tranh cãi",
        usage: ["Nhà vệ sinh", "Kho"],
      },
      {
        name: "Lục sát",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 2,
        meaning: "Xung đột, bệnh tật",
        usage: ["Nhà kho", "Nhà vệ sinh"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 1,
        meaning: "Đại hung, tai họa",
        usage: ["Tránh dùng"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 1,
        meaning: "Cực hung, tuyệt tự",
        usage: ["Tránh dùng"],
      },
    ],
  },
  Ly: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Đông",
        element: "Mộc",
        rating: 5,
        meaning: "Phát tài, may mắn",
        usage: ["Phòng khách", "Cửa chính"],
      },
      {
        name: "Thiên y",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 4,
        meaning: "Sức khỏe, quý nhân",
        usage: ["Phòng ngủ gia chủ"],
      },
      {
        name: "Diên niên",
        direction: "Bắc",
        element: "Thủy",
        rating: 4,
        meaning: "Hòa hợp, bền vững",
        usage: ["Phòng ngủ vợ chồng"],
      },
      {
        name: "Phục vị",
        direction: "Nam",
        element: "Hỏa",
        rating: 3,
        meaning: "Ổn định",
        usage: ["Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 2,
        meaning: "Tiểu hung",
        usage: ["Nhà vệ sinh"],
      },
      {
        name: "Lục sát",
        direction: "Tây",
        element: "Kim",
        rating: 2,
        meaning: "Xung đột",
        usage: ["Kho"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 1,
        meaning: "Đại hung",
        usage: ["Tránh"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 1,
        meaning: "Cực hung",
        usage: ["Tránh"],
      },
    ],
  },
  Chấn: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Nam",
        element: "Hỏa",
        rating: 5,
        meaning: "Phát tài",
        usage: ["Cửa chính", "Phòng khách"],
      },
      {
        name: "Thiên y",
        direction: "Bắc",
        element: "Thủy",
        rating: 4,
        meaning: "Sức khỏe",
        usage: ["Phòng ngủ"],
      },
      {
        name: "Diên niên",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 4,
        meaning: "Hòa hợp",
        usage: ["Phòng ngủ vợ chồng"],
      },
      {
        name: "Phục vị",
        direction: "Đông",
        element: "Mộc",
        rating: 3,
        meaning: "Ổn định",
        usage: ["Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 2,
        meaning: "Tiểu hung",
        usage: ["WC"],
      },
      {
        name: "Lục sát",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 2,
        meaning: "Xung đột",
        usage: ["Kho"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 1,
        meaning: "Đại hung",
        usage: ["Tránh"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Tây",
        element: "Kim",
        rating: 1,
        meaning: "Cực hung",
        usage: ["Tránh"],
      },
    ],
  },
  Tốn: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Bắc",
        element: "Thủy",
        rating: 5,
        meaning: "Phát tài",
        usage: ["Cửa chính"],
      },
      {
        name: "Thiên y",
        direction: "Nam",
        element: "Hỏa",
        rating: 4,
        meaning: "Sức khỏe",
        usage: ["Phòng ngủ"],
      },
      {
        name: "Diên niên",
        direction: "Đông",
        element: "Mộc",
        rating: 4,
        meaning: "Hòa hợp",
        usage: ["Phòng vợ chồng"],
      },
      {
        name: "Phục vị",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 3,
        meaning: "Ổn định",
        usage: ["Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 2,
        meaning: "Tiểu hung",
        usage: ["WC"],
      },
      {
        name: "Lục sát",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 2,
        meaning: "Xung đột",
        usage: ["Kho"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Tây",
        element: "Kim",
        rating: 1,
        meaning: "Đại hung",
        usage: ["Tránh"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 1,
        meaning: "Cực hung",
        usage: ["Tránh"],
      },
    ],
  },
  Càn: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Tây",
        element: "Kim",
        rating: 5,
        meaning: "Phát tài",
        usage: ["Cửa chính"],
      },
      {
        name: "Thiên y",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 4,
        meaning: "Sức khỏe",
        usage: ["Phòng ngủ"],
      },
      {
        name: "Diên niên",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 4,
        meaning: "Hòa hợp",
        usage: ["Phòng vợ chồng"],
      },
      {
        name: "Phục vị",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 3,
        meaning: "Ổn định",
        usage: ["Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 2,
        meaning: "Tiểu hung",
        usage: ["WC"],
      },
      {
        name: "Lục sát",
        direction: "Bắc",
        element: "Thủy",
        rating: 2,
        meaning: "Xung đột",
        usage: ["Kho"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Đông",
        element: "Mộc",
        rating: 1,
        meaning: "Đại hung",
        usage: ["Tránh"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Nam",
        element: "Hỏa",
        rating: 1,
        meaning: "Cực hung",
        usage: ["Tránh"],
      },
    ],
  },
  Khôn: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 5,
        meaning: "Phát tài",
        usage: ["Cửa chính"],
      },
      {
        name: "Thiên y",
        direction: "Tây",
        element: "Kim",
        rating: 4,
        meaning: "Sức khỏe",
        usage: ["Phòng ngủ"],
      },
      {
        name: "Diên niên",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 4,
        meaning: "Hòa hợp",
        usage: ["Phòng vợ chồng"],
      },
      {
        name: "Phục vị",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 3,
        meaning: "Ổn định",
        usage: ["Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Đông",
        element: "Mộc",
        rating: 2,
        meaning: "Tiểu hung",
        usage: ["WC"],
      },
      {
        name: "Lục sát",
        direction: "Nam",
        element: "Hỏa",
        rating: 2,
        meaning: "Xung đột",
        usage: ["Kho"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Bắc",
        element: "Thủy",
        rating: 1,
        meaning: "Đại hung",
        usage: ["Tránh"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 1,
        meaning: "Cực hung",
        usage: ["Tránh"],
      },
    ],
  },
  Cấn: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 5,
        meaning: "Phát tài",
        usage: ["Cửa chính"],
      },
      {
        name: "Thiên y",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 4,
        meaning: "Sức khỏe",
        usage: ["Phòng ngủ"],
      },
      {
        name: "Diên niên",
        direction: "Tây",
        element: "Kim",
        rating: 4,
        meaning: "Hòa hợp",
        usage: ["Phòng vợ chồng"],
      },
      {
        name: "Phục vị",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 3,
        meaning: "Ổn định",
        usage: ["Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Nam",
        element: "Hỏa",
        rating: 2,
        meaning: "Tiểu hung",
        usage: ["WC"],
      },
      {
        name: "Lục sát",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 2,
        meaning: "Xung đột",
        usage: ["Kho"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Đông",
        element: "Mộc",
        rating: 1,
        meaning: "Đại hung",
        usage: ["Tránh"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Bắc",
        element: "Thủy",
        rating: 1,
        meaning: "Cực hung",
        usage: ["Tránh"],
      },
    ],
  },
  Đoài: {
    lucky: [
      {
        name: "Sinh khí",
        direction: "Tây Bắc",
        element: "Kim",
        rating: 5,
        meaning: "Phát tài",
        usage: ["Cửa chính"],
      },
      {
        name: "Thiên y",
        direction: "Tây Nam",
        element: "Thổ",
        rating: 4,
        meaning: "Sức khỏe",
        usage: ["Phòng ngủ"],
      },
      {
        name: "Diên niên",
        direction: "Đông Bắc",
        element: "Thổ",
        rating: 4,
        meaning: "Hòa hợp",
        usage: ["Phòng vợ chồng"],
      },
      {
        name: "Phục vị",
        direction: "Tây",
        element: "Kim",
        rating: 3,
        meaning: "Ổn định",
        usage: ["Phòng thờ"],
      },
    ],
    unlucky: [
      {
        name: "Họa hại",
        direction: "Bắc",
        element: "Thủy",
        rating: 2,
        meaning: "Tiểu hung",
        usage: ["WC"],
      },
      {
        name: "Lục sát",
        direction: "Đông",
        element: "Mộc",
        rating: 2,
        meaning: "Xung đột",
        usage: ["Kho"],
      },
      {
        name: "Ngũ quỷ",
        direction: "Đông Nam",
        element: "Mộc",
        rating: 1,
        meaning: "Đại hung",
        usage: ["Tránh"],
      },
      {
        name: "Tuyệt mệnh",
        direction: "Nam",
        element: "Hỏa",
        rating: 1,
        meaning: "Cực hung",
        usage: ["Tránh"],
      },
    ],
  },
};

// Màu sắc may mắn theo ngũ hành
const LUCKY_COLORS: Record<string, string[]> = {
  Kim: ["Trắng", "Bạc", "Vàng nhạt", "Xám"],
  Mộc: ["Xanh lá", "Xanh lam", "Đen"],
  Thủy: ["Đen", "Xanh dương", "Xanh lam", "Tím đen"],
  Hỏa: ["Đỏ", "Cam", "Tím", "Hồng"],
  Thổ: ["Vàng", "Nâu", "Cam đất", "Be"],
};

// Tương sinh
const TUONG_SINH: Record<string, string> = {
  Kim: "Thủy",
  Thủy: "Mộc",
  Mộc: "Hỏa",
  Hỏa: "Thổ",
  Thổ: "Kim",
};

// Tương khắc
const TUONG_KHAC: Record<string, string> = {
  Kim: "Mộc",
  Mộc: "Thổ",
  Thổ: "Thủy",
  Thủy: "Hỏa",
  Hỏa: "Kim",
};

// Con giáp tương hợp/xung khắc
const ZODIAC_COMPAT: Record<string, { good: string[]; bad: string[] }> = {
  Tý: { good: ["Thìn", "Thân", "Sửu"], bad: ["Ngọ", "Mão", "Mùi"] },
  Sửu: { good: ["Tỵ", "Dậu", "Tý"], bad: ["Mùi", "Ngọ", "Tuất"] },
  Dần: { good: ["Ngọ", "Tuất", "Hợi"], bad: ["Thân", "Tỵ", "Thìn"] },
  Mão: { good: ["Mùi", "Hợi", "Tuất"], bad: ["Dậu", "Tý", "Thìn"] },
  Thìn: { good: ["Tý", "Thân", "Dậu"], bad: ["Tuất", "Mão", "Dần"] },
  Tỵ: { good: ["Dậu", "Sửu", "Thân"], bad: ["Hợi", "Dần", "Thân"] },
  Ngọ: { good: ["Dần", "Tuất", "Mùi"], bad: ["Tý", "Sửu", "Mão"] },
  Mùi: { good: ["Mão", "Hợi", "Ngọ"], bad: ["Sửu", "Tuất", "Tý"] },
  Thân: { good: ["Tý", "Thìn", "Tỵ"], bad: ["Dần", "Hợi", "Tỵ"] },
  Dậu: { good: ["Tỵ", "Sửu", "Thìn"], bad: ["Mão", "Tuất", "Dậu"] },
  Tuất: { good: ["Dần", "Ngọ", "Mão"], bad: ["Thìn", "Mùi", "Sửu"] },
  Hợi: { good: ["Mão", "Mùi", "Dần"], bad: ["Tỵ", "Thân", "Hợi"] },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Tính Can Chi từ năm sinh
 */
export function getCanChi(year: number): {
  can: string;
  chi: string;
  canChi: string;
} {
  const canIndex = (year - 4) % 10;
  const chiIndex = (year - 4) % 12;
  const can = THIEN_CAN[canIndex >= 0 ? canIndex : canIndex + 10];
  const chi = DIA_CHI[chiIndex >= 0 ? chiIndex : chiIndex + 12];
  return { can, chi, canChi: `${can} ${chi}` };
}

/**
 * Lấy con giáp từ năm sinh
 */
export function getZodiac(year: number): { chi: string; name: string } {
  const chiIndex = (year - 4) % 12;
  const chi = DIA_CHI[chiIndex >= 0 ? chiIndex : chiIndex + 12];
  const nameIndex = DIA_CHI.indexOf(chi);
  return { chi, name: ZODIAC_NAMES[nameIndex] };
}

/**
 * Lấy Nạp Âm từ Can Chi
 */
export function getNapAm(canChi: string): string {
  return NAP_AM[canChi] || "Không xác định";
}

/**
 * Lấy ngũ hành của Nạp Âm
 */
export function getNapAmElement(napAm: string): string {
  return NAP_AM_ELEMENT[napAm] || "Không xác định";
}

/**
 * Tính Cung Mệnh theo Bát Trạch
 * Công thức:
 * - Nam: (100 - năm sinh) % 9
 * - Nữ: (năm sinh - 4) % 9
 */
export function getCungMenh(year: number, gender: "male" | "female"): string {
  const lastTwoDigits = year % 100;
  let cungNumber: number;

  if (gender === "male") {
    cungNumber = (100 - lastTwoDigits) % 9;
    if (cungNumber === 0) cungNumber = 9;
  } else {
    cungNumber = (lastTwoDigits - 4) % 9;
    if (cungNumber === 0) cungNumber = 9;
  }

  const cungMapping: Record<number, string> = {
    1: "Khảm",
    2: "Khôn",
    3: "Chấn",
    4: "Tốn",
    5: gender === "male" ? "Khôn" : "Cấn", // Số 5 đặc biệt
    6: "Càn",
    7: "Đoài",
    8: "Cấn",
    9: "Ly",
  };

  return cungMapping[cungNumber] || "Khảm";
}

/**
 * Tính số may mắn theo ngũ hành
 */
export function getLuckyNumbers(element: string): number[] {
  const mapping: Record<string, number[]> = {
    Kim: [4, 9, 14, 19],
    Mộc: [3, 8, 13, 18],
    Thủy: [1, 6, 11, 16],
    Hỏa: [2, 7, 12, 17],
    Thổ: [5, 10, 15, 20],
  };
  return mapping[element] || [];
}

/**
 * Lấy vật phẩm may mắn theo ngũ hành
 */
export function getLuckyItems(element: string): string[] {
  const mapping: Record<string, string[]> = {
    Kim: [
      "Đồ trang sức kim loại",
      "Đá quý",
      "Chuông gió",
      "Tượng kim loại",
      "Đồng hồ kim loại",
    ],
    Mộc: ["Cây xanh", "Đồ gỗ", "Tranh hoa lá", "Sách", "Đồ thủ công mây tre"],
    Thủy: [
      "Bể cá",
      "Tranh phong cảnh biển",
      "Đài phun nước",
      "Gương",
      "Đồ pha lê",
    ],
    Hỏa: ["Đèn", "Nến", "Tranh mặt trời", "Đồ vật màu đỏ", "Tượng ngựa"],
    Thổ: [
      "Đồ gốm sứ",
      "Đá tự nhiên",
      "Tranh núi",
      "Tượng đất nung",
      "Bình hoa gốm",
    ],
  };
  return mapping[element] || [];
}

/**
 * Lấy các hành tương sinh/tương khắc
 */
export function getElementRelations(element: string): {
  compatible: string[];
  incompatible: string[];
  generates: string;
  generatedBy: string;
  overcomes: string;
  overcomedBy: string;
} {
  const generates = TUONG_SINH[element];
  const overcomes = TUONG_KHAC[element];

  // Tìm hành sinh ra mình
  const generatedBy =
    Object.entries(TUONG_SINH).find(([_, v]) => v === element)?.[0] || "";
  // Tìm hành khắc mình
  const overcomedBy =
    Object.entries(TUONG_KHAC).find(([_, v]) => v === element)?.[0] || "";

  return {
    compatible: [generatedBy, generates], // Sinh mình và mình sinh
    incompatible: [overcomedBy, overcomes], // Khắc mình và mình khắc
    generates,
    generatedBy,
    overcomes,
    overcomedBy,
  };
}

// ==================== MAIN CALCULATION FUNCTION ====================

/**
 * Tính toán phong thủy đầy đủ
 */
export function calculateFengShui(person: FengShuiPerson): FengShuiResult {
  const { birthYear, gender } = person;

  // Tính Can Chi
  const { canChi, chi } = getCanChi(birthYear);

  // Lấy con giáp
  const zodiac = getZodiac(birthYear);

  // Lấy Nạp Âm và ngũ hành
  const napAm = getNapAm(canChi);
  const element = getNapAmElement(napAm);

  // Tính Cung Mệnh
  const cungMenh = getCungMenh(birthYear, gender);

  // Lấy hướng tốt/xấu
  const directions =
    BAT_TRAI_DIRECTIONS[cungMenh] || BAT_TRAI_DIRECTIONS["Khảm"];

  // Lấy màu sắc may mắn
  const luckyColors = LUCKY_COLORS[element] || [];

  // Màu xấu là màu của hành khắc mình
  const elementRelations = getElementRelations(element);
  const unluckyColors = LUCKY_COLORS[elementRelations.overcomedBy] || [];

  // Số may mắn
  const luckyNumbers = getLuckyNumbers(element);

  // Vật phẩm may mắn
  const luckyItems = getLuckyItems(element);

  // Con giáp tương hợp/xung khắc
  const zodiacCompat = ZODIAC_COMPAT[chi] || { good: [], bad: [] };

  return {
    birthYear,
    canChi,
    zodiac: `${zodiac.chi} (${zodiac.name})`,
    element,
    napAm,
    cungMenh,
    luckyDirections: directions.lucky,
    unluckyDirections: directions.unlucky,
    luckyColors,
    unluckyColors,
    luckyNumbers,
    luckyItems,
    compatibleElements: elementRelations.compatible,
    incompatibleElements: elementRelations.incompatible,
    compatibleZodiacs: zodiacCompat.good,
    incompatibleZodiacs: zodiacCompat.bad,
  };
}

/**
 * Phân tích hướng nhà
 */
export function analyzeHouseDirection(
  personResult: FengShuiResult,
  houseDirection: string
): HouseAnalysis {
  // Tìm xem hướng nhà thuộc hướng tốt hay xấu
  const luckyDir = personResult.luckyDirections.find(
    (d) => d.direction === houseDirection
  );
  const unluckyDir = personResult.unluckyDirections.find(
    (d) => d.direction === houseDirection
  );

  // Ngũ hành của hướng
  const directionElements: Record<string, string> = {
    Bắc: "Thủy",
    Nam: "Hỏa",
    Đông: "Mộc",
    Tây: "Kim",
    "Đông Bắc": "Thổ",
    "Đông Nam": "Mộc",
    "Tây Bắc": "Kim",
    "Tây Nam": "Thổ",
  };

  const houseElement = directionElements[houseDirection] || "Thổ";

  let compatibility: HouseAnalysis["compatibility"];
  let score: number;
  let analysis: string;
  let suggestions: string[] = [];

  if (luckyDir) {
    if (luckyDir.rating === 5) {
      compatibility = "excellent";
      score = 95;
      analysis = `Hướng ${houseDirection} là hướng ${luckyDir.name} - hướng tốt nhất cho người mệnh ${personResult.element}. Đây là hướng đại cát, mang lại ${luckyDir.meaning}.`;
    } else if (luckyDir.rating >= 4) {
      compatibility = "good";
      score = 80;
      analysis = `Hướng ${houseDirection} là hướng ${luckyDir.name} - hướng tốt cho người mệnh ${personResult.element}. ${luckyDir.meaning}.`;
    } else {
      compatibility = "neutral";
      score = 65;
      analysis = `Hướng ${houseDirection} là hướng ${luckyDir.name} - hướng trung bình. Mang lại sự ${luckyDir.meaning}.`;
    }
    suggestions = luckyDir.usage.map((u) => `Thích hợp đặt ${u} ở hướng này`);
  } else if (unluckyDir) {
    if (unluckyDir.rating === 1) {
      compatibility = "very_bad";
      score = 20;
      analysis = `Hướng ${houseDirection} là hướng ${unluckyDir.name} - hướng hung cho người mệnh ${personResult.element}. Cần hết sức cẩn trọng!`;
    } else {
      compatibility = "bad";
      score = 40;
      analysis = `Hướng ${houseDirection} là hướng ${unluckyDir.name} - hướng không tốt cho người mệnh ${personResult.element}.`;
    }
    suggestions = [
      "Đặt bếp hoặc nhà vệ sinh ở hướng này để hóa giải",
      "Sử dụng vật phẩm phong thủy phù hợp",
      "Tránh đặt phòng ngủ gia chủ ở hướng này",
    ];
  } else {
    compatibility = "neutral";
    score = 50;
    analysis = `Hướng ${houseDirection} không có trong danh sách hướng chính của cung ${personResult.cungMenh}.`;
  }

  // Tạo gợi ý bố trí phòng
  const roomPlacements: RoomPlacement[] = [
    {
      room: "Cửa chính",
      suggestedDirection: personResult.luckyDirections[0].direction,
      reason: "Hướng Sinh khí - tốt nhất cho cửa chính",
      rating: 5,
    },
    {
      room: "Phòng ngủ gia chủ",
      suggestedDirection: personResult.luckyDirections[1].direction,
      reason: "Hướng Thiên y - tốt cho sức khỏe",
      rating: 4,
    },
    {
      room: "Phòng ngủ vợ chồng",
      suggestedDirection: personResult.luckyDirections[2].direction,
      reason: "Hướng Diên niên - tốt cho hôn nhân",
      rating: 4,
    },
    {
      room: "Bếp",
      suggestedDirection: personResult.unluckyDirections[0].direction,
      reason: "Đặt bếp hướng xấu để hóa giải hung khí",
      rating: 3,
    },
    {
      room: "Nhà vệ sinh",
      suggestedDirection: personResult.unluckyDirections[1].direction,
      reason: "Đặt WC hướng xấu để thoát hung khí",
      rating: 3,
    },
  ];

  return {
    direction: houseDirection,
    personElement: personResult.element,
    houseElement,
    compatibility,
    score,
    analysis,
    suggestions,
    roomPlacements,
  };
}

/**
 * Tính hợp tuổi vợ chồng
 */
export function calculateCoupleCompatibility(
  person1: FengShuiPerson,
  person2: FengShuiPerson
): CoupleCompatibility {
  const result1 = calculateFengShui(person1);
  const result2 = calculateFengShui(person2);

  // Tính tương hợp ngũ hành
  let elementScore = 50;
  const relations1 = getElementRelations(result1.element);
  const relations2 = getElementRelations(result2.element);

  if (
    relations1.compatible.includes(result2.element) ||
    relations2.compatible.includes(result1.element)
  ) {
    elementScore = 90;
  } else if (
    relations1.incompatible.includes(result2.element) ||
    relations2.incompatible.includes(result1.element)
  ) {
    elementScore = 30;
  } else if (result1.element === result2.element) {
    elementScore = 70; // Tỵ hòa
  }

  // Tính tương hợp con giáp
  let zodiacScore = 50;
  const zodiac1 = getCanChi(person1.birthYear).chi;
  const zodiac2 = getCanChi(person2.birthYear).chi;
  const zodiacCompat1 = ZODIAC_COMPAT[zodiac1];

  if (zodiacCompat1?.good.includes(zodiac2)) {
    zodiacScore = 90;
  } else if (zodiacCompat1?.bad.includes(zodiac2)) {
    zodiacScore = 30;
  }

  // Tính tương hợp cung mệnh
  let cungScore = 50;
  const isDongTu1 = DONG_TU_MENH.includes(result1.cungMenh);
  const isDongTu2 = DONG_TU_MENH.includes(result2.cungMenh);

  if (isDongTu1 === isDongTu2) {
    cungScore = 85; // Cùng nhóm Đông/Tây tứ mệnh
  } else {
    cungScore = 45; // Khác nhóm
  }

  const overallScore = Math.round((elementScore + zodiacScore + cungScore) / 3);

  // Phân tích
  const strengths: string[] = [];
  const challenges: string[] = [];
  const advice: string[] = [];

  if (elementScore >= 70) {
    strengths.push(
      `Ngũ hành ${result1.element} và ${result2.element} tương sinh, hỗ trợ lẫn nhau`
    );
  } else if (elementScore < 50) {
    challenges.push(
      `Ngũ hành ${result1.element} và ${result2.element} tương khắc, cần hóa giải`
    );
    advice.push("Sử dụng hành trung gian để hóa giải xung khắc");
  }

  if (zodiacScore >= 70) {
    strengths.push(
      `Tuổi ${result1.zodiac} và ${result2.zodiac} tam hợp/lục hợp`
    );
  } else if (zodiacScore < 50) {
    challenges.push(`Tuổi ${result1.zodiac} và ${result2.zodiac} xung/phá/hại`);
    advice.push("Cần nhẫn nhịn, tránh tranh cãi");
  }

  if (cungScore >= 70) {
    strengths.push(
      `Cùng nhóm ${isDongTu1 ? "Đông" : "Tây"} tứ mệnh, dễ hòa hợp trong sinh hoạt`
    );
  } else {
    challenges.push(
      "Khác nhóm Đông/Tây tứ mệnh, hướng nhà có thể không phù hợp cả hai"
    );
    advice.push("Ưu tiên hướng tốt của gia chủ (người đứng tên nhà)");
  }

  let analysis = "";
  if (overallScore >= 80) {
    analysis =
      "Đây là cặp đôi rất hợp về phong thủy. Hai người hỗ trợ và bổ sung cho nhau.";
  } else if (overallScore >= 60) {
    analysis =
      "Hai người tương đối hợp nhau. Với sự thấu hiểu và nhẫn nhịn, cuộc sống sẽ hạnh phúc.";
  } else if (overallScore >= 40) {
    analysis =
      "Có một số xung khắc nhưng không quá nghiêm trọng. Cần chú ý hóa giải.";
  } else {
    analysis =
      "Hai người có nhiều xung khắc về phong thủy. Cần sử dụng các biện pháp hóa giải.";
  }

  return {
    person1: result1,
    person2: result2,
    overallScore,
    elementCompatibility: elementScore,
    zodiacCompatibility: zodiacScore,
    cungMenhCompatibility: cungScore,
    analysis,
    strengths,
    challenges,
    advice,
  };
}

// ==================== AI CONSULTATION ====================

// Feng Shui AI Prompt
const FENG_SHUI_SYSTEM_PROMPT = `Bạn là một chuyên gia phong thủy Việt Nam với kiến thức sâu rộng về:
- Bát trạch, Huyền không phi tinh
- Ngũ hành tương sinh tương khắc (Kim, Mộc, Thủy, Hỏa, Thổ)
- Can Chi, Nạp âm
- Phong thủy nhà ở, văn phòng
- Xem tuổi làm nhà, xem hướng nhà
- Hóa giải xung khắc
- Vật phẩm phong thủy

Hãy trả lời các câu hỏi về phong thủy một cách chi tiết, dễ hiểu và thực tế.
Sử dụng thuật ngữ phong thủy chính xác nhưng giải thích rõ ràng.
Đưa ra lời khuyên cụ thể, có thể áp dụng được.
Luôn giữ thái độ tích cực và hỗ trợ.`;

// Mock responses cho phong thủy
const FENG_SHUI_MOCK_RESPONSES: Record<string, string> = {
  "hóa giải":
    "🧿 **Cách hóa giải hướng xấu:**\n\n1. **Đặt bếp hoặc nhà vệ sinh** ở hướng xấu để tiêu hao hung khí\n2. **Sử dụng vật phẩm phong thủy:**\n   • Tỳ Hưu: Thu hút tài lộc, hóa giải sát khí\n   • Cóc ngậm tiền: Chiêu tài\n   • Bát quái gương: Phản chiếu hung khí\n3. **Trồng cây xanh** ở hướng xấu để cân bằng ngũ hành\n4. **Sử dụng màu sắc** tương sinh với mệnh để tăng vượng khí",
  "bàn thờ":
    "🪔 **Hướng đặt bàn thờ tốt nhất:**\n\n✅ Hướng tốt theo cung mệnh gia chủ (Sinh khí, Thiên y)\n✅ Tránh đặt bàn thờ:\n   • Đối diện cửa WC\n   • Dưới cầu thang\n   • Hướng ra cửa sổ\n   • Chung tường với WC\n\n💡 **Lưu ý:**\n   • Bàn thờ nên cao hơn đầu gia chủ\n   • Giữ sạch sẽ, thắp hương đều đặn\n   • Không để đồ linh tinh trên bàn thờ",
  cây: "🌿 **Cây phong thủy theo ngũ hành:**\n\n🪙 **Mệnh Kim:** Cây kim tiền, cây bạch mã, cây ngọc ngân\n🌳 **Mệnh Mộc:** Trúc phát tài, cây trầu bà, cây kim ngân\n💧 **Mệnh Thủy:** Sen, súng, cây thủy sinh, cây bonsai\n🔥 **Mệnh Hỏa:** Hoa hồng, hoa phượng, cây lưỡi hổ\n🏔️ **Mệnh Thổ:** Xương rồng, sen đá, cây vạn niên thanh\n\n💡 Đặt cây ở hướng Sinh khí để tăng vượng khí",
  "phòng ngủ":
    "🛏️ **Bố trí phòng ngủ theo phong thủy:**\n\n✅ **Vị trí giường:**\n   • Đầu giường tựa vào tường chắc\n   • Không đối diện cửa ra vào\n   • Không nằm dưới xà ngang\n   • Không soi gương khi nằm\n\n✅ **Hướng tốt:**\n   • Đặt giường hướng Thiên y (sức khỏe)\n   • Hoặc Diên niên (vợ chồng hòa hợp)\n\n❌ **Tránh:**\n   • Đầu giường sát cửa sổ\n   • Chân giường hướng cửa (hình quan tài)\n   • Gương đối diện giường",
  "màu sơn":
    "🎨 **Chọn màu sơn nhà theo mệnh:**\n\n🪙 **Mệnh Kim:** Trắng, bạc, xám, kem\n🌳 **Mệnh Mộc:** Xanh lá, xanh lam, đen (Thủy sinh Mộc)\n💧 **Mệnh Thủy:** Xanh dương, đen, tím đậm, trắng (Kim sinh Thủy)\n🔥 **Mệnh Hỏa:** Đỏ, cam, hồng, tím, xanh lá (Mộc sinh Hỏa)\n🏔️ **Mệnh Thổ:** Vàng, nâu, be, cam đất, đỏ (Hỏa sinh Thổ)\n\n💡 Ưu tiên màu tương sinh với mệnh để tăng vận may",
  default:
    "☯️ **Tư vấn Phong thủy:**\n\nCảm ơn bạn đã hỏi! Để tư vấn chính xác hơn, bạn có thể hỏi về:\n\n• 🏠 Hướng nhà, hướng cửa\n• 🛏️ Bố trí phòng ngủ, phòng khách\n• 🪴 Cây phong thủy phù hợp mệnh\n• 🎨 Màu sắc may mắn\n• 🧿 Cách hóa giải xung khắc\n• 💑 Xem hợp tuổi vợ chồng\n\nHãy cho tôi biết bạn cần hỗ trợ gì nhé!",
};

function findFengShuiMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  for (const [keyword, response] of Object.entries(FENG_SHUI_MOCK_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  return FENG_SHUI_MOCK_RESPONSES["default"];
}

/**
 * Tư vấn phong thủy bằng ChatGPT AI
 * Ưu tiên ChatGPT, fallback sang Gemini, sau đó là mock response
 */
export async function consultFengShuiAI(
  question: string,
  personInfo?: FengShuiPerson,
  context?: string,
  conversationHistory?: ChatGPTMessage[]
): Promise<string> {
  let fullPrompt = question;

  // Xây dựng prompt với thông tin người dùng
  if (personInfo) {
    const result = calculateFengShui(personInfo);
    fullPrompt = `[Thông tin người hỏi: Năm sinh ${personInfo.birthYear}, ${personInfo.gender === "male" ? "Nam" : "Nữ"}, Can Chi: ${result.canChi}, Con giáp: ${result.zodiac}, Mệnh: ${result.element}, Nạp âm: ${result.napAm}, Cung mệnh: ${result.cungMenh}]\n\nCâu hỏi: ${question}`;
  }

  if (context) {
    fullPrompt += `\n\n[Bối cảnh: ${context}]`;
  }

  // 1. Thử ChatGPT trước (ưu tiên cao nhất)
  if (chatGPTService.isConfigured()) {
    try {
      console.log("[FengShuiService] Using ChatGPT API...");
      const response = await chatGPTService.sendMessage(
        fullPrompt,
        FENG_SHUI_SYSTEM_PROMPT,
        conversationHistory
      );
      console.log("[FengShuiService] ChatGPT response received successfully");
      return response;
    } catch (chatGPTError) {
      console.error(
        "[FengShuiService] ChatGPT error, trying Gemini fallback:",
        chatGPTError
      );
    }
  } else {
    console.log("[FengShuiService] ChatGPT not configured, trying Gemini...");
  }

  // 2. Fallback sang Gemini
  try {
    console.log("[FengShuiService] Using Gemini API fallback...");
    const response = await geminiService.sendMessage(
      `[Với vai trò chuyên gia phong thủy] ${fullPrompt}`,
      []
    );
    console.log("[FengShuiService] Gemini response received successfully");
    return response.text;
  } catch (geminiError) {
    console.error(
      "[FengShuiService] Gemini error, using mock response:",
      geminiError
    );
  }

  // 3. Fallback cuối cùng - Mock response
  console.log("[FengShuiService] Using mock response fallback");
  return findFengShuiMockResponse(question);
}

// Export default
export default {
  calculateFengShui,
  analyzeHouseDirection,
  calculateCoupleCompatibility,
  consultFengShuiAI,
  getCanChi,
  getZodiac,
  getNapAm,
  getCungMenh,
  getLuckyNumbers,
  getLuckyItems,
  getElementRelations,
};
