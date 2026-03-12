/**
 * Safety Management Mock Service
 * 
 * Features:
 * - Incident reporting with severity levels
 * - Daily safety checklists with PPE tracking
 * - Safety meetings/toolbox talks
 * - Hazard identification & mitigation
 * - Emergency contacts
 * - Safety statistics
 */

// ==================== TYPES & INTERFACES ====================

export type IncidentSeverity = 'near-miss' | 'minor' | 'major' | 'fatal';
export type IncidentStatus = 'reported' | 'investigating' | 'closed';
export type InjuryType = 'none' | 'first-aid' | 'medical-treatment' | 'lost-time' | 'fatality';
export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';
export type HazardStatus = 'identified' | 'mitigating' | 'resolved';
export type ChecklistStatus = 'pending' | 'completed' | 'failed';
export type PPEItem = 'helmet' | 'safety-vest' | 'boots' | 'gloves' | 'glasses' | 'mask' | 'harness' | 'ear-protection';

export interface SafetyIncident {
  id: string;
  projectId: string;
  date: string;
  time: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  injuryType: InjuryType;
  title: string;
  description: string;
  location: string;
  involvedPersons: string[];
  witnesses: string[];
  immediateAction: string;
  rootCause?: string;
  correctiveActions?: string[];
  photos?: string[];
  reportedBy: string;
  reportedAt: string;
  investigatedBy?: string;
  closedAt?: string;
}

export interface SafetyChecklist {
  id: string;
  projectId: string;
  date: string;
  status: ChecklistStatus;
  inspector: string;
  workersPresent: number;
  items: ChecklistItem[];
  ppeCompliance: PPECompliance;
  notes?: string;
  signature?: string;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  description: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes?: string;
  photos?: string[];
  required: boolean;
}

export interface PPECompliance {
  helmet: number; // percentage 0-100
  safetyVest: number;
  boots: number;
  gloves: number;
  glasses: number;
  mask: number;
  harness?: number;
  earProtection?: number;
  overallCompliance: number;
}

export interface SafetyMeeting {
  id: string;
  projectId: string;
  date: string;
  time: string;
  type: 'toolbox-talk' | 'safety-briefing' | 'training' | 'emergency-drill';
  title: string;
  topics: string[];
  attendees: string[];
  duration: number; // minutes
  trainer?: string;
  actionItems?: ActionItem[];
  notes?: string;
  photos?: string[];
  signature?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'completed';
  completedAt?: string;
}

export interface Hazard {
  id: string;
  projectId: string;
  identifiedDate: string;
  severity: HazardSeverity;
  status: HazardStatus;
  title: string;
  description: string;
  location: string;
  category: string;
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
  impact: 'insignificant' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskRating: number; // 1-25 (likelihood x impact)
  identifiedBy: string;
  mitigationPlan?: string;
  mitigationActions?: string[];
  assignedTo?: string;
  targetDate?: string;
  resolvedDate?: string;
  photos?: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  type: 'internal' | 'external' | 'emergency-service';
  available247: boolean;
  priority: number; // 1 = highest
}

export interface SafetyStats {
  totalIncidents: number;
  nearMisses: number;
  minorIncidents: number;
  majorIncidents: number;
  fatalIncidents: number;
  openIncidents: number;
  daysWithoutIncident: number;
  totalHazards: number;
  criticalHazards: number;
  resolvedHazards: number;
  avgPPECompliance: number;
  checklistsCompleted: number;
  checklistsPending: number;
  meetingsHeld: number;
}

// ==================== MOCK DATA ====================

