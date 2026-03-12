/**
 * Worker Statistics Types for Home Screen Utilities
 */

export enum WorkerType {
  // Construction utilities
  EP_COC = 'EP_COC', // Ép cọc
  DAO_DAT = 'DAO_DAT', // Đào đất
  VAT_LIEU = 'VAT_LIEU', // Vật liệu
  NHAN_CONG = 'NHAN_CONG', // Nhân công
  THO_XAY = 'THO_XAY', // Thợ xây
  THO_COFFA = 'THO_COFFA', // Thợ coffa
  THO_SAT = 'THO_SAT', // Thợ sắt
  THO_DIEN = 'THO_DIEN', // Thợ điện
  THO_NUOC = 'THO_NUOC', // Thợ nước
  THO_DIEN_NUOC = 'THO_DIEN_NUOC', // Thợ điện nước (alias)
  BE_TONG = 'BE_TONG', // Bê tông

  // Finishing utilities
  THO_SON = 'THO_SON', // Thợ sơn
  THO_GACH = 'THO_GACH', // Thợ gạch
  THO_LAT_GACH = 'THO_LAT_GACH', // Thợ lát gạch (alias)
  THO_THACH_CAO = 'THO_THACH_CAO', // Thợ thạch cao
  THO_MOC = 'THO_MOC', // Thợ mộc
  THO_HAN = 'THO_HAN', // Thợ hàn
  THO_DA = 'THO_DA', // Thợ đá
  THO_LAM_CUA = 'THO_LAM_CUA', // Thợ làm cửa
  THO_LAN_CAN = 'THO_LAN_CAN', // Thợ lan can
  THO_CONG = 'THO_CONG', // Thợ cổng
  THO_CAMERA = 'THO_CAMERA', // Thợ camera
  THO_NHOM_KINH = 'THO_NHOM_KINH', // Thợ nhôm kính

  // Professional
  KY_SU = 'KY_SU', // Kỹ sư
  GIAM_SAT = 'GIAM_SAT', // Giám sát
}

export interface WorkerLocationStats {
  location: string; // Sài Gòn, Hà Nội, Đà Nẵng, etc.
  count: number;
  status: 'available' | 'almost-done' | 'busy';
}

export interface WorkerTypeStats {
  workerType: WorkerType;
  totalCount: number;
  locations: WorkerLocationStats[];
}

export interface WorkerStatsResponse {
  stats: WorkerTypeStats[];
  lastUpdated: string;
}

export interface WorkerRegistration {
  id: string;
  userId: string;
  workerType: WorkerType;
  location: string;
  phoneNumber: string;
  fullName: string;
  experience: number; // years
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterWorkerRequest {
  workerType: WorkerType;
  location: string;
  phoneNumber: string;
  fullName: string;
  experience: number;
}
