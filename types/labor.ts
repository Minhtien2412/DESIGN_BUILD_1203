// Labor & Attendance Management Types

export enum WorkerRole {
  FOREMAN = 'FOREMAN',
  SKILLED_WORKER = 'SKILLED_WORKER',
  UNSKILLED_WORKER = 'UNSKILLED_WORKER',
  EQUIPMENT_OPERATOR = 'EQUIPMENT_OPERATOR',
  ELECTRICIAN = 'ELECTRICIAN',
  PLUMBER = 'PLUMBER',
  CARPENTER = 'CARPENTER',
  MASON = 'MASON',
  PAINTER = 'PAINTER',
  WELDER = 'WELDER',
  SAFETY_OFFICER = 'SAFETY_OFFICER',
  ENGINEER = 'ENGINEER',
  SUPERVISOR = 'SUPERVISOR',
  OTHER = 'OTHER',
}

export enum WorkerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  SICK_LEAVE = 'SICK_LEAVE',
  EXCUSED = 'EXCUSED',
}

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  FULL_DAY = 'FULL_DAY',
  OVERTIME = 'OVERTIME',
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
}

// Core Interfaces

export interface Worker {
  id: string;
  projectId?: string;
  employeeId: string; // Company employee ID
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: WorkerRole;
  status: WorkerStatus;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Employment details
  hireDate: string;
  hourlyRate: number;
  overtimeRate?: number;
  bankAccountNumber?: string;
  bankName?: string;
  
  // Skills & certifications
  skills?: string[];
  certifications?: string[];
  
  // Photo
  photoUrl?: string;
  
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  workerId: string;
  worker?: Worker;
  projectId?: string;
  date: string;
  status: AttendanceStatus;
  shiftType: ShiftType;
  
  // Time tracking
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;
  overtimeHours?: number;
  
  // Location (GPS coordinates)
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
  };
  
  // Additional info
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  projectId?: string;
  name: string;
  type: ShiftType;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakDuration?: number; // minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignment {
  id: string;
  workerId: string;
  worker?: Worker;
  shiftId: string;
  shift?: Shift;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  workerId: string;
  worker?: Worker;
  projectId?: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  
  // Approval workflow
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Attachments
  attachments?: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id: string;
  workerId: string;
  worker?: Worker;
  projectId?: string;
  payrollNo: string;
  
  // Period
  periodStart: string;
  periodEnd: string;
  
  // Hours
  regularHours: number;
  overtimeHours: number;
  
  // Earnings
  regularPay: number;
  overtimePay: number;
  bonuses?: number;
  allowances?: number;
  grossPay: number;
  
  // Deductions
  taxes?: number;
  insurance?: number;
  advances?: number;
  otherDeductions?: number;
  totalDeductions: number;
  
  // Net pay
  netPay: number;
  
  // Payment
  status: PayrollStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  paymentReference?: string;
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerSummary {
  totalWorkers: number;
  activeWorkers: number;
  inactiveWorkers: number;
  onLeave: number;
  
  byRole: {
    role: WorkerRole;
    count: number;
  }[];
  
  byStatus: {
    status: WorkerStatus;
    count: number;
  }[];
}

export interface AttendanceSummary {
  date: string;
  totalWorkers: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  attendanceRate: number; // percentage
  
  byShift: {
    shiftType: ShiftType;
    count: number;
  }[];
}

export interface PayrollSummary {
  periodStart: string;
  periodEnd: string;
  totalWorkers: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  
  byStatus: {
    status: PayrollStatus;
    count: number;
    totalAmount: number;
  }[];
}

export interface WorkerPerformance {
  workerId: string;
  worker?: Worker;
  periodStart: string;
  periodEnd: string;
  
  // Attendance metrics
  totalWorkDays: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  attendanceRate: number;
  
  // Hours
  totalHoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  
  // Productivity
  tasksCompleted?: number;
  productivityScore?: number;
  
  // Issues
  incidentCount?: number;
  safetyViolations?: number;
}

// Request/Response Types

export interface CreateWorkerRequest {
  projectId?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  role: WorkerRole;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hireDate: string;
  hourlyRate: number;
  overtimeRate?: number;
  bankAccountNumber?: string;
  bankName?: string;
  skills?: string[];
  certifications?: string[];
  photoUrl?: string;
  notes?: string;
}

export interface UpdateWorkerRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: WorkerRole;
  status?: WorkerStatus;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  hourlyRate?: number;
  overtimeRate?: number;
  bankAccountNumber?: string;
  bankName?: string;
  skills?: string[];
  certifications?: string[];
  photoUrl?: string;
  notes?: string;
}

export interface RecordAttendanceRequest {
  workerId: string;
  projectId?: string;
  date: string;
  status: AttendanceStatus;
  shiftType: ShiftType;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export interface UpdateAttendanceRequest {
  status?: AttendanceStatus;
  shiftType?: ShiftType;
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;
  overtimeHours?: number;
  notes?: string;
}

export interface CreateShiftRequest {
  projectId?: string;
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  breakDuration?: number;
}

export interface AssignShiftRequest {
  workerId: string;
  shiftId: string;
  date: string;
  notes?: string;
}

export interface CreateLeaveRequest {
  workerId: string;
  projectId?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: string[];
}

export interface ApproveLeaveRequest {
  approvedBy: string;
}

export interface RejectLeaveRequest {
  rejectionReason: string;
}

export interface CreatePayrollRequest {
  workerId: string;
  projectId?: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  overtimeHours: number;
  overtimePay?: number;
  bonuses?: number;
  allowances?: number;
  grossPay?: number;
  taxes?: number;
  insurance?: number;
  advances?: number;
  otherDeductions?: number;
  totalDeductions?: number;
  netPay?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface ProcessPaymentRequest {
  paymentDate: string;
  paymentReference?: string;
}

export interface BulkAttendanceRequest {
  date: string;
  projectId?: string;
  attendances: {
    workerId: string;
    status: AttendanceStatus;
    shiftType: ShiftType;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }[];
}