const MOCK_INCIDENTS: SafetyIncident[] = [
  {
    id: 'inc-1',
    projectId: 'project-1',
    date: '2025-11-28',
    time: '14:30',
    severity: 'near-miss',
    status: 'closed',
    injuryType: 'none',
    title: 'Gần rơi vật liệu từ tầng 3',
    description: 'Một tấm ván khuôn suýt rơi xuống khu vực làm việc bên dưới do không được cố định chắc chắn',
    location: 'Tầng 3, khu vực cột C5',
    involvedPersons: ['Nguyễn Văn A'],
    witnesses: ['Trần Văn B', 'Lê Thị C'],
    immediateAction: 'Dừng ngay công việc, kiểm tra và cố định lại toàn bộ vật liệu trên cao',
    rootCause: 'Công nhân không tuân thủ quy trình cố định vật liệu',
    correctiveActions: [
      'Huấn luyện lại quy trình an toàn cho toàn bộ công nhân',
      'Tăng cường kiểm tra hàng ngày các vật liệu trên cao',
      'Lắp đặt lưới an toàn bổ sung'
    ],
    photos: ['photo1.jpg'],
    reportedBy: 'Phạm Văn D - Trưởng ca',
    reportedAt: '2025-11-28T14:45:00Z',
    investigatedBy: 'Hoàng Văn E - ATLD',
    closedAt: '2025-11-29T10:00:00Z'
  },
  {
    id: 'inc-2',
    projectId: 'project-1',
    date: '2025-11-25',
    time: '09:15',
    severity: 'minor',
    status: 'closed',
    injuryType: 'first-aid',
    title: 'Công nhân bị trầy xước tay',
    description: 'Công nhân bị trầy xước nhẹ ở tay khi cắt cốt thép do không đeo găng tay bảo hộ',
    location: 'Khu vực gia công cốt thép',
    involvedPersons: ['Vũ Văn F'],
    witnesses: ['Đỗ Văn G'],
    immediateAction: 'Sơ cứu vết thương, nhắc nhở đeo đầy đủ bảo hộ',
    rootCause: 'Công nhân không đeo găng tay bảo hộ',
    correctiveActions: [
      'Cảnh cáo công nhân vi phạm',
      'Nhắc nhở toàn bộ ekip về việc đeo đầy đủ bảo hộ',
      'Tăng cường giám sát sử dụng PPE'
    ],
    photos: [],
    reportedBy: 'Đỗ Văn G - Tổ trưởng',
    reportedAt: '2025-11-25T09:30:00Z',
    investigatedBy: 'Hoàng Văn E - ATLD',
    closedAt: '2025-11-25T16:00:00Z'
  },
  {
    id: 'inc-3',
    projectId: 'project-1',
    date: '2025-11-27',
    time: '11:00',
    severity: 'near-miss',
    status: 'investigating',
    injuryType: 'none',
    title: 'Phát hiện dây điện lõi đồng lộ ra',
    description: 'Phát hiện dây điện tạm bị hư hỏng, lõi đồng lộ ra tại khu vực thi công',
    location: 'Khu vực thi công điện tầng 2',
    involvedPersons: [],
    witnesses: ['Nguyễn Thị H'],
    immediateAction: 'Ngắt nguồn điện ngay lập tức, cách ly khu vực, thay dây mới',
    reportedBy: 'Nguyễn Thị H - Điện công',
    reportedAt: '2025-11-27T11:15:00Z',
    investigatedBy: 'Hoàng Văn E - ATLD'
  }
];

