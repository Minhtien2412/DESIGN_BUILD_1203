import * as laborService from '@/services/labor';
import type {
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
    RecordAttendanceRequest,
    Shift,
    ShiftAssignment,
    UpdateAttendanceRequest,
    UpdateWorkerRequest,
    Worker,
    WorkerPerformance,
    WorkerSummary,
} from '@/types/labor';
import { useCallback, useEffect, useState } from 'react';

// ==================== Workers ====================

export function useWorkers(projectId?: string) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await laborService.getWorkers(projectId);
      setWorkers(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const createWorker = async (data: CreateWorkerRequest) => {
    const newWorker = await laborService.createWorker(data);
    setWorkers((prev) => [newWorker, ...prev]);
    return newWorker;
  };

  const updateWorker = async (workerId: string, data: UpdateWorkerRequest) => {
    const updated = await laborService.updateWorker(workerId, data);
    setWorkers((prev) => prev.map((w) => (w.id === workerId ? updated : w)));
    return updated;
  };

  const deleteWorker = async (workerId: string) => {
    await laborService.deleteWorker(workerId);
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  };

  return {
    workers,
    loading,
    error,
    refetch: fetchWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
  };
}

export function useWorker(workerId: string) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        const data = await laborService.getWorker(workerId);
        setWorker(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [workerId]);

  return { worker, loading, error };
}

// ==================== Attendance ====================

export function useAttendances(projectId?: string, date?: string) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true);
      const data = await laborService.getAttendances(projectId, date);
      setAttendances(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, date]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const recordAttendance = async (data: RecordAttendanceRequest) => {
    const newAttendance = await laborService.recordAttendance(data);
    setAttendances((prev) => [newAttendance, ...prev]);
    return newAttendance;
  };

  const updateAttendance = async (
    attendanceId: string,
    data: UpdateAttendanceRequest
  ) => {
    const updated = await laborService.updateAttendance(attendanceId, data);
    setAttendances((prev) => prev.map((a) => (a.id === attendanceId ? updated : a)));
    return updated;
  };

  const deleteAttendance = async (attendanceId: string) => {
    await laborService.deleteAttendance(attendanceId);
    setAttendances((prev) => prev.filter((a) => a.id !== attendanceId));
  };

  const bulkRecordAttendance = async (data: BulkAttendanceRequest) => {
    const newAttendances = await laborService.bulkRecordAttendance(data);
    setAttendances((prev) => [...newAttendances, ...prev]);
    return newAttendances;
  };

  return {
    attendances,
    loading,
    error,
    refetch: fetchAttendances,
    recordAttendance,
    updateAttendance,
    deleteAttendance,
    bulkRecordAttendance,
  };
}

export function useWorkerAttendances(
  workerId: string,
  startDate?: string,
  endDate?: string
) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        setLoading(true);
        const data = await laborService.getWorkerAttendances(
          workerId,
          startDate,
          endDate
        );
        setAttendances(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendances();
  }, [workerId, startDate, endDate]);

  return { attendances, loading, error };
}

// ==================== Shifts ====================

