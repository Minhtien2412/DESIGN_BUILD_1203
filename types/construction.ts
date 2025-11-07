// Construction Project Types
// Types for construction project management system

export interface LandDocument {
  id: string;
  document_type: 'so_do' | 'giay_chung_nhan' | 'hop_dong' | 'khac';
  document_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  verified: boolean;
  notes?: string;
}

export interface ProjectLocation {
  address: string;
  ward: string;        // Phường/Xã
  district: string;    // Quận/Huyện
  province: string;    // Tỉnh/Thành phố
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  land_area: number;   // Diện tích đất (m²)
  construction_area?: number; // Diện tích xây dựng (m²)
}

export interface ProjectBudget {
  total_budget: number;
  estimated_cost: number;
  actual_cost?: number;
  currency: string;
  budget_breakdown?: {
    category: string;
    amount: number;
    description?: string;
  }[];
}

export interface ProjectTimeline {
  start_date: string;
  estimated_end_date: string;
  actual_end_date?: string;
  milestones: {
    id: string;
    name: string;
    description: string;
    due_date: string;
    completed: boolean;
    completed_date?: string;
  }[];
}

export type ProjectStatus = 
  | 'draft'           // Bản nháp
  | 'pending_review'  // Chờ duyệt
  | 'approved'        // Đã duyệt
  | 'in_progress'     // Đang thi công
  | 'on_hold'         // Tạm dừng
  | 'completed'       // Hoàn thành
  | 'cancelled';      // Hủy bỏ

export type ProjectType = 
  | 'nha_o'          // Nhà ở
  | 'biet_thu'       // Biệt thự
  | 'nha_pho'        // Nhà phố
  | 'chung_cu'       // Chung cư
  | 'van_phong'      // Văn phòng
  | 'thuong_mai'     // Thương mại
  | 'cong_nghiep'    // Công nghiệp
  | 'khac';          // Khác

export interface ConstructionProject {
  id: string;
  project_code: string;     // Mã dự án
  project_name: string;
  project_type: ProjectType;
  description?: string;
  
  // Ownership
  owner_id: string;         // ID khách hàng
  owner_name: string;
  assigned_admin_id?: string; // Admin được phân công
  
  // Location & Documents
  location: ProjectLocation;
  land_documents: LandDocument[];
  
  // Project Details
  status: ProjectStatus;
  budget: ProjectBudget;
  timeline: ProjectTimeline;
  
  // Technical Specifications
  specifications?: {
    floors: number;
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    special_features?: string[];
  };
  
  // Files & Media
  design_files: string[];   // URLs to design files
  photos: string[];         // Construction photos
  documents: string[];      // Other project documents
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_updated_by: string;
  
  // Notes & Communication
  notes?: string;
  admin_notes?: string;     // Notes from admin
  tags?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  project_type: ProjectType;
  description: string;
  default_budget_range: {
    min: number;
    max: number;
  };
  default_timeline_months: number;
  default_specifications: any;
  thumbnail_url?: string;
  is_active: boolean;
}

// Form Data Types
export interface CreateProjectFormData {
  project_name: string;
  project_type: ProjectType;
  description?: string;
  location: Omit<ProjectLocation, 'coordinates'>;
  estimated_budget: number;
  preferred_start_date?: string;
  land_documents: File[];
  photos?: File[];
  specifications?: {
    floors: number;
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    special_features?: string[];
  };
  notes?: string;
}

export interface UpdateProjectFormData extends Partial<CreateProjectFormData> {
  id: string;
  status?: ProjectStatus;
  admin_notes?: string;
  assigned_admin_id?: string;
}

// API Response Types
export interface ProjectListResponse {
  projects: ConstructionProject[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ProjectStatsResponse {
  total_projects: number;
  by_status: Record<ProjectStatus, number>;
  by_type: Record<ProjectType, number>;
  total_value: number;
  average_project_value: number;
}