const MOCK_CHECKLISTS: SafetyChecklist[] = [
  {
    id: 'chk-1',
    projectId: 'project-1',
    date: '2025-11-29',
    status: 'completed',
    inspector: 'Hoàng Văn E',
    workersPresent: 28,
    items: [
      {
        id: 'item-1',
        category: 'Khu vực làm việc',
        description: 'Khu vực làm việc sạch sẽ, không có vật cản',
        status: 'pass',
        required: true
      },
      {
        id: 'item-2',
        category: 'Khu vực làm việc',
        description: 'Biển báo an toàn được đặt đúng vị trí',
        status: 'pass',
        required: true
      },
      {
        id: 'item-3',
        category: 'Thiết bị bảo hộ',
        description: 'Công nhân đeo đầy đủ PPE (mũ, áo, giày)',
        status: 'pass',
        required: true
      },
      {
        id: 'item-4',
        category: 'Thiết bị bảo hộ',
        description: 'Dây an toàn được sử dụng khi làm việc trên cao',
        status: 'pass',
        required: true
      },
      {
        id: 'item-5',
        category: 'Máy móc & Công cụ',
        description: 'Máy móc trong tình trạng tốt, có bảo trì định kỳ',
        status: 'pass',
        required: true
      },
      {
        id: 'item-6',
        category: 'Máy móc & Công cụ',
        description: 'Công cụ cầm tay an toàn, không hư hỏng',
        status: 'pass',
        required: true
      },
      {
        id: 'item-7',
        category: 'Điện & Nước',
        description: 'Hệ thống điện tạm an toàn, có aptomat bảo vệ',
        status: 'pass',
        required: true
      },
      {
        id: 'item-8',
        category: 'Điện & Nước',
        description: 'Không có nước đọng tại khu vực sử dụng điện',
        status: 'pass',
        required: true
      },
      {
        id: 'item-9',
        category: 'Vật liệu',
        description: 'Vật liệu được xếp gọn gàng, an toàn',
        status: 'fail',
        notes: 'Cốt thép xếp chưa gọn, cần sắp xếp lại',
        required: true
      },
      {
        id: 'item-10',
        category: 'Vật liệu',
        description: 'Vật liệu trên cao được cố định chắc chắn',
        status: 'pass',
        required: true
      },
      {
        id: 'item-11',
        category: 'Sơ cứu',
        description: 'Túi sơ cứu có đầy đủ trang thiết bị',
        status: 'pass',
        required: true
      },
      {
        id: 'item-12',
        category: 'Sơ cứu',
        description: 'Có ít nhất 2 người được đào tạo sơ cứu',
        status: 'pass',
        required: true
      }
    ],
    ppeCompliance: {
      helmet: 100,
      safetyVest: 96,
      boots: 100,
      gloves: 89,
      glasses: 75,
      mask: 82,
      harness: 100,
      earProtection: 71,
      overallCompliance: 89
    },
    notes: 'Cần nhắc nhở công nhân đeo kính bảo hộ khi cắt sắt',
    signature: 'Hoàng Văn E',
    completedAt: '2025-11-29T08:30:00Z'
  },
  {
    id: 'chk-2',
    projectId: 'project-1',
    date: '2025-11-28',
    status: 'completed',
    inspector: 'Hoàng Văn E',
    workersPresent: 30,
    items: [
      {
        id: 'item-1',
        category: 'Khu vực làm việc',
        description: 'Khu vực làm việc sạch sẽ, không có vật cản',
        status: 'pass',
        required: true
      },
      {
        id: 'item-2',
        category: 'Khu vực làm việc',
        description: 'Biển báo an toàn được đặt đúng vị trí',
        status: 'pass',
        required: true
      },
      {
        id: 'item-3',
        category: 'Thiết bị bảo hộ',
        description: 'Công nhân đeo đầy đủ PPE (mũ, áo, giày)',
        status: 'pass',
        required: true
      },
      {
        id: 'item-4',
        category: 'Thiết bị bảo hộ',
        description: 'Dây an toàn được sử dụng khi làm việc trên cao',
        status: 'pass',
        required: true
      },
      {
        id: 'item-5',
        category: 'Máy móc & Công cụ',
        description: 'Máy móc trong tình trạng tốt, có bảo trì định kỳ',
        status: 'pass',
        required: true
      },
      {
        id: 'item-6',
        category: 'Máy móc & Công cụ',
        description: 'Công cụ cầm tay an toàn, không hư hỏng',
        status: 'pass',
        required: true
      },
      {
        id: 'item-7',
        category: 'Điện & Nước',
        description: 'Hệ thống điện tạm an toàn, có aptomat bảo vệ',
        status: 'pass',
        required: true
      },
      {
        id: 'item-8',
        category: 'Điện & Nước',
        description: 'Không có nước đọng tại khu vực sử dụng điện',
        status: 'pass',
        required: true
      },
      {
        id: 'item-9',
        category: 'Vật liệu',
        description: 'Vật liệu được xếp gọn gàng, an toàn',
        status: 'pass',
        required: true
      },
      {
        id: 'item-10',
        category: 'Vật liệu',
        description: 'Vật liệu trên cao được cố định chắc chắn',
        status: 'fail',
        notes: 'Phát hiện ván khuôn chưa được cố định - đã xử lý',
        required: true
      },
      {
        id: 'item-11',
        category: 'Sơ cứu',
        description: 'Túi sơ cứu có đầy đủ trang thiết bị',
        status: 'pass',
        required: true
      },
      {
        id: 'item-12',
        category: 'Sơ cứu',
        description: 'Có ít nhất 2 người được đào tạo sơ cứu',
        status: 'pass',
        required: true
      }
    ],
    ppeCompliance: {
      helmet: 100,
      safetyVest: 100,
      boots: 97,
      gloves: 93,
      glasses: 80,
      mask: 87,
      harness: 100,
      earProtection: 77,
      overallCompliance: 92
    },
    completedAt: '2025-11-28T08:45:00Z'
  },
  {
    id: 'chk-3',
    projectId: 'project-1',
    date: '2025-11-27',
    status: 'completed',
    inspector: 'Phạm Văn D',
    workersPresent: 25,
    items: [
      {
        id: 'item-1',
        category: 'Khu vực làm việc',
        description: 'Khu vực làm việc sạch sẽ, không có vật cản',
        status: 'pass',
        required: true
      },
      {
        id: 'item-2',
        category: 'Khu vực làm việc',
        description: 'Biển báo an toàn được đặt đúng vị trí',
        status: 'pass',
        required: true
      },
      {
        id: 'item-3',
        category: 'Thiết bị bảo hộ',
        description: 'Công nhân đeo đầy đủ PPE (mũ, áo, giày)',
        status: 'pass',
        required: true
      },
      {
        id: 'item-4',
        category: 'Thiết bị bảo hộ',
        description: 'Dây an toàn được sử dụng khi làm việc trên cao',
        status: 'pass',
        required: true
      },
      {
        id: 'item-5',
        category: 'Máy móc & Công cụ',
        description: 'Máy móc trong tình trạng tốt, có bảo trì định kỳ',
        status: 'pass',
        required: true
      },
      {
        id: 'item-6',
        category: 'Máy móc & Công cụ',
        description: 'Công cụ cầm tay an toàn, không hư hỏng',
        status: 'pass',
        required: true
      },
      {
        id: 'item-7',
        category: 'Điện & Nước',
        description: 'Hệ thống điện tạm an toàn, có aptomat bảo vệ',
        status: 'fail',
        notes: 'Phát hiện dây điện lõi đồng lộ ra - đã thay thế',
        required: true
      },
      {
        id: 'item-8',
        category: 'Điện & Nước',
        description: 'Không có nước đọng tại khu vực sử dụng điện',
        status: 'pass',
        required: true
      },
      {
        id: 'item-9',
        category: 'Vật liệu',
        description: 'Vật liệu được xếp gọn gàng, an toàn',
        status: 'pass',
        required: true
      },
      {
        id: 'item-10',
        category: 'Vật liệu',
        description: 'Vật liệu trên cao được cố định chắc chắn',
        status: 'pass',
        required: true
      },
      {
        id: 'item-11',
        category: 'Sơ cứu',
        description: 'Túi sơ cứu có đầy đủ trang thiết bị',
        status: 'pass',
        required: true
      },
      {
        id: 'item-12',
        category: 'Sơ cứu',
        description: 'Có ít nhất 2 người được đào tạo sơ cứu',
        status: 'pass',
        required: true
      }
    ],
    ppeCompliance: {
      helmet: 100,
      safetyVest: 92,
      boots: 100,
      gloves: 88,
      glasses: 72,
      mask: 80,
      harness: 100,
      earProtection: 68,
      overallCompliance: 88
    },
    completedAt: '2025-11-27T08:20:00Z'
  }
];