export function useShifts(projectId?: string) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await laborService.getShifts(projectId);
      setShifts(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (data: CreateShiftRequest) => {
    const newShift = await laborService.createShift(data);
    setShifts((prev) => [newShift, ...prev]);
    return newShift;
  };

  const updateShift = async (
    shiftId: string,
    data: Partial<CreateShiftRequest>
  ) => {
    const updated = await laborService.updateShift(shiftId, data);
    setShifts((prev) => prev.map((s) => (s.id === shiftId ? updated : s)));
    return updated;
  };

  const deleteShift = async (shiftId: string) => {
    await laborService.deleteShift(shiftId);
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  const assignShift = async (data: AssignShiftRequest) => {
    return await laborService.assignShift(data);
  };

  return {
    shifts,
    loading,
    error,
    refetch: fetchShifts,
    createShift,
    updateShift,
    deleteShift,
    assignShift,
  };
}

export function useShiftAssignments(shiftId?: string, date?: string) {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await laborService.getShiftAssignments(shiftId, date);
        setAssignments(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [shiftId, date]);

  return { assignments, loading, error };
}

// ==================== Leave Requests ====================

export function useLeaveRequests(projectId?: string, status?: string) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await laborService.getLeaveRequests(projectId, status);
      setLeaveRequests(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, status]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const createLeaveRequest = async (data: CreateLeaveRequest) => {
    const newRequest = await laborService.createLeaveRequest(data);
    setLeaveRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const approveLeaveRequest = async (leaveRequestId: string, approvedBy: string) => {
    const updated = await laborService.approveLeaveRequest(leaveRequestId, {
      approvedBy,
    });
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === leaveRequestId ? updated : lr))
    );
    return updated;
  };

  const rejectLeaveRequest = async (
    leaveRequestId: string,
    rejectionReason: string
  ) => {
    const updated = await laborService.rejectLeaveRequest(leaveRequestId, {
      rejectionReason,
    });
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === leaveRequestId ? updated : lr))
    );
    return updated;
  };

  const cancelLeaveRequest = async (leaveRequestId: string) => {
    const updated = await laborService.cancelLeaveRequest(leaveRequestId);
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === leaveRequestId ? updated : lr))
    );
    return updated;
  };

  return {
    leaveRequests,
    loading,
    error,
    refetch: fetchLeaveRequests,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
  };
}

// ==================== Payroll ====================

export function usePayrolls(projectId?: string, status?: string) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await laborService.getPayrolls(projectId, status);
      setPayrolls(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId, status]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const createPayroll = async (data: CreatePayrollRequest) => {
    const newPayroll = await laborService.createPayroll(data);
    setPayrolls((prev) => [newPayroll, ...prev]);
    return newPayroll;
  };

  const updatePayroll = async (
    payrollId: string,
    data: Partial<CreatePayrollRequest>
  ) => {
    const updated = await laborService.updatePayroll(payrollId, data);
    setPayrolls((prev) => prev.map((p) => (p.id === payrollId ? updated : p)));
    return updated;
  };

  const deletePayroll = async (payrollId: string) => {
    await laborService.deletePayroll(payrollId);
    setPayrolls((prev) => prev.filter((p) => p.id !== payrollId));
  };

  const approvePayroll = async (payrollId: string, approvedBy: string) => {
    const updated = await laborService.approvePayroll(payrollId, approvedBy);
    setPayrolls((prev) => prev.map((p) => (p.id === payrollId ? updated : p)));
    return updated;
  };

  const processPayment = async (
    payrollId: string,
    paymentDate: string,
    paymentReference?: string
  ) => {
    const updated = await laborService.processPayment(payrollId, {
      paymentDate,
      paymentReference,
    });
    setPayrolls((prev) => prev.map((p) => (p.id === payrollId ? updated : p)));
    return updated;
  };

  return {
    payrolls,
    loading,
    error,
    refetch: fetchPayrolls,
    createPayroll,
    updatePayroll,
    deletePayroll,
    approvePayroll,
    processPayment,
  };
}

// ==================== Analytics ====================

export function useWorkerSummary(projectId?: string) {
  const [summary, setSummary] = useState<WorkerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await laborService.getWorkerSummary(projectId);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [projectId]);

  return { summary, loading, error };
}

export function useAttendanceSummary(date: string, projectId?: string) {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await laborService.getAttendanceSummary(date, projectId);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [date, projectId]);

  return { summary, loading, error };
}

export function usePayrollSummary(
  periodStart: string,
  periodEnd: string,
  projectId?: string
) {
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await laborService.getPayrollSummary(
          periodStart,
          periodEnd,
          projectId
        );
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [periodStart, periodEnd, projectId]);

  return { summary, loading, error };
}

export function useWorkerPerformance(
  workerId: string,
  periodStart: string,
  periodEnd: string
) {
  const [performance, setPerformance] = useState<WorkerPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const data = await laborService.getWorkerPerformance(
          workerId,
          periodStart,
          periodEnd
        );
        setPerformance(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [workerId, periodStart, periodEnd]);

  return { performance, loading, error };
}
