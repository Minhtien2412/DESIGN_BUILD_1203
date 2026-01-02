// Contract Types & Interfaces

export type ContractType = 'CONSTRUCTION' | 'DESIGN' | 'CONSULTING' | 'SUPPLY' | 'MAINTENANCE';
export type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'EXPIRED';
export type PaymentTerms = 'FIXED_PRICE' | 'TIME_AND_MATERIALS' | 'MILESTONE_BASED' | 'PERCENTAGE';
export type SignatureStatus = 'PENDING' | 'SIGNED' | 'REJECTED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'OVERDUE';

export interface Contract {
  id: string;
  projectId: string;
  templateId?: string;
  type: ContractType;
  status: ContractStatus;
  title: string;
  description: string;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  currency: string;
  paymentTerms: PaymentTerms;
  parties: ContractParty[];
  milestones: Milestone[];
  signatures: Signature[];
  documents: ContractDocument[];
  terms: ContractTerm[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ContractParty {
  id: string;
  role: 'CLIENT' | 'CONTRACTOR' | 'SUBCONTRACTOR' | 'SUPPLIER' | 'CONSULTANT';
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  representative?: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
}

export interface Milestone {
  id: string;
  contractId: string;
  name: string;
  description: string;
  dueDate: Date;
  value: number;
  percentage: number;
  status: MilestoneStatus;
  requirements: string[];
  deliverables: string[];
  paymentStatus?: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  paymentDate?: Date;
  completedDate?: Date;
  approvedBy?: string;
  notes?: string;
  order: number;
}

export interface Signature {
  id: string;
  contractId: string;
  partyId: string;
  partyName: string;
  partyRole: string;
  status: SignatureStatus;
  signedAt?: Date;
  signatureData?: string; // Base64 encoded signature image
  ipAddress?: string;
  deviceInfo?: string;
  rejectionReason?: string;
  order: number;
}

export interface ContractDocument {
  id: string;
  contractId: string;
  name: string;
  type: 'CONTRACT' | 'APPENDIX' | 'AMENDMENT' | 'ATTACHMENT' | 'INVOICE' | 'RECEIPT';
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  version?: number;
}

export interface ContractTerm {
  id: string;
  section: string;
  title: string;
  content: string;
  order: number;
  required?: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  category: string;
  terms: ContractTerm[];
  defaultPaymentTerms: PaymentTerms;
  defaultDuration: number; // in days
  requiredParties: Array<'CLIENT' | 'CONTRACTOR' | 'SUBCONTRACTOR' | 'SUPPLIER' | 'CONSULTANT'>;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}

export interface ContractCreateRequest {
  projectId: string;
  templateId?: string;
  type: ContractType;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalValue: number;
  currency?: string;
  paymentTerms: PaymentTerms;
  parties: Omit<ContractParty, 'id'>[];
  terms?: Omit<ContractTerm, 'id'>[];
  milestones?: Omit<Milestone, 'id' | 'contractId'>[];
}

export interface ContractUpdateRequest {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  totalValue?: number;
  paymentTerms?: PaymentTerms;
  status?: ContractStatus;
}

export interface ContractSignRequest {
  contractId: string;
  partyId: string;
  signatureData: string; // Base64 encoded signature
  ipAddress?: string;
  deviceInfo?: string;
}

export interface MilestoneCreateRequest {
  contractId: string;
  name: string;
  description: string;
  dueDate: Date;
  value: number;
  percentage: number;
  requirements?: string[];
  deliverables?: string[];
  order: number;
}

export interface MilestoneUpdateRequest {
  name?: string;
  description?: string;
  dueDate?: Date;
  value?: number;
  percentage?: number;
  status?: MilestoneStatus;
  requirements?: string[];
  deliverables?: string[];
  notes?: string;
}

export interface ContractStats {
  total: number;
  draft: number;
  pendingSignature: number;
  active: number;
  completed: number;
  totalValue: number;
  paidValue: number;
  pendingValue: number;
}

export interface MilestoneStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  paid: number;
  overdue: number;
  totalValue: number;
  paidValue: number;
  completionRate: number;
}