const MOCK_MEETINGS: SafetyMeeting[] = [
  {
    id: 'mtg-1',
    projectId: 'project-1',
    date: '2025-11-29',
    time: '07:00',
    type: 'toolbox-talk',
    title: 'An toàn khi làm việc trên cao',
    topics: [
      'Kiểm tra dây an toàn trước khi sử dụng',
      'Cách móc dây an toàn đúng kỹ thuật',
      'Phản ứng khi phát hiện dây an toàn hư hỏng',
      'Sử dụng giàn giáo an toàn'
    ],
    attendees: ['Nguyễn Văn A', 'Trần Văn B', 'Lê Thị C', 'Phạm Văn D', 'Vũ Văn F', 'Đỗ Văn G'],
    duration: 15,
    trainer: 'Hoàng Văn E',
    actionItems: [
      {
        id: 'action-1',
        description: 'Kiểm tra toàn bộ dây an toàn hiện có',
        assignedTo: 'Phạm Văn D',
        dueDate: '2025-11-30',
        status: 'pending'
      }
    ],
    notes: 'Toàn bộ công nhân đã hiểu rõ quy trình',
    signature: 'Hoàng Văn E'
  },
  {
    id: 'mtg-2',
    projectId: 'project-1',
    date: '2025-11-27',
    time: '07:00',
    type: 'toolbox-talk',
    title: 'An toàn điện tại công trình',
    topics: [
      'Kiểm tra dây điện trước khi sử dụng',
      'Không sử dụng điện khi tay ướt',
      'Ngắt nguồn khi phát hiện sự cố',
      'Báo cáo ngay khi thấy dây điện hư hỏng'
    ],
    attendees: ['Nguyễn Thị H', 'Hoàng Văn I', 'Lê Văn J'],
    duration: 10,
    trainer: 'Hoàng Văn E',
    actionItems: [
      {
        id: 'action-2',
        description: 'Thay thế toàn bộ dây điện tạm cũ',
        assignedTo: 'Nguyễn Thị H',
        dueDate: '2025-11-28',
        status: 'completed',
        completedAt: '2025-11-27T16:00:00Z'
      }
    ],
    signature: 'Hoàng Văn E'
  },
  {
    id: 'mtg-3',
    projectId: 'project-1',
    date: '2025-11-25',
    time: '14:00',
    type: 'training',
    title: 'Đào tạo sơ cứu cơ bản',
    topics: [
      'Sơ cứu vết thương chảy máu',
      'Sơ cứu bỏng',
      'Sơ cứu gãy xương',
      'CPR cơ bản'
    ],
    attendees: ['Trần Văn B', 'Lê Thị C', 'Vũ Văn F', 'Đỗ Văn G'],
    duration: 120,
    trainer: 'Bác sĩ Nguyễn Văn K',
    notes: 'Toàn bộ học viên đã vượt qua bài kiểm tra',
    signature: 'Bác sĩ Nguyễn Văn K'
  }
];

