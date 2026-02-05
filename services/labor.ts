import type {
    ApproveLeaveRequest,
    AssignShiftRequest,
    Attendance,
    AttendanceSummary,
    BulkAttendanceRequest,
    CreateLeaveRequest,
    CreatePayrollRequest,
    CreateShiftRequest,
    CreateWorkerRequest,
    LeaveRequest,
    Payroll,
    PayrollSummary,
    ProcessPaymentRequest,
    RecordAttendanceRequest,
    RejectLeaveRequest,
    Shift,
    ShiftAssignment,
    UpdateAttendanceRequest,
    UpdateWorkerRequest,
    Worker,
    WorkerPerformance,
    WorkerSummary,
} from "@/types/labor";
import { apiFetch } from "./api";

const BASE_URL = "/labor";

// ==================== Workers ====================

export const getWorkers = async (projectId?: string): Promise<Worker[]> => {
  const params = projectId ? `?projectId=${projectId}` : "";
  return apiFetch(`${BASE_URL}/workers${params}`);
};

export const getWorker = async (workerId: string): Promise<Worker> => {
  return apiFetch(`${BASE_URL}/workers/${workerId}`);
};

export const createWorker = async (
  data: CreateWorkerRequest,
): Promise<Worker> => {
  return apiFetch(`${BASE_URL}/workers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateWorker = async (
  workerId: string,
  data: UpdateWorkerRequest,
): Promise<Worker> => {
  return apiFetch(`${BASE_URL}/workers/${workerId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteWorker = async (workerId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/workers/${workerId}`, {
    method: "DELETE",
  });
};

export const getWorkersByRole = async (
  role: string,
  projectId?: string,
): Promise<Worker[]> => {
  const params = new URLSearchParams({ role });
  if (projectId) params.append("projectId", projectId);
  return apiFetch(`${BASE_URL}/workers/role?${params.toString()}`);
};

export const getWorkersByStatus = async (
  status: string,
  projectId?: string,
): Promise<Worker[]> => {
  const params = new URLSearchParams({ status });
  if (projectId) params.append("projectId", projectId);
  return apiFetch(`${BASE_URL}/workers/status?${params.toString()}`);
};

// ==================== Attendance ====================

export const getAttendances = async (
  projectId?: string,
  date?: string,
): Promise<Attendance[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  if (date) params.append("date", date);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`${BASE_URL}/attendances${query}`);
};

export const getAttendance = async (
  attendanceId: string,
): Promise<Attendance> => {
  return apiFetch(`${BASE_URL}/attendances/${attendanceId}`);
};

export const recordAttendance = async (
  data: RecordAttendanceRequest,
): Promise<Attendance> => {
  return apiFetch(`${BASE_URL}/attendances`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateAttendance = async (
  attendanceId: string,
  data: UpdateAttendanceRequest,
): Promise<Attendance> => {
  return apiFetch(`${BASE_URL}/attendances/${attendanceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteAttendance = async (attendanceId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/attendances/${attendanceId}`, {
    method: "DELETE",
  });
};

export const bulkRecordAttendance = async (
  data: BulkAttendanceRequest,
): Promise<Attendance[]> => {
  return apiFetch(`${BASE_URL}/attendances/bulk`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getWorkerAttendances = async (
  workerId: string,
  startDate?: string,
  endDate?: string,
): Promise<Attendance[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`${BASE_URL}/workers/${workerId}/attendances${query}`);
};

// ==================== Shifts ====================

export const getShifts = async (projectId?: string): Promise<Shift[]> => {
  const params = projectId ? `?projectId=${projectId}` : "";
  return apiFetch(`${BASE_URL}/shifts${params}`);
};

export const getShift = async (shiftId: string): Promise<Shift> => {
  return apiFetch(`${BASE_URL}/shifts/${shiftId}`);
};

export const createShift = async (data: CreateShiftRequest): Promise<Shift> => {
  return apiFetch(`${BASE_URL}/shifts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateShift = async (
  shiftId: string,
  data: Partial<CreateShiftRequest>,
): Promise<Shift> => {
  return apiFetch(`${BASE_URL}/shifts/${shiftId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteShift = async (shiftId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/shifts/${shiftId}`, {
    method: "DELETE",
  });
};

export const assignShift = async (
  data: AssignShiftRequest,
): Promise<ShiftAssignment> => {
  return apiFetch(`${BASE_URL}/shift-assignments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getShiftAssignments = async (
  shiftId?: string,
  date?: string,
): Promise<ShiftAssignment[]> => {
  const params = new URLSearchParams();
  if (shiftId) params.append("shiftId", shiftId);
  if (date) params.append("date", date);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`${BASE_URL}/shift-assignments${query}`);
};

export const deleteShiftAssignment = async (
  assignmentId: string,
): Promise<void> => {
  return apiFetch(`${BASE_URL}/shift-assignments/${assignmentId}`, {
    method: "DELETE",
  });
};

// ==================== Leave Requests ====================

export const getLeaveRequests = async (
  projectId?: string,
  status?: string,
): Promise<LeaveRequest[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  if (status) params.append("status", status);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`${BASE_URL}/leave-requests${query}`);
};

export const getLeaveRequest = async (
  leaveRequestId: string,
): Promise<LeaveRequest> => {
  return apiFetch(`${BASE_URL}/leave-requests/${leaveRequestId}`);
};

export const createLeaveRequest = async (
  data: CreateLeaveRequest,
): Promise<LeaveRequest> => {
  return apiFetch(`${BASE_URL}/leave-requests`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const approveLeaveRequest = async (
  leaveRequestId: string,
  data: ApproveLeaveRequest,
): Promise<LeaveRequest> => {
  return apiFetch(`${BASE_URL}/leave-requests/${leaveRequestId}/approve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const rejectLeaveRequest = async (
  leaveRequestId: string,
  data: RejectLeaveRequest,
): Promise<LeaveRequest> => {
  return apiFetch(`${BASE_URL}/leave-requests/${leaveRequestId}/reject`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const cancelLeaveRequest = async (
  leaveRequestId: string,
): Promise<LeaveRequest> => {
  return apiFetch(`${BASE_URL}/leave-requests/${leaveRequestId}/cancel`, {
    method: "POST",
  });
};

export const getWorkerLeaveRequests = async (
  workerId: string,
): Promise<LeaveRequest[]> => {
  return apiFetch(`${BASE_URL}/workers/${workerId}/leave-requests`);
};

// ==================== Payroll ====================

export const getPayrolls = async (
  projectId?: string,
  status?: string,
): Promise<Payroll[]> => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  if (status) params.append("status", status);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`${BASE_URL}/payrolls${query}`);
};

export const getPayroll = async (payrollId: string): Promise<Payroll> => {
  return apiFetch(`${BASE_URL}/payrolls/${payrollId}`);
};

export const createPayroll = async (
  data: CreatePayrollRequest,
): Promise<Payroll> => {
  return apiFetch(`${BASE_URL}/payrolls`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updatePayroll = async (
  payrollId: string,
  data: Partial<CreatePayrollRequest>,
): Promise<Payroll> => {
  return apiFetch(`${BASE_URL}/payrolls/${payrollId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deletePayroll = async (payrollId: string): Promise<void> => {
  return apiFetch(`${BASE_URL}/payrolls/${payrollId}`, {
    method: "DELETE",
  });
};

export const approvePayroll = async (
  payrollId: string,
  approvedBy: string,
): Promise<Payroll> => {
  return apiFetch(`${BASE_URL}/payrolls/${payrollId}/approve`, {
    method: "POST",
    body: JSON.stringify({ approvedBy }),
  });
};

export const processPayment = async (
  payrollId: string,
  data: ProcessPaymentRequest,
): Promise<Payroll> => {
  return apiFetch(`${BASE_URL}/payrolls/${payrollId}/process-payment`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getWorkerPayrolls = async (
  workerId: string,
  startDate?: string,
  endDate?: string,
): Promise<Payroll[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`${BASE_URL}/workers/${workerId}/payrolls${query}`);
};

// ==================== Analytics & Reports ====================

export const getWorkerSummary = async (
  projectId?: string,
): Promise<WorkerSummary> => {
  const params = projectId ? `?projectId=${projectId}` : "";
  return apiFetch(`${BASE_URL}/reports/worker-summary${params}`);
};

export const getAttendanceSummary = async (
  date: string,
  projectId?: string,
): Promise<AttendanceSummary> => {
  const params = new URLSearchParams({ date });
  if (projectId) params.append("projectId", projectId);
  return apiFetch(
    `${BASE_URL}/reports/attendance-summary?${params.toString()}`,
  );
};

export const getPayrollSummary = async (
  periodStart: string,
  periodEnd: string,
  projectId?: string,
): Promise<PayrollSummary> => {
  const params = new URLSearchParams({ periodStart, periodEnd });
  if (projectId) params.append("projectId", projectId);
  return apiFetch(`${BASE_URL}/reports/payroll-summary?${params.toString()}`);
};

export const getWorkerPerformance = async (
  workerId: string,
  periodStart: string,
  periodEnd: string,
): Promise<WorkerPerformance> => {
  const params = new URLSearchParams({ periodStart, periodEnd });
  return apiFetch(
    `${BASE_URL}/workers/${workerId}/performance?${params.toString()}`,
  );
};

export const exportWorkers = async (projectId?: string): Promise<Blob> => {
  const params = projectId ? `?projectId=${projectId}` : "";
  return apiFetch(`${BASE_URL}/reports/export-workers${params}`, {
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
};

export const exportAttendance = async (
  startDate: string,
  endDate: string,
  projectId?: string,
): Promise<Blob> => {
  const params = new URLSearchParams({ startDate, endDate });
  if (projectId) params.append("projectId", projectId);
  return apiFetch(
    `${BASE_URL}/reports/export-attendance?${params.toString()}`,
    {
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    },
  );
};

export const exportPayroll = async (
  periodStart: string,
  periodEnd: string,
  projectId?: string,
): Promise<Blob> => {
  const params = new URLSearchParams({ periodStart, periodEnd });
  if (projectId) params.append("projectId", projectId);
  return apiFetch(`${BASE_URL}/reports/export-payroll?${params.toString()}`, {
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
};
