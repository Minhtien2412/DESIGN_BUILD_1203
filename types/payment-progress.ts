export type PaymentMilestone = {
  id: string;
  title: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid';
  images?: string[];
  videos?: string[];
  approvedBy?: string;
  approvedDate?: string;
  accountantApproved?: boolean;
};

export type PaymentPhase = {
  id: string;
  name: string;
  totalAmount: number;
  status: 'pending' | 'in-progress' | 'completed';
  milestones: PaymentMilestone[];
};

export type PaymentProgress = {
  projectId: string;
  totalAmount: number;
  totalPercentage: number;
  currentPhase: string;
  paidAmount: number;
  phases: PaymentPhase[];
};