const MOCK_HAZARDS: Hazard[] = [
  {
    id: 'haz-1',
    projectId: 'project-1',
    identifiedDate: '2025-11-28',
    severity: 'high',
    status: 'mitigating',
    title: 'Nguy cơ rơi từ tầng 3',
    description: 'Khu vực tầng 3 chưa có lan can bảo vệ, nguy cơ cao công nhân bị rơi',
    location: 'Tầng 3, toàn bộ chu vi',
    category: 'Làm việc trên cao',
    likelihood: 'likely',
    impact: 'major',
    riskRating: 16,
    identifiedBy: 'Hoàng Văn E',
    mitigationPlan: 'Lắp đặt lan can tạm và lưới an toàn',
    mitigationActions: [
      'Lắp đặt lan can sắt cao 1.2m quanh chu vi tầng 3',
      'Căng lưới an toàn phía dưới khu vực làm việc',
      'Cấm công nhân lên tầng 3 khi chưa hoàn thành biện pháp bảo vệ'
    ],
    assignedTo: 'Phạm Văn D',
    targetDate: '2025-11-30',
    photos: ['hazard1.jpg']
  },
  {
    id: 'haz-2',
    projectId: 'project-1',
    identifiedDate: '2025-11-27',
    severity: 'medium',
    status: 'resolved',
    title: 'Dây điện lõi đồng lộ ra',
    description: 'Dây điện tạm bị hư hỏng, lõi đồng lộ ra, nguy cơ giật điện',
    location: 'Khu vực thi công điện tầng 2',
    category: 'Điện',
    likelihood: 'possible',
    impact: 'major',
    riskRating: 12,
    identifiedBy: 'Nguyễn Thị H',
    mitigationPlan: 'Thay thế dây điện mới ngay lập tức',
    mitigationActions: [
      'Ngắt nguồn điện',
      'Thay dây điện mới',
      'Kiểm tra toàn bộ hệ thống điện tạm'
    ],
    assignedTo: 'Nguyễn Thị H',
    targetDate: '2025-11-27',
    resolvedDate: '2025-11-27T16:00:00Z'
  },
  {
    id: 'haz-3',
    projectId: 'project-1',
    identifiedDate: '2025-11-26',
    severity: 'low',
    status: 'resolved',
    title: 'Vật liệu xếp lộn xộn',
    description: 'Cốt thép xếp không gọn gàng, nguy cơ vấp넘어질',
    location: 'Khu vực gia công cốt thép',
    category: 'Vật liệu',
    likelihood: 'possible',
    impact: 'minor',
    riskRating: 6,
    identifiedBy: 'Phạm Văn D',
    mitigationPlan: 'Sắp xếp lại vật liệu',
    mitigationActions: [
      'Xếp cốt thép gọn gàng theo từng loại',
      'Đánh dấu khu vực chứa vật liệu'
    ],
    assignedTo: 'Đỗ Văn G',
    targetDate: '2025-11-26',
    resolvedDate: '2025-11-26T15:00:00Z'
  },
  {
    id: 'haz-4',
    projectId: 'project-1',
    identifiedDate: '2025-11-29',
    severity: 'critical',
    status: 'identified',
    title: 'Giàn giáo không ổn định',
    description: 'Giàn giáo tầng 2 bị lắc, chưa được cố định chắc chắn vào kết cấu',
    location: 'Giàn giáo mặt tiền tầng 2',
    category: 'Giàn giáo',
    likelihood: 'likely',
    impact: 'catastrophic',
    riskRating: 20,
    identifiedBy: 'Trần Văn B',
    mitigationPlan: 'Cần gia cố giàn giáo ngay lập tức',
    mitigationActions: [
      'Dừng sử dụng giàn giáo ngay lập tức',
      'Kiểm tra toàn bộ kết cấu giàn giáo',
      'Gia cố thêm điểm neo vào kết cấu',
      'Kiểm tra lại sau khi gia cố'
    ],
    assignedTo: 'Phạm Văn D',
    targetDate: '2025-11-30',
    photos: ['scaffold.jpg']
  }
];

const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec-1',
    name: 'Cấp cứu 115',
    role: 'Dịch vụ cấp cứu',
    phone: '115',
    type: 'emergency-service',
    available247: true,
    priority: 1
  },
  {
    id: 'ec-2',
    name: 'Cảnh sát 113',
    role: 'Công an',
    phone: '113',
    type: 'emergency-service',
    available247: true,
    priority: 1
  },
  {
    id: 'ec-3',
    name: 'Cứu hỏa 114',
    role: 'Phòng cháy chữa cháy',
    phone: '114',
    type: 'emergency-service',
    available247: true,
    priority: 1
  },
  {
    id: 'ec-4',
    name: 'Hoàng Văn E',
    role: 'Trưởng phòng ATLD',
    phone: '0912-345-678',
    email: 'hoang.e@company.com',
    type: 'internal',
    available247: true,
    priority: 2
  },
  {
    id: 'ec-5',
    name: 'Nguyễn Văn M',
    role: 'Giám đốc dự án',
    phone: '0923-456-789',
    email: 'nguyen.m@company.com',
    type: 'internal',
    available247: true,
    priority: 2
  },
  {
    id: 'ec-6',
    name: 'Bệnh viện Đa khoa ABC',
    role: 'Bệnh viện gần nhất',
    phone: '0234-567-890',
    type: 'external',
    available247: true,
    priority: 3
  },
  {
    id: 'ec-7',
    name: 'Phòng khám Sơ cứu XYZ',
    role: 'Phòng khám',
    phone: '0245-678-901',
    type: 'external',
    available247: false,
    priority: 4
  }
];

// ==================== SERVICE CLASS ====================

export class SafetyService {
  private static incidents = [...MOCK_INCIDENTS];
  private static checklists = [...MOCK_CHECKLISTS];
  private static meetings = [...MOCK_MEETINGS];
  private static hazards = [...MOCK_HAZARDS];
  private static emergencyContacts = [...MOCK_EMERGENCY_CONTACTS];

  // ==================== INCIDENTS ====================

  static async getIncidents(filters?: {
    projectId?: string;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<SafetyIncident[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...this.incidents];

    if (filters?.projectId) {
      filtered = filtered.filter(i => i.projectId === filters.projectId);
    }
    if (filters?.severity) {
      filtered = filtered.filter(i => i.severity === filters.severity);
    }
    if (filters?.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(i => i.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(i => i.date <= filters.endDate!);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }

  static async getIncident(id: string): Promise<SafetyIncident | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.incidents.find(i => i.id === id);
  }

  static async createIncident(data: Omit<SafetyIncident, 'id' | 'reportedAt'>): Promise<SafetyIncident> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newIncident: SafetyIncident = {
      ...data,
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toISOString()
    };

    this.incidents.unshift(newIncident);
    return newIncident;
  }

  static async updateIncident(id: string, data: Partial<SafetyIncident>): Promise<SafetyIncident> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.incidents.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Incident not found');

    this.incidents[index] = { ...this.incidents[index], ...data };
    return this.incidents[index];
  }

  // ==================== CHECKLISTS ====================

  static async getChecklists(filters?: {
    projectId?: string;
    status?: ChecklistStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<SafetyChecklist[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...this.checklists];

    if (filters?.projectId) {
      filtered = filtered.filter(c => c.projectId === filters.projectId);
    }
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(c => c.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(c => c.date <= filters.endDate!);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }

  static async getChecklist(id: string): Promise<SafetyChecklist | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.checklists.find(c => c.id === id);
  }

  static async createChecklist(data: Omit<SafetyChecklist, 'id'>): Promise<SafetyChecklist> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newChecklist: SafetyChecklist = {
      ...data,
      id: `chk-${Date.now()}`
    };

    this.checklists.unshift(newChecklist);
    return newChecklist;
  }

  static async updateChecklist(id: string, data: Partial<SafetyChecklist>): Promise<SafetyChecklist> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.checklists.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Checklist not found');

    this.checklists[index] = { ...this.checklists[index], ...data };
    return this.checklists[index];
  }

  // ==================== MEETINGS ====================

  static async getMeetings(filters?: {
    projectId?: string;
    type?: SafetyMeeting['type'];
    startDate?: string;
    endDate?: string;
  }): Promise<SafetyMeeting[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...this.meetings];

    if (filters?.projectId) {
      filtered = filtered.filter(m => m.projectId === filters.projectId);
    }
    if (filters?.type) {
      filtered = filtered.filter(m => m.type === filters.type);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(m => m.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(m => m.date <= filters.endDate!);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }

  static async getMeeting(id: string): Promise<SafetyMeeting | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.meetings.find(m => m.id === id);
  }

  static async createMeeting(data: Omit<SafetyMeeting, 'id'>): Promise<SafetyMeeting> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newMeeting: SafetyMeeting = {
      ...data,
      id: `mtg-${Date.now()}`
    };

    this.meetings.unshift(newMeeting);
    return newMeeting;
  }

  // ==================== HAZARDS ====================

  static async getHazards(filters?: {
    projectId?: string;
    severity?: HazardSeverity;
    status?: HazardStatus;
  }): Promise<Hazard[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...this.hazards];

    if (filters?.projectId) {
      filtered = filtered.filter(h => h.projectId === filters.projectId);
    }
    if (filters?.severity) {
      filtered = filtered.filter(h => h.severity === filters.severity);
    }
    if (filters?.status) {
      filtered = filtered.filter(h => h.status === filters.status);
    }

    return filtered.sort((a, b) => b.riskRating - a.riskRating);
  }

  static async getHazard(id: string): Promise<Hazard | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.hazards.find(h => h.id === id);
  }

  static async createHazard(data: Omit<Hazard, 'id' | 'riskRating'>): Promise<Hazard> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const likelihoodValues = { rare: 1, unlikely: 2, possible: 3, likely: 4, certain: 5 };
    const impactValues = { insignificant: 1, minor: 2, moderate: 3, major: 4, catastrophic: 5 };

    const riskRating = likelihoodValues[data.likelihood] * impactValues[data.impact];

    const newHazard: Hazard = {
      ...data,
      id: `haz-${Date.now()}`,
      riskRating
    };

    this.hazards.unshift(newHazard);
    return newHazard;
  }

  static async updateHazard(id: string, data: Partial<Hazard>): Promise<Hazard> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.hazards.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Hazard not found');

    this.hazards[index] = { ...this.hazards[index], ...data };
    return this.hazards[index];
  }

  // ==================== EMERGENCY CONTACTS ====================

  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.emergencyContacts].sort((a, b) => a.priority - b.priority);
  }

  // ==================== STATS ====================

  static async getStats(projectId?: string): Promise<SafetyStats> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let incidents = this.incidents;
    let checklists = this.checklists;
    let hazards = this.hazards;

    if (projectId) {
      incidents = incidents.filter(i => i.projectId === projectId);
      checklists = checklists.filter(c => c.projectId === projectId);
      hazards = hazards.filter(h => h.projectId === projectId);
    }

    const totalIncidents = incidents.length;
    const nearMisses = incidents.filter(i => i.severity === 'near-miss').length;
    const minorIncidents = incidents.filter(i => i.severity === 'minor').length;
    const majorIncidents = incidents.filter(i => i.severity === 'major').length;
    const fatalIncidents = incidents.filter(i => i.severity === 'fatal').length;
    const openIncidents = incidents.filter(i => i.status !== 'closed').length;

    // Calculate days without incident (since last incident)
    const sortedIncidents = incidents
      .filter(i => i.severity !== 'near-miss')
      .sort((a, b) => b.date.localeCompare(a.date));
    const lastIncidentDate = sortedIncidents[0]?.date;
    const daysWithoutIncident = lastIncidentDate
      ? Math.floor((Date.now() - new Date(lastIncidentDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const totalHazards = hazards.length;
    const criticalHazards = hazards.filter(h => h.severity === 'critical' || h.severity === 'high').length;
    const resolvedHazards = hazards.filter(h => h.status === 'resolved').length;

    const completedChecklists = checklists.filter(c => c.status === 'completed');
    const avgPPECompliance = completedChecklists.length > 0
      ? Math.round(completedChecklists.reduce((sum, c) => sum + c.ppeCompliance.overallCompliance, 0) / completedChecklists.length)
      : 0;

    const checklistsCompleted = completedChecklists.length;
    const checklistsPending = checklists.filter(c => c.status === 'pending').length;
    const meetingsHeld = this.meetings.filter(m => !projectId || m.projectId === projectId).length;

    return {
      totalIncidents,
      nearMisses,
      minorIncidents,
      majorIncidents,
      fatalIncidents,
      openIncidents,
      daysWithoutIncident,
      totalHazards,
      criticalHazards,
      resolvedHazards,
      avgPPECompliance,
      checklistsCompleted,
      checklistsPending,
      meetingsHeld
    };
  }
}
